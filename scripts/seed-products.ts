/**
 * Real PostgreSQL Database Schema Initializer
 * Ensures all production tables, columns, indexes, and constraints exist.
 * STRICT ZERO MOCK DATA: No dummy products or hardcoded data inserted.
 */
import { initPostgresSchema, pgPool } from "../src/db";

async function main() {
  console.log("[PostgreSQL] Initializing production tables & schema...");
  await initPostgresSchema();
  console.log("[PostgreSQL] Database schema is ready. Zero mock data initialized.");
  await pgPool.end();
}

main().catch((err) => {
  console.error("Schema initialization failed:", err);
  process.exit(1);
});
