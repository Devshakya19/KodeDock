use sqlx::PgPool;
use uuid::Uuid;
use slug::slugify;

use crate::errors::AppError;
use super::models::{CreateProductRequest, Product};
use super::repository::MarketplaceRepository;

pub struct MarketplaceService;

impl MarketplaceService {
    pub async fn create_product(
        pool: &PgPool,
        seller_id: Uuid,
        req: CreateProductRequest,
    ) -> Result<Product, AppError> {
        // Enforce integer rules
        if req.base_price_paise < 0 {
            return Err(AppError::ValidationError("Price cannot be negative".to_string()));
        }

        let product_id = Uuid::new_v4();
        
        // Generate a unique slug by appending the first 8 chars of the UUID
        let base_slug = slugify(&req.title);
        let slug = format!("{}-{}", base_slug, &product_id.to_string()[..8]);

        // Insert into database
        let product = MarketplaceRepository::create_product(
            pool,
            product_id,
            seller_id,
            &req.title,
            &slug,
            req.description.as_deref(),
            req.base_price_paise,
        ).await?;

        // TODO: In the future, publish `ProductCreatedEvent` to Redis Event Bus here
        // so that the background worker can generate AI Vector Embeddings.

        Ok(product)
    }

    pub async fn get_product(pool: &PgPool, slug: &str) -> Result<Product, AppError> {
        MarketplaceRepository::get_product_by_slug(pool, slug).await
    }

    pub async fn get_my_products(pool: &PgPool, seller_id: Uuid) -> Result<Vec<Product>, AppError> {
        MarketplaceRepository::list_seller_products(pool, seller_id).await
    }
}
