pub mod handlers;
pub mod models;
pub mod repository;
pub mod service;

use actix_web::web;

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/marketplace")
            .route("/products", web::post().to(handlers::create_product))
            .route("/products", web::get().to(handlers::my_products)) // GET /products requires auth to fetch own products
            .route("/products/{slug}", web::get().to(handlers::get_product)) // Public GET
    );
}
