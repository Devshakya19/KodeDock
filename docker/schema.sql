-- ============================================================================
-- KODEDOCK MARKETPLACE & AUTHENTICATION — POSTGRESQL 16 DDL SCHEMA
-- 100% Real Database Schema (Zero Mock Data / Zero Hardcoded Rows)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. BETTER AUTH & USER IDENTITY TABLES
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS "user" (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  "emailVerified" BOOLEAN NOT NULL DEFAULT FALSE,
  image TEXT,
  role VARCHAR(50) DEFAULT 'BUYER',
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS session (
  id VARCHAR(64) PRIMARY KEY,
  "userId" VARCHAR(64) NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
  "ipAddress" VARCHAR(45),
  "userAgent" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS account (
  id VARCHAR(64) PRIMARY KEY,
  "userId" VARCHAR(64) NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  "accountId" TEXT NOT NULL,
  "providerId" VARCHAR(50) NOT NULL,
  "accessToken" TEXT,
  "refreshToken" TEXT,
  "expiresAt" TIMESTAMP WITH TIME ZONE,
  password TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS verification (
  id VARCHAR(64) PRIMARY KEY,
  identifier TEXT NOT NULL,
  value TEXT NOT NULL,
  "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS jwks (
  id VARCHAR(64) PRIMARY KEY,
  "publicKey" TEXT NOT NULL,
  "privateKey" TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 2. KODEDOCK MARKETPLACE PRODUCTS & VERSIONS
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(64) PRIMARY KEY,
  seller_id VARCHAR(64) NOT NULL REFERENCES "user"(id) ON DELETE RESTRICT,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  tagline VARCHAR(300) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  tech_stack JSONB NOT NULL DEFAULT '[]',
  live_demo_url TEXT,
  thumbnail_url TEXT NOT NULL,
  preview_images JSONB NOT NULL DEFAULT '[]',
  status VARCHAR(50) DEFAULT 'DRAFT',
  standard_price INTEGER NOT NULL, -- Stored in paise (e.g., 99900 = ₹999)
  extended_price INTEGER,          -- Optional extended commercial license in paise
  total_sales INTEGER DEFAULT 0,
  avg_rating NUMERIC(3, 2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);

CREATE TABLE IF NOT EXISTS product_versions (
  id VARCHAR(64) PRIMARY KEY,
  product_id VARCHAR(64) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  version VARCHAR(50) NOT NULL,
  changelog TEXT,
  storage_key TEXT NOT NULL,
  checksum_sha256 VARCHAR(64) NOT NULL,
  file_size_bytes BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 3. ORDERS, CRYPTOGRAPHIC LICENSES & SELLER PAYOUTS
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(64) PRIMARY KEY,
  buyer_id VARCHAR(64) NOT NULL REFERENCES "user"(id) ON DELETE RESTRICT,
  product_id VARCHAR(64) NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  license_type VARCHAR(50) NOT NULL,
  amount INTEGER NOT NULL, -- Stored in paise
  currency VARCHAR(10) DEFAULT 'INR',
  payment_status VARCHAR(50) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  transaction_id VARCHAR(255) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_buyer ON orders(buyer_id);

CREATE TABLE IF NOT EXISTS licenses (
  id VARCHAR(64) PRIMARY KEY,
  order_id VARCHAR(64) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  buyer_id VARCHAR(64) NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  product_id VARCHAR(64) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  license_key VARCHAR(128) UNIQUE NOT NULL,
  status VARCHAR(50) DEFAULT 'ACTIVE',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_licenses_key ON licenses(license_key);

CREATE TABLE IF NOT EXISTS seller_payouts (
  id VARCHAR(64) PRIMARY KEY,
  seller_id VARCHAR(64) NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- 95% creator payout in paise
  platform_fee INTEGER NOT NULL, -- 5% platform fee in paise
  status VARCHAR(50) DEFAULT 'PENDING',
  payout_account TEXT NOT NULL,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 4. API KEYS & OTP VERIFICATION
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS api_keys (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  key_hash VARCHAR(128) UNIQUE NOT NULL,
  key_hint VARCHAR(64) NOT NULL,
  name VARCHAR(128) NOT NULL,
  role VARCHAR(50) DEFAULT 'BUYER',
  permissions JSONB DEFAULT '[]',
  expires_at TIMESTAMP WITH TIME ZONE,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash);

CREATE TABLE IF NOT EXISTS email_otps (
  id VARCHAR(64) PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  otp_hash VARCHAR(128) NOT NULL,
  purpose VARCHAR(50) NOT NULL,
  attempts INTEGER DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_otps_lookup ON email_otps(email, purpose);

-- ----------------------------------------------------------------------------
-- 5. USER SETTINGS & PREFERENCES (Persisted PostgreSQL user options)
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS user_settings (
  user_id VARCHAR(64) PRIMARY KEY REFERENCES "user"(id) ON DELETE CASCADE,
  gstin VARCHAR(50),
  pan VARCHAR(50),
  billing_address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  notification_rules JSONB DEFAULT '{"new-release": true, "security-patch": true, "download-ready": true, "payment-confirm": true, "license-expiry": true, "newsletter": false}'::jsonb,
  domain_allowlist JSONB DEFAULT '[]'::jsonb,
  public_profile BOOLEAN DEFAULT TRUE,
  purchase_history_public BOOLEAN DEFAULT FALSE,
  analytics_sharing BOOLEAN DEFAULT TRUE,
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

