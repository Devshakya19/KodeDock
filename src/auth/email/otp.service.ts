import crypto from "node:crypto";
import type pg from "pg";
import { pgPool } from "../../db";

/**
 * Kodedock Email OTP & Passwordless Magic Code Service
 * For passwordless developer logins, email verification, and password resets.
 * 100% self-hosted & PostgreSQL backed.
 */

export type OtpPurpose = "LOGIN" | "VERIFY_EMAIL" | "RESET_PASSWORD";

export interface OtpRecord {
  id: string;
  email: string;
  otpHash: string;
  purpose: OtpPurpose;
  attempts: number;
  expiresAt: string;
  createdAt: string;
}

const OTP_EXPIRATION_MINUTES = 10;
const MAX_VERIFICATION_ATTEMPTS = 5;

/**
 * Initializes email_otps table check
 */
export async function ensureOtpsTable(_db: pg.Pool = pgPool): Promise<void> {
  // Handled in initPostgresSchema()
}

/**
 * Hashes OTP with SHA-256
 */
function hashOtp(otp: string): string {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

/**
 * Generates a cryptographically random 6-digit OTP code
 */
export function generateNumericOtp(): string {
  return String(crypto.randomInt(100000, 999999));
}

/**
 * Creates and stores an OTP for a given email address in PostgreSQL
 */
export async function createEmailOtp(
  db: pg.Pool = pgPool,
  email: string,
  purpose: OtpPurpose = "LOGIN"
): Promise<{ otp: string; expiresAt: Date }> {
  // Invalidate any existing OTPs for this email and purpose
  await db.query(`DELETE FROM email_otps WHERE email = $1 AND purpose = $2`, [email, purpose]);

  const otp = generateNumericOtp();
  const otpHash = hashOtp(otp);
  const id = crypto.randomUUID();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + OTP_EXPIRATION_MINUTES * 60 * 1000);

  await db.query(
    `INSERT INTO email_otps (id, email, otp_hash, purpose, attempts, expires_at, created_at)
     VALUES ($1, $2, $3, $4, 0, $5, $6)`,
    [id, email, otpHash, purpose, expiresAt.toISOString(), now.toISOString()]
  );

  return { otp, expiresAt };
}

/**
 * Verifies an OTP code for a given email address against PostgreSQL
 */
export async function verifyEmailOtp(
  db: pg.Pool = pgPool,
  email: string,
  otp: string,
  purpose: OtpPurpose = "LOGIN"
): Promise<{ isValid: boolean; error?: string }> {
  const res = await db.query(
    `SELECT id, email, otp_hash, purpose, attempts, expires_at, created_at
     FROM email_otps
     WHERE email = $1 AND purpose = $2`,
    [email, purpose]
  );

  const record = res.rows[0];
  if (!record) {
    return { isValid: false, error: "No active verification code found for this email." };
  }

  // Check expiration
  if (new Date(record.expires_at).getTime() < Date.now()) {
    await db.query(`DELETE FROM email_otps WHERE id = $1`, [record.id]);
    return { isValid: false, error: "Verification code has expired. Please request a new one." };
  }

  // Check attempt limit
  if (record.attempts >= MAX_VERIFICATION_ATTEMPTS) {
    await db.query(`DELETE FROM email_otps WHERE id = $1`, [record.id]);
    return { isValid: false, error: "Too many failed attempts. Code has been invalidated." };
  }

  const expectedHash = hashOtp(otp.trim());
  const hashBufferA = Buffer.from(record.otp_hash);
  const hashBufferB = Buffer.from(expectedHash);

  const isMatch =
    hashBufferA.length === hashBufferB.length &&
    crypto.timingSafeEqual(hashBufferA, hashBufferB);

  if (!isMatch) {
    // Increment failed attempts
    await db.query(`UPDATE email_otps SET attempts = attempts + 1 WHERE id = $1`, [record.id]);
    const remaining = MAX_VERIFICATION_ATTEMPTS - (record.attempts + 1);
    return {
      isValid: false,
      error: `Invalid verification code. ${remaining} attempt(s) remaining.`,
    };
  }

  // Code is verified, delete it to prevent reuse
  await db.query(`DELETE FROM email_otps WHERE id = $1`, [record.id]);
  return { isValid: true };
}
