use actix_web::{web, HttpResponse};
use sqlx::PgPool;
use crate::models::Product;
use crate::services::ApiResponse;

pub async fn list_products(
    pool: web::Data<PgPool>,
    query: web::Query<std::collections::HashMap<String, String>>,
) -> HttpResponse {
    let sort = query.get("sort").map(|s| s.as_str()).unwrap_or("newest");
    let category = query.get("category");
    let search = query.get("search");

    // Build parameterized query
    let mut sql = String::from("SELECT * FROM products WHERE status = 'active'");
    let mut bind_index = 1;

    if category.is_some() {
        sql.push_str(&format!(" AND category_id::text LIKE ${}", bind_index));
        bind_index += 1;
    }

    if search.is_some() {
        sql.push_str(&format!(
            " AND (title ILIKE ${} OR description ILIKE ${})",
            bind_index, bind_index + 1
        ));
    }

    // Sort
    match sort {
        "price_low" => sql.push_str(" ORDER BY price_paise ASC"),
        "price_high" => sql.push_str(" ORDER BY price_paise DESC"),
        "rating" => sql.push_str(" ORDER BY rating DESC"),
        "popular" => sql.push_str(" ORDER BY sales_count DESC"),
        _ => sql.push_str(" ORDER BY created_at DESC"),
    }

    // Bind parameters
    let mut query_builder = sqlx::query_as::<_, Product>(&sql);

    if let Some(cat) = category {
        let pattern = format!("%{}%", cat);
        query_builder = query_builder.bind(pattern);
    }

    if let Some(s) = search {
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

    match sqlx::query_as::<_, Product>("SELECT * FROM products WHERE id = $1")
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
