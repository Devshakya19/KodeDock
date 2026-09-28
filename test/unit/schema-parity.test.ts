import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

/**
 * Unit Test Suite: Database Schema Parity & Relational Constraints
 * Mandate from AGENTS.md:
 * - Exact DDL schema parity between docker/schema.sql and src/db/schema.sql
 * - All core PostgreSQL tables must exist (users, products, orders, licenses, seller_payouts)
 * - Foreign keys, indexes, and cascades must be present.
 */

describe("Database Schema Parity & DDL Relational Verification", () => {
  const rootDir = path.resolve(__dirname, "../..");
  const dockerSchemaPath = path.join(rootDir, "docker/schema.sql");
  const srcSchemaPath = path.join(rootDir, "src/db/schema.sql");

  it("verifies exact byte-for-byte parity between docker/schema.sql and src/db/schema.sql", () => {
    assert.strictEqual(fs.existsSync(dockerSchemaPath), true, "docker/schema.sql must exist");
    assert.strictEqual(fs.existsSync(srcSchemaPath), true, "src/db/schema.sql must exist");

    const dockerSql = fs.readFileSync(dockerSchemaPath, "utf-8").replace(/\r\n/g, "\n");
    const srcSql = fs.readFileSync(srcSchemaPath, "utf-8").replace(/\r\n/g, "\n");

    assert.strictEqual(
      dockerSql,
      srcSql,
      "Schema drift detected! docker/schema.sql and src/db/schema.sql must be identical"
    );
  });

  it("verifies all mandatory production PostgreSQL tables are declared in DDL", () => {
    const schemaSql = fs.readFileSync(dockerSchemaPath, "utf-8");

    const expectedTables = [
      'CREATE TABLE IF NOT EXISTS "user"',
      'CREATE TABLE IF NOT EXISTS session',
      'CREATE TABLE IF NOT EXISTS account',
      'CREATE TABLE IF NOT EXISTS products',
      'CREATE TABLE IF NOT EXISTS product_versions',
      'CREATE TABLE IF NOT EXISTS orders',
      'CREATE TABLE IF NOT EXISTS licenses',
      'CREATE TABLE IF NOT EXISTS seller_payouts',
      'CREATE TABLE IF NOT EXISTS api_keys',
    ];

    for (const tableDdl of expectedTables) {
      assert.strictEqual(
        schemaSql.includes(tableDdl),
        true,
        `DDL schema must contain table definition: ${tableDdl}`
      );
    }
  });

  it("verifies foreign key constraints and cascade rules are properly defined", () => {
    const schemaSql = fs.readFileSync(dockerSchemaPath, "utf-8");

    // Orders references products and buyer
    assert.strictEqual(schemaSql.includes("REFERENCES products(id)"), true);
    assert.strictEqual(schemaSql.includes('REFERENCES "user"(id)'), true);

    // Licenses references orders and products
    assert.strictEqual(schemaSql.includes("REFERENCES orders(id)"), true);

    // Cascades on sessions and accounts
    assert.strictEqual(schemaSql.includes("ON DELETE CASCADE"), true);
  });

  it("verifies monetary columns are integers for paise storage", () => {
    const schemaSql = fs.readFileSync(dockerSchemaPath, "utf-8");

    // standard_price, extended_price, amount in orders and seller_payouts should be INTEGER / BIGINT
    assert.strictEqual(schemaSql.includes("standard_price INTEGER"), true);
    assert.strictEqual(schemaSql.includes("amount INTEGER"), true);
  });
});
