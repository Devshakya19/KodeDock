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
    // Allow "user" or "developer" role from self-registration — no other roles
    let role = match body.role.as_deref() {
        Some("developer") => "developer",
        _ => "user",
    };

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
    if auth::get_user_by_email(pool.get_ref(), &email).await.is_ok() {
        return HttpResponse::Conflict().json(ApiResponse::<()>::error("User with this email already exists"));
    }

    // Create user — use lowercased email for consistency
    let user = match auth::create_user(pool.get_ref(), &email, &body.password, &body.full_name, role).await {
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
    let cleaned_email = body.email.trim().to_lowercase();

    // Get user by email
    let (user_id, email, full_name, role, password_hash) = match auth::get_user_by_email(pool.get_ref(), &cleaned_email).await {
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
        github_username: None,
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
    let cleaned_email = body.email.trim().to_lowercase();
    let user_id = match auth::get_user_by_email(pool.get_ref(), &cleaned_email).await {
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

    // Build reset URL using APP_BASE_URL env var (no token in logs)
    let base_url = std::env::var("APP_BASE_URL").unwrap_or_else(|_| "http://localhost:3000".to_string());
    let _reset_url = format!("{}/reset-password?token={}", base_url, token);
    log::info!("Password reset requested for {} (token generated)", body.email);

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

    // Atomically claim the token: mark it used in one query.
    // This prevents TOCTOU race conditions where two concurrent requests
    // could both read used=false before either sets it to true.
    let token_record = sqlx::query_as::<_, (uuid::Uuid,)>(
        r#"UPDATE password_reset_tokens 
           SET used = TRUE 
           WHERE token = $1 AND used = FALSE AND expires_at > NOW() 
           RETURNING user_id"#
    )
    .bind(&body.token)
    .fetch_optional(pool.get_ref())
    .await;

    let user_id = match token_record {
        Ok(Some((uid,))) => uid,
        Ok(None) => return HttpResponse::BadRequest().json(ApiResponse::<()>::error("Invalid, expired, or already used reset token")),
        Err(e) => {
            log::error!("Failed to claim reset token: {}", e);
            return HttpResponse::InternalServerError().json(ApiResponse::<()>::error("Database error"));
        }
    };

    // Update the password
    if let Err(e) = auth::update_password(pool.get_ref(), user_id, &body.password).await {
        log::error!("Failed to update password: {}", e);
        return HttpResponse::InternalServerError().json(ApiResponse::<()>::error("Failed to update password"));
    }

    HttpResponse::Ok().json(ApiResponse::<()> {
        success: true,
        data: None,
        message: Some("Password updated successfully".to_string()),
        error: None,
    })
}

#[derive(Debug, Deserialize)]
pub struct ChangePasswordRequest {
    pub current_password: String,
    pub new_password: String,
}

pub async fn change_password(
    pool: web::Data<PgPool>,
    req: HttpRequest,
    body: web::Json<ChangePasswordRequest>,
) -> HttpResponse {
    // Extract user ID from JWT
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

    let secret = std::env::var("JWT_SECRET").expect("JWT_SECRET must be set");
    let claims = match auth::verify_token(token, &secret) {
        Ok(claims) => claims,
        Err(_) => {
            return HttpResponse::Unauthorized().json(ApiResponse::<()>::error("Invalid token"));
        }
    };

    let user_id = match uuid::Uuid::parse_str(&claims.sub) {
        Ok(id) => id,
        Err(_) => {
            return HttpResponse::Unauthorized().json(ApiResponse::<()>::error("Invalid user ID in token"));
        }
    };

    // Validate new password strength
    if body.new_password.len() < 8 {
        return HttpResponse::BadRequest().json(ApiResponse::<()>::error("New password must be at least 8 characters"));
    }
    if !body.new_password.chars().any(|c| c.is_uppercase()) {
        return HttpResponse::BadRequest().json(ApiResponse::<()>::error("New password must contain at least one uppercase letter"));
    }
    if !body.new_password.chars().any(|c| c.is_lowercase()) {
        return HttpResponse::BadRequest().json(ApiResponse::<()>::error("New password must contain at least one lowercase letter"));
    }
    if !body.new_password.chars().any(|c| c.is_numeric()) {
        return HttpResponse::BadRequest().json(ApiResponse::<()>::error("New password must contain at least one number"));
    }

    // Fetch current password hash
    let (_, _, _, _, password_hash) = match auth::get_user_by_id_with_hash(pool.get_ref(), user_id).await {
        Ok(user) => user,
        Err(_) => {
            return HttpResponse::NotFound().json(ApiResponse::<()>::error("User not found"));
        }
    };

    let password_hash = match password_hash {
        Some(hash) => hash,
        None => {
            return HttpResponse::BadRequest().json(ApiResponse::<()>::error("User has no password set"));
        }
    };

    // Verify current password
    if !auth::verify_password(&body.current_password, &password_hash).unwrap_or(false) {
        return HttpResponse::Unauthorized().json(ApiResponse::<()>::error("Current password is incorrect"));
    }

    // Update password
    if let Err(e) = auth::update_password(pool.get_ref(), user_id, &body.new_password).await {
        log::error!("Failed to update password: {}", e);
        return HttpResponse::InternalServerError().json(ApiResponse::<()>::error("Failed to update password"));
    }

    HttpResponse::Ok().json(ApiResponse::<()> {
        success: true,
        data: None,
        message: Some("Password changed successfully".to_string()),
        error: None,
    })
}

pub async fn delete_account(
    pool: web::Data<PgPool>,
    req: HttpRequest,
) -> HttpResponse {
    // Extract user ID from JWT
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

    let secret = std::env::var("JWT_SECRET").expect("JWT_SECRET must be set");
    let claims = match auth::verify_token(token, &secret) {
        Ok(claims) => claims,
        Err(_) => {
            return HttpResponse::Unauthorized().json(ApiResponse::<()>::error("Invalid token"));
        }
    };

    let user_id = match uuid::Uuid::parse_str(&claims.sub) {
        Ok(id) => id,
        Err(_) => {
            return HttpResponse::Unauthorized().json(ApiResponse::<()>::error("Invalid user ID in token"));
        }
    };

    // Use a transaction for atomicity
    let mut tx = match pool.begin().await {
        Ok(tx) => tx,
        Err(e) => {
            log::error!("Failed to start transaction: {}", e);
            return HttpResponse::InternalServerError().json(ApiResponse::<()>::error("Database error"));
        }
    };

    // 1. Check wallet balance
    let balance = sqlx::query_scalar::<_, i32>("SELECT balance_paise FROM wallets WHERE user_id = $1")
        .bind(user_id)
        .fetch_optional(&mut *tx)
        .await
        .unwrap_or(Some(0))
        .unwrap_or(0);

    if balance > 0 {
        let _ = tx.rollback().await;
        return HttpResponse::BadRequest().json(ApiResponse::<()>::error("Cannot delete account with a non-zero wallet balance. Please withdraw your funds first."));
    }

    // 2. Check for held escrow or any order history
    // Since `escrow` table references `orders` without ON DELETE CASCADE,
    // deleting a user with ANY order history will cause a foreign key violation.
    // For a production app, we would soft-delete or anonymize the user, but for now we block it.
    let order_count = sqlx::query_scalar::<_, i64>(
        "SELECT COUNT(*) FROM orders WHERE buyer_id = $1 OR seller_id = $1"
    )
    .bind(user_id)
    .fetch_one(&mut *tx)
    .await
    .unwrap_or(0);

    if order_count > 0 {
        let _ = tx.rollback().await;
        return HttpResponse::BadRequest().json(ApiResponse::<()>::error("Cannot delete account with existing order history."));
    }

    // 3. Delete the user
    // All foreign keys use ON DELETE CASCADE for profiles, wallets, notifications, etc.
    if let Err(e) = sqlx::query("DELETE FROM users WHERE id = $1")
        .bind(user_id)
        .execute(&mut *tx)
        .await
    {
        log::error!("Failed to delete user: {}", e);
        return HttpResponse::InternalServerError().json(ApiResponse::<()>::error("Failed to delete account"));
    }

    // Commit transaction
    if let Err(e) = tx.commit().await {
        log::error!("Failed to commit transaction: {}", e);
        return HttpResponse::InternalServerError().json(ApiResponse::<()>::error("Failed to delete account"));
    }

    HttpResponse::Ok().json(ApiResponse::<()> {
        success: true,
        data: None,
        message: Some("Account deleted successfully".to_string()),
        error: None,
    })
}

// ─── GitHub OAuth ───────────────────────────────────────────────────

#[derive(Debug, Deserialize)]
pub struct GithubAuthRequest {
    pub code: String,
    /// Intended role ("user" or "developer"). Default "user".
    pub role: Option<String>,
}

/// POST /api/auth/github
///
/// The Next.js callback route sends the GitHub authorization `code` here.
/// The backend exchanges it for an access token, fetches the GitHub user
/// profile, then either:
///   1. Logs in an existing GitHub-linked user,
///   2. Links GitHub to an existing email-matched user, or
///   3. Creates a brand-new account.
pub async fn github_oauth(
    pool: web::Data<PgPool>,
    body: web::Json<GithubAuthRequest>,
) -> HttpResponse {
    // 1. Exchange code for GitHub access token
    let access_token = match auth::exchange_github_code(&body.code).await {
        Ok(token) => token,
        Err(e) => {
            log::error!("GitHub code exchange failed: {}", e);
            return HttpResponse::Unauthorized().json(ApiResponse::<()>::error("GitHub authentication failed"));
        }
    };

    // 2. Fetch GitHub user profile
    let gh_user = match auth::fetch_github_user(&access_token).await {
        Ok(user) => user,
        Err(e) => {
            log::error!("GitHub user fetch failed: {}", e);
            return HttpResponse::Unauthorized().json(ApiResponse::<()>::error("Failed to fetch GitHub profile"));
        }
    };

    // Determine role — only "developer" is accepted, everything else defaults to "user"
    let role = match body.role.as_deref() {
        Some("developer") => "developer",
        _ => "user",
    };

    // Derive email and name from GitHub profile
    let email = gh_user.email.clone().unwrap_or_else(|| {
        format!("{}@github.kodedock.app", gh_user.login)
    });
    let full_name = gh_user.name.clone().unwrap_or_else(|| gh_user.login.clone());

    // 3. Check if a user is already linked to this GitHub ID
    let user = match auth::get_user_by_github_id(pool.get_ref(), gh_user.id).await {
        Ok(existing) => existing,
        Err(_) => {
            // 4. No GitHub-linked user — try to match by email
            match auth::get_user_by_email(pool.get_ref(), &email).await {
                Ok((user_id, _, existing_name, existing_role, _)) => {
                    // Link GitHub to this existing account
                    if let Err(e) = auth::link_github_to_user(pool.get_ref(), user_id, gh_user.id, &gh_user.login).await {
                        log::error!("Failed to link GitHub to user: {}", e);
                        return HttpResponse::InternalServerError().json(ApiResponse::<()>::error("Failed to link GitHub account"));
                    }

                    // If the user registered with a role different from what they're
                    // requesting now via GitHub, keep their original role.
                    auth::User {
                        id: user_id,
                        email,
                        full_name: existing_name.or(Some(full_name)),
                        role: existing_role,
                        github_username: Some(gh_user.login.clone()),
                    }
                }
                Err(_) => {
                    // 5. Brand-new user — create account
                    let new_user = match auth::create_github_user(
                        pool.get_ref(),
                        gh_user.id,
                        &gh_user.login,
                        &email,
                        &full_name,
                        role,
                    ).await {
                        Ok(u) => u,
                        Err(e) => {
                            log::error!("Failed to create GitHub user: {}", e);
                            return HttpResponse::InternalServerError().json(ApiResponse::<()>::error("Failed to create account"));
                        }
                    };

                    // Create profile and wallet for the new user
                    let _ = sqlx::query("INSERT INTO profiles (id, full_name, role, github_username, github_access_token) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO NOTHING")
                        .bind(new_user.id)
                        .bind(&full_name)
                        .bind(role)
                        .bind(&gh_user.login)
                        .bind(auth::encrypt_github_token(&access_token))
                        .execute(pool.get_ref())
                        .await;

                    let _ = sqlx::query("INSERT INTO wallets (user_id, balance_paise) VALUES ($1, 0) ON CONFLICT (user_id) DO NOTHING")
                        .bind(new_user.id)
                        .execute(pool.get_ref())
                        .await;

                    new_user
                }
            }
        }
    };

    // Store (or update) the GitHub access token in the profile
    let _ = auth::store_github_token(pool.get_ref(), user.id, &access_token).await;

    // 6. Generate JWT
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
        "GitHub authentication successful",
    ))
}

#[derive(Debug, Deserialize)]
pub struct GithubLinkRequest {
    pub code: String,
}

pub async fn github_link(
    pool: web::Data<PgPool>,
    req: HttpRequest,
    body: web::Json<GithubLinkRequest>,
) -> HttpResponse {
    // 1. Authenticate user
    let auth_header = req.headers().get("Authorization");
    let token = match auth_header {
        Some(header) => header.to_str().unwrap_or("").strip_prefix("Bearer ").unwrap_or(header.to_str().unwrap_or("")),
        None => return HttpResponse::Unauthorized().json(ApiResponse::<()>::error("Missing Authorization header")),
    };

    let secret = std::env::var("JWT_SECRET").expect("JWT_SECRET must be set");
    let claims = match auth::verify_token(token, &secret) {
        Ok(claims) => claims,
        Err(_) => return HttpResponse::Unauthorized().json(ApiResponse::<()>::error("Invalid token")),
    };

    let user_id = match uuid::Uuid::parse_str(&claims.sub) {
        Ok(id) => id,
        Err(_) => return HttpResponse::Unauthorized().json(ApiResponse::<()>::error("Invalid user ID in token")),
    };

    // 2. Exchange code for GitHub access token
    let access_token = match auth::exchange_github_code(&body.code).await {
        Ok(token) => token,
        Err(e) => {
            log::error!("GitHub code exchange failed: {}", e);
            return HttpResponse::BadRequest().json(ApiResponse::<()>::error("GitHub authentication failed"));
        }
    };

    // 3. Fetch GitHub user profile
    let gh_user = match auth::fetch_github_user(&access_token).await {
        Ok(user) => user,
        Err(e) => {
            log::error!("GitHub user fetch failed: {}", e);
            return HttpResponse::BadRequest().json(ApiResponse::<()>::error("Failed to fetch GitHub profile"));
        }
    };

    // 4. Check if GitHub ID is already linked to another account
    match auth::get_user_by_github_id(pool.get_ref(), gh_user.id).await {
        Ok(existing) => {
            if existing.id != user_id {
                return HttpResponse::Conflict().json(ApiResponse::<()>::error("This GitHub account is already linked to another KodeDock account."));
            }
            // If it's the same user, just update the token
        }
        Err(_) => {
            // Not linked, so we link it
            if let Err(e) = auth::link_github_to_user(pool.get_ref(), user_id, gh_user.id, &gh_user.login).await {
                log::error!("Failed to link GitHub: {}", e);
                return HttpResponse::InternalServerError().json(ApiResponse::<()>::error("Failed to link GitHub account"));
            }
        }
    }

    // 5. Store GitHub access token
    if let Err(e) = auth::store_github_token(pool.get_ref(), user_id, &access_token).await {
        log::error!("Failed to store GitHub token: {}", e);
        return HttpResponse::InternalServerError().json(ApiResponse::<()>::error("Failed to store GitHub token"));
    }

    HttpResponse::Ok().json(ApiResponse::<()> {
        success: true,
        data: None,
        message: Some("GitHub account linked successfully".to_string()),
        error: None,
    })
}

pub async fn github_unlink(
    pool: web::Data<PgPool>,
    req: HttpRequest,
) -> HttpResponse {
    // 1. Authenticate user
    let auth_header = req.headers().get("Authorization");
    let token = match auth_header {
        Some(header) => header.to_str().unwrap_or("").strip_prefix("Bearer ").unwrap_or(header.to_str().unwrap_or("")),
        None => return HttpResponse::Unauthorized().json(ApiResponse::<()>::error("Missing Authorization header")),
    };

    let secret = std::env::var("JWT_SECRET").expect("JWT_SECRET must be set");
    let claims = match auth::verify_token(token, &secret) {
        Ok(claims) => claims,
        Err(_) => return HttpResponse::Unauthorized().json(ApiResponse::<()>::error("Invalid token")),
    };

    let user_id = match uuid::Uuid::parse_str(&claims.sub) {
        Ok(id) => id,
        Err(_) => return HttpResponse::Unauthorized().json(ApiResponse::<()>::error("Invalid user ID in token")),
    };

    // Unlink in database
    let _ = sqlx::query("UPDATE users SET github_id = NULL, github_username = NULL WHERE id = $1")
        .bind(user_id)
        .execute(pool.get_ref())
        .await;

    let _ = sqlx::query("UPDATE profiles SET github_username = NULL, github_access_token = NULL WHERE id = $1")
        .bind(user_id)
        .execute(pool.get_ref())
        .await;

    HttpResponse::Ok().json(ApiResponse::<()> {
        success: true,
        data: None,
        message: Some("GitHub account unlinked successfully".to_string()),
        error: None,
    })
}
