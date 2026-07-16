use actix_web::{Error, HttpRequest};
use actix_web::error::ErrorUnauthorized;
use jsonwebtoken::{decode, DecodingKey, Validation, Algorithm};

/// Extract user ID from Authorization Bearer token header
/// Decodes the JWT and extracts the `sub` claim (user UUID)
pub fn extract_user_id(req: &HttpRequest) -> Result<String, Error> {
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

    // Decode the JWT to extract user ID
    // JWT uses the `sub` claim for user ID
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
            // Extract `sub` claim (user ID)
            let claims = token_data.claims;
            let user_id = claims
                .get("sub")
                .and_then(|v| v.as_str())
                .ok_or_else(|| ErrorUnauthorized("Invalid token: missing sub claim"))?;

            Ok(user_id.to_string())
        }
        Err(e) => {
            log::error!("JWT decode error: {}", e);
            Err(ErrorUnauthorized("Invalid token"))
        }
    }
}
