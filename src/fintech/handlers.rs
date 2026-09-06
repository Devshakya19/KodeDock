use actix_web::HttpRequest;
use actix_web::{web, HttpResponse};
use hex;
use hmac::{Hmac, Mac};
use sha2::Sha256;
use sqlx::PgPool;
use uuid::Uuid;

use super::models::{
    AddDisputeMessageRequest, CreateDisputeRequest, CreateOrderRequest,
    RazorpayWebhookPayload, WalletTopupRequest,
};
use super::repository::FintechRepository;
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
    pool: web::Data<PgPool>,
    user: AuthenticatedUser,
    req: web::Json<CreateOrderRequest>,
) -> Result<HttpResponse, AppError> {
    let payment_provider = req.payment_provider.as_deref().unwrap_or("razorpay");
    let order = FintechRepository::create_buyer_order(
        &pool,
        user.id,
        req.product_id,
        req.version_id,
        payment_provider,
    )
    .await?;

    Ok(HttpResponse::Created().json(serde_json::json!({
        "data": order,
        "message": "Order created and held in secure escrow"
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
    pool: web::Data<PgPool>,
    user: AuthenticatedUser,
) -> Result<HttpResponse, AppError> {
    let disputes = FintechRepository::get_buyer_disputes(&pool, user.id).await?;
    Ok(HttpResponse::Ok().json(serde_json::json!({
        "data": disputes
    })))
}

pub async fn create_dispute(
    pool: web::Data<PgPool>,
    user: AuthenticatedUser,
    req: web::Json<CreateDisputeRequest>,
) -> Result<HttpResponse, AppError> {
    let dispute = FintechRepository::create_buyer_dispute(&pool, user.id, &req.into_inner()).await?;
    Ok(HttpResponse::Created().json(serde_json::json!({
        "data": dispute,
        "message": "Dispute opened successfully. Escrow has been frozen."
    })))
}

pub async fn get_dispute_messages(
    pool: web::Data<PgPool>,
    _user: AuthenticatedUser,
    path: web::Path<Uuid>,
) -> Result<HttpResponse, AppError> {
    let dispute_id = path.into_inner();
    let messages = FintechRepository::get_dispute_messages(&pool, dispute_id).await?;
    Ok(HttpResponse::Ok().json(serde_json::json!({
        "data": messages
    })))
}

pub async fn add_dispute_message(
    pool: web::Data<PgPool>,
    user: AuthenticatedUser,
    path: web::Path<Uuid>,
    req: web::Json<AddDisputeMessageRequest>,
) -> Result<HttpResponse, AppError> {
    let dispute_id = path.into_inner();
    let msg = FintechRepository::add_dispute_message(
        &pool,
        dispute_id,
        user.id,
        &req.message,
        req.attachment_url.clone(),
    )
    .await?;
    Ok(HttpResponse::Created().json(serde_json::json!({
        "data": msg
    })))
}

pub async fn get_wallet_transactions(
    pool: web::Data<PgPool>,
    user: AuthenticatedUser,
) -> Result<HttpResponse, AppError> {
    let transactions = FintechRepository::get_wallet_transactions(&pool, user.id).await?;
    Ok(HttpResponse::Ok().json(serde_json::json!({
        "data": transactions
    })))
}

pub async fn topup_wallet(
    pool: web::Data<PgPool>,
    user: AuthenticatedUser,
    req: web::Json<WalletTopupRequest>,
) -> Result<HttpResponse, AppError> {
    let account = FintechRepository::topup_wallet_balance(&pool, user.id, req.amount_paise).await?;
    Ok(HttpResponse::Ok().json(serde_json::json!({
        "data": account,
        "message": "Funds added to wallet successfully"
    })))
}

pub async fn get_my_orders(
    pool: web::Data<PgPool>,
    user: AuthenticatedUser,
) -> Result<HttpResponse, AppError> {
    let orders = FintechRepository::get_buyer_orders(&pool, user.id).await?;
    Ok(HttpResponse::Ok().json(serde_json::json!({
        "data": orders
    })))
}

pub async fn approve_escrow(
    pool: web::Data<PgPool>,
    user: AuthenticatedUser,
    path: web::Path<Uuid>,
) -> Result<HttpResponse, AppError> {
    let order_id = path.into_inner();
    FintechRepository::approve_escrow(&pool, user.id, order_id).await?;
    Ok(HttpResponse::Ok().json(serde_json::json!({
        "status": "success",
        "message": "Escrow released to seller account successfully"
    })))
}


