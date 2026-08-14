use argon2::{password_hash::{rand_core::OsRng, PasswordHasher, SaltString}, Argon2, PasswordHash, PasswordVerifier};
use jsonwebtoken::{encode as jwt_encode, decode as jwt_decode, Header, EncodingKey, DecodingKey, Validation, Algorithm};
use serde::{Deserialize, Serialize};
use sqlx::{PgPool, FromRow};
use uuid::Uuid;
use chrono::{Utc, Duration};
use std::env;
use hex::encode as hex_encode;
use sha2::{Sha256, Digest};

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct User {
    pub id: Uuid,
    pub email: String,
    pub full_name: Option<String>,
    pub role: String,
    pub github_username: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,
    pub email: String,
    pub full_name: Option<String>,
    pub role: String,
    pub github_username: Option<String>,
    pub exp: usize,
    pub iat: usize,
}

pub fn hash_password(password: &str) -> Result<String, String> {
    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();
    let hash = argon2.hash_password(password.as_bytes(), &salt)
        .map_err(|e| format!("Password hash error: {}", e))?;
    Ok(hash.to_string())
}

pub fn verify_password(password: &str, hash: &str) -> Result<bool, String> {
    let parsed_hash = PasswordHash::new(hash)
        .map_err(|e| format!("Password hash parse error: {}", e))?;
    Ok(Argon2::default().verify_password(password.as_bytes(), &parsed_hash).is_ok())
}

pub fn generate_token(user: &User, secret: &str) -> Result<String, String> {
    let now = Utc::now();
    let expires = now + Duration::hours(24);

    let claims = Claims {
        sub: user.id.to_string(),
        email: user.email.clone(),
        full_name: user.full_name.clone(),
        role: user.role.clone(),
        github_username: user.github_username.clone(),
        exp: expires.timestamp() as usize,
        iat: now.timestamp() as usize,
    };

    jwt_encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(secret.as_bytes()),
    )
    .map_err(|e| format!("Token generation error: {}", e))
}

pub fn verify_token(token: &str, secret: &str) -> Result<Claims, String> {
    let token_data = jwt_decode::<Claims>(
        token,
        &DecodingKey::from_secret(secret.as_bytes()),
        &Validation::new(Algorithm::HS256),
    )
    .map_err(|e| format!("Token verification error: {}", e))?;

    Ok(token_data.claims)
}

/// Encrypt a GitHub token using a simple XOR-based encryption with the JWT secret.
/// This provides basic obfuscation to avoid storing tokens in plaintext.
pub fn encrypt_github_token(token: &str) -> String {
    let secret = env::var("JWT_SECRET").expect("JWT_SECRET must be set");
    // Create a key by hashing the secret
    let mut hasher = Sha256::new();
    hasher.update(secret.as_bytes());
    let key_result = hasher.finalize();
    let key = key_result.as_slice();
    
    // XOR the token with the key (repeating if necessary)
    let token_bytes = token.as_bytes();
    let mut encrypted = Vec::with_capacity(token_bytes.len());
    for (i, byte) in token_bytes.iter().enumerate() {
        encrypted.push(byte ^ key[i % key.len()]);
    }
    
    // Return as hex string for storage
    hex_encode(encrypted)
}

pub async fn create_user(pool: &PgPool, email: &str, password: &str, full_name: &str, role: &str) -> Result<User, String> {
    let password_hash = hash_password(password)?;
    let id = Uuid::new_v4();

    let user = sqlx::query_as::<_, User>(
        r#"INSERT INTO users (id, email, password_hash, full_name, role)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING id, email, full_name, role, github_username"#
    )
    .bind(id)
    .bind(email)
    .bind(&password_hash)
    .bind(full_name)
    .bind(role)
    .fetch_one(pool)
    .await
    .map_err(|e| format!("Create user error: {}", e))?;

    Ok(user)
}

pub async fn get_user_by_email(pool: &PgPool, email: &str) -> Result<(Uuid, String, Option<String>, String, Option<String>), String> {
    sqlx::query_as::<_, (Uuid, String, Option<String>, String, Option<String>)>(
        "SELECT id, email, full_name, role, password_hash FROM users WHERE email = $1"
    )
    .bind(email)
    .fetch_optional(pool)
    .await
    .map_err(|e| format!("Get user error: {}", e))?
    .ok_or_else(|| "User not found".to_string())
}

pub async fn get_user_by_id(pool: &PgPool, user_id: Uuid) -> Result<User, String> {
    sqlx::query_as::<_, User>(
        "SELECT id, email, full_name, role, github_username FROM users WHERE id = $1"
    )
    .bind(user_id)
    .fetch_optional(pool)
    .await
    .map_err(|e| format!("Get user error: {}", e))?
    .ok_or_else(|| "User not found".to_string())
}

pub async fn update_password(pool: &PgPool, user_id: Uuid, new_password: &str) -> Result<(), String> {
    let password_hash = hash_password(new_password)?;
    sqlx::query("UPDATE users SET password_hash = $1 WHERE id = $2")
        .bind(&password_hash)
        .bind(user_id)
        .execute(pool)
        .await
        .map_err(|e| format!("Failed to update password: {}", e))?;
    Ok(())
}

pub async fn get_user_by_id_with_hash(pool: &PgPool, user_id: Uuid) -> Result<(Uuid, String, Option<String>, String, Option<String>), String> {
    sqlx::query_as::<_, (Uuid, String, Option<String>, String, Option<String>)>(
        "SELECT id, email, full_name, role, password_hash FROM users WHERE id = $1"
    )
    .bind(user_id)
    .fetch_optional(pool)
    .await
    .map_err(|e| format!("Get user error: {}", e))?
    .ok_or_else(|| "User not found".to_string())
}

// ─── GitHub OAuth helpers ────────────────────────────────────────────

/// GitHub user profile returned by the GitHub API /user endpoint.
#[derive(Debug, serde::Deserialize)]
pub struct GithubUser {
    pub id: i64,
    pub login: String,
    pub name: Option<String>,
    pub email: Option<String>,
    #[allow(dead_code)]
    pub avatar_url: Option<String>,
}

/// Exchange an authorization `code` for an access token via GitHub's
/// "web application" OAuth flow (RFC 6749).
pub async fn exchange_github_code(code: &str) -> Result<String, String> {
    let client_id = std::env::var("GITHUB_CLIENT_ID").map_err(|_| "GITHUB_CLIENT_ID not set".to_string())?;
    let client_secret = std::env::var("GITHUB_CLIENT_SECRET").map_err(|_| "GITHUB_CLIENT_SECRET not set".to_string())?;

    let client = reqwest::Client::new();
    let resp = client
        .post("https://github.com/login/oauth/access_token")
        .header("Accept", "application/json")
        .json(&serde_json::json!({
            "client_id": client_id,
            "client_secret": client_secret,
            "code": code,
        }))
        .send()
        .await
        .map_err(|e| format!("GitHub token request failed: {}", e))?;

    if !resp.status().is_success() {
        return Err(format!("GitHub returned status {}", resp.status()));
    }

    let body: serde_json::Value = resp
        .json()
        .await
        .map_err(|e| format!("Failed to parse GitHub token response: {}", e))?;

    body["access_token"]
        .as_str()
        .map(|s| s.to_string())
        .ok_or_else(|| "No access_token in GitHub response".to_string())
}

/// Fetch the authenticated GitHub user's profile.
pub async fn fetch_github_user(access_token: &str) -> Result<GithubUser, String> {
    let client = reqwest::Client::new();
    client
        .get("https://api.github.com/user")
        .header("Authorization", format!("Bearer {}", access_token))
        .header("User-Agent", "CodeHaat")
        .send()
        .await
        .map_err(|e| format!("GitHub user request failed: {}", e))?
        .json()
        .await
        .map_err(|e| format!("Failed to parse GitHub user: {}", e))
}

/// Find an existing user linked to this GitHub ID.
pub async fn get_user_by_github_id(pool: &PgPool, github_id: i64) -> Result<User, String> {
    sqlx::query_as::<_, User>(
        "SELECT id, email, full_name, role, github_username FROM users WHERE github_id = $1"
    )
    .bind(github_id.to_string())
    .fetch_optional(pool)
    .await
    .map_err(|e| format!("Get user by github_id error: {}", e))?
    .ok_or_else(|| "User not found".to_string())
}

/// Create a new user from GitHub profile data.
/// The user has `password_hash = NULL` (OAuth-only account).
pub async fn create_github_user(
    pool: &PgPool,
    github_id: i64,
    github_username: &str,
    email: &str,
    full_name: &str,
    role: &str,
) -> Result<User, String> {
    let id = Uuid::new_v4();
    sqlx::query_as::<_, User>(
        r#"INSERT INTO users (id, email, full_name, role, github_id, github_username)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING id, email, full_name, role, github_username"#
    )
    .bind(id)
    .bind(email)
    .bind(full_name)
    .bind(role)
    .bind(github_id.to_string())
    .bind(github_username)
    .fetch_one(pool)
    .await
    .map_err(|e| format!("Create GitHub user error: {}", e))
}

/// Link GitHub credentials to an existing user account (matched by email).
pub async fn link_github_to_user(
    pool: &PgPool,
    user_id: Uuid,
    github_id: i64,
    github_username: &str,
) -> Result<(), String> {
    sqlx::query("UPDATE users SET github_id = $1, github_username = $2 WHERE id = $3")
        .bind(github_id.to_string())
        .bind(github_username)
        .bind(user_id)
        .execute(pool)
        .await
        .map_err(|e| format!("Failed to link GitHub: {}", e))?;
    Ok(())
}

/// Store the GitHub access token in the user's profile (for future repo operations).
pub async fn store_github_token(
    pool: &PgPool,
    user_id: Uuid,
    access_token: &str,
) -> Result<(), String> {
    let encrypted_token = encrypt_github_token(access_token);
    sqlx::query("INSERT INTO profiles (id, github_access_token) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET github_access_token = $2")
        .bind(user_id)
        .bind(&encrypted_token)
        .execute(pool)
        .await
        .map_err(|e| format!("Failed to store GitHub token: {}", e))?;
    Ok(())
}
