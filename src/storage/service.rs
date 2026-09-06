use aws_sdk_s3::config::{Credentials, Region};
use aws_sdk_s3::presigning::PresigningConfig;
use aws_sdk_s3::{Client, Config};
use sqlx::PgPool;
use std::time::Duration;
use uuid::Uuid;

use super::models::{DownloadIntentResponse, UploadIntentResponse};
use crate::config::AppConfig;
use crate::errors::AppError;

pub struct StorageService {
    s3_client: Client,
    bucket_name: String,
}

impl StorageService {
    /// Initialize the S3 Client pointed to our SeaweedFS (or any custom S3) endpoint
    pub fn new(config: &AppConfig) -> Self {
        let credentials = Credentials::new(
            &config.s3_access_key,
            &config.s3_secret_key,
            None,
            None,
            "kodedock-static",
        );

        // SeaweedFS usually requires force_path_style to be true
        let s3_config = Config::builder()
            .credentials_provider(credentials)
            .region(Region::new("us-east-1")) // Dummy region for SeaweedFS
            .endpoint_url(&config.s3_endpoint)
            .force_path_style(true)
            .build();

        let s3_client = Client::from_conf(s3_config);

        Self {
            s3_client,
            bucket_name: config.s3_vault_bucket.clone(),
        }
    }

    /// Generate a temporary (15 mins) Presigned URL for the seller to PUT their large file directly.
    pub async fn generate_upload_url(
        &self,
        product_id: Uuid,
        filename: &str,
        content_type: &str,
    ) -> Result<UploadIntentResponse, AppError> {
        let object_key = format!("products/{}/{}", product_id, filename);
        let expires_in = Duration::from_secs(900); // 15 minutes

        let presigning_config = PresigningConfig::expires_in(expires_in).map_err(|e| {
            AppError::InternalError(format!("Failed to create presigning config: {}", e))
        })?;

        let presigned_req = self
            .s3_client
            .put_object()
            .bucket(&self.bucket_name)
            .key(&object_key)
            .content_type(content_type)
            .presigned(presigning_config)
            .await
            .map_err(|e| {
                AppError::InternalError(format!("Failed to generate presigned upload URL: {}", e))
            })?;

        Ok(UploadIntentResponse {
            presigned_url: presigned_req.uri().to_string(),
            object_key,
            expires_in_secs: 900,
        })
    }

    /// Link the uploaded asset to the product in PostgreSQL
    pub async fn confirm_upload(
        pool: &PgPool,
        _seller_id: Uuid, // To ensure ownership in future checks
        product_id: Uuid,
        object_key: &str,
        size_bytes: i64,
    ) -> Result<(), AppError> {
        let asset_id = Uuid::new_v4();

        sqlx::query(
            r#"
            INSERT INTO product_assets (id, product_id, s3_file_key, size_bytes)
            VALUES ($1, $2, $3, $4)
            "#,
        )
        .bind(asset_id)
        .bind(product_id)
        .bind(object_key)
        .bind(size_bytes)
        .execute(pool)
        .await
        .map_err(AppError::DatabaseError)?;

        Ok(())
    }

    /// Generate a temporary GET URL for a buyer who has purchased the asset
    pub async fn generate_download_url(
        &self,
        pool: &PgPool,
        _buyer_id: Uuid,
        asset_id: Uuid,
    ) -> Result<DownloadIntentResponse, AppError> {
        // 1. Fetch the asset from the DB
        let (object_key, _product_id): (String, Uuid) = sqlx::query_as(
            r#"
            SELECT s3_file_key, product_id 
            FROM product_assets 
            WHERE id = $1
            "#,
        )
        .bind(asset_id)
        .fetch_optional(pool)
        .await
        .map_err(AppError::DatabaseError)?
        .ok_or_else(|| AppError::NotFound("Asset not found".to_string()))?;

        // 2. TODO (Phase 6: Fintech): Check if `buyer_id` has actually paid for `product_id`
        // For now, we simulate success for the integration.

        // 3. Generate presigned GET URL
        let expires_in = Duration::from_secs(900); // 15 mins to start download
        let presigning_config = PresigningConfig::expires_in(expires_in).map_err(|e| {
            AppError::InternalError(format!("Failed to create presigning config: {}", e))
        })?;

        let presigned_req = self
            .s3_client
            .get_object()
            .bucket(&self.bucket_name)
            .key(&object_key)
            .presigned(presigning_config)
            .await
            .map_err(|e| {
                AppError::InternalError(format!("Failed to generate presigned download URL: {}", e))
            })?;

        Ok(DownloadIntentResponse {
            presigned_url: presigned_req.uri().to_string(),
            expires_in_secs: 900,
        })
    }
}
