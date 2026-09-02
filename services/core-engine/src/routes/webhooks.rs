use actix_web::web;
use crate::handlers;

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/api/webhooks")
            .route("/razorpay", web::post().to(handlers::orders::razorpay_webhook))
            .route("/wallet-topup", web::post().to(handlers::wallet::wallet_topup_webhook)),
    );
}
