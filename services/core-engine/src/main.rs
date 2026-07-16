use actix_cors::Cors;
use actix_web::{web, App, HttpServer, middleware::Logger};
use dotenvy::dotenv;
use sqlx::postgres::PgPoolOptions;
use std::env;

mod handlers;
mod models;
mod services;
mod middleware;
mod utils;
mod storage;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));

    let port = env::var("PORT").unwrap_or_else(|_| "4001".to_string());
    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");

    // Create PostgreSQL connection pool
    let pool = PgPoolOptions::new()
        .max_connections(10)
        .connect(&database_url)
        .await
        .expect("Failed to create PostgreSQL pool");

    log::info!("Starting CodeHaat Core Engine on port {}", port);
    log::info!("Connected to PostgreSQL");

    // Initialize S3-compatible storage client
    let storage = storage::StorageClient::new().await;
    log::info!("Storage client initialized");

    // Load CORS origins from environment
    let cors_origins: Vec<String> = env::var("CORS_ORIGINS")
        .unwrap_or_else(|_| "http://localhost:3000,http://localhost:3001".to_string())
        .split(',')
        .map(|s| s.trim().to_string())
        .filter(|s| !s.is_empty())
        .collect();

    HttpServer::new(move || {
        let mut cors = Cors::default()
            .allowed_methods(vec!["GET", "POST", "PUT", "DELETE", "OPTIONS"])
            .allowed_headers(vec!["Authorization", "Content-Type"])
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
            // Auth
            .route("/api/auth/register", web::post().to(handlers::auth::register))
            .route("/api/auth/login", web::post().to(handlers::auth::login))
            .route("/api/auth/logout", web::post().to(handlers::auth::logout))
            .route("/api/auth/me", web::get().to(handlers::auth::me))
            .route("/api/auth/forgot-password", web::post().to(handlers::auth::forgot_password))
            .route("/api/auth/reset-password", web::post().to(handlers::auth::reset_password))
            // Profile
            .route("/api/profile/{id}", web::get().to(handlers::profile::get_profile))
            .route("/api/profile", web::put().to(handlers::profile::update_profile))
            // Products
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
            .route("/api/wallet/topup", web::post().to(handlers::wallet::topup))
            // Orders
            .route("/api/orders", web::post().to(handlers::orders::create_order))
            .route("/api/orders", web::get().to(handlers::orders::list_orders))
            .route("/api/orders/{id}", web::get().to(handlers::orders::get_order))
            // Reviews
            .route("/api/reviews/{product_id}", web::get().to(handlers::reviews::list_reviews))
            .route("/api/reviews", web::post().to(handlers::reviews::create_review))
            // Notifications
            .route("/api/notifications", web::get().to(handlers::notifications::list_notifications))
            .route("/api/notifications/{id}/read", web::put().to(handlers::notifications::mark_read))
            // Upload
            .route("/api/upload/presign", web::post().to(handlers::upload::presign_upload))
    })
    .bind(format!("0.0.0.0:{}", port))?
    .run()
    .await
}
