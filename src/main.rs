use actix_cors::Cors;
use actix_web::{middleware::Logger, web, App, HttpResponse, HttpServer, Responder};
use dotenvy::dotenv;
use sqlx::postgres::PgPoolOptions;
use std::env;

use kodedock_core::auth;
use kodedock_core::marketplace;

async fn health_check() -> impl Responder {
    HttpResponse::Ok().json(serde_json::json!({
        "status": "ok",
        "service": "kodedock-core",
        "version": env!("CARGO_PKG_VERSION"),
    }))
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));

    let port: u16 = match env::var("PORT")
        .unwrap_or_else(|_| "4001".to_string())
        .parse()
    {
        Ok(p) => p,
        Err(e) => {
            log::error!("Invalid PORT environment variable: {}", e);
            return Err(std::io::Error::new(
                std::io::ErrorKind::InvalidInput,
                format!("PORT must be a valid number: {}", e),
            ));
        }
    };

    let database_url = env::var("DATABASE_URL")
        .unwrap_or_else(|_| "postgres://kodedock:kodedock_secret@localhost:5432/kodedock".to_string());

    let jwt_secret = env::var("JWT_SECRET")
        .unwrap_or_else(|_| "kodedock-super-secret-jwt-key-change-in-production-2026".to_string());

    log::info!("Connecting to PostgreSQL database...");
    let pool = PgPoolOptions::new()
        .min_connections(2)
        .max_connections(20)
        .idle_timeout(std::time::Duration::from_secs(300))
        .acquire_timeout(std::time::Duration::from_secs(10))
        .connect_lazy(&database_url)
        .map_err(|e| {
            log::error!("Failed to initialize database connection pool: {}", e);
            std::io::Error::new(std::io::ErrorKind::ConnectionRefused, e)
        })?;

    log::info!("KodeDock Core Engine booting on port {}", port);

    HttpServer::new(move || {
        let cors = Cors::default()
            .allow_any_origin()
            .allowed_methods(vec!["GET", "POST", "PUT", "DELETE", "OPTIONS"])
            .allow_any_header()
            .supports_credentials()
            .max_age(3600);

        App::new()
            .wrap(cors)
            .wrap(Logger::default())
            .app_data(web::Data::new(pool.clone()))
            .app_data(web::Data::new(jwt_secret.clone()))
            .route("/health", web::get().to(health_check))
            .configure(auth::configure_auth_routes)
            .configure(marketplace::configure_marketplace_routes)
    })
    .bind(("0.0.0.0", port))?
    .run()
    .await
}
