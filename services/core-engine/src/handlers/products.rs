use actix_web::{web, HttpRequest, HttpResponse};
use sqlx::PgPool;
use crate::models::PublicProduct;
use crate::services::ApiResponse;
use crate::middleware::extract_user_id;

#[derive(serde::Deserialize)]
pub struct ListProductsQuery {
    pub sort: Option<String>,
    pub category: Option<String>,
    pub search: Option<String>,
    pub page: Option<u32>,
    pub limit: Option<u32>,
}

const PUBLIC_PRODUCT_COLUMNS: &str = "p.id, p.seller_id, u.full_name as seller_name, p.category_id, c.name as category_name, p.title, p.slug, p.description, p.long_description, p.price_paise, p.original_price_paise, p.tags, p.status, p.stock_limit, p.preview_url, p.image_url, p.demo_url, p.tech_stack, p.sales_count, p.view_count, p.rating, p.review_count, p.is_featured, p.created_at, p.updated_at";

pub async fn list_products(
    pool: web::Data<PgPool>,
    query: web::Query<ListProductsQuery>,
) -> HttpResponse {
    let sort = query.sort.as_deref().unwrap_or("newest");
    let page = query.page.unwrap_or(1).max(1);
    let limit = query.limit.unwrap_or(20).clamp(1, 100);
    let offset = (page as u64 - 1) * (limit as u64);

    let mut sql = String::from("SELECT ");
    sql.push_str(PUBLIC_PRODUCT_COLUMNS);
    sql.push_str(" FROM products p LEFT JOIN categories c ON p.category_id = c.id LEFT JOIN users u ON p.seller_id = u.id WHERE (p.status = 'active' OR p.status = 'limited')");
    let mut bind_index = 1;

    if query.category.is_some() {
        sql.push_str(&format!(" AND c.slug = ${}", bind_index));
        bind_index += 1;
    }

    if query.search.is_some() {
        sql.push_str(&format!(
            " AND (title ILIKE ${} OR description ILIKE ${})",
            bind_index, bind_index + 1
        ));
        bind_index += 2;
    }

    match sort {
        "price_low" => sql.push_str(" ORDER BY p.price_paise ASC"),
        "price_high" => sql.push_str(" ORDER BY p.price_paise DESC"),
        "rating" => sql.push_str(" ORDER BY p.rating DESC"),
        "popular" => sql.push_str(" ORDER BY p.sales_count DESC"),
        _ => sql.push_str(" ORDER BY p.created_at DESC"),
    }

    sql.push_str(&format!(" LIMIT ${} OFFSET ${}", bind_index, bind_index + 1));

    let mut query_builder = sqlx::query_as::<_, PublicProduct>(&sql);

    if let Some(ref cat) = query.category {
        query_builder = query_builder.bind(cat.clone());
    }

    if let Some(ref s) = query.search {
        let search_pattern = format!("%{}%", s);
        query_builder = query_builder.bind(search_pattern.clone()).bind(search_pattern);
    }

    query_builder = query_builder.bind(limit as i64).bind(offset as i64);

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
    req: HttpRequest,
    path: web::Path<String>,
) -> HttpResponse {
    let id = match uuid::Uuid::parse_str(&path.into_inner()) {
        Ok(uuid) => uuid,
        Err(_) => return HttpResponse::BadRequest().json(ApiResponse::<()>::error("Invalid product ID")),
    };

    // Track unique views per user (not per request)
    // Try to get user ID from token; if not logged in, use IP-based tracking
    let user_id = extract_user_id(&req).ok();

    if let Some(ref uid) = user_id {
        if let Ok(user_uuid) = uuid::Uuid::parse_str(uid) {
            // Atomically record view — INSERT ON CONFLICT DO NOTHING returns
            // rows_affected=1 only for genuinely new views, preventing double-counting.
            let inserted = sqlx::query(
                "INSERT INTO product_views (product_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING"
            )
            .bind(id)
            .bind(user_uuid)
            .execute(pool.get_ref())
            .await;

            if let Ok(result) = inserted {
                if result.rows_affected() > 0 {
                    let _ = sqlx::query("UPDATE products SET view_count = view_count + 1 WHERE id = $1")
                        .bind(id)
                        .execute(pool.get_ref())
                        .await;
                }
            }
        }
    }

    let sql = format!(
        "SELECT {} FROM products p LEFT JOIN categories c ON p.category_id = c.id LEFT JOIN users u ON p.seller_id = u.id WHERE p.id = $1",
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
