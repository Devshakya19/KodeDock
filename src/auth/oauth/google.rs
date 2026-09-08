use crate::auth::errors::AuthError;
use crate::auth::oauth::{OAuthProvider, OAuthTokenResponse, OAuthUserProfile};
use serde::Deserialize;
use std::future::Future;
use std::pin::Pin;

#[derive(Debug, Default, Clone)]
pub struct GoogleOAuthProvider;

impl GoogleOAuthProvider {
    pub fn new() -> Self {
        Self
    }
}

#[derive(Debug, Deserialize)]
struct GoogleTokenPayload {
    access_token: Option<String>,
    token_type: Option<String>,
    expires_in: Option<u64>,
    refresh_token: Option<String>,
    error: Option<String>,
    error_description: Option<String>,
}

#[derive(Debug, Deserialize)]
struct GoogleUserRaw {
    pub sub: String,
    pub email: String,
    #[allow(dead_code)]
    pub email_verified: Option<bool>,
    pub name: Option<String>,
    given_name: Option<String>,
    picture: Option<String>,
}

impl OAuthProvider for GoogleOAuthProvider {
    fn name(&self) -> &'static str {
        "google"
    }

    fn exchange_code<'a>(
        &'a self,
        code: &'a str,
    ) -> Pin<Box<dyn Future<Output = Result<OAuthTokenResponse, AuthError>> + Send + 'a>> {
        Box::pin(async move {
            let client_id = std::env::var("GOOGLE_CLIENT_ID")
                .map_err(|_| AuthError::OAuth("GOOGLE_CLIENT_ID environment variable not set".to_string()))?;
            let client_secret = std::env::var("GOOGLE_CLIENT_SECRET")
                .map_err(|_| AuthError::OAuth("GOOGLE_CLIENT_SECRET environment variable not set".to_string()))?;
            let redirect_uri = std::env::var("GOOGLE_REDIRECT_URI")
                .unwrap_or_else(|_| "http://localhost:3000/api/auth/callback/google".to_string());

            let client = reqwest::Client::new();
            let resp = client
                .post("https://oauth2.googleapis.com/token")
                .header("Accept", "application/json")
                .header("User-Agent", "KodeDock-Core-Engine")
                .form(&[
                    ("client_id", client_id.as_str()),
                    ("client_secret", client_secret.as_str()),
                    ("code", code),
                    ("grant_type", "authorization_code"),
                    ("redirect_uri", redirect_uri.as_str()),
                ])
                .send()
                .await
                .map_err(|e| AuthError::OAuth(format!("Google token network request failed: {}", e)))?;

            if !resp.status().is_success() {
                return Err(AuthError::OAuth(format!(
                    "Google token endpoint returned HTTP error status {}",
                    resp.status()
                )));
            }

            let payload = resp
                .json::<GoogleTokenPayload>()
                .await
                .map_err(|e| AuthError::OAuth(format!("Failed to parse Google token payload: {}", e)))?;

            if let Some(err) = payload.error {
                let desc = payload.error_description.unwrap_or_default();
                return Err(AuthError::OAuth(format!("Google OAuth error: {} ({})", err, desc)));
            }

            let access_token = payload
                .access_token
                .ok_or_else(|| AuthError::OAuth("No access_token returned by Google".to_string()))?;

            Ok(OAuthTokenResponse {
                access_token,
                token_type: payload.token_type,
                refresh_token: payload.refresh_token,
                expires_in: payload.expires_in,
            })
        })
    }

    fn fetch_user<'a>(
        &'a self,
        access_token: &'a str,
    ) -> Pin<Box<dyn Future<Output = Result<OAuthUserProfile, AuthError>> + Send + 'a>> {
        Box::pin(async move {
            let client = reqwest::Client::new();

            let user_resp = client
                .get("https://www.googleapis.com/oauth2/v3/userinfo")
                .header("Authorization", format!("Bearer {}", access_token))
                .header("User-Agent", "KodeDock-Core-Engine")
                .send()
                .await
                .map_err(|e| AuthError::OAuth(format!("Google user profile request failed: {}", e)))?;

            if !user_resp.status().is_success() {
                return Err(AuthError::OAuth(format!(
                    "Google user API returned HTTP error {}",
                    user_resp.status()
                )));
            }

            let raw_user = user_resp
                .json::<GoogleUserRaw>()
                .await
                .map_err(|e| AuthError::OAuth(format!("Failed to parse Google user data: {}", e)))?;

            let username = raw_user
                .email
                .split('@')
                .next()
                .unwrap_or(&raw_user.sub)
                .to_string();

            Ok(OAuthUserProfile {
                provider_user_id: raw_user.sub,
                email: raw_user.email,
                full_name: raw_user.name.or(raw_user.given_name),
                username: Some(username),
                avatar_url: raw_user.picture,
            })
        })
    }
}
