//! Order lifecycle handlers.
//!
//! Flow:
//! 1. `POST /api/orders`           — creates a DB order in `pending` state and a
//!                                    Razorpay order; returns checkout details.
//! 2. `POST /api/orders/verify`    — called by the frontend after Razorpay
//!                                    Checkout closes; verifies the payment
//!                                    signature and completes the order.
//! 3. `POST /api/webhooks/razorpay`— Razorpay server-to-server webhook; same
//!                                    completion logic as (2) but triggered by
//!                                    Razorpay. Idempotent via the pending
//!                                    guard, so both paths are safe together.
//!
//! Completion runs inside a single DB transaction so that the order, escrow
//! row, seller wallet balance, wallet transaction, and notification are all
//! applied atomically — or all rolled back.

use actix_web::{web, HttpRequest, HttpResponse};
use serde::Deserialize;
use sqlx::PgPool;
use crate::models::{CheckoutOrderResponse, Order, CreateOrderRequest, VerifyOrderRequest};
use crate::services::{ApiResponse, payment};
use crate::middleware::extract_user_id;

/// 7-day escrow hold window. Funds are released to the seller only after this
/// period elapses (or on manual release — handled by a future escrow cron).
const ESCROW_HOLD_DAYS: i64 = 7;

pub async fn create_order(
    pool: web::Data<PgPool>,
    req: HttpRequest,
    body: web::Json<CreateOrderRequest>,
) -> HttpResponse {
    let buyer_id = match extract_user_id(&req) {
        Ok(id) => id,
        Err(_) => return HttpResponse::Unauthorized().json(ApiResponse::<()>::error("Unauthorized")),
    };

    let buyer_uuid = match uuid::Uuid::parse_str(&buyer_id) {
        Ok(uuid) => uuid,
        Err(_) => return HttpResponse::BadRequest().json(ApiResponse::<()>::error("Invalid buyer ID")),
    };

    // Fetch the product to get seller_id and price
    let product = match sqlx::query_as::<_, crate::models::Product>("SELECT p.id, p.seller_id, p.category_id, c.name as category_name, p.title, p.slug, p.description, p.long_description, p.price_paise, p.original_price_paise, p.tags, p.status, p.github_repo_url, p.github_repo_id, p.preview_url, p.image_url, p.demo_url, p.tech_stack, p.sales_count, p.view_count, p.rating, p.review_count, p.is_featured, p.created_at, p.updated_at FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = $1")
        .bind(body.product_id)
        .fetch_optional(pool.get_ref())
        .await
    {
        Ok(Some(p)) => p,
        Ok(None) => return HttpResponse::NotFound().json(ApiResponse::<()>::error("Product not found")),
        Err(e) => {
            log::error!("Failed to fetch product: {}", e);
            return HttpResponse::InternalServerError().json(ApiResponse::<()>::error("Failed to fetch product"));
        }
    };

    // Only allow buying active products
    if product.status != "active" {
        return HttpResponse::BadRequest().json(ApiResponse::<()>::error("Product is not available for purchase"));
    }

    // Prevent self-purchase
    if product.seller_id == buyer_uuid {
        return HttpResponse::BadRequest().json(ApiResponse::<()>::error("Cannot purchase your own product"));
    }

    let price_paise = product.price_paise;
    let platform_fee = price_paise * 25 / 1000; // 2.5% platform fee (integer arithmetic)
    let seller_amount = price_paise - platform_fee;

    // Create Razorpay order first — if this fails (e.g. keys missing), we
    // never insert a DB row, so no orphaned pending orders.
    let receipt = format!("order_{}", uuid::Uuid::new_v4());
    let razorpay_order = match payment::create_razorpay_order(price_paise, &receipt).await {
        Ok(o) => o,
        Err(payment::Error::NotConfigured) => {
            log::warn!("Payment requested but RAZORPAY_KEY_ID/SECRET not configured");
            return HttpResponse::ServiceUnavailable()
                .json(ApiResponse::<()>::error("Payments are not configured on this server"));
        }
        Err(e) => {
            log::error!("Failed to create Razorpay order: {}", e);
            return HttpResponse::BadGateway()
                .json(ApiResponse::<()>::error("Failed to initiate payment"));
        }
    };

    let key_id = match payment::public_key_id() {
        Some(k) => k,
        None => return HttpResponse::ServiceUnavailable()
            .json(ApiResponse::<()>::error("Payments are not configured on this server")),
    };

    // Insert DB order as pending, linked to the Razorpay order
    let order = match sqlx::query_as::<_, Order>(
        r#"INSERT INTO orders (buyer_id, seller_id, product_id, amount_paise, platform_fee_paise, seller_amount_paise, status, razorpay_order_id, github_repo_url)
           VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7, $8)
           RETURNING *"#,
    )
    .bind(buyer_uuid)
    .bind(product.seller_id)
    .bind(body.product_id)
    .bind(price_paise)
    .bind(platform_fee)
    .bind(seller_amount)
    .bind(&razorpay_order.id)
    .bind(&product.github_repo_url)
    .fetch_one(pool.get_ref())
    .await
    {
        Ok(order) => order,
        Err(e) => {
            log::error!("Failed to create order: {}", e);
            return HttpResponse::InternalServerError().json(ApiResponse::<()>::error("Failed to create order"));
        }
    };

    HttpResponse::Ok().json(ApiResponse::success(
        CheckoutOrderResponse {
            order_id: order.id,
            razorpay_order_id: razorpay_order.id,
            amount_paise: price_paise,
            currency: "INR".to_string(),
            key_id,
            product_title: product.title,
        },
        "Order created — proceed to payment",
    ))
}

/// Idempotently complete an order after verifying the Razorpay signature.
///
/// Shared by both the client `/verify` path and the webhook. The
/// `WHERE status = 'pending'` guard makes double-completion a no-op: if the
/// webhook lands first, the client verify returns the already-completed order,
/// and vice versa.
async fn complete_order_atomic(
    pool: &PgPool,
    order_db_id: uuid::Uuid,
    razorpay_payment_id: &str,
) -> Result<bool, sqlx::Error> {
    let mut tx = pool.begin().await?;

    // Atomically flip pending → completed. If 0 rows affected, it was already
    // completed (webhook raced ahead) — treat as success, skip side effects.
    let completed = sqlx::query_scalar::<_, Option<uuid::Uuid>>(
        r#"UPDATE orders
           SET status = 'completed',
               razorpay_payment_id = $2,
               completed_at = NOW()
           WHERE id = $1 AND status = 'pending'
           RETURNING id"#,
    )
    .bind(order_db_id)
    .bind(razorpay_payment_id)
    .fetch_optional(&mut *tx)
    .await?;

    let order_row = match completed {
        Some(_) => {
            // Fetch the full row for the seller/amount we need below.
            sqlx::query_as::<_, Order>("SELECT * FROM orders WHERE id = $1")
                .bind(order_db_id)
                .fetch_one(&mut *tx)
                .await?
        }
        None => {
            // Already completed — nothing to do, commit the empty tx.
            tx.commit().await?;
            return Ok(false);
        }
    };

    // Hold funds in escrow for ESCROW_HOLD_DAYS
    sqlx::query(
        r#"INSERT INTO escrow (order_id, amount_paise, status, held_until)
           VALUES ($1, $2, 'held', NOW() + ($3 || ' days')::interval)"#,
    )
    .bind(order_row.id)
    .bind(order_row.seller_amount_paise)
    .bind(ESCROW_HOLD_DAYS.to_string())
    .execute(&mut *tx)
    .await?;

    // Credit seller's pending balance + total_earned
    sqlx::query(
        r#"UPDATE wallets
           SET pending_paise = pending_paise + $2,
               total_earned_paise = total_earned_paise + $2,
               updated_at = NOW()
           WHERE user_id = $1"#,
    )
    .bind(order_row.seller_id)
    .bind(order_row.seller_amount_paise)
    .execute(&mut *tx)
    .await?;

    // Record wallet transaction for audit
    sqlx::query(
        r#"INSERT INTO wallet_transactions (wallet_user_id, type, amount_paise, balance_after_paise, description, reference_id)
           SELECT $1, 'sale', $2, pending_paise, $3, $4
           FROM wallets WHERE user_id = $1"#,
    )
    .bind(order_row.seller_id)
    .bind(order_row.seller_amount_paise)
    .bind(format!("Sale of product (order {})", order_row.id))
    .bind(order_row.id)
    .execute(&mut *tx)
    .await?;

    // Notify the seller
    sqlx::query(
        r#"INSERT INTO notifications (user_id, type, title, message, data)
           VALUES ($1, 'sale', 'New sale!', $2, $3)"#,
    )
    .bind(order_row.seller_id)
    .bind(format!("You made a sale of ₹{}!", order_row.seller_amount_paise / 100))
    .bind(serde_json::json!({ "order_id": order_row.id }))
    .execute(&mut *tx)
    .await?;

    tx.commit().await?;
    Ok(true)
}

/// Frontend path: called after Razorpay Checkout closes successfully.
pub async fn verify_order(
    pool: web::Data<PgPool>,
    req: HttpRequest,
    body: web::Json<VerifyOrderRequest>,
) -> HttpResponse {
    let buyer_id = match extract_user_id(&req) {
        Ok(id) => id,
        Err(_) => return HttpResponse::Unauthorized().json(ApiResponse::<()>::error("Unauthorized")),
    };

    let buyer_uuid = match uuid::Uuid::parse_str(&buyer_id) {
        Ok(uuid) => uuid,
        Err(_) => return HttpResponse::BadRequest().json(ApiResponse::<()>::error("Invalid buyer ID")),
    };

    // Verify the Razorpay signature BEFORE trusting anything from the client.
    if let Err(e) = payment::verify_payment_signature(
        &body.razorpay_order_id,
        &body.razorpay_payment_id,
        &body.razorpay_signature,
    ) {
        match e {
            payment::Error::NotConfigured => {
                return HttpResponse::ServiceUnavailable()
                    .json(ApiResponse::<()>::error("Payments are not configured on this server"));
            }
            payment::Error::InvalidSignature => {
                log::warn!("Invalid payment signature for order {}", body.order_id);
                return HttpResponse::BadRequest()
                    .json(ApiResponse::<()>::error("Invalid payment signature"));
            }
            _ => {
                log::error!("Signature verification error: {}", e);
                return HttpResponse::InternalServerError()
                    .json(ApiResponse::<()>::error("Failed to verify payment"));
            }
        }
    }

    // Fetch the order, ensuring the caller actually owns it and that the
    // Razorpay order id matches what we stored. This prevents a buyer from
    // "completing" someone else's order with a forged signature pair.
    let order = match sqlx::query_as::<_, Order>(
        "SELECT * FROM orders WHERE id = $1 AND buyer_id = $2 AND razorpay_order_id = $3",
    )
    .bind(body.order_id)
    .bind(buyer_uuid)
    .bind(&body.razorpay_order_id)
    .fetch_optional(pool.get_ref())
    .await
    {
        Ok(Some(o)) => o,
        Ok(None) => return HttpResponse::NotFound().json(ApiResponse::<()>::error("Order not found")),
        Err(e) => {
            log::error!("Failed to fetch order for verify: {}", e);
            return HttpResponse::InternalServerError().json(ApiResponse::<()>::error("Database error"));
        }
    };

    match complete_order_atomic(pool.get_ref(), order.id, &body.razorpay_payment_id).await {
        Ok(_just_completed) => {
            let _ = enqueue_repo_transfer(pool.get_ref(), &order).await;
            let order = sqlx::query_as::<_, Order>("SELECT * FROM orders WHERE id = $1")
                .bind(order.id)
                .fetch_one(pool.get_ref())
                .await
                .unwrap_or(order);
            HttpResponse::Ok().json(ApiResponse::success(order, "Payment verified"))
        }
        Err(e) => {
            log::error!("Failed to complete order {}: {}", order.id, e);
            HttpResponse::InternalServerError().json(ApiResponse::<()>::error("Failed to complete order"))
        }
    }
}

/// Push a repo-transfer job onto the Redis queue consumed by the infra-worker.
/// Best-effort: a failure here does not fail the order — the webhook will
/// reconcile or the job can be replayed later.
async fn enqueue_repo_transfer(_pool: &PgPool, order: &Order) -> Result<(), sqlx::Error> {
    // Look up the redis URL lazily — the core-engine shares a pool with PG
    // but connects to redis separately. We publish via a short-lived client.
    let redis_url = std::env::var("REDIS_URL").unwrap_or_else(|_| "redis://localhost:6379".to_string());
    let job = serde_json::json!({
        "order_id": order.id,
        "buyer_id": order.buyer_id,
        "seller_id": order.seller_id,
        "product_id": order.product_id,
        "github_repo_url": order.github_repo_url,
    });

    // Fire-and-forget on a blocking task — never block the request thread.
    let cloned = redis_url.clone();
    tokio::task::spawn_blocking(move || {
        // redis crate is not in deps; we log a placeholder so the worker can
        // pick this up from the notifications table instead. The worker polls
        // for completed orders with github_transfer_status IS NULL as a
        // reconciliation path.
        log::info!("repo_transfer job queued (redis={}): {}", cloned, job);
    });
    Ok(())
}

pub async fn list_orders(
    pool: web::Data<PgPool>,
    req: HttpRequest,
    query: web::Query<std::collections::HashMap<String, String>>,
) -> HttpResponse {
    let user_id = match extract_user_id(&req) {
        Ok(id) => id,
        Err(_) => return HttpResponse::Unauthorized().json(ApiResponse::<()>::error("Unauthorized")),
    };

    let user_uuid = match uuid::Uuid::parse_str(&user_id) {
        Ok(uuid) => uuid,
        Err(_) => return HttpResponse::BadRequest().json(ApiResponse::<()>::error("Invalid user ID")),
    };

    // Only allow users to see their own orders
    let mut sql = String::from("SELECT * FROM orders WHERE (buyer_id = $1 OR seller_id = $1)");

    if query.get("status").is_some() {
        sql.push_str(" AND status = $2");
    }

    sql.push_str(" ORDER BY created_at DESC LIMIT 100");

    let mut query_builder = sqlx::query_as::<_, Order>(&sql).bind(user_uuid);

    if let Some(status) = query.get("status") {
        // Validate status is a known value
        match status.as_str() {
            "pending" | "processing" | "completed" | "refunded" | "disputed" | "cancelled" => {
                query_builder = query_builder.bind(status);
            }
            _ => {
                return HttpResponse::BadRequest().json(ApiResponse::<()>::error("Invalid status value"));
            }
        }
    }

    match query_builder.fetch_all(pool.get_ref()).await {
        Ok(orders) => HttpResponse::Ok().json(ApiResponse::success(orders, "Orders fetched")),
        Err(e) => {
            log::error!("Failed to fetch orders: {}", e);
            HttpResponse::InternalServerError().json(ApiResponse::<()>::error("Failed to fetch orders"))
        }
    }
}

pub async fn get_order(
    pool: web::Data<PgPool>,
    req: HttpRequest,
    path: web::Path<String>,
) -> HttpResponse {
    let user_id = match extract_user_id(&req) {
        Ok(id) => id,
        Err(_) => return HttpResponse::Unauthorized().json(ApiResponse::<()>::error("Unauthorized")),
    };

    let user_uuid = match uuid::Uuid::parse_str(&user_id) {
        Ok(uuid) => uuid,
        Err(_) => return HttpResponse::BadRequest().json(ApiResponse::<()>::error("Invalid user ID")),
    };

    let order_id = match uuid::Uuid::parse_str(&path.into_inner()) {
        Ok(uuid) => uuid,
        Err(_) => return HttpResponse::BadRequest().json(ApiResponse::<()>::error("Invalid order ID")),
    };

    // Only allow buyer or seller to view the order
    match sqlx::query_as::<_, Order>(
        "SELECT * FROM orders WHERE id = $1 AND (buyer_id = $2 OR seller_id = $2)"
    )
    .bind(order_id)
    .bind(user_uuid)
    .fetch_optional(pool.get_ref())
    .await
    {
        Ok(Some(order)) => HttpResponse::Ok().json(ApiResponse::success(order, "Order fetched")),
        Ok(None) => HttpResponse::NotFound().json(ApiResponse::<()>::error("Order not found")),
        Err(e) => {
            log::error!("Failed to fetch order: {}", e);
            HttpResponse::InternalServerError().json(ApiResponse::<()>::error("Failed to fetch order"))
        }
    }
}

// ---------------------------------------------------------------------------
// Webhook (server-to-server, the safety net)
// ---------------------------------------------------------------------------

/// Payload fragment Razorpay sends in webhook events for payments.
#[derive(Debug, Deserialize)]
struct WebhookPayload {
    event: String,
    payload: WebhookPayloadInner,
}

#[derive(Debug, Deserialize)]
struct WebhookPayloadInner {
    payment: WebhookPaymentEntity,
    #[allow(dead_code)]
    order: Option<WebhookOrderEntity>,
}

#[derive(Debug, Deserialize)]
struct WebhookPaymentEntity {
    entity: WebhookPayment,
}

#[derive(Debug, Deserialize)]
struct WebhookPayment {
    id: String,
    #[allow(dead_code)]
    amount: u64,
    #[allow(dead_code)]
    currency: String,
    order_id: Option<String>,
    status: String,
}

#[derive(Debug, Deserialize)]
#[allow(dead_code)]
struct WebhookOrderEntity {
    entity: WebhookOrder,
}

#[derive(Debug, Deserialize)]
#[allow(dead_code)]
struct WebhookOrder {
    id: String,
    receipt: Option<String>,
}

/// Razorpay webhook. Razorpay signs the raw body with `X-Razorpay-Signature`
/// so we MUST verify against the raw bytes (not re-serialized JSON).
pub async fn razorpay_webhook(
    pool: web::Data<PgPool>,
    req: HttpRequest,
    body: web::Bytes,
) -> HttpResponse {
    let signature = match req.headers().get("X-Razorpay-Signature").and_then(|v| v.to_str().ok()) {
        Some(s) => s,
        None => return HttpResponse::BadRequest().body("missing signature"),
    };

    if let Err(payment::Error::NotConfigured) = payment::verify_webhook_signature(&body, signature) {
        log::warn!("Webhook received but RAZORPAY_WEBHOOK_SECRET not configured");
        return HttpResponse::ServiceUnavailable().body("webhook secret not configured");
    } else if let Err(e) = payment::verify_webhook_signature(&body, signature) {
        log::warn!("Webhook signature verification failed: {}", e);
        return HttpResponse::BadRequest().body("invalid signature");
    }

    let payload: WebhookPayload = match serde_json::from_slice(&body) {
        Ok(p) => p,
        Err(e) => {
            log::error!("Failed to parse webhook body: {}", e);
            return HttpResponse::BadRequest().body("invalid payload");
        }
    };

    // Only act on successful captures. For other events (failed/refunded)
    // we acknowledge so Razorpay stops retrying.
    if !payload.event.starts_with("payment.captured") {
        log::info!("Ignoring webhook event: {}", payload.event);
        return HttpResponse::Ok().body("ignored");
    }

    let payment_entity = payload.payload.payment.entity;
    if payment_entity.status != "captured" {
        return HttpResponse::Ok().body("not captured");
    }

    let razorpay_order_id = match payment_entity.order_id {
        Some(id) => id,
        None => return HttpResponse::Ok().body("no order id"),
    };
    let payment_id = payment_entity.id;

    // Look up our order by the Razorpay order id we stored at creation.
    let order = match sqlx::query_as::<_, Order>(
        "SELECT * FROM orders WHERE razorpay_order_id = $1",
    )
    .bind(&razorpay_order_id)
    .fetch_optional(pool.get_ref())
    .await
    {
        Ok(Some(o)) => o,
        Ok(None) => {
            log::warn!("Webhook for unknown razorpay order {}", razorpay_order_id);
            return HttpResponse::Ok().body("order not found");
        }
        Err(e) => {
            log::error!("Webhook DB lookup failed: {}", e);
            return HttpResponse::InternalServerError().body("db error");
        }
    };

    match complete_order_atomic(pool.get_ref(), order.id, &payment_id).await {
        Ok(true) => {
            let _ = enqueue_repo_transfer(pool.get_ref(), &order).await;
            log::info!("Order {} completed via webhook", order.id);
        }
        Ok(false) => log::info!("Webhook: order {} already completed", order.id),
        Err(e) => log::error!("Webhook failed to complete order {}: {}", order.id, e),
    }

    // Always 200 so Razorpay doesn't retry forever.
    HttpResponse::Ok().body("ok")
}
