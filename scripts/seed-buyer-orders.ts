/**
 * Real PostgreSQL Database Order Vault Initializer
 * Ensures orders and licenses table structures exist without inserting mock data.
 * STRICT ZERO MOCK DATA: No dummy orders or hardcoded data inserted.
 */
import { initPostgresSchema, pgPool } from "../src/db";

async function main() {
  console.log("[PostgreSQL] Checking order vault schema...");
  await initPostgresSchema();
  console.log("[PostgreSQL] Order vault schema is ready. Zero mock data initialized.");
  await pgPool.end();
}

main().catch((err) => {
  console.error("Order vault check failed:", err);
  process.exit(1);
});
