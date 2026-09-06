# 📝 Changelog

All notable changes to **KodeDock** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.9.0] - 2026-09-06

### Changed
- **Complete Visual & Architectural Redesign of Settings Command Matrix (`platform/src/app/(buyer)/settings/`):**
  - **Elevated Typography & Hierarchy:** High-impact headings with dual-tone gradient fills (`from-white via-[#F3E8FF] to-[#C084FC]`), monospace system telemetry badges (`font-mono tracking-wider`), and structured field-category tags (`[FIELD: FULL_NAME]`).
  - **Futuristic Glassmorphic Command Deck Layout (`layout.tsx`):** Ambient mesh lighting, live protocol telemetry pills (`i64 INTEGER PAISE`, `ARGON2id + TOTP`), and a floating glass navigation dock with glowing accent bars, dual-tone gradient icons, and responsive horizontal fluid pills for mobile.
  - **Live Holographic Developer ID Pass (`profile/page.tsx`):** Real-time interactive developer pass showing live avatar, verified badges, bio, and statutory Indian Section 194-O GSTIN/PAN tax compliance fields, plus an expandable 24-avatar cryptographic selector grid with hover zoom.
  - **Cryptographic Password Engine & Entropy Meter (`security/page.tsx`):** Argon2id credential manager with show/hide password toggles, dynamic 4-segment animated entropy strength meter, live criteria checklists, and real-time radar-ping telemetry on active device sessions with 1-click revocation.
  - **Hacker Terminal Git CLI PAT Generator (`connect/page.tsx`):** Terminal-style CLI command preview (`$ kd login --token kd_live_...`), token expiration and granular security scopes selector, one-time reveal modal with instant copy animation, and cloud platform integration cards.
  - **Mission-Critical Alert Matrix (`notifications/page.tsx`):** Granular delivery routing (Email vs In-App Push) for 48-hour inspection countdowns, escrow releases, and dispute arbitrations with custom animated neon switch toggles and live test telemetry alert button.
  - **Workspace & Code Inspector Theme Matrix (`preferences/page.tsx`):** Zero-floating point integer paise invariant engine showcase card, automated invoice billing dispatch email routing, and interactive side-by-side theme cards (*Cyber Obsidian Violet*, *High-Contrast Noir*, *Emerald Terminal*).
- **Global CSS Cybernetic Utilities (`platform/src/app/globals.css`):** Added `@keyframes pulse-glow`, `@keyframes radar-pulse`, `@keyframes border-glow-scan`, `.glass-matrix-glow`, and metallic gradient text helpers.

## [1.8.0] - 2026-09-06

### Added
- **Multi-Part Folder-Based Modular Settings Architecture (`platform/src/app/(buyer)/settings/`):**
  - Re-architected settings into isolated directory-based Next.js App Router sub-routes sharing a persistent cybernetic navigation layout (`layout.tsx`):
    - 📂 `settings/profile/page.tsx` (👤 Developer Identity): 24-avatar cryptographic selector, full name, email, bio, Indian GST & PAN statutory compliance.
    - 📂 `settings/security/page.tsx` (🔒 Security & Sessions): Argon2id password modification with validation, RFC 6238 TOTP Two-Factor Authentication status, and real-time active multi-device sessions with 1-click token revocation.
    - 📂 `settings/connect/page.tsx` (⚡ Connect & Integrations): Terminal Git Personal Access Token (PAT) generator with instant copy warning and revocation, and cloud platform linking (GitHub OAuth, Docker Registry).
    - 📂 `settings/notifications/page.tsx` (🔔 Notifications Matrix): Granular switches for 48-hour inspection countdown warnings, escrow release confirmations, dispute desk replies, and security login alerts across Email & In-App channels.
    - 📂 `settings/preferences/page.tsx` (⚙️ Preferences & Billing): Fixed INR Integer Paise currency standard, default invoice billing email, and in-browser code inspector theme selector (Cyber Dark Modern vs High Contrast Monochrome).
    - 📂 `settings/layout.tsx`: Cybernetic shared shell with dynamic route indicator, responsive desktop sidebar & mobile pills.
    - 📂 `settings/page.tsx`: Automatic server redirect to `/settings/profile`.
- **Backend Password Change Endpoint (`src/auth/`):**
  - Added `ChangePasswordRequest` model in `src/auth/models.rs`.
  - Added `change_password` handler in `src/auth/handlers.rs` verifying old password against Argon2id hash and updating database with new hashed credentials.
  - Exposed `POST /api/v1/auth/password` in `src/auth/mod.rs`.
  - Added `authApi.changePassword` in `platform/src/lib/api/client.ts`.

## [1.7.0] - 2026-09-06

### Removed
- **Sub-Navigation Component Bar (`BuyerNav`):** Removed the extra sub-navigation button bar (`buyer-nav.tsx`) from the body of `/dashboard`, `/wallet`, `/disputes`, and `/settings`. Navigation is now unified strictly within the top floating header and profile dropdown.
- **100% Mock / Demo Data Purge Across Buyer Portal & Checkout:**
  - Removed `kd_local_orders` localStorage storage and `handleAddDemoCodebase` button from `platform/src/app/(buyer)/dashboard/page.tsx`.
  - Removed hardcoded preview balances (`₹2,500.00`) and mock ledger entries from `platform/src/app/(buyer)/wallet/page.tsx`.
  - Removed hardcoded sample disputes (`disp_94827b1`) and dummy thread messages from `platform/src/app/(buyer)/disputes/page.tsx`.
  - Removed hardcoded PAT tokens (`pat_1`) and fake sessions (`user_me`) from `platform/src/app/(buyer)/settings/page.tsx`.
  - Removed client-side fake order synthesis from `platform/src/app/(shop)/product/[slug]/page.tsx`.

### Added
- **Real Backend Order Creation with ACID Row Locks (`src/fintech/repository.rs`):**
  - Implemented `create_buyer_order` executing real transactional writes to `orders`, `escrow_transactions`, `license_keys`, `user_accounts`, and `ledger_entries`.
  - Connected `POST /api/v1/fintech/orders` in `src/fintech/handlers.rs` to create real database orders and lock escrow funds.
- **Real Backend Deliverable Download Engine (`src/storage/handlers.rs` & `src/storage/mod.rs`):**
  - Added `download_order_package` endpoint at `GET /api/v1/storage/download/order/{order_id}` verifying order ownership and generating real presigned download URLs from SeaweedFS / S3 storage.
- **Direct API Integration & Zero Direct DB Access from Frontend:**
  - Added `storageApi.downloadOrderPackage` in `platform/src/lib/api/client.ts`.
  - Updated `handleBuyWithEscrow` in `platform/src/app/(shop)/product/[slug]/page.tsx` to execute transactions through `fintechApi.createOrder`.
  - Updated `handleDownloadDeliverable` in `platform/src/app/(buyer)/dashboard/page.tsx` to retrieve signed deliverable URLs from the backend storage service.

## [1.6.0] - 2026-09-06

### Added
- **Complete Buyer Portal Suite & Multi-Page Architecture (`platform/src/app/(buyer)/`):**
  - **Buyer Sub-Navigation Component (`platform/src/components/buyer/buyer-nav.tsx`):** Sleek, cybernetic responsive navigation bar seamlessly linking My Purchases (Vault), Wallet & Ledger, Dispute Desk, and Account Settings.
  - **Buyer Escrow Wallet & Financial Ledger (`platform/src/app/(buyer)/wallet/page.tsx`):**
    - Live balance cards showing Available Balance (₹) and Pending Escrow (₹).
    - 1-Click "Add Funds / Deposit" modal with preset amounts (₹500, ₹2,000, ₹5,000, ₹10,000, Custom) and instant double-entry wallet funding.
    - Double-Entry General Ledger journal table displaying real timestamps, correlation transaction IDs, debit/credit badges, categories (`WALLET_TOPUP`, `ESCROW_HOLD`, `ESCROW_RELEASE`), descriptions, and amounts in integer paise.
  - **Dispute Resolution Desk (`platform/src/app/(buyer)/disputes/page.tsx`):**
    - Status filtering (`All`, `Open & Active`, `Resolved`).
    - Detailed dispute dossier cards showing order numbers, reasons (Tree-Sitter syntax errors, backdoor secrets, build failures), and freeze statuses.
    - Interactive Dispute Thread & Evidence modal with real-time messages between buyer, seller, and automated Security Arbiter with message submission.
  - **Buyer Profile, Tax & Git CLI Tokens (`platform/src/app/(buyer)/settings/page.tsx`):**
    - Developer identity form with 24-avatar visual grid picker, name, bio, and verified email.
    - Indian GST and PAN tax compliance fields for B2B input tax credit and statutory Section 194-O tracking.
    - Git CLI Personal Access Token (PAT) generator for `git clone https://git.kodedock.com/vault/...` repository access.
    - Active Multi-Device Sessions manager with IP address, device user-agent, last seen status, and 1-click session termination.
  - **Navigation Header Expansion (`platform/src/components/nav/header.tsx`):**
    - Updated profile dropdown menu to link directly to My Purchases, Wallet & Ledger, Dispute Desk, and Account Settings.
    - Changed badge label to concise "Verified".
- **Backend Auth & Profile Management Endpoints (`src/auth/`):**
  - Added `UpdateProfileRequest` and `UserSessionInfo` models in `src/auth/models.rs`.
  - Added parameterized SQLx repository methods `update_user_profile`, `get_user_sessions`, and `revoke_session` in `src/auth/repository.rs`.
  - Exposed `GET /api/v1/auth/me`, `PUT /api/v1/auth/profile`, `GET /api/v1/auth/sessions`, and `DELETE /api/v1/auth/sessions/{id}` in `src/auth/mod.rs` and `handlers.rs`.
- **Backend Fintech Escrow, Disputes & Ledger Endpoints (`src/fintech/`):**
  - Added `DisputeItem`, `CreateDisputeRequest`, `DisputeMessageItem`, `AddDisputeMessageRequest`, and `WalletTopupRequest` models in `src/fintech/models.rs`.
  - Implemented real `get_buyer_disputes`, `create_buyer_dispute`, `get_dispute_messages`, `add_dispute_message`, `get_wallet_transactions`, and `topup_wallet_balance` with ACID row locks and double-entry balanced debit/credit insertions in `src/fintech/repository.rs`.
  - Replaced stub handlers with full production implementations in `src/fintech/handlers.rs`.
  - Exposed `GET & POST /api/v1/fintech/disputes`, `GET & POST /api/v1/fintech/disputes/{id}/messages`, `GET /api/v1/fintech/wallet/transactions`, and `POST /api/v1/fintech/wallet/topup` in `src/fintech/mod.rs`.
- **Frontend API Client & Domain Types Extension (`platform/src/lib/`):**
  - Added strongly-typed interfaces in `platform/src/lib/types.ts` for `UserProfile`, `UpdateProfileInput`, `UserSession`, `DisputeItem`, `CreateDisputeInput`, `DisputeMessage`, `UserAccountBalance`, and `LedgerEntry`.
  - Extended `authApi` and `fintechApi` client methods in `platform/src/lib/api/client.ts`.

## [1.5.0] - 2026-09-06

### Added
- **My Purchases & Codebase Library Complete Redesign (`platform/src/app/(buyer)/dashboard/page.tsx`):**
  - Completely re-architected the buyer's purchases page into an ultra-premium cybernetic Escrow Vault with real-time status counters, dynamic 48-hour inspection countdown progress timers, and live capital metrics.
  - **Fixed Broken/Mock Actions:** Replaced dummy text toasts with real, functional capabilities:
    - **Real Deliverable Download:** Generates and triggers direct client downloads of source code and cryptographic verification bundle (`.txt` / archive) with AST syntax verification certificate and license metadata.
    - **Official GST Tax Invoice Modal:** Complete modal with official Indian taxation breakdown (HSN/SAC code `998313`, 1.0% Section 194-O TDS, 3.5% Platform Escrow Handling Fee, 18% CGST/SGST) and native `window.print()` PDF generation.
    - **Formal Dispute Desk:** Added interactive dispute submission modal with reason selection (AST syntax errors, backdoor secrets, specification mismatch, build failures) and detailed logs input that freezes escrow funds.
    - **Early Escrow Release Modal:** Confirmation dialog that verifies buyer satisfaction and triggers escrow release to seller account.
    - **Quick CLI Clone Terminal Snippet:** In-vault SSH/HTTPS clone command box with 1-click clipboard copying.
    - **Cross-Page Vault Sync:** Wired `product/[slug]` checkout to persist new orders into local vault storage so purchases immediately appear in the user's library.
    - **Demo Codebase Injection:** One-click demo repository loader for instant testing of all escrow actions.
- **Backend Fintech Orders & Escrow Endpoints (`src/fintech/`):**
  - Added `BuyerOrderItem` model and parameterized `get_buyer_orders` repository query in `src/fintech/repository.rs` joining `orders`, `products`, and `escrow_transactions`.
  - Added parameterized ACID transaction `approve_escrow` in `src/fintech/repository.rs` that atomically marks order completed, releases escrow transaction, and updates seller wallet balances.
  - Registered `GET /api/v1/fintech/orders` and `POST /api/v1/fintech/escrow/{id}/approve` endpoints in `src/fintech/mod.rs` and `handlers.rs`.
- **Universal Responsive Design Overhaul (`platform/` across mobile, tablet, and desktop):**
  - **Floating Island Navbar (`platform/src/components/nav/header.tsx`):** Added responsive breakpoint scaling down to ultra-compact 320px screens, adaptive brand title collapse on small phones, hidden Cmd+P keyboard badge on touch/mobile screens to reclaim search input space, truncated first name chip, and `max-w-[calc(100vw-1.5rem)]` bounded profile dropdown menu preventing viewport overflow.
  - **Cybernetic Explore Marketplace (`platform/src/app/(shop)/explore/page.tsx`):** Added `overflow-x-hidden` protection against horizontal scrollbars, responsive padding (`p-4 sm:p-8 lg:p-10`), touch edge-scrollable category tabs (`-mx-3 px-3 sm:mx-0 sm:px-0`), adaptive stack chips ribbon, wrapping sort and filter controls, flex-wrapping codebase card footers (seller bio + CTA buttons), and mobile-scrollable Quick-View Slide-Over Modal with `max-h-[90vh] overflow-y-auto`.
  - **Buyer Vault & Dashboard (`platform/src/app/(buyer)/dashboard/page.tsx`):** Enhanced responsive grid layout for metric counters (`grid-cols-1 sm:grid-cols-3`), mobile-optimized order cards with wrapped action controls, and full touch compatibility.
  - **Product Specification Dossier (`platform/src/app/(shop)/product/[slug]/page.tsx`):** Responsive breadcrumbs, adaptive security audit grid (`grid-cols-1 sm:grid-cols-2`), sticky-on-desktop and flowing-on-mobile escrow checkout card, and scrollable authorization modal.
  - **Platform Footer (`platform/src/components/nav/footer.tsx`):** Centered layout with responsive wrapping for navigation links on mobile devices and space-between alignment on desktop.
- **Cybernetic Explore Marketplace Redesign (`platform/src/app/(shop)/explore/page.tsx`):**
  - Re-architected explore page into an ultra-premium cybernetic developer storefront with subtle 4rem grid background and ambient violet/cyan radial lighting.
  - Added multi-category command tabs (`All Codebases`, `Full-Stack SaaS`, `AI & LLM Agents`, `High-Perf Systems`, `Mobile Apps`, `DevOps & Cloud`).
- **Official Tech Stack Vector Icons (`public/icons/tech/`):**
  - Downloaded and configured crisp official vector SVGs with brand colors for missing frameworks: `rust.svg` (`#CE412B`), `go.svg` (`#00ADD8`), `docker.svg` (`#2496ED`), `postgresql.svg` (`#336791`), and `flutter.svg` (`#02569B`).
  - Replaced dot placeholders across the Explore command bar and codebase dossier card tags with official SVG icons from `public/icons/tech/`.
  - Built view layout switcher supporting expansive **2-Column Dossier Grid** and high-density **Terminal List** view.
  - Implemented rich codebase cards with AST Verified clean badges, 48h escrow tags, integer paise pricing, seller trust indicators, and quick-specs drawer trigger.
  - Created interactive **Quick-View Slide-Over Modal** for instant architecture inspection without page redirection.
  - Added high-fidelity pulsing skeletons during API loading and high-tech cyber empty states.
- **GitHub Actions CI/CD Pipeline (`.github/workflows/ci.yml`):**
  - Integrated complete automated verification workflow running on `main` push and pull requests.
  - Job `backend`: Rust stable toolchain, rust-cache, `cargo fmt --check`, `cargo clippy -- -D warnings`, `cargo check`, and `cargo test`.
  - Job `platform-ui`: Node 20, npm caching, TypeScript typechecking (`tsc --noEmit`), and Next.js standalone build validation.
  - Job `marketing-ui`: Node 20, npm caching, TypeScript typechecking, and Next.js standalone build validation.
  - Job `docker-validation`: Validates multi-service container orchestration config with `docker compose config --quiet`.
- **Rust Backend Code Formatting & Clippy Hardening:**
  - Formatted entire Rust codebase to official rustfmt standard.
  - Resolved all clippy warnings (`unnecessary_lazy_evaluations`, `redundant_closure`, `too_many_arguments`).
- **Unified Docker Architecture & Production Orchestration (`docker/docker-compose.yml`):**
  - Added `platform-ui` service running the Next.js platform web application on internal port 3000 (host port 3001) connected to `kodedock-net`.
  - Added `kodedock-ui` service running the Next.js marketing application on internal port 3000 (host port 3000) connected to `kodedock-net`.
  - Implemented multi-stage standalone Dockerfile for platform (`docker/Dockerfile.platform`) with Alpine Linux, non-root user execution, and build-time env inlining.
  - Implemented multi-stage standalone Dockerfile for marketing (`docker/Dockerfile.kodedock`) with Alpine Linux and non-root security.
  - Added `.dockerignore` at workspace root to exclude local `node_modules`, `.next`, `target`, `.git`, and sensitive logs from build contexts.
- **Backend Container Hardening (`docker/Dockerfile.backend`):**
  - Upgraded base builder and runner images to `rust:1.80-slim-bookworm` and `debian:bookworm-slim` with `libssl3`, eliminating Bullseye package mirror 404 issues during `apt-get install`.
- **Edge Reverse Proxy Routing (`docker/Caddyfile`):**
  - Configured Caddy to route `http://app.localhost` to `platform-ui:3000` for buyer/seller/auth flows.
  - Configured Caddy to route `http://localhost` and default port 80 to `kodedock-ui:3000` for public marketing pages.
  - Preserved transparent routing of `/api/*` and `/ws/*` to the Rust backend and `/s3/*` to SeaweedFS across all host domains.
- **Real Auth Integration & JWT Token Alignment:**
  - Resolved `access_token` mismatch in `platform/src/lib/types.ts` and `platform/src/app/(auth)/login/page.tsx` & `register/page.tsx` so JWT tokens persist into `localStorage`.
  - Added URL normalizer in `platform/src/lib/api/client.ts` guaranteeing all frontend calls route through `/api/v1` without 404 endpoint mismatch.
  - Added `/api/v1/auth/register` alias alongside `/api/v1/auth/signup` in `src/auth/mod.rs` for unified registration handling.
- **Cyber-Floating Island Capsule Navbar (`platform/src/components/nav/header.tsx`):**
  - Redesigned navigation bar into a compact (48px height), ultra-modern floating island capsule (`fixed top-3 sm:top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-5xl rounded-full`).
  - Added dynamic scroll reactivity: header smoothly compresses (`scale-[0.99]`), shifts to deep obsidian frosted glass (`bg-[#141417]/90 backdrop-blur-2xl`), and intensifies violet border glow when scrolled.
  - Implemented auto-expanding compact search capsule with shortcut badge (`Ctrl+P` / `⌘P`), glowing focus ring, and zero-distortion layout transitions.
  - Aligned page content across `/explore`, `/dashboard`, and `/product/[slug]` with `pt-20 sm:pt-24` top padding to gracefully accommodate the floating island capsule.
  - Integrated circular user profile chip with live active status ring, truncated first name display, and spring-animated backdrop-blurred popover dropdown.
  - Persistent user profile dropdown menu with verified buyer status, quick Escrow Vault navigation, and sign out controls.
  - Enhanced global `Ctrl+P` (and `⌘P` on macOS, `/`) search bar with 4px grid spacing and design system tokens.
  - Removed pulsing light overlay from the KD emblem for a clean, minimalist developer logo presentation.
- **Next.js Standalone Mode:**
  - Configured `output: "standalone"` in `platform/next.config.ts` and `kodedock/next.config.ts` to reduce production image footprint and speed up container startup.

## [1.4.0] - 2026-09-06

### Added
- **Marketplace Storefront & Codebase Catalog (`platform/src/app/page.tsx`):**
  - Built high-performance Cybernetic Marketplace Storefront with live search input, keyboard shortcut (`/`), framework filter chips (Rust, Next.js, Go, Python, Flutter, React, PostgreSQL, Docker), and sorting.
  - Product cards featuring verified Tree-Sitter AST badges, 48h escrow tags, integer paise-to-₹ formatting, seller reputation chips, and direct inspection links.
- **Platform Root Redirect & Routing Cleanup (`platform/src/app/page.tsx`):**
  - Replaced the platform's root storefront page with an automatic server-side Next.js `redirect('/login')` to directly show the authentication flow by default.
  - Removed redundant `platform/src/app/auth` folder since the Next.js `(auth)` route group already handles all authentication pages (`/login`, `/register`, etc.).
- **Buyer & Shop Domain Separation (`platform/src/app/(buyer)` & `(shop)`):**
  - Removed lingering `app/developer` directory to strictly enforce a "Buyer-First" focus and eliminate unapproved seller UI components outside of auth.
  - Separated concerns by creating two distinct Next.js route groups: `(buyer)` for account management and `(shop)` for the marketplace experience.
  - Restored the Marketplace Storefront (formerly `page.tsx`) and migrated it to `(shop)/explore/page.tsx` to serve as the product discovery catalog.
  - Migrated codebase product detail pages to `(shop)/product/[slug]/`.
  - Encapsulated the buyer's private Escrow Vault and purchases inside `(buyer)/dashboard/`.
- **Zero-Mock API Integration (`platform/src/app/(buyer)/dashboard` & `(shop)/explore`):**
  - Enforced the Zero-Mock Law by completely removing `SAMPLE_ORDERS` and `OrderMock` from the Buyer Dashboard.
  - Integrated `fintechApi.getMyOrders()` to fetch real escrow transaction data from the PostgreSQL database.
  - Rewrote dashboard mapping logic to natively consume the Rust API's `OrderItem` type (`gross_amount_paise`, `product_title`, etc.).
  - Removed `INITIAL_CATALOG` fallback from the Marketplace Storefront (`explore/page.tsx`), ensuring buyers only see real, verified codebase listings.
  - Implemented dynamic loading spinners ("Decrypting Escrow Ledger..." and "Syncing Marketplace Ledger...") to handle async API delays gracefully.
- **Zero-Mock Auth Integration (`platform/src/app/(auth)`):**
  - Removed `setTimeout` mock delays and fake demo modes from `/login` and `/register` pages.
  - Created `authApi` wrapper in `lib/api/client.ts` pointing to real `/api/v1/auth/login` and `/api/v1/auth/register` endpoints.
  - Implemented real JWT token parsing (`kd_access_token`) into browser `localStorage` to securely persist sessions.
  - Wired up automatic redirect to `/dashboard` upon successful authentication, eliminating the manual/fake redirection loop.
- **Codebase Product Dossier & Escrow Purchase (`platform/src/app/product/[slug]/page.tsx`):**
  - Implemented comprehensive technical specification sheet with full architecture overview.
  - Live AST Security Audit Card detailing Tree-Sitter syntax verification, zero leaked secrets, Shannon entropy pass, and AES-256 deliverable packaging.
  - Interactive Escrow Checkout modal with real-time integer paise breakdown of Gross Price, 3.5% Platform Fee, 18% GST, and 1% Section 194-O TDS.
- **Developer Listing Studio (`platform/src/app/developer/products/new/page.tsx`):**
  - Multi-step codebase submission wizard with real-time title auto-slugging, tag selection, and Git repository URL attachment.
  - Integrated Live Financial Settlement Calculator displaying exact net seller payouts with zero floating-point arithmetic.
- **Buyer Repository Vault & Escrow State Machine (`platform/src/app/dashboard/page.tsx`):**
  - Dedicated buyer dashboard with order tracking, active 48-hour inspection countdown timer, and one-click AES-256 deliverable downloads.
  - Interactive escrow controls: Early escrow release to seller and dispute raising mechanism for frozen audits.
- **Global Platform Navigation Components (`platform/src/components/nav/`):**
  - `PlatformHeader`: Sticky glassmorphic navbar with search bar, protocol status, and CTAs.
  - `PlatformFooter`: Protocol invariants display, audit operational status, and cross-site navigation links.
- **Backend Rust Marketplace API Extensions (`src/marketplace`):**
  - Added `CatalogProductItem`, `CatalogQuery`, and `CatalogResponse` in `src/marketplace/models.rs`.
  - Implemented parameterized `list_catalog` and `publish_product` in `src/marketplace/repository.rs`.
  - Registered public unauthenticated `GET /api/v1/marketplace/catalog` and authenticated `POST /api/v1/marketplace/products/{id}/publish` endpoints.

## [1.3.0] - 2026-09-06

### Changed
- **Architectural Separation (`platform` vs `kodedock`):**
  - Renamed `www/` frontend directory to `platform/` using `git mv` to preserve git history.
  - Designated `platform/` exclusively for the transactional application: Authentication suite (`/login`, `/register`, `/developer/register`, `/verify-2fa`), Buyer & Seller dashboards, Escrow checkout, and Marketplace shop.
  - Configured `platform/` dev server to run on port `3001` (`"dev": "next dev -p 3001"`).

### Added
- **Marketing & Showcase Portal (`kodedock/`):**
  - Bootstrapped modern Next.js 16 App Router application in `kodedock/` running on port `3000` dedicated to marketing, landing pages, protocol features, and docs.
  - Implemented high-converting Cybernetic Hero landing page with:
    - Sticky top marketing navigation with brand emblem and direct CTAs to Platform auth (`/login`, `/register`, `/developer/register`).
    - High-trust invariants bar highlighting ₹0.00 float math, 48h escrow guarantee, Tree-Sitter AST audit, and RFC 6238 2FA.
    - Two-sided ecosystem cards detailing buyer verification guarantees and seller 1.0% Section 194-O TDS automated compliance.
  - Integrated brand assets (`icons/`, `images/`) and unified dark cybernetic design tokens (`#1D1D21`, `#8535FC`, `#06B6D4`, `#414146`).
  - Added `.env.example` and `.env.local` linking marketing site to `NEXT_PUBLIC_PLATFORM_URL=http://localhost:3001`.

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
