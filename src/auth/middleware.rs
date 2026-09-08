use actix_web::error::ErrorUnauthorized;
use actix_web::{dev::Payload, Error, FromRequest, HttpRequest};
use jsonwebtoken::{decode, Algorithm, DecodingKey, Validation};
use std::future::{ready, Ready};
use uuid::Uuid;

use crate::auth::errors::AuthError;
use crate::auth::models::Claims;

/// Verified JWT claims extracted from the Authorization Bearer header.
#[derive(Debug, Clone)]
pub struct AuthClaims {
    pub user_id: String,
    pub email: String,
    pub role: String,
    pub github_username: Option<String>,
    pub family_id: Option<String>,
}

impl FromRequest for AuthClaims {
    type Error = Error;
    type Future = Ready<Result<Self, Self::Error>>;

    fn from_request(req: &HttpRequest, _payload: &mut Payload) -> Self::Future {
        ready(verify_bearer(req).map_err(|e| ErrorUnauthorized(e.to_string())))
    }
}

/// Verifies Bearer JWT signature against the server's `JWT_SECRET` in app data.
pub fn verify_bearer(req: &HttpRequest) -> Result<AuthClaims, AuthError> {
    let auth_header = req
        .headers()
        .get("Authorization")
        .and_then(|v| v.to_str().ok())
        .ok_or_else(|| AuthError::Unauthorized("Missing Authorization header".to_string()))?;

    let token = auth_header
        .strip_prefix("Bearer ")
        .ok_or_else(|| AuthError::Unauthorized("Invalid Authorization header format".to_string()))?;

    if token.trim().is_empty() {
        return Err(AuthError::Unauthorized("Empty token provided".to_string()));
    }

    let mut validation = Validation::new(Algorithm::HS256);
    validation.validate_aud = false;

    let jwt_secret = req
        .app_data::<actix_web::web::Data<String>>()
        .ok_or_else(|| AuthError::Internal("JWT_SECRET missing in server state".to_string()))?;

    let token_data = decode::<Claims>(
        token,
        &DecodingKey::from_secret(jwt_secret.as_bytes()),
        &validation,
    )
    .map_err(|e| {
        log::warn!("JWT signature verification failed: {}", e);
        AuthError::InvalidToken(e.to_string())
    })?;

    Ok(AuthClaims {
        user_id: token_data.claims.sub,
        email: token_data.claims.email,
        role: token_data.claims.role,
        github_username: token_data.claims.github_username,
        family_id: token_data.claims.family_id,
    })
}

/// Extract user UUID directly from request.
pub fn extract_user_uuid(req: &HttpRequest) -> Result<Uuid, AuthError> {
    let claims = verify_bearer(req)?;
    Uuid::parse_str(&claims.user_id).map_err(|_| AuthError::Validation("Invalid user UUID".to_string()))
}

/// Require authenticated user to possess the `developer` or `admin` role.
pub fn require_developer(req: &HttpRequest) -> Result<AuthClaims, AuthError> {
    let claims = verify_bearer(req)?;
    if claims.role != "developer" && claims.role != "admin" {
        return Err(AuthError::Forbidden(
            "This action requires a registered developer account".to_string(),
        ));
    }
    Ok(claims)
}

/// Verified claims for KodeDock HQ staff.
#[derive(Debug, Clone)]
pub struct HqAuthClaims {
    pub staff_id: String,
    pub role_id: String,
    pub is_hq: bool,
}

impl FromRequest for HqAuthClaims {
    type Error = Error;
    type Future = Ready<Result<Self, Self::Error>>;

    fn from_request(req: &HttpRequest, _payload: &mut Payload) -> Self::Future {
        ready(require_hq_access(req).map_err(|e| ErrorUnauthorized(e.to_string())))
    }
}

/// Require authenticated caller to be a valid KodeDock HQ Staff member.
pub fn require_hq_access(req: &HttpRequest) -> Result<HqAuthClaims, AuthError> {
    let auth_header = req
        .headers()
        .get("Authorization")
        .and_then(|v| v.to_str().ok())
        .ok_or_else(|| AuthError::Unauthorized("Missing Authorization header".to_string()))?;

    let token = auth_header
        .strip_prefix("Bearer ")
        .ok_or_else(|| AuthError::Unauthorized("Invalid Authorization format".to_string()))?;

    let mut validation = Validation::new(Algorithm::HS256);
    validation.validate_aud = false;

    let jwt_secret = req
        .app_data::<actix_web::web::Data<String>>()
        .ok_or_else(|| AuthError::Internal("JWT_SECRET missing in server state".to_string()))?;

    let token_data = decode::<serde_json::Value>(
        token,
        &DecodingKey::from_secret(jwt_secret.as_bytes()),
        &validation,
    )
    .map_err(|e| AuthError::Unauthorized(format!("Invalid HQ token: {}", e)))?;

    let is_hq = token_data.claims.get("is_hq").and_then(|v| v.as_bool()).unwrap_or(false);
    if !is_hq {
        log::warn!("SECURITY ALERT: Non-HQ token attempted access to HQ route!");
        return Err(AuthError::Forbidden("HQ Staff credentials required".to_string()));
    }

    let staff_id = token_data
        .claims
        .get("sub")
        .and_then(|v| v.as_str())
        .ok_or_else(|| AuthError::Unauthorized("Missing sub claim".to_string()))?
        .to_string();

    let role_id = token_data
        .claims
        .get("role_id")
        .and_then(|v| v.as_str())
        .unwrap_or("staff")
        .to_string();

    Ok(HqAuthClaims {
        staff_id,
        role_id,
        is_hq,
    })
}
