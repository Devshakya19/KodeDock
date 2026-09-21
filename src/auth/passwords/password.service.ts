import crypto from "node:crypto";

/**
 * Kodedock Password Security Service
 * Implements Scrypt cryptographic hashing with timing-safe comparison.
 * Fully visible and customizable logic.
 */

const SCRYPT_KEYLEN = 64;
const SALT_BYTES = 16;

export interface PasswordValidationResult {
  isValid: boolean;
  message?: string;
}

/**
 * Validates password strength rules for Kodedock accounts
 */
export function validatePasswordStrength(password: string): PasswordValidationResult {
  if (!password || password.length < 8) {
    return {
      isValid: false,
      message: "Password must be at least 8 characters long.",
    };
  }
  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one uppercase letter.",
    };
  }
  if (!/[0-9]/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one number.",
    };
  }
  return { isValid: true };
}

/**
 * Hashes a plaintext password using Scrypt with a secure random salt
 * Format: <salt-hex>:<hash-hex>
 */
export async function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(SALT_BYTES).toString("hex");
    crypto.scrypt(password, salt, SCRYPT_KEYLEN, (err, derivedKey) => {
      if (err) return reject(err);
      resolve(`${salt}:${derivedKey.toString("hex")}`);
    });
  });
}

/**
 * Verifies a plaintext password against a stored Scrypt hash using timingSafeEqual
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const parts = storedHash.split(":");
    if (parts.length !== 2) {
      return resolve(false);
    }
    const [salt, key] = parts;
    const keyBuffer = Buffer.from(key, "hex");

    crypto.scrypt(password, salt, SCRYPT_KEYLEN, (err, derivedKey) => {
      if (err) return reject(err);
      try {
        const isMatch = crypto.timingSafeEqual(keyBuffer, derivedKey);
        resolve(isMatch);
      } catch {
        resolve(false);
      }
    });
  });
}
