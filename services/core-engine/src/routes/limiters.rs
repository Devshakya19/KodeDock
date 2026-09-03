use actix_governor::{GovernorConfig, GovernorConfigBuilder, KeyExtractor};

/// Custom key extractor that reads the client IP from X-Forwarded-For header
/// (set by the Next.js proxy) or falls back to the direct connection IP.
/// This ensures rate limiting applies per-user, not per-proxy-server.
#[derive(Clone)]
pub struct ForwardedIpKeyExtractor;

impl KeyExtractor for ForwardedIpKeyExtractor {
    type Key = String;
    type KeyExtractionError = std::convert::Infallible;

    fn extract(
        &self,
        req: &actix_web::dev::ServiceRequest,
    ) -> Result<Self::Key, Self::KeyExtractionError> {
        let ip = req
            .headers()
            .get("x-forwarded-for")
            .and_then(|v| v.to_str().ok())
            .and_then(|v| v.split(',').next())
            .map(|s| s.trim().to_string())
            .unwrap_or_else(|| {
                req.peer_addr()
                    .map(|addr| addr.ip().to_string())
                    .unwrap_or_else(|| "unknown".to_string())
            });
        Ok(ip)
    }
}

pub type RateLimitConfig =
    GovernorConfig<ForwardedIpKeyExtractor, actix_governor::governor::middleware::NoOpMiddleware>;

#[derive(Clone)]
pub struct RateLimiters {
    pub auth: RateLimitConfig,
    pub upload: RateLimitConfig,
    pub verify: RateLimitConfig,
    pub order: RateLimitConfig,
}

impl RateLimiters {
    pub fn new() -> Self {
        let auth = GovernorConfigBuilder::default()
            .seconds_per_request(12)
            .burst_size(5)
            .key_extractor(ForwardedIpKeyExtractor)
            .finish()
            .expect("Failed to build auth rate limiter");

        let upload = GovernorConfigBuilder::default()
            .seconds_per_request(6)
            .burst_size(10)
            .key_extractor(ForwardedIpKeyExtractor)
            .finish()
            .expect("Failed to build upload rate limiter");

        let verify = GovernorConfigBuilder::default()
            .seconds_per_request(6)
            .burst_size(10)
            .key_extractor(ForwardedIpKeyExtractor)
            .finish()
            .expect("Failed to build verify rate limiter");

        let order = GovernorConfigBuilder::default()
            .seconds_per_request(5)
            .burst_size(3)
            .key_extractor(ForwardedIpKeyExtractor)
            .finish()
            .expect("Failed to build order rate limiter");

        Self {
            auth,
            upload,
            verify,
            order,
        }
    }
}
