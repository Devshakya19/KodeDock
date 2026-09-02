use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

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
pub struct WalletTransaction {
    pub id: Uuid,
    pub wallet_user_id: Uuid,
    pub r#type: String,
    pub amount_paise: i32,
    pub balance_after_paise: i32,
    pub description: Option<String>,
    pub reference_id: Option<Uuid>,
    pub metadata: Option<serde_json::Value>,
    pub created_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Deserialize)]
pub struct TopupRequest {
    pub amount_paise: i32,
}

#[derive(Debug, Deserialize)]
pub struct TopupVerifyRequest {
    pub razorpay_order_id: String,
    pub razorpay_payment_id: String,
    pub razorpay_signature: String,
}

#[derive(Debug, Serialize)]
pub struct TopupOrderResponse {
    pub razorpay_order_id: String,
    pub amount_paise: i32,
    pub currency: String,
    pub key_id: String,
}

#[derive(Debug, Deserialize)]
pub struct WithdrawRequest {
    pub amount_paise: i32,
}

#[derive(Debug, Deserialize)]
pub struct ListTransactionsQuery {
    pub page: Option<u32>,
    pub limit: Option<u32>,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct WalletTopup {
    pub id: Uuid,
    pub user_id: Uuid,
    pub razorpay_order_id: String,
    pub razorpay_payment_id: Option<String>,
    pub razorpay_signature: Option<String>,
    pub amount_paise: i32,
    pub status: String,
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
}
