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
