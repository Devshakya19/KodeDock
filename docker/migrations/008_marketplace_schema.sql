-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tags Table
CREATE TABLE IF NOT EXISTS tags (
    id UUID PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

-- Products Table
-- base_price_paise strictly enforces BIGINT for integer currency math
-- status is ENUM conceptually but stored as VARCHAR for flexibility ('draft', 'published', 'suspended', 'archived')
-- search_embedding uses 384 dimensions for local/free-tier friendly AI search
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY,
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    base_price_paise BIGINT NOT NULL CHECK (base_price_paise >= 0),
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    search_embedding vector(384),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Optimize semantic search using HNSW indexing on cosine distance
CREATE INDEX ON products USING hnsw (search_embedding vector_cosine_ops);

-- Product Tags Many-to-Many
CREATE TABLE IF NOT EXISTS product_tags (
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, tag_id)
);

-- Product Assets (Future-proofing for the Storage Phase)
CREATE TABLE IF NOT EXISTS product_assets (
    id UUID PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    s3_file_key VARCHAR(1024) NOT NULL,
    size_bytes BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
