use chrono::{DateTime, Utc};
use sqlx::PgPool;
use uuid::Uuid;

use crate::auth::errors::AuthError;
use crate::auth::models::{
    PasswordResetRecord, RefreshTokenRecord, UserSummary, UserSummaryRow, UserWithPasswordHash,
};

/// Ensure required authentication tables and indexes exist.
pub async fn init_auth_tables(pool: &PgPool) -> Result<(), AuthError> {
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS refresh_tokens (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            token_hash TEXT NOT NULL UNIQUE,
            family_id UUID NOT NULL,
            expires_at TIMESTAMPTZ NOT NULL,
            is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS idx_refresh_tokens_hash ON refresh_tokens (token_hash);
        CREATE INDEX IF NOT EXISTS idx_refresh_tokens_family ON refresh_tokens (family_id);
        "#,
    )
    .execute(pool)
    .await?;

    Ok(())
}

// ─── USER REPOSITORY OPERATIONS ──────────────────────────────────────────

pub async fn create_user(
    pool: &PgPool,
    email: &str,
    password_hash: &str,
    full_name: &str,
    role: &str,
) -> Result<UserSummary, AuthError> {
    let row = sqlx::query_as::<_, UserSummaryRow>(
        r#"
        INSERT INTO users (email, password_hash, full_name, role)
        VALUES ($1, $2, $3, $4)
        RETURNING id, email, full_name, role, github_username
        "#,
    )
    .bind(email)
    .bind(password_hash)
    .bind(full_name)
    .bind(role)
    .fetch_one(pool)
    .await?;

    // Create corresponding profile
    let _ = sqlx::query(
        r#"
        INSERT INTO profiles (id, full_name, role)
        VALUES ($1, $2, $3)
        ON CONFLICT (id) DO NOTHING
        "#,
    )
    .bind(row.id)
    .bind(full_name)
    .bind(role)
    .execute(pool)
    .await;

    // Create corresponding wallet initialized to 0
    let _ = sqlx::query(
        r#"
        INSERT INTO wallets (user_id, balance_paise)
        VALUES ($1, 0)
        ON CONFLICT (user_id) DO NOTHING
        "#,
    )
    .bind(row.id)
    .execute(pool)
    .await;

    Ok(row.into_summary())
}

pub async fn find_user_by_email(
    pool: &PgPool,
    email: &str,
) -> Result<Option<UserWithPasswordHash>, AuthError> {
    let user = sqlx::query_as::<_, UserWithPasswordHash>(
        r#"
        SELECT id, email, password_hash, full_name, role, github_username, is_active
        FROM users
        WHERE LOWER(email) = LOWER($1)
        "#,
    )
    .bind(email)
    .fetch_optional(pool)
    .await?;

    Ok(user)
}

pub async fn find_user_by_id(pool: &PgPool, user_id: Uuid) -> Result<Option<UserSummary>, AuthError> {
    let user = sqlx::query_as::<_, UserSummaryRow>(
        r#"
        SELECT id, email, full_name, role, github_username
        FROM users
        WHERE id = $1
        "#,
    )
    .bind(user_id)
    .fetch_optional(pool)
    .await?;

    Ok(user.map(|r| r.into_summary()))
}

pub async fn find_user_by_id_with_hash(
    pool: &PgPool,
    user_id: Uuid,
) -> Result<Option<UserWithPasswordHash>, AuthError> {
    let user = sqlx::query_as::<_, UserWithPasswordHash>(
        r#"
        SELECT id, email, password_hash, full_name, role, github_username, is_active
        FROM users
        WHERE id = $1
        "#,
    )
    .bind(user_id)
    .fetch_optional(pool)
    .await?;

    Ok(user)
}

pub async fn verify_user_email(pool: &PgPool, user_id: Uuid) -> Result<(), AuthError> {
    sqlx::query("UPDATE users SET is_verified = TRUE, updated_at = NOW() WHERE id = $1")
        .bind(user_id)
        .execute(pool)
        .await?;

    Ok(())
}

pub async fn update_password(
    pool: &PgPool,
    user_id: Uuid,
    new_password_hash: &str,
) -> Result<(), AuthError> {
    sqlx::query(
        r#"
        UPDATE users
        SET password_hash = $1, updated_at = NOW()
        WHERE id = $2
        "#,
    )
    .bind(new_password_hash)
    .bind(user_id)
    .execute(pool)
    .await?;

    Ok(())
}

pub async fn delete_user(pool: &PgPool, user_id: Uuid) -> Result<(), AuthError> {
    sqlx::query("DELETE FROM users WHERE id = $1")
        .bind(user_id)
        .execute(pool)
        .await?;

    Ok(())
}

// ─── REFRESH TOKEN & TOKEN FAMILY ROTATION REPOSITORY ─────────────────────

pub async fn create_refresh_token(
    pool: &PgPool,
    user_id: Uuid,
    token_hash: &str,
    family_id: Uuid,
    expires_at: DateTime<Utc>,
) -> Result<RefreshTokenRecord, AuthError> {
    let record = sqlx::query_as::<_, RefreshTokenRecord>(
        r#"
        INSERT INTO refresh_tokens (user_id, token_hash, family_id, expires_at)
        VALUES ($1, $2, $3, $4)
        RETURNING id, user_id, token_hash, family_id, expires_at, is_revoked, created_at
        "#,
    )
    .bind(user_id)
    .bind(token_hash)
    .bind(family_id)
    .bind(expires_at)
    .fetch_one(pool)
    .await?;

    Ok(record)
}

pub async fn find_refresh_token_by_hash(
    pool: &PgPool,
    token_hash: &str,
) -> Result<Option<RefreshTokenRecord>, AuthError> {
    let token = sqlx::query_as::<_, RefreshTokenRecord>(
        r#"
        SELECT id, user_id, token_hash, family_id, expires_at, is_revoked, created_at
        FROM refresh_tokens
        WHERE token_hash = $1
        "#,
    )
    .bind(token_hash)
    .fetch_optional(pool)
    .await?;

    Ok(token)
}

pub async fn revoke_refresh_token(pool: &PgPool, token_id: Uuid) -> Result<(), AuthError> {
    sqlx::query("UPDATE refresh_tokens SET is_revoked = TRUE WHERE id = $1")
        .bind(token_id)
        .execute(pool)
        .await?;

    Ok(())
}

/// Revokes all refresh tokens in a family (triggered upon replay/theft detection).
pub async fn revoke_family_tokens(pool: &PgPool, family_id: Uuid) -> Result<(), AuthError> {
    sqlx::query("UPDATE refresh_tokens SET is_revoked = TRUE WHERE family_id = $1")
        .bind(family_id)
        .execute(pool)
        .await?;

    Ok(())
}

// ─── PASSWORD RESET REPOSITORY ───────────────────────────────────────────

pub async fn create_password_reset_token(
    pool: &PgPool,
    user_id: Uuid,
    token: &str,
    expires_at: DateTime<Utc>,
) -> Result<(), AuthError> {
    sqlx::query(
        r#"
        INSERT INTO password_reset_tokens (user_id, token, expires_at)
        VALUES ($1, $2, $3)
        "#,
    )
    .bind(user_id)
    .bind(token)
    .bind(expires_at)
    .execute(pool)
    .await?;

    Ok(())
}

pub async fn find_valid_reset_token(
    pool: &PgPool,
    token: &str,
) -> Result<Option<PasswordResetRecord>, AuthError> {
    let record = sqlx::query_as::<_, PasswordResetRecord>(
        r#"
        SELECT id, user_id, token, expires_at, used, created_at
        FROM password_reset_tokens
        WHERE token = $1 AND used = FALSE AND expires_at > NOW()
        "#,
    )
    .bind(token)
    .fetch_optional(pool)
    .await?;

    Ok(record)
}

pub async fn mark_reset_token_used(pool: &PgPool, token: &str) -> Result<(), AuthError> {
    sqlx::query("UPDATE password_reset_tokens SET used = TRUE WHERE token = $1")
        .bind(token)
        .execute(pool)
        .await?;

    Ok(())
}

// ─── OAUTH REPOSITORY OPERATIONS ──────────────────────────────────────────

pub async fn find_user_by_github_id(
    pool: &PgPool,
    github_id: &str,
) -> Result<Option<UserSummary>, AuthError> {
    let user = sqlx::query_as::<_, UserSummaryRow>(
        r#"
        SELECT id, email, full_name, role, github_username
        FROM users
        WHERE github_id = $1
        "#,
    )
    .bind(github_id)
    .fetch_optional(pool)
    .await?;

    Ok(user.map(|r| r.into_summary()))
}

pub async fn find_user_by_google_id(
    pool: &PgPool,
    google_id: &str,
) -> Result<Option<UserSummary>, AuthError> {
    let user = sqlx::query_as::<_, UserSummaryRow>(
        r#"
        SELECT id, email, full_name, role, github_username
        FROM users
        WHERE google_id = $1
        "#,
    )
    .bind(google_id)
    .fetch_optional(pool)
    .await?;

    Ok(user.map(|r| r.into_summary()))
}

pub async fn create_oauth_user(
    pool: &PgPool,
    provider: &str,
    provider_user_id: &str,
    username: Option<&str>,
    email: &str,
    full_name: &str,
    role: &str,
) -> Result<UserSummary, AuthError> {
    let user = match provider {
        "github" => {
            sqlx::query_as::<_, UserSummaryRow>(
                r#"
                INSERT INTO users (email, full_name, role, github_id, github_username, is_verified)
                VALUES ($1, $2, $3, $4, $5, TRUE)
                RETURNING id, email, full_name, role, github_username
                "#,
            )
            .bind(email)
            .bind(full_name)
            .bind(role)
            .bind(provider_user_id)
            .bind(username)
            .fetch_one(pool)
            .await?
        }
        "google" => {
            sqlx::query_as::<_, UserSummaryRow>(
                r#"
                INSERT INTO users (email, full_name, role, google_id, is_verified)
                VALUES ($1, $2, $3, $4, TRUE)
                RETURNING id, email, full_name, role, github_username
                "#,
            )
            .bind(email)
            .bind(full_name)
            .bind(role)
            .bind(provider_user_id)
            .fetch_one(pool)
            .await?
        }
        _ => return Err(AuthError::OAuth(format!("Unsupported provider: {}", provider))),
    };

    // Create profile
    let _ = sqlx::query(
        r#"
        INSERT INTO profiles (id, full_name, role, github_username)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name
        "#,
    )
    .bind(user.id)
    .bind(full_name)
    .bind(role)
    .bind(username)
    .execute(pool)
    .await;

    // Create wallet
    let _ = sqlx::query(
        r#"
        INSERT INTO wallets (user_id, balance_paise)
        VALUES ($1, 0)
        ON CONFLICT (user_id) DO NOTHING
        "#,
    )
    .bind(user.id)
    .execute(pool)
    .await;

    Ok(user.into_summary())
}

pub async fn link_github_to_user(
    pool: &PgPool,
    user_id: Uuid,
    github_id: &str,
    github_username: &str,
) -> Result<(), AuthError> {
    sqlx::query("UPDATE users SET github_id = $1, github_username = $2, updated_at = NOW() WHERE id = $3")
        .bind(github_id)
        .bind(github_username)
        .bind(user_id)
        .execute(pool)
        .await?;

    sqlx::query(
        r#"
        INSERT INTO profiles (id, github_username)
        VALUES ($1, $2)
        ON CONFLICT (id) DO UPDATE SET github_username = $2
        "#,
    )
    .bind(user_id)
    .bind(github_username)
    .execute(pool)
    .await?;

    Ok(())
}

pub async fn link_google_to_user(
    pool: &PgPool,
    user_id: Uuid,
    google_id: &str,
) -> Result<(), AuthError> {
    sqlx::query("UPDATE users SET google_id = $1, updated_at = NOW() WHERE id = $2")
        .bind(google_id)
        .bind(user_id)
        .execute(pool)
        .await?;

    Ok(())
}

pub async fn unlink_github_from_user(pool: &PgPool, user_id: Uuid) -> Result<(), AuthError> {
    sqlx::query("UPDATE users SET github_id = NULL, github_username = NULL WHERE id = $1")
        .bind(user_id)
        .execute(pool)
        .await?;

    sqlx::query("UPDATE profiles SET github_username = NULL, github_access_token = NULL WHERE id = $1")
        .bind(user_id)
        .execute(pool)
        .await?;

    Ok(())
}

pub async fn unlink_google_from_user(pool: &PgPool, user_id: Uuid) -> Result<(), AuthError> {
    sqlx::query("UPDATE users SET google_id = NULL WHERE id = $1")
        .bind(user_id)
        .execute(pool)
        .await?;

    Ok(())
}

pub async fn store_github_token(
    pool: &PgPool,
    user_id: Uuid,
    encrypted_token: &str,
) -> Result<(), AuthError> {
    sqlx::query(
        r#"
        INSERT INTO profiles (id, github_access_token)
        VALUES ($1, $2)
        ON CONFLICT (id) DO UPDATE SET github_access_token = $2
        "#,
    )
    .bind(user_id)
    .bind(encrypted_token)
    .execute(pool)
    .await?;

    Ok(())
}
