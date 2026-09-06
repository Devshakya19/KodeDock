use actix_web::{web, HttpResponse};
use sqlx::PgPool;
use uuid::Uuid;

use super::models::{CatalogQuery, CreateProductRequest};
use super::service::MarketplaceService;
use crate::auth::middleware::AuthenticatedUser;
use crate::common::ApiResponse;
use crate::errors::AppError;

pub async fn list_catalog(
    pool: web::Data<PgPool>,
    query: web::Query<CatalogQuery>,
) -> Result<HttpResponse, AppError> {
    let response = MarketplaceService::list_catalog(&pool, query.into_inner()).await?;
    Ok(HttpResponse::Ok().json(ApiResponse::success(response)))
}

pub async fn create_product(
    pool: web::Data<PgPool>,
    auth_user: AuthenticatedUser,
    req: web::Json<CreateProductRequest>,
) -> Result<HttpResponse, AppError> {
    let product = MarketplaceService::create_product(&pool, auth_user.id, req.into_inner()).await?;

    Ok(
        HttpResponse::Created().json(ApiResponse::success_with_message(
            product,
            "Product created successfully",
        )),
    )
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

pub async fn publish_product(
    pool: web::Data<PgPool>,
    auth_user: AuthenticatedUser,
    path: web::Path<Uuid>,
) -> Result<HttpResponse, AppError> {
    let product_id = path.into_inner();
    let product = MarketplaceService::publish_product(&pool, product_id, auth_user.id).await?;

    Ok(HttpResponse::Ok().json(ApiResponse::success_with_message(
        product,
        "Product published to live marketplace catalog",
    )))
}
