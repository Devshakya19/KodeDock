use argon2::{
    password_hash::{rand_core::OsRng, PasswordHash, PasswordHasher, PasswordVerifier, SaltString},
    Algorithm, Argon2, Params, Version,
};
use chrono::{Duration, Utc};
use jsonwebtoken::{encode as jwt_encode, EncodingKey, Header};
use sqlx::PgPool;
use uuid::Uuid;

use crate::auth::crypto::{encrypt_token, generate_secure_token, hash_token};
use crate::auth::errors::AuthError;
use crate::auth::models::{
    AuthResponse, Claims, RefreshTokenRecord, UserSummary,
};
use crate::auth::oauth::OAuthProvider;
use crate::auth::repository;

// ─── ARGON2ID PASSWORD HASHING (64MB MEMORY COST, 3 ITERATIONS) ──────────

/// Construct production-grade Argon2id instance:
/// 64MB memory cost (65,536 KiB), 3 iterations, 1 lane.
fn argon2_instance() -> Result<Argon2<'static>, AuthError> {
    let params = Params::new(64 * 1024, 3, 1, None)
        .map_err(|e| AuthError::Crypto(format!("Argon2 params initialization failed: {}", e)))?;
    Ok(Argon2::new(Algorithm::Argon2id, Version::V0x13, params))
}

pub fn hash_password(password: &str) -> Result<String, AuthError> {
    let salt = SaltString::generate(&mut OsRng);
    let argon2 = argon2_instance()?;
    let hash = argon2
        .hash_password(password.as_bytes(), &salt)
        .map_err(|e| AuthError::Crypto(format!("Argon2id hashing error: {}", e)))?;
    Ok(hash.to_string())
}

pub fn verify_password(password: &str, password_hash: &str) -> Result<bool, AuthError> {
    let parsed_hash = PasswordHash::new(password_hash)
        .map_err(|e| AuthError::Crypto(format!("Argon2id hash parsing error: {}", e)))?;
    let argon2 = argon2_instance()?;
    Ok(argon2.verify_password(password.as_bytes(), &parsed_hash).is_ok())
}

// ─── JWT ACCESS TOKEN ISSUANCE (15-MINUTE EXPIRATION) ────────────────────

pub fn generate_access_token(
    user: &UserSummary,
    family_id: Option<Uuid>,
    secret: &str,
) -> Result<String, AuthError> {
    let now = Utc::now();
    let expires = now + Duration::minutes(15); // 15-minute access token

    let claims = Claims {
        sub: user.id.to_string(),
        email: user.email.clone(),
        full_name: user.full_name.clone(),
        role: user.role.clone(),
        github_username: user.github_username.clone(),
        family_id: family_id.map(|fid| fid.to_string()),
        exp: expires.timestamp() as usize,
        iat: now.timestamp() as usize,
    };

    jwt_encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(secret.as_bytes()),
    )
    .map_err(|e| AuthError::Crypto(format!("JWT access token generation failed: {}", e)))
}

// ─── BANK-GRADE TOKEN FAMILY ROTATION ────────────────────────────────────

/// Generates a new refresh token record stored as SHA-256 hash.
pub async fn issue_refresh_token(
    pool: &PgPool,
    user_id: Uuid,
    family_id: Option<Uuid>,
) -> Result<(String, RefreshTokenRecord), AuthError> {
    let raw_token = generate_secure_token(32);
    let token_hash = hash_token(&raw_token);
    let fam_id = family_id.unwrap_or_else(Uuid::new_v4);
    let expires_at = Utc::now() + Duration::days(7); // 7-day refresh token

    let record = repository::create_refresh_token(pool, user_id, &token_hash, fam_id, expires_at).await?;
    Ok((raw_token, record))
}

/// Rotates refresh token with replay detection.
/// If an already-revoked token is submitted, the entire token family is revoked immediately!
pub async fn rotate_refresh_token(
    pool: &PgPool,
    raw_token: &str,
    jwt_secret: &str,
) -> Result<AuthResponse, AuthError> {
    let presented_hash = hash_token(raw_token);

    let token_record = match repository::find_refresh_token_by_hash(pool, &presented_hash).await? {
        Some(record) => record,
        None => return Err(AuthError::InvalidToken("Refresh token not found".to_string())),
    };

    // Replay / Reuse Detection:
    // If this token was already revoked, someone is trying to reuse a consumed token.
    if token_record.is_revoked {
        log::warn!(
            "SECURITY ALERT: Refresh token replay detected for user_id={}, family_id={}! Revoking entire family.",
            token_record.user_id,
            token_record.family_id
        );
        repository::revoke_family_tokens(pool, token_record.family_id).await?;
        return Err(AuthError::ReplayDetected(
            "Reused refresh token detected. All active sessions in this family have been terminated."
                .to_string(),
        ));
    }

    // Check expiration
    if token_record.expires_at < Utc::now() {
        return Err(AuthError::ExpiredToken);
    }

    // Revoke the consumed token
    repository::revoke_refresh_token(pool, token_record.id).await?;

    // Fetch user
    let user = match repository::find_user_by_id(pool, token_record.user_id).await? {
        Some(u) => u,
        None => return Err(AuthError::UserNotFound),
    };

    // Issue new child refresh token within the same family_id
    let (new_raw_token, _) = issue_refresh_token(pool, user.id, Some(token_record.family_id)).await?;
    let access_token = generate_access_token(&user, Some(token_record.family_id), jwt_secret)?;

    Ok(AuthResponse {
        user,
        token: access_token,
        refresh_token: Some(new_raw_token),
    })
}

// ─── AUTHENTICATION WORKFLOWS ────────────────────────────────────────────

pub async fn register_user(
    pool: &PgPool,
    email: &str,
    password: &str,
    full_name: &str,
    role: &str,
    jwt_secret: &str,
) -> Result<AuthResponse, AuthError> {
    let cleaned_email = email.trim().to_lowercase();

    // Check if user already exists
    if repository::find_user_by_email(pool, &cleaned_email).await?.is_some() {
        return Err(AuthError::UserAlreadyExists);
    }

    let password_hash = hash_password(password)?;
    let user = repository::create_user(pool, &cleaned_email, &password_hash, full_name, role).await?;

    let (raw_refresh_token, refresh_record) = issue_refresh_token(pool, user.id, None).await?;
    let access_token = generate_access_token(&user, Some(refresh_record.family_id), jwt_secret)?;

    Ok(AuthResponse {
        user,
        token: access_token,
        refresh_token: Some(raw_refresh_token),
    })
}

pub async fn login_user(
    pool: &PgPool,
    email: &str,
    password: &str,
    jwt_secret: &str,
) -> Result<AuthResponse, AuthError> {
    let cleaned_email = email.trim().to_lowercase();

    let user_with_hash = match repository::find_user_by_email(pool, &cleaned_email).await? {
        Some(u) => u,
        None => return Err(AuthError::InvalidCredentials),
    };

    if user_with_hash.is_active == Some(false) {
        return Err(AuthError::Forbidden("Account has been deactivated".to_string()));
    }

    let stored_hash = match user_with_hash.password_hash {
        Some(ref h) => h.as_str(),
        None => {
            // OAuth-only account without password
            return Err(AuthError::InvalidCredentials);
        }
    };

    if !verify_password(password, stored_hash)? {
        return Err(AuthError::InvalidCredentials);
    }

    let prefix = match user_with_hash.role.as_str() {
        "seller" => "kd_sel",
        _ => "kd_usr",
    };
    let user_summary = UserSummary {
        public_id: crate::auth::crypto::encode_public_id(prefix, &user_with_hash.id),
        id: user_with_hash.id,
        email: user_with_hash.email,
        full_name: user_with_hash.full_name,
        role: user_with_hash.role,
        github_username: user_with_hash.github_username,
    };

    let (raw_refresh_token, refresh_record) = issue_refresh_token(pool, user_summary.id, None).await?;
    let access_token = generate_access_token(&user_summary, Some(refresh_record.family_id), jwt_secret)?;

    Ok(AuthResponse {
        user: user_summary,
        token: access_token,
        refresh_token: Some(raw_refresh_token),
    })
}

// ─── PASSWORD RESET LOGIC ────────────────────────────────────────────────

pub async fn initiate_password_reset(pool: &PgPool, email: &str) -> Result<String, AuthError> {
    let cleaned_email = email.trim().to_lowercase();
    let user = match repository::find_user_by_email(pool, &cleaned_email).await? {
        Some(u) => u,
        None => return Err(AuthError::UserNotFound),
    };

    let reset_token = generate_secure_token(32);
    let expires_at = Utc::now() + Duration::hours(1);

    repository::create_password_reset_token(pool, user.id, &reset_token, expires_at).await?;
    Ok(reset_token)
}

pub async fn complete_password_reset(
    pool: &PgPool,
    token: &str,
    new_password: &str,
) -> Result<(), AuthError> {
    let reset_record = match repository::find_valid_reset_token(pool, token).await? {
        Some(r) => r,
        None => return Err(AuthError::InvalidToken("Password reset link is invalid or has expired".to_string())),
    };

    let password_hash = hash_password(new_password)?;
    repository::update_password(pool, reset_record.user_id, &password_hash).await?;
    repository::mark_reset_token_used(pool, token).await?;

    Ok(())
}

pub async fn change_user_password(
    pool: &PgPool,
    user_id: Uuid,
    current_password: &str,
    new_password: &str,
) -> Result<(), AuthError> {
    let user_with_hash = match repository::find_user_by_id_with_hash(pool, user_id).await? {
        Some(u) => u,
        None => return Err(AuthError::UserNotFound),
    };

    let stored_hash = match user_with_hash.password_hash {
        Some(ref h) => h.as_str(),
        None => return Err(AuthError::Validation("Account does not have a local password set".to_string())),
    };

    if !verify_password(current_password, stored_hash)? {
        return Err(AuthError::InvalidCredentials);
    }

    let new_hash = hash_password(new_password)?;
    repository::update_password(pool, user_id, &new_hash).await?;

    Ok(())
}

// ─── MODULAR OAUTH INTEGRATION WORKFLOW ───────────────────────────────────

pub async fn handle_oauth_login_or_register(
    pool: &PgPool,
    provider: &dyn OAuthProvider,
    code: &str,
    role_override: Option<&str>,
    jwt_secret: &str,
) -> Result<AuthResponse, AuthError> {
    // 1. Exchange authorization code with provider
    let token_resp = provider.exchange_code(code).await?;

    // 2. Fetch authenticated user profile
    let profile = provider.fetch_user(&token_resp.access_token).await?;
    let provider_name = provider.name();

    let role = match role_override {
        Some("developer") => "developer",
        _ => "user",
    };

    // 3. Check if user already exists with this provider ID
    let existing_by_oauth = match provider_name {
        "github" => repository::find_user_by_github_id(pool, &profile.provider_user_id).await?,
        "google" => repository::find_user_by_google_id(pool, &profile.provider_user_id).await?,
        _ => None,
    };

    let user_summary = match existing_by_oauth {
        Some(user) => user,
        None => {
            // 4. Try matching existing account by email
            match repository::find_user_by_email(pool, &profile.email).await? {
                Some(existing_user) => {
                    // Link provider to existing user
                    match provider_name {
                        "github" => {
                            let username = profile.username.as_deref().unwrap_or(&profile.provider_user_id);
                            repository::link_github_to_user(pool, existing_user.id, &profile.provider_user_id, username).await?;
                        }
                        "google" => {
                            repository::link_google_to_user(pool, existing_user.id, &profile.provider_user_id).await?;
                        }
                        _ => {}
                    }

                    let prefix = match existing_user.role.as_str() {
                        "seller" => "kd_sel",
                        _ => "kd_usr",
                    };
                    UserSummary {
                        public_id: crate::auth::crypto::encode_public_id(prefix, &existing_user.id),
                        id: existing_user.id,
                        email: existing_user.email,
                        full_name: existing_user.full_name.or(profile.full_name),
                        role: existing_user.role,
                        github_username: existing_user.github_username.or(profile.username),
                    }
                }
                None => {
                    // 5. Create brand-new OAuth account
                    let full_name = profile
                        .full_name
                        .as_deref()
                        .or(profile.username.as_deref())
                        .unwrap_or("KodeDock User");

                    repository::create_oauth_user(
                        pool,
                        provider_name,
                        &profile.provider_user_id,
                        profile.username.as_deref(),
                        &profile.email,
                        full_name,
                        role,
                    )
                    .await?
                }
            }
        }
    };

    // If GitHub, encrypt and store the access token securely in the profile
    if provider_name == "github" {
        if let Ok(encrypted) = encrypt_token(&token_resp.access_token, jwt_secret) {
            let _ = repository::store_github_token(pool, user_summary.id, &encrypted).await;
        }
    }

    // Issue tokens
    let (raw_refresh, refresh_rec) = issue_refresh_token(pool, user_summary.id, None).await?;
    let access_token = generate_access_token(&user_summary, Some(refresh_rec.family_id), jwt_secret)?;

    Ok(AuthResponse {
        user: user_summary,
        token: access_token,
        refresh_token: Some(raw_refresh),
    })
}
