use argon2::{password_hash::{rand_core::OsRng, PasswordHasher, SaltString}, Argon2, PasswordHash, PasswordVerifier};
use jsonwebtoken::{encode, decode, Header, EncodingKey, DecodingKey, Validation, Algorithm};
use serde::{Deserialize, Serialize};
use sqlx::{PgPool, FromRow};
use uuid::Uuid;
use chrono::{Utc, Duration};

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct User {
    pub id: Uuid,
    pub email: String,
    pub full_name: Option<String>,
    pub role: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,
    pub email: String,
    pub full_name: Option<String>,
    pub role: String,
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
        exp: expires.timestamp() as usize,
        iat: now.timestamp() as usize,
    };

    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(secret.as_bytes()),
    )
    .map_err(|e| format!("Token generation error: {}", e))
}

pub fn verify_token(token: &str, secret: &str) -> Result<Claims, String> {
    let token_data = decode::<Claims>(
        token,
        &DecodingKey::from_secret(secret.as_bytes()),
        &Validation::new(Algorithm::HS256),
    )
    .map_err(|e| format!("Token verification error: {}", e))?;

    Ok(token_data.claims)
}

pub async fn create_user(pool: &PgPool, email: &str, password: &str, full_name: &str, role: &str) -> Result<User, String> {
    let password_hash = hash_password(password)?;
    let id = Uuid::new_v4();

    let user = sqlx::query_as::<_, User>(
        r#"INSERT INTO users (id, email, password_hash, full_name, role)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING id, email, full_name, role"#
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
        "SELECT id, email, full_name, role FROM users WHERE id = $1"
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
