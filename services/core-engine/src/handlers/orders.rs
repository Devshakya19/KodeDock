use actix_web::{web, HttpRequest, HttpResponse};
use sqlx::PgPool;
use crate::models::{Order, CreateOrderRequest};
use crate::services::ApiResponse;
use crate::middleware::extract_user_id;

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
    let product = match sqlx::query_as::<_, crate::models::Product>("SELECT * FROM products WHERE id = $1")
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

    // Prevent self-purchase
    if product.seller_id == buyer_uuid {
        return HttpResponse::BadRequest().json(ApiResponse::<()>::error("Cannot purchase your own product"));
    }

    let price_paise = product.price_paise;
    let platform_fee = (price_paise as f64 * 0.025) as i32; // 2.5% platform fee
    let seller_amount = price_paise - platform_fee;

    match sqlx::query_as::<_, Order>(
        r#"INSERT INTO orders (buyer_id, seller_id, product_id, amount_paise, platform_fee_paise, seller_amount_paise, status, github_repo_url)
           VALUES ($1, $2, $3, $4, $5, $6, 'completed', $7)
           RETURNING *"#
    )
    .bind(buyer_uuid)
    .bind(product.seller_id)
    .bind(body.product_id)
    .bind(price_paise)
    .bind(platform_fee)
    .bind(seller_amount)
    .bind(&product.github_repo_url)
    .fetch_one(pool.get_ref())
    .await
    {
        Ok(order) => HttpResponse::Ok().json(ApiResponse::success(order, "Order created")),
        Err(e) => {
            log::error!("Failed to create order: {}", e);
            HttpResponse::InternalServerError().json(ApiResponse::<()>::error("Failed to create order"))
        }
    }
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

    sql.push_str(" ORDER BY created_at DESC");

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
