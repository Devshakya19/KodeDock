# Changelog

All notable changes to the CodeHaat Seller Dashboard and UI/UX have been documented in this file.

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

---
*End of Changelog.*
