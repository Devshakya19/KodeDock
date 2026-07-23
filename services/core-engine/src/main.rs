use actix_cors::Cors;
use actix_web::{web, App, HttpServer, middleware::Logger};
use actix_governor::{Governor, GovernorConfigBuilder, KeyExtractor};
use dotenvy::dotenv;
use sqlx::postgres::PgPoolOptions;
use std::env;

mod handlers;
mod models;
mod services;
mod middleware;
mod utils;
mod storage;

/// Custom key extractor that reads the client IP from X-Forwarded-For header
/// (set by the Next.js proxy) or falls back to the direct connection IP.
/// This ensures rate limiting applies per-user, not per-proxy-server.
#[derive(Clone)]
struct ForwardedIpKeyExtractor;

impl KeyExtractor for ForwardedIpKeyExtractor {
    type Key = String;
    type KeyExtractionError = std::convert::Infallible;

    fn extract(&self, req: &actix_web::dev::ServiceRequest) -> Result<Self::Key, Self::KeyExtractionError> {
        let ip = req
            .headers()
            .get("x-forwarded-for")
            .and_then(|v| v.to_str().ok())
            .and_then(|v| v.split(',').next())
            .map(|s| s.trim().to_string())
            .unwrap_or_else(|| {
                req.peer_addr()
                    .map(|addr| addr.ip().to_string())
                    .unwrap_or_else(|| "unknown".to_string())
            });
        Ok(ip)
    }
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));

    let port = env::var("PORT").unwrap_or_else(|_| "4001".to_string());
    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");

    let pool = PgPoolOptions::new()
        .min_connections(2)
        .max_connections(20)
        .idle_timeout(std::time::Duration::from_secs(300))
        .max_lifetime(std::time::Duration::from_secs(1800))
        .acquire_timeout(std::time::Duration::from_secs(10))
        .connect(&database_url)
        .await
        .expect("Failed to create PostgreSQL pool");

    log::info!("Starting CodeHaat Core Engine on port {}", port);
    log::info!("Connected to PostgreSQL");

    let storage = storage::StorageClient::new().await;
    log::info!("Storage client initialized");

    let cors_origins: Vec<String> = env::var("CORS_ORIGINS")
        .unwrap_or_else(|_| "http://localhost:3000,http://localhost:3001".to_string())
        .split(',')
        .map(|s| s.trim().to_string())
        .filter(|s| !s.is_empty())
        .collect();

    let auth_limiter = GovernorConfigBuilder::default()
        .seconds_per_request(12)
        .burst_size(5)
        .key_extractor(ForwardedIpKeyExtractor)
        .finish()
        .expect("Failed to build auth rate limiter");

    let upload_limiter = GovernorConfigBuilder::default()
        .seconds_per_request(6)
        .burst_size(10)
        .key_extractor(ForwardedIpKeyExtractor)
        .finish()
        .expect("Failed to build upload rate limiter");

    let verify_limiter = GovernorConfigBuilder::default()
        .seconds_per_request(6)
        .burst_size(10)
        .key_extractor(ForwardedIpKeyExtractor)
        .finish()
        .expect("Failed to build verify rate limiter");

    HttpServer::new(move || {
        let mut cors = Cors::default()
            .allowed_methods(vec!["GET", "POST", "PUT", "DELETE", "OPTIONS"])
            .allowed_headers(vec!["Authorization", "Content-Type", "X-Razorpay-Signature"])
            .max_age(3600);

        for origin in &cors_origins {
            cors = cors.allowed_origin(origin);
        }

        App::new()
            .wrap(cors)
            .wrap(Logger::default())
            .app_data(web::Data::new(pool.clone()))
            .app_data(web::Data::new(storage.clone()))
            // Health check
            .route("/health", web::get().to(handlers::health::health_check))
            // Auth (rate-limited)
            .route(
                "/api/auth/register",
                web::post()
                    .to(handlers::auth::register)
                    .wrap(Governor::new(&auth_limiter)),
            )
            .route(
                "/api/auth/login",
                web::post()
                    .to(handlers::auth::login)
                    .wrap(Governor::new(&auth_limiter)),
            )
            .route(
                "/api/auth/forgot-password",
                web::post()
                    .to(handlers::auth::forgot_password)
                    .wrap(Governor::new(&auth_limiter)),
            )
            .route(
                "/api/auth/reset-password",
                web::post()
                    .to(handlers::auth::reset_password)
                    .wrap(Governor::new(&auth_limiter)),
            )
            .route("/api/auth/logout", web::post().to(handlers::auth::logout))
            .route("/api/auth/me", web::get().to(handlers::auth::me))
            .route("/api/auth/change-password", web::post().to(handlers::auth::change_password))
            .route("/api/auth/delete-account", web::delete().to(handlers::auth::delete_account))
            // Profile
            .route("/api/profile/{id}", web::get().to(handlers::profile::get_profile))
            .route("/api/profile", web::put().to(handlers::profile::update_profile))
            // Products (public)
            .route("/api/products", web::get().to(handlers::products::list_products))
            .route("/api/products/{id}", web::get().to(handlers::products::get_product))
            // Seller products
            .route("/api/seller/products", web::get().to(handlers::seller::list_seller_products))
            .route("/api/seller/products", web::post().to(handlers::seller::create_product))
            .route("/api/seller/products/{id}", web::put().to(handlers::seller::update_product))
            .route("/api/seller/products/{id}", web::delete().to(handlers::seller::delete_product))
            .route("/api/seller/stats", web::get().to(handlers::seller::get_stats))
            // Wallet
            .route("/api/wallet", web::get().to(handlers::wallet::get_balance))
            .route("/api/wallet/topup", web::post().to(handlers::wallet::create_topup))
            .route("/api/wallet/topup/verify", web::post().to(handlers::wallet::verify_topup))
            .route("/api/wallet/transactions", web::get().to(handlers::wallet::list_transactions))
            .route("/api/wallet/withdraw", web::post().to(handlers::wallet::withdraw))
            .route("/api/wallet/release-escrow", web::post().to(handlers::wallet::release_escrow))
            // Orders
            .route("/api/orders", web::post().to(handlers::orders::create_order))
            .route(
                "/api/orders/verify",
                web::post()
                    .to(handlers::orders::verify_order)
                    .wrap(Governor::new(&verify_limiter)),
            )
            .route("/api/orders", web::get().to(handlers::orders::list_orders))
            .route("/api/orders/{id}", web::get().to(handlers::orders::get_order))
            // Razorpay webhook
            .route("/api/webhooks/razorpay", web::post().to(handlers::orders::razorpay_webhook))
            // Reviews
            .route("/api/reviews/{product_id}", web::get().to(handlers::reviews::list_reviews))
            .route("/api/reviews", web::post().to(handlers::reviews::create_review))
            // Notifications
            .route("/api/notifications", web::get().to(handlers::notifications::list_notifications))
            .route("/api/notifications/{id}/read", web::put().to(handlers::notifications::mark_read))
            // Upload (rate-limited)
            .route(
                "/api/upload/presign",
                web::post()
                    .to(handlers::upload::presign_upload)
                    .wrap(Governor::new(&upload_limiter)),
            )
    })
    .bind(format!("0.0.0.0:{}", port))?
    .run()
    .await
}
