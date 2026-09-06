pub mod handlers;
pub mod models;
pub mod repository;
pub mod service;

use actix_web::web;

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/fintech")
            .route("/wallet", web::get().to(handlers::my_wallet))
            .route("/wallet/transactions", web::get().to(handlers::get_wallet_transactions))
            .route("/wallet/topup", web::post().to(handlers::topup_wallet))
            .route("/orders", web::get().to(handlers::get_my_orders))
            .route("/orders", web::post().to(handlers::create_order))
            .route("/escrow/{id}/approve", web::post().to(handlers::approve_escrow))
            .route(
                "/webhooks/razorpay",
                web::post().to(handlers::razorpay_webhook),
            )
            .route("/disputes", web::get().to(handlers::get_disputes))
            .route("/disputes", web::post().to(handlers::create_dispute))
            .route("/disputes/{id}/messages", web::get().to(handlers::get_dispute_messages))
            .route("/disputes/{id}/messages", web::post().to(handlers::add_dispute_message)),
    );
}
