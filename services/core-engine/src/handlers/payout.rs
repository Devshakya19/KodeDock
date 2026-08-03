use actix_web::{web, HttpRequest, HttpResponse};
use sqlx::PgPool;
use crate::models::{PayoutAccount, PayoutAccountResponse, CreatePayoutAccountRequest};
use crate::services::ApiResponse;
use crate::middleware::require_developer;

pub async fn get_payout_account(
    pool: web::Data<PgPool>,
    req: HttpRequest,
) -> HttpResponse {
    let seller_id = match require_developer(&req) {
        Ok(id) => id,
        Err(resp) => return resp,
    };

    let seller_uuid = match uuid::Uuid::parse_str(&seller_id) {
        Ok(uuid) => uuid,
        Err(_) => return HttpResponse::BadRequest().json(ApiResponse::<()>::error("Invalid seller ID")),
    };

    match sqlx::query_as::<_, PayoutAccount>(
        "SELECT * FROM seller_payout_accounts WHERE seller_id = $1"
    )
    .bind(seller_uuid)
    .fetch_optional(pool.get_ref())
    .await
    {
        Ok(Some(account)) => {
            let response: PayoutAccountResponse = account.into();
            HttpResponse::Ok().json(ApiResponse::success(response, "Payout account fetched"))
        }
        Ok(None) => HttpResponse::NotFound().json(ApiResponse::<()>::error("No payout account found")),
        Err(e) => {
            log::error!("Failed to fetch payout account: {}", e);
            HttpResponse::InternalServerError().json(ApiResponse::<()>::error("Database error"))
        }
    }
}

pub async fn create_or_update_payout_account(
    pool: web::Data<PgPool>,
    req: HttpRequest,
    body: web::Json<CreatePayoutAccountRequest>,
) -> HttpResponse {
    let seller_id = match require_developer(&req) {
        Ok(id) => id,
        Err(resp) => return resp,
    };

    let seller_uuid = match uuid::Uuid::parse_str(&seller_id) {
        Ok(uuid) => uuid,
        Err(_) => return HttpResponse::BadRequest().json(ApiResponse::<()>::error("Invalid seller ID")),
    };

    // Validate account_type
    if body.account_type != "bank_account" && body.account_type != "upi" {
        return HttpResponse::BadRequest().json(ApiResponse::<()>::error("Invalid account type. Must be 'bank_account' or 'upi'"));
    }

    // Validate based on account_type
    if body.account_type == "bank_account" {
        // Account holder name
        if let Some(ref name) = body.account_holder_name {
            if name.trim().is_empty() || name.len() > 100 {
                return HttpResponse::BadRequest().json(ApiResponse::<()>::error("Account holder name must be 1-100 characters"));
            }
        } else {
            return HttpResponse::BadRequest().json(ApiResponse::<()>::error("Account holder name is required for bank account"));
        }

        // Account number (9-18 digits)
        if let Some(ref num) = body.account_number {
            if num.len() < 9 || num.len() > 18 || !num.chars().all(|c| c.is_ascii_digit()) {
                return HttpResponse::BadRequest().json(ApiResponse::<()>::error("Account number must be 9-18 digits"));
            }
        } else {
            return HttpResponse::BadRequest().json(ApiResponse::<()>::error("Account number is required for bank account"));
        }

        // IFSC code (11 chars: 4 letters + 0 + 6 alphanumeric)
        if let Some(ref ifsc) = body.ifsc_code {
            if ifsc.len() != 11 {
                return HttpResponse::BadRequest().json(ApiResponse::<()>::error("IFSC code must be 11 characters"));
            }
            let chars: Vec<char> = ifsc.chars().collect();
            if !chars[0..4].iter().all(|c| c.is_ascii_alphabetic()) ||
               chars[4] != '0' ||
               !chars[5..11].iter().all(|c| c.is_ascii_alphanumeric()) {
                return HttpResponse::BadRequest().json(ApiResponse::<()>::error("Invalid IFSC code format. Example: SBIN0001234"));
            }
        } else {
            return HttpResponse::BadRequest().json(ApiResponse::<()>::error("IFSC code is required for bank account"));
        }

        // Bank name
        if let Some(ref bank) = body.bank_name {
            if bank.trim().is_empty() || bank.len() > 100 {
                return HttpResponse::BadRequest().json(ApiResponse::<()>::error("Bank name must be 1-100 characters"));
            }
        } else {
            return HttpResponse::BadRequest().json(ApiResponse::<()>::error("Bank name is required for bank account"));
        }
    }

    if body.account_type == "upi" {
        // UPI ID validation (format: name@provider)
        if let Some(ref upi) = body.upi_id {
            let parts: Vec<&str> = upi.split('@').collect();
            if parts.len() != 2 || parts[0].is_empty() || parts[1].is_empty() {
                return HttpResponse::BadRequest().json(ApiResponse::<()>::error("Invalid UPI ID format. Example: yourname@upi"));
            }
            if upi.len() > 100 {
                return HttpResponse::BadRequest().json(ApiResponse::<()>::error("UPI ID must be less than 100 characters"));
            }
        } else {
            return HttpResponse::BadRequest().json(ApiResponse::<()>::error("UPI ID is required for UPI payout"));
        }
    }

    // Upsert: INSERT on conflict (unique seller_id) do UPDATE
    let result = sqlx::query_as::<_, PayoutAccount>(
        r#"
        INSERT INTO seller_payout_accounts (seller_id, account_type, account_holder_name, account_number, ifsc_code, bank_name, upi_id, is_default)
        VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE)
        ON CONFLICT (seller_id) DO UPDATE SET
            account_type = EXCLUDED.account_type,
            account_holder_name = EXCLUDED.account_holder_name,
            account_number = EXCLUDED.account_number,
            ifsc_code = EXCLUDED.ifsc_code,
            bank_name = EXCLUDED.bank_name,
            upi_id = EXCLUDED.upi_id,
            is_default = TRUE,
            updated_at = NOW()
        RETURNING *
        "#
    )
    .bind(seller_uuid)
    .bind(&body.account_type)
    .bind(&body.account_holder_name)
    .bind(&body.account_number)
    .bind(&body.ifsc_code)
    .bind(&body.bank_name)
    .bind(&body.upi_id)
    .fetch_one(pool.get_ref())
    .await;

    match result {
        Ok(account) => {
            let response: PayoutAccountResponse = account.into();
            HttpResponse::Ok().json(ApiResponse::success(response, "Payout account saved"))
        }
        Err(e) => {
            log::error!("Failed to save payout account: {}", e);
            HttpResponse::InternalServerError().json(ApiResponse::<()>::error("Failed to save payout account"))
        }
    }
}

pub async fn delete_payout_account(
    pool: web::Data<PgPool>,
    req: HttpRequest,
) -> HttpResponse {
    let seller_id = match require_developer(&req) {
        Ok(id) => id,
        Err(resp) => return resp,
    };

    let seller_uuid = match uuid::Uuid::parse_str(&seller_id) {
        Ok(uuid) => uuid,
        Err(_) => return HttpResponse::BadRequest().json(ApiResponse::<()>::error("Invalid seller ID")),
    };

    match sqlx::query("DELETE FROM seller_payout_accounts WHERE seller_id = $1")
        .bind(seller_uuid)
        .execute(pool.get_ref())
        .await
    {
        Ok(result) => {
            if result.rows_affected() > 0 {
                HttpResponse::Ok().json(ApiResponse::<()>::success_msg("Payout account deleted"))
            } else {
                HttpResponse::NotFound().json(ApiResponse::<()>::error("No payout account found"))
            }
        }
        Err(e) => {
            log::error!("Failed to delete payout account: {}", e);
            HttpResponse::InternalServerError().json(ApiResponse::<()>::error("Failed to delete payout account"))
        }
    }
}
