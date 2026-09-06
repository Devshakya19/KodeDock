# 📝 Changelog

All notable changes to **KodeDock** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.2.0] - 2026-09-06

### Added
- **Frontend Authentication Suite & Design System (`www/src/app/(auth)`):**
  - **Custom Dark Cybernetic Background Asset:** Generated high-resolution dark-mode futuristic code vault artwork (`auth-bg.jpg` and `auth-bg.png`) with violet neon nodes and circuit traces matching `#1D1D21` and `#8535FC` theme in `www/public/images/`.
  - **Unified Floating Cyber Console Auth Architecture (`layout.tsx`):**
    - Completely replaced the standard vertical 50/50 split-screen with an elevated **Unified Floating Cyber Console** workstation frame (`max-w-7xl`, `rounded-3xl`, glassmorphic backdrop `bg-[#18181C]/90`).
    - Added sticky top navigation bar with brand emblem, live protocol status indicator, and dynamic segmented mode switcher (`🛒 Buyer Portal` vs `⚡ Developer Studio`).
    - Implemented dynamic route-aware theme adaptability (`usePathname`) smoothly transitioning between KodeDock Violet (`#8535FC`) for buyers and Cyan (`#06B6D4`) for developers.
    - Integrated interactive **Live Code Escrow Terminal Simulator** (`escrow_contract.rs`) demonstrating real-time AST leak scanning, dual-entry ACID locking, and presigned S3 chunked delivery in Rust syntax.
    - Added ambient cybernetic mesh grid, dual glowing blurred nebula orbs, hardware-style window controls, and global cryptographic security footer.
  - **Reusable Form UI Components:**
    - `Input` component (`www/src/components/ui/input.tsx`) tailored with dark charcoal backdrop, subtle inset shadows, and violet focus rings.
    - `Badge` component (`www/src/components/ui/badge.tsx`) supporting bank-grade status chips and indicators.
  - **Authentication Route Pages:**
    - **Login (`/login`):** Email/password credentials, show/hide password toggle, remember-me trust token option, GitHub & Google OAuth buttons, and direct link to 2FA prompt.
    - **Buyer Register (`/register`):** Dedicated registration flow for buyers/enterprises, real-time 4-stage password entropy strength meter, terms acceptance, and GitHub/Google sign-up.
    - **Developer Register (`/developer/register`):** Dedicated registration flow for developers/sellers to create their cryptographic vault.
    - **Forgot Password (`/forgot-password`):** Work email recovery form with submission confirmation state and 60-second cooldown timer for token resend.
    - **Reset Password (`/reset-password`):** Secure token password update with token family session revocation notice and strength indicator.
    - **Verify 2FA (`/verify-2fa`):** Bank-grade RFC 6238 TOTP 6-digit numeric input with auto-focus advance, backspace navigation, clipboard paste support, and backup recovery key fallback mode.
  - **Dependencies:** Installed `clsx` and `tailwind-merge` utility packages for robust Tailwind v4 styling.

### Security
- **Eliminated URL Password Leakage Risk:**
  - Added explicit `method="POST"` and `action="#"` to all authentication forms (`/login`, `/register`, `/forgot-password`, `/reset-password`, `/verify-2fa`) to prevent browsers from executing native `GET` submissions which append passwords to URL query parameters in server logs and history.
  - Implemented client-side query string scrubber (`useEffect` with `window.history.replaceState`) on `/login` and `/register` to instantly wipe any accidental credentials passed in query parameters from browser address bar and history.

### Fixed
- **Next.js Image `sizes` Warning:** Added `sizes="(max-width: 1024px) 100vw, 52vw"` to `/images/auth-bg.jpg` in `layout.tsx` to optimize responsive image delivery and resolve Next.js runtime console warning.
- **Route 404 on `/auth`:** Configured Next.js redirect in `next.config.ts` and created `src/app/auth/page.tsx` fallback to seamlessly route `/auth` requests to `/login` (307 redirect).

## [1.1.0] - 2026-09-06

### Added
- **Phase 2: Bank-Grade Fintech Engine:**
  - Implemented `src/fintech` domain with real double-entry accounting in Rust.
  - Added PostgreSQL Row-Level Locks (`SELECT ... FOR UPDATE`) in `repository.rs` to prevent race conditions during balance modifications.
  - Developed webhook idempotency checking and `HMAC-SHA256` signature verification for Razorpay payments.
  - Built zero-float (`i64` paise) math to perfectly deduct Platform Fees and Section 194-O TDS withholding.

### Changed
- **Schema & Routing Fixes:**
  - Harmonized database migrations by removing conflicting `products` table from `008_marketplace_schema.sql`.
  - Standardized AI semantic search on `vector(1536)` (OpenAI compatibility) inside `002_marketplace_products.sql`.
  - Fixed route nesting bug in `src/marketplace/mod.rs` and `src/storage/mod.rs` to remove redundant `/api/v1/api/v1` prefixes.

## [1.0.0] - 2026-09-04

### Added
- **Frontend Foundation:**
  - Created `www` directory with Next.js 15 App Router scaffold for the main KodeDock marketplace.
- **Phase 5: Zero-RAM Storage Engine:**
  - Implemented `src/storage` domain with `aws-sdk-s3` integration.
  - Developed Zero-RAM upload strategy using temporary Presigned PUT URLs for direct-to-disk (SeaweedFS) file uploads.
  - Developed secure Asset Delivery API generating 15-minute Presigned GET URLs for downloads.
  - Linked S3 `object_key` securely to products via the `product_assets` table.
- **Phase 4: Marketplace Products Engine:**
  - Designed zero-float (`i64` paise) schema for `products`.
  - Added `categories`, `tags`, and `product_assets` base tables.
  - Enabled `pgvector` with 384 dimensions and `hnsw` index for AI semantic search.
  - Created secure `src/marketplace/` domain module (models, repository, service, handlers).
  - Protected marketplace CRUD routes with `AuthenticatedUser` extractor to ensure users can only create products tied strictly to their own ID.
- **Phase 3: JWT Auth Middleware (Extractors):**
  - Implemented `AuthenticatedUser` Actix-web Extractor (`src/auth/middleware.rs`) to automatically intercept, decode, and validate `Authorization: Bearer <token>` headers.
  - Implemented `AdminUser` Extractor for role-based access control (RBAC).
  - Protected `setup_2fa` and `verify_2fa` endpoints by injecting the `AuthenticatedUser` context directly, eliminating the need to pass email payloads in JSON and achieving true Zero-Mock security for 2FA validation.
- **Phase 2: Bank-Grade Native Auth Engine:**
  - Added migration `007_oauth_and_email.sql` for OAuth identities and unified unique constraints.
  - Refactored OAuth to scalable `src/auth/oauth/` folder with generic `OAuthUserProfile` and added Google OAuth (`google.rs`) alongside GitHub.
  - Implemented GitHub OAuth login and callback exchanging code for GitHub access token and profiling (`src/auth/oauth.rs`).
  - Integrated local Mailpit SMTP verification email dispatch via `lettre` with Redis-backed 15-minute OTP caching.
  - Added full RFC 6238 TOTP Authenticator capabilities (`totp-rs`) with Base32 secret generation, Base64 QR code rendering, and AES-256-GCM encryption-at-rest (`src/auth/totp.rs`).
  - Conducted DRY (Don't Repeat Yourself) audit and refactored redundant cookie building and refresh token issuance logic into clean helper functions (`build_refresh_cookie` in handlers and `issue_refresh_token` in service).
  - Expanded `src/auth/models.rs`, `src/auth/service.rs`, and `src/auth/handlers.rs` to wire Email OTP, TOTP 2FA, and OAuth endpoints.
  - Registered dynamic secrets and OAuth keys securely via `dotenv` and `src/config.rs`.
- **Core Architecture & Specifications:**
  - Product Requirements Document (`docs/PRD.md`) covering all 22 functional pillars.
  - Technical Requirements Document (`docs/TRD.md`) with cryptographic standards, integer arithmetic rules, and AST scanning specs.
  - System Architecture & Data Flow Document (`docs/ARCHITECTURE.md`) detailing domain modules and container topologies.
  - Engineering Constitution & Invariant Rules (`docs/RULES.md`).
  - Target Audience & Marketing Strategy (`docs/MARKETING_AND_USER_PERSONAS.md`).
- **Agent Governance & Binding Contracts:**
  - Binding zero-mock contract (`AGENTS.md` and `AGENT.md`) with 11 Invariant Principles.
  - Added **Principle 11: Mandatory Auto-Changelog Law** requiring automatic updates to `CHANGELOG.md` on every codebase modification.
  - Strict coding standards (`.agents/rules.md`).
- **Phase 1 Infrastructure & All-in-One Deployment:**
  - Unified Docker Compose stack (`docker/docker-compose.yml`) for PostgreSQL 16 (`pgvector`), Redis 7, SeaweedFS S3, Mailpit, and Caddy reverse proxy.
  - Caddy reverse-proxy configuration (`docker/Caddyfile`) with automatic SSL, compression, and WebSocket routing.
  - Multi-stage optimized Rust container build (`docker/Dockerfile.backend`).
  - 5 sequential production database migrations in `docker/migrations/`:
    - `001_auth_security.sql` (Users, Sessions, Token Family Rotation, AES-256 TOTP 2FA)
    - `002_marketplace_products.sql` (Multi-Asset products, versions, `vector(1536)` HNSW cosine index, tags, reviews)
    - `003_fintech_escrow_ledger.sql` (Integer paise balances, 7-day escrow holds, double-entry ledger, disputes, webhook idempotency)
    - `004_tax_tds_compliance.sql` (1% Section 194-O TDS deductions, GST invoices)
    - `005_storage_and_drm.sql` (S3 upload tickets, Ed25519 license keys, dynamic `platform_configs`)
- **Phase 1 Modular Rust Engine Scaffold (`src/`):**
  - Production `Cargo.toml` with Actix-Web 4, SQLx 0.8, pgvector, Redis, Argon2, JWT, TOTP, and S3 SDK dependencies.
  - Real Argon2id password hashing, 15m JWT access tokens, and Token Family Rotation with replay attack revocation (`src/auth/`).
  - Strongly-typed environment configuration loader (`src/config.rs`).
  - Standardized JSON responses (`src/common/mod.rs`) and typed domain errors (`src/errors.rs`).
  - Scaffolded domain routes for `marketplace/`, `fintech/`, `tax/`, `storage/`, `security/`, `realtime/`, `jobs/`.
- **Creator Stores & Dedicated Vendor Shops (`store/`):**
  - Configured `store/` directory with architectural guide (`store/README.md`) and JSON Schema contract (`store/store_profile.json`).
  - Added database migration `docker/migrations/006_creator_stores.sql` for custom storefront handles, banners, social links, and sub-millisecond B-Tree indexing.
