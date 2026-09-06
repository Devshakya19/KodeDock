use std::env;

#[derive(Debug, Clone)]
pub struct AppConfig {
    pub environment: String,
    pub host: String,
    pub port: u16,
    pub database_url: String,
    pub database_max_connections: u32,
    pub redis_url: String,
    pub s3_endpoint: String,
    pub s3_public_bucket: String,
    pub s3_vault_bucket: String,
    pub s3_access_key: String,
    pub s3_secret_key: String,
    pub jwt_secret: String,
    pub jwt_access_expiry_secs: i64,
    pub jwt_refresh_expiry_secs: i64,
    pub master_encryption_key_hex: String,
    pub drm_ed25519_private_key_base64: String,
    pub github_client_id: String,
    pub github_client_secret: String,
    pub github_redirect_uri: String,
    pub google_client_id: String,
    pub google_client_secret: String,
    pub google_redirect_uri: String,
    pub smtp_host: String,
    pub smtp_port: u16,
    pub smtp_user: String,
    pub smtp_pass: String,
    pub smtp_from: String,
}

impl AppConfig {
    pub fn from_env() -> Result<Self, String> {
        let environment = env::var("ENVIRONMENT").unwrap_or_else(|_| "development".to_string());
        let host = env::var("HOST").unwrap_or_else(|_| "0.0.0.0".to_string());
        let port = env::var("PORT")
            .unwrap_or_else(|_| "8080".to_string())
            .parse::<u16>()
            .map_err(|e| format!("Invalid PORT: {}", e))?;

        let database_url = env::var("DATABASE_URL")
            .map_err(|_| "DATABASE_URL environment variable is missing".to_string())?;

        let database_max_connections = env::var("DATABASE_MAX_CONNECTIONS")
            .unwrap_or_else(|_| "50".to_string())
            .parse::<u32>()
            .unwrap_or(50);

        let redis_url = env::var("REDIS_URL")
            .map_err(|_| "REDIS_URL environment variable is missing".to_string())?;

        let s3_endpoint =
            env::var("S3_ENDPOINT").unwrap_or_else(|_| "http://storage:8333".to_string());

        let s3_public_bucket =
            env::var("S3_PUBLIC_BUCKET").unwrap_or_else(|_| "kodedock-public-assets".to_string());

        let s3_vault_bucket = env::var("S3_VAULT_BUCKET")
            .unwrap_or_else(|_| "kodedock-vault-deliverables".to_string());

        let s3_access_key =
            env::var("S3_ACCESS_KEY").unwrap_or_else(|_| "kodedock_s3_admin_key".to_string());

        let s3_secret_key = env::var("S3_SECRET_KEY")
            .unwrap_or_else(|_| "kodedock_s3_admin_secret_super_secure_key".to_string());

        let jwt_secret = env::var("JWT_SECRET")
            .map_err(|_| "JWT_SECRET environment variable is missing".to_string())?;

        let jwt_access_expiry_secs = env::var("JWT_ACCESS_EXPIRY_SECONDS")
            .unwrap_or_else(|_| "900".to_string())
            .parse::<i64>()
            .unwrap_or(900);

        let jwt_refresh_expiry_secs = env::var("JWT_REFRESH_EXPIRY_SECONDS")
            .unwrap_or_else(|_| "604800".to_string())
            .parse::<i64>()
            .unwrap_or(604800);

        let master_encryption_key_hex =
            env::var("MASTER_ENCRYPTION_KEY_HEX").unwrap_or_else(|_| {
                "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef".to_string()
            });

        let drm_ed25519_private_key_base64 = env::var("DRM_ED25519_PRIVATE_KEY_BASE64")
            .unwrap_or_else(|_| "MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY=".to_string());

        let github_client_id = env::var("GITHUB_CLIENT_ID")
            .unwrap_or_else(|_| "github_placeholder_client_id".to_string());
        let github_client_secret = env::var("GITHUB_CLIENT_SECRET")
            .unwrap_or_else(|_| "github_placeholder_client_secret".to_string());
        let github_redirect_uri = env::var("GITHUB_REDIRECT_URI")
            .unwrap_or_else(|_| "http://localhost:8080/api/v1/auth/github/callback".to_string());

        let google_client_id = env::var("GOOGLE_CLIENT_ID")
            .unwrap_or_else(|_| "google_placeholder_client_id".to_string());
        let google_client_secret = env::var("GOOGLE_CLIENT_SECRET")
            .unwrap_or_else(|_| "google_placeholder_client_secret".to_string());
        let google_redirect_uri = env::var("GOOGLE_REDIRECT_URI")
            .unwrap_or_else(|_| "http://localhost:8080/api/v1/auth/google/callback".to_string());

        let smtp_host = env::var("SMTP_HOST").unwrap_or_else(|_| "mailpit".to_string());
        let smtp_port = env::var("SMTP_PORT")
            .unwrap_or_else(|_| "1025".to_string())
            .parse::<u16>()
            .unwrap_or(1025);
        let smtp_user = env::var("SMTP_USER").unwrap_or_else(|_| "".to_string());
        let smtp_pass = env::var("SMTP_PASSWORD").unwrap_or_else(|_| "".to_string());
        let smtp_from =
            env::var("SMTP_FROM_EMAIL").unwrap_or_else(|_| "no-reply@kodedock.com".to_string());

        Ok(Self {
            environment,
            host,
            port,
            database_url,
            database_max_connections,
            redis_url,
            s3_endpoint,
            s3_public_bucket,
            s3_vault_bucket,
            s3_access_key,
            s3_secret_key,
            jwt_secret,
            jwt_access_expiry_secs,
            jwt_refresh_expiry_secs,
            master_encryption_key_hex,
            drm_ed25519_private_key_base64,
            github_client_id,
            github_client_secret,
            github_redirect_uri,
            google_client_id,
            google_client_secret,
            google_redirect_uri,
            smtp_host,
            smtp_port,
            smtp_user,
            smtp_pass,
            smtp_from,
        })
    }
}
