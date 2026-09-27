# Changelog

All notable changes to the **KodeDock** platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
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

### Fixed
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
