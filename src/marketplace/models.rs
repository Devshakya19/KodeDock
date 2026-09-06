use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, FromRow, Clone)]
pub struct Product {
    pub id: Uuid,
    pub seller_id: Uuid,
    pub category_id: Option<Uuid>,
    pub title: String,
    pub slug: String,
    pub summary: Option<String>,
    pub description: Option<String>,
    pub asset_type: Option<String>,
    pub base_price_paise: i64,
    pub currency: Option<String>,
    pub demo_url: Option<String>,
    pub github_repo_url: Option<String>,
    pub status: String,
    pub is_verified: Option<bool>,
    pub sales_count: Option<i32>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, FromRow, Clone)]
pub struct CatalogProductItem {
    pub id: Uuid,
    pub seller_id: Uuid,
    pub title: String,
    pub slug: String,
    pub summary: Option<String>,
    pub asset_type: Option<String>,
    pub base_price_paise: i64,
    pub status: String,
    pub is_verified: Option<bool>,
    pub sales_count: Option<i32>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CatalogQuery {
    pub q: Option<String>,
    pub asset_type: Option<String>,
    pub sort: Option<String>, // "newest", "price_asc", "price_desc", "popular"
    pub page: Option<i64>,
    pub limit: Option<i64>,
}

#[derive(Debug, Serialize)]
pub struct CatalogResponse {
    pub products: Vec<CatalogProductItem>,
    pub total: i64,
    pub page: i64,
    pub limit: i64,
}

#[derive(Debug, Deserialize)]
pub struct CreateProductRequest {
    pub title: String,
    pub summary: Option<String>,
    pub description: Option<String>,
    pub asset_type: Option<String>,
    pub base_price_paise: i64,
    pub demo_url: Option<String>,
    pub github_repo_url: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateProductRequest {
    pub title: Option<String>,
    pub summary: Option<String>,
    pub description: Option<String>,
    pub base_price_paise: Option<i64>,
    pub status: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct Category {
    pub id: Uuid,
    pub name: String,
    pub slug: String,
    pub parent_id: Option<Uuid>,
}
