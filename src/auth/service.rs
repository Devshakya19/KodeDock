use crate::auth::models::{AuthResponse, SignupRequest, TokenClaims, User, UserPublicProfile};
use crate::auth::repository::AuthRepository;
use crate::config::AppConfig;
use crate::errors::AppError;
use argon2::{
    password_hash::{rand_core::OsRng, PasswordHash, PasswordHasher, PasswordVerifier, SaltString},
    Argon2, Params,
};
use chrono::{Duration, Utc};
use jsonwebtoken::{encode, EncodingKey, Header};
use sha2::{Digest, Sha256};
use sqlx::PgPool;
use uuid::Uuid;

pub struct AuthService;

impl AuthService {

    /// Helper: Issues a new refresh token under a specified family.
    /// Returns (plaintext_token, new_token_id)
    async fn issue_refresh_token(
        pool: &PgPool,
        config: &AppConfig,
        user_id: Uuid,
        family_id: Uuid,
    ) -> Result<(String, Uuid), AppError> {
        let plaintext = format!("{}.{}", Uuid::new_v4(), Uuid::new_v4());
        let token_hash = hex::encode(Sha256::digest(plaintext.as_bytes()));
        let expires_at = Utc::now() + Duration::seconds(config.jwt_refresh_expiry_secs);
        
        let token_id = AuthRepository::insert_refresh_token(pool, user_id, &token_hash, family_id, expires_at).await?;
        Ok((plaintext, token_id))
    }

    /// Hashes password with Argon2id (64MB memory cost, 3 iterations)
    pub fn hash_password(password: &str) -> Result<String, AppError> {
        let salt = SaltString::generate(&mut OsRng);
        // Custom params: 64MB memory cost (65536 KiB), 3 iterations, 4 parallelism
        let params = Params::new(65536, 3, 4, None)
            .map_err(|e| AppError::InternalError(format!("Argon2 params error: {}", e)))?;
        let argon2 = Argon2::new(argon2::Algorithm::Argon2id, argon2::Version::V0x13, params);

        let hash = argon2
            .hash_password(password.as_bytes(), &salt)
            .map_err(|e| AppError::InternalError(format!("Password hashing error: {}", e)))?
            .to_string();

        Ok(hash)
    }

    /// Verifies password against Argon2id hash
    pub fn verify_password(password: &str, hash: &str) -> Result<bool, AppError> {
        let parsed_hash = PasswordHash::new(hash)
            .map_err(|e| AppError::InternalError(format!("Invalid password hash: {}", e)))?;

        Ok(Argon2::default()
            .verify_password(password.as_bytes(), &parsed_hash)
            .is_ok())
    }

    /// Generates short-lived (15 min) JWT Access Token
    pub fn generate_access_token(user: &User, config: &AppConfig) -> Result<String, AppError> {
        let now = Utc::now();
        let exp = now + Duration::seconds(config.jwt_access_expiry_secs);

        let claims = TokenClaims {
            sub: user.id.to_string(),
            email: user.email.clone(),
            role: user.role.clone(),
            jti: Uuid::new_v4().to_string(),
            iat: now.timestamp() as usize,
            exp: exp.timestamp() as usize,
        };

        encode(
            &Header::default(),
            &claims,
            &EncodingKey::from_secret(config.jwt_secret.as_bytes()),
        )
        .map_err(|e| AppError::InternalError(format!("JWT generation error: {}", e)))
    }

    /// Registers a new user with real Argon2id hash and issues initial tokens
    pub async fn signup(
        pool: &PgPool,
        config: &AppConfig,
        req: SignupRequest,
    ) -> Result<(AuthResponse, String), AppError> {
        if req.email.is_empty() || !req.email.contains('@') {
            return Err(AppError::BadRequest("Invalid email address".to_string()));
        }

        if req.password.len() < 8 {
            return Err(AppError::BadRequest("Password must be at least 8 characters long".to_string()));
        }

        if let Some(existing) = AuthRepository::find_by_email(pool, &req.email).await? {
            return Err(AppError::Conflict(format!("Email {} is already registered", existing.email)));
        }

        let password_hash = Self::hash_password(&req.password)?;
        let role = req.role.unwrap_or_else(|| "buyer".to_string());
        if role != "buyer" && role != "seller" {
            return Err(AppError::BadRequest("Role must be 'buyer' or 'seller'".to_string()));
        }

        let user = AuthRepository::create_user(pool, &req.email, &password_hash, &req.full_name, &role).await?;
        let access_token = Self::generate_access_token(&user, config)?;

        // Generate initial Refresh Token with new Family ID
        let (plaintext_refresh_token, _) = Self::issue_refresh_token(pool, config, user.id, Uuid::new_v4()).await?;

        let response = AuthResponse {
            user: UserPublicProfile::from(user),
            access_token,
            expires_in_seconds: config.jwt_access_expiry_secs,
        };

        Ok((response, plaintext_refresh_token))
    }

    /// Authenticates user and issues access token + new refresh token family
    pub async fn login(
        pool: &PgPool,
        config: &AppConfig,
        email: &str,
        password: &str,
    ) -> Result<(AuthResponse, String), AppError> {
        let user = AuthRepository::find_by_email(pool, email)
            .await?
            .ok_or_else(|| AppError::Unauthorized("Invalid email or password".to_string()))?;

        if user.is_banned {
            return Err(AppError::Forbidden("Account has been suspended".to_string()));
        }

        if !Self::verify_password(password, &user.password_hash)? {
            return Err(AppError::Unauthorized("Invalid email or password".to_string()));
        }

        let access_token = Self::generate_access_token(&user, config)?;

        let (plaintext_refresh_token, _) = Self::issue_refresh_token(pool, config, user.id, Uuid::new_v4()).await?;

        let response = AuthResponse {
            user: UserPublicProfile::from(user),
            access_token,
            expires_in_seconds: config.jwt_access_expiry_secs,
        };

        Ok((response, plaintext_refresh_token))
    }

    /// Bank-Grade Token Family Rotation with Replay Attack Revocation
    pub async fn refresh_access_token(
        pool: &PgPool,
        config: &AppConfig,
        plaintext_token: &str,
    ) -> Result<(AuthResponse, String), AppError> {
        let token_hash = hex::encode(Sha256::digest(plaintext_token.as_bytes()));

        let (token_id, user_id, family_id, is_revoked, expires_at) = AuthRepository::find_refresh_token_by_hash(pool, &token_hash)
            .await?
            .ok_or_else(|| AppError::Unauthorized("Invalid refresh token".to_string()))?;

        // Replay Attack Detection: If token is already revoked, purge entire token family!
        if is_revoked {
            AuthRepository::revoke_token_family(pool, family_id).await?;
            return Err(AppError::Unauthorized(
                "Security Alert: Replayed refresh token detected. All user sessions revoked.".to_string(),
            ));
        }

        if expires_at < Utc::now() {
            return Err(AppError::Unauthorized("Refresh token has expired".to_string()));
        }

        let user = AuthRepository::find_by_id(pool, user_id)
            .await?
            .ok_or_else(|| AppError::NotFound("User not found".to_string()))?;

        if user.is_banned {
            return Err(AppError::Forbidden("Account is suspended".to_string()));
        }

        // Rotate: Generate new child token in the same family
        let (new_plaintext_token, new_token_id) = Self::issue_refresh_token(pool, config, user.id, family_id).await?;

        // Consume old token and mark replaced_by
        AuthRepository::mark_token_revoked(pool, token_id, Some(new_token_id)).await?;

        let access_token = Self::generate_access_token(&user, config)?;

        let response = AuthResponse {
            user: UserPublicProfile::from(user),
            access_token,
            expires_in_seconds: config.jwt_access_expiry_secs,
        };

        Ok((response, new_plaintext_token))
    }

    // --- Phase 2: Bank-Grade Auth Features ---


    pub async fn setup_totp(
        pool: &PgPool,
        config: &AppConfig,
        email: &str,
    ) -> Result<serde_json::Value, AppError> {
        let user = AuthRepository::find_by_email(pool, email)
            .await?
            .ok_or_else(|| AppError::NotFound("User not found".to_string()))?;
            
        let (base32_secret, qr_code) = crate::auth::totp::generate_totp_secret(&user.email)?;
        let encrypted_secret = crate::auth::totp::encrypt_secret(&config.master_encryption_key_hex, &base32_secret)?;
        
        AuthRepository::save_totp_secret(pool, user.id, &encrypted_secret).await?;
        
        Ok(serde_json::json!({
            "secret": base32_secret,
            "qr_code_url": format!("data:image/png;base64,{}", qr_code)
        }))
    }

    pub async fn verify_totp(
        pool: &PgPool,
        config: &AppConfig,
        email: &str,
        token: &str,
    ) -> Result<bool, AppError> {
        let user = AuthRepository::find_by_email(pool, email)
            .await?
            .ok_or_else(|| AppError::NotFound("User not found".to_string()))?;
            
        let (encrypted_secret, _) = AuthRepository::get_totp_secret(pool, user.id)
            .await?
            .ok_or_else(|| AppError::BadRequest("2FA is not setup".to_string()))?;
            
        let base32_secret = crate::auth::totp::decrypt_secret(&config.master_encryption_key_hex, &encrypted_secret)?;
        
        let is_valid = crate::auth::totp::verify_totp(&base32_secret, token)?;
        if is_valid {
            AuthRepository::enable_totp(pool, user.id).await?;
        }
        
        Ok(is_valid)
    }

    pub async fn handle_github_callback(
        pool: &PgPool,
        config: &AppConfig,
        code: &str,
    ) -> Result<(AuthResponse, String), AppError> {
        let access_token = crate::auth::oauth::github::exchange_code(
            &config.github_client_id,
            &config.github_client_secret,
            &config.github_redirect_uri,
            code,
        ).await?;
        
        let profile = crate::auth::oauth::github::get_profile(&access_token).await?;
        
        let user = AuthRepository::find_or_create_oauth_user(
            pool,
            "github",
            &profile.provider_id,
            profile.email.as_deref(),
            &profile.name,
            profile.avatar_url.as_deref(),
        ).await?;
        
        let jwt_access_token = Self::generate_access_token(&user, config)?;

        let (plaintext_refresh_token, _) = Self::issue_refresh_token(pool, config, user.id, Uuid::new_v4()).await?;

        let response = AuthResponse {
            user: UserPublicProfile::from(user),
            access_token: jwt_access_token,
            expires_in_seconds: config.jwt_access_expiry_secs,
        };

        Ok((response, plaintext_refresh_token))
    }


    pub async fn handle_google_callback(
        pool: &PgPool,
        config: &AppConfig,
        code: &str,
    ) -> Result<(AuthResponse, String), AppError> {
        let access_token = crate::auth::oauth::google::exchange_code(
            &config.google_client_id,
            &config.google_client_secret,
            &config.google_redirect_uri,
            code,
        ).await?;
        
        let profile = crate::auth::oauth::google::get_profile(&access_token).await?;
        
        let user = AuthRepository::find_or_create_oauth_user(
            pool,
            "google",
            &profile.provider_id,
            profile.email.as_deref(),
            &profile.name,
            profile.avatar_url.as_deref(),
        ).await?;
        
        let jwt_access_token = Self::generate_access_token(&user, config)?;

        let (plaintext_refresh_token, _) = Self::issue_refresh_token(pool, config, user.id, Uuid::new_v4()).await?;

        let response = AuthResponse {
            user: UserPublicProfile::from(user),
            access_token: jwt_access_token,
            expires_in_seconds: config.jwt_access_expiry_secs,
        };

        Ok((response, plaintext_refresh_token))
    }

    pub async fn send_email_verification(
        redis: &redis::Client,
        config: &AppConfig,
        email: &str,
    ) -> Result<(), AppError> {
        let otp = format!("{:06}", rand::random::<u32>() % 1000000);
        
        let mut conn = redis.get_multiplexed_async_connection().await
            .map_err(|_| AppError::InternalError("Redis connection failed".to_string()))?;
            
        let redis_key = format!("email_otp:{}", email.to_lowercase());
        
        // 15 min expiration
        redis::AsyncCommands::set_ex::<_, _, ()>(&mut conn, &redis_key, &otp, 900).await
            .map_err(|_| AppError::InternalError("Failed to store OTP in Redis".to_string()))?;
            
        crate::auth::email::send_verification_email(config, email, &otp).await?;
        
        Ok(())
    }

    pub async fn verify_email_otp(
        pool: &PgPool,
        redis: &redis::Client,
        email: &str,
        otp: &str,
    ) -> Result<bool, AppError> {
        let mut conn = redis.get_multiplexed_async_connection().await
            .map_err(|_| AppError::InternalError("Redis connection failed".to_string()))?;
            
        let redis_key = format!("email_otp:{}", email.to_lowercase());
        let stored_otp: Option<String> = redis::AsyncCommands::get(&mut conn, &redis_key).await
            .map_err(|_| AppError::InternalError("Failed to get OTP from Redis".to_string()))?;
            
        if let Some(stored) = stored_otp {
            if stored == otp {
                // Verified. Update user in DB.
                if let Some(user) = AuthRepository::find_by_email(pool, email).await? {
                    AuthRepository::mark_email_verified(pool, user.id).await?;
                }
                let _ : () = redis::AsyncCommands::del::<_, ()>(&mut conn, &redis_key).await.unwrap_or_default();
                return Ok(true);
            }
        }
        
        Ok(false)
    }

}
