use actix_web::{web, HttpRequest, HttpResponse};
use sqlx::PgPool;
use crate::models::{Review, CreateReviewRequest};
use crate::services::ApiResponse;
use crate::middleware::extract_user_id;

/// Review with joined user profile data
#[derive(Debug, serde::Serialize, serde::Deserialize, sqlx::FromRow)]
pub struct ReviewWithUser {
    pub id: uuid::Uuid,
    pub product_id: uuid::Uuid,
    pub user_id: uuid::Uuid,
    pub order_id: uuid::Uuid,
    pub rating: i32,
    pub title: Option<String>,
    pub comment: Option<String>,
    pub is_verified_purchase: Option<bool>,
    pub helpful_count: Option<i32>,
    pub created_at: Option<chrono::DateTime<chrono::Utc>>,
    pub updated_at: Option<chrono::DateTime<chrono::Utc>>,
    pub user_name: Option<String>,
    pub user_avatar: Option<String>,
}

pub async fn list_reviews(
    pool: web::Data<PgPool>,
    path: web::Path<String>,
) -> HttpResponse {
    let product_id = match uuid::Uuid::parse_str(&path.into_inner()) {
        Ok(uuid) => uuid,
        Err(_) => return HttpResponse::BadRequest().json(ApiResponse::<()>::error("Invalid product ID")),
    };

    match sqlx::query_as::<_, ReviewWithUser>(
        r#"SELECT r.id, r.product_id, r.user_id, r.order_id, r.rating, r.title, r.comment,
                  r.is_verified_purchase, r.helpful_count, r.created_at, r.updated_at,
                  p.full_name as user_name, p.avatar_url as user_avatar
           FROM reviews r
           LEFT JOIN profiles p ON r.user_id = p.id
           WHERE r.product_id = $1
           ORDER BY r.created_at DESC
           LIMIT 50"#
    )
    .bind(product_id)
    .fetch_all(pool.get_ref())
    .await
    {
        Ok(reviews) => HttpResponse::Ok().json(ApiResponse::success(reviews, "Reviews fetched")),
        Err(e) => {
            log::error!("Failed to fetch reviews: {}", e);
            HttpResponse::InternalServerError().json(ApiResponse::<()>::error("Failed to fetch reviews"))
        }
    }
}

/// Notify seller when a review is posted
async fn notify_seller_on_review(pool: &PgPool, product_id: uuid::Uuid, buyer_id: uuid::Uuid, rating: i32) {
    // Get seller_id and product title
    let product_info = sqlx::query_as::<_, (uuid::Uuid, String)>(
        "SELECT seller_id, title FROM products WHERE id = $1"
    )
    .bind(product_id)
    .fetch_optional(pool)
    .await;

    if let Ok(Some((seller_id, title))) = product_info {
        let message = format!("{} left a {}-star review on \"{}\"", 
            "A buyer".to_string(), rating, title);
        
        let _ = sqlx::query(
            r#"INSERT INTO notifications (user_id, type, title, message, data)
               VALUES ($1, 'review', 'New Review', $2, $3)"#
        )
        .bind(seller_id)
        .bind(&message)
        .bind(serde_json::json!({
            "product_id": product_id.to_string(),
            "buyer_id": buyer_id.to_string(),
            "rating": rating
        }))
        .execute(pool)
        .await;
    }
}

pub async fn create_review(
    pool: web::Data<PgPool>,
    req: HttpRequest,
    body: web::Json<CreateReviewRequest>,
) -> HttpResponse {
    let user_id = match extract_user_id(&req) {
        Ok(id) => id,
        Err(_) => return HttpResponse::Unauthorized().json(ApiResponse::<()>::error("Unauthorized")),
    };

    let user_uuid = match uuid::Uuid::parse_str(&user_id) {
        Ok(uuid) => uuid,
        Err(_) => return HttpResponse::BadRequest().json(ApiResponse::<()>::error("Invalid user ID")),
    };

    // Validate rating range
    if body.rating < 1 || body.rating > 5 {
        return HttpResponse::BadRequest().json(ApiResponse::<()>::error("Rating must be between 1 and 5"));
    }

    // Check for duplicate review (same user + same order)
    let existing = sqlx::query_scalar::<_, uuid::Uuid>(
        "SELECT id FROM reviews WHERE order_id = $1 AND user_id = $2"
    )
    .bind(body.order_id)
    .bind(user_uuid)
    .fetch_optional(pool.get_ref())
    .await;

    match existing {
        Ok(Some(_)) => {
            return HttpResponse::Conflict().json(ApiResponse::<()>::error("You have already reviewed this product"));
        }
        Ok(None) => {}
        Err(e) => {
            log::error!("Failed to check existing review: {}", e);
            return HttpResponse::InternalServerError().json(ApiResponse::<()>::error("Database error"));
        }
    }

    // Verify the order belongs to this user, is completed, and product_id matches
    match sqlx::query_scalar::<_, uuid::Uuid>(
        "SELECT id FROM orders WHERE id = $1 AND buyer_id = $2 AND product_id = $3 AND status = 'completed'"
    )
    .bind(body.order_id)
    .bind(user_uuid)
    .bind(body.product_id)
    .fetch_optional(pool.get_ref())
    .await
    {
        Ok(Some(_)) => {}
        Ok(None) => return HttpResponse::Forbidden().json(ApiResponse::<()>::error("Invalid order for review")),
        Err(e) => {
            log::error!("Failed to verify order: {}", e);
            return HttpResponse::InternalServerError().json(ApiResponse::<()>::error("Database error"));
        }
    }

    // Insert review
    match sqlx::query_as::<_, Review>(
        r#"INSERT INTO reviews (product_id, user_id, order_id, rating, title, comment, is_verified_purchase)
           VALUES ($1, $2, $3, $4, $5, $6, true)
           RETURNING *"#
    )
    .bind(body.product_id)
    .bind(user_uuid)
    .bind(body.order_id)
    .bind(body.rating)
    .bind(&body.title)
    .bind(&body.comment)
    .fetch_one(pool.get_ref())
    .await
    {
        Ok(review) => {
            // Update product rating and review_count
            let _ = sqlx::query(
                r#"UPDATE products SET
                   rating = (SELECT COALESCE(AVG(rating)::numeric(3,2), 0) FROM reviews WHERE product_id = $1),
                   review_count = (SELECT COUNT(*)::int FROM reviews WHERE product_id = $1)
                   WHERE id = $1"#
            )
            .bind(body.product_id)
            .execute(pool.get_ref())
            .await;

            // Notify seller
            notify_seller_on_review(pool.get_ref(), body.product_id, user_uuid, body.rating).await;

            HttpResponse::Ok().json(ApiResponse::success(review, "Review created"))
        }
        Err(e) => {
            log::error!("Failed to create review: {}", e);
            HttpResponse::InternalServerError().json(ApiResponse::<()>::error("Failed to create review"))
        }
    }
}
