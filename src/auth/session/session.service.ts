import crypto from "node:crypto";
import type pg from "pg";
import { pgPool } from "../../db";

/**
 * Kodedock Session Security Service
 * Direct, self-hosted session creation, validation, and multi-device revocation.
 * 100% Real PostgreSQL database backed.
 */

export interface SessionRecord {
  id: string;
  userId: string;
  token: string;
  expiresAt: string | Date;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string | Date;
}

const DEFAULT_SESSION_DURATION_DAYS = 7;

/**
 * Generates a high-entropy cryptographically secure random session token
 */
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Creates and stores a new session in the self-hosted PostgreSQL database
 */
export async function createSession(
  db: pg.Pool = pgPool,
  userId: string,
  ipAddress?: string | null,
  userAgent?: string | null,
  durationDays: number = DEFAULT_SESSION_DURATION_DAYS
): Promise<SessionRecord> {
  const token = generateSessionToken();
  const id = crypto.randomUUID();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

  await db.query(
    `INSERT INTO session (id, "userId", token, "expiresAt", "ipAddress", "userAgent", "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      id,
      userId,
      token,
      expiresAt.toISOString(),
      ipAddress || null,
      userAgent || null,
      now.toISOString(),
      now.toISOString(),
    ]
  );

  return {
    id,
    userId,
    token,
    expiresAt,
    ipAddress,
    userAgent,
    createdAt: now,
  };
}

/**
 * Validates a session token against the self-hosted PostgreSQL database
 */
export async function validateSessionToken(
  db: pg.Pool = pgPool,
  token: string
): Promise<{ isValid: boolean; session?: SessionRecord; error?: string }> {
  const res = await db.query(
    `SELECT id, "userId", token, "expiresAt", "ipAddress", "userAgent", "createdAt"
     FROM session
     WHERE token = $1`,
    [token]
  );

  const row = res.rows[0];
  if (!row) {
    return { isValid: false, error: "Session token not found." };
  }

  const expiresDate = new Date(row.expiresAt);
  if (Date.now() > expiresDate.getTime()) {
    await db.query(`DELETE FROM session WHERE token = $1`, [token]);
    return { isValid: false, error: "Session has expired." };
  }

  const session: SessionRecord = {
    id: row.id,
    userId: row.userId,
    token: row.token,
    expiresAt: row.expiresAt,
    ipAddress: row.ipAddress,
    userAgent: row.userAgent,
    createdAt: row.createdAt,
  };

  return { isValid: true, session };
}

/**
 * Revokes a single session by token (Logout)
 */
export async function revokeSession(db: pg.Pool = pgPool, token: string): Promise<boolean> {
  const res = await db.query("DELETE FROM session WHERE token = $1", [token]);
  return (res.rowCount || 0) > 0;
}

/**
 * Revokes all sessions for a user (Logout from all devices)
 */
export async function revokeAllUserSessions(db: pg.Pool = pgPool, userId: string): Promise<number> {
  const res = await db.query('DELETE FROM session WHERE "userId" = $1', [userId]);
  return res.rowCount || 0;
}

/**
 * Cleanup expired sessions from the PostgreSQL database
 */
export async function purgeExpiredSessions(db: pg.Pool = pgPool): Promise<number> {
  const res = await db.query('DELETE FROM session WHERE "expiresAt" < NOW()');
  return res.rowCount || 0;
}
