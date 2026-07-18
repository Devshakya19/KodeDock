//! Razorpay payment integration.
//!
//! Reads `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and (optionally)
//! `RAZORPAY_WEBHOOK_SECRET` from the environment. If the API keys are not
//! configured, payment operations fail gracefully with `Error::NotConfigured`
//! (the caller surfaces this as HTTP 503) — useful for local dev without keys.
//!
//! Test vs live: swap `rzp_test_*` keys for `rzp_live_*` keys in the `.env`
//! file. No code changes required.

use hmac::{Hmac, Mac};
use serde::Deserialize;
use sha2::Sha256;

const RAZORPAY_API_BASE: &str = "https://api.razorpay.com/v1";

/// Razorpay-specific errors. Internal message is NOT leaked to the client —
/// callers map these to generic HTTP error strings.
#[derive(Debug)]
pub enum Error {
    /// Keys missing from environment — payments disabled (dev mode).
    NotConfigured,
    /// Network failure talking to Razorpay.
    Network(String),
    /// Razorpay returned a non-2xx response.
    Api { status: u16, body: String },
    /// Signature verification failed (possible tampering / replay).
    InvalidSignature,
}

impl std::fmt::Display for Error {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Error::NotConfigured => write!(f, "Razorpay keys not configured"),
            Error::Network(m) => write!(f, "Razorpay network error: {}", m),
            Error::Api { status, body } => write!(f, "Razorpay API {}: {}", status, body),
            Error::InvalidSignature => write!(f, "Invalid payment signature"),
        }
    }
}

impl std::error::Error for Error {}

/// The Razorpay order created via the Orders API. `amount` is in paise.
#[derive(Debug, Deserialize)]
#[allow(dead_code)]
pub struct RazorpayOrder {
    pub id: String,
    pub status: String,
    pub amount: u64,
    pub currency: String,
    pub receipt: Option<String>,
}

fn read_keys() -> Result<(String, String), Error> {
    let key_id = std::env::var("RAZORPAY_KEY_ID").ok();
    let key_secret = std::env::var("RAZORPAY_KEY_SECRET").ok();
    match (key_id, key_secret) {
        (Some(id), Some(secret)) if !id.is_empty() && !secret.is_empty() => Ok((id, secret)),
        _ => Err(Error::NotConfigured),
    }
}

/// Create a Razorpay order for the given amount (in paise). The `receipt` is
/// an internal reference we can use to match back to our DB order row.
pub async fn create_razorpay_order(
    amount_paise: i32,
    receipt: &str,
) -> Result<RazorpayOrder, Error> {
    let (key_id, key_secret) = read_keys()?;
    let client = reqwest::Client::new();

    let resp = client
        .post(format!("{}/orders", RAZORPAY_API_BASE))
        .basic_auth(&key_id, Some(&key_secret))
        .json(&serde_json::json!({
            "amount": amount_paise,
            "currency": "INR",
            "receipt": receipt,
            "payment_capture": 1, // auto-capture on success
        }))
        .send()
        .await
        .map_err(|e| Error::Network(e.to_string()))?;

    let status = resp.status();
    let body = resp.text().await.map_err(|e| Error::Network(e.to_string()))?;

    if !status.is_success() {
        log::error!(
            "Razorpay create order failed ({}): {}",
            status.as_u16(),
            body
        );
        return Err(Error::Api {
            status: status.as_u16(),
            body,
        });
    }

    serde_json::from_str::<RazorpayOrder>(&body)
        .map_err(|e| Error::Network(format!("parse error: {}", e)))
}

/// Verify the signature returned by Razorpay Checkout on the client.
///
/// The client sends back `razorpay_order_id`, `razorpay_payment_id`, and
/// `razorpay_signature`. Razorpay computes the signature as:
/// `HMAC-SHA256(key_secret, "{order_id}|{payment_id}")` and hex-encodes it.
/// We recompute and compare in constant time to detect tampering.
pub fn verify_payment_signature(
    razorpay_order_id: &str,
    razorpay_payment_id: &str,
    razorpay_signature: &str,
) -> Result<(), Error> {
    let (_key_id, key_secret) = read_keys()?;

    let payload = format!("{}|{}", razorpay_order_id, razorpay_payment_id);

    let mut mac = Hmac::<Sha256>::new_from_slice(key_secret.as_bytes())
        .map_err(|_| Error::InvalidSignature)?;
    mac.update(payload.as_bytes());

    // `verify_slice` performs a constant-time comparison to resist timing
    // attacks. An invalid signature means possible tampering — reject.
    mac.verify_slice(razorpay_signature.as_bytes())
        .map_err(|_| Error::InvalidSignature)
}

/// Verify the signature on a Razorpay webhook payload.
///
/// Razorpay signs webhook bodies with `HMAC-SHA256(webhook_secret, body)`
/// and sends the hex digest in the `X-Razorpay-Signature` header. The body
/// here is the *raw* request bytes (before any JSON parsing) — important,
/// since re-serializing would change whitespace and break the signature.
pub fn verify_webhook_signature(raw_body: &[u8], signature_header: &str) -> Result<(), Error> {
    let webhook_secret = std::env::var("RAZORPAY_WEBHOOK_SECRET")
        .ok()
        .filter(|s| !s.is_empty())
        .ok_or(Error::NotConfigured)?;

    let mut mac = Hmac::<Sha256>::new_from_slice(webhook_secret.as_bytes())
        .map_err(|_| Error::InvalidSignature)?;
    mac.update(raw_body);
    mac.verify_slice(signature_header.as_bytes())
        .map_err(|_| Error::InvalidSignature)
}

/// Public client key id (used to initialize Razorpay Checkout.js). This is
/// safe to expose to the browser — it only identifies the account.
pub fn public_key_id() -> Option<String> {
    std::env::var("RAZORPAY_KEY_ID").ok().filter(|s| !s.is_empty())
}
