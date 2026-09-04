# 📜 KodeDock Engineering & Architectural Rules (RULES.md)
**Document Version:** 1.0.0  
**Status:** Mandatory Engineering Standard  
**Applies To:** All Engineers, Contributors, AI Coding Agents & Code Reviewers  

---

## 🏛️ Purpose of This Document
This document defines the **Non-Negotiable Engineering Rules, Invariants, and Coding Standards** for the KodeDock codebase. Every line of code added to this repository must strictly adhere to these rules to guarantee:
1. **Financial Integrity & Zero Double-Spending**
2. **Bank-Grade Security & Zero Vulnerabilities**
3. **Zero Server Crash & Low-Memory Efficiency**
4. **Clean, Modular, Self-Contained Domain Architecture**

---

## 💳 Rule 1: Fintech & Financial Ledger Invariants

### 1.1 The Zero Floating-Point Law
* ❌ **FORBIDDEN:** Never use `f32`, `f64`, `float`, or `double` for prices, escrow balances, fees, TDS taxes, or payouts.
* ✅ **MANDATORY:** Always use integer **Paise / Cents** (`i64` in Rust, `BIGINT` in PostgreSQL).
  - $₹1.00 = 100\text{ Paise}$
  - $\$1.00 = 100\text{ Cents}$
  - Example: `base_price_paise: i64 = 49900; // ₹499.00`

### 1.2 Double-Entry Journal Invariant
* Every monetary transaction MUST insert balanced debit and credit rows into `ledger_entries`.
* The platform invariant must always hold:
  $$\sum \text{Debits} - \sum \text{Credits} = 0$$

### 1.3 Atomic Row-Level Locking on Balances
* Balance modifications (checkout, escrow release, refund, withdrawal) must ALWAYS be wrapped in an explicit SQL transaction with row-level locks:
  ```sql
  SELECT id, available_balance_paise, pending_escrow_paise 
  FROM user_accounts 
  WHERE user_id = $1 
  FOR UPDATE;
  ```

### 1.4 Webhook Idempotency
* Webhooks from payment gateways (Razorpay, Stripe) must be verified via HMAC-SHA256 signature and recorded in `webhook_events(provider, event_id)` with a database unique constraint. Duplicate webhook deliveries must return `HTTP 200 OK` immediately without re-executing ledger operations.

---

## 🔐 Rule 2: Security & Authentication Rules

### 2.1 Password Security
* Passwords must NEVER be logged, transmitted in plaintext, or hashed with MD5/SHA256/Bcrypt.
* Passwords must ALWAYS be hashed using **Argon2id** (64MB memory, 3 iterations, 4 parallelism).

### 2.2 Short-Lived Access Tokens & Refresh Rotation
* Access JWTs must expire within **15 minutes**.
* Refresh tokens must follow **Token Family Rotation**:
  - Each refresh token can be used exactly **once**.
  - If a consumed token is presented again (indicating token replay/theft), the entire token family must be **purged immediately**, revoking all active sessions for that user.

### 2.3 Two-Factor Authentication (TOTP 2FA)
* Payout bank account changes, UPI ID updates, and large withdrawals (> ₹10,000) **require mandatory TOTP 2FA verification (RFC 6238)**.
* TOTP secrets in the database must be encrypted with **AES-256-GCM**.

### 2.4 Rate Limiting & Anti-Brute Force
* All public HTTP endpoints must be protected with rate limiting (`actix-governor`).
* General endpoints: Maximum 100 requests/minute per IP.
* Auth endpoints (`/login`, `/signup`, `/refresh`): Maximum 10 requests/minute per IP.

---

## 🦀 Rule 3: Zero-Crash & Rust Best Practices

### 3.1 The Zero-`unwrap()` Law
* ❌ **FORBIDDEN:** Never use `.unwrap()` or `.expect()` in request handlers, background jobs, or production code paths.
* ✅ **MANDATORY:** Always propagate errors using the `?` operator and return typed domain errors (`Result<T, AppError>`).

### 3.2 Bounded Asynchronous Queues
* ❌ **FORBIDDEN:** Unbounded channels (`tokio::sync::mpsc::unbounded_channel()`) are banned because traffic spikes can cause Out-Of-Memory (OOM) crashes.
* ✅ **MANDATORY:** Always use bounded channels with fixed capacity (e.g., `tokio::sync::mpsc::channel(1024)`).

### 3.3 Zero-Memory File Streaming (64KB Chunks)
* Never load large files (> 5MB) into server RAM with `std::fs::read` or `tokio::fs::read`.
* Always use **64KB streaming buffers** (`AsyncReadExt::read_buf`) or **S3 Presigned Direct Uploads/Downloads**.

---

## 📁 Rule 4: Clean Modular Domain Architecture

### 4.1 Strict Domain Encapsulation
Every backend feature must live in its dedicated domain module under `src/`:
```text
src/
├── auth/           # Identity, JWT, Token Family Rotation, TOTP 2FA
├── marketplace/    # Products, Versions, pgvector Semantic Search
├── fintech/        # 7-Day Escrow, Double-Entry Ledger, Webhooks
├── tax/            # 1% TDS (Sec 194-O), GST Calculation, PDF Invoices
├── storage/        # Presigned S3 Tickets, Vault DRM, Streaming
├── security/       # Tree-Sitter AST & Secret Leak Scanner
├── realtime/       # Tokio Async WebSockets (Chat, Notifications)
└── jobs/           # Tokio Distributed Cron Schedulers
```

### 4.2 Layer Responsibilities:
1. **`handlers.rs`:** Only parses incoming HTTP requests, checks permissions, calls service functions, and formats HTTP responses. **Zero business logic.**
2. **`service.rs`:** Contains 100% of business logic, validations, calculations, and domain orchestrations.
3. **`repository.rs`:** Contains SQLx database queries. **No raw string queries with `format!()` (prevents SQL injection).**
4. **`models.rs`:** Contains pure Rust structs and serde serialization definitions.

---

## 💾 Rule 5: Multi-Asset Storage & Security

### 5.1 Bucket Separation
* **Public Bucket (`kodedock-public-assets`):** Avatars, thumbnails, video previews, public markdown documentation. Cached globally via CDN.
* **Vault Bucket (`kodedock-vault-deliverables`):** Paid deliverables (ZIPs, `.blend`, `.obj`, game packs). **Private by default, AES-256 encrypted at rest.**

### 5.2 Paid Download Protection
* Deliverables can **NEVER** have public read access.
* Downloads are only permitted via **15-minute temporary presigned URLs** generated after verifying database purchase ownership and active buyer session.

---

## ⚖️ Rule 6: Tax & Compliance Rules

### 6.1 Indian Section 194-O TDS
* Exactly **1.0% TDS** must be deducted on the gross transaction amount for Indian resident creators.
* Seller PAN card number must be recorded and validated using regex format `[A-Z]{5}[0-9]{4}[A-Z]{1}`.

### 6.2 Goods & Services Tax (GST)
* Intrastate sales: 9% CGST + 9% SGST.
* Interstate sales: 18% IGST.
* Export sales: 0% Zero-rated GST.
* System must generate a sequentially numbered PDF tax invoice for every order.

---

## 🌐 Rule 7: Web Frontend & UI Standards

### 7.1 Server Components for SEO
* Public marketplace pages (`/`, `/explore`, `/p/[slug]`) must use Next.js **Server Components (SSR)** to guarantee 100/100 Google Lighthouse SEO scores.

### 7.2 Client Component Discipline
* `'use client'` must only be used when stateful browser interactivity is strictly required (Monaco Editor, WebContainers VM, Three.js 3D Canvas, Realtime WebSockets).

### 7.3 Accessibility & Design
* All UI components must use **Shadcn UI (Radix Primitives)** with full keyboard navigation (`Tab`, `Esc`, `Enter`), ARIA attributes, and dark-mode support.

---

## 🚀 Rule 8: Deployment & Container Discipline

### 8.1 The 1-Command Deployment Invariant
* The entire platform must always be deployable via:
  ```bash
  docker compose up --build -d
  ```
* PostgreSQL migrations in `docker/migrations/` must be idempotent and apply automatically on initial container boot without requiring manual developer intervention.
