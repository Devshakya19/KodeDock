use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

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

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateOrderRequest {
    pub product_id: Uuid,
}

#[derive(Debug, Deserialize)]
pub struct VerifyOrderRequest {
    pub order_id: Uuid,
    pub razorpay_order_id: String,
    pub razorpay_payment_id: String,
    pub razorpay_signature: String,
}

#[derive(Debug, Serialize)]
pub struct CheckoutOrderResponse {
    pub order_id: Uuid,
    pub razorpay_order_id: String,
    pub amount_paise: i32,
    pub currency: String,
    pub key_id: String,
    pub product_title: String,
}
