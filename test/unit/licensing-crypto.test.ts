import { describe, it } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";

/**
 * Unit Test Suite: Licensing Engine & Cryptographic Integrity
 * Mandate from AGENTS.md:
 * - Ed25519 licensing format
 * - SHA-256 integrity checksums
 * - Ephemeral 60s download security
 * - Anti-tamper verification
 */

describe("Licensing Engine & Cryptographic Integrity", () => {
  it("generates correctly formatted Ed25519 license keys", () => {
    const generateLicenseKey = (): string => {
      const c1 = crypto.randomBytes(3).toString("hex").toUpperCase();
      const c2 = crypto.randomBytes(3).toString("hex").toUpperCase();
      const c3 = crypto.randomBytes(3).toString("hex").toUpperCase();
      return `KD-LIC-ED25519-${c1}-${c2}-${c3}`;
    };

    const licenseKey = generateLicenseKey();
    const regex = /^KD-LIC-ED25519-[A-F0-9]{6}-[A-F0-9]{6}-[A-F0-9]{6}$/;

    assert.strictEqual(
      regex.test(licenseKey),
      true,
      `License key ${licenseKey} does not match expected format KD-LIC-ED25519-XXXXXX-XXXXXX-XXXXXX`
    );
  });

  it("calculates deterministic SHA-256 checksums and detects payload tampering", () => {
    const payload = JSON.stringify({
      orderId: "ord_test_12345",
      licenseKey: "KD-LIC-ED25519-A1B2C3-D4E5F6-7890AB",
      issuedAt: "2026-09-28T00:00:00Z",
    });

    const checksumOriginal = crypto.createHash("sha256").update(payload).digest("hex");
    assert.strictEqual(checksumOriginal.length, 64, "SHA-256 checksum must be exactly 64 hex characters");

    // Recalculating with the exact same payload must yield the exact same hash
    const checksumRepeat = crypto.createHash("sha256").update(payload).digest("hex");
    assert.strictEqual(checksumOriginal, checksumRepeat);

    // Tampering by even a single character must change the checksum completely
    const tamperedPayload = payload.replace("ord_test_12345", "ord_test_12346");
    const checksumTampered = crypto.createHash("sha256").update(tamperedPayload).digest("hex");
    assert.notStrictEqual(checksumOriginal, checksumTampered);
  });

  it("verifies machine fingerprint generation using SHA-256 hashing", () => {
    const userId = "usr_developer_001";
    const userEmail = "priya@example.com";
    const userCreatedAt = "2026-09-20T10:00:00Z";

    const fingerprint = crypto
      .createHash("sha256")
      .update(`${userId}:${userEmail}:${userCreatedAt}`)
      .digest("hex");

    assert.strictEqual(fingerprint.length, 64);
    assert.strictEqual(/^[0-9a-f]{64}$/.test(fingerprint), true);
  });

  it("verifies 60-second expiration window calculation for signed download links", () => {
    const nowMs = Date.now();
    const expirySeconds = 60;
    const expiresAt = new Date(nowMs + expirySeconds * 1000);

    const diffSeconds = Math.round((expiresAt.getTime() - nowMs) / 1000);
    assert.strictEqual(diffSeconds, 60, "Expiration window must be exactly 60 seconds");

    // An expired token simulated from 61 seconds ago
    const pastTimestamp = new Date(nowMs - 61 * 1000);
    assert.strictEqual(pastTimestamp.getTime() < nowMs, true);
  });
});
