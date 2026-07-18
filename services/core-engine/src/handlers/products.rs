use actix_web::{web, HttpResponse};
use sqlx::PgPool;
use crate::models::PublicProduct;
use crate::services::ApiResponse;

#[derive(serde::Deserialize)]
pub struct ListProductsQuery {
    pub sort: Option<String>,
    pub category: Option<String>,
    pub search: Option<String>,
    pub page: Option<u32>,
    pub limit: Option<u32>,
}

/// Explicit column list for public product queries.
///
/// We never `SELECT *` for public product views — the seller's
/// `github_repo_url` and `github_repo_id` columns are intentionally omitted
/// so they cannot leak (e.g. via accidental logging or future serde changes).
const PUBLIC_PRODUCT_COLUMNS: &str = "p.id, p.seller_id, p.category_id, c.name as category_name, p.title, p.slug, p.description, p.long_description, p.price_paise, p.original_price_paise, p.tags, p.status, p.preview_url, p.image_url, p.demo_url, p.tech_stack, p.sales_count, p.view_count, p.rating, p.review_count, p.is_featured, p.created_at, p.updated_at";

pub async fn list_products(
    pool: web::Data<PgPool>,
    query: web::Query<ListProductsQuery>,
) -> HttpResponse {
    let sort = query.sort.as_deref().unwrap_or("newest");
    let page = query.page.unwrap_or(1).max(1);
    let limit = query.limit.unwrap_or(20).min(100).max(1);
    let offset = (page - 1) * limit;

    // Build parameterized query
    let mut sql = String::from("SELECT ");
    sql.push_str(PUBLIC_PRODUCT_COLUMNS);
    sql.push_str(" FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.status = 'active'");
    let mut bind_index = 1;

    if query.category.is_some() {
        sql.push_str(&format!(" AND p.category_id::text LIKE ${}", bind_index));
        bind_index += 1;
    }

    if query.search.is_some() {
        sql.push_str(&format!(
            " AND (title ILIKE ${} OR description ILIKE ${})",
            bind_index, bind_index + 1
        ));
    }

    // Sort
    match sort {
        "price_low" => sql.push_str(" ORDER BY p.price_paise ASC"),
        "price_high" => sql.push_str(" ORDER BY p.price_paise DESC"),
        "rating" => sql.push_str(" ORDER BY p.rating DESC"),
        "popular" => sql.push_str(" ORDER BY p.sales_count DESC"),
        _ => sql.push_str(" ORDER BY p.created_at DESC"),
    }

    sql.push_str(&format!(" LIMIT {} OFFSET {}", limit, offset));

    // Bind parameters
    let mut query_builder = sqlx::query_as::<_, PublicProduct>(&sql);

    if let Some(ref cat) = query.category {
        let pattern = format!("%{}%", cat);
        query_builder = query_builder.bind(pattern);
    }

    if let Some(ref s) = query.search {
        let pattern = format!("%{}%", s);
        query_builder = query_builder.bind(pattern.clone()).bind(pattern);
    }

    match query_builder.fetch_all(pool.get_ref()).await {
        Ok(products) => HttpResponse::Ok().json(ApiResponse::success(products, "Products fetched")),
        Err(e) => {
            log::error!("Failed to fetch products: {}", e);
            HttpResponse::InternalServerError().json(ApiResponse::<()>::error("Failed to fetch products"))
        }
    }
}

pub async fn get_product(
    pool: web::Data<PgPool>,
    path: web::Path<String>,
) -> HttpResponse {
    let id = match uuid::Uuid::parse_str(&path.into_inner()) {
        Ok(uuid) => uuid,
        Err(_) => return HttpResponse::BadRequest().json(ApiResponse::<()>::error("Invalid product ID")),
    };

    // Increment view count
    let _ = sqlx::query("UPDATE products SET view_count = view_count + 1 WHERE id = $1")
        .bind(id)
        .execute(pool.get_ref())
        .await;

    let sql = format!(
        "SELECT {} FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = $1",
        PUBLIC_PRODUCT_COLUMNS
    );
    match sqlx::query_as::<_, PublicProduct>(&sql)
        .bind(id)
        .fetch_optional(pool.get_ref())
        .await
    {
        Ok(Some(product)) => HttpResponse::Ok().json(ApiResponse::success(product, "Product fetched")),
        Ok(None) => HttpResponse::NotFound().json(ApiResponse::<()>::error("Product not found")),
        Err(e) => {
            log::error!("Failed to fetch product: {}", e);
            HttpResponse::InternalServerError().json(ApiResponse::<()>::error("Failed to fetch product"))
        }
    }
}
