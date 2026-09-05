use sqlx::PgPool;
use uuid::Uuid;

use crate::errors::AppError;
use super::models::Product;

pub struct MarketplaceRepository;

impl MarketplaceRepository {
    pub async fn create_product(
        pool: &PgPool,
        id: Uuid,
        seller_id: Uuid,
        title: &str,
        slug: &str,
        description: Option<&str>,
        base_price_paise: i64,
    ) -> Result<Product, AppError> {
        let product = sqlx::query_as::<_, Product>(
            r#"
            INSERT INTO products (id, seller_id, title, slug, description, base_price_paise, status)
            VALUES ($1, $2, $3, $4, $5, $6, 'draft')
            RETURNING id, seller_id, title, slug, description, base_price_paise, status, created_at, updated_at
            "#
        )
        .bind(id)
        .bind(seller_id)
        .bind(title)
        .bind(slug)
        .bind(description)
        .bind(base_price_paise)
        .fetch_one(pool)
        .await
        ?;

        Ok(product)
    }

    pub async fn get_product_by_slug(pool: &PgPool, slug: &str) -> Result<Product, AppError> {
        let product = sqlx::query_as::<_, Product>(
            r#"
            SELECT id, seller_id, title, slug, description, base_price_paise, status, created_at, updated_at
            FROM products
            WHERE slug = $1
            "#
        )
        .bind(slug)
        .fetch_optional(pool)
        .await
        ?;

        match product {
            Some(p) => Ok(p),
            None => Err(AppError::NotFound("Product not found".to_string())),
        }
    }

    pub async fn list_seller_products(pool: &PgPool, seller_id: Uuid) -> Result<Vec<Product>, AppError> {
        let products = sqlx::query_as::<_, Product>(
            r#"
            SELECT id, seller_id, title, slug, description, base_price_paise, status, created_at, updated_at
            FROM products
            WHERE seller_id = $1
            ORDER BY created_at DESC
            "#
        )
        .bind(seller_id)
        .fetch_all(pool)
        .await
        ?;

        Ok(products)
    }
}
