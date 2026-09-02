-- =============================================================================
-- PLATFORM SETTINGS, INTEGRATIONS & PAYOUT REQUESTS
-- =============================================================================

-- Core Platform Settings (Key-Value store for flexibility)
CREATE TABLE IF NOT EXISTS platform_settings (
    key VARCHAR(255) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES hq_staff(id) ON DELETE SET NULL
);

-- Insert default platform settings
INSERT INTO platform_settings (key, value, description) VALUES
('commission_rate', '{"bps": 250}', 'Global platform commission rate in Basis Points (1 bps = 0.01%, 250 = 2.5%)'),
('maintenance_mode', '{"enabled": false, "message": "We are currently undergoing scheduled maintenance."}', 'System maintenance mode toggle'),
('feature_flags', '{"new_checkout": true, "crypto_payments": false}', 'Toggle experimental features'),
('payout_settings', '{"auto_release": false, "min_withdrawal_paise": 50000}', 'Minimum limits and automated release settings')
ON CONFLICT (key) DO NOTHING;

-- Third-party integrations
CREATE TABLE IF NOT EXISTS platform_integrations (
    provider VARCHAR(100) PRIMARY KEY,
    is_active BOOLEAN DEFAULT false,
    config JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

INSERT INTO platform_integrations (provider, is_active, config) VALUES
('razorpay', true, '{"key_id": "", "key_secret": ""}'),
('stripe', false, '{"publishable_key": "", "secret_key": ""}'),
('github', true, '{"client_id": "", "client_secret": ""}'),
('smtp_email', false, '{"host": "", "port": 587, "user": "", "password": ""}')
ON CONFLICT (provider) DO NOTHING;

-- Payout requests table
CREATE TABLE IF NOT EXISTS payout_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    amount_paise INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING',
    payout_method_id UUID REFERENCES seller_payout_accounts(id) ON DELETE SET NULL,
    processed_by UUID REFERENCES hq_staff(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
