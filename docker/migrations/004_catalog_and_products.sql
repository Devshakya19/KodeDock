-- =============================================================================
-- KODEDOCK MIGRATION 004: CATEGORIES, PRODUCTS, VERSIONS & S3 FILE ASSETS
-- All prices stored as BIGINT (Integer Paise)
-- =============================================================================

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  long_description TEXT,
  price_paise BIGINT NOT NULL CHECK (price_paise >= 0),
  original_price_paise BIGINT CHECK (original_price_paise IS NULL OR original_price_paise >= 0),
  tags TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'archived', 'limited')),
  stock_limit INTEGER,
  github_repo_url TEXT,
  github_repo_id BIGINT,
  preview_url TEXT,
  image_url TEXT, -- SeaweedFS public media URL / S3 key
  demo_url TEXT,
  tech_stack TEXT[] DEFAULT '{}',
  sales_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0.00,
  review_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product versions & Releases (Source code archives in SeaweedFS Vault)
CREATE TABLE IF NOT EXISTS product_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  version VARCHAR(32) NOT NULL, -- Semantic version e.g. '1.0.0'
  changelog TEXT,
  s3_bucket VARCHAR(64) NOT NULL DEFAULT 'kodedock-vault',
  s3_key TEXT NOT NULL, -- SeaweedFS S3 object path (e.g. 'vault/products/{id}/v1.0.0.zip')
  file_size_bytes BIGINT NOT NULL,
  sha256_checksum VARCHAR(64) NOT NULL, -- Archive integrity check
  is_current BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, version)
);

-- Product files & media attachments
CREATE TABLE IF NOT EXISTS product_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  s3_bucket VARCHAR(64) NOT NULL DEFAULT 'kodedock-media',
  s3_key TEXT NOT NULL,
  file_size_bytes BIGINT NOT NULL,
  content_type VARCHAR(128) NOT NULL,
  is_preview BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product views tracking (Unique per viewer)
CREATE TABLE IF NOT EXISTS product_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_products_seller ON products (seller_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products (category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products (status);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products (slug);
CREATE INDEX IF NOT EXISTS idx_versions_product ON product_versions (product_id);
