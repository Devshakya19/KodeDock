pub mod crypto;
pub mod errors;
pub mod handlers;
pub mod middleware;
pub mod models;
pub mod oauth;
pub mod repository;
pub mod service;

use actix_web::web;

/// Mounts all core authentication and OAuth routes to the Actix-web router.
pub fn configure_auth_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/api/auth")
            .route("/register", web::post().to(handlers::register))
            .route("/login", web::post().to(handlers::login))
            .route("/refresh", web::post().to(handlers::refresh))
            .route("/me", web::get().to(handlers::me))
            .route("/logout", web::post().to(handlers::logout))
            .route("/verify", web::get().to(handlers::verify_email))
            .route("/forgot-password", web::post().to(handlers::forgot_password))
            .route("/reset-password", web::post().to(handlers::reset_password))
            .route("/change-password", web::post().to(handlers::change_password))
            .route("/delete-account", web::delete().to(handlers::delete_account))
            .route("/config", web::get().to(handlers::get_auth_config))
            // Dynamic Modular OAuth endpoints
            .route("/oauth/{provider}", web::post().to(handlers::oauth_authenticate))
            .route("/oauth/{provider}/link", web::post().to(handlers::oauth_link))
            .route("/oauth/{provider}/unlink", web::post().to(handlers::oauth_unlink))
            // Direct Provider Aliases for backwards compatibility
            .route(
                "/github",
                web::post().to(|secret, pool, body| {
                    handlers::oauth_authenticate(secret, pool, web::Path::from("github".to_string()), body)
                }),
            )
            .route(
                "/github/link",
                web::post().to(|secret, pool, claims, body| {
                    handlers::oauth_link(secret, pool, claims, web::Path::from("github".to_string()), body)
                }),
            )
            .route(
                "/github/unlink",
                web::post().to(|pool, claims| {
                    handlers::oauth_unlink(pool, claims, web::Path::from("github".to_string()))
                }),
            )
            .route(
                "/google",
                web::post().to(|secret, pool, body| {
                    handlers::oauth_authenticate(secret, pool, web::Path::from("google".to_string()), body)
                }),
            )
            .route(
                "/google/link",
                web::post().to(|secret, pool, claims, body| {
                    handlers::oauth_link(secret, pool, claims, web::Path::from("google".to_string()), body)
                }),
            )
            .route(
                "/google/unlink",
                web::post().to(|pool, claims| {
                    handlers::oauth_unlink(pool, claims, web::Path::from("google".to_string()))
                }),
            ),
    );
}
