use actix_governor::Governor;
use actix_web::web;

use crate::handlers;
use crate::routes::limiters::RateLimitConfig;

pub fn configure(cfg: &mut web::ServiceConfig, upload_limiter: &RateLimitConfig) {
    cfg.service(
        web::scope("/api/upload").route(
            "/presign",
            web::post()
                .to(handlers::upload::presign_upload)
                .wrap(Governor::new(upload_limiter)),
        ),
    );
}
