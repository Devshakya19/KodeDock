use crate::services::ApiResponse;
use actix_web::error::ErrorUnauthorized;
use actix_web::{Error, HttpRequest, HttpResponse};
use jsonwebtoken::{decode, Algorithm, DecodingKey, Validation};

/// Verified JWT claims for the current request.
#[derive(Debug, Clone)]
pub struct AuthClaims {
    pub user_id: String,
    pub role: String,
}

impl actix_web::FromRequest for AuthClaims {
    type Error = Error;
    type Future = std::future::Ready<Result<Self, Self::Error>>;

    fn from_request(req: &HttpRequest, _payload: &mut actix_web::dev::Payload) -> Self::Future {
        std::future::ready(verify_bearer(req))
    }
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
    let jwt_secret = req
        .app_data::<actix_web::web::Data<String>>()
        .expect("JWT_SECRET missing in app_data")
        .as_ref();

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
                Err(HttpResponse::Forbidden().json(ApiResponse::<()>::error(
                    "This action requires a seller account",
                )))
            } else {
                Ok(claims.user_id)
            }
        }
        Err(_) => Err(HttpResponse::Unauthorized().json(ApiResponse::<()>::error("Unauthorized"))),
    }
}

/// Verified JWT claims for KodeDock HQ
#[derive(Debug, Clone)]
#[allow(dead_code)]
pub struct HqAuthClaims {
    pub staff_id: String,
    pub role_id: String,
    pub is_hq: bool,
}

impl actix_web::FromRequest for HqAuthClaims {
    type Error = Error;
    type Future = std::future::Ready<Result<Self, Self::Error>>;

    fn from_request(req: &HttpRequest, _payload: &mut actix_web::dev::Payload) -> Self::Future {
        std::future::ready(require_hq_access(req).map_err(|e| actix_web::error::InternalError::from_response("", e).into()))
    }
}

/// Require the authenticated user to be a valid KodeDock HQ Staff member.
/// It strictly checks for `is_hq: true` in the token claims to prevent
/// normal users from accessing HQ endpoints.
pub fn require_hq_access(req: &HttpRequest) -> Result<HqAuthClaims, HttpResponse> {
    let auth_header = req
        .headers()
        .get("Authorization")
        .and_then(|v| v.to_str().ok())
        .ok_or_else(|| {
            HttpResponse::Unauthorized()
                .json(ApiResponse::<()>::error("Missing Authorization header"))
        })?;

    let token = auth_header.strip_prefix("Bearer ").ok_or_else(|| {
        HttpResponse::Unauthorized().json(ApiResponse::<()>::error(
            "Invalid Authorization header format",
        ))
    })?;

    if token.is_empty() {
        return Err(HttpResponse::Unauthorized().json(ApiResponse::<()>::error("Empty token")));
    }

    let mut validation = Validation::new(Algorithm::HS256);
    validation.validate_aud = false;

    let jwt_secret = req
        .app_data::<actix_web::web::Data<String>>()
        .expect("JWT_SECRET missing in app_data")
        .as_ref();

    match decode::<serde_json::Value>(
        token,
        &DecodingKey::from_secret(jwt_secret.as_bytes()),
        &validation,
    ) {
        Ok(token_data) => {
            let claims = token_data.claims;

            // Explicit HQ validation
            let is_hq = claims
                .get("is_hq")
                .and_then(|v| v.as_bool())
                .unwrap_or(false);
            if !is_hq {
                log::warn!("SECURITY ALERT: Non-HQ token attempted to access an HQ endpoint!");
                return Err(HttpResponse::Forbidden().json(ApiResponse::<()>::error(
                    "Forbidden: This action requires an HQ Staff Token",
                )));
            }

            let staff_id = claims.get("sub").and_then(|v| v.as_str()).ok_or_else(|| {
                HttpResponse::Unauthorized()
                    .json(ApiResponse::<()>::error("Invalid token: missing sub"))
            })?;

            let role_id = claims
                .get("role_id")
                .and_then(|v| v.as_str())
                .ok_or_else(|| {
                    HttpResponse::Unauthorized()
                        .json(ApiResponse::<()>::error("Invalid token: missing role_id"))
                })?;

            Ok(HqAuthClaims {
                staff_id: staff_id.to_string(),
                role_id: role_id.to_string(),
                is_hq,
            })
        }
        Err(e) => {
            log::error!("HQ JWT decode error: {}", e);
            Err(HttpResponse::Unauthorized()
                .json(ApiResponse::<()>::error("Invalid or expired HQ token")))
        }
    }
}

/// Extract user ID as UUID directly
pub fn extract_user_uuid(req: &HttpRequest) -> Result<uuid::Uuid, HttpResponse> {
    let claims = verify_bearer(req)
        .map_err(|_| HttpResponse::Unauthorized().json(ApiResponse::<()>::error("Unauthorized")))?;
    uuid::Uuid::parse_str(&claims.user_id)
        .map_err(|_| HttpResponse::BadRequest().json(ApiResponse::<()>::error("Invalid user ID")))
}

/// Require developer and return UUID directly
pub fn require_developer_uuid(req: &HttpRequest) -> Result<uuid::Uuid, HttpResponse> {
    let user_id = require_developer(req)?;
    uuid::Uuid::parse_str(&user_id)
        .map_err(|_| HttpResponse::BadRequest().json(ApiResponse::<()>::error("Invalid user ID")))
}
