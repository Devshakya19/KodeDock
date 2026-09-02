use actix_governor::Governor;
use actix_web::web;

use crate::handlers;
use crate::routes::limiters::RateLimitConfig;

pub fn configure(cfg: &mut web::ServiceConfig, upload_limiter: &RateLimitConfig) {
    cfg.service(
        web::scope("/api/seller")
            .route("/products", web::get().to(handlers::seller::list_seller_products))
            .route(
                "/products",
                web::post()
                    .to(handlers::seller::create_product)
                    .wrap(Governor::new(upload_limiter)),
            )
            .route("/products/{id}", web::put().to(handlers::seller::update_product))
            .route("/products/{id}", web::delete().to(handlers::seller::delete_product))
            .route("/stats", web::get().to(handlers::seller::get_stats))
            .route("/reviews", web::get().to(handlers::seller::get_seller_reviews))
            .route("/payout-account", web::get().to(handlers::payout::get_payout_account))
            .route("/payout-account", web::post().to(handlers::payout::create_or_update_payout_account))
            .route("/payout-account", web::delete().to(handlers::payout::delete_payout_account))
            .route("/notification-preferences", web::get().to(handlers::notifications::get_preferences))
            .route("/notification-preferences", web::post().to(handlers::notifications::update_preferences)),
    );
}
