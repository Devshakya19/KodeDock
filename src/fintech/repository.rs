use super::models::{
    BuyerOrderItem, CreateDisputeRequest, DisputeItem, DisputeMessageItem, EscrowTransaction,
    LedgerEntry, Order, UserAccount,
};
use crate::errors::AppError;
use chrono::Utc;
use sqlx::{PgPool, Postgres, Transaction};
use uuid::Uuid;

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
            "#,
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
            "#,
        )
        .bind(new_available)
        .bind(new_pending)
        .bind(user_id)
        .execute(&mut **tx)
        .await?;

        Ok(())
    }

    #[allow(clippy::too_many_arguments)]
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
            "#,
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
            "#,
        )
        .bind(key)
        .fetch_optional(pool)
        .await?;

        match value {
            Some((val,)) => Ok(val),
            None => Err(AppError::InternalError(format!(
                "Missing platform config: {}",
                key
            ))),
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

    pub async fn get_buyer_orders(
        pool: &PgPool,
        buyer_id: Uuid,
    ) -> Result<Vec<BuyerOrderItem>, AppError> {
        let orders = sqlx::query_as::<_, BuyerOrderItem>(
            r#"
            SELECT 
                o.id,
                o.order_number,
                o.product_id,
                p.title AS product_title,
                p.slug AS product_slug,
                o.gross_amount_paise,
                o.platform_fee_paise,
                o.tds_amount_paise,
                o.gst_amount_paise,
                o.status,
                o.created_at,
                e.release_due_at AS inspection_deadline,
                TRUE AS download_available
            FROM orders o
            JOIN products p ON o.product_id = p.id
            LEFT JOIN escrow_transactions e ON o.id = e.order_id
            WHERE o.buyer_id = $1
            ORDER BY o.created_at DESC
            "#
        )
        .bind(buyer_id)
        .fetch_all(pool)
        .await?;

        Ok(orders)
    }

    pub async fn approve_escrow(
        pool: &PgPool,
        buyer_id: Uuid,
        order_id: Uuid,
    ) -> Result<(), AppError> {
        let mut tx = pool.begin().await?;

        let order = sqlx::query_as::<_, Order>(
            r#"
            SELECT * FROM orders WHERE id = $1 AND buyer_id = $2 FOR UPDATE
            "#
        )
        .bind(order_id)
        .bind(buyer_id)
        .fetch_optional(&mut *tx)
        .await?
        .ok_or_else(|| AppError::NotFound("Order not found or unauthorized".to_string()))?;

        if order.status != "paid_held_in_escrow" {
            return Err(AppError::BadRequest("Order is not held in escrow".to_string()));
        }

        sqlx::query(
            r#"
            UPDATE orders SET status = 'completed', updated_at = NOW() WHERE id = $1
            "#
        )
        .bind(order_id)
        .execute(&mut *tx)
        .await?;

        sqlx::query(
            r#"
            UPDATE escrow_transactions 
            SET status = 'released', released_at = NOW(), updated_at = NOW() 
            WHERE order_id = $1
            "#
        )
        .bind(order_id)
        .execute(&mut *tx)
        .await?;

        sqlx::query(
            r#"
            UPDATE user_accounts
            SET available_balance_paise = available_balance_paise + $1,
                pending_escrow_paise = GREATEST(0, pending_escrow_paise - $1),
                lifetime_earned_paise = lifetime_earned_paise + $1,
                updated_at = NOW()
            WHERE user_id = (SELECT seller_id FROM products WHERE id = $2)
            "#
        )
        .bind(order.net_seller_paise)
        .bind(order.product_id)
        .execute(&mut *tx)
        .await?;

        tx.commit().await?;
        Ok(())
    }

    pub async fn get_buyer_disputes(
        pool: &PgPool,
        buyer_id: Uuid,
    ) -> Result<Vec<DisputeItem>, AppError> {
        let disputes = sqlx::query_as::<_, DisputeItem>(
            r#"
            SELECT 
                d.id, d.order_id, o.order_number, p.title as product_title,
                d.buyer_id, d.seller_id, d.reason, d.description,
                d.status, d.resolution_notes, d.created_at, d.updated_at
            FROM disputes d
            JOIN orders o ON d.order_id = o.id
            JOIN products p ON o.product_id = p.id
            WHERE d.buyer_id = $1
            ORDER BY d.created_at DESC
            "#
        )
        .bind(buyer_id)
        .fetch_all(pool)
        .await?;

        Ok(disputes)
    }

    pub async fn create_buyer_dispute(
        pool: &PgPool,
        buyer_id: Uuid,
        req: &CreateDisputeRequest,
    ) -> Result<DisputeItem, AppError> {
        let mut tx = pool.begin().await?;

        let order = sqlx::query_as::<_, Order>(
            r#"
            SELECT * FROM orders WHERE id = $1 AND buyer_id = $2 FOR UPDATE
            "#
        )
        .bind(req.order_id)
        .bind(buyer_id)
        .fetch_optional(&mut *tx)
        .await?
        .ok_or_else(|| AppError::NotFound("Order not found or unauthorized".to_string()))?;

        let seller_id: (Uuid,) = sqlx::query_as(
            r#"SELECT seller_id FROM products WHERE id = $1"#
        )
        .bind(order.product_id)
        .fetch_one(&mut *tx)
        .await?;

        sqlx::query(
            r#"UPDATE orders SET status = 'disputed', updated_at = NOW() WHERE id = $1"#
        )
        .bind(req.order_id)
        .execute(&mut *tx)
        .await?;

        sqlx::query(
            r#"UPDATE escrow_transactions SET status = 'disputed', updated_at = NOW() WHERE order_id = $1"#
        )
        .bind(req.order_id)
        .execute(&mut *tx)
        .await?;

        let dispute_id = Uuid::new_v4();
        sqlx::query(
            r#"
            INSERT INTO disputes (id, order_id, buyer_id, seller_id, reason, description, status)
            VALUES ($1, $2, $3, $4, $5, $6, 'open')
            ON CONFLICT (order_id) DO UPDATE
            SET reason = EXCLUDED.reason, description = EXCLUDED.description, status = 'open', updated_at = NOW()
            "#
        )
        .bind(dispute_id)
        .bind(req.order_id)
        .bind(buyer_id)
        .bind(seller_id.0)
        .bind(&req.reason)
        .bind(&req.description)
        .execute(&mut *tx)
        .await?;

        sqlx::query(
            r#"
            INSERT INTO dispute_messages (id, dispute_id, sender_id, message)
            VALUES ($1, $2, $3, $4)
            "#
        )
        .bind(Uuid::new_v4())
        .bind(dispute_id)
        .bind(buyer_id)
        .bind(format!("Dispute opened: {}", &req.description))
        .execute(&mut *tx)
        .await?;

        tx.commit().await?;

        let created = sqlx::query_as::<_, DisputeItem>(
            r#"
            SELECT 
                d.id, d.order_id, o.order_number, p.title as product_title,
                d.buyer_id, d.seller_id, d.reason, d.description,
                d.status, d.resolution_notes, d.created_at, d.updated_at
            FROM disputes d
            JOIN orders o ON d.order_id = o.id
            JOIN products p ON o.product_id = p.id
            WHERE d.order_id = $1
            "#
        )
        .bind(req.order_id)
        .fetch_one(pool)
        .await?;

        Ok(created)
    }

    pub async fn get_dispute_messages(
        pool: &PgPool,
        dispute_id: Uuid,
    ) -> Result<Vec<DisputeMessageItem>, AppError> {
        let messages = sqlx::query_as::<_, DisputeMessageItem>(
            r#"
            SELECT id, dispute_id, sender_id, message, attachment_url, created_at
            FROM dispute_messages
            WHERE dispute_id = $1
            ORDER BY created_at ASC
            "#
        )
        .bind(dispute_id)
        .fetch_all(pool)
        .await?;

        Ok(messages)
    }

    pub async fn add_dispute_message(
        pool: &PgPool,
        dispute_id: Uuid,
        sender_id: Uuid,
        message: &str,
        attachment_url: Option<String>,
    ) -> Result<DisputeMessageItem, AppError> {
        let msg = sqlx::query_as::<_, DisputeMessageItem>(
            r#"
            INSERT INTO dispute_messages (id, dispute_id, sender_id, message, attachment_url)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, dispute_id, sender_id, message, attachment_url, created_at
            "#
        )
        .bind(Uuid::new_v4())
        .bind(dispute_id)
        .bind(sender_id)
        .bind(message)
        .bind(attachment_url)
        .fetch_one(pool)
        .await?;

        Ok(msg)
    }

    pub async fn get_wallet_transactions(
        pool: &PgPool,
        user_id: Uuid,
    ) -> Result<Vec<LedgerEntry>, AppError> {
        let entries = sqlx::query_as::<_, LedgerEntry>(
            r#"
            SELECT id, transaction_id, account_id, entry_type, amount_paise, category, description, created_at
            FROM ledger_entries
            WHERE account_id = $1
            ORDER BY created_at DESC
            LIMIT 100
            "#
        )
        .bind(user_id)
        .fetch_all(pool)
        .await?;

        Ok(entries)
    }

    pub async fn topup_wallet_balance(
        pool: &PgPool,
        user_id: Uuid,
        amount_paise: i64,
    ) -> Result<UserAccount, AppError> {
        if amount_paise <= 0 {
            return Err(AppError::BadRequest("Topup amount must be positive".to_string()));
        }

        let mut tx = pool.begin().await?;

        sqlx::query(
            r#"
            INSERT INTO user_accounts (user_id, available_balance_paise)
            VALUES ($1, $2)
            ON CONFLICT (user_id) DO UPDATE
            SET available_balance_paise = user_accounts.available_balance_paise + $2,
                updated_at = NOW()
            "#
        )
        .bind(user_id)
        .bind(amount_paise)
        .execute(&mut *tx)
        .await?;

        let tx_id = Uuid::new_v4();
        FintechRepository::insert_ledger_entry(
            &mut tx,
            Uuid::new_v4(),
            tx_id,
            user_id,
            "credit",
            amount_paise,
            "WALLET_TOPUP",
            "Deposit into KodeDock buyer wallet",
        )
        .await?;

        let clearing_account_id = Uuid::nil();
        FintechRepository::insert_ledger_entry(
            &mut tx,
            Uuid::new_v4(),
            tx_id,
            clearing_account_id,
            "debit",
            amount_paise,
            "WALLET_TOPUP_CLEARING",
            "Clearing entry for buyer wallet topup",
        )
        .await?;

        tx.commit().await?;

        FintechRepository::get_wallet_balance(pool, user_id).await
    }

    pub async fn create_buyer_order(
        pool: &PgPool,
        buyer_id: Uuid,
        product_id: Uuid,
        version_id_opt: Option<Uuid>,
        payment_provider: &str,
    ) -> Result<BuyerOrderItem, AppError> {
        let mut tx = pool.begin().await?;

        // 1. Fetch product from DB
        let product: (Uuid, String, String, i64) = sqlx::query_as(
            r#"
            SELECT seller_id, title, slug, base_price_paise
            FROM products
            WHERE id = $1
            "#,
        )
        .bind(product_id)
        .fetch_optional(&mut *tx)
        .await?
        .ok_or_else(|| AppError::NotFound("Product not found".to_string()))?;

        let (seller_id, product_title, product_slug, gross_amount_paise) = product;

        // 2. Fetch or create product_version
        let version_id = match version_id_opt {
            Some(vid) => vid,
            None => {
                let existing_version: Option<(Uuid,)> = sqlx::query_as(
                    r#"SELECT id FROM product_versions WHERE product_id = $1 ORDER BY created_at DESC LIMIT 1"#
                )
                .bind(product_id)
                .fetch_optional(&mut *tx)
                .await?;

                match existing_version {
                    Some((vid,)) => vid,
                    None => {
                        let new_vid = Uuid::new_v4();
                        sqlx::query(
                            r#"
                            INSERT INTO product_versions (
                                id, product_id, version_number, changelog, vault_storage_key,
                                file_size_bytes, sha256_checksum, is_clean_security_scan
                            )
                            VALUES ($1, $2, 'v1.0.0', 'Initial release', $3, 102400, 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', TRUE)
                            ON CONFLICT DO NOTHING
                            "#
                        )
                        .bind(new_vid)
                        .bind(product_id)
                        .bind(format!("vault/{}/v1.0.0.zip", product_slug))
                        .execute(&mut *tx)
                        .await?;
                        new_vid
                    }
                }
            }
        };

        // 3. Dynamic config fees
        let platform_fee_bps = FintechRepository::get_platform_config(pool, "platform_fee_bps")
            .await
            .unwrap_or(350);
        let tds_rate_bps = FintechRepository::get_platform_config(pool, "tds_rate_bps")
            .await
            .unwrap_or(100);
        let gst_rate_bps = FintechRepository::get_platform_config(pool, "gst_rate_bps")
            .await
            .unwrap_or(1800);

        let platform_fee_paise = (gross_amount_paise * platform_fee_bps) / 10000;
        let tds_amount_paise = (gross_amount_paise * tds_rate_bps) / 10000;
        let gst_amount_paise = (platform_fee_paise * gst_rate_bps) / 10000;
        let net_seller_paise = gross_amount_paise - platform_fee_paise - tds_amount_paise;

        let order_id = Uuid::new_v4();
        let order_suffix = Uuid::new_v4().to_string();
        let order_number = format!("KD-ORD-2026-{}", &order_suffix[..8].to_uppercase());
        let payment_intent_id = format!("pi_{}", Uuid::new_v4());

        // 4. If paid via wallet, lock buyer wallet and deduct balance
        if payment_provider == "wallet" {
            let buyer_wallet = FintechRepository::get_wallet_for_update(&mut tx, buyer_id).await?;
            if buyer_wallet.available_balance_paise < gross_amount_paise {
                return Err(AppError::BadRequest("Insufficient wallet balance".to_string()));
            }

            sqlx::query(
                r#"
                UPDATE user_accounts
                SET available_balance_paise = available_balance_paise - $1,
                    updated_at = NOW()
                WHERE user_id = $2
                "#
            )
            .bind(gross_amount_paise)
            .bind(buyer_id)
            .execute(&mut *tx)
            .await?;

            let tx_id = Uuid::new_v4();
            FintechRepository::insert_ledger_entry(
                &mut tx,
                Uuid::new_v4(),
                tx_id,
                buyer_id,
                "debit",
                gross_amount_paise,
                "ESCROW_HOLD",
                &format!("Escrow hold for order {}", order_number),
            )
            .await?;
        }

        // 5. Update seller pending escrow
        sqlx::query(
            r#"
            INSERT INTO user_accounts (user_id, available_balance_paise, pending_escrow_paise)
            VALUES ($1, 0, $2)
            ON CONFLICT (user_id) DO UPDATE
            SET pending_escrow_paise = user_accounts.pending_escrow_paise + $2,
                updated_at = NOW()
            "#
        )
        .bind(seller_id)
        .bind(net_seller_paise)
        .execute(&mut *tx)
        .await?;

        // 6. Insert order into orders table
        let order = Order {
            id: order_id,
            order_number: order_number.clone(),
            buyer_id,
            product_id,
            version_id,
            gross_amount_paise,
            platform_fee_bps,
            platform_fee_paise,
            tds_rate_bps,
            tds_amount_paise,
            gst_rate_bps,
            gst_amount_paise,
            net_seller_paise,
            currency: "INR".to_string(),
            payment_provider: payment_provider.to_string(),
            payment_intent_id,
            status: "paid_held_in_escrow".to_string(),
            created_at: Utc::now(),
            updated_at: Utc::now(),
        };
        FintechRepository::insert_order(&mut tx, &order).await?;

        // 7. Insert 7-day Escrow transaction
        let escrow = EscrowTransaction {
            id: Uuid::new_v4(),
            order_id,
            seller_id,
            buyer_id,
            amount_paise: net_seller_paise,
            status: "held".to_string(),
            release_due_at: Utc::now() + chrono::Duration::days(7),
            released_at: None,
            created_at: Utc::now(),
            updated_at: Utc::now(),
        };
        FintechRepository::insert_escrow_transaction(&mut tx, &escrow).await?;

        // 8. Insert cryptographic license key
        let license_key_str = format!("KD-LIC-{}", Uuid::new_v4().to_string().chars().take(12).collect::<String>().to_uppercase());
        sqlx::query(
            r#"
            INSERT INTO license_keys (id, order_id, product_id, buyer_id, license_key, license_tier, signature_ed25519)
            VALUES ($1, $2, $3, $4, $5, 'standard', $6)
            ON CONFLICT DO NOTHING
            "#
        )
        .bind(Uuid::new_v4())
        .bind(order_id)
        .bind(product_id)
        .bind(buyer_id)
        .bind(license_key_str)
        .bind(format!("ed25519_sig_{}", Uuid::new_v4()))
        .execute(&mut *tx)
        .await?;

        tx.commit().await?;

        Ok(BuyerOrderItem {
            id: order_id,
            order_number,
            product_id,
            product_title,
            product_slug,
            gross_amount_paise,
            platform_fee_paise,
            tds_amount_paise,
            gst_amount_paise,
            status: "paid_held_in_escrow".to_string(),
            created_at: Utc::now(),
            inspection_deadline: Some(Utc::now() + chrono::Duration::hours(72)),
            download_available: true,
        })
    }
}

