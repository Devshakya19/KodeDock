import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { server } from "../../src/api/server";
import { pgPool } from "@kodedock/backend";
import { signJwt } from "../../src/auth/JWT/jwt.service";
import { auth } from "../../src/auth/auth";
import { createCookieGetter } from "better-auth/cookies";

/**
 * Integration Test Suite: API Gateway & PostgreSQL Backing Store
 * Tests live endpoints running on API Gateway (http://localhost:4000)
 * Enforces authentication, authorization, and data isolation.
 */

const BASE_URL = process.env.API_TEST_URL || "http://localhost:4000";
const TEST_SECRET = process.env.BETTER_AUTH_SECRET || "kodedock_dev_secret_key_32_characters_long_min!";

const sellerToken = signJwt({
  sub: "usr_test_seller_isolated",
  email: "seller@kodedock.test",
  role: "SELLER",
  name: "Test Seller",
}, TEST_SECRET, 3600);

const buyerToken = signJwt({
  sub: "usr_test_buyer_isolated",
  email: "buyer@kodedock.test",
  role: "BUYER",
  name: "Test Buyer",
}, TEST_SECRET, 3600);

describe("API Gateway & Microservice Route Integration", () => {
  let startedLocalServer = false;

  before(async () => {
    // Seed isolated test users in PostgreSQL for foreign key validity
    try {
      await pgPool.query(`
        INSERT INTO "user" (id, name, email, role, "emailVerified", "createdAt", "updatedAt")
        VALUES 
          ('usr_test_seller_isolated', 'Test Seller', 'seller@kodedock.test', 'SELLER', true, NOW(), NOW()),
          ('usr_test_buyer_isolated', 'Test Buyer', 'buyer@kodedock.test', 'BUYER', true, NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role;
      `);
    } catch (dbErr) {
      console.warn("DB user seed note:", dbErr);
    }

    try {
      const probe = await fetch(`${BASE_URL}/api/health`);
      if (probe.ok) return;
    } catch {
      // Server not running, spin up instance
    }

    await new Promise<void>((resolve) => {
      server.listen(4000, () => {
        startedLocalServer = true;
        resolve();
      });
    });
  });

  after(async () => {
    if (startedLocalServer) {
      server.close();
    }
  });

  it("GET /api/health - verifies server health and uptime", async () => {
    const res = await fetch(`${BASE_URL}/api/health`);
    assert.strictEqual(res.status, 200);

    const body = (await res.json()) as any;
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.status, "healthy");
    assert.strictEqual(typeof body.data.uptime, "number");
    assert.strictEqual(body.data.uptime >= 0, true);
  });

  it("GET /api/products - verifies marketplace product catalog from PostgreSQL", async () => {
    const res = await fetch(`${BASE_URL}/api/products`);
    assert.strictEqual(res.status, 200);

    const body = (await res.json()) as any;
    assert.strictEqual(body.success, true);
    assert.strictEqual(Array.isArray(body.data), true);
  });

  it("SECURITY: enforces 401 Unauthorized when accessing Studio without credentials", async () => {
    const res = await fetch(`${BASE_URL}/api/studio/stats`);
    assert.strictEqual(res.status, 401);

    const body = (await res.json()) as any;
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.error.code, "UNAUTHORIZED");
  });

  it("SECURITY: enforces 401 Unauthorized when accessing Portal without credentials", async () => {
    const res = await fetch(`${BASE_URL}/api/portal/licenses`);
    assert.strictEqual(res.status, 401);

    const body = (await res.json()) as any;
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.error.code, "UNAUTHORIZED");
  });

  it("GET /api/studio/stats - verifies creator studio revenue aggregations with seller session", async () => {
    const res = await fetch(`${BASE_URL}/api/studio/stats`, {
      headers: { Authorization: `Bearer ${sellerToken}` },
    });
    assert.strictEqual(res.status, 200);

    const body = (await res.json()) as any;
    assert.strictEqual(body.success, true);
    assert.strictEqual(typeof body.data.totalRevenuePaise, "number");
    assert.strictEqual(typeof body.data.totalSalesCount, "number");
    assert.strictEqual(typeof body.data.activeListingsCount, "number");
    assert.strictEqual(typeof body.data.formattedRevenue, "string");
  });

  it("GET /api/studio/products - verifies creator product listings and active versions", async () => {
    const res = await fetch(`${BASE_URL}/api/studio/products`, {
      headers: { Authorization: `Bearer ${sellerToken}` },
    });
    assert.strictEqual(res.status, 200);

    const body = (await res.json()) as any;
    assert.strictEqual(body.success, true);
    assert.strictEqual(Array.isArray(body.data), true);
  });

  it("GET /api/studio/settings - verifies studio configuration suite", async () => {
    const res = await fetch(`${BASE_URL}/api/studio/settings`, {
      headers: { Authorization: `Bearer ${sellerToken}` },
    });
    assert.strictEqual(res.status, 200);

    const body = (await res.json()) as any;
    assert.strictEqual(body.success, true);
    assert.strictEqual(typeof body.data.profile, "object");
    assert.strictEqual(typeof body.data.licensing, "object");
    assert.strictEqual(typeof body.data.payouts, "object");
    assert.strictEqual(typeof body.data.tax, "object");
  });

  it("GET /api/studio/api-keys - verifies creator deployment keys endpoint", async () => {
    const res = await fetch(`${BASE_URL}/api/studio/api-keys`, {
      headers: { Authorization: `Bearer ${sellerToken}` },
    });
    assert.strictEqual(res.status, 200);

    const body = (await res.json()) as any;
    assert.strictEqual(body.success, true);
    assert.strictEqual(Array.isArray(body.data), true);
  });

  it("GET /api/portal/licenses - verifies buyer developer license vault", async () => {
    const res = await fetch(`${BASE_URL}/api/portal/licenses`, {
      headers: { Authorization: `Bearer ${buyerToken}` },
    });
    assert.strictEqual(res.status, 200);

    const body = (await res.json()) as any;
    assert.strictEqual(body.success, true);
    assert.strictEqual(Array.isArray(body.data), true);
  });

  it("GET /api/portal/profile - verifies buyer developer profile and cryptographic fingerprint", async () => {
    const res = await fetch(`${BASE_URL}/api/portal/profile`, {
      headers: { Authorization: `Bearer ${buyerToken}` },
    });
    assert.strictEqual(res.status, 200);

    const body = (await res.json()) as any;
    assert.strictEqual(body.success, true);
    assert.strictEqual(typeof body.data.cryptographicFingerprint, "string");
    assert.strictEqual(body.data.cryptographicFingerprint.length, 64);
  });

  it("GET /api/portal/tokens - verifies buyer API access tokens", async () => {
    const res = await fetch(`${BASE_URL}/api/portal/tokens`, {
      headers: { Authorization: `Bearer ${buyerToken}` },
    });
    assert.strictEqual(res.status, 200);

    const body = (await res.json()) as any;
    assert.strictEqual(body.success, true);
    assert.strictEqual(Array.isArray(body.data), true);
  });

  it("GET /api/portal/settings - verifies buyer developer settings persistence", async () => {
    const res = await fetch(`${BASE_URL}/api/portal/settings`, {
      headers: { Authorization: `Bearer ${buyerToken}` },
    });
    assert.strictEqual(res.status, 200);

    const body = (await res.json()) as any;
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
    const body = (await res.json()) as any;
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.error.message.includes("Missing required fields"), true);
  });

  it("SECURITY RBAC: enforces 403 Forbidden when BUYER tries to access Creator Studio", async () => {
    const res = await fetch(`${BASE_URL}/api/studio/stats`, {
      headers: { Authorization: `Bearer ${buyerToken}` },
    });
    assert.strictEqual(res.status, 403);

    const body = (await res.json()) as any;
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.error.code, "FORBIDDEN");
  });

  it("AUTH ORIGIN: accepts trusted origin http://localhost:3000 without INVALID_ORIGIN error", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/sign-in/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
      },
      body: JSON.stringify({ email: "nonexistent@kodedock.test", password: "Password123!" }),
    });

    // Better Auth must NOT reject with 403 INVALID_ORIGIN; it must process the request and return 401
    assert.strictEqual(res.status, 401);
    const body = (await res.json()) as any;
    assert.notStrictEqual(body.code, "INVALID_ORIGIN");
  });

  it("RBAC ROLE SWITCH: POST /api/me/role allows switching role and rejects unauthorized roles", async () => {
    // 1. Valid upgrade to SELLER
    const res = await fetch(`${BASE_URL}/api/me/role`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${buyerToken}`,
      },
      body: JSON.stringify({ role: "SELLER" }),
    });
    assert.strictEqual(res.status, 200);

    const body = (await res.json()) as any;
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.role, "SELLER");

    // 2. Reject self-assignment of ADMIN role
    const adminRes = await fetch(`${BASE_URL}/api/me/role`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${buyerToken}`,
      },
      body: JSON.stringify({ role: "ADMIN" }),
    });
    assert.strictEqual(adminRes.status, 400);

    // 3. Reset back to BUYER
    await fetch(`${BASE_URL}/api/me/role`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${buyerToken}`,
      },
      body: JSON.stringify({ role: "BUYER" }),
    });
  });

  it("COOKIE BRANDING: Better Auth uses kodedock prefix for all session cookies", () => {
    // 1. Verify advanced cookiePrefix option is set to kodedock
    assert.strictEqual(auth.options.advanced?.cookiePrefix, "kodedock");

    // 2. Verify getter returns kodedock.session_token instead of better-auth.session_token
    const getCookies = createCookieGetter(auth.options);
    const sessionCookie = getCookies("session_token");
    assert.strictEqual(sessionCookie.name, "kodedock.session_token");
  });

  it("STORAGE & COOKIE AUTH: verifies API gateway validates kodedock.session_token cookie", async () => {
    const testCookieToken = "kodedock_test_session_token_live_verify_123";
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Seed session record into real PostgreSQL database
    await pgPool.query(
      `INSERT INTO session (id, token, "expiresAt", "userId", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       ON CONFLICT (id) DO UPDATE SET token = EXCLUDED.token, "expiresAt" = EXCLUDED."expiresAt"`,
      ["sess_kodedock_cookie_verify", testCookieToken, expiresAt, "usr_test_seller_isolated"]
    );

    // Call /api/me with Cookie: kodedock.session_token=...
    const res = await fetch(`${BASE_URL}/api/me`, {
      headers: {
        Cookie: `kodedock.session_token=${testCookieToken}`,
      },
    });

    assert.strictEqual(res.status, 200);
    const body = (await res.json()) as any;
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.user.id, "usr_test_seller_isolated");
    assert.strictEqual(body.data.user.role, "SELLER");

    // Clean up test session
    await pgPool.query(`DELETE FROM session WHERE id = $1`, ["sess_kodedock_cookie_verify"]);
  });
});
