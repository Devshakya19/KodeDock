import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  validatePasswordStrength,
  hashPassword,
  verifyPassword,
} from "../../src/auth/passwords/password.service";
import {
  signJwt,
  verifyJwt,
  decodeJwt,
} from "../../src/auth/JWT/jwt.service";
import { hashApiKey } from "../../src/auth/keys/apiKey.service";

/**
 * Unit Test Suite: Authentication, Passwords, JWT & Security Primitives
 */

describe("Authentication & Security Engine Primitives", () => {
  describe("Password Policy & Scrypt Hashing", () => {
    it("enforces strong password complexity requirements", () => {
      // Too short (< 8)
      assert.strictEqual(validatePasswordStrength("Pass1").isValid, false);
      // No uppercase
      assert.strictEqual(validatePasswordStrength("password123").isValid, false);
      // No number
      assert.strictEqual(validatePasswordStrength("PasswordOnly").isValid, false);
      // Valid strong password
      assert.strictEqual(validatePasswordStrength("KodeDock2026!").isValid, true);
    });

    it("hashes password with salt using Scrypt and verifies successfully", async () => {
      const plainPassword = "SuperSecurePassword123";
      const hashedPassword = await hashPassword(plainPassword);

      assert.strictEqual(typeof hashedPassword, "string");
      assert.strictEqual(hashedPassword.includes(":"), true, "Hash format must be <salt>:<derivedKey>");

      // Verify correct password matches
      const isMatch = await verifyPassword(plainPassword, hashedPassword);
      assert.strictEqual(isMatch, true, "Valid password must verify as true");

      // Verify incorrect password fails
      const isWrongMatch = await verifyPassword("WrongPassword123", hashedPassword);
      assert.strictEqual(isWrongMatch, false, "Invalid password must verify as false");
    });
  });

  describe("Custom JWT Signing & Verification", () => {
    const testSecret = "kodedock_test_secret_key_that_is_at_least_32_chars!";

    it("signs and verifies an HMAC-SHA256 JWT token with valid claims", () => {
      const payload = {
        sub: "usr_priya_123",
        email: "priya@kodedock.com",
        role: "SELLER" as const,
        name: "Priya Developer",
      };

      const token = signJwt(payload, testSecret, 3600);
      assert.strictEqual(typeof token, "string");
      assert.strictEqual(token.split(".").length, 3, "JWT must contain header, payload, and signature");

      const verification = verifyJwt(token, testSecret);
      assert.strictEqual(verification.isValid, true);
      assert.strictEqual(verification.payload?.sub, "usr_priya_123");
      assert.strictEqual(verification.payload?.email, "priya@kodedock.com");
      assert.strictEqual(verification.payload?.role, "SELLER");
    });

    it("rejects JWT token when tampered or signed with invalid secret", () => {
      const payload = {
        sub: "usr_priya_123",
        email: "priya@kodedock.com",
        role: "BUYER" as const,
      };

      const token = signJwt(payload, testSecret, 3600);

      // Verify with wrong secret
      const wrongSecretResult = verifyJwt(token, "different_secret_key_32_characters_minimum!");
      assert.strictEqual(wrongSecretResult.isValid, false);
      assert.strictEqual(wrongSecretResult.error?.includes("Invalid cryptographic JWT signature"), true);

      // Verify with tampered payload
      const parts = token.split(".");
      const tamperedToken = `${parts[0]}.${parts[1]}tampered.${parts[2]}`;
      const tamperedResult = verifyJwt(tamperedToken, testSecret);
      assert.strictEqual(tamperedResult.isValid, false);
    });

    it("rejects expired JWT tokens", () => {
      const payload = {
        sub: "usr_priya_123",
        email: "priya@kodedock.com",
        role: "BUYER" as const,
      };

      // Create token with negative expiry (-10 seconds)
      const expiredToken = signJwt(payload, testSecret, -10);
      const result = verifyJwt(expiredToken, testSecret);

      assert.strictEqual(result.isValid, false);
      assert.strictEqual(result.error?.includes("expired"), true);
    });

    it("decodes token payload without signature verification", () => {
      const payload = {
        sub: "usr_inspector_007",
        email: "inspector@kodedock.com",
        role: "ADMIN" as const,
      };

      const token = signJwt(payload, testSecret, 3600);
      const decoded = decodeJwt(token);

      assert.notStrictEqual(decoded, null);
      assert.strictEqual(decoded?.sub, "usr_inspector_007");
      assert.strictEqual(decoded?.email, "inspector@kodedock.com");
    });
  });

  describe("API Keys & Hashing", () => {
    it("hashes raw API key with SHA-256 for secure database lookup", () => {
      const rawKey = "kd_live_abcdef1234567890abcdef12";
      const hash1 = hashApiKey(rawKey);
      const hash2 = hashApiKey(rawKey);

      assert.strictEqual(hash1, hash2, "API key hashing must be deterministic");
      assert.strictEqual(hash1.length, 64, "SHA-256 hash must be 64 hex characters");
    });
  });
});
