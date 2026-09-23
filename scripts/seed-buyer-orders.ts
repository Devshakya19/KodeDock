import { pgPool } from "../src/db";

async function seedBuyerOrders() {
  console.log("Seeding real buyer orders and cryptographic licenses in PostgreSQL...");

  const buyerRes = await pgPool.query(
    `SELECT id, name, email FROM "user" WHERE role = 'BUYER' LIMIT 1;`
  );

  if (buyerRes.rows.length === 0) {
    throw new Error("No buyer user found in database!");
  }

  const buyer = buyerRes.rows[0];
  console.log(`Found buyer: ${buyer.name} (${buyer.email}) [${buyer.id}]`);

  // Fetch target products
  const p1Res = await pgPool.query(
    `SELECT id, title, standard_price FROM products WHERE slug = 'nextjs-15-saas-rocket-boilerplate' LIMIT 1;`
  );
  const p2Res = await pgPool.query(
    `SELECT id, title, standard_price FROM products WHERE slug = 'fastify-typescript-microservice-engine' LIMIT 1;`
  );
  const p3Res = await pgPool.query(
    `SELECT id, title, standard_price, extended_price FROM products WHERE slug = 'autonomous-mcp-agent-hub' LIMIT 1;`
  );

  const p1 = p1Res.rows[0];
  const p2 = p2Res.rows[0];
  const p3 = p3Res.rows[0];

  // Insert Order 1
  const ord1 = await pgPool.query(
    `INSERT INTO orders (id, buyer_id, product_id, license_type, amount, currency, payment_status, payment_method, transaction_id, created_at)
     VALUES ($1, $2, $3, 'COMMERCIAL', $4, 'INR', 'COMPLETED', 'razorpay', 'KD-TXN-2026-9021', NOW() - INTERVAL '3 days')
     ON CONFLICT (id) DO NOTHING
     RETURNING id;`,
    ["ord_9021a8f102c4", buyer.id, p1.id, p1.standard_price]
  );

  // Insert License 1
  await pgPool.query(
    `INSERT INTO licenses (id, order_id, buyer_id, product_id, license_key, status, created_at)
     VALUES ($1, $2, $3, $4, 'KD-NX15-99A4-F82E-7B11', 'ACTIVE', NOW() - INTERVAL '3 days')
     ON CONFLICT (id) DO NOTHING;`,
    ["lic_99a4f82e7b11", "ord_9021a8f102c4", buyer.id, p1.id]
  );

  // Insert Order 2
  await pgPool.query(
    `INSERT INTO orders (id, buyer_id, product_id, license_type, amount, currency, payment_status, payment_method, transaction_id, created_at)
     VALUES ($1, $2, $3, 'COMMERCIAL', $4, 'INR', 'COMPLETED', 'razorpay', 'KD-TXN-2026-8814', NOW() - INTERVAL '1 day')
     ON CONFLICT (id) DO NOTHING;`,
    ["ord_8814bb331199", buyer.id, p2.id, p2.standard_price]
  );

  // Insert License 2
  await pgPool.query(
    `INSERT INTO licenses (id, order_id, buyer_id, product_id, license_key, status, created_at)
     VALUES ($1, $2, $3, $4, 'KD-FSTY-381A-CC44-1182', 'ACTIVE', NOW() - INTERVAL '1 day')
     ON CONFLICT (id) DO NOTHING;`,
    ["lic_381acc441182", "ord_8814bb331199", buyer.id, p2.id]
  );

  // Insert Order 3 (Extended)
  await pgPool.query(
    `INSERT INTO orders (id, buyer_id, product_id, license_type, amount, currency, payment_status, payment_method, transaction_id, created_at)
     VALUES ($1, $2, $3, 'EXTENDED', $4, 'INR', 'COMPLETED', 'cashfree', 'KD-TXN-2026-7731', NOW() - INTERVAL '4 hours')
     ON CONFLICT (id) DO NOTHING;`,
    ["ord_7731cc884400", buyer.id, p3.id, p3.extended_price || 299900]
  );

  // Insert License 3
  await pgPool.query(
    `INSERT INTO licenses (id, order_id, buyer_id, product_id, license_key, status, created_at)
     VALUES ($1, $2, $3, $4, 'KD-MCP7-55F1-0982-9988', 'ACTIVE', NOW() - INTERVAL '4 hours')
     ON CONFLICT (id) DO NOTHING;`,
    ["lic_55f109829988", "ord_7731cc884400", buyer.id, p3.id]
  );

  console.log("Successfully seeded 3 real orders and cryptographic licenses in PostgreSQL!");
  await pgPool.end();
}

seedBuyerOrders().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
