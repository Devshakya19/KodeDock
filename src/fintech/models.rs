use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;
use chrono::{DateTime, Utc};

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct UserAccount {
    pub user_id: Uuid,
    pub available_balance_paise: i64,
    pub pending_escrow_paise: i64,
    pub lifetime_earned_paise: i64,
    pub lifetime_withdrawn_paise: i64,
    pub is_payout_frozen: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Order {
    pub id: Uuid,
    pub order_number: String,
    pub buyer_id: Uuid,
    pub product_id: Uuid,
    pub version_id: Uuid,
    pub gross_amount_paise: i64,
    pub platform_fee_bps: i64,
    pub platform_fee_paise: i64,
    pub tds_rate_bps: i64,
    pub tds_amount_paise: i64,
    pub gst_rate_bps: i64,
    pub gst_amount_paise: i64,
    pub net_seller_paise: i64,
    pub currency: String,
    pub payment_provider: String,
    pub payment_intent_id: String,
    pub status: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct EscrowTransaction {
    pub id: Uuid,
    pub order_id: Uuid,
    pub seller_id: Uuid,
    pub buyer_id: Uuid,
    pub amount_paise: i64,
    pub status: String,
    pub release_due_at: DateTime<Utc>,
    pub released_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct LedgerEntry {
    pub id: Uuid,
    pub transaction_id: Uuid,
    pub account_id: Uuid,
    pub entry_type: String,
    pub amount_paise: i64,
    pub category: String,
    pub description: String,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateOrderRequest {
    pub product_id: Uuid,
    pub version_id: Uuid,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RazorpayWebhookPayload {
    pub event: String,
    pub payload: serde_json::Value,
}
