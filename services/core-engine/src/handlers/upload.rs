use actix_web::{web, HttpRequest, HttpResponse};
use serde::{Deserialize, Serialize};
use crate::storage::StorageClient;
use crate::middleware::extract_user_id;
use crate::services::ApiResponse;

#[derive(Deserialize)]
pub struct PresignRequest {
    #[allow(dead_code)]
    pub filename: String,
    pub content_type: String,
    pub purpose: String,
}

#[derive(Serialize)]
pub struct PresignResponse {
    pub upload_url: String,
    pub public_url: String,
    pub key: String,
}

const ALLOWED_TYPES: &[&str] = &[
    "image/jpeg", "image/png", "image/gif", "image/webp",
];

pub async fn presign_upload(
    storage: web::Data<StorageClient>,
    req: HttpRequest,
    body: web::Json<PresignRequest>,
) -> HttpResponse {
    let _user_id = match extract_user_id(&req) {
        Ok(id) => id,
        Err(_) => return HttpResponse::Unauthorized().json(ApiResponse::<()>::error("Unauthorized")),
    };

    if !ALLOWED_TYPES.contains(&body.content_type.as_str()) {
        return HttpResponse::BadRequest().json(ApiResponse::<()>::error(
            "Invalid file type. Allowed: JPEG, PNG, GIF, WebP",
        ));
    }

    let key = match body.purpose.as_str() {
        "product" => {
            let ext = extension_from_content_type(&body.content_type);
            format!("products/{}.{}", uuid::Uuid::new_v4(), ext)
        }
        "avatar" => {
            let ext = extension_from_content_type(&body.content_type);
            format!("avatars/{}.{}", uuid::Uuid::new_v4(), ext)
        }
        _ => return HttpResponse::BadRequest().json(ApiResponse::<()>::error("Invalid purpose")),
    };

    match storage.presign_put(&key, &body.content_type, 300).await {
        Ok(upload_url) => {
            let public_url = storage.public_url(&key);
            HttpResponse::Ok().json(ApiResponse::success(
                PresignResponse { upload_url, public_url, key },
                "Upload URL generated",
            ))
        }
        Err(e) => {
            log::error!("Failed to generate presigned URL: {}", e);
            HttpResponse::InternalServerError().json(ApiResponse::<()>::error("Failed to generate upload URL"))
        }
    }
}

fn extension_from_content_type(ct: &str) -> &str {
    match ct {
        "image/jpeg" => "jpg",
        "image/png" => "png",
        "image/gif" => "gif",
        "image/webp" => "webp",
        _ => "bin",
    }
}
