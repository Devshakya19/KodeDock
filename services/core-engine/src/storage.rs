use aws_sdk_s3::Client;
use aws_sdk_s3::config::{Builder, Credentials, Region, BehaviorVersion};
use aws_sdk_s3::presigning::PresigningConfig;
use std::env;
use std::time::Duration;

pub struct StorageClient {
    pub client: Client,
    pub bucket: String,
    pub public_url_base: String,
}

impl Clone for StorageClient {
    fn clone(&self) -> Self {
        Self {
            client: self.client.clone(),
            bucket: self.bucket.clone(),
            public_url_base: self.public_url_base.clone(),
        }
    }
}

impl StorageClient {
    pub async fn new() -> Self {
        let endpoint = env::var("S3_ENDPOINT").expect("S3_ENDPOINT must be set");
        let access_key = env::var("S3_ACCESS_KEY").expect("S3_ACCESS_KEY must be set");
        let secret_key = env::var("S3_SECRET_KEY").expect("S3_SECRET_KEY must be set");
        let bucket = env::var("S3_BUCKET").unwrap_or_else(|_| "codehaat-media".to_string());
        let region = env::var("S3_REGION").unwrap_or_else(|_| "us-east-1".to_string());

        let credentials = Credentials::new(
            access_key,
            secret_key,
            None,
            None,
            "codehaat-seaweedfs",
        );

        let config = Builder::new()
            .behavior_version(BehaviorVersion::latest())
            .endpoint_url(&endpoint)
            .region(Region::new(region))
            .credentials_provider(credentials)
            .force_path_style(true)
            .build();

        let client = Client::from_conf(config);

        let public_url_base = env::var("S3_PUBLIC_URL")
            .expect("S3_PUBLIC_URL must be set");

        Self { client, bucket, public_url_base }
    }

    pub async fn presign_put(
        &self,
        key: &str,
        content_type: &str,
        expires_in_secs: u64,
    ) -> Result<String, String> {
        let presign_config = PresigningConfig::expires_in(
            Duration::from_secs(expires_in_secs),
        ).map_err(|e| format!("Presign config error: {}", e))?;

        let request = self.client
            .put_object()
            .bucket(&self.bucket)
            .key(key)
            .content_type(content_type)
            .presigned(presign_config)
            .await
            .map_err(|e| format!("Failed to presign: {}", e))?;

        Ok(request.uri().to_string())
    }

    pub async fn delete_object(&self, key: &str) -> Result<(), String> {
        self.client
            .delete_object()
            .bucket(&self.bucket)
            .key(key)
            .send()
            .await
            .map_err(|e| format!("Failed to delete: {}", e))?;
        Ok(())
    }

    pub fn extract_key_from_url(&self, url: &str) -> Option<String> {
        let prefix = format!("{}/", self.public_url_base);
        url.strip_prefix(&prefix).map(|k| k.to_string())
    }

    pub fn public_url(&self, key: &str) -> String {
        format!("{}/{}", self.public_url_base, key)
    }
}
