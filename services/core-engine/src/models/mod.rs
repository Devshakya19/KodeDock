use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};
use sqlx::FromRow;

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Profile {
    pub id: Uuid,
    pub full_name: Option<String>,
    pub role: String,
    pub bio: Option<String>,
    pub avatar_url: Option<String>,
    pub github_username: Option<String>,
    #[serde(skip_serializing)]
    #[allow(dead_code)]
    pub github_access_token: Option<String>,
    pub website: Option<String>,
    pub location: Option<String>,
    pub is_verified: bool,
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Product {
    pub id: Uuid,
    pub seller_id: Uuid,
    pub category_id: Option<Uuid>,
    pub title: String,
    pub slug: String,
    pub description: Option<String>,
    pub long_description: Option<String>,
    pub price_paise: i32,
    pub original_price_paise: Option<i32>,
    pub tags: Option<Vec<String>>,
    pub status: String,
    pub github_repo_url: Option<String>,
    pub github_repo_id: Option<i32>,
    pub preview_url: Option<String>,
    pub image_url: Option<String>,
    pub demo_url: Option<String>,
    pub tech_stack: Option<Vec<String>>,
    pub sales_count: Option<i32>,
    pub view_count: Option<i32>,
    pub rating: Option<f64>,
    pub review_count: Option<i32>,
    pub is_featured: Option<bool>,
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Wallet {
    pub user_id: Uuid,
    pub balance_paise: i32,
    pub pending_paise: i32,
    pub total_earned_paise: i32,
    pub total_spent_paise: i32,
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Order {
    pub id: Uuid,
    pub buyer_id: Uuid,
    pub seller_id: Uuid,
    pub product_id: Uuid,
    pub amount_paise: i32,
    pub platform_fee_paise: i32,
    pub seller_amount_paise: i32,
    pub status: String,
    pub razorpay_order_id: Option<String>,
    pub razorpay_payment_id: Option<String>,
    pub github_repo_url: Option<String>,
    pub github_transfer_status: Option<String>,
    pub notes: Option<String>,
    pub created_at: Option<DateTime<Utc>>,
    pub completed_at: Option<DateTime<Utc>>,
    pub disputed_at: Option<DateTime<Utc>>,
    pub resolved_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Review {
    pub id: Uuid,
    pub product_id: Uuid,
    pub user_id: Uuid,
    pub order_id: Uuid,
    pub rating: i32,
    pub title: Option<String>,
    pub comment: Option<String>,
    pub is_verified_purchase: Option<bool>,
    pub helpful_count: Option<i32>,
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Notification {
    pub id: Uuid,
    pub user_id: Uuid,
    pub r#type: String,
    pub title: String,
    pub message: Option<String>,
    pub data: Option<serde_json::Value>,
    pub is_read: Option<bool>,
    pub created_at: Option<DateTime<Utc>>,
}

// Request/Response types

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateProductRequest {
    pub title: String,
    pub description: Option<String>,
    pub long_description: Option<String>,
    pub price_paise: i32,
    pub original_price_paise: Option<i32>,
    pub category_id: Option<String>,
    pub tags: Option<Vec<String>>,
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
    pub github_repo_url: Option<String>,
    pub image_url: Option<String>,
    pub demo_url: Option<String>,
    pub tech_stack: Option<Vec<String>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateOrderRequest {
    pub product_id: Uuid,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateReviewRequest {
    pub product_id: Uuid,
    pub order_id: Uuid,
    pub rating: i32,
    pub title: Option<String>,
    pub comment: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct SellerStats {
    pub total_products: i32,
    pub active_products: i32,
    pub total_sales: i32,
    pub total_revenue_paise: i32,
    pub total_earned_paise: i32,
}
