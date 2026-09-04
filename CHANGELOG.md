# 📝 Changelog

All notable changes to **KodeDock** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-09-04

### Added
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
