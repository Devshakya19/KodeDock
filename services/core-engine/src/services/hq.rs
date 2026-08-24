use crate::models::hq::{HqRole, HqStaff};
use crate::services::auth::{hash_password, verify_password};
use chrono::{Duration, Utc};
use jsonwebtoken::{encode, EncodingKey, Header};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use std::env;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize)]
pub struct HqClaims {
    pub sub: String, // staff_id
    pub role_id: String,
    pub is_hq: bool,
    pub exp: usize,
    pub iat: usize,
}

pub fn generate_hq_token(staff_id: Uuid, role_id: Uuid) -> Result<String, String> {
    let secret = env::var("JWT_SECRET").map_err(|_| "JWT_SECRET must be set".to_string())?;
    let now = Utc::now();
    let expires = now + Duration::hours(12); // HQ sessions are shorter for security

    let claims = HqClaims {
        sub: staff_id.to_string(),
        role_id: role_id.to_string(),
        is_hq: true,
        exp: expires.timestamp() as usize,
        iat: now.timestamp() as usize,
    };

    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(secret.as_bytes()),
    )
    .map_err(|e| format!("Failed to create token: {}", e))
}

pub async fn check_hq_empty(pool: &PgPool) -> Result<bool, String> {
    let count: (i64,) = sqlx::query_as("SELECT count(*) FROM hq_staff")
        .fetch_one(pool)
        .await
        .map_err(|e| format!("Database error: {}", e))?;
    
    Ok(count.0 == 0)
}

pub async fn setup_owner(pool: &PgPool, email: &str, password: &str, name: &str) -> Result<HqStaff, String> {
    let is_empty = check_hq_empty(pool).await?;
    if !is_empty {
        return Err("HQ is already initialized. Cannot run setup again.".to_string());
    }

    let password_hash = hash_password(password)?;
    
    // Find OWNER role id
    let role: (Uuid,) = sqlx::query_as("SELECT id FROM hq_roles WHERE name = 'OWNER'")
        .fetch_one(pool)
        .await
        .map_err(|_| "OWNER role not found in database. Did you run the schema?".to_string())?;

    let staff = sqlx::query_as::<_, HqStaff>(
        r#"INSERT INTO hq_staff (email, password_hash, name, role_id, is_active)
           VALUES ($1, $2, $3, $4, TRUE)
           RETURNING id, email, password_hash, name, role_id, is_active, mfa_enabled, mfa_secret, last_login_ip, last_login_at"#
    )
    .bind(email)
    .bind(&password_hash)
    .bind(name)
    .bind(role.0)
    .fetch_one(pool)
    .await
    .map_err(|e| format!("Failed to create owner: {}", e))?;

    Ok(staff)
}

pub async fn authenticate_staff(pool: &PgPool, email: &str, password: &str) -> Result<(HqStaff, String), String> {
    let staff = sqlx::query_as::<_, HqStaff>(
        "SELECT id, email, password_hash, name, role_id, is_active, mfa_enabled, mfa_secret, last_login_ip, last_login_at FROM hq_staff WHERE email = $1"
    )
    .bind(email)
    .fetch_optional(pool)
    .await
    .map_err(|e| format!("Database error: {}", e))?
    .ok_or_else(|| "Invalid email or password".to_string())?;

    if !staff.is_active {
        return Err("Account is disabled".to_string());
    }

    if !verify_password(password, &staff.password_hash).unwrap_or(false) {
        return Err("Invalid email or password".to_string());
    }

    let role_id = staff.role_id.ok_or_else(|| "Staff has no role assigned".to_string())?;
    let token = generate_hq_token(staff.id, role_id)?;

    Ok((staff, token))
}

use crate::models::hq::HqDashboardStats;

pub async fn get_dashboard_stats(pool: &PgPool) -> Result<HqDashboardStats, String> {
    // 1. Total Revenue (sum of amount_paise where status is 'completed')
    let revenue_row: (Option<i64>,) = sqlx::query_as("SELECT SUM(amount_paise) FROM orders WHERE status = 'completed'")
        .fetch_one(pool)
        .await
        .map_err(|e| format!("Database error fetching revenue: {}", e))?;
    let total_revenue_paise = revenue_row.0.unwrap_or(0);

    // 2. Active Sellers (users with role = 'developer')
    let sellers_row: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM users WHERE role = 'developer'")
        .fetch_one(pool)
        .await
        .map_err(|e| format!("Database error fetching sellers: {}", e))?;
    let active_sellers = sellers_row.0;

    // 3. Products Pending (status = 'draft')
    let products_row: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM products WHERE status = 'draft'")
        .fetch_one(pool)
        .await
        .map_err(|e| format!("Database error fetching products: {}", e))?;
    let products_pending = products_row.0;

    // 4. Active Disputes (status IN 'open', 'under_review')
    let disputes_row: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM disputes WHERE status IN ('open', 'under_review')")
        .fetch_one(pool)
        .await
        .map_err(|e| format!("Database error fetching disputes: {}", e))?;
    let active_disputes = disputes_row.0;

    Ok(HqDashboardStats {
        total_revenue_paise,
        active_sellers,
        products_pending,
        active_disputes,
    })
}

use crate::models::hq::HqProduct;

pub async fn list_hq_products(
    pool: &PgPool,
    page: u32,
    limit: u32,
) -> Result<Vec<HqProduct>, String> {
    let offset = (page.saturating_sub(1)) * limit;

    let products = sqlx::query_as::<_, HqProduct>(
        r#"
        SELECT 
            p.id, 
            p.title, 
            p.seller_id, 
            u.full_name as seller_name, 
            p.status, 
            p.price_paise, 
            p.sales_count, 
            p.created_at
        FROM products p
        LEFT JOIN profiles u ON p.seller_id = u.id
        ORDER BY p.created_at DESC
        LIMIT $1 OFFSET $2
        "#
    )
    .bind(limit as i64)
    .bind(offset as i64)
    .fetch_all(pool)
    .await
    .map_err(|e| format!("Database error fetching products: {}", e))?;

    Ok(products)
}

pub async fn update_product_status(
    pool: &PgPool,
    product_id: Uuid,
    new_status: &str,
) -> Result<(), String> {
    // Valid statuses from the database check constraint
    let valid_statuses = ["draft", "active", "paused", "archived", "limited"];
    if !valid_statuses.contains(&new_status) {
        return Err("Invalid status value".to_string());
    }

    let rows_affected = sqlx::query(
        "UPDATE products SET status = $1, updated_at = NOW() WHERE id = $2"
    )
    .bind(new_status)
    .bind(product_id)
    .execute(pool)
    .await
    .map_err(|e| format!("Database error updating status: {}", e))?
    .rows_affected();

    if rows_affected == 0 {
        return Err("Product not found".to_string());
    }

    Ok(())
}

use crate::models::hq::HqUser;

pub async fn list_hq_users(
    pool: &PgPool,
    page: u32,
    limit: u32,
) -> Result<Vec<HqUser>, String> {
    let offset = (page.saturating_sub(1)) * limit;

    let users = sqlx::query_as::<_, HqUser>(
        r#"
        SELECT 
            id, full_name, email, role, is_verified, is_active, created_at
        FROM users
        ORDER BY created_at DESC
        LIMIT $1 OFFSET $2
        "#
    )
    .bind(limit as i64)
    .bind(offset as i64)
    .fetch_all(pool)
    .await
    .map_err(|e| format!("Database error fetching users: {}", e))?;

    Ok(users)
}

pub async fn update_user_status(
    pool: &PgPool,
    user_id: Uuid,
    is_active: bool,
) -> Result<(), String> {
    let rows_affected = sqlx::query(
        "UPDATE users SET is_active = $1, updated_at = NOW() WHERE id = $2"
    )
    .bind(is_active)
    .bind(user_id)
    .execute(pool)
    .await
    .map_err(|e| format!("Database error updating user status: {}", e))?
    .rows_affected();

    if rows_affected == 0 {
        return Err("User not found".to_string());
    }

    Ok(())
}

use crate::models::hq::{HqWithdrawal, HqFinanceStats};

pub async fn get_finance_stats(pool: &PgPool) -> Result<HqFinanceStats, String> {
    let fee_sum = sqlx::query_scalar::<_, Option<i64>>(
        "SELECT SUM(platform_fee_paise)::bigint FROM orders WHERE status = 'completed'"
    )
    .fetch_one(pool)
    .await
    .unwrap_or(Some(0))
    .unwrap_or(0);

    let escrow_sum = sqlx::query_scalar::<_, Option<i64>>(
        "SELECT SUM(amount_paise)::bigint FROM escrow WHERE status = 'held'"
    )
    .fetch_one(pool)
    .await
    .unwrap_or(Some(0))
    .unwrap_or(0);

    let withdrawals_sum = sqlx::query_scalar::<_, Option<i64>>(
        "SELECT SUM(ABS(amount_paise))::bigint FROM wallet_transactions WHERE type = 'withdrawal'"
    )
    .fetch_one(pool)
    .await
    .unwrap_or(Some(0))
    .unwrap_or(0);

    Ok(HqFinanceStats {
        total_platform_fee_paise: fee_sum,
        total_escrow_paise: escrow_sum,
        total_withdrawals_paise: withdrawals_sum,
    })
}

pub async fn list_hq_withdrawals(
    pool: &PgPool,
    page: u32,
    limit: u32,
) -> Result<Vec<HqWithdrawal>, String> {
    let offset = (page.saturating_sub(1)) * limit;

    // Join wallet_transactions with profiles and seller_payout_accounts
    let withdrawals = sqlx::query_as::<_, HqWithdrawal>(
        r#"
        SELECT 
            wt.id as transaction_id, 
            wt.wallet_user_id as seller_id, 
            u.full_name as seller_name, 
            ABS(wt.amount_paise) as amount_paise, 
            wt.created_at,
            spa.account_type as payout_type,
            json_build_object(
                'account_holder_name', spa.account_holder_name,
                'account_number', spa.account_number,
                'ifsc_code', spa.ifsc_code,
                'bank_name', spa.bank_name,
                'upi_id', spa.upi_id
            ) as payout_details
        FROM wallet_transactions wt
        LEFT JOIN profiles u ON wt.wallet_user_id = u.id
        LEFT JOIN seller_payout_accounts spa ON wt.wallet_user_id = spa.seller_id
        WHERE wt.type = 'withdrawal'
        ORDER BY wt.created_at DESC
        LIMIT $1 OFFSET $2
        "#
    )
    .bind(limit as i64)
    .bind(offset as i64)
    .fetch_all(pool)
    .await
    .map_err(|e| format!("Database error fetching withdrawals: {}", e))?;

    Ok(withdrawals)
}

use crate::models::hq::HqDispute;

pub async fn list_hq_disputes(
    pool: &PgPool,
    page: u32,
    limit: u32,
) -> Result<Vec<HqDispute>, String> {
    let offset = (page.saturating_sub(1)) * limit;

    let disputes = sqlx::query_as::<_, HqDispute>(
        r#"
        SELECT 
            d.id, 
            d.order_id, 
            u.full_name as raised_by_name, 
            d.reason, 
            d.description, 
            d.status, 
            d.resolution, 
            d.created_at
        FROM disputes d
        LEFT JOIN profiles u ON d.raised_by = u.id
        ORDER BY d.created_at DESC
        LIMIT $1 OFFSET $2
        "#
    )
    .bind(limit as i64)
    .bind(offset as i64)
    .fetch_all(pool)
    .await
    .map_err(|e| format!("Database error fetching disputes: {}", e))?;

    Ok(disputes)
}

pub async fn update_hq_dispute(
    pool: &PgPool,
    dispute_id: Uuid,
    admin_id: Uuid,
    status: &str,
    resolution: Option<String>,
) -> Result<(), String> {
    let valid_statuses = ["open", "under_review", "resolved", "closed"];
    if !valid_statuses.contains(&status) {
        return Err("Invalid status value".to_string());
    }

    let rows_affected = sqlx::query(
        r#"
        UPDATE disputes 
        SET status = $1, 
            resolution = $2, 
            resolved_by = $3, 
            resolved_at = CASE WHEN $1 IN ('resolved', 'closed') THEN NOW() ELSE resolved_at END,
            updated_at = NOW() 
        WHERE id = $4
        "#
    )
    .bind(status)
    .bind(resolution)
    .bind(admin_id)
    .bind(dispute_id)
    .execute(pool)
    .await
    .map_err(|e| format!("Database error updating dispute: {}", e))?
    .rows_affected();

    if rows_affected == 0 {
        return Err("Dispute not found".to_string());
    }

    Ok(())
}

pub async fn update_hq_profile(
    pool: &PgPool,
    user_id: Uuid,
    full_name: Option<String>,
    new_password_hash: Option<String>,
) -> Result<(), String> {
    let mut tx = pool.begin().await.map_err(|e| e.to_string())?;

    if let Some(name) = &full_name {
        sqlx::query("UPDATE profiles SET full_name = $1, updated_at = NOW() WHERE id = $2")
            .bind(name)
            .bind(user_id)
            .execute(&mut *tx)
            .await
            .map_err(|e| format!("Failed to update profile: {}", e))?;
            
        sqlx::query("UPDATE users SET full_name = $1, updated_at = NOW() WHERE id = $2")
            .bind(name)
            .bind(user_id)
            .execute(&mut *tx)
            .await
            .map_err(|e| format!("Failed to update user name: {}", e))?;
    }

    if let Some(hash) = new_password_hash {
        sqlx::query("UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2")
            .bind(hash)
            .bind(user_id)
            .execute(&mut *tx)
            .await
            .map_err(|e| format!("Failed to update password: {}", e))?;
    }

    tx.commit().await.map_err(|e| e.to_string())?;

    Ok(())
}

use crate::models::hq::HqSupportTicket;

pub async fn list_hq_support_tickets(
    pool: &PgPool,
    page: u32,
    limit: u32,
) -> Result<Vec<HqSupportTicket>, String> {
    let offset = (page.saturating_sub(1)) * limit;

    let tickets = sqlx::query_as::<_, HqSupportTicket>(
        r#"
        SELECT 
            st.id, 
            st.user_id, 
            u.full_name as user_name, 
            u2.email as user_email,
            st.subject, 
            st.message, 
            st.status, 
            st.priority, 
            st.created_at
        FROM support_tickets st
        LEFT JOIN profiles u ON st.user_id = u.id
        LEFT JOIN users u2 ON st.user_id = u2.id
        ORDER BY 
            CASE st.status 
                WHEN 'open' THEN 1 
                WHEN 'in_progress' THEN 2 
                ELSE 3 
            END,
            st.created_at DESC
        LIMIT $1 OFFSET $2
        "#
    )
    .bind(limit as i64)
    .bind(offset as i64)
    .fetch_all(pool)
    .await
    .map_err(|e| format!("Database error fetching support tickets: {}", e))?;

    Ok(tickets)
}

pub async fn update_support_ticket_status(
    pool: &PgPool,
    ticket_id: Uuid,
    status: &str,
) -> Result<(), String> {
    let valid_statuses = ["open", "in_progress", "resolved", "closed"];
    if !valid_statuses.contains(&status) {
        return Err("Invalid status value".to_string());
    }

    let rows_affected = sqlx::query(
        "UPDATE support_tickets SET status = $1, updated_at = NOW() WHERE id = $2"
    )
    .bind(status)
    .bind(ticket_id)
    .execute(pool)
    .await
    .map_err(|e| format!("Database error updating ticket status: {}", e))?
    .rows_affected();

    if rows_affected == 0 {
        return Err("Support ticket not found".to_string());
    }

    Ok(())
}
