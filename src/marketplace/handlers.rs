use actix_web::{web, HttpResponse};
use sqlx::PgPool;

use crate::marketplace::errors::MarketplaceError;
use crate::marketplace::models::ApiResponse;
use crate::marketplace::service;

pub async fn list_products(
    pool: web::Data<PgPool>,
) -> Result<HttpResponse, MarketplaceError> {
    let products = service::get_explore_products(pool.get_ref()).await?;

    Ok(HttpResponse::Ok().json(ApiResponse {
        success: true,
        data: products,
    }))
}

pub async fn product_details(
    pool: web::Data<PgPool>,
    path: web::Path<String>,
) -> Result<HttpResponse, MarketplaceError> {
    let slug = path.into_inner();
    let product = service::get_product_details(pool.get_ref(), &slug).await?;

    Ok(HttpResponse::Ok().json(ApiResponse {
        success: true,
        data: product,
    }))
}
