import { describe, it } from "node:test";
import assert from "node:assert/strict";

/**
 * E2E Test Suite: Full Platform Cross-Cutting Workflows
 * Tests end-to-end interactions across:
 * 1. Personal Access Tokens issuance and revocation
 * 2. User settings persistence and domain allowlisting
 * 3. GDPR/Compliance Data Export verification
 * 4. Error boundaries & 404 handler integrity
 */

const BASE_URL = process.env.API_TEST_URL || "http://localhost:4000";

describe("E2E: Full Platform Cross-Cutting Security & Workflows", () => {
  let createdPatId: string = "";

  it("Step 1: Creates and masks a Buyer Personal Access Token", async () => {
    const res = await fetch(`${BASE_URL}/api/portal/tokens`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "CI/CD Test Access Token",
        expiryDays: 60,
        scopes: ["read:library", "download:assets"],
      }),
    });

    assert.strictEqual(res.status, 201);
    const body = await res.json() as any;
    assert.strictEqual(body.success, true);
    assert.strictEqual(typeof body.data.fullToken, "string");
    assert.strictEqual(body.data.fullToken.startsWith("kd_pat_live_"), true);
    assert.strictEqual(body.data.tokenMasked.startsWith("kd_pat_live_"), true);
    assert.strictEqual(body.data.tokenMasked.includes("••••••••"), true);

    createdPatId = body.data.id;
  });

  it("Step 2: Updates user settings and configures production domain allowlist", async () => {
    const patchPayload = {
      domainAllowlist: ["staging.kodedock.internal", "app.production.io"],
      notificationRules: {
        "new-release": true,
        "security-patch": true,
        "download-ready": true,
        "payment-confirm": true,
        "license-expiry": true,
        "newsletter": false,
      },
    };

    const res = await fetch(`${BASE_URL}/api/portal/settings`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patchPayload),
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json() as any;
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.domainAllowlist.length, 2);
    assert.strictEqual(body.data.domainAllowlist.includes("staging.kodedock.internal"), true);
    assert.strictEqual(body.data.domainAllowlist.includes("app.production.io"), true);
  });

  it("Step 3: Exports complete buyer developer account data package", async () => {
    const res = await fetch(`${BASE_URL}/api/portal/export-data`);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.headers.get("content-type"), "application/json");

    const body = await res.json() as any;
    assert.strictEqual(typeof body.exportedAt, "string");
    assert.strictEqual(Array.isArray(body.orders), true);
    assert.strictEqual(Array.isArray(body.licenses), true);
    assert.strictEqual(Array.isArray(body.apiKeys), true);
  });

  it("Step 4: Revokes the personal access token cleanly", async () => {
    assert.notStrictEqual(createdPatId, "");

    const res = await fetch(`${BASE_URL}/api/portal/tokens?id=${encodeURIComponent(createdPatId)}`, {
      method: "DELETE",
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json() as any;
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.revokedId, createdPatId);
  });

  it("Step 5: Verifies standard JSON 404 response for non-existent routes", async () => {
    const res = await fetch(`${BASE_URL}/api/non-existent-endpoint-12345`);
    assert.strictEqual(res.status, 404);

    const body = await res.json() as any;
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.error.code, "NOT_FOUND");
  });
});
