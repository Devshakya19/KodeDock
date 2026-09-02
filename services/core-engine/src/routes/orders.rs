use actix_governor::Governor;
use actix_web::web;

use crate::handlers;
use crate::routes::limiters::RateLimitConfig;

pub fn configure(
    cfg: &mut web::ServiceConfig,
    order_limiter: &RateLimitConfig,
    verify_limiter: &RateLimitConfig,
) {
    cfg.service(
        web::scope("/api/orders")
            .route(
                "",
                web::post()
                    .to(handlers::orders::create_order)
                    .wrap(Governor::new(order_limiter)),
            )
            .route(
                "/verify",
                web::post()
                    .to(handlers::orders::verify_order)
                    .wrap(Governor::new(verify_limiter)),
            )
            .route("", web::get().to(handlers::orders::list_orders))
            .route("/{id}", web::get().to(handlers::orders::get_order)),
    );
}
