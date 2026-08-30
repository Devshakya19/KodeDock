use std::env;

#[derive(Clone, Debug)]
#[allow(dead_code)]
pub struct AppConfig {
    pub database_url: String,
    pub redis_url: String,
    pub jwt_secret: String,
    pub port: u16,
    pub cors_origins: Vec<String>,
    pub s3_bucket: String,
    pub s3_region: String,
    pub s3_endpoint: String,
    pub s3_access_key: String,
    pub s3_secret_key: String,
    pub s3_public_url: String,
    pub app_base_url: String,
}

impl AppConfig {
    pub fn from_env() -> Self {
        Self {
            database_url: env::var("DATABASE_URL").expect("DATABASE_URL must be set"),
            redis_url: env::var("REDIS_URL").expect("REDIS_URL must be set"),
            jwt_secret: env::var("JWT_SECRET").expect("JWT_SECRET must be set"),
            port: env::var("PORT")
                .expect("PORT must be set")
                .parse()
                .expect("PORT must be a valid number (e.g., 4001)"),
            cors_origins: env::var("CORS_ALLOWED_ORIGINS")
                .expect("CORS_ALLOWED_ORIGINS must be set")
                .split(',')
                .map(|s| s.trim().to_string())
                .filter(|s| !s.is_empty())
                .collect(),
            s3_bucket: env::var("S3_BUCKET").expect("S3_BUCKET must be set"),
            s3_region: env::var("S3_REGION").expect("S3_REGION must be set"),
            s3_endpoint: env::var("S3_ENDPOINT").expect("S3_ENDPOINT must be set"),
            s3_access_key: env::var("S3_ACCESS_KEY").expect("S3_ACCESS_KEY must be set"),
            s3_secret_key: env::var("S3_SECRET_KEY").expect("S3_SECRET_KEY must be set"),
            s3_public_url: env::var("S3_PUBLIC_URL").expect("S3_PUBLIC_URL must be set"),
            app_base_url: env::var("APP_BASE_URL").expect("APP_BASE_URL must be set"),
        }
    }
}
