use actix_web::{web, HttpRequest, HttpResponse};
use sqlx::PgPool;
use crate::models::Profile;
use crate::services::ApiResponse;
use crate::storage::StorageClient;
use crate::middleware::extract_user_id;

pub async fn get_profile(
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
        Err(_) => return HttpResponse::BadRequest().json(ApiResponse::<()>::error("Invalid profile ID")),
    };

    // Users can only view their own profile
    if id != user_uuid {
        return HttpResponse::Forbidden().json(ApiResponse::<()>::error("Cannot view another user's profile"));
    }

    match sqlx::query_as::<_, Profile>("SELECT * FROM profiles WHERE id = $1")
        .bind(user_uuid)
        .fetch_optional(pool.get_ref())
        .await
    {
        Ok(Some(profile)) => HttpResponse::Ok().json(ApiResponse::success(profile, "Profile fetched")),
        Ok(None) => HttpResponse::NotFound().json(ApiResponse::<()>::error("Profile not found")),
        Err(e) => {
            log::error!("Failed to fetch profile: {}", e);
            HttpResponse::InternalServerError().json(ApiResponse::<()>::error("Failed to fetch profile"))
        }
    }
}

pub async fn update_profile(
    pool: web::Data<PgPool>,
    storage: web::Data<StorageClient>,
    req: HttpRequest,
    body: web::Json<serde_json::Value>,
) -> HttpResponse {
    let user_id = match extract_user_id(&req) {
        Ok(id) => id,
        Err(_) => return HttpResponse::Unauthorized().json(ApiResponse::<()>::error("Unauthorized")),
    };

    let user_uuid = match uuid::Uuid::parse_str(&user_id) {
        Ok(uuid) => uuid,
        Err(_) => return HttpResponse::BadRequest().json(ApiResponse::<()>::error("Invalid user ID")),
    };

    // ID from body must match authenticated user
    let body_id = match body.get("id").and_then(|v| v.as_str()) {
        Some(id_str) => match uuid::Uuid::parse_str(id_str) {
            Ok(uuid) => uuid,
            Err(_) => return HttpResponse::BadRequest().json(ApiResponse::<()>::error("Invalid profile ID")),
        },
        None => return HttpResponse::BadRequest().json(ApiResponse::<()>::error("Missing profile ID")),
    };

    if body_id != user_uuid {
        return HttpResponse::Forbidden().json(ApiResponse::<()>::error("Cannot update another user's profile"));
    }

    // If new avatar_url is being set, delete old avatar from storage
    if let Some(new_avatar) = body.get("avatar_url").and_then(|v| v.as_str()) {
        if let Ok(Some(old_url)) = sqlx::query_scalar::<_, String>(
            "SELECT avatar_url FROM profiles WHERE id = $1 AND avatar_url IS NOT NULL"
        )
        .bind(user_uuid)
        .fetch_optional(pool.get_ref())
        .await
        {
            if old_url != new_avatar {
                if let Some(key) = storage.extract_key_from_url(&old_url) {
                    if let Err(e) = storage.delete_object(&key).await {
                        log::warn!("Failed to delete old avatar: {}", e);
                    }
                }
            }
        }
    }

    // Try to update first
    let result = sqlx::query_as::<_, Profile>(
        r#"UPDATE profiles SET
           full_name = COALESCE($2, full_name),
           bio = COALESCE($3, bio),
           avatar_url = COALESCE($4, avatar_url),
           github_username = COALESCE($5, github_username),
           website = COALESCE($6, website),
           location = COALESCE($7, location),
           updated_at = NOW()
           WHERE id = $1 RETURNING *"#
    )
    .bind(user_uuid)
    .bind(body.get("full_name").and_then(|v| v.as_str()))
    .bind(body.get("bio").and_then(|v| v.as_str()))
    .bind(body.get("avatar_url").and_then(|v| v.as_str()))
    .bind(body.get("github_username").and_then(|v| v.as_str()))
    .bind(body.get("website").and_then(|v| v.as_str()))
    .bind(body.get("location").and_then(|v| v.as_str()))
    .fetch_optional(pool.get_ref())
    .await;

    match result {
        Ok(Some(profile)) => HttpResponse::Ok().json(ApiResponse::success(profile, "Profile updated")),
        Ok(None) => {
            // Profile doesn't exist, create it
            match sqlx::query_as::<_, Profile>(
                r#"INSERT INTO profiles (id, full_name, bio, avatar_url, github_username, website, location)
                   VALUES ($1, $2, $3, $4, $5, $6, $7)
                   RETURNING *"#
            )
            .bind(user_uuid)
            .bind(body.get("full_name").and_then(|v| v.as_str()))
            .bind(body.get("bio").and_then(|v| v.as_str()))
            .bind(body.get("avatar_url").and_then(|v| v.as_str()))
            .bind(body.get("github_username").and_then(|v| v.as_str()))
            .bind(body.get("website").and_then(|v| v.as_str()))
            .bind(body.get("location").and_then(|v| v.as_str()))
            .fetch_one(pool.get_ref())
            .await
            {
                Ok(profile) => HttpResponse::Ok().json(ApiResponse::success(profile, "Profile created")),
                Err(e) => {
                    log::error!("Failed to create profile: {}", e);
                    HttpResponse::InternalServerError().json(ApiResponse::<()>::error("Failed to create profile"))
                }
            }
        }
        Err(e) => {
            log::error!("Failed to update profile: {}", e);
            HttpResponse::InternalServerError().json(ApiResponse::<()>::error("Failed to update profile"))
        }
    }
}
