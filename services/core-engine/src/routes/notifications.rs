use crate::handlers;
use actix_web::web;

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/api/notifications")
            .route(
                "",
                web::get().to(handlers::notifications::list_notifications),
            )
            .route(
                "/{id}/read",
                web::put().to(handlers::notifications::mark_read),
            )
            .route(
                "/read-all",
                web::put().to(handlers::notifications::mark_all_read),
            ),
    );
}
