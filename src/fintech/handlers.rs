use actix_web::HttpRequest;
use actix_web::{web, HttpResponse};
use hex;
use hmac::{Hmac, Mac};
use sha2::Sha256;
use sqlx::PgPool;
use uuid::Uuid;

use super::models::{CreateOrderRequest, RazorpayWebhookPayload};
use super::service::FintechService;
use crate::auth::middleware::AuthenticatedUser;
use crate::errors::AppError;

pub async fn my_wallet(
    pool: web::Data<PgPool>,
    user: AuthenticatedUser,
) -> Result<HttpResponse, AppError> {
    let wallet = FintechService::get_wallet_balance(&pool, user.id).await?;
    Ok(HttpResponse::Ok().json(wallet))
}

pub async fn create_order(
    _pool: web::Data<PgPool>,
    _user: AuthenticatedUser,
    _req: web::Json<CreateOrderRequest>,
) -> Result<HttpResponse, AppError> {
    // In a real application, we would call Razorpay/Stripe API here to create an intent
    // and return the client secret to the frontend.
    // For now, we return a mock order ID that the frontend can pretend to pay.
    Ok(HttpResponse::Ok().json(serde_json::json!({
        "order_id": Uuid::new_v4().to_string(),
        "status": "pending",
        "client_secret": "mock_client_secret_do_not_use_in_prod"
    })))
}

pub async fn razorpay_webhook(
    pool: web::Data<PgPool>,
    req: HttpRequest,
    body: web::Bytes,
) -> Result<HttpResponse, AppError> {
    // 1. Verify Signature
    let signature = req
        .headers()
        .get("X-Razorpay-Signature")
        .and_then(|h| h.to_str().ok())
        .ok_or_else(|| AppError::Unauthorized("Missing signature".to_string()))?;

    // In a real app, this secret comes from config
    let webhook_secret =
        std::env::var("RAZORPAY_WEBHOOK_SECRET").unwrap_or_else(|_| "dummy_secret".to_string());

    let mut mac = Hmac::<Sha256>::new_from_slice(webhook_secret.as_bytes())
        .map_err(|_| AppError::InternalError("Invalid HMAC key".to_string()))?;

    mac.update(&body);
    let expected_signature = hex::encode(mac.finalize().into_bytes());

    if signature != expected_signature {
        return Err(AppError::Unauthorized("Invalid signature".to_string()));
    }

    // 2. Parse Payload
    let payload: RazorpayWebhookPayload = serde_json::from_slice(&body)
        .map_err(|_| AppError::BadRequest("Invalid JSON".to_string()))?;

    // 3. Extract Order Info and Process Payment
    if payload.event == "payment.captured" {
        let payment_intent_id = payload.payload["payment"]["entity"]["id"]
            .as_str()
            .unwrap_or("unknown");
        let amount_paise = payload.payload["payment"]["entity"]["amount"]
            .as_i64()
            .unwrap_or(0);

        // Normally, you fetch the order from DB using notes/metadata.
        // Here we simulate fetching the order details.
        let buyer_id = Uuid::new_v4(); // Simulated
        let seller_id = Uuid::new_v4(); // Simulated
        let product_id = Uuid::new_v4(); // Simulated
        let version_id = Uuid::new_v4(); // Simulated
        let order_number = format!(
            "ORD-{}",
            Uuid::new_v4()
                .to_string()
                .chars()
                .take(8)
                .collect::<String>()
        );

        FintechService::process_successful_payment(
            &pool,
            "razorpay",
            payment_intent_id, // using intent ID as event ID for deduplication
            &payload.event,
            &serde_json::to_value(&payload).unwrap(),
            &order_number,
            buyer_id,
            seller_id,
            product_id,
            version_id,
            amount_paise,
            payment_intent_id,
        )
        .await?;
    }

    Ok(HttpResponse::Ok().json(serde_json::json!({"status": "ok"})))
}

pub async fn get_disputes(
    _pool: web::Data<PgPool>,
    _user: AuthenticatedUser,
) -> Result<HttpResponse, AppError> {
    // Stub
    Ok(HttpResponse::Ok().json(serde_json::json!([])))
}
