# Changelog

All notable changes to the CodeHaat backend project will be documented in this file.


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
  - Completely redesigned using a premium "CodeHaat Black" theme.
  - Implemented an interactive 3D Flip Credit Card showcasing the buyer's name, "BUYER ACCT" format, and an "ACTIVE" status.
  - Added "Silent Refresh" for fetching balance in the background without full-page reloads.
- **Seller Wallet (`/seller/wallet`):**
  - Unified with the premium aesthetic, featuring a 3D "CODEHAAT PRO" Creator Card.
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
  - Updated `dashboard.tsx` with a refined UI, matching the new "CodeHaat Premium" minimal aesthetic.
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

---
*End of Changelog.*
