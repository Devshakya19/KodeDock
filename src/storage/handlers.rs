use actix_web::{web, HttpResponse};
use sqlx::PgPool;
use uuid::Uuid;

use crate::auth::middleware::AuthenticatedUser;
use crate::common::ApiResponse;
use crate::config::AppConfig;
use crate::errors::AppError;
use super::models::{UploadIntentRequest, UploadConfirmRequest};
use super::service::StorageService;

pub async fn upload_intent(
    config: web::Data<AppConfig>,
    _auth_user: AuthenticatedUser,
    req: web::Json<UploadIntentRequest>,
) -> Result<HttpResponse, AppError> {
    let storage_service = StorageService::new(&config);
    
    // Note: In a robust flow, verify auth_user.id owns req.product_id here.
    
    let resp = storage_service.generate_upload_url(
        req.product_id, 
        &req.filename, 
        &req.content_type
    ).await?;
    
    Ok(HttpResponse::Ok().json(ApiResponse::success_with_message(
        resp,
        "Presigned PUT URL generated successfully. Upload directly to this URL."
    )))
}

pub async fn upload_confirm(
    pool: web::Data<PgPool>,
    auth_user: AuthenticatedUser,
    req: web::Json<UploadConfirmRequest>,
) -> Result<HttpResponse, AppError> {
    StorageService::confirm_upload(
        &pool,
        auth_user.id,
        req.product_id,
        &req.object_key,
        req.size_bytes
    ).await?;
    
    Ok(HttpResponse::Ok().json(ApiResponse::success_with_message(
        true,
        "Asset securely linked to product."
    )))
}

pub async fn download_intent(
    pool: web::Data<PgPool>,
    config: web::Data<AppConfig>,
    auth_user: AuthenticatedUser,
    path: web::Path<Uuid>,
) -> Result<HttpResponse, AppError> {
    let asset_id = path.into_inner();
    let storage_service = StorageService::new(&config);
    
    let resp = storage_service.generate_download_url(&pool, auth_user.id, asset_id).await?;
    
    Ok(HttpResponse::Ok().json(ApiResponse::success_with_message(
        resp,
        "Presigned GET URL generated successfully. Valid for 15 minutes."
    )))
}
