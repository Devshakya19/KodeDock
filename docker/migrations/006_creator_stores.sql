-- =============================================================
-- Migration 006: Creator Stores & Dedicated Vendor Shops
-- =============================================================

-- 1. Creator Stores Profile Table
CREATE TABLE IF NOT EXISTS creator_stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    store_handle VARCHAR(64) UNIQUE NOT NULL, -- e.g. 'rohan-dev'
    store_name VARCHAR(128) NOT NULL,
    tagline VARCHAR(255),
    about_markdown TEXT,
    banner_storage_key TEXT,
    logo_storage_key TEXT,
    social_links JSONB NOT NULL DEFAULT '{}'::JSONB, -- { "github": "...", "twitter": "...", "website": "..." }
    featured_product_ids JSONB NOT NULL DEFAULT '[]'::JSONB,
    total_sales_count INT NOT NULL DEFAULT 0,
    store_rating NUMERIC(3, 2) NOT NULL DEFAULT 0.00,
    is_verified_creator BOOLEAN NOT NULL DEFAULT FALSE,
    custom_domain VARCHAR(255) UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for instant (< 0.5ms) store lookups by handle
CREATE INDEX IF NOT EXISTS idx_creator_stores_handle ON creator_stores(store_handle);
CREATE INDEX IF NOT EXISTS idx_creator_stores_seller_id ON creator_stores(seller_id);
