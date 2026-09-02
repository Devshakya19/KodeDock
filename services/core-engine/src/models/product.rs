use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Product {
    pub id: Uuid,
    pub seller_id: Uuid,
    pub category_id: Option<Uuid>,
    pub category_name: Option<String>,
    pub title: String,
    pub slug: String,
    pub description: Option<String>,
    pub long_description: Option<String>,
    pub price_paise: i32,
    pub original_price_paise: Option<i32>,
    pub tags: Option<Vec<String>>,
    pub status: String,
    pub stock_limit: Option<i32>,
    pub github_repo_url: Option<String>,
    pub github_repo_id: Option<i32>,
    pub preview_url: Option<String>,
    pub image_url: Option<String>,
    pub demo_url: Option<String>,
    pub tech_stack: Option<Vec<String>>,
    pub sales_count: Option<i32>,
    pub view_count: Option<i32>,
    pub rating: Option<f32>,
    pub review_count: Option<i32>,
    pub is_featured: Option<bool>,
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct PublicProduct {
    pub id: Uuid,
    pub seller_id: Uuid,
    pub seller_name: Option<String>,
    pub category_id: Option<Uuid>,
    pub category_name: Option<String>,
    pub title: String,
    pub slug: String,
    pub description: Option<String>,
    pub long_description: Option<String>,
    pub price_paise: i32,
    pub original_price_paise: Option<i32>,
    pub tags: Option<Vec<String>>,
    pub status: String,
    pub stock_limit: Option<i32>,
    pub preview_url: Option<String>,
    pub image_url: Option<String>,
    pub demo_url: Option<String>,
    pub tech_stack: Option<Vec<String>>,
    pub sales_count: Option<i32>,
    pub view_count: Option<i32>,
    pub rating: Option<f32>,
    pub review_count: Option<i32>,
    pub is_featured: Option<bool>,
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
}

impl From<Product> for PublicProduct {
    fn from(p: Product) -> Self {
        PublicProduct {
            id: p.id,
            seller_id: p.seller_id,
            seller_name: None,
            category_id: p.category_id,
            category_name: p.category_name,
            title: p.title,
            slug: p.slug,
            description: p.description,
            long_description: p.long_description,
            price_paise: p.price_paise,
            original_price_paise: p.original_price_paise,
            tags: p.tags,
            status: p.status,
            stock_limit: p.stock_limit,
            preview_url: p.preview_url,
            image_url: p.image_url,
            demo_url: p.demo_url,
            tech_stack: p.tech_stack,
            sales_count: p.sales_count,
            view_count: p.view_count,
            rating: p.rating,
            review_count: p.review_count,
            is_featured: p.is_featured,
            created_at: p.created_at,
            updated_at: p.updated_at,
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateProductRequest {
    pub title: String,
    pub description: Option<String>,
    pub long_description: Option<String>,
    pub price_paise: i32,
    pub original_price_paise: Option<i32>,
    pub category_id: Option<String>,
    pub tags: Option<Vec<String>>,
    pub status: Option<String>,
    pub stock_limit: Option<i32>,
    pub github_repo_url: Option<String>,
    pub image_url: Option<String>,
    pub demo_url: Option<String>,
    pub tech_stack: Option<Vec<String>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateProductRequest {
    pub title: Option<String>,
    pub description: Option<String>,
    pub long_description: Option<String>,
    pub price_paise: Option<i32>,
    pub original_price_paise: Option<i32>,
    pub category_id: Option<String>,
    pub tags: Option<Vec<String>>,
    pub status: Option<String>,
    pub stock_limit: Option<i32>,
    pub github_repo_url: Option<String>,
    pub image_url: Option<String>,
    pub demo_url: Option<String>,
    pub tech_stack: Option<Vec<String>>,
}
