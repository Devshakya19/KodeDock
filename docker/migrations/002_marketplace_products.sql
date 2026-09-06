-- =============================================================
-- Migration 002: Universal Multi-Asset Products & pgvector AI
-- =============================================================

-- 1. Product Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(64) UNIQUE NOT NULL,
    slug VARCHAR(64) UNIQUE NOT NULL,
    description TEXT,
    icon_name VARCHAR(64),
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- 2. Multi-Asset Marketplace Products Table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    summary VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    asset_type VARCHAR(64) NOT NULL CHECK (asset_type IN (
        'code_boilerplate',
        'blender_3d',
        'game_asset',
        'ui_design_kit',
        'docs_book',
        'api_microservice'
    )),
    base_price_paise BIGINT NOT NULL CHECK (base_price_paise >= 0), -- Integer Paise (e.g. 99900 = ₹999.00)
    currency VARCHAR(3) NOT NULL DEFAULT 'INR',
    demo_url TEXT,
    github_repo_url TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'suspended', 'archived')),
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    sales_count INT NOT NULL DEFAULT 0,
    rating_average NUMERIC(3, 2) NOT NULL DEFAULT 0.00,
    review_count INT NOT NULL DEFAULT 0,
    search_embedding vector(1536), -- AI semantic vector for cosine similarity search
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_seller_id ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_asset_type ON products(asset_type);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_products_price ON products(base_price_paise);

-- HNSW Vector Index for Sub-3ms Semantic AI Code Search
CREATE INDEX IF NOT EXISTS idx_products_embedding_hnsw 
ON products 
USING hnsw (search_embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- 3. Product Versions Table (Deliverable Releases & Archives)
CREATE TABLE IF NOT EXISTS product_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    version_number VARCHAR(32) NOT NULL, -- e.g. 'v1.0.0'
    changelog TEXT,
    vault_storage_key TEXT NOT NULL,     -- S3 private encrypted path (ZIP, .blend, .obj)
    file_size_bytes BIGINT NOT NULL,
    sha256_checksum VARCHAR(64) NOT NULL,
    is_clean_security_scan BOOLEAN NOT NULL DEFAULT FALSE,
    security_scan_details JSONB NOT NULL DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(product_id, version_number)
);

CREATE INDEX IF NOT EXISTS idx_product_versions_product_id ON product_versions(product_id);

-- 4. Product Public Assets Table (Thumbnails, 3D Previews, Video Trailers)
CREATE TABLE IF NOT EXISTS product_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    asset_kind VARCHAR(32) NOT NULL CHECK (asset_kind IN (
        'thumbnail_image',
        'screenshot_image',
        'video_trailer',
        'gltf_3d_preview',
        'readme_doc'
    )),
    public_storage_key TEXT NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    mime_type VARCHAR(128) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_assets_product_id ON product_assets(product_id);

-- 5. Product Tags Table
CREATE TABLE IF NOT EXISTS product_tags (
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    tag VARCHAR(32) NOT NULL,
    PRIMARY KEY (product_id, tag)
);

CREATE INDEX IF NOT EXISTS idx_product_tags_tag ON product_tags(tag);

-- 6. Product Reviews Table
CREATE TABLE IF NOT EXISTS product_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(128),
    comment TEXT NOT NULL,
    is_verified_purchase BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(product_id, buyer_id)
);

CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON product_reviews(product_id);
