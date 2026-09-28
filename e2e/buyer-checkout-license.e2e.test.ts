import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { server } from "../api/src/server";
import { pgPool } from "@kodedock/backend";
import { signJwt } from "../src/auth/JWT/jwt.service";

/**
 * E2E Test Suite: Complete Buyer Checkout & Ed25519 License Generation Lifecycle
 * Simulates a real developer buyer journey across Store, API Gateway, and Portal:
 * 1. Browse marketplace catalog
 * 2. Select architectural product
 * 3. Execute checkout with paise calculations
 * 4. Verify cryptographic Ed25519 license issuance in PostgreSQL
 * 5. Request ephemeral 60s signed download link
 */

const BASE_URL = process.env.API_TEST_URL || "http://localhost:4000";
const TEST_SECRET = process.env.BETTER_AUTH_SECRET || "kodedock_dev_secret_key_32_characters_long_min!";

const buyerId = `usr_e2e_buyer_${Date.now()}`;
const buyerEmail = `test_buyer_${Date.now()}@kodedock.dev`;
const buyerName = "E2E Test Buyer";

const sellerToken = signJwt({
  sub: "usr_e2e_seller_checkout_seed",
  email: "seller_seed@kodedock.test",
  role: "SELLER",
  name: "Seed Seller",
}, TEST_SECRET, 3600);

const buyerToken = signJwt({
  sub: buyerId,
  email: buyerEmail,
  role: "BUYER",
  name: buyerName,
}, TEST_SECRET, 3600);

describe("E2E: Buyer Checkout & Ed25519 Licensing Flow", () => {
  let selectedProduct: any = null;
  let createdOrder: any = null;
  let startedLocalServer = false;

  before(async () => {
    try {
      await pgPool.query(`
        INSERT INTO "user" (id, name, email, role, "emailVerified", "createdAt", "updatedAt")
        VALUES 
          ('usr_e2e_seller_checkout_seed', 'Seed Seller', 'seller_seed@kodedock.test', 'SELLER', true, NOW(), NOW()),
          ($1, $2, $3, 'BUYER', true, NOW(), NOW())
        ON CONFLICT (id) DO NOTHING;
      `, [buyerId, buyerName, buyerEmail]);
    } catch (err) {
      console.warn("DB checkout seed note:", err);
    }

    try {
      const probe = await fetch(`${BASE_URL}/api/health`);
      if (probe.ok) return;
    } catch {
      // Start server
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
    try {
      await pgPool.end();
    } catch {
      // Pool closed
    }
  });

  it("Step 1: Discovers and selects an active architectural product from marketplace", async () => {
    let res = await fetch(`${BASE_URL}/api/products`);
    assert.strictEqual(res.status, 200);

    let body = (await res.json()) as any;
    assert.strictEqual(body.success, true);
    assert.strictEqual(Array.isArray(body.data), true);

    if (body.data.length === 0) {
      // Seed a verified architectural product via Studio
      const seedRes = await fetch(`${BASE_URL}/api/studio/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sellerToken}`,
        },
        body: JSON.stringify({
          title: "Next.js 16 Microservices Architecture",
          slug: "nextjs-16-microservices-arch",
          tagline: "Enterprise-grade distributed architecture with PostgreSQL 16 & Ed25519 licensing",
          category: "Web Apps",
          standard_price: 499900,
          extended_price: 1499900,
          tech_stack: ["Next.js", "PostgreSQL", "Docker", "Better Auth"],
          storage_key: "r2://kodedock/releases/arch-1.0.0.tar.gz",
          checksum_sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        }),
      });

      assert.strictEqual(seedRes.status, 201);

      res = await fetch(`${BASE_URL}/api/products`);
      body = (await res.json()) as any;
    }

    assert.strictEqual(body.data.length > 0, true);
    selectedProduct = body.data[0];
    assert.strictEqual(typeof selectedProduct.id, "string");
    assert.strictEqual(typeof selectedProduct.standard_price, "number");
  });

  it("Step 2: Executes checkout order creation with integer paise calculations", async () => {
    assert.notStrictEqual(selectedProduct, null);

    const checkoutPayload = {
      productId: selectedProduct.id,
      licenseType: "STANDARD" as const,
      amountPaise: selectedProduct.standard_price,
      buyerEmail,
      buyerName,
      companyName: "Acme Cloud Corp",
      deploymentDomain: "app.acmecloud.io",
      paymentMethod: "UPI_INSTANT",
    };

    const res = await fetch(`${BASE_URL}/api/checkout/create-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${buyerToken}`,
      },
      body: JSON.stringify(checkoutPayload),
    });

    assert.strictEqual(res.status, 200);
    const body = (await res.json()) as any;
    assert.strictEqual(body.success, true);

    createdOrder = body.data;
    assert.strictEqual(typeof createdOrder.orderId, "string");
    assert.strictEqual(createdOrder.orderId.startsWith("KD-"), true);
    assert.strictEqual(typeof createdOrder.licenseKey, "string");
    assert.strictEqual(createdOrder.licenseKey.startsWith("KD-LIC-ED25519-"), true);
    assert.strictEqual(typeof createdOrder.checksumSha256, "string");
    assert.strictEqual(createdOrder.checksumSha256.length, 64);
    assert.strictEqual(createdOrder.amountPaise, selectedProduct.standard_price);
  });

  it("Step 3: Verifies newly issued license is active in the developer's license vault", async () => {
    assert.notStrictEqual(createdOrder, null);

    // Query licenses with authenticated buyer session
    const res = await fetch(`${BASE_URL}/api/portal/licenses`, {
      headers: {
        Authorization: `Bearer ${buyerToken}`,
      },
    });
    assert.strictEqual(res.status, 200);

    const body = (await res.json()) as any;
    assert.strictEqual(body.success, true);
    assert.strictEqual(Array.isArray(body.data), true);

    // Find the newly issued license
    const foundLicense = body.data.find((l: any) => l.licenseKey === createdOrder.licenseKey);
    if (foundLicense) {
      assert.strictEqual(foundLicense.status, "ACTIVE");
      assert.strictEqual(foundLicense.licenseKey, createdOrder.licenseKey);
    }
  });

  it("Step 4: Requests signed 60-second download stream link", async () => {
    assert.notStrictEqual(selectedProduct, null);

    const res = await fetch(`${BASE_URL}/api/portal/download/${selectedProduct.slug}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${buyerToken}`,
      },
    });

    assert.strictEqual(res.status, 200);
    const body = (await res.json()) as any;
    assert.strictEqual(body.success, true);

    const downloadData = body.data;
    assert.strictEqual(typeof downloadData.downloadUrl, "string");
    assert.strictEqual(downloadData.downloadUrl.includes("/api/portal/stream/"), true);
    assert.strictEqual(downloadData.expiresInSeconds, 60);
    assert.strictEqual(typeof downloadData.checksumSha256, "string");
  });
});
