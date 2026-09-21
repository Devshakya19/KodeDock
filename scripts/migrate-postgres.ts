/**
 * PostgreSQL Database Migration & Schema Initializer
 * Connects to the real PostgreSQL container and verifies all 100% real tables.
 */

import { initPostgresSchema, query, checkPostgresHealth } from "../src/db";

async function main() {
  console.log("=================================================");
  console.log("    KODEDOCK REAL POSTGRESQL SCHEMA MIGRATION   ");
  console.log("=================================================\n");

  console.log("[1/3] Checking PostgreSQL connection health...");
  const isHealthy = await checkPostgresHealth();
  if (!isHealthy) {
    throw new Error("Cannot connect to PostgreSQL at localhost:5432. Make sure container is running (pnpm db:up).");
  }
  console.log("  ✓ PostgreSQL connection is active & healthy.\n");

  console.log("[2/3] Migrating all real database tables (Zero Mock)...");
  await initPostgresSchema();
  console.log("  ✓ All production tables, indexes, and constraints created.\n");

  console.log("[3/3] Inspecting created tables from information_schema...");
  const res = await query<{ table_name: string }>(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name ASC;
  `);

  console.log("  ✓ Real PostgreSQL Tables present in database:");
  for (const row of res.rows) {
    console.log(`    • ${row.table_name}`);
  }

  console.log("\n=================================================");
  console.log("  REAL POSTGRESQL DATABASE IS READY & CONFIGURED!");
  console.log("=================================================\n");
  process.exit(0);
}

main().catch((err) => {
  console.error("\n❌ PostgreSQL migration failed:", err);
  process.exit(1);
});
