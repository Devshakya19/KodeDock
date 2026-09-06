use super::OAuthUserProfile;
use crate::errors::AppError;
use reqwest::Client;
use serde::Deserialize;

#[derive(Deserialize, Debug)]
struct GoogleTokenResponse {
    access_token: String,
}

#[derive(Deserialize, Debug)]
struct GoogleUser {
    id: String,
    email: String,
    verified_email: bool,
    name: String,
    picture: Option<String>,
}

pub async fn exchange_code(
    client_id: &str,
    client_secret: &str,
    redirect_uri: &str,
    code: &str,
) -> Result<String, AppError> {
    let client = Client::new();
    let res = client
        .post("https://oauth2.googleapis.com/token")
        .form(&[
            ("client_id", client_id),
            ("client_secret", client_secret),
            ("code", code),
            ("redirect_uri", redirect_uri),
            ("grant_type", "authorization_code"),
        ])
        .send()
        .await
        .map_err(|e| AppError::InternalError(format!("Google token request failed: {}", e)))?;

    if res.status().is_success() {
        let token_resp: GoogleTokenResponse = res
            .json()
            .await
            .map_err(|e| AppError::InternalError(format!("Google token parse failed: {}", e)))?;
        Ok(token_resp.access_token)
    } else {
        Err(AppError::InternalError(
            "Failed to exchange Google code".to_string(),
        ))
    }
}

pub async fn get_profile(access_token: &str) -> Result<OAuthUserProfile, AppError> {
    let client = Client::new();

    let user_res = client
        .get("https://www.googleapis.com/oauth2/v2/userinfo")
        .header("Authorization", format!("Bearer {}", access_token))
        .send()
        .await
        .map_err(|e| AppError::InternalError(format!("Google user request failed: {}", e)))?;

    let user: GoogleUser = user_res
        .json()
        .await
        .map_err(|e| AppError::InternalError(format!("Google user parse failed: {}", e)))?;

    Ok(OAuthUserProfile {
        provider_id: user.id,
        email: if user.verified_email {
            Some(user.email)
        } else {
            None
        },
        name: user.name,
        avatar_url: user.picture,
    })
}
