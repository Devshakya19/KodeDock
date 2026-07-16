pub mod auth;

use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct ApiResponse<T> {
    pub success: bool,
    pub data: Option<T>,
    pub message: Option<String>,
    pub error: Option<String>,
}

impl<T> ApiResponse<T> {
    pub fn success(data: T, message: &str) -> Self {
        Self {
            success: true,
            data: Some(data),
            message: Some(message.to_string()),
            error: None,
        }
    }

    pub fn error(error: &str) -> Self {
        Self {
            success: false,
            data: None,
            message: None,
            error: Some(error.to_string()),
        }
    }
}
