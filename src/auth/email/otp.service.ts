import crypto from "node:crypto";
import type Database from "better-sqlite3";

/**
 * Kodedock Email OTP & Passwordless Magic Code Service
 * For passwordless developer logins, email verification, and password resets.
 * 100% self-hosted & in our control.
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
 * Initializes email_otps table in the self-hosted database
 */
export function ensureOtpsTable(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS email_otps (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      otpHash TEXT NOT NULL,
      purpose TEXT NOT NULL,
      attempts INTEGER DEFAULT 0,
      expiresAt TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_email_otps_lookup ON email_otps(email, purpose);
  `);
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
 * Creates and stores an OTP for a given email address
 */
export function createEmailOtp(
  db: Database.Database,
  email: string,
  purpose: OtpPurpose = "LOGIN"
): { otp: string; expiresAt: Date } {
  ensureOtpsTable(db);

  // Invalidate any existing OTPs for this email and purpose
  db.prepare(`DELETE FROM email_otps WHERE email = ? AND purpose = ?`).run(email, purpose);

  const otp = generateNumericOtp();
  const otpHash = hashOtp(otp);
  const id = crypto.randomUUID();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + OTP_EXPIRATION_MINUTES * 60 * 1000);

  db.prepare(`
    INSERT INTO email_otps (id, email, otpHash, purpose, attempts, expiresAt, createdAt)
    VALUES (?, ?, ?, ?, 0, ?, ?)
  `).run(id, email, otpHash, purpose, expiresAt.toISOString(), now.toISOString());

  return { otp, expiresAt };
}

/**
 * Verifies an OTP code for a given email address
 */
export function verifyEmailOtp(
  db: Database.Database,
  email: string,
  otp: string,
  purpose: OtpPurpose = "LOGIN"
): { isValid: boolean; error?: string } {
  ensureOtpsTable(db);

  const record = db
    .prepare(`SELECT * FROM email_otps WHERE email = ? AND purpose = ?`)
    .get(email, purpose) as OtpRecord | undefined;

  if (!record) {
    return { isValid: false, error: "No active verification code found for this email." };
  }

  // Check expiration
  if (new Date(record.expiresAt).getTime() < Date.now()) {
    db.prepare(`DELETE FROM email_otps WHERE id = ?`).run(record.id);
    return { isValid: false, error: "Verification code has expired. Please request a new one." };
  }

  // Check attempt limit
  if (record.attempts >= MAX_VERIFICATION_ATTEMPTS) {
    db.prepare(`DELETE FROM email_otps WHERE id = ?`).run(record.id);
    return { isValid: false, error: "Too many failed attempts. Code has been invalidated." };
  }

  const expectedHash = hashOtp(otp.trim());
  const hashBufferA = Buffer.from(record.otpHash);
  const hashBufferB = Buffer.from(expectedHash);

  const isMatch =
    hashBufferA.length === hashBufferB.length &&
    crypto.timingSafeEqual(hashBufferA, hashBufferB);

  if (!isMatch) {
    // Increment failed attempts
    db.prepare(`UPDATE email_otps SET attempts = attempts + 1 WHERE id = ?`).run(record.id);
    const remaining = MAX_VERIFICATION_ATTEMPTS - (record.attempts + 1);
    return {
      isValid: false,
      error: `Invalid verification code. ${remaining} attempt(s) remaining.`,
    };
  }

  // Code is verified, delete it to prevent reuse
  db.prepare(`DELETE FROM email_otps WHERE id = ?`).run(record.id);
  return { isValid: true };
}
