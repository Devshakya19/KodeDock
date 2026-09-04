use crate::auth::models::User;
use crate::errors::AppError;
use chrono::{DateTime, Utc};
use sqlx::PgPool;
use uuid::Uuid;

pub struct AuthRepository;

impl AuthRepository {
    pub async fn create_user(
        pool: &PgPool,
        email: &str,
        password_hash: &str,
        full_name: &str,
        role: &str,
    ) -> Result<User, AppError> {
        let user = sqlx::query_as::<_, User>(
            r#"
            INSERT INTO users (email, password_hash, full_name, role)
            VALUES ($1, $2, $3, $4)
            RETURNING id, email, password_hash, full_name, role, avatar_url, bio,
                      pan_number, gst_number, is_email_verified, is_banned, created_at, updated_at
            "#,
        )
        .bind(email.to_lowercase().trim())
        .bind(password_hash)
        .bind(full_name.trim())
        .bind(role)
        .fetch_one(pool)
        .await?;

        // Initialize user account balance row
        sqlx::query(
            r#"
            INSERT INTO user_accounts (user_id)
            VALUES ($1)
            ON CONFLICT (user_id) DO NOTHING
            "#,
        )
        .bind(user.id)
        .execute(pool)
        .await?;

        Ok(user)
    }

    pub async fn find_by_email(pool: &PgPool, email: &str) -> Result<Option<User>, AppError> {
        let user = sqlx::query_as::<_, User>(
            r#"
            SELECT id, email, password_hash, full_name, role, avatar_url, bio,
                   pan_number, gst_number, is_email_verified, is_banned, created_at, updated_at
            FROM users
            WHERE email = $1
            "#,
        )
        .bind(email.to_lowercase().trim())
        .fetch_optional(pool)
        .await?;

        Ok(user)
    }

    pub async fn find_by_id(pool: &PgPool, id: Uuid) -> Result<Option<User>, AppError> {
        let user = sqlx::query_as::<_, User>(
            r#"
            SELECT id, email, password_hash, full_name, role, avatar_url, bio,
                   pan_number, gst_number, is_email_verified, is_banned, created_at, updated_at
            FROM users
            WHERE id = $1
            "#,
        )
        .bind(id)
        .fetch_optional(pool)
        .await?;

        Ok(user)
    }

    pub async fn insert_refresh_token(
        pool: &PgPool,
        user_id: Uuid,
        token_hash: &str,
        family_id: Uuid,
        expires_at: DateTime<Utc>,
    ) -> Result<Uuid, AppError> {
        let id: Uuid = sqlx::query_scalar(
            r#"
            INSERT INTO refresh_tokens (user_id, token_hash, family_id, expires_at)
            VALUES ($1, $2, $3, $4)
            RETURNING id
            "#,
        )
        .bind(user_id)
        .bind(token_hash)
        .bind(family_id)
        .bind(expires_at)
        .fetch_one(pool)
        .await?;

        Ok(id)
    }

    pub async fn find_refresh_token_by_hash(
        pool: &PgPool,
        token_hash: &str,
    ) -> Result<Option<(Uuid, Uuid, Uuid, bool, DateTime<Utc>)>, AppError> {
        let record = sqlx::query_as::<_, (Uuid, Uuid, Uuid, bool, DateTime<Utc>)>(
            r#"
            SELECT id, user_id, family_id, is_revoked, expires_at
            FROM refresh_tokens
            WHERE token_hash = $1
            "#,
        )
        .bind(token_hash)
        .fetch_optional(pool)
        .await?;

        Ok(record)
    }

    pub async fn mark_token_revoked(
        pool: &PgPool,
        token_id: Uuid,
        replaced_by: Option<Uuid>,
    ) -> Result<(), AppError> {
        sqlx::query(
            r#"
            UPDATE refresh_tokens
            SET is_revoked = TRUE, replaced_by = $2
            WHERE id = $1
            "#,
        )
        .bind(token_id)
        .bind(replaced_by)
        .execute(pool)
        .await?;

        Ok(())
    }

    /// Replay Detection: Revokes entire token family immediately
    pub async fn revoke_token_family(pool: &PgPool, family_id: Uuid) -> Result<u64, AppError> {
        let result = sqlx::query(
            r#"
            UPDATE refresh_tokens
            SET is_revoked = TRUE
            WHERE family_id = $1
            "#,
        )
        .bind(family_id)
        .execute(pool)
        .await?;

        Ok(result.rows_affected())
    }
}

impl AuthRepository {
    pub async fn save_totp_secret(
        pool: &PgPool,
        user_id: Uuid,
        encrypted_secret: &str,
    ) -> Result<(), AppError> {
        sqlx::query(
            r#"
            INSERT INTO totp_secrets (user_id, encrypted_secret, is_enabled)
            VALUES ($1, $2, FALSE)
            ON CONFLICT (user_id) 
            DO UPDATE SET encrypted_secret = EXCLUDED.encrypted_secret, is_enabled = FALSE
            "#
        )
        .bind(user_id)
        .bind(encrypted_secret)
        .execute(pool)
        .await?;

        Ok(())
    }

    pub async fn get_totp_secret(
        pool: &PgPool,
        user_id: Uuid,
    ) -> Result<Option<(String, bool)>, AppError> {
        let record = sqlx::query_as::<_, (String, bool)>(
            r#"
            SELECT encrypted_secret, is_enabled
            FROM totp_secrets
            WHERE user_id = $1
            "#
        )
        .bind(user_id)
        .fetch_optional(pool)
        .await?;

        Ok(record)
    }

    pub async fn enable_totp(
        pool: &PgPool,
        user_id: Uuid,
    ) -> Result<(), AppError> {
        sqlx::query(
            r#"
            UPDATE totp_secrets
            SET is_enabled = TRUE, verified_at = NOW()
            WHERE user_id = $1
            "#
        )
        .bind(user_id)
        .execute(pool)
        .await?;

        Ok(())
    }

    pub async fn mark_email_verified(
        pool: &PgPool,
        user_id: Uuid,
    ) -> Result<(), AppError> {
        sqlx::query(
            r#"
            UPDATE users
            SET is_email_verified = TRUE
            WHERE id = $1
            "#
        )
        .bind(user_id)
        .execute(pool)
        .await?;
        
        Ok(())
    }

    pub async fn find_or_create_oauth_user(
        pool: &PgPool,
        provider: &str,
        provider_user_id: &str,
        email: Option<&str>,
        full_name: &str,
        avatar_url: Option<&str>,
    ) -> Result<User, AppError> {
        let mut tx = pool.begin().await?;

        let existing_oauth = sqlx::query_as::<_, (Uuid,)>(
            r#"
            SELECT user_id FROM oauth_accounts
            WHERE provider = $1 AND provider_user_id = $2
            "#
        )
        .bind(provider)
        .bind(provider_user_id)
        .fetch_optional(&mut *tx)
        .await?;

        if let Some((user_id,)) = existing_oauth {
            let user = sqlx::query_as::<_, User>(
                r#"
                SELECT id, email, password_hash, full_name, role, avatar_url, bio,
                       pan_number, gst_number, is_email_verified, is_banned, created_at, updated_at
                FROM users WHERE id = $1
                "#
            )
            .bind(user_id)
            .fetch_one(&mut *tx)
            .await?;
            
            tx.commit().await?;
            return Ok(user);
        }

        let email_to_use = email.unwrap_or_else(|| "");
        
        // Let's check if the email already exists to link the account.
        let user_id = if !email_to_use.is_empty() {
            let existing_user = sqlx::query_as::<_, (Uuid,)>(
                "SELECT id FROM users WHERE email = $1"
            )
            .bind(email_to_use)
            .fetch_optional(&mut *tx)
            .await?;

            if let Some((uid,)) = existing_user {
                uid
            } else {
                let new_user = sqlx::query_as::<_, (Uuid,)>(
                    r#"
                    INSERT INTO users (email, password_hash, full_name, role, avatar_url, is_email_verified)
                    VALUES ($1, $2, $3, 'buyer', $4, TRUE)
                    RETURNING id
                    "#
                )
                .bind(email_to_use)
                .bind("oauth_placeholder_no_password") // Cannot login via standard password flow
                .bind(full_name)
                .bind(avatar_url)
                .fetch_one(&mut *tx)
                .await?;
                new_user.0
            }
        } else {
            return Err(AppError::BadRequest("Email is required for OAuth".to_string()));
        };

        sqlx::query(
            r#"
            INSERT INTO oauth_accounts (user_id, provider, provider_user_id)
            VALUES ($1, $2, $3)
            "#
        )
        .bind(user_id)
        .bind(provider)
        .bind(provider_user_id)
        .execute(&mut *tx)
        .await?;

        let user = sqlx::query_as::<_, User>(
            r#"
            SELECT id, email, password_hash, full_name, role, avatar_url, bio,
                   pan_number, gst_number, is_email_verified, is_banned, created_at, updated_at
            FROM users WHERE id = $1
            "#
        )
        .bind(user_id)
        .fetch_one(&mut *tx)
        .await?;

        tx.commit().await?;
        Ok(user)
    }
}
