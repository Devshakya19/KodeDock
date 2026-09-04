# 🤖 KODEDOCK AGENT DIRECTIVE & ENGINEERING BINDING CONTRACT (AGENTS.md)
**Document Version:** 2.1.0 (Upgraded Enterprise Edition)  
**Applies To:** All AI Coding Agents, Autonomous Pair Programmers, Subagents, and Human Developers  
**Binding Level:** MANDATORY & NON-NEGOTIABLE  

---

## ⚡ THE PRIME DIRECTIVE: ZERO MOCKS & 100% REAL IMPLEMENTATIONS

> [!CAUTION]
> **THE ZERO-MOCK LAW:**
> It is strictly forbidden to introduce fake implementations, mock functions, dummy stubs, hardcoded placeholders, or empty `// TODO: implement later` blocks anywhere in the production codebase.
> 
> **Every single feature, query, handler, security check, and background job must be 100% REAL, FUNCTIONAL, TESTED, AND PRODUCTION-GRADE.**

### Explicit Prohibitions:
1. ❌ **NO Mock Authentication:** Never return hardcoded JWTs, dummy user IDs (`"user_123"`), or fake sessions. All tokens must be cryptographically signed using real JWT keys, validated against real database sessions, and checked against real Redis revocation blacklists.
2. ❌ **NO Fake Password Hashing:** Never use plaintext passwords or dummy SHA-256 strings. Always execute real **Argon2id** hashing with 64MB memory cost and 3 iterations.
3. ❌ **NO Dummy Fintech / Balances:** Never hardcode wallet balances or simulate fake ledger credits. All money transactions must write real balanced Debit/Credit rows into the `ledger_entries` table inside real PostgreSQL ACID transactions with `SELECT ... FOR UPDATE` row locks.
4. ❌ **NO Fake Secret Scanning:** Never return a dummy `is_clean: true` response. Code scanning must execute real **Tree-Sitter AST parsing** and multi-threaded **Aho-Corasick Regex** pattern matching across actual uploaded files.
5. ❌ **NO Fake Git Cloner:** Never mock git repo cloning. The worker must execute real async Tokio child process cloning, branch verification, `.env` file sanitization, and real AES-256 encrypted ZIP packaging.
6. ❌ **NO Dummy S3 Uploads:** Never save uploaded files to local volatile memory or mock S3 responses. Always generate real **S3-compatible Presigned Multipart URLs** and stream chunks in 64KB buffers to SeaweedFS / Cloudflare R2.
7. ❌ **NO Mock Tax Deductions:** Always calculate real **1.0% Section 194-O TDS** and real **CGST/SGST/IGST** amounts in integer paise and generate real PDF invoices.

---

## 🏛️ THE 11 INVARIANT CODING PRINCIPLES

### 1. The Zero Floating-Point Currency Law (`i64` Integer Paise)
* Currency values (`base_price_paise`, `available_balance_paise`, `tds_amount_paise`, `platform_fee_paise`) must **ALWAYS be stored and computed as `BIGINT` (`i64`)**.
* Never use `f32`, `f64`, `float`, or `double`.
* $₹1.00 = 100\text{ Paise}$. $₹999.00 = 99900\text{ Paise}$.

### 2. Double-Entry Balanced Journaling
* Every financial transaction must insert balanced debit and credit entries such that:
  $$\sum \text{Debits} = \sum \text{Credits}$$
* Any transaction where debits do not equal credits must automatically abort and roll back.

### 3. Bank-Grade Token Family Rotation
* Access tokens expire in **15 minutes**.
* Refresh tokens are stored as SHA-256 hashes with a `family_id`.
* Every refresh consumes the current token and issues a new child token.
* **Replay Detection:** If an already-consumed token is presented, the agent must immediately revoke and delete the entire `family_id`, terminating all active user sessions and logging an auth audit alert.

### 4. Mandatory TOTP 2FA for High-Risk Actions
* Payout bank account modifications, UPI ID changes, and large withdrawals (> ₹10,000) require valid **RFC 6238 TOTP 2FA verification**.
* TOTP secret keys must be encrypted at rest with **AES-256-GCM**.

### 5. The Zero-`unwrap()` Crash-Free Rust Law
* ❌ **NEVER** use `.unwrap()` or `.expect()` in request handlers, actors, or background workers.
* ✅ **ALWAYS** use the `?` operator with typed domain errors returning `Result<T, AppError>`.

### 6. Bounded Queues & Backpressure (Zero OOM Spikes)
* All Tokio asynchronous channels must have fixed, bounded capacities (e.g. `tokio::sync::mpsc::channel(1024)`).
* Unbounded channels are strictly banned.

### 7. 64KB Chunked Streaming (Zero Server RAM Bottleneck)
* Never load large files (> 5MB) into server memory using `tokio::fs::read` or `std::fs::read`.
* Always stream files using **64KB chunks** (`AsyncReadExt::read_buf`) or generate direct Presigned S3 URLs so the Rust server consumes **0 MB RAM** during 10GB+ transfers.

### 8. Strict Domain Encapsulation (No Spaghetti Code)
* Every feature must live entirely within its isolated domain directory (`src/auth`, `src/marketplace`, `src/fintech`, `src/tax`, `src/storage`, `src/security`, `src/realtime`, `src/jobs`).
* `handlers.rs` only handles HTTP I/O.
* `service.rs` contains 100% of business logic.
* `repository.rs` contains parameterized SQLx queries.

### 9. Dynamic Basis-Point Platform Configs
* Platform commission, TDS rates, and gateway fees must **NEVER be hardcoded**.
* Always read from the `platform_configs` database table with Redis caching so admins can adjust fees dynamically from the Admin HQ control panel without recompiling code.

### 10. The All-in-One 1-Command Deployment Invariant
* The entire system must build and run seamlessly with a single command:
  ```bash
  docker compose up --build -d
  ```
* All PostgreSQL database migrations in `docker/migrations/` must be idempotent and auto-applied on container boot.

### 11. The Mandatory Auto-Changelog Law (`CHANGELOG.md`)
* 📝 **MANDATORY AUTOMATIC CHANGELOG UPDATES:**
  - Whenever ANY code, feature, bugfix, refactor, migration, configuration, or documentation change is made across the codebase, the AI agent / developer **MUST AUTOMATICALLY UPDATE `CHANGELOG.md`**.
  - Entries must follow the [Keep a Changelog](https://keepachangelog.com/) standard format under the appropriate category (`Added`, `Changed`, `Fixed`, `Security`, `Removed`).
  - No task or response is considered complete until `CHANGELOG.md` reflects all changes made.

---

## 📋 AGENT PRE-FLIGHT VERIFICATION CHECKLIST

Before any AI Agent or developer declares a task or feature complete, they must verify:
- [ ] Are all functions real implementations with zero mocks or dummy stubs?
- [ ] Is all currency arithmetic integer-only (`i64` paise) with zero floating-point math?
- [ ] Are all database queries parameterized with SQLx (zero SQL injection risks)?
- [ ] Are all database transactions modifying balances protected with `SELECT ... FOR UPDATE` row-level locks?
- [ ] Are all handlers free of `.unwrap()` and `.expect()` calls?
- [ ] Are all files streamed in 64KB buffers or S3 direct presigned URLs?
- [ ] Does `docker compose up -d` boot PostgreSQL, Redis, SeaweedFS, and the Rust backend without errors?
- [ ] **Has `CHANGELOG.md` been automatically updated with all changes made in this task?**
