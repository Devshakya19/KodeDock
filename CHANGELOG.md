# Changelog

All notable changes to the **KodeDock** platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---
## [Unreleased]

### Added
- Created `@kodedock/studio` application package (`apps/studio`) running on port 3001 with Turbopack, Fontshare Suite, and high-end obsidian bento grid theme.
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

---

## [1.0.0] - 2026-09-26

### Added
- Enterprise GitHub Actions workflow suite (`ci.yml`, `security.yml`, `release.yml`, `pr-triage.yml`).
- PostgreSQL 16 schema with relational tables for users, products, versions, orders, licenses, and payouts.
- Store catalog with multi-facet sidebar filtering (categories, price ranges, search) and agency-tier minimal "Sort by" selector.
- Buyer developer portal (`apps/portal`) with license key management, API token issuance, and profile settings.
- Local Fontshare Suite font integration (*Clash Display*, *Satoshi*, *Azeret Mono*).
