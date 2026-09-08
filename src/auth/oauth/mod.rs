pub mod github;
pub mod google;

use crate::auth::errors::AuthError;
use serde::{Deserialize, Serialize};
use std::future::Future;
use std::pin::Pin;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OAuthTokenResponse {
    pub access_token: String,
    pub token_type: Option<String>,
    pub refresh_token: Option<String>,
    pub expires_in: Option<u64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OAuthUserProfile {
    pub provider_user_id: String,
    pub email: String,
    pub full_name: Option<String>,
    pub username: Option<String>,
    pub avatar_url: Option<String>,
}

/// Pluggable OAuth Provider Trait
/// To add any new provider (e.g. Discord, Twitter, Gitlab), simply implement
/// this trait in a new file under `src/auth/oauth/<provider>.rs` and register it
/// in `get_provider()`.
pub trait OAuthProvider: Send + Sync {
    fn name(&self) -> &'static str;

    fn exchange_code<'a>(
        &'a self,
        code: &'a str,
    ) -> Pin<Box<dyn Future<Output = Result<OAuthTokenResponse, AuthError>> + Send + 'a>>;

    fn fetch_user<'a>(
        &'a self,
        access_token: &'a str,
    ) -> Pin<Box<dyn Future<Output = Result<OAuthUserProfile, AuthError>> + Send + 'a>>;
}

/// Factory registry to resolve provider implementation dynamically.
pub fn get_provider(provider_name: &str) -> Result<Box<dyn OAuthProvider>, AuthError> {
    match provider_name.to_lowercase().as_str() {
        "github" => Ok(Box::new(github::GitHubOAuthProvider::new())),
        "google" => Ok(Box::new(google::GoogleOAuthProvider::new())),
        other => Err(AuthError::OAuth(format!(
            "OAuth provider '{}' is not supported. Supported providers: github, google",
            other
        ))),
    }
}
