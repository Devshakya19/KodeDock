pub mod auth;
pub mod hq;
pub mod limiters;
pub mod notifications;
pub mod orders;
pub mod products;
pub mod profile;
pub mod reviews;
pub mod seller;
pub mod upload;
pub mod wallet;
pub mod webhooks;

pub use limiters::RateLimiters;

use crate::handlers;
use actix_web::web;

/// Register all application routes with their appropriate scopes and rate limiters
pub fn configure_routes(cfg: &mut web::ServiceConfig, limiters: &RateLimiters) {
    // Health Check
    cfg.route("/health", web::get().to(handlers::health::health_check));

    // Public Catalog Categories
    cfg.route(
        "/api/public/categories",
        web::get().to(handlers::hq::get_public_categories_handler),
    );

    // Modular Domain Routers
    auth::configure(cfg, &limiters.auth);
    products::configure(cfg);
    seller::configure(cfg, &limiters.upload);
    profile::configure(cfg);
    orders::configure(cfg, &limiters.order, &limiters.verify);
    wallet::configure(cfg);
    reviews::configure(cfg);
    notifications::configure(cfg);
    upload::configure(cfg, &limiters.upload);
    webhooks::configure(cfg);
    hq::configure(cfg);
}
