use actix_web::{web, HttpRequest, HttpResponse};
use sqlx::PgPool;
use crate::models::Notification;
use crate::services::ApiResponse;
use crate::middleware::extract_user_id;

pub async fn list_notifications(
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

    match sqlx::query_as::<_, Notification>("SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50")
        .bind(user_uuid)
        .fetch_all(pool.get_ref())
        .await
    {
        Ok(notifications) => HttpResponse::Ok().json(ApiResponse::success(notifications, "Notifications fetched")),
        Err(e) => {
            log::error!("Failed to fetch notifications: {}", e);
            HttpResponse::InternalServerError().json(ApiResponse::<()>::error("Failed to fetch notifications"))
        }
    }
}

pub async fn mark_read(
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

    let id = match uuid::Uuid::parse_str(&path.into_inner()) {
        Ok(uuid) => uuid,
        Err(_) => return HttpResponse::BadRequest().json(ApiResponse::<()>::error("Invalid notification ID")),
    };

    // Only mark own notifications as read
    match sqlx::query("UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2")
        .bind(id)
        .bind(user_uuid)
        .execute(pool.get_ref())
        .await
    {
        Ok(_) => HttpResponse::Ok().json(ApiResponse::<()> {
            success: true,
            data: None,
            message: Some("Notification marked as read".to_string()),
            error: None,
        }),
        Err(e) => {
            log::error!("Failed to mark notification as read: {}", e);
            HttpResponse::InternalServerError().json(ApiResponse::<()>::error("Failed to mark notification"))
        }
    }
}

pub async fn get_preferences(
    pool: web::Data<PgPool>,
    req: HttpRequest,
) -> HttpResponse {
    let user_id = match crate::middleware::require_developer(&req) {
        Ok(id) => id,
        Err(resp) => return resp,
    };

    let user_uuid = match uuid::Uuid::parse_str(&user_id) {
        Ok(uuid) => uuid,
        Err(_) => return HttpResponse::BadRequest().json(ApiResponse::<()>::error("Invalid user ID")),
    };

    match sqlx::query_as::<_, crate::models::SellerNotificationPreferences>(
        "SELECT * FROM seller_notification_preferences WHERE seller_id = $1"
    )
    .bind(user_uuid)
    .fetch_optional(pool.get_ref())
    .await
    {
        Ok(Some(prefs)) => HttpResponse::Ok().json(ApiResponse::success(prefs, "Preferences fetched")),
        Ok(None) => {
            // Return default
            let default_prefs = crate::models::SellerNotificationPreferences {
                seller_id: user_uuid,
                email_sales: true,
                email_reviews: true,
                email_updates: true,
                push_sales: true,
                push_reviews: true,
                push_updates: true,
            };
            HttpResponse::Ok().json(ApiResponse::success(default_prefs, "Default preferences returned"))
        }
        Err(e) => {
            log::error!("Failed to fetch notification preferences: {}", e);
            HttpResponse::InternalServerError().json(ApiResponse::<()>::error("Database error"))
        }
    }
}

pub async fn update_preferences(
    pool: web::Data<PgPool>,
    req: HttpRequest,
    body: web::Json<crate::models::UpdateNotificationPreferencesRequest>,
) -> HttpResponse {
    let user_id = match crate::middleware::require_developer(&req) {
        Ok(id) => id,
        Err(resp) => return resp,
    };

    let user_uuid = match uuid::Uuid::parse_str(&user_id) {
        Ok(uuid) => uuid,
        Err(_) => return HttpResponse::BadRequest().json(ApiResponse::<()>::error("Invalid user ID")),
    };

    let result = sqlx::query_as::<_, crate::models::SellerNotificationPreferences>(
        r#"
        INSERT INTO seller_notification_preferences (seller_id, email_sales, email_reviews, email_updates, push_sales, push_reviews, push_updates)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (seller_id) DO UPDATE SET
            email_sales = EXCLUDED.email_sales,
            email_reviews = EXCLUDED.email_reviews,
            email_updates = EXCLUDED.email_updates,
            push_sales = EXCLUDED.push_sales,
            push_reviews = EXCLUDED.push_reviews,
            push_updates = EXCLUDED.push_updates,
            updated_at = NOW()
        RETURNING *
        "#
    )
    .bind(user_uuid)
    .bind(body.email_sales)
    .bind(body.email_reviews)
    .bind(body.email_updates)
    .bind(body.push_sales)
    .bind(body.push_reviews)
    .bind(body.push_updates)
    .fetch_one(pool.get_ref())
    .await;

    match result {
        Ok(prefs) => HttpResponse::Ok().json(ApiResponse::success(prefs, "Preferences updated")),
        Err(e) => {
            log::error!("Failed to update notification preferences: {}", e);
            HttpResponse::InternalServerError().json(ApiResponse::<()>::error("Failed to update preferences"))
        }
    }
}
