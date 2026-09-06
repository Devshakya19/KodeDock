pub mod handlers;
pub mod models;
pub mod repository;
pub mod service;

use actix_web::web;

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/fintech")
            .route("/wallet", web::get().to(handlers::my_wallet))
            .route("/orders", web::post().to(handlers::create_order))
            .route(
                "/webhooks/razorpay",
                web::post().to(handlers::razorpay_webhook),
            )
            .route("/disputes", web::get().to(handlers::get_disputes)),
    );
}
