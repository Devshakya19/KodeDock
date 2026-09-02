use actix_web::web;
use crate::handlers;

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/api/reviews")
            .route("", web::post().to(handlers::reviews::create_review))
            .route("/{product_id}", web::get().to(handlers::reviews::list_reviews)),
    );
}
