use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

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

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct SellerNotificationPreferences {
    pub seller_id: Uuid,
    pub email_sales: bool,
    pub email_reviews: bool,
    pub email_updates: bool,
    pub push_sales: bool,
    pub push_reviews: bool,
    pub push_updates: bool,
}

#[derive(Debug, Deserialize)]
pub struct UpdateNotificationPreferencesRequest {
    pub email_sales: bool,
    pub email_reviews: bool,
    pub email_updates: bool,
    pub push_sales: bool,
    pub push_reviews: bool,
    pub push_updates: bool,
}
