pub mod handlers;
pub mod models;
pub mod repository;
pub mod service;
pub mod email;
pub mod totp;
pub mod oauth;

use actix_web::web;

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/auth")
            .route("/signup", web::post().to(handlers::signup))
            .route("/login", web::post().to(handlers::login))
            .route("/refresh", web::post().to(handlers::refresh_token))
            .route("/logout", web::post().to(handlers::logout))
            .route("/2fa/setup", web::post().to(handlers::setup_2fa))
            .route("/2fa/verify", web::post().to(handlers::verify_2fa))
            .route("/email/send-verification", web::post().to(handlers::send_verification_email))
            .route("/email/verify", web::post().to(handlers::verify_email))
            .route("/github/login", web::get().to(handlers::github_login))
                        .route("/github/callback", web::get().to(handlers::github_callback))
            .route("/google/login", web::get().to(handlers::google_login))
            .route("/google/callback", web::get().to(handlers::google_callback)),
    );
}
