import crypto from "node:crypto";
import type Database from "better-sqlite3";

/**
 * Kodedock Session Security Service
 * Direct, self-hosted session creation, validation, and multi-device revocation.
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
 * Creates and stores a new session in the self-hosted database
 */
export function createSession(
  db: Database.Database,
  userId: string,
  ipAddress?: string | null,
  userAgent?: string | null,
  durationDays: number = DEFAULT_SESSION_DURATION_DAYS
): SessionRecord {
  const token = generateSessionToken();
  const id = crypto.randomUUID();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

  const stmt = db.prepare(`
    INSERT INTO session (id, userId, token, expiresAt, ipAddress, userAgent, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id,
    userId,
    token,
    expiresAt.toISOString(),
    ipAddress || null,
    userAgent || null,
    now.toISOString()
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
 * Validates a session token against the self-hosted database
 */
export function validateSessionToken(
  db: Database.Database,
  token: string
): { isValid: boolean; session?: SessionRecord; error?: string } {
  const stmt = db.prepare(`
    SELECT id, userId, token, expiresAt, ipAddress, userAgent, createdAt
    FROM session
    WHERE token = ?
  `);

  const session = stmt.get(token) as SessionRecord | undefined;
  if (!session) {
    return { isValid: false, error: "Session token not found." };
  }

  const expiresDate = new Date(session.expiresAt);
  if (Date.now() > expiresDate.getTime()) {
    // Session has expired, remove it
    db.prepare("DELETE FROM session WHERE token = ?").run(token);
    return { isValid: false, error: "Session has expired." };
  }

  return { isValid: true, session };
}

/**
 * Revokes a single session by token (Logout)
 */
export function revokeSession(db: Database.Database, token: string): boolean {
  const stmt = db.prepare("DELETE FROM session WHERE token = ?");
  const result = stmt.run(token);
  return result.changes > 0;
}

/**
 * Revokes all sessions for a user (Logout from all devices)
 */
export function revokeAllUserSessions(db: Database.Database, userId: string): number {
  const stmt = db.prepare("DELETE FROM session WHERE userId = ?");
  const result = stmt.run(userId);
  return result.changes;
}

/**
 * Cleanup expired sessions from the database
 */
export function purgeExpiredSessions(db: Database.Database): number {
  const nowIso = new Date().toISOString();
  const stmt = db.prepare("DELETE FROM session WHERE expiresAt < ?");
  const result = stmt.run(nowIso);
  return result.changes;
}
