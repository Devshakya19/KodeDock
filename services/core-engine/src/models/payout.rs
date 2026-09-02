use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct PayoutAccount {
    pub id: Uuid,
    pub seller_id: Uuid,
    pub account_type: String,
    pub account_holder_name: Option<String>,
    pub account_number: Option<String>,
    pub ifsc_code: Option<String>,
    pub bank_name: Option<String>,
    pub upi_id: Option<String>,
    pub is_default: bool,
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize)]
pub struct PayoutAccountResponse {
    pub id: Uuid,
    pub account_type: String,
    pub account_holder_name: Option<String>,
    pub masked_account_number: Option<String>,
    pub ifsc_code: Option<String>,
    pub bank_name: Option<String>,
    pub upi_id: Option<String>,
}

impl From<PayoutAccount> for PayoutAccountResponse {
    fn from(p: PayoutAccount) -> Self {
        let masked = p.account_number.as_ref().map(|num| {
            if num.len() > 4 {
                let stars = "*".repeat(num.len() - 4);
                format!("{}{}", stars, &num[num.len() - 4..])
            } else {
                num.clone()
            }
        });
        PayoutAccountResponse {
            id: p.id,
            account_type: p.account_type,
            account_holder_name: p.account_holder_name,
            masked_account_number: masked,
            ifsc_code: p.ifsc_code,
            bank_name: p.bank_name,
            upi_id: p.upi_id,
        }
    }
}

#[derive(Debug, Deserialize)]
pub struct CreatePayoutAccountRequest {
    pub account_type: String,
    pub account_holder_name: Option<String>,
    pub account_number: Option<String>,
    pub ifsc_code: Option<String>,
    pub bank_name: Option<String>,
    pub upi_id: Option<String>,
}
