-- =============================================================================
-- KODEDOCK MIGRATION 003: WALLETS, TOPUPS, PAYOUTS & DOUBLE-ENTRY LEDGER
-- All currency values strictly stored as BIGINT (Integer Paise, ₹1.00 = 100 Paise)
-- =============================================================================

-- Wallets table
CREATE TABLE IF NOT EXISTS wallets (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  balance_paise BIGINT NOT NULL DEFAULT 0 CHECK (balance_paise >= 0),
  pending_paise BIGINT NOT NULL DEFAULT 0 CHECK (pending_paise >= 0),
  total_earned_paise BIGINT NOT NULL DEFAULT 0 CHECK (total_earned_paise >= 0),
  total_spent_paise BIGINT NOT NULL DEFAULT 0 CHECK (total_spent_paise >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wallet topups table (Razorpay payments)
CREATE TABLE IF NOT EXISTS wallet_topups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  razorpay_order_id TEXT NOT NULL UNIQUE,
  razorpay_payment_id TEXT,
  razorpay_signature TEXT,
  amount_paise BIGINT NOT NULL CHECK (amount_paise > 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wallet transactions audit log
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_user_id UUID NOT NULL REFERENCES wallets(user_id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('topup', 'purchase', 'sale', 'withdrawal', 'refund', 'adjustment', 'commission', 'tds_deduction')),
  amount_paise BIGINT NOT NULL,
  balance_after_paise BIGINT NOT NULL CHECK (balance_after_paise >= 0),
  description TEXT,
  reference_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seller payout accounts (Bank account or UPI ID for withdrawals)
-- Modifying this requires RFC 6238 TOTP 2FA verification
CREATE TABLE IF NOT EXISTS seller_payout_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  account_type TEXT NOT NULL CHECK (account_type IN ('bank_account', 'upi')),
  account_holder_name TEXT,
  account_number TEXT,
  ifsc_code TEXT,
  bank_name TEXT,
  upi_id TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  is_default BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Double-Entry Balanced Ledger Journal Table
-- Invariant: Sum(Debits) == Sum(Credits) across all transaction_ids
CREATE TABLE IF NOT EXISTS ledger_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id UUID NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  entry_type VARCHAR(10) NOT NULL CHECK (entry_type IN ('DEBIT', 'CREDIT')),
  account_name VARCHAR(64) NOT NULL, -- e.g. 'USER_WALLET', 'PLATFORM_REVENUE', 'ESCROW_HOLD', 'TDS_PAYABLE', 'GST_PAYABLE'
  amount_paise BIGINT NOT NULL CHECK (amount_paise > 0),
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ledger_tx ON ledger_entries (transaction_id);
CREATE INDEX IF NOT EXISTS idx_ledger_user ON ledger_entries (user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_user ON wallet_transactions (wallet_user_id);
