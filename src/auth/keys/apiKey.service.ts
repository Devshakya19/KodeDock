import crypto from "node:crypto";
import type pg from "pg";
import { pgPool } from "../../db";
import type { UserRole } from "@kodedock/types";

/**
 * Kodedock Developer API Keys & CLI Access Tokens Engine
 * For programmatic access, CLI tool authentication, and API integrations.
 * Formats: kd_live_<random_bytes> or kd_test_<random_bytes>
 * 100% self-hosted & PostgreSQL backed.
 */

export interface ApiKeyRecord {
  id: string;
  userId: string;
  keyHash: string;
  keyHint: string; // e.g. "kd_live_...a8f2" (safe to display in UI)
  name: string; // e.g. "CLI Machine Token", "GitHub Actions Key"
  role: UserRole;
  permissions: string[]; // e.g. ["read:products", "download:assets"]
  lastUsedAt?: string | null;
  expiresAt?: string | null;
  createdAt: string;
}

export interface CreatedApiKey {
  id: string;
  rawKey: string; // ONLY returned once upon generation
  keyHint: string;
  name: string;
}

/**
 * Initializes the api_keys table check
 */
export async function ensureApiKeysTable(_db: pg.Pool = pgPool): Promise<void> {
  // Handled in initPostgresSchema()
}

/**
 * Hashes an API key with SHA-256 for secure database lookup
 */
export function hashApiKey(rawKey: string): string {
  return crypto.createHash("sha256").update(rawKey).digest("hex");
}

/**
 * Generates a new cryptographically secure API key for a developer
 */
export async function createApiKey(
  db: pg.Pool = pgPool,
  userId: string,
  name: string,
  role: UserRole = "BUYER",
  permissions: string[] = ["read:assets", "download:purchased"],
  expiresInDays?: number
): Promise<CreatedApiKey> {
  const rawBytes = crypto.randomBytes(24).toString("hex");
  const rawKey = `kd_live_${rawBytes}`;
  const keyHash = hashApiKey(rawKey);
  const keyHint = `kd_live_...${rawKey.slice(-4)}`;
  const id = crypto.randomUUID();
  const now = new Date();
  const expiresAt = expiresInDays
    ? new Date(now.getTime() + expiresInDays * 24 * 60 * 60 * 1000).toISOString()
    : null;

  await db.query(
    `INSERT INTO api_keys (id, user_id, key_hash, key_hint, name, role, permissions, expires_at, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [
      id,
      userId,
      keyHash,
      keyHint,
      name,
      role,
      JSON.stringify(permissions),
      expiresAt,
      now.toISOString(),
    ]
  );

  return {
    id,
    rawKey,
    keyHint,
    name,
  };
}

/**
 * Validates an incoming API key header (e.g. `Authorization: Bearer kd_live_...` or `x-api-key: kd_live_...`)
 */
export async function validateApiKey(
  db: pg.Pool = pgPool,
  rawKey: string
): Promise<{ isValid: boolean; record?: ApiKeyRecord; error?: string }> {
  if (!rawKey.startsWith("kd_live_") && !rawKey.startsWith("kd_test_")) {
    return { isValid: false, error: "Invalid API key prefix." };
  }

  const keyHash = hashApiKey(rawKey);
  const res = await db.query(`SELECT * FROM api_keys WHERE key_hash = $1`, [keyHash]);
  const record = res.rows[0];

  if (!record) {
    return { isValid: false, error: "API key not found or revoked." };
  }

  // Check expiration
  if (record.expires_at && new Date(record.expires_at).getTime() < Date.now()) {
    return { isValid: false, error: "API key has expired." };
  }

  // Update lastUsedAt asynchronously
  await db.query(`UPDATE api_keys SET last_used_at = NOW() WHERE id = $1`, [record.id]);

  const parsedPermissions = Array.isArray(record.permissions)
    ? record.permissions
    : JSON.parse(record.permissions || "[]");

  return {
    isValid: true,
    record: {
      id: record.id,
      userId: record.user_id,
      keyHash: record.key_hash,
      keyHint: record.key_hint,
      name: record.name,
      role: record.role,
      permissions: parsedPermissions,
      lastUsedAt: record.last_used_at,
      expiresAt: record.expires_at,
      createdAt: record.created_at,
    },
  };
}

/**
 * Revokes an API key by ID
 */
export async function revokeApiKey(
  db: pg.Pool = pgPool,
  keyId: string,
  userId: string
): Promise<boolean> {
  const result = await db.query(`DELETE FROM api_keys WHERE id = $1 AND user_id = $2`, [keyId, userId]);
  return (result.rowCount || 0) > 0;
}

/**
 * Lists all active API keys for a developer (hiding the raw key, showing hints)
 */
export async function listUserApiKeys(
  db: pg.Pool = pgPool,
  userId: string
): Promise<ApiKeyRecord[]> {
  const res = await db.query(
    `SELECT id, user_id, key_hash, key_hint, name, role, permissions, last_used_at, expires_at, created_at
     FROM api_keys
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId]
  );

  return res.rows.map((r) => ({
    id: r.id,
    userId: r.user_id,
    keyHash: r.key_hash,
    keyHint: r.key_hint,
    name: r.name,
    role: r.role,
    permissions: Array.isArray(r.permissions) ? r.permissions : JSON.parse(r.permissions || "[]"),
    lastUsedAt: r.last_used_at,
    expiresAt: r.expires_at,
    createdAt: r.created_at,
  }));
}
