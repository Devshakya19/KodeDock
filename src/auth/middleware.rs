use actix_web::{dev::Payload, FromRequest, HttpRequest};
use jsonwebtoken::{decode, DecodingKey, Validation};
use std::future::{ready, Ready};
use uuid::Uuid;

use crate::auth::models::TokenClaims;
use crate::config::AppConfig;
use crate::errors::AppError;

#[derive(Debug, Clone)]
pub struct AuthenticatedUser {
    pub id: Uuid,
    pub email: String,
    pub role: String,
}

impl FromRequest for AuthenticatedUser {
    type Error = AppError;
    type Future = Ready<Result<Self, Self::Error>>;

    fn from_request(req: &HttpRequest, _payload: &mut Payload) -> Self::Future {
        // 1. Get the AppConfig from the app data
        let config = match req.app_data::<actix_web::web::Data<AppConfig>>() {
            Some(cfg) => cfg,
            None => return ready(Err(AppError::InternalError("AppConfig not found in app state".to_string()))),
        };

        // 2. Get the Authorization header
        let auth_header = match req.headers().get("Authorization") {
            Some(val) => val,
            None => return ready(Err(AppError::Unauthorized("Missing Authorization header".to_string()))),
        };

        let auth_str = match auth_header.to_str() {
            Ok(s) => s,
            Err(_) => return ready(Err(AppError::Unauthorized("Invalid Authorization header format".to_string()))),
        };

        // 3. Extract the Bearer token
        if !auth_str.starts_with("Bearer ") {
            return ready(Err(AppError::Unauthorized("Authorization header must start with Bearer".to_string())));
        }
        let token = &auth_str[7..];

        // 4. Decode and validate the JWT
        let decoding_key = DecodingKey::from_secret(config.jwt_secret.as_bytes());
        let validation = Validation::default(); // Validates exp signature

        let token_data = match decode::<TokenClaims>(token, &decoding_key, &validation) {
            Ok(data) => data,
            Err(_) => return ready(Err(AppError::Unauthorized("Invalid or expired access token".to_string()))),
        };

        // 5. Parse the user ID
        let user_id = match Uuid::parse_str(&token_data.claims.sub) {
            Ok(id) => id,
            Err(_) => return ready(Err(AppError::Unauthorized("Invalid user ID in token".to_string()))),
        };

        // 6. Return the extracted user context
        ready(Ok(AuthenticatedUser {
            id: user_id,
            email: token_data.claims.email,
            role: token_data.claims.role,
        }))
    }
}

/// A specialized extractor for routes that strictly require Admin privileges.
#[derive(Debug, Clone)]
pub struct AdminUser(pub AuthenticatedUser);

impl FromRequest for AdminUser {
    type Error = AppError;
    type Future = Ready<Result<Self, Self::Error>>;

    fn from_request(req: &HttpRequest, payload: &mut Payload) -> Self::Future {
        // Leverage the existing AuthenticatedUser extractor
        let auth_future = AuthenticatedUser::from_request(req, payload);
        let auth_result = auth_future.into_inner();
        
        match auth_result {
            Ok(user) => {
                if user.role == "admin" || user.role == "superadmin" {
                    ready(Ok(AdminUser(user)))
                } else {
                    ready(Err(AppError::Forbidden("Admin privileges required".to_string())))
                }
            }
            Err(e) => ready(Err(e)),
        }
    }
}
