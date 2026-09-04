-- =============================================================
-- Migration 007: OAuth Accounts & Email Token Support
-- =============================================================

-- 1. OAuth Accounts Table
CREATE TABLE IF NOT EXISTS oauth_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(32) NOT NULL, -- 'github', 'google'
    provider_user_id VARCHAR(255) NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure a user can only link one provider type once, and a provider user id is globally unique
CREATE UNIQUE INDEX IF NOT EXISTS idx_oauth_accounts_provider_user ON oauth_accounts(provider, user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_oauth_accounts_provider_user_id ON oauth_accounts(provider, provider_user_id);
CREATE INDEX IF NOT EXISTS idx_oauth_accounts_user_id ON oauth_accounts(user_id);

-- Note: We are strictly adhering to the plan by using Redis for ephemeral 
-- email verification OTPs and password resets to prevent DB bloat.
