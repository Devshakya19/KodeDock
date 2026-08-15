use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};
use sqlx::FromRow;
use rust_decimal::Decimal;

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
    #[sqlx(default)]
    pub is_github_connected: bool,
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
}

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
    pub rating: Option<Decimal>,
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
    pub rating: Option<Decimal>,
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
    pub total_products: i64,
    pub active_products: i64,
    pub total_sales: i64,
    pub total_revenue_paise: i64,
    pub total_earned_paise: i64,
    pub total_views: i64,
    pub total_reviews: i64,
}

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

#[derive(Debug, Serialize, sqlx::FromRow)]
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
    pub created_at: Option<chrono::DateTime<chrono::Utc>>,
}
