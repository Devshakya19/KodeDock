-- =============================================================
-- Migration 005: S3 Storage Tickets, DRM Licensing & Dynamic Configs
-- =============================================================

-- 1. S3 Direct Multipart Upload Tickets Table
CREATE TABLE IF NOT EXISTS storage_upload_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    mime_type VARCHAR(128) NOT NULL,
    s3_bucket VARCHAR(128) NOT NULL,
    s3_key TEXT NOT NULL,
    upload_id VARCHAR(255), -- S3 Multipart Upload ID
    status VARCHAR(32) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired')),
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_upload_tickets_user_id ON storage_upload_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_upload_tickets_status ON storage_upload_tickets(status);

-- 2. Ed25519 Cryptographic Software Licenses Table
CREATE TABLE IF NOT EXISTS license_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    license_key VARCHAR(255) UNIQUE NOT NULL, -- Base58 / Armored string
    license_tier VARCHAR(32) NOT NULL CHECK (license_tier IN ('standard', 'extended', 'full_ownership')),
    signature_ed25519 TEXT NOT NULL,
    is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
    revoked_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_license_keys_key ON license_keys(license_key);
CREATE INDEX IF NOT EXISTS idx_license_keys_buyer_id ON license_keys(buyer_id);
CREATE INDEX IF NOT EXISTS idx_license_keys_product_id ON license_keys(product_id);

-- 3. Dynamic Platform Configuration Table (Admin HQ Fee & Rule Adjuster)
CREATE TABLE IF NOT EXISTS platform_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_key VARCHAR(64) UNIQUE NOT NULL,
    config_value_int BIGINT NOT NULL,          -- Value in Basis Points (1% = 100 bps) or integer paise
    config_value_str VARCHAR(255),
    description TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_platform_configs_key ON platform_configs(config_key);

-- Seed Initial Default Configs for India Marketplace Launch
INSERT INTO platform_configs (config_key, config_value_int, config_value_str, description) VALUES
('platform_fee_bps', 350, '3.5%', 'Creator-friendly platform commission in basis points (350 = 3.5%)'),
('tds_rate_bps', 100, '1.0%', 'Indian Section 194-O statutory TDS rate (100 = 1.0%)'),
('gateway_fee_bps', 200, '2.0%', 'Estimated Razorpay/Bank payment gateway cost (200 = 2.0%)'),
('gst_rate_bps', 1800, '18.0%', 'Indian GST rate for digital content services (1800 = 18.0%)'),
('escrow_hold_days', 7, '7 Days', 'Default escrow holding duration before automatic release to seller'),
('min_payout_threshold_paise', 50000, '₹500.00', 'Minimum wallet balance required to request a bank payout (50000 Paise = ₹500.00)')
ON CONFLICT (config_key) DO NOTHING;
