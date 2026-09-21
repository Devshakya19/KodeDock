---
name: strict-database-and-code-quality
description: Mandatory rules enforcing PostgreSQL, zero mock data, zero placeholders, zero hardcoded values, and production-grade real data across Kodedock.
---

# MANDATORY AGENT DIRECTIVE: 100% REAL DATA & POSTGRESQL

## 1. ABSOLUTE PROHIBITION OF MOCK / DUMMY DATA
- **NO Mock Data**: You MUST NEVER create mock arrays, dummy JSON objects, or hardcoded test arrays in frontend components, pages, or backend routes.
- **NO Placeholders**: Never write placeholder text ("Lorem ipsum", "John Doe", "Test Item") or placeholder images. Use production-grade empty states when a table has zero rows.
- **NO Hardcoded Numbers**: Sales counts, earnings, metrics, ratings, and pricing MUST be queried and aggregated dynamically from real database tables.

## 2. POSTGRESQL DATABASE STANDARD
- **Primary Database Engine**: **PostgreSQL** is the standard database for Kodedock.
- All domain entities (`products`, `product_versions`, `orders`, `licenses`, `seller_payouts`, `users`, `sessions`, `api_keys`, `email_otps`) must be persisted and queried via real PostgreSQL SQL tables.
- All monetary figures must be stored as integers in **paise (INR)** (e.g. ₹999 = `99900`).
- Always use parameterized queries (`$1, $2, ...`) to prevent SQL injection.

## 3. PRODUCTION-GRADE CODE ONLY
- Never write temporary "tested" code, half-baked functions, or mock bypasses in production apps.
- Every endpoint and UI view must be fully wired up to real backend logic and the database.
