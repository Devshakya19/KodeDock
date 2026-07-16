use actix_web::{web, HttpRequest, HttpResponse};
use sqlx::PgPool;
use crate::models::{Review, CreateReviewRequest};
use crate::services::ApiResponse;
use crate::middleware::extract_user_id;

pub async fn list_reviews(
    pool: web::Data<PgPool>,
    path: web::Path<String>,
) -> HttpResponse {
    let product_id = match uuid::Uuid::parse_str(&path.into_inner()) {
        Ok(uuid) => uuid,
        Err(_) => return HttpResponse::BadRequest().json(ApiResponse::<()>::error("Invalid product ID")),
    };

    match sqlx::query_as::<_, Review>("SELECT * FROM reviews WHERE product_id = $1 ORDER BY created_at DESC")
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

    // Verify the order belongs to this user and is completed
    match sqlx::query_scalar::<_, uuid::Uuid>(
        "SELECT id FROM orders WHERE id = $1 AND buyer_id = $2 AND status = 'completed'"
    )
    .bind(body.order_id)
    .bind(user_uuid)
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

    match sqlx::query_as::<_, Review>(
        r#"INSERT INTO reviews (product_id, user_id, order_id, rating, title, comment)
           VALUES ($1, $2, $3, $4, $5, $6)
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
        Ok(review) => HttpResponse::Ok().json(ApiResponse::success(review, "Review created")),
        Err(e) => {
            log::error!("Failed to create review: {}", e);
            HttpResponse::InternalServerError().json(ApiResponse::<()>::error("Failed to create review"))
        }
    }
}
