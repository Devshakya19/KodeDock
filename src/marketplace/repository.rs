use sqlx::PgPool;
use crate::marketplace::errors::MarketplaceError;
use crate::marketplace::models::{ProductDetailsRow, ProductSummaryRow};

pub async fn fetch_active_products(pool: &PgPool) -> Result<Vec<ProductSummaryRow>, MarketplaceError> {
    let products = sqlx::query_as::<_, ProductSummaryRow>(
        r#"
        SELECT
            p.id, p.title, p.slug, p.price_paise, p.original_price_paise, p.image_url,
            CAST(p.rating AS REAL) as rating, p.review_count, p.sales_count,
            prof.github_username as seller_username,
            c.name as category_name
        FROM products p
        JOIN profiles prof ON p.seller_id = prof.id
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.status = 'active'
        ORDER BY p.created_at DESC
        LIMIT 50
        "#,
    )
    .fetch_all(pool)
    .await?;

    Ok(products)
}

pub async fn fetch_product_by_slug(pool: &PgPool, slug: &str) -> Result<Option<ProductDetailsRow>, MarketplaceError> {
    let product = sqlx::query_as::<_, ProductDetailsRow>(
        r#"
        SELECT
            p.id, p.title, p.slug, p.description, p.long_description, p.price_paise, p.original_price_paise,
            p.tags, p.tech_stack, p.demo_url, p.github_repo_url, p.image_url,
            CAST(p.rating AS REAL) as rating, p.review_count, p.sales_count, p.updated_at,
            prof.github_username as seller_username, prof.avatar_url as seller_avatar,
            c.name as category_name
        FROM products p
        JOIN profiles prof ON p.seller_id = prof.id
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.slug = $1 AND p.status = 'active'
        "#,
    )
    .bind(slug)
    .fetch_optional(pool)
    .await?;

    Ok(product)
}
