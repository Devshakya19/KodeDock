use actix_web::{http::StatusCode, HttpResponse, ResponseError};
use serde::Serialize;
use std::fmt;

#[derive(Debug, Serialize)]
pub struct ErrorResponse {
    pub success: bool,
    pub error: String,
}

#[derive(Debug)]
pub enum AuthError {
    InvalidCredentials,
    UserNotFound,
    UserAlreadyExists,
    InvalidToken(String),
    ExpiredToken,
    ReplayDetected(String),
    Unauthorized(String),
    Forbidden(String),
    Validation(String),
    OAuth(String),
    Crypto(String),
    Database(String),
    Internal(String),
}

impl fmt::Display for AuthError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            AuthError::InvalidCredentials => write!(f, "Invalid email or password"),
            AuthError::UserNotFound => write!(f, "User not found"),
            AuthError::UserAlreadyExists => write!(f, "User with this email already exists"),
            AuthError::InvalidToken(msg) => write!(f, "Invalid token: {}", msg),
            AuthError::ExpiredToken => write!(f, "Token has expired"),
            AuthError::ReplayDetected(msg) => write!(f, "Security alert - Token replay detected: {}", msg),
            AuthError::Unauthorized(msg) => write!(f, "Unauthorized: {}", msg),
            AuthError::Forbidden(msg) => write!(f, "Forbidden: {}", msg),
            AuthError::Validation(msg) => write!(f, "Validation error: {}", msg),
            AuthError::OAuth(msg) => write!(f, "OAuth error: {}", msg),
            AuthError::Crypto(msg) => write!(f, "Cryptography error: {}", msg),
            AuthError::Database(msg) => write!(f, "Database error: {}", msg),
            AuthError::Internal(msg) => write!(f, "Internal server error: {}", msg),
        }
    }
}

impl std::error::Error for AuthError {}

impl ResponseError for AuthError {
    fn status_code(&self) -> StatusCode {
        match self {
            AuthError::InvalidCredentials => StatusCode::UNAUTHORIZED,
            AuthError::Unauthorized(_) => StatusCode::UNAUTHORIZED,
            AuthError::InvalidToken(_) => StatusCode::UNAUTHORIZED,
            AuthError::ExpiredToken => StatusCode::UNAUTHORIZED,
            AuthError::ReplayDetected(_) => StatusCode::UNAUTHORIZED,
            AuthError::Forbidden(_) => StatusCode::FORBIDDEN,
            AuthError::UserNotFound => StatusCode::NOT_FOUND,
            AuthError::UserAlreadyExists => StatusCode::CONFLICT,
            AuthError::Validation(_) => StatusCode::BAD_REQUEST,
            AuthError::OAuth(_) => StatusCode::BAD_GATEWAY,
            AuthError::Crypto(_) => StatusCode::INTERNAL_SERVER_ERROR,
            AuthError::Database(_) => StatusCode::INTERNAL_SERVER_ERROR,
            AuthError::Internal(_) => StatusCode::INTERNAL_SERVER_ERROR,
        }
    }

    fn error_response(&self) -> HttpResponse {
        HttpResponse::build(self.status_code()).json(ErrorResponse {
            success: false,
            error: self.to_string(),
        })
    }
}

impl From<sqlx::Error> for AuthError {
    fn from(err: sqlx::Error) -> Self {
        log::error!("Database query error in auth: {:?}", err);
        AuthError::Database(err.to_string())
    }
}
