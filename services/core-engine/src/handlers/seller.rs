use actix_web::{web, HttpRequest, HttpResponse};
use sqlx::PgPool;
use crate::models::{Product, CreateProductRequest, UpdateProductRequest, SellerStats};
use crate::services::ApiResponse;
use crate::middleware::require_developer;
use crate::storage::StorageClient;

pub async fn create_product(
    pool: web::Data<PgPool>,
    req: HttpRequest,
    body: web::Json<CreateProductRequest>,
) -> HttpResponse {
    let seller_id = match require_developer(&req) {
        Ok(id) => id,
        Err(resp) => return resp,
    };

    let seller_uuid = match uuid::Uuid::parse_str(&seller_id) {
        Ok(uuid) => uuid,
        Err(_) => return HttpResponse::BadRequest().json(ApiResponse::<()>::error("Invalid seller ID")),
    };

    // Validate input lengths
    if body.title.len() > 200 {
        return HttpResponse::BadRequest().json(ApiResponse::<()>::error("Title must be 200 characters or less"));
    }
    if let Some(ref desc) = body.description {
        if desc.len() > 5000 {
            return HttpResponse::BadRequest().json(ApiResponse::<()>::error("Description must be 5000 characters or less"));
        }
    }
    if let Some(ref long_desc) = body.long_description {
        if long_desc.len() > 5000 {
            return HttpResponse::BadRequest().json(ApiResponse::<()>::error("Long description must be 5000 characters or less"));
        }
    }

    // Validate numerical boundaries (Security Fix)
    if body.price_paise < 0 {
        return HttpResponse::BadRequest().json(ApiResponse::<()>::error("Price cannot be negative"));
    }
    if let Some(orig_price) = body.original_price_paise {
        if orig_price < body.price_paise {
            return HttpResponse::BadRequest().json(ApiResponse::<()>::error("Original price must be greater than or equal to current price"));
        }
    }
    if let Some(stock) = body.stock_limit {
        if stock < 1 {
            return HttpResponse::BadRequest().json(ApiResponse::<()>::error("Stock limit must be at least 1"));
        }
    }

    // Generate unique slug: strip special chars, replace spaces, append UUID suffix
    let base_slug: String = body.title
        .to_lowercase()
        .chars()
        .filter(|c| c.is_alphanumeric() || *c == ' ')
        .collect::<String>()
        .split_whitespace()
        .collect::<Vec<_>>()
        .join("-");
    let short_id = &uuid::Uuid::new_v4().to_string()[..8];
    let slug = format!("{}-{}", base_slug, short_id);

    // Validate image_url if provided — must be from our storage or empty
    if let Some(ref url) = body.image_url {
        let s3_public_url = std::env::var("S3_PUBLIC_URL").unwrap_or_default();
        if !s3_public_url.is_empty() && !url.starts_with(&s3_public_url) {
            return HttpResponse::BadRequest().json(ApiResponse::<()>::error("Invalid image URL"));
        }
    }

    // Handle category_id - could be UUID or category name
    let category_id = match &body.category_id {
        Some(val) => {
            // Check if it's a UUID
            if let Ok(uuid) = uuid::Uuid::parse_str(val) {
                Some(uuid)
            } else {
                // Look up by name
                match sqlx::query_scalar::<_, uuid::Uuid>("SELECT id FROM categories WHERE name = $1")
                    .bind(val)
                    .fetch_optional(pool.get_ref())
                    .await
                {
                    Ok(Some(uuid)) => Some(uuid),
                    _ => None,
                }
            }
        }
        None => None,
    };

    let product_status = body.status.clone().unwrap_or_else(|| "active".to_string());

    match sqlx::query_as::<_, Product>(
        r#"INSERT INTO products (seller_id, title, slug, description, long_description, price_paise, original_price_paise, category_id, tags, github_repo_url, image_url, demo_url, tech_stack, status, stock_limit)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
           RETURNING *, (SELECT name FROM categories WHERE id = category_id) as category_name"#
    )
    .bind(seller_uuid)
    .bind(&body.title)
    .bind(&slug)
    .bind(&body.description)
    .bind(&body.long_description)
    .bind(body.price_paise)
    .bind(body.original_price_paise)
    .bind(category_id)
    .bind(&body.tags)
    .bind(&body.github_repo_url)
    .bind(&body.image_url)
    .bind(&body.demo_url)
    .bind(&body.tech_stack)
    .bind(&product_status)
    .bind(body.stock_limit)
    .fetch_one(pool.get_ref())
    .await
    {
        Ok(product) => HttpResponse::Ok().json(ApiResponse::success(product, "Product created")),
        Err(e) => {
            log::error!("Failed to create product: {}", e);
            HttpResponse::InternalServerError().json(ApiResponse::<()>::error("Failed to create product"))
        }
    }
}

pub async fn list_seller_products(
    pool: web::Data<PgPool>,
    req: HttpRequest,
) -> HttpResponse {
    let seller_id = match require_developer(&req) {
        Ok(id) => id,
        Err(resp) => return resp,
    };

    let seller_uuid = match uuid::Uuid::parse_str(&seller_id) {
        Ok(uuid) => uuid,
        Err(_) => return HttpResponse::BadRequest().json(ApiResponse::<()>::error("Invalid seller ID")),
    };

    match sqlx::query_as::<_, Product>(
        "SELECT p.id, p.seller_id, p.category_id, c.name as category_name, p.title, p.slug, p.description, p.long_description, p.price_paise, p.original_price_paise, p.tags, p.status, p.stock_limit, p.github_repo_url, p.github_repo_id, p.preview_url, p.image_url, p.demo_url, p.tech_stack, p.sales_count, p.view_count, p.rating, p.review_count, p.is_featured, p.created_at, p.updated_at FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.seller_id = $1 AND p.status != 'archived' ORDER BY p.created_at DESC"
    )
        .bind(seller_uuid)
        .fetch_all(pool.get_ref())
        .await
    {
        Ok(products) => HttpResponse::Ok().json(ApiResponse::success(products, "Products fetched")),
        Err(e) => {
            log::error!("Failed to fetch seller products: {}", e);
            HttpResponse::InternalServerError().json(ApiResponse::<()>::error("Failed to fetch products"))
        }
    }
}

pub async fn update_product(
    pool: web::Data<PgPool>,
    req: HttpRequest,
    path: web::Path<String>,
    body: web::Json<UpdateProductRequest>,
) -> HttpResponse {
    let seller_id = match require_developer(&req) {
        Ok(id) => id,
        Err(resp) => return resp,
    };

    let seller_uuid = match uuid::Uuid::parse_str(&seller_id) {
        Ok(uuid) => uuid,
        Err(_) => return HttpResponse::BadRequest().json(ApiResponse::<()>::error("Invalid seller ID")),
    };

    let id = match uuid::Uuid::parse_str(&path.into_inner()) {
        Ok(uuid) => uuid,
        Err(_) => return HttpResponse::BadRequest().json(ApiResponse::<()>::error("Invalid product ID")),
    };

    // Verify ownership and fetch current price
    let current_price = match sqlx::query_scalar::<_, i32>("SELECT price_paise FROM products WHERE id = $1 AND seller_id = $2")
        .bind(id)
        .bind(seller_uuid)
        .fetch_optional(pool.get_ref())
        .await
    {
        Ok(Some(price)) => price,
        Ok(None) => return HttpResponse::NotFound().json(ApiResponse::<()>::error("Product not found or not owned by you")),
        Err(e) => {
            log::error!("Failed to verify ownership: {}", e);
            return HttpResponse::InternalServerError().json(ApiResponse::<()>::error("Database error"));
        }
    };

    // Validate numerical boundaries (Security Fix)
    if let Some(price) = body.price_paise {
        if price < 0 {
            return HttpResponse::BadRequest().json(ApiResponse::<()>::error("Price cannot be negative"));
        }
    }
    if let Some(orig_price) = body.original_price_paise {
        let reference_price = body.price_paise.unwrap_or(current_price);
        if orig_price < reference_price {
            return HttpResponse::BadRequest().json(ApiResponse::<()>::error("Original price cannot be less than current price"));
        }
    }
    if let Some(stock) = body.stock_limit {
        if stock < 1 {
            return HttpResponse::BadRequest().json(ApiResponse::<()>::error("Stock limit must be at least 1"));
        }
    }

    // Resolve category_id: support both UUID and name lookup (same as create_product)
    let resolved_category_id = match &body.category_id {
        Some(val) => {
            if let Ok(uuid) = uuid::Uuid::parse_str(val) {
                Some(uuid)
            } else {
                sqlx::query_scalar::<_, uuid::Uuid>("SELECT id FROM categories WHERE name = $1")
                    .bind(val)
                    .fetch_optional(pool.get_ref())
                    .await
                    .unwrap_or(None)
            }
        }
        None => None,
    };

    // Do the UPDATE first (can't return category_name from UPDATE since it's not a column)
    let update_result = sqlx::query(
        r#"UPDATE products SET
           title = COALESCE($2, title),
           description = COALESCE($3, description),
           long_description = COALESCE($4, long_description),
           price_paise = COALESCE($5, price_paise),
           original_price_paise = COALESCE($6, original_price_paise),
           category_id = COALESCE($7, category_id),
           tags = COALESCE($8, tags),
           status = COALESCE($9, status),
           github_repo_url = COALESCE($10, github_repo_url),
           image_url = COALESCE($11, image_url),
           demo_url = COALESCE($12, demo_url),
           tech_stack = COALESCE($13, tech_stack),
           stock_limit = COALESCE($14, stock_limit),
           updated_at = NOW()
           WHERE id = $1 RETURNING id"#,
    )
    .bind(id)
    .bind(&body.title)
    .bind(&body.description)
    .bind(&body.long_description)
    .bind(body.price_paise)
    .bind(body.original_price_paise)
    .bind(resolved_category_id)
    .bind(&body.tags)
    .bind(&body.status)
    .bind(&body.github_repo_url)
    .bind(&body.image_url)
    .bind(&body.demo_url)
    .bind(&body.tech_stack)
    .bind(body.stock_limit)
    .fetch_optional(pool.get_ref())
    .await;

    match update_result {
        Ok(Some(_)) => {
            // Now fetch the updated product with category name via JOIN
            match sqlx::query_as::<_, Product>(
                "SELECT p.id, p.seller_id, p.category_id, c.name as category_name, p.title, p.slug, p.description, p.long_description, p.price_paise, p.original_price_paise, p.tags, p.status, p.stock_limit, p.github_repo_url, p.github_repo_id, p.preview_url, p.image_url, p.demo_url, p.tech_stack, p.sales_count, p.view_count, p.rating, p.review_count, p.is_featured, p.created_at, p.updated_at FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = $1"
            )
            .bind(id)
            .fetch_optional(pool.get_ref())
            .await
            {
                Ok(Some(product)) => HttpResponse::Ok().json(ApiResponse::success(product, "Product updated")),
                Ok(None) => HttpResponse::NotFound().json(ApiResponse::<()>::error("Product not found")),
                Err(e) => {
                    log::error!("Failed to fetch updated product: {}", e);
                    HttpResponse::InternalServerError().json(ApiResponse::<()>::error("Failed to fetch updated product"))
                }
            }
        }
        Ok(None) => HttpResponse::NotFound().json(ApiResponse::<()>::error("Product not found")),
        Err(e) => {
            log::error!("Failed to update product: {}", e);
            HttpResponse::InternalServerError().json(ApiResponse::<()>::error("Failed to update product"))
        }
    }
}

pub async fn delete_product(
    pool: web::Data<PgPool>,
    storage: web::Data<StorageClient>,
    req: HttpRequest,
    path: web::Path<String>,
) -> HttpResponse {
    let seller_id = match require_developer(&req) {
        Ok(id) => id,
        Err(resp) => return resp,
    };

    let seller_uuid = match uuid::Uuid::parse_str(&seller_id) {
        Ok(uuid) => uuid,
        Err(_) => return HttpResponse::BadRequest().json(ApiResponse::<()>::error("Invalid seller ID")),
    };

    let id = match uuid::Uuid::parse_str(&path.into_inner()) {
        Ok(uuid) => uuid,
        Err(_) => return HttpResponse::BadRequest().json(ApiResponse::<()>::error("Invalid product ID")),
    };

    // Verify ownership before deletion
    match sqlx::query_scalar::<_, uuid::Uuid>("SELECT seller_id FROM products WHERE id = $1")
        .bind(id)
        .fetch_optional(pool.get_ref())
        .await
    {
        Ok(Some(owner_id)) if owner_id == seller_uuid => {}
        Ok(_) => return HttpResponse::NotFound().json(ApiResponse::<()>::error("Product not found")),
        Err(e) => {
            log::error!("Failed to verify ownership: {}", e);
            return HttpResponse::InternalServerError().json(ApiResponse::<()>::error("Database error"));
        }
    }

    let order_count = sqlx::query_scalar::<_, i64>("SELECT COUNT(*) FROM orders WHERE product_id = $1")
        .bind(id)
        .fetch_one(pool.get_ref())
        .await
        .unwrap_or(0);

    if order_count > 0 {
        // Soft delete (archive) because there are existing orders
        match sqlx::query("UPDATE products SET status = 'archived' WHERE id = $1")
            .bind(id)
            .execute(pool.get_ref())
            .await
        {
            Ok(_) => HttpResponse::Ok().json(ApiResponse::<()> {
                success: true,
                data: None,
                message: Some("Product archived".to_string()),
                error: None,
            }),
            Err(e) => {
                log::error!("Failed to archive product: {}", e);
                HttpResponse::InternalServerError().json(ApiResponse::<()>::error("Failed to archive product"))
            }
        }
    } else {
        // Hard delete and clean up image
        if let Ok(Some(image_url)) = sqlx::query_scalar::<_, String>(
            "SELECT image_url FROM products WHERE id = $1 AND image_url IS NOT NULL"
        )
        .bind(id)
        .fetch_optional(pool.get_ref())
        .await
        {
            if let Some(key) = storage.extract_key_from_url(&image_url) {
                if let Err(e) = storage.delete_object(&key).await {
                    log::warn!("Failed to delete product image from storage: {}", e);
                }
            }
        }

        match sqlx::query("DELETE FROM products WHERE id = $1")
            .bind(id)
            .execute(pool.get_ref())
            .await
        {
            Ok(_) => HttpResponse::Ok().json(ApiResponse::<()> {
                success: true,
                data: None,
                message: Some("Product deleted".to_string()),
                error: None,
            }),
            Err(e) => {
                log::error!("Failed to delete product: {}", e);
                HttpResponse::InternalServerError().json(ApiResponse::<()>::error("Failed to delete product"))
            }
        }
    }
}

pub async fn get_stats(
    pool: web::Data<PgPool>,
    req: HttpRequest,
) -> HttpResponse {
    let seller_id = match require_developer(&req) {
        Ok(id) => id,
        Err(resp) => return resp,
    };

    let seller_uuid = match uuid::Uuid::parse_str(&seller_id) {
        Ok(uuid) => uuid,
        Err(_) => return HttpResponse::BadRequest().json(ApiResponse::<()>::error("Invalid seller ID")),
    };

    // Single query for all stats
    let row = sqlx::query_as::<_, (i64, i64, i64, Option<i64>, i64, i64)>(r#"
        SELECT
            (SELECT COUNT(*)::bigint FROM products WHERE seller_id = $1) as total_products,
            (SELECT COUNT(*)::bigint FROM products WHERE seller_id = $1 AND status = 'active') as active_products,
            (SELECT COUNT(*)::bigint FROM orders WHERE seller_id = $1 AND status = 'completed') as total_sales,
            (SELECT COALESCE(SUM(seller_amount_paise), 0)::bigint FROM orders WHERE seller_id = $1 AND status = 'completed') as total_revenue,
            (SELECT COALESCE(SUM(view_count), 0)::bigint FROM products WHERE seller_id = $1) as total_views,
            (SELECT COALESCE(SUM(review_count), 0)::bigint FROM products WHERE seller_id = $1) as total_reviews
    "#)
    .bind(seller_uuid)
    .fetch_one(pool.get_ref())
    .await;

    let (total_products, active_products, total_sales, total_revenue, total_views, total_reviews) = row.unwrap_or((0, 0, 0, Some(0), 0, 0));
    let total_revenue = total_revenue.unwrap_or(0);

    let stats = SellerStats {
        total_products,
        active_products,
        total_sales,
        total_revenue_paise: total_revenue,
        total_earned_paise: total_revenue,
        total_views,
        total_reviews,
    };

    HttpResponse::Ok().json(ApiResponse::success(stats, "Stats fetched"))
}

pub async fn get_seller_reviews(
    pool: web::Data<PgPool>,
    req: HttpRequest,
) -> HttpResponse {
    let seller_id = match require_developer(&req) {
        Ok(id) => id,
        Err(resp) => return resp,
    };

    let seller_uuid = match uuid::Uuid::parse_str(&seller_id) {
        Ok(uuid) => uuid,
        Err(_) => return HttpResponse::BadRequest().json(ApiResponse::<()>::error("Invalid seller ID")),
    };

    match sqlx::query_as::<_, crate::models::SellerReviewItem>(
        r#"SELECT r.id, r.product_id, p.title as product_title, r.user_id,
                  u.full_name as user_name, u.avatar_url as user_avatar,
                  r.rating, r.title, r.comment, r.created_at
           FROM reviews r
           JOIN products p ON r.product_id = p.id
           LEFT JOIN profiles u ON r.user_id = u.id
           WHERE p.seller_id = $1
           ORDER BY r.created_at DESC
           LIMIT 100"#
    )
    .bind(seller_uuid)
    .fetch_all(pool.get_ref())
    .await
    {
        Ok(reviews) => HttpResponse::Ok().json(ApiResponse::success(reviews, "Reviews fetched")),
        Err(e) => {
            log::error!("Failed to fetch seller reviews: {}", e);
            HttpResponse::InternalServerError().json(ApiResponse::<()>::error("Database error"))
        }
    }
}
