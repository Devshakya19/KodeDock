
use std::fs;
use std::path::Path;


pub fn read_env_file() -> std::collections::HashMap<String, String> {
    let mut map = std::collections::HashMap::new();
    let env_path = Path::new("/app/.env");
    let mut env_content = String::new();
    
    if env_path.exists() {
        if let Ok(c) = fs::read_to_string(env_path) {
            env_content = c;
        }
    } else {
        let local_path = Path::new("../../.env");
        if local_path.exists() {
            if let Ok(c) = fs::read_to_string(local_path) {
                env_content = c;
            }
        }
    }

    for line in env_content.lines() {
        if let Some((k, v)) = line.split_once('=') {
            map.insert(k.trim().to_string(), v.trim().to_string());
        }
    }
    map
}


pub fn update_env_file(updates: &std::collections::HashMap<String, String>) -> Result<(), Box<dyn std::error::Error>> {
    let env_path = Path::new("/app/.env");
    let mut env_content = String::new();
    
    if env_path.exists() {
        env_content = fs::read_to_string(env_path)?;
    } else {
        // If not running in docker or volume not mounted, fallback to local
        let local_path = Path::new("../../.env");
        if local_path.exists() {
            env_content = fs::read_to_string(local_path)?;
        }
    }

    let mut lines: Vec<String> = env_content.lines().map(String::from).collect();
    
    for (k, v) in updates {
        let mut found = false;
        for line in lines.iter_mut() {
            if line.starts_with(&format!("{}=", k)) {
                *line = format!("{}={}", k, v);
                found = true;
                break;
            }
        }
        if !found {
            lines.push(format!("{}={}", k, v));
        }
    }
    
    let new_content = lines.join("\n") + "\n";
    
    if env_path.exists() {
        fs::write(env_path, new_content.clone())?;
    } else {
        let local_path = Path::new("../../.env");
        if local_path.exists() {
            fs::write(local_path, new_content)?;
        }
    }

    Ok(())
}
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

// --- Categories ---

pub async fn get_public_categories(pool: &sqlx::PgPool) -> Result<Vec<crate::models::hq::HqCategory>, sqlx::Error> {
    sqlx::query_as::<_, crate::models::hq::HqCategory>(
        "SELECT id, name, slug, description, (SELECT COUNT(*)::INT FROM products WHERE category_id = categories.id) as product_count, is_active, created_at, updated_at FROM categories WHERE is_active = true ORDER BY name"
    )
    .fetch_all(pool).await
}

pub async fn get_categories(pool: &PgPool) -> Result<Vec<crate::models::hq::HqCategory>, sqlx::Error> {
    sqlx::query_as::<_, crate::models::hq::HqCategory>(
        "SELECT id, name, slug, description, product_count, is_active FROM categories ORDER BY sort_order ASC, name ASC"
    )
    .fetch_all(pool)
    .await
}


pub async fn delete_category(pool: &PgPool, category_id: &str) -> Result<(), sqlx::Error> {
    let id_uuid = Uuid::parse_str(category_id).unwrap_or_default();
    sqlx::query("DELETE FROM categories WHERE id = $1")
        .bind(id_uuid)
        .execute(pool)
        .await?;
    Ok(())
}

pub async fn create_category(pool: &PgPool, name: &str, slug: &str, description: Option<&str>) -> Result<Uuid, sqlx::Error> {
    let rec: (Uuid,) = sqlx::query_as("INSERT INTO categories (name, slug, description) VALUES ($1, $2, $3) RETURNING id")
        .bind(name).bind(slug).bind(description)
        .fetch_one(pool)
        .await?;
    Ok(rec.0)
}

// --- Audit Logs ---
pub async fn log_audit(pool: &PgPool, staff_id: &str, action: &str, target_id: Option<&str>, reason: Option<&str>, old_data: Option<serde_json::Value>, new_data: Option<serde_json::Value>) {
    let staff_uuid = Uuid::parse_str(staff_id).unwrap_or_default();
    let _ = sqlx::query("INSERT INTO hq_audit_logs (staff_id, action, target_resource_id, reason, old_data, new_data) VALUES ($1, $2, $3, $4, $5, $6)")
        .bind(staff_uuid).bind(action).bind(target_id).bind(reason).bind(old_data).bind(new_data)
        .execute(pool).await;
}

pub async fn get_audit_logs(pool: &PgPool) -> Result<Vec<crate::models::hq::HqAuditLogView>, sqlx::Error> {
    sqlx::query_as::<_, crate::models::hq::HqAuditLogView>(
        "SELECT a.id, s.name as staff_name, a.action, a.target_resource_id, a.reason, a.old_data, a.new_data, a.created_at FROM hq_audit_logs a LEFT JOIN hq_staff s ON a.staff_id = s.id ORDER BY a.created_at DESC LIMIT 100"
    ).fetch_all(pool).await
}

// --- Payout Requests ---
pub async fn list_payout_requests(pool: &PgPool, status: Option<&str>) -> Result<Vec<crate::models::hq::HqPayoutRequest>, sqlx::Error> {
    let mut q = "SELECT pr.id, pr.seller_id, u.full_name as seller_name, pr.amount_paise, pr.status, pr.payout_method_id, 
        json_build_object('account_holder_name', spa.account_holder_name, 'account_number', spa.account_number, 'ifsc_code', spa.ifsc_code, 'upi_id', spa.upi_id) as payout_details,
        pr.processed_by, pr.notes, pr.created_at
        FROM payout_requests pr
        LEFT JOIN profiles u ON pr.seller_id = u.id
        LEFT JOIN seller_payout_accounts spa ON pr.payout_method_id = spa.id".to_string();
    
    if let Some(st) = status {
        q.push_str(" WHERE pr.status = $1 ORDER BY pr.created_at DESC");
        sqlx::query_as::<_, crate::models::hq::HqPayoutRequest>(&q)
            .bind(st)
            .fetch_all(pool).await
    } else {
        q.push_str(" ORDER BY pr.created_at DESC");
        sqlx::query_as::<_, crate::models::hq::HqPayoutRequest>(&q)
            .fetch_all(pool).await
    }
}

pub async fn process_payout_request(pool: &PgPool, payout_id: &str, status: &str, notes: Option<&str>, admin_id: &str) -> Result<(), sqlx::Error> {
    let admin_uuid = Uuid::parse_str(admin_id).unwrap_or_default();
    let payout_uuid = Uuid::parse_str(payout_id).unwrap_or_default();
    sqlx::query("UPDATE payout_requests SET status = $1, notes = $2, processed_by = $3, updated_at = NOW() WHERE id = $4")
        .bind(status).bind(notes).bind(admin_uuid).bind(payout_uuid)
        .execute(pool).await?;
    Ok(())
}

// --- Staff Management ---
pub async fn list_staff(pool: &PgPool) -> Result<Vec<crate::models::hq::HqStaffView>, sqlx::Error> {
    sqlx::query_as::<_, crate::models::hq::HqStaffView>(
        "SELECT s.id, s.name, s.email, s.role_id, r.name as role_name, s.is_active, s.last_login_at 
         FROM hq_staff s 
         LEFT JOIN hq_roles r ON s.role_id = r.id 
         ORDER BY s.created_at DESC"
    ).fetch_all(pool).await
}

pub async fn invite_staff(pool: &PgPool, name: &str, email: &str, role_id: Option<&str>, password_hash: &str) -> Result<Uuid, sqlx::Error> {
    let role_uuid = role_id.and_then(|id| Uuid::parse_str(id).ok());
    let row: (Uuid,) = sqlx::query_as("INSERT INTO hq_staff (name, email, role_id, password_hash) VALUES ($1, $2, $3, $4) RETURNING id")
        .bind(name).bind(email).bind(role_uuid).bind(password_hash)
        .fetch_one(pool).await?;
    Ok(row.0)
}


// --- Platform Settings ---
pub async fn get_platform_settings(pool: &sqlx::PgPool) -> Result<Vec<crate::models::hq::PlatformSetting>, sqlx::Error> {
    sqlx::query_as::<_, crate::models::hq::PlatformSetting>("SELECT key, value, description FROM platform_settings ORDER BY key")
    .fetch_all(pool).await
}

pub async fn update_platform_setting(pool: &sqlx::PgPool, key: &str, value: serde_json::Value, admin_id: &str) -> Result<(), sqlx::Error> {
    let admin_uuid = uuid::Uuid::parse_str(admin_id).unwrap_or_default();
    sqlx::query("UPDATE platform_settings SET value = $1, updated_by = $2, updated_at = NOW() WHERE key = $3")
    .bind(value.clone()).bind(admin_uuid).bind(key)
    .execute(pool).await?;
    crate::services::hq::log_audit(pool, admin_id, "UPDATE_SETTING", Some(key), None, None, Some(value)).await;
    Ok(())
}

pub async fn get_platform_integrations(pool: &sqlx::PgPool) -> Result<Vec<crate::models::hq::PlatformIntegration>, sqlx::Error> {
    let mut integrations = sqlx::query_as::<_, crate::models::hq::PlatformIntegration>("SELECT provider, is_active, config FROM platform_integrations ORDER BY provider")
    .fetch_all(pool).await?;
    
    let env_map = read_env_file();
    
    for integ in integrations.iter_mut() {
        if let Some(obj) = integ.config.as_object_mut() {
            for (k, v) in obj.iter_mut() {
                let env_key = format!("{}_{}", integ.provider.to_uppercase(), k.to_uppercase());
                if let Some(env_val) = env_map.get(&env_key) {
                    if !env_val.is_empty() {
                        *v = serde_json::Value::String(env_val.clone());
                    }
                }
            }
        }
    }
    
    Ok(integrations)
}


pub async fn update_platform_integration(pool: &sqlx::PgPool, provider: &str, is_active: bool, config: serde_json::Value, admin_id: &str) -> Result<(), sqlx::Error> {
    let admin_uuid = uuid::Uuid::parse_str(admin_id).unwrap_or_default();
    sqlx::query("UPDATE platform_integrations SET is_active = $1, config = $2, updated_by = $3, updated_at = NOW() WHERE provider = $4")
    .bind(is_active).bind(config.clone()).bind(admin_uuid).bind(provider)
    .execute(pool).await?;
    
    // Convert config to HashMap
    if let Some(obj) = config.as_object() {
        let mut updates = std::collections::HashMap::new();
        for (k, v) in obj {
            let val_str = match v {
                serde_json::Value::String(s) => s.clone(),
                _ => v.to_string(),
            };
            let env_key = format!("{}_{}", provider.to_uppercase(), k.to_uppercase());
            if !is_active {
                updates.insert(env_key.clone(), "".to_string());
                if env_key == "GITHUB_CLIENT_ID" {
                    updates.insert("NEXT_PUBLIC_GITHUB_CLIENT_ID".to_string(), "".to_string());
                }
            } else {
                updates.insert(env_key.clone(), val_str.clone());
                if env_key == "GITHUB_CLIENT_ID" {
                    updates.insert("NEXT_PUBLIC_GITHUB_CLIENT_ID".to_string(), val_str);
                }
            }
        }
        let _ = update_env_file(&updates);
    }
    
    crate::services::hq::log_audit(pool, admin_id, "UPDATE_INTEGRATION", Some(provider), None, None, Some(config)).await;
    Ok(())
}

