-- =============================================================
-- Migration 003: Double-Entry Fintech Ledger & 7-Day Escrow
-- =============================================================

-- 1. User Financial Balances & Payout Account Table
CREATE TABLE IF NOT EXISTS user_accounts (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    available_balance_paise BIGINT NOT NULL DEFAULT 0 CHECK (available_balance_paise >= 0),
    pending_escrow_paise BIGINT NOT NULL DEFAULT 0 CHECK (pending_escrow_paise >= 0),
    lifetime_earned_paise BIGINT NOT NULL DEFAULT 0 CHECK (lifetime_earned_paise >= 0),
    lifetime_withdrawn_paise BIGINT NOT NULL DEFAULT 0 CHECK (lifetime_withdrawn_paise >= 0),
    bank_account_number_enc TEXT,    -- AES-256-GCM Encrypted
    bank_ifsc_code VARCHAR(11),
    bank_account_holder_name VARCHAR(128),
    upi_id VARCHAR(64),
    is_payout_frozen BOOLEAN NOT NULL DEFAULT FALSE,
    payout_frozen_until TIMESTAMPTZ, -- Mandatory 24-hour freeze on bank detail change
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Marketplace Orders Table (Integer Paise Calculations)
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(32) UNIQUE NOT NULL, -- e.g. 'KD-ORD-2026-00001'
    buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    version_id UUID NOT NULL REFERENCES product_versions(id) ON DELETE RESTRICT,
    gross_amount_paise BIGINT NOT NULL CHECK (gross_amount_paise > 0),
    platform_fee_bps BIGINT NOT NULL DEFAULT 350,   -- 3.5% = 350 basis points
    platform_fee_paise BIGINT NOT NULL,
    tds_rate_bps BIGINT NOT NULL DEFAULT 100,       -- 1.0% Section 194-O
    tds_amount_paise BIGINT NOT NULL,
    gst_rate_bps BIGINT NOT NULL DEFAULT 1800,      -- 18.0% GST
    gst_amount_paise BIGINT NOT NULL DEFAULT 0,
    net_seller_paise BIGINT NOT NULL,               -- gross - platform_fee - tds
    currency VARCHAR(3) NOT NULL DEFAULT 'INR',
    payment_provider VARCHAR(32) NOT NULL CHECK (payment_provider IN ('razorpay', 'stripe', 'wallet')),
    payment_intent_id VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending',
        'paid_held_in_escrow',
        'completed',
        'disputed',
        'refunded',
        'failed'
    )),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_product_id ON orders(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- 3. 7-Day Financial Escrow State Machine Table
CREATE TABLE IF NOT EXISTS escrow_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID UNIQUE NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    amount_paise BIGINT NOT NULL CHECK (amount_paise > 0),
    status VARCHAR(32) NOT NULL DEFAULT 'held' CHECK (status IN (
        'held',
        'released',
        'disputed',
        'refunded'
    )),
    release_due_at TIMESTAMPTZ NOT NULL, -- NOW() + 7 Days
    released_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_escrow_seller_id ON escrow_transactions(seller_id);
CREATE INDEX IF NOT EXISTS idx_escrow_release_due ON escrow_transactions(release_due_at, status) 
WHERE status = 'held';

-- 4. Double-Entry General Ledger Entries Table
CREATE TABLE IF NOT EXISTS ledger_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL,        -- Correlates matching debits and credits
    account_id UUID NOT NULL,            -- user_id or special platform UUIDs
    entry_type VARCHAR(6) NOT NULL CHECK (entry_type IN ('debit', 'credit')),
    amount_paise BIGINT NOT NULL CHECK (amount_paise > 0),
    category VARCHAR(64) NOT NULL,       -- 'ESCROW_HOLD', 'PLATFORM_FEE', 'TDS_WITHHOLDING', 'PAYOUT'
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ledger_transaction_id ON ledger_entries(transaction_id);
CREATE INDEX IF NOT EXISTS idx_ledger_account_id ON ledger_entries(account_id);
CREATE INDEX IF NOT EXISTS idx_ledger_created_at ON ledger_entries(created_at DESC);

-- 5. Buyer-Seller Dispute Resolution Desk Tables
CREATE TABLE IF NOT EXISTS disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID UNIQUE NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
    buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    reason VARCHAR(128) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'open' CHECK (status IN (
        'open',
        'under_review',
        'resolved_refunded',
        'resolved_released'
    )),
    resolution_notes TEXT,
    resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_disputes_status ON disputes(status);
CREATE INDEX IF NOT EXISTS idx_disputes_seller_id ON disputes(seller_id);
CREATE INDEX IF NOT EXISTS idx_disputes_buyer_id ON disputes(buyer_id);

CREATE TABLE IF NOT EXISTS dispute_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dispute_id UUID NOT NULL REFERENCES disputes(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    message TEXT NOT NULL,
    attachment_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dispute_messages_dispute_id ON dispute_messages(dispute_id);

-- 6. Payment Webhook Idempotency Table
CREATE TABLE IF NOT EXISTS webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider VARCHAR(32) NOT NULL, -- 'razorpay', 'stripe'
    event_id VARCHAR(255) NOT NULL,
    event_type VARCHAR(64) NOT NULL,
    payload JSONB NOT NULL,
    is_processed BOOLEAN NOT NULL DEFAULT FALSE,
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(provider, event_id)
);

CREATE INDEX IF NOT EXISTS idx_webhook_events_lookup ON webhook_events(provider, event_id);
