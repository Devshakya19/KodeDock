use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;
use chrono::{DateTime, Utc};

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Product {
    pub id: Uuid,
    pub seller_id: Uuid,
    pub title: String,
    pub slug: String,
    pub description: Option<String>,
    pub base_price_paise: i64,
    pub status: String,
    // Note: search_embedding is excluded from the standard JSON payload
    // since it's an internal pgvector array.
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateProductRequest {
    pub title: String,
    pub description: Option<String>,
    pub base_price_paise: i64,
    // tags and categories to be added in detailed phases
}

#[derive(Debug, Deserialize)]
pub struct UpdateProductRequest {
    pub title: Option<String>,
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
