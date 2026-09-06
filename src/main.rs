pub mod auth;
pub mod common;
pub mod config;
pub mod errors;
pub mod fintech;
pub mod jobs;
pub mod marketplace;
pub mod realtime;
pub mod security;
pub mod storage;
pub mod tax;

use actix_cors::Cors;
use actix_web::{web, App, HttpResponse, HttpServer, Responder};
use common::ApiResponse;
use config::AppConfig;
use sqlx::postgres::PgPoolOptions;
use std::time::Duration;
use tracing::info;
use tracing_actix_web::TracingLogger;

async fn health_check() -> impl Responder {
    HttpResponse::Ok().json(ApiResponse::success(serde_json::json!({
        "status": "healthy",
        "service": "kodedock-core-engine",
        "version": env!("CARGO_PKG_VERSION"),
        "uptime": "online"
    })))
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // 1. Load environment variables from .env if present
    dotenvy::dotenv().ok();

    // 2. Initialize structured tracing telemetry
    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "info,kodedock=debug".into()),
        )
        .json()
        .init();

    info!(
        "⚓ Booting KodeDock Universal Digital Marketplace Engine v{}...",
        env!("CARGO_PKG_VERSION")
    );

    // 3. Load strongly-typed AppConfig
    let config = match AppConfig::from_env() {
        Ok(cfg) => cfg,
        Err(err) => {
            eprintln!("❌ Fatal Configuration Error: {}", err);
            std::process::exit(1);
        }
    };

    info!("🔌 Connecting to PostgreSQL at {}...", config.database_url);
    let db_pool = match PgPoolOptions::new()
        .max_connections(config.database_max_connections)
        .acquire_timeout(Duration::from_secs(5))
        .connect(&config.database_url)
        .await
    {
        Ok(pool) => {
            info!(
                "✅ PostgreSQL connected successfully (Pool size: {})",
                config.database_max_connections
            );
            pool
        }
        Err(e) => {
            eprintln!("❌ Failed to connect to PostgreSQL: {}", e);
            std::process::exit(1);
        }
    };

    info!("⚡ Connecting to Redis at {}...", config.redis_url);
    let redis_client = match redis::Client::open(config.redis_url.clone()) {
        Ok(client) => {
            info!("✅ Redis client initialized successfully");
            client
        }
        Err(e) => {
            eprintln!("❌ Failed to initialize Redis client: {}", e);
            std::process::exit(1);
        }
    };

    let host = config.host.clone();
    let port = config.port;
    let config_data = web::Data::new(config);
    let db_pool_data = web::Data::new(db_pool);
    let redis_data = web::Data::new(redis_client);

    info!("🚀 Starting HTTP server on http://{}:{}...", host, port);

    HttpServer::new(move || {
        let cors = Cors::default()
            .allow_any_origin()
            .allow_any_method()
            .allow_any_header()
            .supports_credentials()
            .max_age(3600);

        App::new()
            .wrap(TracingLogger::default())
            .wrap(cors)
            .app_data(config_data.clone())
            .app_data(db_pool_data.clone())
            .app_data(redis_data.clone())
            .route("/health", web::get().to(health_check))
            .service(
                web::scope("/api/v1")
                    .configure(auth::configure)
                    .configure(marketplace::configure)
                    .configure(fintech::configure)
                    .configure(tax::configure)
                    .configure(storage::configure)
                    .configure(security::configure)
                    .configure(realtime::configure)
                    .configure(jobs::configure),
            )
    })
    .bind((host.as_str(), port))?
    .run()
    .await
}
