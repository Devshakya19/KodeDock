# KODEDOCK — MASTER ENGINEERING ROADMAP & EXECUTION PLAN

> **Document Status**: Living Architecture Document  
> **Last Updated**: September 27, 2026  
> **Governing Laws**: Strict adherence to [AGENTS.md](file:///home/anonymous/Projects/kodedock/AGENTS.md) — ZERO MOCK DATA, 100% Real PostgreSQL, High-End Obsidian UI/UX, Local Fontshare Typography.

---

## 1. Executive Summary & Vision

**KodeDock** is the next-generation verified software architecture, starter kit, and boilerplate marketplace designed for serious software engineers and teams. Every codebase sold on KodeDock includes:
- Cryptographic **Ed25519** license signatures and machine verification.
- Signed 60-second time-limited download links generated from R2 cloud storage.
- Real developer analytics, versioned releases, and creator payouts (95% creator / 5% platform).

---

## 2. Monorepo Architecture Overview

| Directory | Scope & App Role | Tech Stack | Status |
| :--- | :--- | :--- | :--- |
| **`docker/`** | PostgreSQL 16, Redis, Local Compose Stack | Docker Compose, SQL DDL | **Completed & Validated** |
| **`api/`** | Secure API Gateway & Route Controllers | Node.js HTTP, `pg` connection pool, Better Auth, Zod | **Operational** |
| **`src/`** | Core Backend Domain Logic & Database Models | PostgreSQL, Scrypt, Ed25519 Licensing Engine | **Operational** |
| **`packages/`** | Shared types, design tokens & frontend auth client | TypeScript, `@kodedock/types`, `@kodedock/ui` | **Operational** |
| **`apps/store`** | Public Marketplace Frontend | Next.js 16, Turbopack, Fontshare Typography | **Active Development** |
| **`apps/portal`** | Buyer Developer Dashboard (Licenses, Downloads, Keys) | Next.js 16, Turbopack, PostgreSQL API | **Operational** |
| **`apps/studio`** | Creator & Seller Dashboard (Uploads, Releases, Payouts) | Next.js 16, Turbopack, `/api/studio/*` | **Operational & Validated** |
| **`apps/www`** | Marketing & Central Auth Hub | Next.js 16, Turbopack, Better Auth Gateway | **Planned (Milestone 6)** |

---

## 3. Milestones & Delivery Roadmap

### Milestone 1: CI/CD & DevOps Automation (Completed)
- [x] Matrix pre-commit quality gate (`pnpm run typecheck`, `pnpm run build`).
- [x] Node 22+ LTS standardization for native `node:sqlite` in `pnpm@11.26.0`.
- [x] Gitleaks secret scanning and CodeQL dynamic analysis workflows.
- [x] PostgreSQL 16 schema validation CI pipeline against fresh Docker containers.

### Milestone 2: Marketplace Storefront Core (Completed)
- [x] Real-time catalog view connected to `/api/products` and `/api/categories`.
- [x] Multi-criteria sidebar filters: instant category selection, pricing range, search term.
- [x] Minimalist, high-end "Sort by" dropdown adhering to agency design taste guidelines.
- [x] Local Fontshare Suite font integration (*Clash Display*, *Satoshi*, *Azeret Mono*).
- [x] Product detail pages (`/product/[slug]`) with technical specs, version history, and interactive purchase panel.

### Milestone 3: E-Commerce Experience — Wishlist, Cart & Checkout (Completed)
- [x] Client-side state persistence (`StoreStateProvider`) with `localStorage` sync and cross-page reactivity.
- [x] **Wishlist Page (`/wishlist`)**:
  - Saved codebases list with double-bezel cards.
  - "Move to Cart", "Remove", and bulk actions.
  - Agency-grade empty state with one-click catalog navigation.
- [x] **Cart Page (`/cart`)**:
  - Line items breakdown with real-time license tier toggles (Standard vs Extended).
  - Financial calculations in paise with INR currency formatting.
  - Promo discount validation engine.
  - Sticky order summary card with trust badges.
- [x] **Checkout Flow (`/checkout`)**:
  - Licensee information input (Company / Developer name, email, project domain).
  - Payment method options (UPI, Credit Cards, Developer Sandbox/Instant Activation).
  - Backend order creation endpoint (`POST /api/checkout/create-order`).
  - Cryptographic Ed25519 license key generation and instant link to `apps/portal`.
- [x] Dynamic counter badges on navbar icons (Cart `<ShoppingCart />` and Wishlist `<Heart />`).

### Milestone 4: Developer Radar / Ecosystem Updates (Completed)
- [x] Transition legacy `/news` route into **KodeDock Dev Radar** (`/news`).
- [x] Modernize navigation tab with developer-centric iconography (`<Radio />` / `<Sparkles />`).
- [x] Categorized feed for:
  - *Template Releases* (major version updates, framework upgrades).
  - *Security Advisories* (dependencies, checksum verifications).
  - *Architecture Standards* (PostgreSQL 17, Turbopack, Next.js 16 updates).

### Milestone 5: Creator Studio (`apps/studio`) (Completed)
- [x] Initialize Next.js 16 app at `apps/studio` running on port 3001 with Turbopack.
- [x] Implement Creator Shell with fixed sidebar navigation, breadcrumbs, status indicators, and Lenis smooth scrolling.
- [x] **Creator Command Center Dashboard (`/`)**:
  - Gross sales, 95% net creator earnings, active listings, and copies sold metrics computed from real SQL.
  - Revenue velocity trajectory chart (SVG path visualization).
  - Live recent order feed with license tier badges and customer timestamps.
- [x] **Product Inventory & Management (`/products`)**:
  - Interactive inventory table with search, category filtering, and status badges (Published, Draft, Archived).
  - Direct deep links to version release managers and public storefront listings.
- [x] **4-Step Architecture Publishing Wizard (`/products/new`)**:
  - Step 1: Identity & Architecture Metadata (Name, slug, short description, category, tags).
  - Step 2: Commercial Pricing Engine (Standard license and Extended commercial license in INR paise, live 95% creator split calculation).
  - Step 3: Technical Delivery Asset (R2 Cloudflare bucket storage key, initial semver `v1.0.0`, SHA-256 integrity checksum verification).
  - Step 4: Developer Documentation (Markdown README & setup guide, live demo URL, GitHub repository link).
- [x] **Version Release Manager (`/releases`)**:
  - Dynamic product selector dropdown with automatic URL query sync.
  - Cryptographic artifact registration modal (`version`, `r2_key`, `checksum_sha256`, `changelog`).
  - Release timeline with download links and SHA-256 verification hashes.
- [x] **Monetization & Payouts Engine (`/payouts`)**:
  - Real-time balance ledger: Available balance, pending settlement, lifetime earnings (95/5 platform commission model).
  - Instant UPI ID / NEFT payout request modal with client-side balance validation.
  - Transparent payout audit trail linked to `seller_payouts` table.
- [x] **Creator Traffic & Conversion Radar (`/analytics`)**:
  - 4-tier funnel visualization: Impressions -> Product Views -> Cart Adds -> Purchased.
  - Traffic source distribution breakdown (Marketplace search, direct links, GitHub stars, Twitter/X).
  - Top performing architectures comparison table.
- [x] **Verified Creator Settings (`/settings`)**:
  - Profile identity management (Creator handle, verified badge, bio, website).
  - Webhook notification configuration for sale notifications, release downloads, and payout settlements.
- [x] **Backend API Gateway Controller (`api/src/routes/studio.routes.ts`)**:
  - `GET /api/studio/stats` — aggregated metrics from `orders` and `products`.
  - `GET /api/studio/products` & `POST /api/studio/products` — inventory and creation.
  - `GET /api/studio/releases` & `POST /api/studio/releases` — release artifacts and semver versions.
  - `GET /api/studio/payouts` & `POST /api/studio/payouts/request` — balance calculations and withdrawal requests.
- [x] Integrated `apps/studio` into GitHub Actions CI matrix (`.github/workflows/ci.yml`).

### Milestone 6: Marketing Hub & Central Auth (`apps/www`)
- [ ] High-energy landing page introducing KodeDock's core developer value proposition.
- [ ] Interactive terminal demonstration of Ed25519 license verification.
- [ ] Central authentication flow (Google OAuth, GitHub OAuth, Magic Links via Better Auth).
- [ ] Universal session cookies shared across subdomains (`store.kodedock.com`, `studio.kodedock.com`, `portal.kodedock.com`).

### Milestone 7: Real PostgreSQL Catalog Seeding (Zero Mock Data Law)
- [ ] Seeding script `src/db/seed.ts` to populate real production starter templates:
  - *Next.js 15 Full-Stack SaaS Boilerplate*
  - *Go Microservices Starter Kit with gRPC & Kafka*
  - *FastAPI Enterprise Microservices Scaffold*
  - *Rust High-Frequency Trading Bot Engine*
  - *AI Agent Multi-Model Automation Framework*
- [ ] Complete technical metadata, realistic changelogs, and valid preview assets.

---

## 4. Technical Constraints & Design Rules

1. **Financial Calculations**: All amounts MUST be integers in paise (`amount / 100` for display).
2. **Typography Pairing**:
   - Headings: `Clash Display`
   - UI & Body: `Satoshi`
   - Hashes, License Keys & Currency: `Azeret Mono`
3. **Double-Bezel Card Pattern**: Outer 1px translucent ring (`rgba(255,255,255,0.08)`) with nested inner core.
4. **Pre-Commit Gate**: `pnpm run typecheck` and `pnpm run build` must pass at 100% before any git commit.
