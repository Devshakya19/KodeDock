use actix_governor::Governor;
use actix_web::web;

use crate::handlers;
use crate::routes::limiters::RateLimitConfig;

pub fn configure(cfg: &mut web::ServiceConfig, auth_limiter: &RateLimitConfig) {
    cfg.service(
        web::scope("/api/auth")
            .route(
                "/register",
                web::post()
                    .to(handlers::auth::register)
                    .wrap(Governor::new(auth_limiter)),
            )
            .route(
                "/login",
                web::post()
                    .to(handlers::auth::login)
                    .wrap(Governor::new(auth_limiter)),
            )
            .route(
                "/forgot-password",
                web::post()
                    .to(handlers::auth::forgot_password)
                    .wrap(Governor::new(auth_limiter)),
            )
            .route(
                "/reset-password",
                web::post()
                    .to(handlers::auth::reset_password)
                    .wrap(Governor::new(auth_limiter)),
            )
            .route("/logout", web::post().to(handlers::auth::logout))
            .route("/me", web::get().to(handlers::auth::me))
            .route("/config", web::get().to(handlers::auth::get_auth_config))
            .route("/change-password", web::post().to(handlers::auth::change_password))
            .route("/delete-account", web::delete().to(handlers::auth::delete_account))
            .route(
                "/github",
                web::post()
                    .to(handlers::auth::github_oauth)
                    .wrap(Governor::new(auth_limiter)),
            )
            .route(
                "/github/link",
                web::post()
                    .to(handlers::auth::github_link)
                    .wrap(Governor::new(auth_limiter)),
            )
            .route("/github/unlink", web::post().to(handlers::auth::github_unlink)),
    );
}
