import crypto from "node:crypto";
import type Database from "better-sqlite3";
import type { UserRole } from "@kodedock/types";

/**
 * Kodedock Developer API Keys & CLI Access Tokens Engine
 * For programmatic access, CLI tool authentication, and API integrations.
 * Formats: kd_live_<random_bytes> or kd_test_<random_bytes>
 * 100% self-hosted & in our control.
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
 * Initializes the api_keys table in the self-hosted database
 */
export function ensureApiKeysTable(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS api_keys (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      keyHash TEXT NOT NULL UNIQUE,
      keyHint TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'BUYER',
      permissions TEXT NOT NULL DEFAULT '[]',
      lastUsedAt TEXT,
      expiresAt TEXT,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(keyHash);
  `);
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
export function createApiKey(
  db: Database.Database,
  userId: string,
  name: string,
  role: UserRole = "BUYER",
  permissions: string[] = ["read:assets", "download:purchased"],
  expiresInDays?: number
): CreatedApiKey {
  ensureApiKeysTable(db);

  const rawBytes = crypto.randomBytes(24).toString("hex");
  const rawKey = `kd_live_${rawBytes}`;
  const keyHash = hashApiKey(rawKey);
  const keyHint = `kd_live_...${rawKey.slice(-4)}`;
  const id = crypto.randomUUID();
  const now = new Date();
  const expiresAt = expiresInDays
    ? new Date(now.getTime() + expiresInDays * 24 * 60 * 60 * 1000).toISOString()
    : null;

  db.prepare(`
    INSERT INTO api_keys (id, userId, keyHash, keyHint, name, role, permissions, expiresAt, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    userId,
    keyHash,
    keyHint,
    name,
    role,
    JSON.stringify(permissions),
    expiresAt,
    now.toISOString()
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
export function validateApiKey(
  db: Database.Database,
  rawKey: string
): { isValid: boolean; record?: ApiKeyRecord; error?: string } {
  ensureApiKeysTable(db);

  if (!rawKey.startsWith("kd_live_") && !rawKey.startsWith("kd_test_")) {
    return { isValid: false, error: "Invalid API key prefix." };
  }

  const keyHash = hashApiKey(rawKey);
  const record = db
    .prepare(`SELECT * FROM api_keys WHERE keyHash = ?`)
    .get(keyHash) as any;

  if (!record) {
    return { isValid: false, error: "API key not found or revoked." };
  }

  // Check expiration
  if (record.expiresAt && new Date(record.expiresAt).getTime() < Date.now()) {
    return { isValid: false, error: "API key has expired." };
  }

  // Update lastUsedAt asynchronously
  db.prepare(`UPDATE api_keys SET lastUsedAt = ? WHERE id = ?`).run(
    new Date().toISOString(),
    record.id
  );

  return {
    isValid: true,
    record: {
      ...record,
      permissions: JSON.parse(record.permissions || "[]"),
    },
  };
}

/**
 * Revokes an API key by ID
 */
export function revokeApiKey(db: Database.Database, keyId: string, userId: string): boolean {
  ensureApiKeysTable(db);
  const result = db.prepare(`DELETE FROM api_keys WHERE id = ? AND userId = ?`).run(keyId, userId);
  return result.changes > 0;
}

/**
 * Lists all active API keys for a developer (hiding the raw key, showing hints)
 */
export function listUserApiKeys(db: Database.Database, userId: string): ApiKeyRecord[] {
  ensureApiKeysTable(db);
  const rows = db.prepare(`SELECT * FROM api_keys WHERE userId = ? ORDER BY createdAt DESC`).all(userId) as any[];
  return rows.map((r) => ({
    ...r,
    permissions: JSON.parse(r.permissions || "[]"),
  }));
}
