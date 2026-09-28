import { describe, it } from "node:test";
import assert from "node:assert/strict";

/**
 * E2E Test Suite: Creator Studio Lifecycle
 * Tests the complete seller workflow:
 * 1. Revenue & listing stats aggregation
 * 2. CLI Deployment Key generation, verification, and revocation
 * 3. Studio settings persistence (Licensing & Payout configurations)
 */

const BASE_URL = process.env.API_TEST_URL || "http://localhost:4000";

describe("E2E: Creator Studio Management Lifecycle", () => {
  let createdKeyId: string = "";

  it("Step 1: Queries dynamic creator stats aggregated from PostgreSQL", async () => {
    const res = await fetch(`${BASE_URL}/api/studio/stats`);
    assert.strictEqual(res.status, 200);

    const body = await res.json() as any;
    assert.strictEqual(body.success, true);
    assert.strictEqual(typeof body.data.totalRevenuePaise, "number");
    assert.strictEqual(typeof body.data.activeListingsCount, "number");
    assert.strictEqual(typeof body.data.formattedRevenue, "string");
  });

  it("Step 2: Generates a new CLI Deployment API key for automated releases", async () => {
    const payload = {
      name: "GitHub Actions CI Deployment Key",
      expiryDays: 30,
      scopes: ["deploy:releases", "read:stats"],
    };

    const res = await fetch(`${BASE_URL}/api/studio/api-keys`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    assert.strictEqual(res.status, 201);
    const body = await res.json() as any;
    assert.strictEqual(body.success, true);

    const keyData = body.data;
    assert.strictEqual(typeof keyData.id, "string");
    assert.strictEqual(typeof keyData.fullToken, "string");
    assert.strictEqual(keyData.fullToken.startsWith("kd_studio_sec_") || keyData.fullToken.startsWith("kd_live_"), true);
    assert.strictEqual(keyData.tokenMasked.startsWith("kd_studio_sec_") || keyData.tokenMasked.startsWith("kd_live_"), true);
    assert.strictEqual(keyData.status, "ACTIVE");

    createdKeyId = keyData.id;
  });

  it("Step 3: Confirms the new API key appears in the creator key vault", async () => {
    assert.notStrictEqual(createdKeyId, "");

    const res = await fetch(`${BASE_URL}/api/studio/api-keys`);
    assert.strictEqual(res.status, 200);

    const body = await res.json() as any;
    assert.strictEqual(body.success, true);
    assert.strictEqual(Array.isArray(body.data), true);

    const found = body.data.find((k: any) => k.id === createdKeyId);
    assert.notStrictEqual(found, undefined, "Created API key must exist in key vault");
    assert.strictEqual(found.name, "GitHub Actions CI Deployment Key");
  });

  it("Step 4: Updates and persists creator studio settings in PostgreSQL", async () => {
    const updatedSettings = {
      payouts: {
        payout_channel: "UPI",
        upi_id: "creator@upi",
        payout_threshold_inr: 5000,
        revenue_split_percent: 95,
      },
      licensing: {
        algorithm: "Ed25519",
        default_standard_price_paise: 499900,
        default_extended_price_paise: 1499900,
        default_allowed_domains: 1,
        default_machine_seats: 3,
      },
    };

    const res = await fetch(`${BASE_URL}/api/studio/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedSettings),
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json() as any;
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.payouts.payout_channel, "UPI");
    assert.strictEqual(body.data.licensing.algorithm, "Ed25519");
  });

  it("Step 5: Revokes the created CLI deployment key securely", async () => {
    assert.notStrictEqual(createdKeyId, "");

    const res = await fetch(`${BASE_URL}/api/studio/api-keys?id=${encodeURIComponent(createdKeyId)}`, {
      method: "DELETE",
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json() as any;
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.revokedId, createdKeyId);

    // Verify key is no longer in the active list
    const listRes = await fetch(`${BASE_URL}/api/studio/api-keys`);
    const listBody = await listRes.json() as any;
    const found = listBody.data.find((k: any) => k.id === createdKeyId);
    assert.strictEqual(found, undefined, "Revoked key must not be returned in active list");
  });
});
