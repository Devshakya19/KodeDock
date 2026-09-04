# 🏪 KodeDock Creator Stores & Custom Storefront Engine

## Overview
The `store/` directory houses the domain architecture, schemas, and specifications for **Creator Storefronts (Vendor Shops)**. Every verified seller on KodeDock gets their own dedicated, branded shopfront (e.g. `kodedock.com/store/rohan-dev` or `kodedock.com/@rohan`).

---

## 🌟 Key Features of Creator Stores

1. **Custom Storefront URL:**
   - Standard: `https://kodedock.com/store/:seller_handle`
   - Vanity handle: `https://kodedock.com/@:seller_handle`
   - Custom domains (Future Pro Tier): `https://shop.rohandev.com`

2. **Custom Visual Branding:**
   - Custom Cover Banner (1200x300 WebP)
   - Creator Avatar & Verified Trust Badge
   - Custom Tagline & Markdown Bio
   - Connected Social Links (GitHub, Twitter/X, Discord, YouTube, Personal Portfolio)

3. **Curated Product Showcase:**
   - Featured / Pinned Products section
   - Store-specific category filters (e.g., Boilerplates, 3D Assets, Design Kits)
   - Store-level aggregate rating and verified buyer reviews

4. **Zero-Server-Load Architecture:**
   - **PostgreSQL B-Tree Index:** `idx_creator_stores_handle` fetches store metadata in **< 0.5 milliseconds**.
   - **Redis In-Memory Cache:** `kodedock:store:{handle}` caches store payloads with 10-minute TTL, serving millions of visits with zero database load.
   - **Next.js Edge SSR:** Pre-rendered HTML on CDN edges for 100/100 Google SEO.

---

## 🗄️ Database Table Reference (`creator_stores`)

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `UUID` | Primary Key |
| `seller_id` | `UUID` | Foreign Key to `users(id)` |
| `store_handle` | `VARCHAR(64)` | Unique URL handle (e.g. `rohan-dev`) |
| `store_name` | `VARCHAR(128)` | Display Name (e.g. `Rohan's Dev Studio`) |
| `tagline` | `VARCHAR(255)` | Short headline |
| `banner_storage_key`| `TEXT` | S3 public asset key for cover image |
| `social_links` | `JSONB` | Array/object of verified social URLs |
| `featured_product_ids`| `JSONB` | Ordered array of pinned product UUIDs |
| `total_sales_count`| `INT` | Aggregate sales count badge |
| `store_rating` | `NUMERIC(3,2)` | Lifetime store review rating (1.00 - 5.00) |
| `is_verified_creator`| `BOOLEAN` | Verified creator checkmark |
