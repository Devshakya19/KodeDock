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

/// Public-facing product representation.
///
/// `github_repo_url` is deliberately omitted: exposing the seller's source
/// repo on the public product page would let anyone clone the paid product
/// without purchasing. Purchased buyers receive repo access via the
/// repo-transfer job (post-payment), never from this endpoint.
#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct PublicProduct {
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
        // Note: github_repo_url and github_repo_id are intentionally dropped.
        PublicProduct {
            id: p.id,
            seller_id: p.seller_id,
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

/// Client request after Razorpay Checkout completes on the frontend.
#[derive(Debug, Deserialize)]
pub struct VerifyOrderRequest {
    pub order_id: Uuid,
    pub razorpay_order_id: String,
    pub razorpay_payment_id: String,
    pub razorpay_signature: String,
}

/// Response for order creation — contains everything Razorpay Checkout.js
/// needs to open the payment modal.
#[derive(Debug, Serialize)]
pub struct CheckoutOrderResponse {
    pub order_id: Uuid,
    pub razorpay_order_id: String,
    pub amount_paise: i32,
    pub currency: String,
    /// Public key id for Razorpay Checkout.js initialization.
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
