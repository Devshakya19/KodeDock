use super::OAuthUserProfile;
use crate::errors::AppError;
use reqwest::Client;
use serde::Deserialize;

#[derive(Deserialize, Debug)]
struct GitHubTokenResponse {
    access_token: String,
}

#[derive(Deserialize, Debug)]
struct GitHubUser {
    id: i64,
    login: String,
    email: Option<String>,
    name: Option<String>,
    avatar_url: Option<String>,
}

#[derive(Deserialize, Debug)]
struct GitHubEmail {
    email: String,
    primary: bool,
    verified: bool,
}

pub async fn exchange_code(
    client_id: &str,
    client_secret: &str,
    redirect_uri: &str,
    code: &str,
) -> Result<String, AppError> {
    let client = Client::new();
    let res = client
        .post("https://github.com/login/oauth/access_token")
        .header("Accept", "application/json")
        .form(&[
            ("client_id", client_id),
            ("client_secret", client_secret),
            ("code", code),
            ("redirect_uri", redirect_uri),
        ])
        .send()
        .await
        .map_err(|e| AppError::InternalError(format!("GitHub token request failed: {}", e)))?;

    if res.status().is_success() {
        let token_resp: GitHubTokenResponse = res
            .json()
            .await
            .map_err(|e| AppError::InternalError(format!("GitHub token parse failed: {}", e)))?;
        Ok(token_resp.access_token)
    } else {
        Err(AppError::InternalError(
            "Failed to exchange GitHub code".to_string(),
        ))
    }
}

pub async fn get_profile(access_token: &str) -> Result<OAuthUserProfile, AppError> {
    let client = Client::new();

    let user_res = client
        .get("https://api.github.com/user")
        .header("Authorization", format!("Bearer {}", access_token))
        .header("User-Agent", "KodeDock-App")
        .send()
        .await
        .map_err(|e| AppError::InternalError(format!("GitHub user request failed: {}", e)))?;

    let user: GitHubUser = user_res
        .json()
        .await
        .map_err(|e| AppError::InternalError(format!("GitHub user parse failed: {}", e)))?;

    let mut primary_email = user.email.clone();

    if primary_email.is_none() {
        let emails_res = client
            .get("https://api.github.com/user/emails")
            .header("Authorization", format!("Bearer {}", access_token))
            .header("User-Agent", "KodeDock-App")
            .send()
            .await
            .map_err(|_| AppError::InternalError("GitHub emails request failed".to_string()))?;

        let emails: Vec<GitHubEmail> = emails_res.json().await.unwrap_or_default();

        if let Some(email) = emails.into_iter().find(|e| e.primary && e.verified) {
            primary_email = Some(email.email);
        }
    }

    Ok(OAuthUserProfile {
        provider_id: user.id.to_string(),
        email: primary_email,
        name: user.name.unwrap_or(user.login),
        avatar_url: user.avatar_url,
    })
}
