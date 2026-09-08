use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProductSummary {
    pub public_id: String,
    pub title: String,
    pub slug: String,
    pub price_paise: i64,
    pub original_price_paise: Option<i64>,
    pub image_url: Option<String>,
    pub rating: f32,
    pub review_count: i32,
    pub sales_count: i32,
    pub seller_username: Option<String>,
    pub category_name: Option<String>,
}

#[derive(Debug, Clone, FromRow)]
pub struct ProductSummaryRow {
    pub id: Uuid,
    pub title: String,
    pub slug: String,
    pub price_paise: i64,
    pub original_price_paise: Option<i64>,
    pub image_url: Option<String>,
    pub rating: Option<f32>,
    pub review_count: Option<i32>,
    pub sales_count: Option<i32>,
    pub seller_username: Option<String>,
    pub category_name: Option<String>,
}

impl ProductSummaryRow {
    pub fn into_summary(self) -> ProductSummary {
        use crate::auth::crypto::encode_public_id;
        ProductSummary {
            public_id: encode_public_id("kd_prd", &self.id),
            title: self.title,
            slug: self.slug,
            price_paise: self.price_paise,
            original_price_paise: self.original_price_paise,
            image_url: self.image_url,
            rating: self.rating.unwrap_or(0.0),
            review_count: self.review_count.unwrap_or(0),
            sales_count: self.sales_count.unwrap_or(0),
            seller_username: self.seller_username,
            category_name: self.category_name,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProductDetails {
    pub public_id: String,
    pub title: String,
    pub slug: String,
    pub description: Option<String>,
    pub long_description: Option<String>,
    pub price_paise: i64,
    pub original_price_paise: Option<i64>,
    pub tags: Vec<String>,
    pub tech_stack: Vec<String>,
    pub demo_url: Option<String>,
    pub github_repo_url: Option<String>,
    pub image_url: Option<String>,
    pub rating: f32,
    pub review_count: i32,
    pub sales_count: i32,
    pub seller_username: Option<String>,
    pub seller_avatar: Option<String>,
    pub category_name: Option<String>,
    pub updated_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, FromRow)]
pub struct ProductDetailsRow {
    pub id: Uuid,
    pub title: String,
    pub slug: String,
    pub description: Option<String>,
    pub long_description: Option<String>,
    pub price_paise: i64,
    pub original_price_paise: Option<i64>,
    pub tags: Option<Vec<String>>,
    pub tech_stack: Option<Vec<String>>,
    pub demo_url: Option<String>,
    pub github_repo_url: Option<String>,
    pub image_url: Option<String>,
    pub rating: Option<f32>,
    pub review_count: Option<i32>,
    pub sales_count: Option<i32>,
    pub seller_username: Option<String>,
    pub seller_avatar: Option<String>,
    pub category_name: Option<String>,
    pub updated_at: Option<DateTime<Utc>>,
}

impl ProductDetailsRow {
    pub fn into_details(self) -> ProductDetails {
        use crate::auth::crypto::encode_public_id;
        ProductDetails {
            public_id: encode_public_id("kd_prd", &self.id),
            title: self.title,
            slug: self.slug,
            description: self.description,
            long_description: self.long_description,
            price_paise: self.price_paise,
            original_price_paise: self.original_price_paise,
            tags: self.tags.unwrap_or_default(),
            tech_stack: self.tech_stack.unwrap_or_default(),
            demo_url: self.demo_url,
            github_repo_url: self.github_repo_url,
            image_url: self.image_url,
            rating: self.rating.unwrap_or(0.0),
            review_count: self.review_count.unwrap_or(0),
            sales_count: self.sales_count.unwrap_or(0),
            seller_username: self.seller_username,
            seller_avatar: self.seller_avatar,
            category_name: self.category_name,
            updated_at: self.updated_at,
        }
    }
}

#[derive(Debug, Serialize)]
pub struct ApiResponse<T> {
    pub success: bool,
    pub data: T,
}
