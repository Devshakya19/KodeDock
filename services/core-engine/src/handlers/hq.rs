use crate::services::hq::{authenticate_staff, setup_owner};
use actix_web::{web, HttpResponse, Responder};
use serde::Deserialize;
use serde_json::json;
use sqlx::PgPool;

pub async fn health_check() -> impl Responder {
    HttpResponse::Ok().json(json!({
        "status": "success",
        "message": "KodeDock HQ API is operational",
        "version": "1.0.0"
    }))
}

#[derive(Deserialize)]
pub struct SetupRequest {
    pub email: String,
    pub password: String,
    pub name: String,
}

pub async fn setup(
    pool: web::Data<PgPool>,
    req: web::Json<SetupRequest>,
) -> impl Responder {
    match setup_owner(pool.get_ref(), &req.email, &req.password, &req.name).await {
        Ok(_) => HttpResponse::Ok().json(json!({
            "status": "success",
            "message": "Owner account created successfully. You can now login to HQ."
        })),
        Err(e) => HttpResponse::BadRequest().json(json!({
            "status": "error",
            "message": e
        })),
    }
}

#[derive(Deserialize)]
pub struct LoginRequest {
    pub email: String,
    pub password: String,
}

pub async fn login(
    pool: web::Data<PgPool>,
    req: web::Json<LoginRequest>,
) -> impl Responder {
    match authenticate_staff(pool.get_ref(), &req.email, &req.password).await {
        Ok((staff, token)) => HttpResponse::Ok().json(json!({
            "status": "success",
            "data": {
                "token": token,
                "staff": {
                    "id": staff.id,
                    "name": staff.name,
                    "email": staff.email,
                    "role_id": staff.role_id,
                    "is_active": staff.is_active
                }
            }
        })),
        Err(e) => HttpResponse::Unauthorized().json(json!({
            "status": "error",
            "message": e
        })),
    }
}

use crate::middleware::require_hq_access;
use actix_web::HttpRequest;
use uuid::Uuid;
use crate::models::hq::HqStaff;

pub async fn me(
    pool: web::Data<PgPool>,
    req: HttpRequest,
) -> impl Responder {
    let hq_claims = match require_hq_access(&req) {
        Ok(c) => c,
        Err(response) => return response,
    };

    let staff_id = match Uuid::parse_str(&hq_claims.staff_id) {
        Ok(id) => id,
        Err(_) => return HttpResponse::BadRequest().json(json!({"status": "error", "message": "Invalid staff ID format"})),
    };

    // Fetch the latest staff info from the database
    let staff = match sqlx::query_as::<_, HqStaff>(
        "SELECT id, email, password_hash, name, role_id, is_active, mfa_enabled, mfa_secret, last_login_ip, last_login_at FROM hq_staff WHERE id = $1"
    )
    .bind(staff_id)
    .fetch_optional(pool.get_ref())
    .await {
        Ok(Some(s)) => s,
        Ok(None) => return HttpResponse::Unauthorized().json(json!({"status": "error", "message": "Staff member no longer exists"})),
        Err(e) => return HttpResponse::InternalServerError().json(json!({"status": "error", "message": format!("Database error: {}", e)})),
    };

    if !staff.is_active {
        return HttpResponse::Forbidden().json(json!({"status": "error", "message": "This staff account has been disabled"}));
    }

    HttpResponse::Ok().json(json!({
        "status": "success",
        "data": {
            "staff": {
                "id": staff.id,
                "name": staff.name,
                "email": staff.email,
                "role_id": staff.role_id,
                "is_active": staff.is_active,
                "mfa_enabled": staff.mfa_enabled
            }
        }
    }))
}

use crate::services::hq::get_dashboard_stats;

pub async fn stats(
    pool: web::Data<PgPool>,
    req: HttpRequest,
) -> impl Responder {
    // 1. Authenticate Request
    if let Err(response) = require_hq_access(&req) {
        return response;
    }

    // 2. Fetch Stats
    match get_dashboard_stats(pool.get_ref()).await {
        Ok(stats) => HttpResponse::Ok().json(json!({
            "status": "success",
            "data": stats
        })),
        Err(e) => HttpResponse::InternalServerError().json(json!({
            "status": "error",
            "message": e
        })),
    }
}

use crate::services::hq::list_hq_products;

#[derive(serde::Deserialize)]
pub struct PaginationQuery {
    pub page: Option<u32>,
    pub limit: Option<u32>,
}

pub async fn get_products(
    pool: web::Data<PgPool>,
    req: HttpRequest,
    query: web::Query<PaginationQuery>,
) -> impl Responder {
    if let Err(response) = require_hq_access(&req) {
        return response;
    }

    let page = query.page.unwrap_or(1);
    let limit = query.limit.unwrap_or(50);

    match list_hq_products(pool.get_ref(), page, limit).await {
        Ok(products) => HttpResponse::Ok().json(json!({
            "status": "success",
            "data": products
        })),
        Err(e) => HttpResponse::InternalServerError().json(json!({
            "status": "error",
            "message": e
        })),
    }
}

use crate::services::hq::update_product_status;

#[derive(serde::Deserialize)]
pub struct UpdateStatusRequest {
    pub status: String,
}

pub async fn set_product_status(
    pool: web::Data<PgPool>,
    req: HttpRequest,
    path: web::Path<Uuid>,
    body: web::Json<UpdateStatusRequest>,
) -> impl Responder {
    if let Err(response) = require_hq_access(&req) {
        return response;
    }

    let product_id = path.into_inner();

    match update_product_status(pool.get_ref(), product_id, &body.status).await {
        Ok(_) => HttpResponse::Ok().json(json!({
            "status": "success",
            "message": "Product status updated successfully"
        })),
        Err(e) => HttpResponse::BadRequest().json(json!({
            "status": "error",
            "message": e
        })),
    }
}

use crate::services::hq::{list_hq_users, update_user_status};

pub async fn get_users(
    pool: web::Data<PgPool>,
    req: HttpRequest,
    query: web::Query<PaginationQuery>,
) -> impl Responder {
    if let Err(response) = require_hq_access(&req) {
        return response;
    }

    let page = query.page.unwrap_or(1);
    let limit = query.limit.unwrap_or(50);

    match list_hq_users(pool.get_ref(), page, limit).await {
        Ok(users) => HttpResponse::Ok().json(json!({
            "status": "success",
            "data": users
        })),
        Err(e) => HttpResponse::InternalServerError().json(json!({
            "status": "error",
            "message": e
        })),
    }
}

#[derive(serde::Deserialize)]
pub struct UpdateUserStatusRequest {
    pub is_active: bool,
}

pub async fn set_user_status(
    pool: web::Data<PgPool>,
    req: HttpRequest,
    path: web::Path<Uuid>,
    body: web::Json<UpdateUserStatusRequest>,
) -> impl Responder {
    if let Err(response) = require_hq_access(&req) {
        return response;
    }

    let user_id = path.into_inner();

    match update_user_status(pool.get_ref(), user_id, body.is_active).await {
        Ok(_) => HttpResponse::Ok().json(json!({
            "status": "success",
            "message": format!("User {}", if body.is_active { "activated" } else { "suspended" })
        })),
        Err(e) => HttpResponse::BadRequest().json(json!({
            "status": "error",
            "message": e
        })),
    }
}

use crate::services::hq::{get_finance_stats, list_hq_withdrawals};

pub async fn finance_stats(pool: web::Data<PgPool>, req: HttpRequest) -> impl Responder {
    if let Err(response) = require_hq_access(&req) {
        return response;
    }

    match get_finance_stats(pool.get_ref()).await {
        Ok(stats) => HttpResponse::Ok().json(json!({
            "status": "success",
            "data": stats
        })),
        Err(e) => HttpResponse::InternalServerError().json(json!({
            "status": "error",
            "message": e
        })),
    }
}

pub async fn get_withdrawals(
    pool: web::Data<PgPool>,
    req: HttpRequest,
    query: web::Query<PaginationQuery>,
) -> impl Responder {
    if let Err(response) = require_hq_access(&req) {
        return response;
    }

    let page = query.page.unwrap_or(1);
    let limit = query.limit.unwrap_or(50);

    match list_hq_withdrawals(pool.get_ref(), page, limit).await {
        Ok(withdrawals) => HttpResponse::Ok().json(json!({
            "status": "success",
            "data": withdrawals
        })),
        Err(e) => HttpResponse::InternalServerError().json(json!({
            "status": "error",
            "message": e
        })),
    }
}

use crate::services::hq::{list_hq_disputes, update_hq_dispute};

pub async fn get_disputes(
    pool: web::Data<PgPool>,
    req: HttpRequest,
    query: web::Query<PaginationQuery>,
) -> impl Responder {
    if let Err(response) = require_hq_access(&req) {
        return response;
    }

    let page = query.page.unwrap_or(1);
    let limit = query.limit.unwrap_or(50);

    match list_hq_disputes(pool.get_ref(), page, limit).await {
        Ok(disputes) => HttpResponse::Ok().json(json!({
            "status": "success",
            "data": disputes
        })),
        Err(e) => HttpResponse::InternalServerError().json(json!({
            "status": "error",
            "message": e
        })),
    }
}

#[derive(serde::Deserialize)]
pub struct UpdateDisputeRequest {
    pub status: String,
    pub resolution: Option<String>,
}

pub async fn set_dispute_status(
    pool: web::Data<PgPool>,
    req: HttpRequest,
    path: web::Path<Uuid>,
    body: web::Json<UpdateDisputeRequest>,
) -> impl Responder {
    let auth_claims = match require_hq_access(&req) {
        Ok(claims) => claims,
        Err(response) => return response,
    };
    
    // We need the admin's UUID to record who resolved it
    let admin_id = match Uuid::parse_str(&auth_claims.staff_id) {
        Ok(id) => id,
        Err(_) => return HttpResponse::BadRequest().json(json!({"status":"error", "message": "Invalid staff ID"})),
    };

    let dispute_id = path.into_inner();

    match update_hq_dispute(pool.get_ref(), dispute_id, admin_id, &body.status, body.resolution.clone()).await {
        Ok(_) => HttpResponse::Ok().json(json!({
            "status": "success",
            "message": "Dispute updated successfully"
        })),
        Err(e) => HttpResponse::BadRequest().json(json!({
            "status": "error",
            "message": e
        })),
    }
}

use crate::services::hq::update_hq_profile;
use crate::services::auth::hash_password;

#[derive(serde::Deserialize)]
pub struct UpdateProfileRequest {
    pub full_name: Option<String>,
    pub password: Option<String>,
}

pub async fn set_settings(
    pool: web::Data<PgPool>,
    req: HttpRequest,
    body: web::Json<UpdateProfileRequest>,
) -> impl Responder {
    let auth_claims = match require_hq_access(&req) {
        Ok(claims) => claims,
        Err(response) => return response,
    };
    
    let admin_id = match Uuid::parse_str(&auth_claims.staff_id) {
        Ok(id) => id,
        Err(_) => return HttpResponse::BadRequest().json(json!({"status":"error", "message": "Invalid staff ID"})),
    };

    let password_hash = match &body.password {
        Some(p) if !p.trim().is_empty() => {
            match hash_password(p) {
                Ok(h) => Some(h),
                Err(_) => return HttpResponse::InternalServerError().json(json!({"status":"error", "message": "Failed to hash password"})),
            }
        }
        _ => None,
    };

    match update_hq_profile(pool.get_ref(), admin_id, body.full_name.clone(), password_hash).await {
        Ok(_) => HttpResponse::Ok().json(json!({
            "status": "success",
            "message": "HQ settings updated successfully"
        })),
        Err(e) => HttpResponse::BadRequest().json(json!({
            "status": "error",
            "message": e
        })),
    }
}

use crate::services::hq::{list_hq_support_tickets, update_support_ticket_status};

pub async fn get_support_tickets(
    pool: web::Data<PgPool>,
    req: HttpRequest,
    query: web::Query<PaginationQuery>,
) -> impl Responder {
    if let Err(response) = require_hq_access(&req) {
        return response;
    }

    let page = query.page.unwrap_or(1);
    let limit = query.limit.unwrap_or(50);

    match list_hq_support_tickets(pool.get_ref(), page, limit).await {
        Ok(tickets) => HttpResponse::Ok().json(json!({
            "status": "success",
            "data": tickets
        })),
        Err(e) => HttpResponse::InternalServerError().json(json!({
            "status": "error",
            "message": e
        })),
    }
}

#[derive(serde::Deserialize)]
pub struct UpdateTicketStatusRequest {
    pub status: String,
}

pub async fn set_ticket_status(
    pool: web::Data<PgPool>,
    req: HttpRequest,
    path: web::Path<Uuid>,
    body: web::Json<UpdateTicketStatusRequest>,
) -> impl Responder {
    if let Err(response) = require_hq_access(&req) {
        return response;
    }

    let ticket_id = path.into_inner();

    match update_support_ticket_status(pool.get_ref(), ticket_id, &body.status).await {
        Ok(_) => HttpResponse::Ok().json(json!({
            "status": "success",
            "message": "Support ticket status updated"
        })),
        Err(e) => HttpResponse::BadRequest().json(json!({
            "status": "error",
            "message": e
        })),
    }
}
