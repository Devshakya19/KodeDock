use actix_web::{web, HttpResponse, Responder};
use sqlx::PgPool;
use uuid::Uuid;

use crate::auth::errors::AuthError;
use crate::auth::middleware::AuthClaims;
use crate::auth::models::{
    ApiResponse, AuthConfigResponse, ChangePasswordRequest, ForgotPasswordRequest,
    LoginRequest, OAuthCallbackRequest, OAuthLinkRequest, RefreshTokenRequest, RegisterRequest,
    ResetPasswordRequest,
};
use crate::auth::oauth;
use crate::auth::repository;
use crate::auth::service;

// ─── REGISTRATION & LOGIN ────────────────────────────────────────────────

pub async fn register(
    secret: web::Data<String>,
    pool: web::Data<PgPool>,
    body: web::Json<RegisterRequest>,
) -> Result<HttpResponse, AuthError> {
    let role = match body.role.as_deref() {
        Some("developer") => "developer",
        _ => "user",
    };

    // Password strength validation
    if body.password.len() < 8 {
        return Err(AuthError::Validation("Password must be at least 8 characters long".to_string()));
    }
    if !body.password.chars().any(|c| c.is_uppercase()) {
        return Err(AuthError::Validation("Password must contain at least one uppercase letter".to_string()));
    }
    if !body.password.chars().any(|c| c.is_lowercase()) {
        return Err(AuthError::Validation("Password must contain at least one lowercase letter".to_string()));
    }
    if !body.password.chars().any(|c| c.is_numeric()) {
        return Err(AuthError::Validation("Password must contain at least one number".to_string()));
    }

    // Email structure validation
    let email = body.email.trim().to_lowercase();
    if email.len() < 5 || !email.contains('@') {
        return Err(AuthError::Validation("Invalid email address format".to_string()));
    }
    let parts: Vec<&str> = email.split('@').collect();
    if parts.len() != 2
        || parts[0].is_empty()
        || !parts[1].contains('.')
        || parts[1].starts_with('.')
        || parts[1].ends_with('.')
    {
        return Err(AuthError::Validation("Invalid email address format".to_string()));
    }

    // Full name validation
    let full_name = body.full_name.trim();
    if full_name.is_empty() || full_name.len() > 100 {
        return Err(AuthError::Validation("Name must be between 1 and 100 characters".to_string()));
    }

    let auth_resp = service::register_user(
        pool.get_ref(),
        &email,
        &body.password,
        full_name,
        role,
        secret.as_str(),
    )
    .await?;

    Ok(HttpResponse::Created().json(ApiResponse::success(auth_resp, "Registration successful")))
}

pub async fn login(
    secret: web::Data<String>,
    pool: web::Data<PgPool>,
    body: web::Json<LoginRequest>,
) -> Result<HttpResponse, AuthError> {
    let auth_resp =
        service::login_user(pool.get_ref(), &body.email, &body.password, secret.as_str()).await?;

    Ok(HttpResponse::Ok().json(ApiResponse::success(auth_resp, "Login successful")))
}

pub async fn refresh(
    secret: web::Data<String>,
    pool: web::Data<PgPool>,
    body: web::Json<RefreshTokenRequest>,
) -> Result<HttpResponse, AuthError> {
    let auth_resp =
        service::rotate_refresh_token(pool.get_ref(), &body.refresh_token, secret.as_str()).await?;

    Ok(HttpResponse::Ok().json(ApiResponse::success(auth_resp, "Token rotated successfully")))
}

pub async fn me(
    pool: web::Data<PgPool>,
    claims: AuthClaims,
) -> Result<HttpResponse, AuthError> {
    let user_id = Uuid::parse_str(&claims.user_id)
        .map_err(|_| AuthError::Validation("Invalid user ID".to_string()))?;

    let user = repository::find_user_by_id(pool.get_ref(), user_id)
        .await?
        .ok_or(AuthError::UserNotFound)?;

    Ok(HttpResponse::Ok().json(ApiResponse::success(user, "User profile retrieved")))
}

pub async fn logout() -> HttpResponse {
    HttpResponse::Ok().json(ApiResponse::<()>::ok("Logged out successfully"))
}

// ─── PASSWORD MANAGEMENT ─────────────────────────────────────────────────

pub async fn forgot_password(
    pool: web::Data<PgPool>,
    body: web::Json<ForgotPasswordRequest>,
) -> Result<HttpResponse, AuthError> {
    // Initiate reset
    match service::initiate_password_reset(pool.get_ref(), &body.email).await {
        Ok(_reset_token) => {
            log::info!("Password reset link generated for {}", body.email);
        }
        Err(AuthError::UserNotFound) => {
            // Keep silent to prevent account enumeration
            log::info!("Password reset requested for nonexistent email: {}", body.email);
        }
        Err(e) => return Err(e),
    }

    Ok(HttpResponse::Ok().json(ApiResponse::<()>::ok(
        "If an account exists with that email, a password reset link has been dispatched",
    )))
}

#[derive(Debug, serde::Deserialize)]
pub struct VerifyEmailQuery {
    pub token: Option<String>,
}

pub async fn verify_email(
    pool: web::Data<PgPool>,
    query: web::Query<VerifyEmailQuery>,
) -> Result<HttpResponse, AuthError> {
    let token = match query.token.as_deref() {
        Some(t) if !t.trim().is_empty() => t.trim(),
        _ => return Err(AuthError::Validation("Missing verification token".to_string())),
    };

    let record = match repository::find_valid_reset_token(pool.get_ref(), token).await? {
        Some(r) => r,
        None => return Err(AuthError::InvalidToken("Verification token is invalid or has expired".to_string())),
    };

    repository::verify_user_email(pool.get_ref(), record.user_id).await?;
    repository::mark_reset_token_used(pool.get_ref(), token).await?;

    Ok(HttpResponse::Ok().json(ApiResponse::<()>::ok("Email verified successfully")))
}

pub async fn reset_password(
    pool: web::Data<PgPool>,
    body: web::Json<ResetPasswordRequest>,
) -> Result<HttpResponse, AuthError> {
    if body.password.len() < 8 {
        return Err(AuthError::Validation("Password must be at least 8 characters long".to_string()));
    }

    service::complete_password_reset(pool.get_ref(), &body.token, &body.password).await?;
    Ok(HttpResponse::Ok().json(ApiResponse::<()>::ok("Password reset successfully")))
}

pub async fn change_password(
    pool: web::Data<PgPool>,
    claims: AuthClaims,
    body: web::Json<ChangePasswordRequest>,
) -> Result<HttpResponse, AuthError> {
    let user_id = Uuid::parse_str(&claims.user_id)
        .map_err(|_| AuthError::Validation("Invalid user ID".to_string()))?;

    if body.new_password.len() < 8 {
        return Err(AuthError::Validation("New password must be at least 8 characters long".to_string()));
    }

    service::change_user_password(
        pool.get_ref(),
        user_id,
        &body.current_password,
        &body.new_password,
    )
    .await?;

    Ok(HttpResponse::Ok().json(ApiResponse::<()>::ok("Password changed successfully")))
}

pub async fn delete_account(
    pool: web::Data<PgPool>,
    claims: AuthClaims,
) -> Result<HttpResponse, AuthError> {
    let user_id = Uuid::parse_str(&claims.user_id)
        .map_err(|_| AuthError::Validation("Invalid user ID".to_string()))?;

    repository::delete_user(pool.get_ref(), user_id).await?;
    Ok(HttpResponse::Ok().json(ApiResponse::<()>::ok("Account deleted successfully")))
}

// ─── MODULAR OAUTH HANDLERS ──────────────────────────────────────────────

pub async fn oauth_authenticate(
    secret: web::Data<String>,
    pool: web::Data<PgPool>,
    path: web::Path<String>,
    body: web::Json<OAuthCallbackRequest>,
) -> Result<HttpResponse, AuthError> {
    let provider_name = path.into_inner();
    let provider = oauth::get_provider(&provider_name)?;

    let auth_resp = service::handle_oauth_login_or_register(
        pool.get_ref(),
        provider.as_ref(),
        &body.code,
        body.role.as_deref(),
        secret.as_str(),
    )
    .await?;

    Ok(HttpResponse::Ok().json(ApiResponse::success(
        auth_resp,
        format!("{} authentication successful", provider_name),
    )))
}

pub async fn oauth_link(
    secret: web::Data<String>,
    pool: web::Data<PgPool>,
    claims: AuthClaims,
    path: web::Path<String>,
    body: web::Json<OAuthLinkRequest>,
) -> Result<HttpResponse, AuthError> {
    let provider_name = path.into_inner();
    let user_id = Uuid::parse_str(&claims.user_id)
        .map_err(|_| AuthError::Validation("Invalid user ID in session".to_string()))?;

    let provider = oauth::get_provider(&provider_name)?;
    let token_resp = provider.exchange_code(&body.code).await?;
    let profile = provider.fetch_user(&token_resp.access_token).await?;

    match provider_name.to_lowercase().as_str() {
        "github" => {
            // Check if already linked to another account
            if let Some(existing) = repository::find_user_by_github_id(pool.get_ref(), &profile.provider_user_id).await? {
                if existing.id != user_id {
                    return Err(AuthError::Forbidden(
                        "This GitHub account is already linked to another user".to_string(),
                    ));
                }
            }
            let username = profile.username.as_deref().unwrap_or(&profile.provider_user_id);
            repository::link_github_to_user(pool.get_ref(), user_id, &profile.provider_user_id, username).await?;
            if let Ok(encrypted) = crate::auth::crypto::encrypt_token(&token_resp.access_token, secret.as_str()) {
                let _ = repository::store_github_token(pool.get_ref(), user_id, &encrypted).await;
            }
        }
        "google" => {
            if let Some(existing) = repository::find_user_by_google_id(pool.get_ref(), &profile.provider_user_id).await? {
                if existing.id != user_id {
                    return Err(AuthError::Forbidden(
                        "This Google account is already linked to another user".to_string(),
                    ));
                }
            }
            repository::link_google_to_user(pool.get_ref(), user_id, &profile.provider_user_id).await?;
        }
        _ => return Err(AuthError::OAuth("Unsupported link provider".to_string())),
    }

    Ok(HttpResponse::Ok().json(ApiResponse::<()>::ok(format!(
        "{} linked successfully",
        provider_name
    ))))
}

pub async fn oauth_unlink(
    pool: web::Data<PgPool>,
    claims: AuthClaims,
    path: web::Path<String>,
) -> Result<HttpResponse, AuthError> {
    let provider_name = path.into_inner();
    let user_id = Uuid::parse_str(&claims.user_id)
        .map_err(|_| AuthError::Validation("Invalid user ID in session".to_string()))?;

    match provider_name.to_lowercase().as_str() {
        "github" => {
            repository::unlink_github_from_user(pool.get_ref(), user_id).await?;
        }
        "google" => {
            repository::unlink_google_from_user(pool.get_ref(), user_id).await?;
        }
        _ => return Err(AuthError::OAuth("Unsupported unlink provider".to_string())),
    }

    Ok(HttpResponse::Ok().json(ApiResponse::<()>::ok(format!(
        "{} unlinked successfully",
        provider_name
    ))))
}

// ─── CONFIGURATION ENDPOINT ──────────────────────────────────────────────

pub async fn get_auth_config() -> impl Responder {
    let github_client_id = std::env::var("NEXT_PUBLIC_GITHUB_CLIENT_ID")
        .or_else(|_| std::env::var("GITHUB_CLIENT_ID"))
        .unwrap_or_default();

    let google_client_id = std::env::var("NEXT_PUBLIC_GOOGLE_CLIENT_ID")
        .or_else(|_| std::env::var("GOOGLE_CLIENT_ID"))
        .unwrap_or_default();

    HttpResponse::Ok().json(AuthConfigResponse {
        github_client_id,
        google_client_id,
    })
}
