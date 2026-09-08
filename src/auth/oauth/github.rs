use crate::auth::errors::AuthError;
use crate::auth::oauth::{OAuthProvider, OAuthTokenResponse, OAuthUserProfile};
use serde::Deserialize;
use std::future::Future;
use std::pin::Pin;

#[derive(Debug, Default, Clone)]
pub struct GitHubOAuthProvider;

impl GitHubOAuthProvider {
    pub fn new() -> Self {
        Self
    }
}

#[derive(Debug, Deserialize)]
struct GitHubTokenPayload {
    access_token: Option<String>,
    token_type: Option<String>,
    error: Option<String>,
    error_description: Option<String>,
}

#[derive(Debug, Deserialize)]
struct GitHubUserRaw {
    id: i64,
    login: String,
    name: Option<String>,
    email: Option<String>,
    avatar_url: Option<String>,
}

#[derive(Debug, Deserialize)]
struct GitHubEmailItem {
    email: String,
    primary: bool,
    verified: bool,
}

impl OAuthProvider for GitHubOAuthProvider {
    fn name(&self) -> &'static str {
        "github"
    }

    fn exchange_code<'a>(
        &'a self,
        code: &'a str,
    ) -> Pin<Box<dyn Future<Output = Result<OAuthTokenResponse, AuthError>> + Send + 'a>> {
        Box::pin(async move {
            let client_id = std::env::var("GITHUB_CLIENT_ID")
                .map_err(|_| AuthError::OAuth("GITHUB_CLIENT_ID environment variable not set".to_string()))?;
            let client_secret = std::env::var("GITHUB_CLIENT_SECRET")
                .map_err(|_| AuthError::OAuth("GITHUB_CLIENT_SECRET environment variable not set".to_string()))?;

            let client = reqwest::Client::new();
            let resp = client
                .post("https://github.com/login/oauth/access_token")
                .header("Accept", "application/json")
                .header("User-Agent", "KodeDock-Core-Engine")
                .json(&serde_json::json!({
                    "client_id": client_id,
                    "client_secret": client_secret,
                    "code": code,
                }))
                .send()
                .await
                .map_err(|e| AuthError::OAuth(format!("GitHub token network request failed: {}", e)))?;

            if !resp.status().is_success() {
                return Err(AuthError::OAuth(format!(
                    "GitHub token endpoint returned HTTP error status {}",
                    resp.status()
                )));
            }

            let payload = resp
                .json::<GitHubTokenPayload>()
                .await
                .map_err(|e| AuthError::OAuth(format!("Failed to parse GitHub token payload: {}", e)))?;

            if let Some(err) = payload.error {
                let desc = payload.error_description.unwrap_or_default();
                return Err(AuthError::OAuth(format!("GitHub OAuth error: {} ({})", err, desc)));
            }

            let access_token = payload
                .access_token
                .ok_or_else(|| AuthError::OAuth("No access_token returned by GitHub".to_string()))?;

            Ok(OAuthTokenResponse {
                access_token,
                token_type: payload.token_type,
                refresh_token: None,
                expires_in: None,
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
                .get("https://api.github.com/user")
                .header("Authorization", format!("Bearer {}", access_token))
                .header("User-Agent", "KodeDock-Core-Engine")
                .send()
                .await
                .map_err(|e| AuthError::OAuth(format!("GitHub user profile request failed: {}", e)))?;

            if !user_resp.status().is_success() {
                return Err(AuthError::OAuth(format!(
                    "GitHub user API returned HTTP error {}",
                    user_resp.status()
                )));
            }

            let raw_user = user_resp
                .json::<GitHubUserRaw>()
                .await
                .map_err(|e| AuthError::OAuth(format!("Failed to parse GitHub user data: {}", e)))?;

            // If user's public email is missing, fetch verified primary email from /user/emails
            let email = match raw_user.email {
                Some(ref e) if !e.trim().is_empty() => e.clone(),
                _ => {
                    let emails_resp = client
                        .get("https://api.github.com/user/emails")
                        .header("Authorization", format!("Bearer {}", access_token))
                        .header("User-Agent", "KodeDock-Core-Engine")
                        .send()
                        .await;

                    let mut resolved_email = None;
                    if let Ok(resp) = emails_resp {
                        if let Ok(emails) = resp.json::<Vec<GitHubEmailItem>>().await {
                            if let Some(primary) = emails.iter().find(|item| item.primary && item.verified) {
                                resolved_email = Some(primary.email.clone());
                            } else if let Some(verified) = emails.iter().find(|item| item.verified) {
                                resolved_email = Some(verified.email.clone());
                            }
                        }
                    }

                    resolved_email.unwrap_or_else(|| format!("{}@users.noreply.github.com", raw_user.login))
                }
            };

            Ok(OAuthUserProfile {
                provider_user_id: raw_user.id.to_string(),
                email,
                full_name: raw_user.name.or(Some(raw_user.login.clone())),
                username: Some(raw_user.login),
                avatar_url: raw_user.avatar_url,
            })
        })
    }
}
