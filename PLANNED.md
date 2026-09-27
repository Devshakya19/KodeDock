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
| **`apps/studio`** | Creator & Seller Dashboard (Uploads, Releases, Payouts) | Next.js 16, Turbopack, `/api/studio/*` | **Planned (Milestone 5)** |
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

### Milestone 3: E-Commerce Experience — Wishlist, Cart & Checkout (Active)
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

### Milestone 4: Developer Radar / Ecosystem Updates (Active)
- [x] Transition legacy `/news` route into **KodeDock Dev Radar** (`/news`).
- [x] Modernize navigation tab with developer-centric iconography (`<Radio />` / `<Sparkles />`).
- [x] Categorized feed for:
  - *Template Releases* (major version updates, framework upgrades).
  - *Security Advisories* (dependencies, checksum verifications).
  - *Architecture Standards* (PostgreSQL 17, Turbopack, Next.js 16 updates).

### Milestone 5: Creator Studio (`apps/studio`) (Next Up)
- [ ] Initialize Next.js 16 app at `apps/studio`.
- [ ] Product listing submission flow:
  - Metadata, categories, tech stack tags, demo URLs.
  - Source code archive (.zip) upload with SHA-256 checksum calculation.
  - Pricing configuration in paise (Standard vs Extended commercial licenses).
- [ ] Version Release Manager (`v1.0.0`, `v1.1.0`) with markdown changelog editor.
- [ ] Creator Sales & Analytics dashboard (Total revenue, order volume, net payouts).
- [ ] Creator Payout Request module (UPI ID / NEFT bank transfer) linking to `seller_payouts` table.
- [ ] Backend controller `api/src/routes/studio.routes.ts`.

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
