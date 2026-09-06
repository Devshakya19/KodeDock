use sqlx::{PgPool, Postgres, Transaction};
use uuid::Uuid;
use crate::errors::AppError;
use super::models::{UserAccount, Order, EscrowTransaction, LedgerEntry};

pub struct FintechRepository;

impl FintechRepository {
    pub async fn get_wallet_balance(pool: &PgPool, user_id: Uuid) -> Result<UserAccount, AppError> {
        let account = sqlx::query_as::<_, UserAccount>(
            r#"
            SELECT user_id, available_balance_paise, pending_escrow_paise, lifetime_earned_paise, lifetime_withdrawn_paise, is_payout_frozen, created_at, updated_at
            FROM user_accounts
            WHERE user_id = $1
            "#
        )
        .bind(user_id)
        .fetch_optional(pool)
        .await?;

        match account {
            Some(acc) => Ok(acc),
            None => {
                // Return a zero balance if no account exists yet
                Ok(UserAccount {
                    user_id,
                    available_balance_paise: 0,
                    pending_escrow_paise: 0,
                    lifetime_earned_paise: 0,
                    lifetime_withdrawn_paise: 0,
                    is_payout_frozen: false,
                    created_at: chrono::Utc::now(),
                    updated_at: chrono::Utc::now(),
                })
            }
        }
    }

    /// Locks the user's account row for update during a financial transaction
    pub async fn get_wallet_for_update<'a>(
        tx: &mut Transaction<'a, Postgres>,
        user_id: Uuid,
    ) -> Result<UserAccount, AppError> {
        // First ensure the account exists
        sqlx::query(
            r#"
            INSERT INTO user_accounts (user_id, available_balance_paise, pending_escrow_paise)
            VALUES ($1, 0, 0)
            ON CONFLICT (user_id) DO NOTHING
            "#
        )
        .bind(user_id)
        .execute(&mut **tx)
        .await?;

        let account = sqlx::query_as::<_, UserAccount>(
            r#"
            SELECT user_id, available_balance_paise, pending_escrow_paise, lifetime_earned_paise, lifetime_withdrawn_paise, is_payout_frozen, created_at, updated_at
            FROM user_accounts
            WHERE user_id = $1
            FOR UPDATE
            "#
        )
        .bind(user_id)
        .fetch_one(&mut **tx)
        .await?;

        Ok(account)
    }

    pub async fn update_balances<'a>(
        tx: &mut Transaction<'a, Postgres>,
        user_id: Uuid,
        new_available: i64,
        new_pending: i64,
    ) -> Result<(), AppError> {
        sqlx::query(
            r#"
            UPDATE user_accounts
            SET available_balance_paise = $1, pending_escrow_paise = $2, updated_at = NOW()
            WHERE user_id = $3
            "#
        )
        .bind(new_available)
        .bind(new_pending)
        .bind(user_id)
        .execute(&mut **tx)
        .await?;

        Ok(())
    }

    pub async fn insert_ledger_entry<'a>(
        tx: &mut Transaction<'a, Postgres>,
        id: Uuid,
        transaction_id: Uuid,
        account_id: Uuid,
        entry_type: &str, // "debit" or "credit"
        amount_paise: i64,
        category: &str,
        description: &str,
    ) -> Result<(), AppError> {
        sqlx::query(
            r#"
            INSERT INTO ledger_entries (id, transaction_id, account_id, entry_type, amount_paise, category, description)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            "#
        )
        .bind(id)
        .bind(transaction_id)
        .bind(account_id)
        .bind(entry_type)
        .bind(amount_paise)
        .bind(category)
        .bind(description)
        .execute(&mut **tx)
        .await?;

        Ok(())
    }

    pub async fn check_webhook_idempotency<'a>(
        tx: &mut Transaction<'a, Postgres>,
        provider: &str,
        event_id: &str,
        event_type: &str,
        payload: &serde_json::Value,
    ) -> Result<bool, AppError> {
        // Try to insert. If it already exists, it returns false (already processed)
        let result = sqlx::query(
            r#"
            INSERT INTO webhook_events (provider, event_id, event_type, payload, is_processed)
            VALUES ($1, $2, $3, $4, TRUE)
            ON CONFLICT (provider, event_id) DO NOTHING
            "#
        )
        .bind(provider)
        .bind(event_id)
        .bind(event_type)
        .bind(payload)
        .execute(&mut **tx)
        .await?;

        Ok(result.rows_affected() > 0)
    }

    pub async fn get_platform_config(pool: &PgPool, key: &str) -> Result<i64, AppError> {
        let value: Option<(i64,)> = sqlx::query_as(
            r#"
            SELECT config_value_int FROM platform_configs WHERE config_key = $1
            "#
        )
        .bind(key)
        .fetch_optional(pool)
        .await?;

        match value {
            Some((val,)) => Ok(val),
            None => Err(AppError::InternalError(format!("Missing platform config: {}", key)))
        }
    }

    pub async fn insert_order<'a>(
        tx: &mut Transaction<'a, Postgres>,
        order: &Order,
    ) -> Result<(), AppError> {
        sqlx::query(
            r#"
            INSERT INTO orders (
                id, order_number, buyer_id, product_id, version_id,
                gross_amount_paise, platform_fee_bps, platform_fee_paise,
                tds_rate_bps, tds_amount_paise, gst_rate_bps, gst_amount_paise,
                net_seller_paise, currency, payment_provider, payment_intent_id, status, created_at, updated_at
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19
            )
            "#
        )
        .bind(order.id)
        .bind(&order.order_number)
        .bind(order.buyer_id)
        .bind(order.product_id)
        .bind(order.version_id)
        .bind(order.gross_amount_paise)
        .bind(order.platform_fee_bps)
        .bind(order.platform_fee_paise)
        .bind(order.tds_rate_bps)
        .bind(order.tds_amount_paise)
        .bind(order.gst_rate_bps)
        .bind(order.gst_amount_paise)
        .bind(order.net_seller_paise)
        .bind(&order.currency)
        .bind(&order.payment_provider)
        .bind(&order.payment_intent_id)
        .bind(&order.status)
        .bind(order.created_at)
        .bind(order.updated_at)
        .execute(&mut **tx)
        .await?;
        Ok(())
    }

    pub async fn insert_escrow_transaction<'a>(
        tx: &mut Transaction<'a, Postgres>,
        escrow: &EscrowTransaction,
    ) -> Result<(), AppError> {
        sqlx::query(
            r#"
            INSERT INTO escrow_transactions (
                id, order_id, seller_id, buyer_id, amount_paise, status, release_due_at, released_at, created_at, updated_at
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
            )
            "#
        )
        .bind(escrow.id)
        .bind(escrow.order_id)
        .bind(escrow.seller_id)
        .bind(escrow.buyer_id)
        .bind(escrow.amount_paise)
        .bind(&escrow.status)
        .bind(escrow.release_due_at)
        .bind(escrow.released_at)
        .bind(escrow.created_at)
        .bind(escrow.updated_at)
        .execute(&mut **tx)
        .await?;
        Ok(())
    }
}
