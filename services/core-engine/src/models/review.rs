use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

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

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateReviewRequest {
    pub product_id: Uuid,
    pub order_id: Uuid,
    pub rating: i32,
    pub title: Option<String>,
    pub comment: Option<String>,
}

#[derive(Debug, Serialize, FromRow)]
pub struct SellerReviewItem {
    pub id: Uuid,
    pub product_id: Uuid,
    pub product_title: String,
    pub user_id: Uuid,
    pub user_name: Option<String>,
    pub user_avatar: Option<String>,
    pub rating: i32,
    pub title: Option<String>,
    pub comment: Option<String>,
    pub created_at: Option<DateTime<Utc>>,
}
