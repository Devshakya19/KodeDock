# Changelog

All notable changes to the **KodeDock** platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---
## [Unreleased]

### Refactored
- **Unified Backend Architecture (`api/` consolidated into `src/api`)**:
  - Moved the HTTP gateway and route handlers from standalone `api/` into `src/api`, establishing a clean monolithic backend layer (`@kodedock/backend`).
  - `src/` now serves as the single source of truth for all backend concerns: transport routes (`src/api/`), PostgreSQL data models (`src/db/`), and cryptographic security (`src/auth/`).
  - Simplified monorepo workspace dependencies: removed root `api` from `pnpm-workspace.yaml`, updated `docker/Dockerfile.api`, updated GitHub Actions CI matrix, and ensured all 51 automated unit, integration, and E2E test suites pass with 0 errors.

### Added
- **Universal User Profile Menu & Prominent Sign Out Controls**:
  - Implemented topbar user profile dropdowns with obsidian dark styling across both **Developer Portal** (`apps/portal`) and **Creator Studio** (`apps/studio`), matching the UX of **Marketplace Store** (`apps/store`).
  - Dropdown displays live user avatar, name, email address, fast-navigation ecosystem links (Library, License Vault, Studio Settings, Marketplace), and a prominent red `Sign Out` button.
  - Upgraded sidebar footers in both Portal and Studio with dedicated, styled `[ Sign Out ]` action buttons with hover animations, ensuring immediate discoverability.
  - Full cryptographic and session cleanup: invoking Sign Out invalidates session cookies (`signOut()`), purges all platform `localStorage` and `sessionStorage` tokens (`clearAuthStorage()`), and redirects cleanly to `${WWW_URL}/login`.
- **Central Marketing & Authentication Hub (`apps/www`)**:
  - Standalone Next.js 16 micro-frontend running on port 3000 serving public landing page and central sovereign authentication gateway.
  - Complete Login and Developer Registration suite (`/login`) with role-based onboarding (Buyer vs Creator/Seller).
  - Integrated local Fontshare suite (*Clash Display*, *Satoshi*, *Azeret Mono*) and obsidian dark aesthetics.
- **Sovereign Cookie Branding (`kodedock.session_token`)**:
  - Replaced all default `better-auth` cookie namespaces with platform branding `kodedock.session_token` and `__Secure-kodedock.session_token`.
  - Configured `appName: "KodeDock"` and `advanced: { cookiePrefix: "kodedock" }` across Better Auth server and `@kodedock/auth/client`.
  - Updated API Gateway cookie parser and Next.js proxy middleware across `apps/studio`, `apps/portal`, and `apps/store` to prioritize `kodedock.session_token`.
- **Browser Storage Synchronization (`localStorage` & `sessionStorage`)**:
  - Added unified client-side storage persistence in `@kodedock/auth/client` (`syncAuthStorage`, `clearAuthStorage`, `getAuthStorage`).
  - Automatically synchronizes `kodedock_user`, `kodedock_role`, `kodedock_session`, `kodedock_session_token`, and `kodedock_auth_state` across all origins on login, registration, and profile fetch.
  - Wrapped `signOut` across all applications to purge browser storage and session cookies cleanly.
- **Strict Role-Based Access Control (RBAC) & Tenant Data Isolation**:
  - Added `POST /api/me/role` endpoint allowing verified buyers to transition to creator `SELLER` standing while strictly protecting privileged roles.
  - Built full-screen **RBAC Access Restricted Gate** in `apps/studio/src/components/StudioShell.tsx` blocking `BUYER` accounts from accessing Creator Studio unless upgraded.
  - Enforced strict SQL user isolation (`WHERE user_id = $1` / `WHERE seller_id = $1`) preventing cross-tenant leakage via port or API key inspection.
  - Next.js 16 `proxy.ts` middlewares implemented across all apps (`apps/studio`, `apps/portal`, `apps/store`) to block unauthenticated access without valid session cookies.
- **Trusted Origins & CORS Fortification**:
  - Added comprehensive `trustedOrigins` across ports 3000, 3001, 3002, 3003, and 4000 in Better Auth, eliminating `INVALID_ORIGIN` rejections during cross-origin logins.
- Created complete `.vscode/` developer workspace suite:
  - `.vscode/settings.json`: TypeScript workspace SDK, Prettier formatting on save, monorepo file nesting, search exclusions (`.turbo`, `.next`, `dist`), Tailwind CSS token completion, and SQLTools PostgreSQL configuration.
  - `.vscode/extensions.json`: Curated extension recommendations for ESLint, Prettier, Tailwind, Docker, SQLTools, REST Client, GitLens, YAML, and GitHub Actions.
  - `.vscode/launch.json`: Full debugger profiles for API Gateway (port 4000), Studio (port 3001), Store (port 3002), Portal (port 3003), and Chrome browser attaching.
  - `.vscode/tasks.json`: Monorepo build, dev, typecheck, lint, Docker Compose, and schema parity validation tasks.
- Created extra GitHub Workflows and Reusable Actions in `.github/`:
  - `.github/actions/setup-monorepo/action.yml`: Standardized composite action configuring pnpm, Node 22, and Turborepo cache.
  - `.github/workflows/lint.yml`: Monorepo ESLint & code style quality gate.
  - `.github/workflows/api-smoke-test.yml`: Live PostgreSQL 16 & API Gateway endpoint smoke test matrix (`/api/health`, `/api/products`, `/api/studio/settings`, `/api/studio/api-keys`, `/api/portal/licenses`).
  - `.github/workflows/dependency-review.yml`: Supply chain vulnerability & commercial license compliance verification for pull requests.
  - `.github/workflows/docker-build.yml`: Docker Compose configuration validation and multi-stage API Gateway container builds.
  - `.github/workflows/stale.yml`: Automated stale issue and pull request thread lifecycle management.
  - `docker/Dockerfile.api`: Production multi-stage containerfile for `@kodedock/api`.
- Created agency-grade, modular Creator Studio Settings Suite in `apps/studio/src/components/settings/` tailored for software creators, architects, and sellers, mirroring Portal Settings with 8 dedicated configuration domains:
  - `CreatorProfileSettings.tsx`: Public architectural brand name, 10-identity avatar picker, manifesto/bio, and GitHub / Twitter / Portfolio social channels.
  - `PayoutBankingSettings.tsx`: Instant UPI VPA and Direct Bank Transfer (NEFT/RTGS) rails, automatic settlement thresholds, and 95% creator revenue split ledger breakdown.
  - `LicensingEngineSettings.tsx`: Ed25519 Curve25519 cryptographic parameters, default Standard & Extended pricing in paise, domain activation limits, and machine seat allocations.
  - `StorageVaultSettings.tsx`: Cloudflare R2 isolated private bucket vault, strict 60-second HMAC signed download link expiration, mandatory SHA-256 archive digests, and upload quotas.
  - `NotificationRulesSettings.tsx`: Real-time instant sale push/email alerts, payout settlement confirmations, release broadcasts, buyer review feedback, and outgoing Discord/Slack webhook feeds.
  - `CliApiKeysSettings.tsx`: Studio CLI deployment keys (`kd_studio_sec_{hex}`) for headless CI/CD publishing (`kodedock deploy`, `kodedock release`) with customizable scopes and instant revocation.
  - `TaxComplianceSettings.tsx`: Legal entity structures (Individual / LLP / Pvt Ltd), GSTIN, PAN, and registered billing address for Indian Section 194-O TDS compliance.
  - `DangerZoneSettings.tsx`: Studio maintenance mode, catalog delisting, and typed two-step account decommissioning.
- Added backend REST endpoints in `api/src/routes/studio.routes.ts` (`GET /api/studio/settings`, `PATCH /api/studio/settings`, `GET /api/studio/api-keys`, `POST /api/studio/api-keys`, `DELETE /api/studio/api-keys`) with 100% real PostgreSQL persistence and zero mock data.
- Enforced database DDL parity across `docker/schema.sql` and `src/db/schema.sql` with `creator_preferences JSONB DEFAULT '{}'::jsonb` in `user_settings`.
- Created Studio Shell layout (`StudioShell.tsx`) with fixed navigation sidebar, active route indicators, breadcrumbs, and Lenis smooth scrolling.
- Created Creator Dashboard (`/`) featuring real-time gross revenue, 95% creator net split, active listing counts, copies sold, SVG trajectory graph, and live order feed.
- Created Product Inventory & Catalog Manager (`/products`) with status badges, direct links to releases, and search filters.
- Created 4-Step Architecture Publishing Wizard (`/products/new`) supporting metadata, paise-denominated dual licensing (Standard & Extended), Cloudflare R2 storage key setup, and SHA-256 checksums.
- Created Release Management Center (`/releases`) supporting semver tags (`v1.0.0`, `v1.1.0`), R2 artifact keys, cryptographic checksum integrity verification, and markdown changelogs.
- Created Creator Payouts & Monetization Engine (`/payouts`) with available balance ledgers, instant UPI ID / NEFT withdrawal modal, and 95/5 platform revenue audit trail.
- Created Traffic & Conversion Radar (`/analytics`) featuring 4-tier funnel analysis (Impressions -> Views -> Carts -> Orders) and channel distribution charts.
- Created Creator Settings & Profile Editor (`/settings`) for verified creator profile configuration and notification triggers.
- Implemented backend API router `api/src/routes/studio.routes.ts` providing endpoints for stats, product submissions, release publishing, and payout transactions.
- Updated `.github/workflows/ci.yml` build matrix to incorporate `studio` alongside `store`, `portal`, and `api`.
- Created `PLANNED.md` specifying the master engineering roadmap, architectural deliverables, and progress tracking across all monorepo apps.
- Created `StoreStateProvider` client context in `apps/store` for reactive, `localStorage`-persisted shopping cart and developer wishlist state.
- Created dedicated Shopping Cart page (`/cart`) with live license tier switching (Standard vs Extended), paise-to-INR pricing summary, promo code engine, and double-bezel aesthetic.
- Created dedicated Wishlist page (`/wishlist`) featuring saved templates, "Move to Cart" action, bulk cart migration, and high-end obsidian empty state.
- Created End-to-End Checkout page (`/checkout`) with licensee detail capture, multi-method payment selection, and cryptographic Ed25519 license key confirmation.
- Created KodeDock Dev Radar page (`/news`) featuring categorized ecosystem updates, boilerplate drops, framework upgrades, and security notices.
- Added live item counter badges to Wishlist and Cart icons in `StoreNavbar`.
- Added backend checkout endpoint `POST /api/checkout/create-order` in `api/` creating real PostgreSQL `orders`, `licenses`, and `seller_payouts` records.

### Changed
- Removed internal/toy debugging badges and simulation triggers across Studio in strict adherence to production SaaS standards:
  - Removed `PG16 SYNCED` indicator badge from Studio topbar in `StudioShell.tsx`.
  - Removed `Simulate Sandbox Sale` button, simulation handler, and empty-state sandbox trigger from `apps/studio/src/app/page.tsx`.
  - Removed `POSTGRESQL POOL ACTIVE` badge from the sales velocity telemetry radar header in `apps/studio/src/app/page.tsx`.
  - Replaced the Deploy Architecture (`/products/new`) subtitle with clean agency-tier copy: *"Configure specifications, release private archives, and publish production-grade architectures with 95% creator revenue share."*
  - Removed `ZERO-LEAK HMAC ENFORCED` badge from the `/products/new` page header.
  - Removed `REAL-TIME PREVIEW` badge from the sticky storefront comp preview card in `/products/new`.
  - Removed `ACTIVE STANDING` tag from the verified creator standing card in `/settings`.
- Verified 100% compliance with 60-30-10 color palette (`#090A0F` Obsidian Canvas, `#12131A` Graphite Surfaces, `#8B5CF6` Electric Purple, `#38BDF8` Cyber Cyan) and Fontshare typography across all Studio views.
- Elevated `apps/store` navigation tab from generic "News" to "Radar" with developer-centric `<Radio />` icon.
- Enhanced `PurchasePanel` and `ProductCard` to bind directly to reactive `useCart` and `useWishlist` hooks with instant visual feedback.

- Fixed Studio layout collapse by aligning `StudioShell.tsx` with design system classes (`portal-root`, `portal-main`, `portal-topbar`, `page-transition-wrapper`), resolving sidebar occlusion.
- Fixed typography rendering across `apps/studio` by embedding complete Fontshare `@font-face` definitions (`Clash Display`, `Satoshi`, `Azeret Mono`) directly into `apps/studio/src/app/globals.css`.
- Upgraded financial velocity chart on `apps/studio/src/app/page.tsx` with high-end interactive SVG bezier curves, multi-point coordinate gradients, Y-axis INR currency markers, and animated hover tooltips.
- Standardized all Studio pages (`/products`, `/products/new`, `/releases`, `/payouts`, `/analytics`, `/settings`) with unified `.page-container`, `.page-header`, `.page-eyebrow`, and `.stats-bento` architectures.
- Overhauled Studio UX physics with fluid cubic ease-out momentum scrolling (`duration: 0.85`, `easing: 1 - (1-t)^3`, `wheelMultiplier: 1.15`), eliminating stiff scrolling resistance.
- Implemented Double-Bezel Hardware Architecture (`.double-bezel-chassis`, `.double-bezel-core`, `.island-cta-btn`, `.island-icon-pod`) and unified 1.6px stroke geometric iconography across all Studio views.
- Eradicated all mock data and dummy placeholders from Studio in strict adherence to `AGENTS.md`:
  - Eradicated mock curve points on dashboard; added authentic PostgreSQL Live Telemetry Radar with dynamic time-series aggregation and an on-demand sandbox sale simulator (`POST /api/checkout/create-order`).
  - Removed artificial `1420` views multiplier; aggregated genuine category distribution directly from PostgreSQL product entries.
  - Replaced hardcoded "Alex Dev" persona in `/settings` with clean empty states synced to `/api/portal/profile`.
  - Cleared prefilled mock checksum hashes and demo URLs in `/products/new` and `/releases`, providing contextual placeholder guidance.
  - Eradicated dummy `creator@okhdfcbank` UPI string from `/payouts`, establishing authentic verified account workflows.
- Harmonized Studio sidebar navigation into 3 logical groupings: *Engineering & Blueprints*, *Commerce & Settlements*, and *Preferences*.
- Fixed sidebar route matching logic (`isRouteActive`), preventing `/products` from falsely matching `/products/new` and resolving duplicate active indicators and Framer Motion `layoutId="sidebarActivePill"` collisions.
- Eliminated layout shifting and content jumps on sidebar navigation clicks by replacing `<AnimatePresence mode="wait">` with instant DOM mounting and enforcing `html { scrollbar-gutter: stable; overflow-y: scroll; }`.
- Stabilized "Deploy Architecture" and all sidebar nav item positions by enforcing `white-space: nowrap`, expanding `--sidebar-width` to `272px`, adding `flex-shrink: 0` to badges, and removing disruptive hover/click `translateX` transforms so items stay permanently locked on a single line.
- Restructured Deploy Architecture (`/products/new`) into an agency-tier 1380px side-by-side workspace: 4-step configuration chassis on the left and sticky live storefront comp preview on the right.
- Replaced generic icon in Architecture Preview card with official `/kd.svg` brand logo with ambient purple drop-shadow.
- Removed the redundant "Studio" badge chip next to the KodeDock brand in the sidebar header and simplified breadcrumb root to "KodeDock".
- Standardized all navigation item labels and matched thin-stroke geometric Lucide icons (`<LayoutDashboard />`, `<Boxes />`, `<UploadCloud />`, `<GitBranch />`, `<Coins />`, `<TrendingUp />`, `<Sliders />`) across both sidebar and page headers, eradicating all AI-slop symbols (`Sparkles`).
- Rebranded "Publish Codebase" wizard to "Deploy Architecture" with full-width Permlink card, custom form styles, and responsive non-wrapping layout in Step 1 (Blueprint & Software Identity).
- Redesigned Creator Settings (`/settings`) console into a 1040px double-bezel architecture with real backend synchronization (`PATCH /api/portal/profile`), verified creator standing card, dark luxury toggles, and cryptographic engine status.
- Fixed Node 20 runtime mismatch in CI matrix by standardizing on Node 22+ for native `node:sqlite` compatibility required by `pnpm@11.26.0`.
- Fixed post-job cache failure in `dependency-audit` job of `security.yml` by removing redundant pnpm store cache step when dependencies are not installed.
- Fixed `pnpm/action-setup@v4` version conflict (`ERR_PNPM_BAD_PM_VERSION`) across all GitHub Actions workflows by deferring to `package.json`'s `packageManager`.

### Fixed
- Resolved all GitHub CodeQL Code Scanning security alerts and workflow configuration warnings:
  - Re-created dedicated CodeQL workflow `.github/workflows/codeql.yml` with dual categories (`/language:actions` and `/language:javascript-typescript`), resolving the missing workflow warning.
  - Fixed CodeQL Alert #18 (High - CORS misconfiguration for credentials transfer) in `api/src/server.ts` by strictly whitelisting trusted origins before granting `Access-Control-Allow-Credentials`.
  - Fixed CodeQL Alert #25 (High - DOM text reinterpreted as HTML) in `apps/studio/src/app/products/new/page.tsx` by adding `getSafeImageUrl` protocol validation and replacing DOM element manipulation on `onError` with React state error handling.
  - Proactively fortified `apps/portal/src/app/page.tsx` with safe image handling and error fallback component `<LibraryCardThumbnail />`.
  - Fixed CodeQL Alerts #1-#24 (Medium - Workflow does not contain permissions) across all GitHub Actions workflows by enforcing least-privilege `permissions:` across `ci.yml`, `codeql.yml`, `security.yml`, `release.yml`, and `pr-triage.yml`.

---

## [1.0.0] - 2026-09-26

### Added
- Enterprise GitHub Actions workflow suite (`ci.yml`, `security.yml`, `release.yml`, `pr-triage.yml`).
- PostgreSQL 16 schema with relational tables for users, products, versions, orders, licenses, and payouts.
- Store catalog with multi-facet sidebar filtering (categories, price ranges, search) and agency-tier minimal "Sort by" selector.
- Buyer developer portal (`apps/portal`) with license key management, API token issuance, and profile settings.
- Local Fontshare Suite font integration (*Clash Display*, *Satoshi*, *Azeret Mono*).
