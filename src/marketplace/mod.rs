pub mod handlers;
pub mod models;
pub mod repository;
pub mod service;

use actix_web::web;

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/marketplace")
            // Public Catalog routes
            .route("/catalog", web::get().to(handlers::list_catalog))
            .route("/catalog/{slug}", web::get().to(handlers::get_product))
            // Authenticated Seller routes
            .route("/products", web::post().to(handlers::create_product))
            .route("/products", web::get().to(handlers::my_products))
            .route("/products/{id}/publish", web::post().to(handlers::publish_product))
    );
}
