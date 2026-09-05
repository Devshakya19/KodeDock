use actix_web::{web, HttpResponse};
use sqlx::PgPool;

use crate::auth::middleware::AuthenticatedUser;
use crate::common::ApiResponse;
use crate::errors::AppError;
use super::models::CreateProductRequest;
use super::service::MarketplaceService;

pub async fn create_product(
    pool: web::Data<PgPool>,
    auth_user: AuthenticatedUser,
    req: web::Json<CreateProductRequest>,
) -> Result<HttpResponse, AppError> {
    let product = MarketplaceService::create_product(&pool, auth_user.id, req.into_inner()).await?;
    
    Ok(HttpResponse::Created().json(ApiResponse::success_with_message(
        product,
        "Product created successfully and queued for AI indexing",
    )))
}

pub async fn get_product(
    pool: web::Data<PgPool>,
    path: web::Path<String>,
) -> Result<HttpResponse, AppError> {
    let slug = path.into_inner();
    let product = MarketplaceService::get_product(&pool, &slug).await?;
    
    Ok(HttpResponse::Ok().json(ApiResponse::success(product)))
}

pub async fn my_products(
    pool: web::Data<PgPool>,
    auth_user: AuthenticatedUser,
) -> Result<HttpResponse, AppError> {
    let products = MarketplaceService::get_my_products(&pool, auth_user.id).await?;
    
    Ok(HttpResponse::Ok().json(ApiResponse::success(products)))
}
