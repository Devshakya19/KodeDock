-- =============================================================================
-- KODEDOCK MIGRATION 007: DYNAMIC BASIS-POINT CONFIGS & PLATFORM INTEGRATIONS
-- Rule 9: Commission, TDS, and fees must NEVER be hardcoded
-- =============================================================================

-- Dynamic Platform Configurations (Basis Points & limits)
-- 1 Basis Point (bps) = 0.01%, 100 bps = 1.0%, 250 bps = 2.5%, 1800 bps = 18.0%
CREATE TABLE IF NOT EXISTS platform_configs (
    key VARCHAR(128) PRIMARY KEY,
    value_bps INTEGER, -- Basis points when applicable
    value_json JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES hq_staff(id) ON DELETE SET NULL
);

-- Third-party integrations (API keys stored securely)
CREATE TABLE IF NOT EXISTS platform_integrations (
    provider VARCHAR(100) PRIMARY KEY,
    is_active BOOLEAN DEFAULT FALSE,
    config JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES hq_staff(id) ON DELETE SET NULL
);

-- Payout requests table (Seller withdrawals)
CREATE TABLE IF NOT EXISTS payout_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    payout_account_id UUID NOT NULL REFERENCES seller_payout_accounts(id) ON DELETE CASCADE,
    amount_paise BIGINT NOT NULL CHECK (amount_paise > 0),
    tds_deducted_paise BIGINT NOT NULL DEFAULT 0 CHECK (tds_deducted_paise >= 0),
    net_payout_paise BIGINT NOT NULL CHECK (net_payout_paise > 0),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'processing', 'completed', 'failed')),
    razorpay_payout_id TEXT,
    utr_number TEXT,
    failure_reason TEXT,
    totp_verified BOOLEAN DEFAULT FALSE, -- Required if amount > ₹10,000 (1,000,000 paise)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payout_requests_seller ON payout_requests (seller_id);
CREATE INDEX IF NOT EXISTS idx_payout_requests_status ON payout_requests (status);
