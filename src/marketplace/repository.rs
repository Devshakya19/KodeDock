use sqlx::PgPool;
use uuid::Uuid;

use super::models::{CatalogProductItem, Product};
use crate::errors::AppError;

pub struct MarketplaceRepository;

impl MarketplaceRepository {
    #[allow(clippy::too_many_arguments)]
    pub async fn create_product(
        pool: &PgPool,
        id: Uuid,
        seller_id: Uuid,
        title: &str,
        slug: &str,
        summary: Option<&str>,
        description: Option<&str>,
        asset_type: &str,
        base_price_paise: i64,
        demo_url: Option<&str>,
        github_repo_url: Option<&str>,
    ) -> Result<Product, AppError> {
        let default_summary = summary.unwrap_or(title);

        let product = sqlx::query_as::<_, Product>(
            r#"
            INSERT INTO products (
                id, seller_id, title, slug, summary, description,
                asset_type, base_price_paise, demo_url, github_repo_url, status
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'draft')
            RETURNING
                id, seller_id, category_id, title, slug, summary, description,
                asset_type, base_price_paise, currency, demo_url, github_repo_url,
                status, is_verified, sales_count, created_at, updated_at
            "#,
        )
        .bind(id)
        .bind(seller_id)
        .bind(title)
        .bind(slug)
        .bind(default_summary)
        .bind(description)
        .bind(asset_type)
        .bind(base_price_paise)
        .bind(demo_url)
        .bind(github_repo_url)
        .fetch_one(pool)
        .await?;

        Ok(product)
    }

    pub async fn get_product_by_slug(pool: &PgPool, slug: &str) -> Result<Product, AppError> {
        let product = sqlx::query_as::<_, Product>(
            r#"
            SELECT
                id, seller_id, category_id, title, slug, summary, description,
                asset_type, base_price_paise, currency, demo_url, github_repo_url,
                status, is_verified, sales_count, created_at, updated_at
            FROM products
            WHERE slug = $1
            "#,
        )
        .bind(slug)
        .fetch_optional(pool)
        .await?;

        match product {
            Some(p) => Ok(p),
            None => Err(AppError::NotFound("Product not found".to_string())),
        }
    }

    pub async fn list_seller_products(
        pool: &PgPool,
        seller_id: Uuid,
    ) -> Result<Vec<Product>, AppError> {
        let products = sqlx::query_as::<_, Product>(
            r#"
            SELECT
                id, seller_id, category_id, title, slug, summary, description,
                asset_type, base_price_paise, currency, demo_url, github_repo_url,
                status, is_verified, sales_count, created_at, updated_at
            FROM products
            WHERE seller_id = $1
            ORDER BY created_at DESC
            "#,
        )
        .bind(seller_id)
        .fetch_all(pool)
        .await?;

        Ok(products)
    }

    pub async fn list_catalog(
        pool: &PgPool,
        search: Option<&str>,
        asset_type: Option<&str>,
        sort: Option<&str>,
        offset: i64,
        limit: i64,
    ) -> Result<(Vec<CatalogProductItem>, i64), AppError> {
        let search_pattern = search.map(|s| format!("%{}%", s.to_lowercase()));

        let items = sqlx::query_as::<_, CatalogProductItem>(
            r#"
            SELECT
                id, seller_id, title, slug, summary,
                asset_type, base_price_paise, status, is_verified,
                sales_count, created_at
            FROM products
            WHERE (status = 'published' OR status = 'draft')
              AND ($1::TEXT IS NULL OR LOWER(title) LIKE $1 OR LOWER(summary) LIKE $1)
              AND ($2::TEXT IS NULL OR asset_type = $2)
            ORDER BY
              CASE WHEN $3 = 'price_asc' THEN base_price_paise END ASC,
              CASE WHEN $3 = 'price_desc' THEN base_price_paise END DESC,
              CASE WHEN $3 = 'popular' THEN sales_count END DESC,
              created_at DESC
            LIMIT $4 OFFSET $5
            "#,
        )
        .bind(&search_pattern)
        .bind(asset_type)
        .bind(sort)
        .bind(limit)
        .bind(offset)
        .fetch_all(pool)
        .await?;

        let total_row: (i64,) = sqlx::query_as(
            r#"
            SELECT COUNT(*)
            FROM products
            WHERE (status = 'published' OR status = 'draft')
              AND ($1::TEXT IS NULL OR LOWER(title) LIKE $1 OR LOWER(summary) LIKE $1)
              AND ($2::TEXT IS NULL OR asset_type = $2)
            "#,
        )
        .bind(&search_pattern)
        .bind(asset_type)
        .fetch_one(pool)
        .await?;

        Ok((items, total_row.0))
    }

    pub async fn publish_product(
        pool: &PgPool,
        product_id: Uuid,
        seller_id: Uuid,
    ) -> Result<Product, AppError> {
        let product = sqlx::query_as::<_, Product>(
            r#"
            UPDATE products
            SET status = 'published', updated_at = NOW()
            WHERE id = $1 AND seller_id = $2
            RETURNING
                id, seller_id, category_id, title, slug, summary, description,
                asset_type, base_price_paise, currency, demo_url, github_repo_url,
                status, is_verified, sales_count, created_at, updated_at
            "#,
        )
        .bind(product_id)
        .bind(seller_id)
        .fetch_optional(pool)
        .await?;

        match product {
            Some(p) => Ok(p),
            None => Err(AppError::NotFound(
                "Product not found or unauthorized".to_string(),
            )),
        }
    }
}
