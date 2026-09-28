import { describe, it } from "node:test";
import assert from "node:assert/strict";

/**
 * Integration Test Suite: API Gateway & PostgreSQL Backing Store
 * Tests live endpoints running on API Gateway (http://localhost:4000)
 */

const BASE_URL = process.env.API_TEST_URL || "http://localhost:4000";

describe("API Gateway & Microservice Route Integration", () => {
  it("GET /api/health - verifies server health and uptime", async () => {
    const res = await fetch(`${BASE_URL}/api/health`);
    assert.strictEqual(res.status, 200);

    const body = await res.json() as any;
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.status, "healthy");
    assert.strictEqual(typeof body.data.uptime, "number");
    assert.strictEqual(body.data.uptime >= 0, true);
  });

  it("GET /api/products - verifies marketplace product catalog from PostgreSQL", async () => {
    const res = await fetch(`${BASE_URL}/api/products`);
    assert.strictEqual(res.status, 200);

    const body = await res.json() as any;
    assert.strictEqual(body.success, true);
    assert.strictEqual(Array.isArray(body.data), true);
  });

  it("GET /api/studio/stats - verifies creator studio revenue aggregations", async () => {
    const res = await fetch(`${BASE_URL}/api/studio/stats`);
    assert.strictEqual(res.status, 200);

    const body = await res.json() as any;
    assert.strictEqual(body.success, true);
    assert.strictEqual(typeof body.data.totalRevenuePaise, "number");
    assert.strictEqual(typeof body.data.totalSalesCount, "number");
    assert.strictEqual(typeof body.data.activeListingsCount, "number");
    assert.strictEqual(typeof body.data.formattedRevenue, "string");
  });

  it("GET /api/studio/products - verifies creator product listings and active versions", async () => {
    const res = await fetch(`${BASE_URL}/api/studio/products`);
    assert.strictEqual(res.status, 200);

    const body = await res.json() as any;
    assert.strictEqual(body.success, true);
    assert.strictEqual(Array.isArray(body.data), true);
  });

  it("GET /api/studio/settings - verifies studio configuration suite", async () => {
    const res = await fetch(`${BASE_URL}/api/studio/settings`);
    assert.strictEqual(res.status, 200);

    const body = await res.json() as any;
    assert.strictEqual(body.success, true);
    assert.strictEqual(typeof body.data.profile, "object");
    assert.strictEqual(typeof body.data.licensing, "object");
    assert.strictEqual(typeof body.data.payouts, "object");
    assert.strictEqual(typeof body.data.tax, "object");
  });

  it("GET /api/studio/api-keys - verifies creator deployment keys endpoint", async () => {
    const res = await fetch(`${BASE_URL}/api/studio/api-keys`);
    assert.strictEqual(res.status, 200);

    const body = await res.json() as any;
    assert.strictEqual(body.success, true);
    assert.strictEqual(Array.isArray(body.data), true);
  });

  it("GET /api/portal/licenses - verifies buyer developer license vault", async () => {
    const res = await fetch(`${BASE_URL}/api/portal/licenses`);
    assert.strictEqual(res.status, 200);

    const body = await res.json() as any;
    assert.strictEqual(body.success, true);
    assert.strictEqual(Array.isArray(body.data), true);
  });

  it("GET /api/portal/profile - verifies buyer developer profile and cryptographic fingerprint", async () => {
    const res = await fetch(`${BASE_URL}/api/portal/profile`);
    assert.strictEqual(res.status, 200);

    const body = await res.json() as any;
    assert.strictEqual(body.success, true);
    assert.strictEqual(typeof body.data.cryptographicFingerprint, "string");
    assert.strictEqual(body.data.cryptographicFingerprint.length, 64);
  });

  it("GET /api/portal/tokens - verifies buyer API access tokens", async () => {
    const res = await fetch(`${BASE_URL}/api/portal/tokens`);
    assert.strictEqual(res.status, 200);

    const body = await res.json() as any;
    assert.strictEqual(body.success, true);
    assert.strictEqual(Array.isArray(body.data), true);
  });

  it("GET /api/portal/settings - verifies buyer developer settings persistence", async () => {
    const res = await fetch(`${BASE_URL}/api/portal/settings`);
    assert.strictEqual(res.status, 200);

    const body = await res.json() as any;
    assert.strictEqual(body.success, true);
    assert.strictEqual(typeof body.data.notificationRules, "object");
    assert.strictEqual(Array.isArray(body.data.domainAllowlist), true);
  });

  it("POST /api/checkout/create-order - validates rejection when required fields are missing", async () => {
    const res = await fetch(`${BASE_URL}/api/checkout/create-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    assert.strictEqual(res.status, 400);
    const body = await res.json() as any;
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.error.message.includes("Missing required fields"), true);
  });
});
