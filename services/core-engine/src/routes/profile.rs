use actix_web::web;
use crate::handlers;

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/api/profile")
            .route("", web::put().to(handlers::profile::update_profile))
            .route("/{id}", web::get().to(handlers::profile::get_profile)),
    );
}
