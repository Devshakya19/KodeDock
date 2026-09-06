use slug::slugify;
use sqlx::PgPool;
use uuid::Uuid;

use super::models::{CatalogQuery, CatalogResponse, CreateProductRequest, Product};
use super::repository::MarketplaceRepository;
use crate::errors::AppError;

pub struct MarketplaceService;

impl MarketplaceService {
    pub async fn create_product(
        pool: &PgPool,
        seller_id: Uuid,
        req: CreateProductRequest,
    ) -> Result<Product, AppError> {
        // Enforce integer rules
        if req.base_price_paise < 0 {
            return Err(AppError::ValidationError(
                "Price cannot be negative".to_string(),
            ));
        }

        let product_id = Uuid::new_v4();

        // Generate a unique slug by appending the first 8 chars of the UUID
        let base_slug = slugify(&req.title);
        let slug = format!("{}-{}", base_slug, &product_id.to_string()[..8]);
        let asset_type = req
            .asset_type
            .unwrap_or_else(|| "code_boilerplate".to_string());

        // Insert into database
        let product = MarketplaceRepository::create_product(
            pool,
            product_id,
            seller_id,
            &req.title,
            &slug,
            req.summary.as_deref(),
            req.description.as_deref(),
            &asset_type,
            req.base_price_paise,
            req.demo_url.as_deref(),
            req.github_repo_url.as_deref(),
        )
        .await?;

        Ok(product)
    }

    pub async fn get_product(pool: &PgPool, slug: &str) -> Result<Product, AppError> {
        MarketplaceRepository::get_product_by_slug(pool, slug).await
    }

    pub async fn get_my_products(pool: &PgPool, seller_id: Uuid) -> Result<Vec<Product>, AppError> {
        MarketplaceRepository::list_seller_products(pool, seller_id).await
    }

    pub async fn list_catalog(
        pool: &PgPool,
        query: CatalogQuery,
    ) -> Result<CatalogResponse, AppError> {
        let page = query.page.unwrap_or(1).max(1);
        let limit = query.limit.unwrap_or(20).clamp(1, 100);
        let offset = (page - 1) * limit;

        let (items, total) = MarketplaceRepository::list_catalog(
            pool,
            query.q.as_deref(),
            query.asset_type.as_deref(),
            query.sort.as_deref(),
            offset,
            limit,
        )
        .await?;

        Ok(CatalogResponse {
            products: items,
            total,
            page,
            limit,
        })
    }

    pub async fn publish_product(
        pool: &PgPool,
        product_id: Uuid,
        seller_id: Uuid,
    ) -> Result<Product, AppError> {
        MarketplaceRepository::publish_product(pool, product_id, seller_id).await
    }
}
