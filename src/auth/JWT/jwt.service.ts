import crypto from "node:crypto";
import type { UserRole } from "@kodedock/types";

/**
 * Kodedock Custom JWT Engine
 * Self-contained, cryptographic JSON Web Token signing, verification, and decoding.
 * You have 100% control over claims, expiration, and secret keys.
 */

export interface KodedockJwtPayload {
  sub: string; // User ID
  email: string;
  role: UserRole;
  name?: string;
  iat?: number;
  exp?: number;
  iss?: string;
  [key: string]: unknown;
}

export interface JwtVerificationResult<T = KodedockJwtPayload> {
  isValid: boolean;
  payload?: T;
  error?: string;
}

/**
 * Encodes base64url without padding
 */
function base64UrlEncode(str: string | Buffer): string {
  const buffer = typeof str === "string" ? Buffer.from(str, "utf-8") : str;
  return buffer
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

/**
 * Decodes base64url string to utf-8
 */
function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  return Buffer.from(base64, "base64").toString("utf-8");
}

/**
 * Signs a payload to generate an HMAC-SHA256 JWT Token
 */
export function signJwt(
  payload: KodedockJwtPayload,
  secretKey: string = process.env.BETTER_AUTH_SECRET || "kodedock_dev_secret_key_32_characters_long_min!",
  expiresInSeconds: number = 7 * 24 * 60 * 60 // 7 days default
): string {
  const header = {
    alg: "HS256",
    typ: "JWT",
  };

  const now = Math.floor(Date.now() / 1000);
  const fullPayload: KodedockJwtPayload = {
    ...payload,
    iss: "kodedock.com",
    iat: now,
    exp: now + expiresInSeconds,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
  const dataToSign = `${encodedHeader}.${encodedPayload}`;

  const signature = crypto
    .createHmac("sha256", secretKey)
    .update(dataToSign)
    .digest();

  const encodedSignature = base64UrlEncode(signature);

  return `${dataToSign}.${encodedSignature}`;
}

/**
 * Verifies a JWT token's signature, format, and expiration
 */
export function verifyJwt<T = KodedockJwtPayload>(
  token: string,
  secretKey: string = process.env.BETTER_AUTH_SECRET || "kodedock_dev_secret_key_32_characters_long_min!"
): JwtVerificationResult<T> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return { isValid: false, error: "Malformed JWT token structure." };
    }

    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    const dataToVerify = `${encodedHeader}.${encodedPayload}`;

    // Compute expected signature
    const expectedSignature = base64UrlEncode(
      crypto.createHmac("sha256", secretKey).update(dataToVerify).digest()
    );

    // Timing-safe comparison to prevent timing attacks
    const sigBufferA = Buffer.from(encodedSignature);
    const sigBufferB = Buffer.from(expectedSignature);

    if (sigBufferA.length !== sigBufferB.length || !crypto.timingSafeEqual(sigBufferA, sigBufferB)) {
      return { isValid: false, error: "Invalid cryptographic JWT signature." };
    }

    // Decode and parse payload
    const payloadStr = base64UrlDecode(encodedPayload);
    const payload = JSON.parse(payloadStr) as T & { exp?: number };

    // Check expiration
    if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) {
      return { isValid: false, error: "JWT token has expired." };
    }

    return { isValid: true, payload };
  } catch (err: any) {
    return { isValid: false, error: err.message || "Failed to verify JWT." };
  }
}

/**
 * Decodes a JWT token without verifying signature (useful for client-side inspections)
 */
export function decodeJwt<T = KodedockJwtPayload>(token: string): T | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payloadStr = base64UrlDecode(parts[1]);
    return JSON.parse(payloadStr) as T;
  } catch {
    return null;
  }
}
