use actix_cors::Cors;
use actix_web::{middleware::Logger, web, App, HttpServer};
use dotenvy::dotenv;
use sqlx::postgres::PgPoolOptions;

mod config;
mod handlers;
mod middleware;
mod models;
mod routes;
mod security;
mod services;
mod storage;
mod utils;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));

    let config = config::AppConfig::from_env();
    let port = config.port;
    let cors_origins = config.cors_origins.clone();

    // 1. Initialize Redis Multiplexed Async Connection
    let redis_client = redis::Client::open(config.redis_url.clone())
        .expect("Invalid Redis URL in configuration");
    let redis_multiplexed = redis_client
        .get_multiplexed_async_connection()
        .await
        .expect("Failed to establish multiplexed connection to Redis");
    log::info!("Connected to Redis multiplexed pool");

    // 2. Initialize PostgreSQL Connection Pool (Optimized for High Concurrency)
    let pool = PgPoolOptions::new()
        .min_connections(5)
        .max_connections(30)
        .idle_timeout(std::time::Duration::from_secs(300))
        .max_lifetime(std::time::Duration::from_secs(1800))
        .acquire_timeout(std::time::Duration::from_secs(10))
        .connect(&config.database_url)
        .await
        .expect("Failed to connect to PostgreSQL database");
    log::info!("Connected to PostgreSQL database pool");

    // 3. Initialize S3 / Cloudflare R2 Storage Client
    let storage = storage::StorageClient::new().await;
    log::info!("S3/R2 Storage client initialized");

    // 4. Initialize Production Rate Limiters
    let limiters = routes::RateLimiters::new();

    log::info!("Starting KodeDock Core Engine on port {}", port);

    // 5. Start High-Performance HTTP Server
    HttpServer::new(move || {
        let mut cors = Cors::default()
            .allowed_methods(vec!["GET", "POST", "PUT", "DELETE", "OPTIONS"])
            .allowed_headers(vec![
                "Authorization",
                "Content-Type",
                "X-Razorpay-Signature",
            ])
            .max_age(3600);

        for origin in &cors_origins {
            cors = cors.allowed_origin(origin);
        }

        App::new()
            .wrap(cors)
            .wrap(Logger::default())
            .app_data(web::Data::new(config.clone()))
            .app_data(web::Data::new(config.jwt_secret.clone()))
            .app_data(web::Data::new(redis_multiplexed.clone()))
            .app_data(web::Data::new(pool.clone()))
            .app_data(web::Data::new(storage.clone()))
            .configure(|cfg| routes::configure_routes(cfg, &limiters))
    })
    .bind(("0.0.0.0", port))?
    .run()
    .await
}
