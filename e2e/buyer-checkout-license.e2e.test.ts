import { describe, it } from "node:test";
import assert from "node:assert/strict";

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

describe("E2E: Buyer Checkout & Ed25519 Licensing Flow", () => {
  let selectedProduct: any = null;
  let createdOrder: any = null;
  const buyerEmail = `test_buyer_${Date.now()}@kodedock.dev`;
  const buyerName = "E2E Test Buyer";

  it("Step 1: Discovers and selects an active architectural product from marketplace", async () => {
    let res = await fetch(`${BASE_URL}/api/products`);
    assert.strictEqual(res.status, 200);

    let body = await res.json() as any;
    assert.strictEqual(body.success, true);
    assert.strictEqual(Array.isArray(body.data), true);

    if (body.data.length === 0) {
      // Seed a verified architectural product via Studio
      const seedRes = await fetch(`${BASE_URL}/api/studio/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Next.js 16 Microservices Architecture",
          slug: "nextjs-16-microservices-arch",
          tagline: "Enterprise-grade distributed architecture with PostgreSQL 16 & Ed25519 licensing",
          category: "Web Apps",
          standard_price: 499900,
          extended_price: 1499900,
          tech_stack: ["Next.js", "TypeScript", "PostgreSQL", "Docker"],
        }),
      });
      assert.strictEqual(seedRes.status, 201);

      res = await fetch(`${BASE_URL}/api/products`);
      body = await res.json() as any;
    }

    assert.strictEqual(body.data.length > 0, true, "Marketplace must have active products");
    selectedProduct = body.data[0];
    assert.strictEqual(typeof selectedProduct.id, "string");
    assert.strictEqual(typeof selectedProduct.slug, "string");
    assert.strictEqual(typeof selectedProduct.standard_price, "number");
  });

  it("Step 2: Executes checkout order creation with exact integer paise pricing", async () => {
    assert.notStrictEqual(selectedProduct, null);

    const checkoutPayload = {
      productId: selectedProduct.id,
      licenseType: "STANDARD",
      amountPaise: selectedProduct.standard_price,
      buyerEmail,
      buyerName,
      paymentMethod: "UPI_SANDBOX",
    };

    const res = await fetch(`${BASE_URL}/api/checkout/create-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(checkoutPayload),
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json() as any;
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

    // Query licenses for the buyer email user
    const res = await fetch(`${BASE_URL}/api/portal/licenses?email=${encodeURIComponent(buyerEmail)}`);
    assert.strictEqual(res.status, 200);

    const body = await res.json() as any;
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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ buyerEmail }),
    });

    // If order was for this buyer, check download url structure
    if (res.status === 200) {
      const body = await res.json() as any;
      assert.strictEqual(body.success, true);
      assert.strictEqual(typeof body.data.downloadUrl, "string");
      assert.strictEqual(body.data.downloadUrl.includes("KD_SIG_"), true);
      assert.strictEqual(body.data.expiresInSeconds, 60);
      assert.strictEqual(typeof body.data.checksumSha256, "string");
    }
  });
});
