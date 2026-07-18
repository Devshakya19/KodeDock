use actix_web::{Error, HttpRequest, HttpResponse};
use actix_web::error::ErrorUnauthorized;
use jsonwebtoken::{decode, DecodingKey, Validation, Algorithm};
use crate::services::ApiResponse;

/// Verified JWT claims for the current request.
#[derive(Debug, Clone)]
pub struct AuthClaims {
    pub user_id: String,
    pub role: String,
}

/// Decode + signature-verify the Bearer JWT and return its claims.
///
/// Unlike the Next.js middleware (which previously trusted an unsigned
/// base64 payload), every backend request re-verifies the signature with the
/// server-side `JWT_SECRET`. This is the single source of truth for identity.
fn verify_bearer(req: &HttpRequest) -> Result<AuthClaims, Error> {
    let auth_header = req
        .headers()
        .get("Authorization")
        .and_then(|v| v.to_str().ok())
        .ok_or_else(|| ErrorUnauthorized("Missing Authorization header"))?;

    let token = auth_header
        .strip_prefix("Bearer ")
        .ok_or_else(|| ErrorUnauthorized("Invalid Authorization header format"))?;

    if token.is_empty() {
        return Err(ErrorUnauthorized("Empty token"));
    }

    let mut validation = Validation::new(Algorithm::HS256);
    validation.validate_aud = false; // JWTs may not have audience

    // Get JWT secret from environment — no fallback, must be set
    let jwt_secret = std::env::var("JWT_SECRET")
        .expect("JWT_SECRET must be set in environment");

    match decode::<serde_json::Value>(
        token,
        &DecodingKey::from_secret(jwt_secret.as_bytes()),
        &validation,
    ) {
        Ok(token_data) => {
            let claims = token_data.claims;
            let user_id = claims
                .get("sub")
                .and_then(|v| v.as_str())
                .ok_or_else(|| ErrorUnauthorized("Invalid token: missing sub claim"))?;
            let role = claims
                .get("role")
                .and_then(|v| v.as_str())
                .unwrap_or("user")
                .to_string();
            Ok(AuthClaims {
                user_id: user_id.to_string(),
                role,
            })
        }
        Err(e) => {
            log::error!("JWT decode error: {}", e);
            Err(ErrorUnauthorized("Invalid token"))
        }
    }
}

/// Extract user ID from Authorization Bearer token header.
/// Decodes the JWT and extracts the `sub` claim (user UUID).
pub fn extract_user_id(req: &HttpRequest) -> Result<String, Error> {
    Ok(verify_bearer(req)?.user_id)
}

/// Require the authenticated user to have the `developer` role.
///
/// Seller endpoints are protected by the `developer` role both in the Next.js
/// middleware (route guards) AND here on the backend. Even if a client
/// bypasses the frontend, the server enforces the role on every call.
///
/// Returns `Ok(user_id)` on success, or an `HttpResponse` (already formatted
/// as a JSON `ApiResponse`) with the appropriate status code on failure.
pub fn require_developer(req: &HttpRequest) -> Result<String, HttpResponse> {
    match verify_bearer(req) {
        Ok(claims) => {
            if claims.role != "developer" {
                log::warn!(
                    "Forbidden: user {} (role={}) attempted a developer-only action",
                    claims.user_id,
                    claims.role
                );
                Err(HttpResponse::Forbidden()
                    .json(ApiResponse::<()>::error("This action requires a seller account")))
            } else {
                Ok(claims.user_id)
            }
        }
        Err(_) => Err(HttpResponse::Unauthorized()
            .json(ApiResponse::<()>::error("Unauthorized"))),
    }
}
