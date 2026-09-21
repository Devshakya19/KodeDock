# KODEDOCK - AGENTS & ENGINEERING INSTRUCTIONS

This document establishes the **strict, non-negotiable engineering laws and behavioral constraints** for all AI agents, contributors, and automated subagents working on the **Kodedock** codebase.

---

## 1. CORE MANDATE: ZERO MOCK DATA & 100% REAL DATABASE

> [!CAUTION]
> **ABSOLUTELY ZERO MOCK DATA, ZERO PLACEHOLDERS, ZERO HARDCODED DATA.**
> Under NO circumstances should any agent write dummy mock arrays, fake test fixtures, or hardcoded dummy objects in production components, pages, or backend routes. Failure to follow this rule is an immediate violation of project standards.

### Strict Engineering Rules:

1. **NO Mock Data (`mockProducts`, `dummyUsers`, `fakeOrders`)**:
   - Do NOT create mock arrays, hardcoded product lists, fake reviews, or dummy JSON files to simulate backend responses.
   - Every single piece of data displayed on any frontend (`apps/store`, `apps/studio`, `apps/portal`, `apps/www`) MUST come from real API endpoints connected to the real PostgreSQL database.

2. **NO Placeholders or Dummy Text**:
   - Do NOT use "Lorem ipsum dolor sit amet", "John Doe", "Test Product 1", or placeholder images (`via.placeholder.com`).
   - If an empty state occurs when no items exist in the database, render a production-grade empty state UI (e.g. *"No templates found in this category yet. Be the first to list one!"* with an action button leading to `apps/studio`).

3. **NO Hardcoded Statistics or Metrics**:
   - Numbers such as sales count, revenue figures, ratings, buyer counts, and pricing MUST be computed dynamically via SQL aggregations (`COUNT(*)`, `SUM(amount)`, `AVG(rating)`) from real database tables (`orders`, `products`, `seller_payouts`).

4. **100% Real PostgreSQL Database-Driven**:
   - **PostgreSQL** is the standard, primary database for Kodedock.
   - Every read and write operation MUST go through real PostgreSQL tables using parameterized, injection-safe SQL queries.
   - All migrations, schemas, and relational constraints (`FOREIGN KEY`, `ON DELETE CASCADE`, `UNIQUE`) must be properly maintained.

5. **NO Temporary / "Tested" Toy Code**:
   - Do NOT write temporary bypasses, pseudo-code, commented-out dummy implementations, or fake auth tokens.
   - Every authentication, payment, download, and license verification flow must be fully functional, secure, and production-ready.

---

## 2. Architectural Responsibilities

| Directory | Scope & Role | Allowed Technologies |
| :--- | :--- | :--- |
| **`src/`** | **Core Backend Domain & Business Logic** | Better Auth, PostgreSQL (`pg` / Drizzle), JWT, Scrypt, Licensing engine, Storage (R2). **All real database models reside here.** |
| **`api/`** | **Secure API Gateway Layer** | Node.js HTTP gateway, Better Auth routing, input validation (Zod), rate limiting, RBAC middlewares. Exposes REST/JSON endpoints. |
| **`apps/www`** | **Marketing & Central Auth Hub** | Public landing page, features showcase, central login & registration flows. |
| **`apps/store`** | **Public Marketplace App** | Real-time product search, filtering, product details, checkout flow. **All products fetched from `/api/products`.** |
| **`apps/studio`** | **Creator & Seller Dashboard** | Product listing upload, version releases, real sales graphs, payout management. **All data fetched from `/api/studio/*`.** |
| **`apps/portal`** | **Buyer Developer Dashboard** | Real purchased orders, signed 60-second download links, cryptographic license keys. **All data fetched from `/api/portal/*`.** |
| **`packages/`** | **Shared Libraries** | Shared types (`@kodedock/types`), UI design tokens (`@kodedock/ui`), frontend auth client (`@kodedock/auth`). |
| **`docker/`** | **Containerized Infrastructure** | Dockerfile & Docker Compose running PostgreSQL, Redis, and local development stacks. |

---

## 3. Database Standards (PostgreSQL)

1. **Connection**: Managed via connection pooling (`pg.Pool`) configured through `DATABASE_URL`.
2. **Naming Convention**: `snake_case` for columns and tables, `PascalCase` or `UPPER_SNAKE_CASE` for TypeScript enum types.
3. **Financial Precision**: All monetary values are strictly integers stored in **paise (INR)** (e.g. ₹999 is stored as `99900`) to prevent floating-point rounding errors.
4. **Security**: All database queries must use parameterized inputs (`$1, $2, ...`). Zero raw string concatenation.

---

## 4. Design & Typography Rules

- **Theme Palette (60-30-10)**:
  - 60% Canvas: Rich Obsidian (`#090A0F`) in Dark / Porcelain (`#F8F9FC`) in Light.
  - 30% Structure: Deep Graphite Surfaces (`#12131A`), Midnight Borders (`#1F212D`), Cyber Cyan (`#38BDF8`).
  - 10% High-Energy Accent: Electric Purple (`#8B5CF6`) with glowing aura.
- **Typography (Local Fontshare Suite in `assets/fonts/`)**:
  - Headings & Hero: **`Clash Display`**
  - UI, Body & Forms: **`Satoshi`**
  - Code, Terminal & Licenses: **`Azeret Mono`**
