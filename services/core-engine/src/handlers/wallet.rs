use actix_web::{web, HttpRequest, HttpResponse};
use serde::Deserialize;
use sqlx::PgPool;
use crate::models::{Wallet, WalletTransaction, TopupRequest, TopupVerifyRequest, TopupOrderResponse, WithdrawRequest, ListTransactionsQuery, WalletTopup};
use crate::services::ApiResponse;
use crate::services::payment;
use crate::middleware::{extract_user_id, require_developer};

pub async fn get_balance(
    pool: web::Data<PgPool>,
    req: HttpRequest,
) -> HttpResponse {
    let user_id = match extract_user_id(&req) {
        Ok(id) => id,
        Err(_) => return HttpResponse::Unauthorized().json(ApiResponse::<()>::error("Unauthorized")),
    };

    let user_uuid = match uuid::Uuid::parse_str(&user_id) {
        Ok(uuid) => uuid,
        Err(_) => return HttpResponse::BadRequest().json(ApiResponse::<()>::error("Invalid user ID")),
    };

    let wallet = match sqlx::query_as::<_, Wallet>("SELECT * FROM wallets WHERE user_id = $1")
        .bind(user_uuid)
        .fetch_optional(pool.get_ref())
        .await
    {
        Ok(Some(w)) => w,
        Ok(None) => {
            match sqlx::query_as::<_, Wallet>(
                "INSERT INTO wallets (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING RETURNING *"
            )
            .bind(user_uuid)
            .fetch_optional(pool.get_ref())
            .await
            {
                Ok(Some(w)) => w,
                _ => {
                    match sqlx::query_as::<_, Wallet>("SELECT * FROM wallets WHERE user_id = $1")
                        .bind(user_uuid)
                        .fetch_one(pool.get_ref())
                        .await
                    {
                        Ok(w) => w,
                        Err(e) => {
                            log::error!("Failed to fetch/create wallet: {}", e);
                            return HttpResponse::InternalServerError().json(ApiResponse::<()>::error("Wallet error"));
                        }
                    }
                }
            }
        }
        Err(e) => {
            log::error!("Failed to fetch wallet: {}", e);
            return HttpResponse::InternalServerError().json(ApiResponse::<()>::error("Database error"));
        }
    };

    HttpResponse::Ok().json(ApiResponse::success(wallet, "Wallet fetched"))
}

pub async fn create_topup(
    pool: web::Data<PgPool>,
    req: HttpRequest,
    body: web::Json<TopupRequest>,
) -> HttpResponse {
    let user_id = match extract_user_id(&req) {
        Ok(id) => id,
        Err(_) => return HttpResponse::Unauthorized().json(ApiResponse::<()>::error("Unauthorized")),
    };

    if body.amount_paise < 100 || body.amount_paise > 5000000 {
        return HttpResponse::BadRequest().json(ApiResponse::<()>::error("Amount must be between ₹1 and ₹50,000"));
    }

    let user_uuid = match uuid::Uuid::parse_str(&user_id) {
        Ok(uuid) => uuid,
        Err(_) => return HttpResponse::BadRequest().json(ApiResponse::<()>::error("Invalid user ID")),
    };

    let receipt = format!("tp_{}_{}", &user_id[..8], &uuid::Uuid::new_v4().to_string()[..8]);
    match payment::create_razorpay_order(body.amount_paise, &receipt).await {
        Ok(razorpay_order) => {
            // Store the topup order in our database
            let _ = sqlx::query(
                "INSERT INTO wallet_topups (user_id, razorpay_order_id, amount_paise) VALUES ($1, $2, $3)"
            )
            .bind(user_uuid)
            .bind(&razorpay_order.id)
            .bind(body.amount_paise)
            .execute(pool.get_ref())
            .await;

            let key_id = payment::public_key_id().unwrap_or_default();
            let response = TopupOrderResponse {
                razorpay_order_id: razorpay_order.id,
                amount_paise: body.amount_paise,
                currency: "INR".to_string(),
                key_id,
            };
            HttpResponse::Ok().json(ApiResponse::success(response, "Topup order created"))
        }
        Err(e) => {
            log::error!("Failed to create topup order: {:?}", e);
            HttpResponse::InternalServerError().json(ApiResponse::<()>::error("Failed to create payment order"))
        }
    }
}

pub async fn verify_topup(
    pool: web::Data<PgPool>,
    req: HttpRequest,
    body: web::Json<TopupVerifyRequest>,
) -> HttpResponse {
    let user_id = match extract_user_id(&req) {
        Ok(id) => id,
        Err(_) => return HttpResponse::Unauthorized().json(ApiResponse::<()>::error("Unauthorized")),
    };

    let user_uuid = match uuid::Uuid::parse_str(&user_id) {
        Ok(uuid) => uuid,
        Err(_) => return HttpResponse::BadRequest().json(ApiResponse::<()>::error("Invalid user ID")),
    };

    // Verify payment signature first
    if let Err(e) = payment::verify_payment_signature(
        &body.razorpay_order_id,
        &body.razorpay_payment_id,
        &body.razorpay_signature,
    ) {
        log::error!("Payment verification error: {:?}", e);
        return HttpResponse::BadRequest().json(ApiResponse::<()>::error("Invalid payment signature"));
    }

    let mut tx = match pool.begin().await {
        Ok(tx) => tx,
        Err(e) => {
            log::error!("Failed to start transaction: {}", e);
            return HttpResponse::InternalServerError().json(ApiResponse::<()>::error("Database error"));
        }
    };

    // Ensure wallet exists
    let _ = sqlx::query("INSERT INTO wallets (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING")
        .bind(user_uuid)
        .execute(&mut *tx)
        .await;

    // Find the topup order and verify it belongs to the user and is pending
    let topup = match sqlx::query_as::<_, WalletTopup>(
        "SELECT * FROM wallet_topups WHERE user_id = $1 AND razorpay_order_id = $2 AND status = 'pending'"
    )
    .bind(user_uuid)
    .bind(&body.razorpay_order_id)
    .fetch_optional(&mut *tx)
    .await
    {
        Ok(Some(t)) => t,
        Ok(None) => {
            let _ = tx.rollback().await;
            return HttpResponse::BadRequest().json(ApiResponse::<()>::error("Invalid or already processed topup order"));
        }
        Err(e) => {
            log::error!("Failed to fetch topup order: {}", e);
            let _ = tx.rollback().await;
            return HttpResponse::InternalServerError().json(ApiResponse::<()>::error("Database error"));
        }
    };

    // Update the topup order as successful
    let _ = sqlx::query(
        "UPDATE wallet_topups SET status = 'success', razorpay_payment_id = $1, razorpay_signature = $2, updated_at = NOW() WHERE id = $3"
    )
    .bind(&body.razorpay_payment_id)
    .bind(&body.razorpay_signature)
    .bind(topup.id)
    .execute(&mut *tx)
    .await;

    // Get current wallet balance
    let wallet = match sqlx::query_as::<_, Wallet>("SELECT * FROM wallets WHERE user_id = $1")
        .bind(user_uuid)
        .fetch_one(&mut *tx)
        .await
    {
        Ok(w) => w,
        Err(e) => {
            log::error!("Failed to fetch wallet: {}", e);
            let _ = tx.rollback().await;
            return HttpResponse::InternalServerError().json(ApiResponse::<()>::error("Wallet error"));
        }
    };

    // Calculate new balance
    let new_balance = wallet.balance_paise + topup.amount_paise;

    // Update wallet balance
    let _ = sqlx::query(
        "UPDATE wallets SET balance_paise = $1, updated_at = NOW() WHERE user_id = $2"
    )
    .bind(new_balance)
    .bind(user_uuid)
    .execute(&mut *tx)
    .await;

    // Record the transaction
    let _ = sqlx::query(
        "INSERT INTO wallet_transactions (wallet_user_id, type, amount_paise, balance_after_paise, description, reference_id) VALUES ($1, 'topup', $2, $3, $4, $5)"
    )
    .bind(user_uuid)
    .bind(topup.amount_paise)
    .bind(new_balance)
    .bind(format!("Razorpay topup successful - {}", body.razorpay_payment_id))
    .bind(topup.id)
    .execute(&mut *tx)
    .await;

    match tx.commit().await {
        Ok(_) => {
            HttpResponse::Ok().json(ApiResponse::success(serde_json::json!({
                "status": "success",
                "message": "Topup successful",
                "new_balance": new_balance
            }), "Topup verified and credited"))
        }
        Err(e) => {
            log::error!("Failed to commit transaction: {}", e);
            HttpResponse::InternalServerError().json(ApiResponse::<()>::error("Transaction failed"))
        }
    }
}

pub async fn list_transactions(
    pool: web::Data<PgPool>,
    req: HttpRequest,
    query: web::Query<ListTransactionsQuery>,
) -> HttpResponse {
    let user_id = match extract_user_id(&req) {
        Ok(id) => id,
        Err(_) => return HttpResponse::Unauthorized().json(ApiResponse::<()>::error("Unauthorized")),
    };

    let user_uuid = match uuid::Uuid::parse_str(&user_id) {
        Ok(uuid) => uuid,
        Err(_) => return HttpResponse::BadRequest().json(ApiResponse::<()>::error("Invalid user ID")),
    };

    let page = query.page.unwrap_or(1).max(1);
    let limit = query.limit.unwrap_or(20).min(100).max(1);
    let offset = (page - 1) * limit;

    match sqlx::query_as::<_, WalletTransaction>(
        "SELECT * FROM wallet_transactions WHERE wallet_user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3"
    )
    .bind(user_uuid)
    .bind(limit as i64)
    .bind(offset as i64)
    .fetch_all(pool.get_ref())
    .await
    {
        Ok(transactions) => HttpResponse::Ok().json(ApiResponse::success(transactions, "Transactions fetched")),
        Err(e) => {
            log::error!("Failed to fetch transactions: {}", e);
            HttpResponse::InternalServerError().json(ApiResponse::<()>::error("Failed to fetch transactions"))
        }
    }
}

pub async fn withdraw(
    pool: web::Data<PgPool>,
    req: HttpRequest,
    body: web::Json<WithdrawRequest>,
) -> HttpResponse {
    let user_id = match require_developer(&req) {
        Ok(id) => id,
        Err(resp) => return resp,
    };

    let user_uuid = match uuid::Uuid::parse_str(&user_id) {
        Ok(uuid) => uuid,
        Err(_) => return HttpResponse::BadRequest().json(ApiResponse::<()>::error("Invalid user ID")),
    };

    if body.amount_paise < 50000 {
        return HttpResponse::BadRequest().json(ApiResponse::<()>::error("Minimum withdrawal is ₹500"));
    }

    // Require a payout account (bank account or UPI) before allowing withdrawal
    let payout = match sqlx::query_scalar::<_, String>(
        "SELECT account_type FROM seller_payout_accounts WHERE seller_id = $1"
    )
    .bind(user_uuid)
    .fetch_optional(pool.get_ref())
    .await
    {
        Ok(Some(t)) => t,
        Ok(None) => {
            return HttpResponse::BadRequest().json(ApiResponse::<()>::error(
                "Please add a bank account or UPI ID before withdrawing funds"
            ));
        }
        Err(e) => {
            log::error!("Failed to fetch payout account: {}", e);
            return HttpResponse::InternalServerError().json(ApiResponse::<()>::error("Database error"));
        }
    };

    let mut tx = match pool.begin().await {
        Ok(tx) => tx,
        Err(e) => {
            log::error!("Failed to start transaction: {}", e);
            return HttpResponse::InternalServerError().json(ApiResponse::<()>::error("Database error"));
        }
    };

    let wallet = match sqlx::query_as::<_, Wallet>(
        "SELECT * FROM wallets WHERE user_id = $1 FOR UPDATE"
    )
    .bind(user_uuid)
    .fetch_one(&mut *tx)
    .await
    {
        Ok(w) => w,
        Err(e) => {
            log::error!("Failed to fetch wallet: {}", e);
            let _ = tx.rollback().await;
            return HttpResponse::InternalServerError().json(ApiResponse::<()>::error("Wallet not found"));
        }
    };

    if wallet.balance_paise < body.amount_paise {
        let _ = tx.rollback().await;
        return HttpResponse::BadRequest().json(ApiResponse::<()>::error("Insufficient balance"));
    }

    let new_balance = wallet.balance_paise - body.amount_paise;

    match sqlx::query(
        "UPDATE wallets SET balance_paise = $1, updated_at = NOW() WHERE user_id = $2"
    )
    .bind(new_balance)
    .bind(user_uuid)
    .execute(&mut *tx)
    .await
    {
        Ok(_) => {}
        Err(e) => {
            log::error!("Failed to update wallet: {}", e);
            let _ = tx.rollback().await;
            return HttpResponse::InternalServerError().json(ApiResponse::<()>::error("Failed to update wallet"));
        }
    }

    match sqlx::query(
        "INSERT INTO wallet_transactions (wallet_user_id, type, amount_paise, balance_after_paise, description, metadata) VALUES ($1, 'withdrawal', $2, $3, $4, $5)"
    )
    .bind(user_uuid)
    .bind(-body.amount_paise)
    .bind(new_balance)
    .bind("Withdrawal requested")
    .bind(serde_json::json!({ "payout_type": payout }))
    .execute(&mut *tx)
    .await
    {
        Ok(_) => {}
        Err(e) => {
            log::error!("Failed to record transaction: {}", e);
            let _ = tx.rollback().await;
            return HttpResponse::InternalServerError().json(ApiResponse::<()>::error("Failed to record transaction"));
        }
    }

    match tx.commit().await {
        Ok(_) => {
            let wallet = sqlx::query_as::<_, Wallet>("SELECT * FROM wallets WHERE user_id = $1")
                .bind(user_uuid)
                .fetch_one(pool.get_ref())
                .await
                .unwrap_or(wallet);
            HttpResponse::Ok().json(ApiResponse::success(wallet, "Withdrawal successful"))
        }
        Err(e) => {
            log::error!("Failed to commit transaction: {}", e);
            HttpResponse::InternalServerError().json(ApiResponse::<()>::error("Transaction failed"))
        }
    }
}

pub async fn release_escrow(
    pool: web::Data<PgPool>,
    _req: HttpRequest,
) -> HttpResponse {
    let expired = match sqlx::query_as::<_, (uuid::Uuid, uuid::Uuid, i32)>(
        "SELECT id, order_id, amount_paise FROM escrow WHERE status = 'held' AND held_until <= NOW()"
    )
    .fetch_all(pool.get_ref())
    .await
    {
        Ok(rows) => rows,
        Err(e) => {
            log::error!("Failed to fetch expired escrow: {}", e);
            return HttpResponse::InternalServerError().json(ApiResponse::<()>::error("Database error"));
        }
    };

    let mut released_count = 0;
    let mut total_released = 0;

    for (escrow_id, order_id, amount) in &expired {
        let mut tx = match pool.begin().await {
            Ok(tx) => tx,
            Err(e) => {
                log::error!("Failed to start transaction: {}", e);
                continue;
            }
        };

        let seller_id = match sqlx::query_scalar::<_, uuid::Uuid>(
            "SELECT seller_id FROM orders WHERE id = $1"
        )
        .bind(order_id)
        .fetch_one(&mut *tx)
        .await
        {
            Ok(id) => id,
            Err(_) => continue,
        };

        let _ = sqlx::query(
            "UPDATE escrow SET status = 'released', released_at = NOW() WHERE id = $1"
        )
        .bind(escrow_id)
        .execute(&mut *tx)
        .await;

        let _ = sqlx::query(
            "UPDATE wallets SET pending_paise = pending_paise - $1, balance_paise = balance_paise + $1, updated_at = NOW() WHERE user_id = $2"
        )
        .bind(amount)
        .bind(seller_id)
        .execute(&mut *tx)
        .await;

        let new_balance = sqlx::query_scalar::<_, i32>(
            "SELECT balance_paise FROM wallets WHERE user_id = $1"
        )
        .bind(seller_id)
        .fetch_one(&mut *tx)
        .await
        .unwrap_or(0);

        let _ = sqlx::query(
            "INSERT INTO wallet_transactions (wallet_user_id, type, amount_paise, balance_after_paise, description, reference_id) VALUES ($1, 'sale', $2, $3, $4, $5)"
        )
        .bind(seller_id)
        .bind(amount)
        .bind(new_balance)
        .bind("Escrow released - funds available for withdrawal")
        .bind(order_id)
        .execute(&mut *tx)
        .await;

        match tx.commit().await {
            Ok(_) => {
                released_count += 1;
                total_released += amount;
            }
            Err(e) => {
                log::error!("Failed to commit escrow release: {}", e);
            }
        }
    }

    HttpResponse::Ok().json(ApiResponse::success(serde_json::json!({
        "released_count": released_count,
        "total_released_paise": total_released,
    }), &format!("Released {} escrow entries", released_count)))
}

/// Webhook payload structures for Razorpay wallet topup webhooks
#[derive(Debug, Deserialize)]
struct WalletTopupWebhookPayload {
    event: String,
    payload: WalletTopupWebhookPayloadInner,
}

#[derive(Debug, Deserialize)]
struct WalletTopupWebhookPayloadInner {
    payment: WalletTopupWebhookPaymentEntity,
}

#[derive(Debug, Deserialize)]
struct WalletTopupWebhookPaymentEntity {
    entity: WalletTopupWebhookPayment,
}

#[derive(Debug, Deserialize)]
struct WalletTopupWebhookPayment {
    id: String,
    order_id: Option<String>,
    status: String,
    #[allow(dead_code)]
    amount: u64,
    #[allow(dead_code)]
    currency: String,
}

/// Handle Razorpay webhook for wallet topups (server-to-server confirmation)
pub async fn wallet_topup_webhook(
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

    let payload: WalletTopupWebhookPayload = match serde_json::from_slice(&body) {
        Ok(p) => p,
        Err(e) => {
            log::error!("Failed to parse webhook body: {}", e);
            return HttpResponse::BadRequest().body("invalid payload");
        }
    };

    // We only process payment.captured events for topups
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

    // Find the topup order by razorpay_order_id
    let topup = match sqlx::query_as::<_, WalletTopup>(
        "SELECT * FROM wallet_topups WHERE razorpay_order_id = $1 AND status = 'pending'"
    )
    .bind(&razorpay_order_id)
    .fetch_optional(pool.get_ref())
    .await
    {
        Ok(Some(t)) => t,
        Ok(None) => {
            log::warn!("Webhook for unknown or already processed razorpay order {}", razorpay_order_id);
            return HttpResponse::Ok().body("topup not found or already processed");
        }
        Err(e) => {
            log::error!("Webhook DB lookup failed: {}", e);
            return HttpResponse::InternalServerError().body("db error");
        }
    };

    let user_id = topup.user_id;
    let amount_paise = topup.amount_paise;

    // Process the topup in a transaction
    let mut tx = match pool.begin().await {
        Ok(tx) => tx,
        Err(e) => {
            log::error!("Failed to start transaction: {}", e);
            return HttpResponse::InternalServerError().json(ApiResponse::<()>::error("Database error"));
        }
    };

    // Update the topup order as successful
    let _ = sqlx::query(
        "UPDATE wallet_topups SET status = 'success', razorpay_payment_id = $1, updated_at = NOW() WHERE id = $2"
    )
    .bind(&payment_id)
    .bind(topup.id)
    .execute(&mut *tx)
    .await;

    // Get current wallet balance
    let wallet = match sqlx::query_as::<_, Wallet>("SELECT * FROM wallets WHERE user_id = $1")
        .bind(user_id)
        .fetch_one(&mut *tx)
        .await
    {
        Ok(w) => w,
        Err(e) => {
            log::error!("Failed to fetch wallet: {}", e);
            let _ = tx.rollback().await;
            return HttpResponse::InternalServerError().json(ApiResponse::<()>::error("Wallet error"));
        }
    };

    // Calculate new balance
    let new_balance = wallet.balance_paise + amount_paise;

    // Update wallet balance
    let _ = sqlx::query(
        "UPDATE wallets SET balance_paise = $1, updated_at = NOW() WHERE user_id = $2"
    )
    .bind(new_balance)
    .bind(user_id)
    .execute(&mut *tx)
    .await;

    // Record the transaction
    let _ = sqlx::query(
        "INSERT INTO wallet_transactions (wallet_user_id, type, amount_paise, balance_after_paise, description, reference_id) VALUES ($1, 'topup', $2, $3, $4, $5)"
    )
    .bind(user_id)
    .bind(amount_paise)
    .bind(new_balance)
    .bind(format!("Razorpay topup successful (webhook) - {}", payment_id))
    .bind(topup.id)
    .execute(&mut *tx)
    .await;

    match tx.commit().await {
        Ok(_) => {
            log::info!("Wallet topup {} completed via webhook for user {}", razorpay_order_id, user_id);
            HttpResponse::Ok().body("ok")
        }
        Err(e) => {
            log::error!("Failed to commit wallet topup transaction: {}", e);
            HttpResponse::InternalServerError().json(ApiResponse::<()>::error("Transaction failed"))
        }
    }
}
