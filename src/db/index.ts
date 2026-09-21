import pg from "pg";
import dotenv from "dotenv";
import path from "node:path";
import fs from "node:fs";

// Ensure environment variables are loaded
const possibleEnvPaths = [
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), "../.env"),
  path.resolve(__dirname, "../../.env"),
];
for (const envPath of possibleEnvPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  }
}

const { Pool } = pg;

export const DEFAULT_POSTGRES_URL =
  process.env.DATABASE_URL || "postgresql://postgres:postgrespassword@localhost:5432/kodedock";

/**
 * PostgreSQL Connection Pool
 * Thread-safe, production-ready connection pooling with automatic reconnection
 */
export const pgPool = new Pool({
  connectionString: DEFAULT_POSTGRES_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

/**
 * Executes a parameterized SQL query safely against PostgreSQL
 */
export async function query<T extends pg.QueryResultRow = any>(
  text: string,
  params: any[] = []
): Promise<pg.QueryResult<T>> {
  const start = Date.now();
  const res = await pgPool.query<T>(text, params);
  const duration = Date.now() - start;
  if (process.env.DEBUG_SQL === "true") {
    console.log(`[SQL] executed in ${duration}ms: ${text}`);
  }
  return res;
}

/**
 * Checks if PostgreSQL connection is alive and healthy
 */
export async function checkPostgresHealth(): Promise<boolean> {
  try {
    const client = await pgPool.connect();
    await client.query("SELECT 1");
    client.release();
    return true;
  } catch {
    return false;
  }
}

/**
 * Initializes the full PostgreSQL schema for Kodedock
 * Creates all production tables, indexes, and relational constraints.
 * 100% Real Database Schema (Zero Mock / Zero BaaS).
 */
export async function initPostgresSchema(): Promise<void> {
  const client = await pgPool.connect();
  try {
    await client.query("BEGIN");

    // 1. Better Auth Tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS "user" (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        "emailVerified" BOOLEAN DEFAULT FALSE,
        image TEXT,
        role VARCHAR(50) DEFAULT 'BUYER',
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS session (
        id VARCHAR(64) PRIMARY KEY,
        "userId" VARCHAR(64) NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
        token TEXT UNIQUE NOT NULL,
        "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
        "ipAddress" VARCHAR(45),
        "userAgent" TEXT,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS verification (
        id VARCHAR(64) PRIMARY KEY,
        identifier TEXT NOT NULL,
        value TEXT NOT NULL,
        "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS jwks (
        id VARCHAR(64) PRIMARY KEY,
        "publicKey" TEXT NOT NULL,
        "privateKey" TEXT NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // 2. Kodedock Marketplace Core Tables
    await client.query(`
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
        standard_price INTEGER NOT NULL, -- in paise (e.g. 99900 = ₹999)
        extended_price INTEGER,          -- optional extended license in paise
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

      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(64) PRIMARY KEY,
        buyer_id VARCHAR(64) NOT NULL REFERENCES "user"(id) ON DELETE RESTRICT,
        product_id VARCHAR(64) NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
        license_type VARCHAR(50) NOT NULL,
        amount INTEGER NOT NULL, -- in paise
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
        amount INTEGER NOT NULL, -- in paise (95% to creator)
        platform_fee INTEGER NOT NULL, -- 5% total in paise
        status VARCHAR(50) DEFAULT 'PENDING',
        payout_account TEXT NOT NULL,
        processed_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

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
    `);

    await client.query("COMMIT");
    console.log("[PostgreSQL] Complete Kodedock schema initialized successfully.");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
