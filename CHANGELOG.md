# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed
- **Routing: `/browse` → `/explore`**: Corrected all middleware redirect rules so that authenticated buyers are redirected to `/explore` after login. Also restored accidentally deleted files across `src/marketplace/` and `web/src/app/(shop)/`.
- **Public Marketplace Access**: Fixed Next.js middleware so `/explore` and `/product` are publicly browsable without forced redirects to login, allowing guests and developers to explore products seamlessly.
- **Proxy Whitelist**: Added `categories` to `ALLOWED_PREFIXES` in Next.js SSRF proxy route (`web/src/app/api/proxy/[...path]/route.ts`).

- **Bank-Grade Silent Token Rotation & Seamless Session Refresh (`web/src/shared/lib/auth/`, `web/src/app/api/auth/`)**:
  - Resolved session auto-logout issues caused by 15-minute access token expirations by implementing seamless, background Token Family Rotation.
  - Stored 7-day rotated refresh tokens (`kodedock_refresh_token`) alongside 15-minute access tokens in secure HttpOnly cookies across Login, Register, and OAuth flows.
  - Added dedicated Next.js `/api/auth/refresh` route that securely exchanges the consumed refresh token with the Rust backend, automatically rotating both credentials and returning updated user data.
  - Implemented transparent 401 interceptor and retry mechanism in `/api/proxy/[...path]` and `/api/auth/me` so that any backend request made after access token expiry is silently refreshed and retried without user interruption or forced logouts.
  - Added in-flight mutex lock in `auth.refreshToken()` to prevent race condition replay alerts, plus active session heartbeats (refresh every 10 minutes when tab is active/visible).
  - Updated Next.js `updateSession` middleware to automatically rotate expired access tokens on protected routes when a valid refresh token exists.
- **Navbar Complete Redesign & Full-Width Layout (`web/src/components/shop/navbar.tsx`)**:
  - Implemented **Skeleton UI Theory (`ProfileSkeleton`)** for user profile trigger and mobile navigation drawer, reserving exact structural dimensions (avatar circle, text lines, chevron) during initial session data fetching to completely eliminate Cumulative Layout Shift (CLS) and UI jumps.
  - Converted navbar container to edge-to-edge full width (`w-full`) with balanced horizontal padding (`px-4 sm:px-6 lg:px-8`).
  - Integrated centered search bar (`NavbarSearch`) with expanded container width (`max-w-lg lg:max-w-2xl`), live `/explore?q=...` routing sync, and keyboard shortcut focus (`⌘K` / `Ctrl+K` / `/`).
  - Removed "Explore" and "Top Rated" navigation links from the navbar for a cleaner, decluttered UI.
  - Removed "Sell Code" CTA button and "Cart" icon button from the navbar.
  - Preserved brand presentation displaying the official brand name SVG (`/icons/logo/KodeDock-theme.svg`) with zero logo icon box.
  - Rebuilt User Profile with a sleek avatar, status indicator dot, user handle, email badge, role chip (Developer, Admin, Buyer), and glassmorphic floating dropdown menu with links to Vault/Purchases, Seller Dashboard, Account Settings, and Sign Out.
- **Explore Page Search Bar Removal & Active Filter Badges (`web/src/app/(shop)/explore/page.tsx`)**:
  - Removed redundant search input from the explore page filter bar while preserving category tabs, pricing filters (`All`, `Paid`, `Free`), and sort dropdown (`Featured`, `Top Rated`, `Price: Low to High`, `Price: High to Low`).
  - Added dynamic active search filter chip with instant dismissal button when searching from the navbar.
- **Hero Carousel Banner & Animations (`web/src/components/shop/hero-carousel.tsx`)**:
  - Fixed slide height jumping / layout shift by locking the carousel container and internal content blocks to fixed dimensions (`h-[260px] sm:h-[250px]`) with `absolute inset-0` slide transitions.
  - Standardized title (`truncate`), description (`line-clamp-2`), and tech stack badges (`h-6` single row) to guarantee 100% identical height across all 5 slides.
  - Implemented buttery smooth slide transitions using Framer Motion with direction-aware physics (`x: 50 / -50`, spring stiffness `280`, damping `28`).
  - Added animated progress indicator bars that smoothly fill over 4 seconds, pausing automatically during cursor hover.
  - Added active scale micro-interactions to prev/next chevrons and primary CTA buttons.
  - Fixed spacing: reduced layout `main` padding from `pt-20` to `pt-16` and explore page padding from `py-8 md:py-12` to `pt-3 md:pt-4`, eliminating excessive top space below the navbar.
- **Explore Page Redesign (`web/src/app/(shop)/explore/page.tsx`)**:
  - Redesigned explore page to adhere to KodeDock 60-30-10 design system tokens (zero unwanted colors, pure developer-first minimalist aesthetic).
  - Real-time search by title, description, and tech stack tags.
  - Dynamic category pills fetched directly from PostgreSQL (`/api/categories`).
  - Pricing filters (`All`, `Paid`, `Free`) and multi-criteria sorting (`Featured`, `Top Rated`, `Price: Low to High`, `Price: High to Low`).
  - URL synchronization with Next.js App Router query params wrapped in `Suspense`.
  - Added 3-pillar trust guarantee banner (Instant GitHub Transfer, Static Secret Auditing, PostgreSQL Escrow).
- **Product Card Redesign (`web/src/components/product/product-card.tsx`)**:
  - Rebuilt card anatomy with `#27272A` surface, `#414146` border, `#141417` inset terminal preview, and `#8535FC` actions.
  - Formatted integer paise currency with discount percentage calculations and "Free Open Source" badges.
  - Added tech stack badges and verified code security indicators.
- **Design System Tokens (`web/src/app/globals.css` & `web/src/app/(shop)/layout.tsx`)**:
  - Updated Tailwind CSS v4 variables in `:root` and `.dark` to match exact hex codes from `docs/KODEDOCK_DESIGN_SYSTEM.md` (`#1D1D21`, `#27272A`, `#141417`, `#414146`, `#52525B`, `#8535FC`, `#EDEDF0`, `#A1A1AA`).
  - Replaced hardcoded `bg-black` with `#1D1D21` in shop layout.

### Added
- **Marketplace Core Engine (`src/marketplace`)**:
  - `src/marketplace/models.rs`: `ProductSummary` and `ProductDetails` DTOs with secure `public_id` serialization using Base58 (`kd_prd_...`), masking internal UUIDs.
  - `src/marketplace/repository.rs`: Parameterized SQLx queries fetching active products and deep details with joined seller profiles and categories.
  - `src/marketplace/service.rs`: Business logic layer for the shop and explore systems.
  - `src/marketplace/handlers.rs`: Actix-Web controllers for `GET /api/products` and `GET /api/products/{slug}`.
  - `src/marketplace/errors.rs`: Strongly-typed `MarketplaceError` domain enum.
- **Shop Frontend & Explore System (`web/src/app/(shop)`)**:
  - `web/src/app/(shop)/layout.tsx`: Shared authenticated shop layout.
  - `web/src/components/shop/navbar.tsx`: Global role-based Shop Navbar with dynamic actions (Upload/Dashboard for developers vs Cart for users).
  - `web/src/app/(shop)/explore/page.tsx`: Dynamic marketplace grid displaying all active boilerplate codes and SaaS templates.
  - `web/src/components/product/product-card.tsx`: Highly visual, interactive product thumbnail card component.
  - `web/src/app/(shop)/product/[slug]/page.tsx`: Immersive product details page featuring tech stack tags, rich descriptions, pricing, seller information, and checkout capabilities.
- **Zero-Client-ID Architecture & Stripe-Style Public IDs**:
  - Implemented `bs58` encoded opaque public IDs (`kd_usr_...`) for all users, completely hiding internal Database `UUID`s from frontend JSON responses and API payloads to prevent IDOR.
  - Modified Next.js `useProfile` hooks to request data via `/profile/me` instead of `/profile/${user.id}`.
- **Production-Grade Rust Authentication Engine (`src/auth`)**:
  - `src/auth/crypto.rs`: AES-256-GCM authenticated encryption/decryption with random 96-bit nonces, SHA-256 token hashing, and cryptographically secure random token generators.
  - `src/auth/service.rs`: Real Argon2id password hashing (64MB memory cost, 3 iterations), 15-minute JWT access token issuance, and Bank-Grade Token Family Rotation with automatic replay/theft detection.
  - `src/auth/repository.rs`: Parameterized SQLx queries for users, profiles, token family rotation, password resets, and OAuth account links.
  - `src/auth/middleware.rs`: Actix-Web request extractors with cryptographic Bearer JWT signature verification, developer and admin role guards.
  - `src/auth/handlers.rs`: Actix-Web controllers for registration, login, token refresh, `/me`, logout, password reset, and email verification.
  - `src/auth/errors.rs`: Strongly-typed `AuthError` domain enum.
  - `src/auth/models.rs`: Domain entities, JWT claims, and DTO structs.
- **Pluggable OAuth Provider System (`src/auth/oauth`)**:
  - `src/auth/oauth/github.rs`: GitHub OAuth authorization code exchange and verified email resolution.
  - `src/auth/oauth/google.rs`: Google OAuth authorization code exchange and userinfo fetching.
- **Next.js 16 Web Authentication Frontend (`web/src/app/(auth)`)**:
  - Full auth flow: login, register, developer-register, forgot-password, reset-password, verify pages.
  - `web/src/app/api/proxy/[...path]/route.ts`: Server-side SSRF-whitelisted proxy ensuring client browser never communicates directly with backend.
- **Enterprise Docker Infrastructure & PostgreSQL 16 Migrations (`docker/`)**:
  - 9 idempotent SQL migrations covering users, wallets, ledger, products, orders, escrow, tax, HQ RBAC, and platform configs.
  - `docker-compose.yml`: Single-command orchestration of PostgreSQL 16, Redis 7, SeaweedFS S3, Rust Core Engine, and Next.js Frontend.
  - SeaweedFS healthcheck fixed to use Master API port `9333`.
  - Dockerfile dependency caching fixed for projects with both `lib.rs` and `main.rs`.

### Changed
- **Deduplicated Next.js Authentication Utilities**: Centralized `setAuthCookie`, `clearAuthCookie`, and GitHub OAuth logic.

### Removed
- **Redundant Duplicate Directories & Files**: Removed root `sql/` directory and duplicate SVG assets.
