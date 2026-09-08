pub mod errors;
pub mod handlers;
pub mod models;
pub mod repository;
pub mod service;

use actix_web::web;

pub fn configure_marketplace_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/api/products")
            .route("", web::get().to(handlers::list_products))
            .route("/{slug}", web::get().to(handlers::product_details)),
    );
}
