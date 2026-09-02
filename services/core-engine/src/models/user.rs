use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Profile {
    pub id: Uuid,
    pub full_name: Option<String>,
    pub role: String,
    pub bio: Option<String>,
    pub avatar_url: Option<String>,
    pub github_username: Option<String>,
    #[serde(skip_serializing)]
    #[allow(dead_code)]
    pub github_access_token: Option<String>,
    pub website: Option<String>,
    pub location: Option<String>,
    pub is_verified: bool,
    #[sqlx(default)]
    pub is_github_connected: bool,
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
}
