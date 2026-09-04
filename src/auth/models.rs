use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct User {
    pub id: Uuid,
    pub email: String,
    pub password_hash: String,
    pub full_name: String,
    pub role: String,
    pub avatar_url: Option<String>,
    pub bio: Option<String>,
    pub pan_number: Option<String>,
    pub gst_number: Option<String>,
    pub is_email_verified: bool,
    pub is_banned: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UserPublicProfile {
    pub id: Uuid,
    pub email: String,
    pub full_name: String,
    pub role: String,
    pub avatar_url: Option<String>,
    pub is_email_verified: bool,
    pub created_at: DateTime<Utc>,
}

impl From<User> for UserPublicProfile {
    fn from(u: User) -> Self {
        Self {
            id: u.id,
            email: u.email,
            full_name: u.full_name,
            role: u.role,
            avatar_url: u.avatar_url,
            is_email_verified: u.is_email_verified,
            created_at: u.created_at,
        }
    }
}

#[derive(Debug, Deserialize)]
pub struct SignupRequest {
    pub email: String,
    pub password: String,
    pub full_name: String,
    pub role: Option<String>, // 'buyer' or 'seller'
}

#[derive(Debug, Deserialize)]
pub struct LoginRequest {
    pub email: String,
    pub password: String,
}

#[derive(Debug, Serialize)]
pub struct AuthResponse {
    pub user: UserPublicProfile,
    pub access_token: String,
    pub expires_in_seconds: i64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TokenClaims {
    pub sub: String, // User UUID string
    pub email: String,
    pub role: String,
    pub jti: String, // Unique JWT token ID for revocation tracking
    pub exp: usize,
    pub iat: usize,
}

#[derive(Debug, Deserialize)]
pub struct TotpVerifyRequest {
    pub token: String,
}

#[derive(Debug, Deserialize)]
pub struct OAuthCallbackRequest {
    pub code: String,
    pub state: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct SendVerificationEmailRequest {
    pub email: String,
}

#[derive(Debug, Deserialize)]
pub struct VerifyEmailRequest {
    pub email: String,
    pub otp: String,
}

#[derive(Debug, Deserialize)]
pub struct TotpSetupRequest {
    pub email: String,
}
