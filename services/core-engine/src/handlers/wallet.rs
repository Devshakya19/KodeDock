use actix_web::{web, HttpRequest, HttpResponse};
use sqlx::PgPool;
use crate::models::Wallet;
use crate::services::ApiResponse;
use crate::middleware::extract_user_id;

pub async fn get_balance(
    pool: web::Data<PgPool>,
    req: HttpRequest,
) -> HttpResponse {
    let user_id = match extract_user_id(&req) {
        Ok(id) => id,
        Err(_) => return HttpResponse::Unauthorized().json(ApiResponse::<()>::error("Unauthorized")),
    };

    let user_uuid = match uuid::Uuid::parse_str(&user_id) {
        Ok(uuid) => uuid,
        Err(_) => return HttpResponse::BadRequest().json(ApiResponse::<()>::error("Invalid user ID")),
    };

    match sqlx::query_as::<_, Wallet>("SELECT * FROM wallets WHERE user_id = $1")
        .bind(user_uuid)
        .fetch_optional(pool.get_ref())
        .await
    {
        Ok(Some(wallet)) => HttpResponse::Ok().json(ApiResponse::success(wallet, "Balance fetched")),
        Ok(None) => {
            // Auto-create wallet with 0 balance if it doesn't exist
            match sqlx::query_as::<_, Wallet>(
                r#"INSERT INTO wallets (user_id, balance_paise, pending_paise, total_earned_paise, total_spent_paise)
                   VALUES ($1, 0, 0, 0, 0)
                   ON CONFLICT (user_id) DO NOTHING
                   RETURNING *"#
            )
            .bind(user_uuid)
            .fetch_optional(pool.get_ref())
            .await
            {
                Ok(Some(wallet)) => HttpResponse::Ok().json(ApiResponse::success(wallet, "Balance fetched")),
                Ok(None) => {
                    // CONFLICT happened — re-fetch existing wallet
                    match sqlx::query_as::<_, Wallet>("SELECT * FROM wallets WHERE user_id = $1")
                        .bind(user_uuid)
                        .fetch_one(pool.get_ref())
                        .await
                    {
                        Ok(wallet) => HttpResponse::Ok().json(ApiResponse::success(wallet, "Balance fetched")),
                        Err(e) => {
                            log::error!("Failed to fetch wallet after insert: {}", e);
                            HttpResponse::InternalServerError().json(ApiResponse::<()>::error("Failed to fetch wallet"))
                        }
                    }
                }
                Err(e) => {
                    log::error!("Failed to create wallet: {}", e);
                    HttpResponse::InternalServerError().json(ApiResponse::<()>::error("Failed to create wallet"))
                }
            }
        }
        Err(e) => {
            log::error!("Failed to fetch wallet: {}", e);
            HttpResponse::InternalServerError().json(ApiResponse::<()>::error("Failed to fetch wallet"))
        }
    }
}

pub async fn topup(
    req: HttpRequest,
    _pool: web::Data<PgPool>,
    _body: web::Json<serde_json::Value>,
) -> HttpResponse {
    // Verify user is authenticated
    let _user_id = match extract_user_id(&req) {
        Ok(id) => id,
        Err(_) => return HttpResponse::Unauthorized().json(ApiResponse::<()>::error("Unauthorized")),
    };

    // TODO: Implement Razorpay integration
    HttpResponse::Ok().json(ApiResponse::<()> {
        success: true,
        data: None,
        message: Some("Top-up will be implemented with Razorpay".to_string()),
        error: None,
    })
}
