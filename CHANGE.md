# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **HQ Integrations UI Overhaul:**
  - Redesigned the `Integrations` page in HQ to use an aesthetic grid of cards.
  - Implemented dynamic logo loading from `/icons/tech` for each integration card with a graceful fallback.
  - Moved configuration secrets and enable/disable toggles into a polished modal to improve focus and prevent accidental edits.

### Changed
- **Core Engine Production Audit:** Applied a massive "Ponytail" refactor across `services/core-engine` to harden the backend for scale.
  - Eliminated the "Panic Bomb" where `std::env::var().expect()` was called on every incoming request for JWT verification. Secrets are now securely injected into the Actix `AppConfig` state exactly once at startup.
  - Resolved a severe file-descriptor leak in Redis. Converted per-request Redis TCP connections into a single `MultiplexedConnection` state pool.
  - Enforced strict "Fail-Fast" container boot validations by removing `unwrap_or_else` silent fallbacks. Missing environment variables now crash the container immediately to prevent broken deployments.
  - Shrunk boilerplate by over 600 lines across 40+ endpoints by replacing manual UUID path extraction blocks with native `web::Path<uuid::Uuid>` Actix extractors.
  - Replaced brittle 3-query nested wallet creation logic with a single, atomic PostgreSQL UPSERT.
- **Docker Infrastructure:** Fixed generic `debian-slim` healthcheck failures by injecting `curl` directly into the runtime `core-engine` and `ai-service` containers. Repaired broken CORS variable mappings that blocked HQ Vite logins.
- **HQ Platform Configuration Overhaul:** Completely redesigned `PlatformSettings.tsx` into a high-end enterprise command center.
  - Implemented the "Double-Bezel" gradient card architecture with ultra-premium shadows.
  - Upgraded inputs to oversized editorial typography (`text-4xl font-black`) for financial controls.
  - Integrated `framer-motion` for spring-based staggered entry animations and fluid tab transitions.
  - Separated concerns using an asymmetrical grid layout with a sticky left sidebar navigation.
- **Open Source Transition:** Officially licensed the KodeDock platform under the MIT License. Swept and removed all proprietary clauses across `README.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, and `TERMS-OF-SERVICE.md`. Upgraded all technical documentation in `/docs` to version `1.7.0`.
- **Dynamic Platform Commission:** Removed the hardcoded 2.5% platform fee inside `core-engine`. The Rust backend now dynamically queries the live Postgres `platform_settings` table to calculate commission for each checkout.
- **Strict Financial Math:** Upgraded the database schema and backend calculations to use Basis Points (BPS) (`{"bps": 250}` instead of a float percentage). This enforces pure 64-bit integer math in Rust, eliminating any risk of floating-point rounding errors during financial transactions.
- **Real-Time Integrations Dynamic Sync:**
  - Next.js frontend now fetches the GitHub Client ID dynamically at runtime via `/api/auth/config` instead of hardcoding `NEXT_PUBLIC_GITHUB_CLIENT_ID` at build time.
  - Rust `core-engine` instantly sets `std::env::set_var` when the HQ dashboard updates configurations, avoiding the need for backend process restarts.

### Fixed
- **Platform Settings Integrity:** Resolved a critical `500 Internal Server Error` when updating platform settings from HQ. The `updated_by` foreign key in the `platform_settings` table was incorrectly referencing the `profiles` table instead of `hq_staff`. Altered the constraint live and updated `01-init.sql`.
- **HQ Settings Payload Formatting:** Fixed `PlatformSettings.tsx` JSON handling. It now seamlessly transforms the admin-facing percentage value (e.g., `2.5%`) into the strict `{"bps": 250}` structure required by the database upon saving.
- **HQ Search (Command Palette):** 
  - Added `Escape` key handler to close the global command menu.
  - Disabled browser autocomplete, auto-correct, and password manager autofill on the search input to prevent queries from being saved as passwords.

## [1.7.0] - 2026-08-25

### Added
- **Core Engine - Staff Management API**: Discovered missing actions in the Staff Management UI and proactively implemented the corresponding backend logic in Rust.
  - Added `PUT /api/hq/staff/:id/status` to allow Admins to suspend or activate HQ staff accounts securely.
  - Added `PUT /api/hq/staff/:id/role` to enable role assignments (e.g. promoting a user to Super Admin).
- **Audit Logging**: Integrated internal `log_audit` hooks into the new staff endpoints so that all role modifications and account suspensions are permanently recorded in the HQ Audit Logs.
- **Universal Page Layouts & Mini-Stats**: Standardized all HQ pages (`Marketplace`, `Users`, `Catalog`, `Safety`, `Support`, `AuditLogs`, `Settings`, `StaffManagement`) by enforcing a strict `text-3xl font-black` typography hierarchy and unified `animate-in fade-in slide-in-from-bottom-4` page transitions. Added dynamic "Mini-Stats" rows to the Users, Safety, and Support pages to bubble up real-time critical metrics (e.g., Active Sellers, Action Required Disputes, Open Tickets).

### Changed
- **Global Table Standardization**: Completely overhauled `AuditLogs.tsx`, `Safety.tsx`, and `Support.tsx` to utilize the unified `<DataTable />` component, ensuring a consistent, accessible, and responsive tabular data experience across the admin panel.
- **Data Fetching Architecture**: Successfully migrated all legacy `useEffect`/`fetch` patterns to **Tanstack React Query**. This provides automatic caching, background refetching, and seamless loading state management out-of-the-box.
- **Form Integrity**: Rewrote the `Integrations.tsx` configuration panel using `react-hook-form` and `useMutation`. This eliminates manual state management bugs and introduces robust `sonner` toasts for success/error handling.
- **Dashboard & Navigation**: Upgraded `HqLayout.tsx` with the official KodeDock SVG logos and a premium dark-theme side navigation layout. Replaced hardcoded mock data in `Dashboard.tsx` with a live, interactive `Recharts` AreaChart dynamically mapping 7-day revenue via `/api/hq/stats`.
- **API Integrations Hub**: Completely revamped `Integrations.tsx` to mirror an enterprise SaaS settings panel. Added brand-specific icons (Stripe, AWS, SendGrid, Redis), glowing "Connected" status badges, `font-mono` secure API key inputs, and an elegant two-column layout.
- **Finance Flow**: Replaced the static layout in `Finance.tsx` with premium glassmorphic `MetricCard` elements and a live 7-day Platform GMV `AreaChart`.
- **Global Table Styling**: Enhanced the shared `DataTable` and Pagination components with custom hover states, colored inner shadows, and sleek rounded glassmorphic wrappers.
- **SQL Consolidation**: Successfully merged isolated schema fragments (`02-hq-schema.sql`, `03-platform-settings.sql`) into a singular, unified `01-init.sql`. This ensures a flawless, atomic database instantiation process for new Docker environments without race conditions.

### Fixed
- **Zero Errors**: Ensured absolute type safety. The entire `kodedock-hq` codebase now passes `tsc --noEmit` with zero errors, fully conforming to strict `verbatimModuleSyntax`.
- **Self-Suspension Protection**: Implemented strict validation rules preventing admins from suspending their own accounts or demoting their own roles.

## [1.6.0] - 2026-08-24

### Added
- **Frontend Architecture (`kodedock-hq`):**
  - Completely reorganized the React application using Next.js style route groups: `src/pages/(auth)` and `src/pages/(owner)`.
  - Built a secure layout wrapper (`HqLayout.tsx`) utilizing `AuthContext` to protect all owner routes. Unauthenticated users are instantly redirected to `/login`.
- **Marketplace Hub (`/owner/marketplace`):**
  - Built a comprehensive data table to view and search all platform products. 
  - Added new Rust endpoints `GET /api/hq/products` and `PUT /api/hq/products/:id/status` allowing admins to instantly Approve, Pause, or Archive products globally.
- **User Management (`/owner/users`):**
  - Modified the PostgreSQL `users` table to include an `is_active` boolean column. 
  - Created a global suspend/restore toggle with `GET /api/hq/users` and `PUT /api/hq/users/:id/status` APIs to manage platform bans securely.
- **Finance & Payouts (`/owner/finance`):**
  - Created a financial ledger dashboard highlighting Total Platform Revenue, Held Escrow, and Total Payouts.
  - Implemented `GET /api/hq/finance/stats` and `GET /api/hq/finance/withdrawals` to fetch real-time wallet transactions and seller bank/UPI payout details.
- **Trust & Safety (`/owner/safety`):**
  - Developed a robust dispute resolution dashboard for handling buyer/seller conflicts.
  - Built `HqDispute` models in Rust and mapped endpoints `GET /api/hq/safety/disputes` and `PUT /api/hq/safety/disputes/:id` to manage claim reviews and resolutions.
- **Support Inbox (`/owner/support`):**
  - Created a brand new PostgreSQL `support_tickets` table to handle direct user queries.
  - Designed a high-contrast inbox UI with priority badges (Urgent, High, Low) and action menus.
  - Added full backend CRUD support via `GET /api/hq/support/tickets` and `PUT /api/hq/support/tickets/:id/status`.
- **HQ Settings (`/owner/settings`):**
  - Added a secure admin profile configuration page.
  - Implemented `PUT /api/hq/settings` in Rust utilizing **Argon2** password hashing to safely update admin credentials.

### Changed
- **Database Persistence:** Hardcoded all live database schema updates directly into `sql/01-init.sql` ensuring seamless environment reproducibility for new deployments.

### Security
- **HQ Middleware (`middleware/mod.rs`):** Implemented a strict `require_hq_access` middleware for all `/api/hq/*` routes. Explicitly decodes the JWT using the server's `JWT_SECRET` and validates the `is_hq: true` claim. If missing, it immediately rejects the request with a `403 Forbidden`, preventing standard users from accessing admin routes.
- **CORS Configuration:** Expanded `CORS_ORIGINS` in `docker-compose.yml` to explicitly include `http://localhost:5174` and `http://localhost:5175`, ensuring the Vite development server never encounters cross-origin network errors.

## [1.5.1] - 2026-08-23

### Added
- **Dynamic Release Bot (`release.yml`):** The bot now dynamically extracts exact release notes directly from `CHANGE.md` when a new version tag is pushed.
- **Production Simulator (`docker-build-test`):** Added a rigorous Docker Compose build stage to the CI pipeline to prevent deployment regressions across Rust, Go, and Next.js microservices.
- **Auto-Labeler Bot (`labeler.yml`):** Implemented an automated PR labeling system to categorize PRs based on the microservice directory modified (e.g., `frontend`, `backend`, `go-worker`).
- **Stale PR & Issue Bot (`stale.yml`):** Implemented a cron job to automatically warn and close abandoned issues/PRs after 30 days of inactivity.

### Changed
- **Global Prettier Rollout:** Integrated `prettier` across the Next.js `web/` workspace. Automatically reformatted 150+ React files.
- **Rust & Go Formatting:** Executed global `cargo fmt` and `gofmt` to align backend and infrastructure logic with standard language styles.
- **Codebase Formatter Job:** Upgraded `ci.yml` with strict code standard checks including `cargo fmt --check`, `gofmt -l`, and `npm run format:check`.

### Fixed
- **TypeScript & ESLint (Invoice API):** Fixed a strict TS compilation error (`[number, number, number]`) for `primaryColor` and properly described the `@ts-expect-error` override for `jsPDF`.
- **Docker Build Error:** Renamed the web service pointer from `web` to `frontend` in `ci.yml` and injected a dummy `NEXT_PUBLIC_GITHUB_CLIENT_ID` to unblock Docker Compose verification.
- **Rust Compilation:** Updated legacy `amount_usd` references to `amount_paise` in `orders.rs` ensuring seamless PubSub and Redis integration.

## [1.5.0] - 2026-08-22

### Added
- **Server-Side PDF Invoice Generation:**
  - Designed and implemented a professional, enterprise-grade PDF invoice API (`/api/orders/[id]/invoice`) using `jsPDF` and `jspdf-autotable`.
  - Used `sharp` to correctly parse and scale SVGs to PNGs on the server.
  - Added a "Download Invoice" action button directly into the buyer's "My Purchases" dashboard.

### Changed
- **End-to-End Async Order Pipeline:**
  - **Rust (`core-engine`):** Integrated the `redis` crate. Replaced mocked placeholder logs with the actual `dispatch_order_events` function. Upon successful Razorpay payment, Rust now securely pushes structural JSON payloads into Redis Task Queues (`repo_transfer`, `email`) and broadcasts to Pub/Sub (`order_updates`).
  - **Go (`infra-worker`):** Replaced skeleton TODO comments with active Redis `BLPOP` consumer loops for handling background email sending and GitHub repository transfers without blocking the main checkout thread.

## [1.4.2] - 2026-08-22

### Changed
- **Seller Header Badges:** Removed decorative text badges from the top of the `SellerHeader` component across all seller dashboard pages.
- **Redundant UI Cleanup:** Added smart routing logic to dynamically hide the notification bell icon from the seller navbar when the user is actively viewing the notifications page, eliminating UX redundancy.

### Fixed
- **Contrast & Legibility Fixes:** Resolved an invisible text issue on the Navbar Wallet button and Settings pages in Light Mode. Replaced pure-white `text-success-foreground` with vibrant `text-success` on translucent green backgrounds (`bg-success/10`), ensuring perfect legibility across all themes.
- **Cross-Account Cart Leak:** Fixed a bug where a buyer's shopping cart state persisted across sessions. Local storage (`kodedock_cart`) is now securely wiped upon logging out.
- **Seller Routing & Layout Isolation:** Fixed a critical UI bug where the seller's notification bell linked to the generic `/notifications` route, causing the buyer's layout to leak into the seller's view. Created a strict `/seller/notifications` route to maintain correct layout boundaries.

## [1.4.1] - 2026-08-21

### Added
- **Appearance Settings Tab:** 
  - Created a brand-new `Appearance` section within Account Settings, matching the layout of other panels.
  - Added native Next-Themes integration for toggling between `Light`, `Dark`, and `System` modes with clean, visual option cards.

### Changed
- **Seller Dashboard Dark Mode Audit:**
  - Globally refactored all hardcoded light-mode classes across the entire `(seller)` route group to use semantic HSL variables.
  - Optimized the **Sales Chart (Recharts)** by mapping axes, grids, and tooltips to Tailwind CSS variables.
  - Excluded the 3D Digital Creator Card from the theme switch, preserving its signature premium OLED look in both modes.
- **Buyer Dashboard & Marketplace Dark Mode Refinement:**
  - Applied the same deep semantic color refactoring to the Buyer Dashboard (`/dashboard`) and Marketplace Browse (`/browse`).
  - Adjusted the global `ShopLayout` selection colors from blinding blue to theme-aware accent colors (`selection:bg-accent/20`).
- **Brand Consistency:** Updated `README.md` to perfectly center the KodeDock visual SVGs and appended the marketplace motto for an instantly recognizable branding experience.

### Fixed
- Fixed a critical legibility bug where Double-Bezel cards and Recent Activity sections used literal `from-white` to `to-slate-50` gradients. Upgraded them to theme-aware `bg-gradient-to-b from-background to-secondary/20`.
- Fixed an `Uncaught TypeError: Failed to execute 'measure' on 'Performance'` on `GET /seller/settings` caused by a Next.js dev-mode quirk with synchronous redirects.

## [1.4.0] - 2026-08-18

### Changed
- **Seller Dashboard UI Overhaul:**
  - Fully redesigned `/seller/page.tsx` adopting the "Asymmetrical Bento" grid layout and "Double-Bezel" component architecture.
  - Implemented the "Ethereal Glass" dark aesthetic for the Wallet Hub card with a deep OLED black background (`#050505`), custom noise filters, and glowing emerald highlights.
  - Integrated `recharts` for the Sales Chart with custom glassmorphic tooltips and fluid transitions.
- **Cinematic Framer Motion Animations:**
  - Added staggering, spring-based cascade reveals for the main Dashboard Stats Deck.
  - **Seller Navbar:** Integrated `framer-motion` layout animations for the active menu pill.
  - **Seller Welcome Header:** Built an ultra-premium staggered typo-animation engine.
  - **Animated Financials:** Created a new `AnimatedNumber` component using `useSpring` that smoothly rolls up the Wallet Balance, Escrow, and Total Earned metrics from zero to their actual values on page load.

## [1.3.1] - 2026-08-17

### Added
- **KodeDock Agent Guidelines:** Created `AGENT.md` strictly enforcing project architecture constraints, Next.js framework conventions, security priorities, and styling rules.
- **Dynamic Contributors Automation:** Replaced static third-party `contrib.rocks` images with a custom GitHub Action to automatically generate and inject real, bot-filtered contributor avatars directly into `README.md` and `CONTRIBUTING.md` upon merge to `main`.
- **Advanced Auth Redirection (`returnUrl`):** Upgraded `auth/middleware.ts` to dynamically capture the user's intended destination. Unauthenticated hits to protected routes now redirect to `/login?returnUrl=[path]` for seamless post-login redirection.

### Changed
- **Buyer Dashboard (`/dashboard`):** Completely overhauled the UI to feature a premium, spacious layout with modern rounded cards and updated icons.
- **Global Navbar (`navbar.tsx`):** Simplified navigation and implemented a refined dropdown menu for quick access to downloads, wishlist, and billing.
- **Global Shop Architecture & Layout:** Abstracted the Navbar and Premium Footer out of individual pages into a global, centralized Next.js App Router layout file.
- **Server Component Migration (`browse/page.tsx`):** Fully refactored the Buyer Browse page from a Client Component into a Server Component.
- **Immersive Edge-to-Edge Design:** Upgraded the Navbar, Main Content containers, and Footer to share a consistent, full-width constraint, providing a premium SaaS wide-screen aesthetic.
- **Complete Seller Dashboard Redesign (Awwwards & Anti-Slop Tier):**
  - Enforced the Double-Bezel nested container architecture across all creator views.
  - Added dedicated floating seller navigation pills in the central header on desktop.
  - Upgraded Creator Overview Hub to an Asymmetrical Bento Grid with real-time sales stream.
  - Product Inventory Studio received a full filter toolbar and upgraded product cards.
  - Redesigned orders ledger with fulfillment health statistics.
  - Reputation & Feedback Studio received an interactive 5-star sentiment breakdown.
  - Creator Wallet & Payout Engine received an upgraded 3D KodeDock Creator Card and instant preset withdrawal chips.
  - Revenue Analytics received a transparent commission breakdown.
  - Product Creation & Editor received a stepped multi-section form with drag-and-drop cover dropzone.
  - Double-Bezel Loading State replaced basic pulse boxes.
- **Dependency Optimization:** Uninstalled unused heavy 3D packages (`@react-three/drei`, `@react-three/fiber`, `three`) to drastically reduce `node_modules` size and prevent build bloat.
- **Frontend Code Deduplication:** Extracted identical UI logic from `CartPopup`, `NotificationPopup`, and `WalletPopup` into a central `<PopupWrapper />` component. Verified that the Buyer and Seller Profile Settings pages now use a central `ProfileSettings` component.

### Security
- **Robust Security Headers (`middleware.ts`):** Enforced a strict **Content Security Policy (CSP)** restricting scripts/images to trusted domains. Implemented **HSTS**, `X-Frame-Options`, and `Permissions-Policy`.
- **Distributed Tracing:** Injected a cryptographically generated `x-request-id` into all incoming requests and responses for advanced observability across the Next.js frontend and Rust backend.

## [1.3.0] - 2026-08-15

### Added
- **Deferred Image Uploads:** Completely refactored the product creation flow (`new-product.tsx`) to prevent storage leaks. Product images are now temporarily held in React state and are only securely uploaded to SeaweedFS at the exact moment the seller clicks "Publish".
- **Seller Reviews Dashboard:** Implemented a comprehensive `/seller/reviews` page featuring analytics, average rating aggregation, star distribution, and real-time search. Fully backed by a new `GET /api/seller/reviews` endpoint.
- **Dynamic Navbar Badge:** Added an unread notifications counter badge to the `SellerNavbar`, which auto-polls every 30 seconds for live updates.

### Changed
- **Interactive Notifications:** Upgraded the static notifications page to a Client Component, implementing optimistic UI updates. Added `PUT /api/notifications/read-all` to support "Mark all as read".

### Fixed
- **Database Synchronization:** Resolved a persistent `Failed to create product` internal server error caused by missing `updated_at` columns in the database.
- **Blank Screen in Settings:** Fixed a bug in the Seller Notification Settings where an uninitialized preferences row resulted in a completely blank page.
- **Geolocation Error Handling:** Added robust error handling in `profile.tsx` to display proper feedback messages to the seller if they deny the browser's location permission request.

## [1.2.3] - 2026-08-14

### Fixed
- **Double Update**: Fixed redundant `rating` and `review_count` manual `UPDATE` queries in `reviews.rs`. PostgreSQL was already handling this precisely through the `on_review_change` trigger.
- **Validation Logic**: Fixed a bug in `update_product` (`seller.rs`) where `original_price` was validated against a fallback `0` instead of the current existing product price if the `price_paise` was not included in the update payload. Now it properly queries the DB to safely enforce the rule `original_price >= current_price`.
- **Code Cleanliness**: Removed excessive production debug logging from category resolution in `seller.rs`. Codebase continues to pass `cargo clippy` perfectly with zero warnings.

## [1.2.2] - 2026-08-13

### Fixed
- **Double Increment**: Fixed a bug in `complete_order_atomic` (`orders.rs`) where `sales_count` was being incremented manually in Rust, despite a PostgreSQL database trigger (`on_order_status_change`) already incrementing it automatically when an order's status changes to 'completed'.
- **Code Quality**: Fixed unused variables and dead code warnings across `wallet.rs` and `orders.rs`.

### Security
- **Escrow Exploit**: Fixed `release_escrow` in `wallet.rs` which was completely unauthenticated and publicly accessible, allowing anyone to trigger escrow releases. Now correctly requires developer/admin authentication (`require_developer`).
- **Silent Failures**: Fixed silent error swallowing in `release_escrow`. Now properly logs and rolls back the transaction.
- **Data Loss on Deletion**: Fixed `delete_account` in `auth.rs`. Deleting an account previously failed with a generic 500 error due to database foreign key constraints. Now, it safely checks if the user has any active wallet balance, pending/held escrow, or order history before allowing deletion, returning a clean 400 error.
- **SQL Injection Prevention**: Refactored `list_products` query building in `products.rs` to fully parameterize `LIMIT` and `OFFSET` clauses instead of using string interpolation.

## [1.2.1] - 2026-08-12

### Fixed
- **Type Mismatch (`auth.rs`)**: Fixed fatal GitHub OAuth runtime crash by correctly casting `github_id` to `String` so it matches the PostgreSQL database schema.
- **Race Conditions (`wallet.rs`, `orders.rs`)**: Implemented atomic `UPDATE ... WHERE status = 'held'` for financial state changes. This ensures transactions are processed safely and prevents double-crediting exploits.
- **Server Panics (`products.rs`, `wallet.rs`)**: Cast pagination offsets to `i64` to prevent overflow-related server panics during large query offsets.

### Security
- **Rate Limiting (`main.rs`, `orders.rs`)**: Implemented `actix-governor` rate-limiting on high-risk endpoints, including `POST /api/orders`, `POST /api/seller/products`, and `POST /api/auth/*` to mitigate DoS (Denial of Service) attacks.

## [1.2.0] - 2026-08-12

### Added
- **Owner Dashboard (HQ) Features:**
  - Created a live, fully functional `Catalog` UI for the Owner to add and delete taxonomy/categories.
  - Added `DELETE /api/hq/catalog/categories/:id` in `core-engine` with strict role-based access.
  - Built a specialized `.env` synchronization system. Platform integration keys modified from the HQ dashboard now write directly to the `.env` file via `core-engine`.
  - Added an Eye/EyeOff password toggle in the `Integrations` settings.
- **New Public API Endpoint:** Shipped a highly optimized `GET /api/public/categories` in the Rust backend.

### Changed
- **Wallet & Payment UI Overhaul:**
  - Completely redesigned Buyer Wallet using a premium "KodeDock Black" theme with an interactive 3D Flip Credit Card.
  - Unified Seller Wallet with the premium aesthetic, featuring a 3D "KODEDOCK PRO" Creator Card.
  - Upgraded Checkout Page to a modern, split 2-column layout and a centered, elegant floating pop-up for the Success Screen.
- **Storefront & Browse Enhancements:**
  - Redesigned Product Details Page using a clean, light-slate background with white floating content cards.
  - Redesigned Browse Page for a premium grid layout with enhanced searching and categorization.
- **Dashboards & Global UI:**
  - Redesigned Buyer Dashboard for cleaner stats and recent activity presentation.
  - Updated Seller Dashboard with a refined UI matching the new "KodeDock Premium" minimal aesthetic.
  - Added reusable `account-settings.tsx` for standardized security and danger-zone configurations.
- **Live Database Driven Website:** Migrated all hardcoded dummy categories out of the Next.js `web` app.
- **Core Engine (`services/core-engine/src/handlers/products.rs`):** Updated the Rust backend products handler to support new filtering logic, optimized query execution, and improved real-time tracking for sales/view counts.

### Fixed
- Eliminated hardcoded `http://localhost:4001` occurrences, switching entirely to dynamically resolved `import.meta.env.VITE_API_URL`.
- Fixed Vite plugin failures by transitioning away from `date-fns` to native `Date.toLocaleString()`.

### Security
- **Next.js Proxy Security:** Whitelisted the `"public/"` path suffix in the SSRF proxy protection layer.

### Removed
- **Cleanup:** Purged completely all mock/dummy SQL inserts for categories from `01-init.sql` and dropped them directly from the active live database.
- **File Hygiene:** Deleted numerous legacy UI automation scripts, temporary extraction `.py` tools, duplicate MD reports, and test binaries that were cluttering the repository.
- **Fixes:** Replaced `__dirname` with ES Module safe `import.meta.dirname` in the Vite build configuration.

## [1.1.0] - 2026-08-11

### Changed
- **UI/UX Redesigns & Enhancements:**
  - Redesigned Seller Navbar with a modern, glassmorphic floating header.
  - Revamped Notifications Page UI with a centralized card layout and subtle background tints for unread notifications.
  - Completely redesigned Seller Profile Page using a clean, modern grid layout.
  - Grouped Account Settings Page into two distinct panels: "Security & Password" and a red-themed "Danger Zone".
- **Real-Time Data & Synchronization:**
  - Added `setInterval` polling to keep data synchronized seamlessly across key pages.
  - Replaced mock data fetching with actual API endpoints pointing to the Rust backend (`core-engine`).
- **Architecture & Build Verification:**
  - Migrated several server components to `"use client"` where real-time polling and interactivity were required, eliminating hydration mismatches.
  - Validated zero TypeScript errors and a fully successful Next.js production build.

### Fixed
- **Analytics Chart (Sales Chart):** Fixed scaling issues where the Y-axis displayed decimal values. Fixed data point misalignment.
- **Top Performing Section:** Resolved a bug where the dashboard showed 0 sales despite a successful purchase.
- **Total Sales Desync:** Fixed a desynchronization bug where the dashboard inventory counter was 1 sale behind the actual backend count.
