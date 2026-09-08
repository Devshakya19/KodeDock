# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed
- **Routing: `/browse` → `/explore`**: Corrected all middleware redirect rules so that authenticated buyers are redirected to `/explore` after login. Also restored accidentally deleted files across `src/marketplace/` and `web/src/app/(shop)/`.

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
