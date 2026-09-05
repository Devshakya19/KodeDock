use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Deserialize)]
pub struct UploadIntentRequest {
    pub product_id: Uuid,
    pub filename: String,
    pub content_type: String,
    pub size_bytes: i64,
}

#[derive(Debug, Serialize)]
pub struct UploadIntentResponse {
    pub presigned_url: String,
    pub object_key: String,
    pub expires_in_secs: u64,
}

#[derive(Debug, Deserialize)]
pub struct UploadConfirmRequest {
    pub product_id: Uuid,
    pub object_key: String,
    pub size_bytes: i64,
}

#[derive(Debug, Serialize)]
pub struct DownloadIntentResponse {
    pub presigned_url: String,
    pub expires_in_secs: u64,
}
