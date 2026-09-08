use actix_web::{http::StatusCode, HttpResponse, ResponseError};
use serde::Serialize;
use std::fmt;

#[derive(Debug, Serialize)]
pub struct ErrorResponse {
    pub success: bool,
    pub error: String,
}

#[derive(Debug)]
pub enum MarketplaceError {
    NotFound(String),
    Validation(String),
    Database(String),
    Internal(String),
}

impl fmt::Display for MarketplaceError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            MarketplaceError::NotFound(msg) => write!(f, "Not found: {}", msg),
            MarketplaceError::Validation(msg) => write!(f, "Validation error: {}", msg),
            MarketplaceError::Database(msg) => write!(f, "Database error: {}", msg),
            MarketplaceError::Internal(msg) => write!(f, "Internal error: {}", msg),
        }
    }
}

impl std::error::Error for MarketplaceError {}

impl ResponseError for MarketplaceError {
    fn status_code(&self) -> StatusCode {
        match self {
            MarketplaceError::NotFound(_) => StatusCode::NOT_FOUND,
            MarketplaceError::Validation(_) => StatusCode::BAD_REQUEST,
            MarketplaceError::Database(_) => StatusCode::INTERNAL_SERVER_ERROR,
            MarketplaceError::Internal(_) => StatusCode::INTERNAL_SERVER_ERROR,
        }
    }

    fn error_response(&self) -> HttpResponse {
        HttpResponse::build(self.status_code()).json(ErrorResponse {
            success: false,
            error: self.to_string(),
        })
    }
}

impl From<sqlx::Error> for MarketplaceError {
    fn from(err: sqlx::Error) -> Self {
        log::error!("Database query error in marketplace: {:?}", err);
        match err {
            sqlx::Error::RowNotFound => MarketplaceError::NotFound("Product not found".to_string()),
            _ => MarketplaceError::Database(err.to_string()),
        }
    }
}
