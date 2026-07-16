use actix_web::{web, HttpRequest, HttpResponse};
use sqlx::PgPool;
use serde::{Deserialize, Serialize};
use crate::services::auth;
use crate::services::ApiResponse;

#[derive(Debug, Deserialize)]
pub struct RegisterRequest {
    pub email: String,
    pub password: String,
    pub full_name: String,
    #[allow(dead_code)]
    pub role: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct LoginRequest {
    pub email: String,
    pub password: String,
}

#[derive(Debug, Serialize)]
pub struct AuthResponse {
    pub user: auth::User,
    pub token: String,
}

pub async fn register(
    pool: web::Data<PgPool>,
    body: web::Json<RegisterRequest>,
) -> HttpResponse {
    // Only allow "user" role from self-registration — no privilege escalation
    let role = "user";

    // Validate password strength
    if body.password.len() < 8 {
        return HttpResponse::BadRequest().json(ApiResponse::<()>::error("Password must be at least 8 characters"));
    }
    if !body.password.chars().any(|c| c.is_uppercase()) {
        return HttpResponse::BadRequest().json(ApiResponse::<()>::error("Password must contain at least one uppercase letter"));
    }
    if !body.password.chars().any(|c| c.is_lowercase()) {
        return HttpResponse::BadRequest().json(ApiResponse::<()>::error("Password must contain at least one lowercase letter"));
    }
    if !body.password.chars().any(|c| c.is_numeric()) {
        return HttpResponse::BadRequest().json(ApiResponse::<()>::error("Password must contain at least one number"));
    }

    // Validate email format
    // Validate email format — must have local@domain.tld structure
    let email = body.email.trim().to_lowercase();
    if email.len() < 5 || !email.contains('@') {
        return HttpResponse::BadRequest().json(ApiResponse::<()>::error("Invalid email format"));
    }
    let parts: Vec<&str> = email.split('@').collect();
    if parts.len() != 2 || parts[0].is_empty() || !parts[1].contains('.') || parts[1].starts_with('.') || parts[1].ends_with('.') {
        return HttpResponse::BadRequest().json(ApiResponse::<()>::error("Invalid email format"));
    }

    // Validate name length
    if body.full_name.trim().is_empty() || body.full_name.len() > 100 {
        return HttpResponse::BadRequest().json(ApiResponse::<()>::error("Name must be 1-100 characters"));
    }

    // Check if user already exists
    match auth::get_user_by_email(pool.get_ref(), &body.email).await {
        Ok(_) => {
            return HttpResponse::Conflict().json(ApiResponse::<()>::error("User with this email already exists"));
        }
        Err(_) => {} // User doesn't exist, continue
    }

    // Create user
    let user = match auth::create_user(pool.get_ref(), &body.email, &body.password, &body.full_name, role).await {
        Ok(user) => user,
        Err(e) => {
            log::error!("Failed to create user: {}", e);
            return HttpResponse::InternalServerError().json(ApiResponse::<()>::error("Failed to create user"));
        }
    };

    // Generate token
    let secret = std::env::var("JWT_SECRET").expect("JWT_SECRET must be set");
    let token = match auth::generate_token(&user, &secret) {
        Ok(token) => token,
        Err(e) => {
            log::error!("Failed to generate token: {}", e);
            return HttpResponse::InternalServerError().json(ApiResponse::<()>::error("Failed to generate token"));
        }
    };

    // Create profile
    let _ = sqlx::query("INSERT INTO profiles (id, full_name, role) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING")
        .bind(user.id)
        .bind(&user.full_name)
        .bind(&user.role)
        .execute(pool.get_ref())
        .await;

    // Create wallet
    let _ = sqlx::query("INSERT INTO wallets (user_id, balance_paise) VALUES ($1, 0) ON CONFLICT (user_id) DO NOTHING")
        .bind(user.id)
        .execute(pool.get_ref())
        .await;

    HttpResponse::Ok().json(ApiResponse::success(
        AuthResponse { user, token },
        "User registered successfully",
    ))
}

pub async fn login(
    pool: web::Data<PgPool>,
    body: web::Json<LoginRequest>,
) -> HttpResponse {
    // Get user by email
    let (user_id, email, full_name, role, password_hash) = match auth::get_user_by_email(pool.get_ref(), &body.email).await {
        Ok(user) => user,
        Err(_) => {
            return HttpResponse::Unauthorized().json(ApiResponse::<()>::error("Invalid email or password"));
        }
    };

    // Verify password
    let password_hash = match password_hash {
        Some(hash) => hash,
        None => {
            return HttpResponse::Unauthorized().json(ApiResponse::<()>::error("Invalid email or password"));
        }
    };

    if !auth::verify_password(&body.password, &password_hash).unwrap_or(false) {
        return HttpResponse::Unauthorized().json(ApiResponse::<()>::error("Invalid email or password"));
    }

    let user = auth::User {
        id: user_id,
        email,
        full_name,
        role,
    };

    // Generate token
    let secret = std::env::var("JWT_SECRET").expect("JWT_SECRET must be set");
    let token = match auth::generate_token(&user, &secret) {
        Ok(token) => token,
        Err(e) => {
            log::error!("Failed to generate token: {}", e);
            return HttpResponse::InternalServerError().json(ApiResponse::<()>::error("Failed to generate token"));
        }
    };

    HttpResponse::Ok().json(ApiResponse::success(
        AuthResponse { user, token },
        "Login successful",
    ))
}

pub async fn me(
    pool: web::Data<PgPool>,
    req: HttpRequest,
) -> HttpResponse {
    // Extract token from Authorization header
    let auth_header = req.headers().get("Authorization");
    let token = match auth_header {
        Some(header) => {
            let header_str = header.to_str().unwrap_or("");
            header_str.strip_prefix("Bearer ").unwrap_or(header_str)
        }
        None => {
            return HttpResponse::Unauthorized().json(ApiResponse::<()>::error("Missing Authorization header"));
        }
    };

    // Verify token
    let secret = std::env::var("JWT_SECRET").expect("JWT_SECRET must be set");
    let claims = match auth::verify_token(token, &secret) {
        Ok(claims) => claims,
        Err(_) => {
            return HttpResponse::Unauthorized().json(ApiResponse::<()>::error("Invalid token"));
        }
    };

    // Get user
    let user_id = match uuid::Uuid::parse_str(&claims.sub) {
        Ok(id) => id,
        Err(_) => {
            return HttpResponse::Unauthorized().json(ApiResponse::<()>::error("Invalid user ID in token"));
        }
    };

    match auth::get_user_by_id(pool.get_ref(), user_id).await {
        Ok(user) => HttpResponse::Ok().json(ApiResponse::success(user, "User fetched")),
        Err(e) => HttpResponse::NotFound().json(ApiResponse::<()>::error(&e)),
    }
}

pub async fn logout() -> HttpResponse {
    // In a stateless JWT system, logout is handled client-side
    // The client removes the token from storage
    HttpResponse::Ok().json(ApiResponse::<()> {
        success: true,
        data: None,
        message: Some("Logged out successfully".to_string()),
        error: None,
    })
}

#[derive(Debug, Deserialize)]
pub struct ForgotPasswordRequest {
    pub email: String,
}

pub async fn forgot_password(
    pool: web::Data<PgPool>,
    body: web::Json<ForgotPasswordRequest>,
) -> HttpResponse {
    // Always return success to prevent email enumeration
    let success_response = HttpResponse::Ok().json(ApiResponse::<()> {
        success: true,
        data: None,
        message: Some("If an account with that email exists, a reset link has been sent".to_string()),
        error: None,
    });

    // Try to find user by email
    let user_id = match auth::get_user_by_email(pool.get_ref(), &body.email).await {
        Ok((id, _, _, _, _)) => id,
        Err(_) => return success_response, // Don't reveal if user exists
    };

    // Generate a secure random token (32 bytes = 64 hex chars)
    use rand::Rng;
    let token: String = rand::thread_rng()
        .sample_iter(&rand::distributions::Alphanumeric)
        .take(64)
        .map(char::from)
        .collect();

    // Store token in database with 1-hour expiry
    let expires_at = chrono::Utc::now() + chrono::Duration::hours(1);
    if let Err(e) = sqlx::query(
        "INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)"
    )
    .bind(user_id)
    .bind(&token)
    .bind(expires_at)
    .execute(pool.get_ref())
    .await
    {
        log::error!("Failed to create reset token: {}", e);
        return success_response; // Don't reveal internal errors
    }

    // In production, send email here. For now, log the reset URL.
    let reset_url = format!("http://localhost:3000/reset-password?token={}", token);
    log::info!("Password reset link for {}: {}", body.email, reset_url);

    success_response
}

#[derive(Debug, Deserialize)]
pub struct ResetPasswordRequest {
    pub token: String,
    pub password: String,
}

pub async fn reset_password(
    pool: web::Data<PgPool>,
    body: web::Json<ResetPasswordRequest>,
) -> HttpResponse {
    // Validate password strength
    if body.password.len() < 8 {
        return HttpResponse::BadRequest().json(ApiResponse::<()>::error("Password must be at least 8 characters"));
    }
    if !body.password.chars().any(|c| c.is_uppercase()) {
        return HttpResponse::BadRequest().json(ApiResponse::<()>::error("Password must contain at least one uppercase letter"));
    }
    if !body.password.chars().any(|c| c.is_lowercase()) {
        return HttpResponse::BadRequest().json(ApiResponse::<()>::error("Password must contain at least one lowercase letter"));
    }
    if !body.password.chars().any(|c| c.is_numeric()) {
        return HttpResponse::BadRequest().json(ApiResponse::<()>::error("Password must contain at least one number"));
    }

    // Find the token
    let token_record = sqlx::query_as::<_, (uuid::Uuid, uuid::Uuid, chrono::DateTime<chrono::Utc>, bool)>(
        "SELECT id, user_id, expires_at, used FROM password_reset_tokens WHERE token = $1"
    )
    .bind(&body.token)
    .fetch_optional(pool.get_ref())
    .await;

    let (_, user_id, expires_at, used) = match token_record {
        Ok(Some(record)) => record,
        Ok(None) => return HttpResponse::BadRequest().json(ApiResponse::<()>::error("Invalid or expired reset token")),
        Err(e) => {
            log::error!("Failed to fetch reset token: {}", e);
            return HttpResponse::InternalServerError().json(ApiResponse::<()>::error("Database error"));
        }
    };

    // Check if token is already used
    if used {
        return HttpResponse::BadRequest().json(ApiResponse::<()>::error("Reset token has already been used"));
    }

    // Check if token is expired
    if chrono::Utc::now() > expires_at {
        return HttpResponse::BadRequest().json(ApiResponse::<()>::error("Reset token has expired"));
    }

    // Update the password
    if let Err(e) = auth::update_password(pool.get_ref(), user_id, &body.password).await {
        log::error!("Failed to update password: {}", e);
        return HttpResponse::InternalServerError().json(ApiResponse::<()>::error("Failed to update password"));
    }

    // Mark token as used
    let _ = sqlx::query("UPDATE password_reset_tokens SET used = TRUE WHERE token = $1")
        .bind(&body.token)
        .execute(pool.get_ref())
        .await;

    HttpResponse::Ok().json(ApiResponse::<()> {
        success: true,
        data: None,
        message: Some("Password updated successfully".to_string()),
        error: None,
    })
}
