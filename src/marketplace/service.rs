use sqlx::PgPool;
use crate::marketplace::errors::MarketplaceError;
use crate::marketplace::models::{ProductDetails, ProductSummary};
use crate::marketplace::repository;

pub async fn get_explore_products(pool: &PgPool) -> Result<Vec<ProductSummary>, MarketplaceError> {
    let rows = repository::fetch_active_products(pool).await?;
    let products = rows.into_iter().map(|r| r.into_summary()).collect();
    Ok(products)
}

pub async fn get_product_details(pool: &PgPool, slug: &str) -> Result<ProductDetails, MarketplaceError> {
    let row = repository::fetch_product_by_slug(pool, slug)
        .await?
        .ok_or_else(|| MarketplaceError::NotFound(format!("Product with slug '{}' not found", slug)))?;

    Ok(row.into_details())
}
