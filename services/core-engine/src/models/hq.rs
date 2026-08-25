use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, FromRow)]
#[allow(dead_code)]
pub struct HqRole {
    pub id: Uuid,
    pub name: String,
    pub description: Option<String>,
    pub is_system_role: bool,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
#[allow(dead_code)]
pub struct HqStaff {
    pub id: Uuid,
    pub email: String,
    #[serde(skip_serializing)]
    pub password_hash: String,
    pub name: String,
    pub role_id: Option<Uuid>,
    pub is_active: bool,
    pub mfa_enabled: bool,
    #[serde(skip_serializing)]
    pub mfa_secret: Option<String>,
    pub last_login_ip: Option<String>,
    pub last_login_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
#[allow(dead_code)]
pub struct HqAuditLog {
    pub id: Uuid,
    pub staff_id: Option<Uuid>,
    pub action: String,
    pub target_resource_id: Option<String>,
    pub reason: Option<String>,
    pub ip_address: Option<String>,
    pub old_data: Option<serde_json::Value>,
    pub new_data: Option<serde_json::Value>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RevenueChartPoint {
    pub name: String,
    pub revenue: i64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct HqDashboardStats {
    pub total_revenue_paise: i64,
    pub active_sellers: i64,
    pub products_pending: i64,
    pub active_disputes: i64,
    pub revenue_chart: Vec<RevenueChartPoint>,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct HqProduct {
    pub id: Uuid,
    pub title: String,
    pub seller_id: Uuid,
    pub seller_name: Option<String>,
    pub status: String,
    pub price_paise: i32,
    pub sales_count: Option<i32>,
    pub created_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct HqUser {
    pub id: Uuid,
    pub full_name: Option<String>,
    pub email: String,
    pub role: String,
    pub is_verified: bool,
    pub is_active: bool,
    pub created_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct HqWithdrawal {
    pub transaction_id: Uuid,
    pub seller_id: Uuid,
    pub seller_name: Option<String>,
    pub amount_paise: i32,
    pub created_at: Option<DateTime<Utc>>,
    pub payout_type: Option<String>,
    pub payout_details: Option<serde_json::Value>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct HqFinanceStats {
    pub total_platform_fee_paise: i64,
    pub total_escrow_paise: i64,
    pub total_withdrawals_paise: i64,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct HqDispute {
    pub id: Uuid,
    pub order_id: Uuid,
    pub raised_by_name: Option<String>,
    pub reason: String,
    pub description: Option<String>,
    pub status: String,
    pub resolution: Option<String>,
    pub created_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct HqSupportTicket {
    pub id: Uuid,
    pub user_id: Uuid,
    pub user_name: Option<String>,
    pub user_email: Option<String>,
    pub subject: String,
    pub message: String,
    pub status: String,
    pub priority: String,
    pub created_at: Option<DateTime<Utc>>,
}

#[derive(Serialize, Deserialize, FromRow)]
pub struct PlatformSetting {
    pub key: String,
    pub value: serde_json::Value,
    pub description: Option<String>,
}

#[derive(Serialize, Deserialize, FromRow)]
pub struct PlatformIntegration {
    pub provider: String,
    pub is_active: bool,
    pub config: serde_json::Value,
}

#[derive(Serialize, Deserialize, FromRow)]
pub struct HqCategory {
    pub id: Uuid,
    pub name: String,
    pub slug: String,
    pub description: Option<String>,
    pub product_count: Option<i32>,
    pub is_active: Option<bool>,
}

#[derive(Serialize, Deserialize, FromRow)]
pub struct HqAuditLogView {
    pub id: Uuid,
    pub staff_name: Option<String>,
    pub action: String,
    pub target_resource_id: Option<String>,
    pub reason: Option<String>,
    pub old_data: Option<serde_json::Value>,
    pub new_data: Option<serde_json::Value>,
    pub created_at: Option<DateTime<Utc>>,
}

#[derive(Serialize, Deserialize, FromRow)]
pub struct HqPayoutRequest {
    pub id: Uuid,
    pub seller_id: Uuid,
    pub seller_name: Option<String>,
    pub amount_paise: i32,
    pub status: String,
    pub payout_method_id: Option<Uuid>,
    pub payout_details: Option<serde_json::Value>,
    pub processed_by: Option<Uuid>,
    pub notes: Option<String>,
    pub created_at: Option<DateTime<Utc>>,
}

#[derive(Serialize, Deserialize, FromRow)]
pub struct HqStaffView {
    pub id: Uuid,
    pub name: String,
    pub email: String,
    pub role_id: Option<Uuid>,
    pub role_name: Option<String>,
    pub is_active: Option<bool>,
    pub last_login_at: Option<DateTime<Utc>>,
}
