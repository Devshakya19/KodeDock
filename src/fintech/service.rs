use sqlx::PgPool;
use uuid::Uuid;
use chrono::{Utc, Duration};

use crate::errors::AppError;
use super::models::{UserAccount, Order, EscrowTransaction, RazorpayWebhookPayload};
use super::repository::FintechRepository;

pub struct FintechService;

impl FintechService {
    pub async fn get_wallet_balance(pool: &PgPool, user_id: Uuid) -> Result<UserAccount, AppError> {
        FintechRepository::get_wallet_balance(pool, user_id).await
    }

    /// Handles a successful payment webhook from Razorpay
    pub async fn process_successful_payment(
        pool: &PgPool,
        provider: &str,
        event_id: &str,
        event_type: &str,
        payload: &serde_json::Value,
        order_number: &str,
        buyer_id: Uuid,
        seller_id: Uuid,
        product_id: Uuid,
        version_id: Uuid,
        gross_amount_paise: i64,
        payment_intent_id: &str,
    ) -> Result<(), AppError> {
        let mut tx = pool.begin().await?;

        // 1. Idempotency Check: prevent replay attacks
        let is_new = FintechRepository::check_webhook_idempotency(&mut tx, provider, event_id, event_type, payload).await?;
        if !is_new {
            // Already processed this webhook event, safely ignore
            tx.rollback().await?;
            return Ok(());
        }

        // 2. Lock the Seller's Account for Update
        let mut seller_account = FintechRepository::get_wallet_for_update(&mut tx, seller_id).await?;

        // 3. Dynamic Configurations
        let platform_fee_bps = FintechRepository::get_platform_config(pool, "platform_fee_bps").await.unwrap_or(350);
        let tds_rate_bps = FintechRepository::get_platform_config(pool, "tds_rate_bps").await.unwrap_or(100);
        let gst_rate_bps = FintechRepository::get_platform_config(pool, "gst_rate_bps").await.unwrap_or(1800);

        // 4. Mathematical Deductions (Zero Floating Point)
        let platform_fee_paise = (gross_amount_paise * platform_fee_bps) / 10000;
        let tds_amount_paise = (gross_amount_paise * tds_rate_bps) / 10000;
        let gst_amount_paise = (platform_fee_paise * gst_rate_bps) / 10000; // GST is usually on the fee for marketplaces
        
        let net_seller_paise = gross_amount_paise - platform_fee_paise - tds_amount_paise;

        if net_seller_paise < 0 {
            tx.rollback().await?;
            return Err(AppError::FintechError("Net seller amount cannot be negative".to_string()));
        }

        let order_id = Uuid::new_v4();
        let now = Utc::now();

        // 5. Create the Order
        let order = Order {
            id: order_id,
            order_number: order_number.to_string(),
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
            payment_provider: provider.to_string(),
            payment_intent_id: payment_intent_id.to_string(),
            status: "paid_held_in_escrow".to_string(),
            created_at: now,
            updated_at: now,
        };
        FintechRepository::insert_order(&mut tx, &order).await?;

        // 6. Create the Escrow Transaction
        let escrow_id = Uuid::new_v4();
        let escrow_hold_days = FintechRepository::get_platform_config(pool, "escrow_hold_days").await.unwrap_or(7);
        let release_due_at = now + Duration::days(escrow_hold_days as i64);

        let escrow_tx = EscrowTransaction {
            id: escrow_id,
            order_id,
            seller_id,
            buyer_id,
            amount_paise: net_seller_paise,
            status: "held".to_string(),
            release_due_at,
            released_at: None,
            created_at: now,
            updated_at: now,
        };
        FintechRepository::insert_escrow_transaction(&mut tx, &escrow_tx).await?;

        // 7. Double-Entry Journaling
        let platform_account_id = Uuid::nil(); // Using nil UUID to represent KodeDock platform
        let tax_account_id = Uuid::nil(); // Representing tax authority

        // Entry A: Escrow Hold (Debit) - Total money came in and goes to Escrow Holding Account
        FintechRepository::insert_ledger_entry(&mut tx, Uuid::new_v4(), order_id, platform_account_id, "debit", gross_amount_paise, "ESCROW_HOLD", "Gross payment received").await?;
        
        // Entry B: Platform Fee (Credit)
        FintechRepository::insert_ledger_entry(&mut tx, Uuid::new_v4(), order_id, platform_account_id, "credit", platform_fee_paise, "PLATFORM_FEE", "Platform commission").await?;
        
        // Entry C: TDS Withholding (Credit)
        FintechRepository::insert_ledger_entry(&mut tx, Uuid::new_v4(), order_id, tax_account_id, "credit", tds_amount_paise, "TDS_WITHHOLDING", "Section 194-O TDS").await?;
        
        // Entry D: Seller Pending Escrow (Credit)
        FintechRepository::insert_ledger_entry(&mut tx, Uuid::new_v4(), order_id, seller_id, "credit", net_seller_paise, "SELLER_PENDING_ESCROW", "Net payout held in escrow").await?;

        // Validate Double Entry Constraint: Debits (gross) == Credits (fee + tds + net)
        if gross_amount_paise != (platform_fee_paise + tds_amount_paise + net_seller_paise) {
            tx.rollback().await?;
            return Err(AppError::FintechError("Fatal: Ledger drift detected! Debits do not equal credits.".to_string()));
        }

        // 8. Update Seller's Wallet (Pending Balance)
        seller_account.pending_escrow_paise += net_seller_paise;
        FintechRepository::update_balances(&mut tx, seller_id, seller_account.available_balance_paise, seller_account.pending_escrow_paise).await?;

        // Commit transaction
        tx.commit().await?;

        Ok(())
    }
}
