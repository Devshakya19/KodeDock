# Changelog

All notable changes to the KodeDock backend project will be documented in this file.

## [v1.2.0] - 2026-08-11

### 🎨 UI/UX Redesigns & Enhancements
- **Seller Navbar:**
  - Redesigned with a modern, glassmorphic floating header (`sticky top-0 z-50 bg-white/90 backdrop-blur-md`).
  - Restructured to a clean 3-column layout: Logo & "Creator Studio" badge (Left), Navigation Pills (Center), Quick Actions & Profile (Right).
  - Introduced a sleek dropdown menu for Profile & Settings under the avatar icon.
- **Notifications Page (`/notifications`):**
  - Revamped the UI with a centralized card layout and subtle background tints for unread notifications.
  - Implemented dynamic, color-coded Lucide icons for different notification types (e.g., Green `DollarSign` for sales, Blue `Package` for products, Purple `ArrowUpRight` for payouts).
  - Added relative timestamps (e.g., "Just now", "5m ago").
- **Seller Profile Page (`/seller/profile`):**
  - Completely redesigned using a clean, modern grid layout.
  - Upgraded the Avatar section with a sleek rounded-square frame and dark overlay on hover.
  - Form fields now feature subtle Lucide icons and soft background colors that transition to pure white on focus.
- **Account Settings Page (`/seller/settings`):**
  - Grouped into two distinct panels: "Security & Password" and a red-themed "Danger Zone".
  - Refined typography and spacing for better readability and a premium feel.

### ⚡ Real-Time Data & Synchronization
- **Live Auto-Refresh Implementation:**
  - Added `setInterval` polling (every 15 seconds) to keep data synchronized seamlessly.
  - Deployed this across key pages: **Products (Inventory)**, **Orders**, and **Wallet**.
  - Added an "Updated at [Time]" stamp and a pulsing "Live" indicator to confirm real-time data flow.
- **Atomic Operations:**
  - Replaced mock data fetching with actual API endpoints pointing to the Rust backend (`core-engine`).
  - Ensured that Postgres transactions (`sales_count`, `view_count`, `wallet_balance`) reflect correctly without page reloads.

### 🐛 Bug Fixes & Analytics Improvements
- **Analytics Chart (Sales Chart):**
  - Fixed scaling issues where the Y-axis displayed decimal values. It now correctly snaps to integer multiples (e.g., 3, 6, 9) using Recharts configurations.
  - Fixed data point misalignment so that the line chart accurately reflects exact sales counts.
- **Top Performing Section:**
  - Resolved a bug where the dashboard showed 0 sales despite a successful purchase. It now correctly aggregates sales and views from the database and updates instantly.
- **Total Sales Desync:**
  - Fixed a desynchronization bug where the dashboard inventory counter was 1 sale behind the actual backend count. Both now accurately display identical figures.

### 🛠️ Architecture & Build Verification
- **Component Conversion:** Migrated several server components to `"use client"` where real-time polling and interactivity were required, eliminating hydration mismatches.
- **Build Quality:** Validated zero TypeScript errors and a fully successful Next.js production build (`npm run build`).

## [v1.3.0] - 2026-08-12

### 💳 Wallet & Payment UI Overhaul
- **Buyer Wallet (`/dashboard/wallet`):**
  - Completely redesigned using a premium "KodeDock Black" theme.
  - Implemented an interactive 3D Flip Credit Card showcasing the buyer's name, "BUYER ACCT" format, and an "ACTIVE" status.
  - Added "Silent Refresh" for fetching balance in the background without full-page reloads.
- **Seller Wallet (`/seller/wallet`):**
  - Unified with the premium aesthetic, featuring a 3D "KODEDOCK PRO" Creator Card.
  - Split earnings view into "Escrow" (Pending) and "All Time" (Total Earned) metrics.
  - Revamped withdrawal interface with a MAX button and streamlined transaction history tabs (Sales vs. Payouts).
- **Checkout Page (`/checkout`):**
  - Upgraded to a modern, split 2-column layout (Order Details on left, Payment Method on right).
  - Integrated a premium Wallet Payment card with clear indicators for insufficient balance vs available balance.
  - Redesigned the "Success Screen" as a centered, elegant floating pop-up.
  - Neatly managed Terms of Service & Privacy Policy into a secure information block.

### 🛍️ Storefront & Browse Enhancements
- **Product Details Page (`/products/[id]`):**
  - Redesigned using a clean, light-slate background (`bg-slate-50`) with white floating content cards.
  - Re-arranged layout: Hero image takes center stage at the top, followed by cleanly structured Title, Badges, and Description.
  - Upgraded the "Reviews" section with separated, elegant review cards and a refined submission form.
  - Sticky pricing/action card now highlights secure payments, source code access, and instant delivery beautifully.
- **Browse Page (`/browse`):**
  - Redesigned `product-card.tsx` for a premium grid layout.
  - Added `browse-filters.tsx` (new component) for enhanced searching and categorization.
  - Replaced the standard navbar with the new `browse-navbar.tsx`.

### 🎛️ Dashboards & Global UI
- **Buyer Dashboard (`/dashboard`):**
  - Completely redesigned `page.tsx` for cleaner stats and recent activity presentation.
  - Upgraded layout strategy: Deleted the old sidebar (`dashboard-sidebar.tsx`) and replaced it with a modern unified `dashboard-navbar.tsx` acting as the global top navigation.
  - Redesigned "My Purchases" (`/dashboard/purchases`) with sleek purchase history cards.
  - Transformed Buyer Profile (`/dashboard/profile`) and Settings (`/dashboard/settings`) into premium slate-themed pages.
- **Seller Dashboard (`/seller`):**
  - Updated `dashboard.tsx` with a refined UI, matching the new "KodeDock Premium" minimal aesthetic.
  - Enhanced Seller Settings (`/seller/settings.tsx`).
- **Shared Components:**
  - Added `account-settings.tsx` for reusable, standardized security and danger-zone configurations across buyer and seller profiles.

### ⚙️ Backend & Engine Improvements
- **Core Engine (`services/core-engine/src/handlers/products.rs`):**
  - Updated the Rust backend products handler to support new filtering logic, optimized query execution for the redesigned browse grid, and improved real-time tracking for sales/view counts.




## [2026-08-11 / 2026-08-12] - Core Engine Initial Fixes & Rate Limiting

### Fixed
- **Type Mismatch (`auth.rs`)**: Fixed fatal GitHub OAuth runtime crash by correctly casting `github_id` to `String` so it matches the PostgreSQL database schema.
- **Race Conditions (`wallet.rs`, `orders.rs`)**: Implemented atomic `UPDATE ... WHERE status = 'held'` for financial state changes. This ensures transactions are processed safely and prevents double-crediting exploits.
- **Server Panics (`products.rs`, `wallet.rs`)**: Cast pagination offsets to `i64` to prevent overflow-related server panics during large query offsets.

### Security
- **Rate Limiting (`main.rs`, `orders.rs`)**: Implemented `actix-governor` rate-limiting on high-risk endpoints, including `POST /api/orders`, `POST /api/seller/products`, and `POST /api/auth/*` to mitigate DoS (Denial of Service) attacks.


## [2026-08-13] - Core Engine Security & Deep Audit Fixes

### Fixed
- **Critical (Escrow Exploit)**: Fixed `release_escrow` in `wallet.rs` which was completely unauthenticated and publicly accessible, allowing anyone to trigger escrow releases. Now correctly requires developer/admin authentication (`require_developer`).
- **Critical (Silent Failures)**: Fixed silent error swallowing in `release_escrow`. Previously, if the wallet update failed, it would silently ignore it, causing escrow funds to vanish without being credited to the seller. Now properly logs and rolls back the transaction.
- **High (Data Loss on Deletion)**: Fixed `delete_account` in `auth.rs`. Deleting an account previously failed with a generic 500 error due to database foreign key constraints (or cascaded deletes wiping out order history). Now, it safely checks if the user has any active wallet balance, pending/held escrow, or order history before allowing deletion, returning a clean 400 error to prevent catastrophic financial data loss.
- **Medium (Double Increment)**: Fixed a bug in `complete_order_atomic` (`orders.rs`) where `sales_count` was being incremented manually in Rust, despite a PostgreSQL database trigger (`on_order_status_change`) already incrementing it automatically when an order's status changes to 'completed'. This was causing Razorpay orders to count as 2 sales.
- **Medium (SQL Injection Prevention)**: Refactored `list_products` query building in `products.rs` to fully parameterize `LIMIT` and `OFFSET` clauses instead of using string interpolation.
- **Code Quality**: Fixed unused variables and dead code warnings across `wallet.rs` and `orders.rs`.


## [2026-08-14] - Core Engine Final Deep Scan & Refinements

### Fixed
- **Medium (Double Update)**: Fixed redundant `rating` and `review_count` manual `UPDATE` queries in `reviews.rs`. PostgreSQL was already handling this precisely through the `on_review_change` trigger. This saves unnecessary CPU and DB I/O cycles.
- **Medium (Validation Logic)**: Fixed a bug in `update_product` (`seller.rs`) where `original_price` was validated against a fallback `0` instead of the current existing product price if the `price_paise` was not included in the update payload. Now it properly queries the DB to safely enforce the rule `original_price >= current_price`.
- **Code Cleanliness**: Removed excessive production debug logging from category resolution in `seller.rs`. Codebase continues to pass `cargo clippy` perfectly with zero warnings.


## [2026-08-15] - Deferred Uploads, Schema Synchronization & UI Fixes

### ✨ Features
- **Deferred Image Uploads (Plan A)**: Completely refactored the product creation flow (`new-product.tsx`) to prevent storage leaks. Product images are now temporarily held in React state and are only securely uploaded to SeaweedFS (via pre-signed URLs) at the exact moment the seller clicks "Publish". This ensures no orphaned images exist in the storage system if a seller abandons a draft.

### 🐛 Bug Fixes
- **Critical (Database Synchronization)**: Resolved a persistent `Failed to create product` internal server error caused by missing `updated_at` columns in the database. Performed a clean volume rebuild to properly synchronize the Docker Postgres instance with the definitive `01-schema.sql` (which correctly triggers `set_updated_at` on rows).
- **High (Blank Screen in Settings)**: Fixed a bug in the Seller Notification Settings (`notifications/page.tsx`) where an uninitialized preferences row resulted in a completely blank page due to a strict null check. The UI now gracefully falls back to default values (Email/Push notifications ON) when no explicit configuration exists.
- **Medium (Geolocation Error Handling)**: Added robust error handling in `profile.tsx` to display proper feedback messages to the seller if they deny the browser's location permission request (`GeolocationPositionError`).

- **Seller Reviews Dashboard**: Implemented a comprehensive `/seller/reviews` page featuring analytics, average rating aggregation, star distribution, and real-time search. Fully backed by a new `GET /api/seller/reviews` endpoint in the Rust core-engine.
- **Interactive Notifications**: Upgraded the static notifications page to a Client Component, implementing optimistic UI updates. Added `PUT /api/notifications/read-all` to support "Mark all as read" and individual notification reading without page reloads.
- **Dynamic Navbar Badge**: Added an unread notifications counter badge to the `SellerNavbar`, which auto-polls every 30 seconds for live updates.


## [2026-08-17] - Buyer Dashboard UI/UX Redesign & Navbar Updates

### 🎨 UI/UX Redesigns & Enhancements
- **Buyer Dashboard (`/dashboard`):**
  - Completely overhauled the UI to feature a premium, spacious layout (`max-w-6xl`) with modern rounded cards (`rounded-[24px]`).
  - Upgraded generic icons to semantic `lucide-react` icons (`ShoppingBag`, `CreditCard`, `Sparkles`, `Clock`).
  - Redesigned the Wallet card with a dark luxury theme and subtle glowing blur effects.
  - Enhanced the "Become a Seller" CTA with an indigo-to-blue gradient and dynamic background icons.
  - Implemented interactive hover states (lifting and shadow changes) for a dynamic design experience.
- **Global Navbar (`navbar.tsx`):**
  - Removed redundant navigation pills ("Dashboard", "Purchases", "Browse") and the "Buyer" badge from the desktop view for a cleaner look.
  - Simplified mobile menu by removing unused buyer dashboard links.
  - **Buyer Profile Dropdown:** 
    - Removed the "My Profile" button.
    - Expanded functionality by adding quick access links for **Downloads & Licenses**, **Wishlist**, and **Billing & Invoices**.

### 🧹 Technical Debt & Code Cleanup
- **Dependency Optimization:** Uninstalled unused heavy 3D packages (`@react-three/drei`, `@react-three/fiber`, `three`) to drastically reduce `node_modules` size and prevent build bloat.
- **Frontend Code Deduplication:**
  - **Popups:** Extracted identical UI logic from `CartPopup`, `NotificationPopup`, and `WalletPopup` into a central `<PopupWrapper />` component.
  - **Profile Settings:** Verified that the Buyer and Seller Profile Settings pages now use a central `ProfileSettings` component and a highly modular `useProfile` React hook to avoid redundant API calls and form logic.
  - Updated `duplicate.md` to reflect resolved components.


### 🏗️ Global Shop Architecture & Layout
- **Centralized Shop Layout (`(shop)/layout.tsx`):**
  - Abstracted the Navbar and Premium Footer out of individual pages into a global, centralized Next.js App Router layout file.
- **Server Component Migration (`browse/page.tsx`):**
  - Fully refactored the Buyer Browse page from a Client Component into a Server Component.
  - Eliminated the client-side full-screen loading spinner (which caused layout jumps) by securely verifying the JWT token on the server before rendering.
- **Immersive Edge-to-Edge Design:**
  - Upgraded the Navbar, Main Content containers, and Footer to share a consistent, full-width constraint (`w-full px-4 lg:px-10 xl:px-14`), providing a premium SaaS wide-screen aesthetic.
  - Repositioned Navbar elements: Brand name locked to the far left, Search Bar perfectly dead-centered via flexible flexbox balancing (`flex-1 min-w-0`), and grouped action icons pushed to the extreme right edge.
  - Simplified the `KodeDockLogo` by removing the terminal icon for a cleaner, typography-focused brand mark.

### 🛡️ Enterprise Middleware & Security
- **Advanced Auth Redirection (`returnUrl`):**
  - Upgraded `auth/middleware.ts` to dynamically capture the user's intended destination. Unauthenticated hits to protected routes now redirect to `/login?returnUrl=[path]` for seamless post-login redirection.
- **Robust Security Headers (`middleware.ts`):**
  - Enforced a strict **Content Security Policy (CSP)** restricting scripts/images to trusted domains (Stripe, GitHub Avatars, Unsplash) to prevent XSS attacks.
  - Implemented **HSTS** (Strict-Transport-Security) for forced HTTPS, along with `X-Frame-Options` (Clickjacking prevention), and `Permissions-Policy` (Disabling unauthorized Camera/Mic access).
- **Distributed Tracing:**
  - Injected a cryptographically generated `x-request-id` into all incoming requests and responses for advanced observability across the Next.js frontend and Rust backend.

### 🤖 Agent Guidelines & Open Source Workflows
- **KodeDock Agent Guidelines:** Created `AGENT.md` strictly enforcing project architecture constraints, Next.js framework conventions, security priorities, and styling rules.
- **Dynamic Contributors Automation:** Replaced static third-party `contrib.rocks` images with a custom GitHub Action (`.github/workflows/contributors.yml`) utilizing `gh api` to automatically generate and inject real, bot-filtered contributor avatars directly into `README.md` and `CONTRIBUTING.md` upon merge to `main`.

### 💎 Complete Seller Dashboard Redesign (Awwwards & Anti-Slop Tier)
- **Design System & Architecture:**
  - Enforced the **Double-Bezel (Doppelrand)** nested container architecture across all creator views (outer shell ring-1 + inner core gradient card) to eliminate flat, generic cards.
  - Implemented **Button-in-Button** trailing icon patterns and tactile active feedback (`active:scale-[0.98]`).
  - Added dedicated floating seller navigation pills in the central header on desktop (`Overview`, `Products`, `Orders`, `Reviews`, `Wallet`).
- **Creator Overview Hub (`/seller`):**
  - Upgraded to an Asymmetrical Bento Grid with real-time sales stream, live auto-sync indicator, top performing asset velocity, and escrow balance card.
  - Overhauled `SalesChart` with dual-mode metric toggle (**Revenue ₹ vs Units Sold**), timeframe selectors (`Today`, `7D`, `30D`, `6M`, `1Y`, `Custom`), smooth cubic-bezier area spline, vertical hover guide, and glassmorphic tooltip.
- **Product Inventory Studio (`/seller/products`):**
  - Added full filter toolbar: Category filter dropdown, status filter tabs (`All`, `Active`, `Limited`, `Paused`, `Draft`), sorting options (Top Sales, Most Views, Price), and live keyword search.
  - Upgraded product cards with hover image zoom, stock limit counters, one-click public URL copy with feedback, and direct links to marketplace listings.
- **Customer Orders & Fulfillment (`/seller/orders`):**
  - Redesigned orders ledger with fulfillment health statistics, one-click copyable Order IDs, formatted timestamps, and real-time pending escrow status badges.
- **Reputation & Feedback Studio (`/seller/reviews`):**
  - Built an interactive 5-star sentiment breakdown allowing sellers to filter reviews by star rating with a single click.
  - Added verified purchase badges, reviewer initial badges, and product tag attribution.
- **Creator Wallet & Payout Engine (`/seller/wallet`):**
  - Upgraded the 3D KodeDock Creator Card with realistic metallic chip, holographic radial mesh, and smooth 3D perspective flip.
  - Integrated instant preset withdrawal chips (`₹500`, `₹1,000`, `₹2,500`, `₹5,000`, `MAX`) and verified bank/UPI destination cards.
- **Revenue Analytics (`/seller/earnings`):**
  - Added transparent commission breakdown explaining the 2.5% platform fee and 97.5% creator net take-home pay, alongside total historical disbursements.
- **Product Creation & Editor (`/seller/products/new` & `/edit`):**
  - Stepped multi-section form with drag-and-drop cover dropzone, live seller take-home calculator, GitHub private repository auto-invite configuration, and a sticky real-time marketplace buyer card replica preview.
  - Added high-impact destructive delete flow for existing listings.
- **Double-Bezel Loading State (`/seller/loading`):**
  - Replaced basic pulse boxes with an exact layout-matching double-bezel skeleton deck.

## [v1.4.0] - 2026-08-18

### 🎨 UI/UX Redesigns & Enhancements
- **Seller Dashboard UI Overhaul:**
  - Fully redesigned `/seller/page.tsx` adopting the "Asymmetrical Bento" grid layout and "Double-Bezel" component architecture.
  - Implemented the "Ethereal Glass" dark aesthetic for the Wallet Hub card with a deep OLED black background (`#050505`), custom noise filters, and glowing emerald highlights.
  - Integrated `recharts` for the Sales Chart with custom glassmorphic tooltips and fluid transitions.
- **Cinematic Framer Motion Animations:**
  - Added staggering, spring-based cascade reveals for the main Dashboard Stats Deck.
  - **Seller Navbar:** Integrated `framer-motion` layout animations for the active menu pill, ensuring it glides smoothly between tabs with organic spring physics.
  - **Seller Welcome Header:** Built an ultra-premium staggered typo-animation engine. The welcome text splits into word groups and fades in with dynamic blur reduction on load, intelligently handling responsive word wrapping.
  - **Animated Financials:** Created a new `AnimatedNumber` component using `useSpring` that smoothly rolls up the Wallet Balance, Escrow, and Total Earned metrics from zero to their actual values on page load.

## [v1.4.1] - 2026-08-21

### 🌓 Advanced Theming & Dark Mode Perfection
- **Seller Dashboard Dark Mode Audit:**
  - Globally refactored all hardcoded light-mode classes (`bg-slate-50`, `hover:bg-slate-200`, `text-slate-900`, `border-slate-300`) across the entire `(seller)` route group to use semantic HSL variables (`bg-secondary`, `bg-background`, `border-border`, `text-foreground`).
  - Fixed a critical legibility bug where Double-Bezel cards and Recent Activity sections used literal `from-white` to `to-slate-50` gradients. Upgraded them to theme-aware `bg-gradient-to-b from-background to-secondary/20`, resolving bright white boxes blinding users in Dark Mode.
  - Optimized the **Sales Chart (Recharts)** by mapping axes, grids, and tooltips to Tailwind CSS variables (`hsl(var(--border))` and `hsl(var(--muted-foreground))`) instead of fixed hex codes.
  - Excluded the 3D Digital Creator Card from the theme switch, preserving its signature `from-slate-950 to-black` premium OLED look in both modes.
- **Buyer Dashboard & Marketplace Dark Mode Refinement:**
  - Applied the same deep semantic color refactoring to the Buyer Dashboard (`/dashboard`) and Marketplace Browse (`/browse`).
  - Replaced hardcoded legacy classes (`bg-[#F8FAFC]`, `bg-slate-200`, `text-blue-600`) with dynamic theme variables (`bg-background`, `bg-secondary`, `text-accent`) for flawless dark mode support.
  - Adjusted the global `ShopLayout` selection colors from blinding blue to theme-aware accent colors (`selection:bg-accent/20`).

### ⚙️ Settings & Performance
- **Appearance Settings Tab:** 
  - Created a brand-new `Appearance` section within Account Settings, matching the layout of other panels.
  - Added native Next-Themes integration for toggling between `Light`, `Dark`, and `System` modes with clean, visual option cards.
- **Brand Consistency:** 
  - Updated `README.md` to perfectly center the KodeDock visual SVGs and appended the marketplace motto for an instantly recognizable branding experience.
- **Bug Fixes:**
  - Fixed an `Uncaught TypeError: Failed to execute 'measure' on 'Performance'` on `GET /seller/settings` caused by a Next.js dev-mode quirk with synchronous redirects.

## [v1.4.2] - 2026-08-22

### 🎨 UI/UX Refinements
- **Seller Header Badges:** 
  - Removed decorative text badges (e.g., "Creator Studio", "Revenue Analytics") from the top of the `SellerHeader` component across all seller dashboard pages. This creates a cleaner, more focused typography hierarchy where the primary page title stands alone without distraction.
- **Contrast & Legibility Fixes:**
  - Resolved an invisible text issue on the Navbar Wallet button and Settings pages in Light Mode. Replaced pure-white `text-success-foreground` with vibrant `text-success` on translucent green backgrounds (`bg-success/10`), ensuring perfect legibility across all themes.
- **Redundant UI Cleanup:** 
  - Added smart routing logic to dynamically hide the notification bell icon from the seller navbar when the user is actively viewing the notifications page, eliminating UX redundancy.

### 🐛 Bug Fixes
- **Cross-Account Cart Leak:** Fixed a bug where a buyer's shopping cart state persisted across sessions. Local storage (`kodedock_cart`) is now securely wiped upon logging out.
- **Seller Routing & Layout Isolation:** Fixed a critical UI bug where the seller's notification bell linked to the generic `/notifications` route, causing the buyer's layout (with wallet and cart) to leak into the seller's view. Created a strict `/seller/notifications` route to maintain correct layout boundaries.

---
*End of Changelog.*
