use actix_web::{web, HttpResponse};
use crate::common::ApiResponse;

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/fintech")
            .route("/wallet", web::get().to(get_wallet_balance))
            .route("/webhooks/razorpay", web::post().to(razorpay_webhook)),
    );
}

async fn get_wallet_balance() -> HttpResponse {
    HttpResponse::Ok().json(ApiResponse::success(serde_json::json!({
        "available_balance_paise": 0,
        "pending_escrow_paise": 0,
        "currency": "INR"
    })))
}

async fn razorpay_webhook() -> HttpResponse {
    HttpResponse::Ok().json(ApiResponse::success(true))
}
