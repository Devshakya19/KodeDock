use actix_web::web;
use crate::handlers;

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/api/products")
            .route("", web::get().to(handlers::products::list_products))
            .route("/{id}", web::get().to(handlers::products::get_product)),
    );
}
