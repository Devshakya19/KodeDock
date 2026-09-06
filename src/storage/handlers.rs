use actix_web::{web, HttpResponse};
use sqlx::PgPool;
use uuid::Uuid;

use super::models::{UploadConfirmRequest, UploadIntentRequest};
use super::service::StorageService;
use crate::auth::middleware::AuthenticatedUser;
use crate::common::ApiResponse;
use crate::config::AppConfig;
use crate::errors::AppError;

pub async fn upload_intent(
    config: web::Data<AppConfig>,
    _auth_user: AuthenticatedUser,
    req: web::Json<UploadIntentRequest>,
) -> Result<HttpResponse, AppError> {
    let storage_service = StorageService::new(&config);

    // Note: In a robust flow, verify auth_user.id owns req.product_id here.

    let resp = storage_service
        .generate_upload_url(req.product_id, &req.filename, &req.content_type)
        .await?;

    Ok(HttpResponse::Ok().json(ApiResponse::success_with_message(
        resp,
        "Presigned PUT URL generated successfully. Upload directly to this URL.",
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
        req.size_bytes,
    )
    .await?;

    Ok(HttpResponse::Ok().json(ApiResponse::success_with_message(
        true,
        "Asset securely linked to product.",
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

    let resp = storage_service
        .generate_download_url(&pool, auth_user.id, asset_id)
        .await?;

    Ok(HttpResponse::Ok().json(ApiResponse::success_with_message(
        resp,
        "Presigned GET URL generated successfully. Valid for 15 minutes.",
    )))
}

pub async fn download_order_package(
    pool: web::Data<PgPool>,
    _config: web::Data<AppConfig>,
    auth_user: AuthenticatedUser,
    path: web::Path<Uuid>,
) -> Result<HttpResponse, AppError> {
    let order_id = path.into_inner();

    let order_info: Option<(Uuid, String, String, String)> = sqlx::query_as(
        r#"
        SELECT o.product_id, o.order_number, o.status, p.title
        FROM orders o
        JOIN products p ON o.product_id = p.id
        WHERE o.id = $1 AND o.buyer_id = $2
        "#,
    )
    .bind(order_id)
    .bind(auth_user.id)
    .fetch_optional(pool.get_ref())
    .await
    .map_err(AppError::DatabaseError)?;

    let (_product_id, order_number, status, product_title) = match order_info {
        Some(info) => info,
        None => return Err(AppError::NotFound("Order not found or access denied".to_string())),
    };

    if status != "paid_held_in_escrow" && status != "completed" {
        return Err(AppError::Forbidden("Order has not been paid or verified in escrow".to_string()));
    }

    let license_key: Option<(String,)> = sqlx::query_as(
        r#"SELECT license_key FROM license_keys WHERE order_id = $1"#
    )
    .bind(order_id)
    .fetch_optional(pool.get_ref())
    .await
    .map_err(AppError::DatabaseError)?;

    let lic = license_key.map(|l| l.0).unwrap_or_else(|| format!("KD-LIC-{}", order_number));

    let download_url = format!("https://git.kodedock.com/vault/dl/{}.tar.gz", order_number.to_lowercase());

    Ok(HttpResponse::Ok().json(serde_json::json!({
        "order_id": order_id,
        "order_number": order_number,
        "product_title": product_title,
        "license_key": lic,
        "archive_filename": format!("{}-source.zip", order_number.to_lowercase()),
        "status": "ready",
        "download_url": download_url
    })))
}

