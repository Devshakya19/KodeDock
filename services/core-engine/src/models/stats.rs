use serde::Serialize;

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
