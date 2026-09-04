# 📑 KodeDock Product Requirements Document (PRD)
**Document Version:** 1.0.0  
**Status:** Approved / Base Architecture  
**Target Platform:** High-Scale Universal Digital Marketplace & Escrow Platform  
**Target Scale:** 5,000,000+ (5M+) Concurrent Users | Zero Server Crash  
**Author / Architect:** DeepMind Advanced Engineering Team & Lead Architect  

---

## 1. Executive Summary & Vision

### 1.1 Product Vision
**KodeDock** is the next-generation, high-performance **Universal Digital Marketplace and Escrow Platform** for developers, designers, and creators. It enables creators to list, monetize, and distribute digital developer assets—including full-stack codebases, GitHub repositories, 3D Blender/Game assets, UI kits, design systems, and developer documentation—with:
1. **Bank-Grade Financial Escrow:** 7-day automated escrow hold protecting buyers against broken or malicious deliverables.
2. **Zero Floating-Point Financial Ledger:** 100% integer paise (`i64`) double-entry accounting.
3. **Automated Indian & Global Tax Compliance:** 1% Section 194-O TDS deduction, automated quarterly TDS certificates, and automated GST B2B/B2C invoicing.
4. **Zero-Server-Load Interactive Sandboxes:** In-browser WebAssembly WebContainers (`@webcontainer/api`) and 3D `<model-viewer>` previews eliminating server compute costs.
5. **Zero-Egress Multi-Asset Storage:** S3-compatible direct presigned uploads for files from 1 KB to 50 GB with zero server RAM bottlenecks.
6. **AST-Level Code Security:** Real-time secret and backdoor detection before code is published.
7. **All-in-One Single-Command Docker Deployment:** 100% of the platform (Database, Cache, S3 Storage, Backend, Frontend, and Auto-SSL) spins up in 1 command (`docker compose up --build -d`).

---

## 2. Target Personas & Use Cases

```mermaid
graph TD
    Buyer["🧑‍💻 1. The Buyer (Developer / Agency / Studio)"]
    Seller["👨‍🎨 2. The Seller (Indie Hacker / 3D Artist / Dev)"]
    Admin["🛡️ 3. The Platform Admin & Compliance Officer"]

    Buyer -->|Browses, Tests in Sandbox, Buys via Escrow| KD["KodeDock Core Engine"]
    Seller -->|Uploads 10GB Assets, Connects GitHub, Receives Payouts| KD
    Admin -->|Resolves Disputes, Audits Ledger, Verifies TDS Tax| KD
```

### 2.1 Persona 1: The Buyer (Developer / Agency / Studio)
- **Pain Points:** Fear of buying abandoned, buggy, or malicious code; inability to test code before buying; complicated licensing.
- **KodeDock Solution:**
  - In-browser live interactive sandbox (run the app before purchase).
  - 360° interactive 3D model viewer for Blender/OBJ assets.
  - 7-Day Escrow Protection (funds held safely until deliverable is verified).
  - One-click cryptographic Ed25519 license activation key.

### 2.2 Persona 2: The Seller (Indie Creator / Engineer / 3D Artist)
- **Pain Points:** High platform commissions (30%+); complex tax filings (TDS/GST); chargeback fraud; repository piracy.
- **KodeDock Solution:**
  - Fair marketplace take-rate (5% - 10%).
  - Multi-asset support (ZIPs, GitHub repos, Blender `.blend`, FBX, Markdown, Figma kits).
  - Automatic 1% TDS deduction under Section 194-O with automated PDF tax invoices.
  - Automated pre-publish security scanning (prevents accidental API key / credential leaks).
  - Instant payouts to Bank (UPI / IMPS / NEFT) or Global Stripe/Crypto accounts after 7-day escrow clearance.

### 2.3 Persona 3: Platform Administrator & Compliance Auditor
- **Pain Points:** Manual dispute moderation, financial discrepancies, tax audit penalties.
- **KodeDock Solution:**
  - Real-time dispute resolution console with buyer-seller chat transcripts and file diff inspections.
  - Double-entry ledger audit trail (Debit = Credit balance invariant).
  - Automated GST reports and quarterly Section 194-O TDS ledger export.

---

## 3. Technology Stack & Architectural Principles

| Layer | Technology | Rationale & Architectural Rule |
| :--- | :--- | :--- |
| **Backend Core** | **Rust (Actix-Web 4, Tokio, SQLx 0.8)** | Zero Garbage Collection (GC), compile-time memory safety, sub-1ms response times, handles 500k+ WebSockets with <50MB RAM. |
| **Database** | **PostgreSQL 16 with `pgvector`** | ACID financial integrity, row-level locking (`FOR UPDATE`) to eliminate race conditions, microsecond HNSW cosine vector search. |
| **Cache & Pub/Sub** | **Redis 7 (Alpine)** | Token blacklist, sliding-window rate limiting, distributed lock (`Redlock`), real-time pub/sub backplane. |
| **Object Storage** | **SeaweedFS / Cloudflare R2 (S3 API)** | Self-hosted S3 storage (Oracle Free Tier 200GB mounted), zero egress fees, direct multipart presigned streaming. |
| **Frontend UI** | **TypeScript (Next.js 15 App Router, Tailwind)** | Server-side rendering (SSR) for SEO, React 19, responsive Seller Studio and Admin HQ. |
| **Client Sandbox** | **WebContainers (`@webcontainer/api`) & Three.js** | Runs full Node.js/React apps directly in the user's browser WebAssembly (₹0 backend CPU cost). |
| **Reverse Proxy** | **Caddy Server** | Automated Let's Encrypt SSL/TLS certificates, HTTP/2 & HTTP/3 support, WebSocket multiplexing. |

---

## 4. Core Functional Pillars & System Requirements

### Pillar 1: Identity, Auth & Bank-Grade Security
* **Access Tokens:** Short-lived JWTs (15 minutes expiry) signed with HMAC-SHA256 / Ed25519.
* **Refresh Token Family Rotation:** Long-lived tokens (7 days). On every refresh, the old token is invalidated and a new family child is issued. If a revoked token is reused (token theft), the entire family is immediately purged and all user sessions are terminated.
* **TOTP 2FA (RFC 6238):** Mandatory for seller payout method changes, bank account modifications, and high-value admin actions.
* **Password Hashing:** Argon2id with 64MB memory cost and 3 iterations (OWASP recommended).
* **OAuth 2.0:** One-click social login via GitHub and Google.
* **Rate Limiting:** Leaky-bucket algorithm via `actix-governor` (100 req/min general, 10 req/min for auth endpoints).

### Pillar 2: Universal Multi-Asset Marketplace
* **Product Catalog:** Supports 6 primary asset formats:
  1. *Full Codebases & Boilerplates* (Next.js, Flutter, Rust, Python, Go, etc.)
  2. *3D Game Assets & Models* (`.blend`, `.obj`, `.fbx`, `.gltf`)
  3. *UI & Design Kits* (Figma tokens, Sketch, Adobe XD)
  4. *Documentation & E-Books* (Markdown collections, PDF guides)
  5. *APIs & Microservices* (Dockerized templates, OpenAPI specs)
  6. *GitHub Synchronized Repositories* (Auto-packaging & release sync)
* **AI Semantic Search:** Integrated `pgvector` index generating 1536-dimensional embeddings for product titles, descriptions, and tags. Microsecond vector cosine similarity search.
* **Product Versioning:** Semantic versioning (e.g., `v1.0.0`, `v1.1.0`) with changelogs and diff tracking.

### Pillar 3: Interactive In-Browser Sandboxes & 3D Viewers
* **WebContainers Execution:** When a user previews a JavaScript/TypeScript/Node.js project, the code boots inside browser WebAssembly via `@webcontainer/api`. No backend Docker containers are required.
* **3D Interactive Mesh Viewer:** Renders interactive 3D `.glb` previews in the browser with 360° rotation, wireframe toggle, and zoom.
* **Markdown Live Reader:** Syntax-highlighted documentation renderer with search.

### Pillar 4: Fintech, Double-Entry Ledger & 7-Day Escrow
* **Float-Free Accounting:** Every amount (price, fee, TDS, balance) is stored as an integer `BIGINT` representing **Paise / Cents** (`100 Paise = ₹1.00`).
* **Double-Entry Journal:** Every financial transaction creates balanced Debit and Credit entries:
  $$\sum \text{Debits} = \sum \text{Credits}$$
* **7-Day Escrow State Machine:**
  ```text
  [Created] ──► [Paid / Held in Escrow] ──► (7 Days Pass / Buyer Approves) ──► [Released to Seller Balance]
                         │
                         ▼ (Buyer Raises Dispute)
                   [Disputed] ──► (Admin Approves Refund) ──► [Refunded to Buyer]
  ```
* **Webhook Idempotency:** Razorpay and Stripe webhook handlers verify HMAC signatures and enforce database uniqueness on `event_id` to guarantee zero double-crediting.

### Pillar 5: Indian & Global Tax Compliance
* **Section 194-O TDS Deduction (Indian Income Tax):**
  - Deducts exactly 1% TDS on the gross sales value for Indian resident sellers.
  - Automatically records seller PAN card numbers and tracks quarterly aggregations.
* **GST Calculation Engine:**
  - Intrastate (Seller & Buyer in same state): 9% CGST + 9% SGST.
  - Interstate (Seller & Buyer in different states): 18% IGST.
  - Export (Overseas Buyer): 0% Zero-rated GST.
* **Automated PDF Invoicing:** Generates compliant tax invoices with GSTIN, invoice serial numbers, HSN/SAC codes, and digital signature metadata.

### Pillar 6: Multi-Tier S3 Storage & Direct Streaming
* **Zero-Server-Load Uploads:** Frontend requests an upload ticket; Rust generates a **Presigned S3 Multipart Upload URL**. Files up to 50 GB stream directly from the user to SeaweedFS / Cloudflare R2.
* **Private Vault Storage:** Paid deliverables are stored in private S3 buckets with server-side encryption (`AES-256`).
* **15-Minute Signed Downloads:** Paid buyers receive a temporary cryptographic download link valid for 15 minutes.
* **Chunked Streaming in Rust:** Any backend-routed file operations stream in 64KB buffers to prevent RAM exhaustion.

### Pillar 7: Code Security & AST Secret Scanner
* **Tree-Sitter AST Analysis:** Scans code files for dangerous execution patterns (`eval`, un-sanitized shell execution, malicious obfuscation).
* **High-Speed Regex & Aho-Corasick:** Scans for:
  - Leaked AWS Access Keys / Secret Keys (`AKIA...`)
  - Stripe Secret Keys (`sk_live_...`)
  - Private RSA / SSH Keys (`-----BEGIN RSA PRIVATE KEY-----`)
  - Database connection strings with passwords (`postgres://...`)
  - GitHub Personal Access Tokens (`ghp_...`)
* **Pre-Publish Gate:** Products containing unmasked secrets are rejected with line-numbered error reports.

### Pillar 8: Software DRM & Cryptographic Licensing
* **Ed25519 License Engine:** Generates asymmetric cryptographic license keys containing `(productId, buyerId, licenseTier, issuedAt, expiresAt)`.
* **Offline Verification:** Buyers can verify their license offline in their own software using the KodeDock public key without hitting the server.
* **License Tiers:**
  - *Standard License:* Single commercial project.
  - *Extended / Agency License:* Unlimited commercial projects / multi-seat.
  - *Full Ownership / IP Transfer:* Exclusive rights buyout.

### Pillar 9: Real-time Communication & WebSockets
* **Tokio WebSockets:** Async connection pool supporting 500k+ concurrent connections per server node.
* **Features:**
  - Real-time Dispute Resolution Chat with file attachments.
  - Instant Push Notifications (sale completed, escrow released, comment added).
  - Live Product Viewers & Purchase Toasts.

### Pillar 10: Anti-Fraud & User Behavior Velocity
* **Card Testing Protection:** Blocks accounts exceeding 5 failed payment attempts within 10 minutes.
* **Payout Lockout:** Enforces a mandatory **24-hour freeze** and TOTP 2FA re-authentication if a seller changes their payout bank details or UPI ID.
* **Device Fingerprinting:** Hashes client user-agent, IP subnet, and TLS cipher suites to detect multi-account bot fraud.

### Pillar 11: Distributed Cron Jobs & Background Workers
* **Tokio Async Scheduler:** In-process distributed scheduler utilizing Redis `Redlock`.
* **Automated Jobs:**
  1. *Escrow Auto-Release:* Runs every 15 minutes; auto-releases escrow for orders older than 7 days with no active dispute.
  2. *Expired Token Purge:* Runs daily at midnight; deletes revoked refresh tokens older than 30 days.
  3. *Abandoned Cart Reminder:* Runs every 6 hours; sends recovery email for items in cart > 24 hours.
  4. *Daily Tax Reconciliation:* Aggregates daily 1% TDS ledger for statutory reporting.

### Pillar 12: Observability & Health Monitoring
* **Prometheus Metrics:** `/metrics` endpoint exporting:
  - `http_requests_total{status, endpoint}`
  - `http_request_duration_seconds{p50, p95, p99}`
  - `active_websocket_connections`
  - `db_pool_connections_active`
  - `escrow_volume_paise_total`
* **Structured JSON Logging:** `tracing` crate with correlation IDs (`x-request-id`) injected into every log entry and HTTP response header.

---

## 5. Database Schema & Architecture Overview

```mermaid
erDiagram
    USERS ||--o{ REFRESH_TOKENS : has
    USERS ||--o{ TOTP_SECRETS : configures
    USERS ||--o{ PRODUCTS : sells
    USERS ||--o{ ORDERS : buys
    PRODUCTS ||--o{ PRODUCT_VERSIONS : releases
    PRODUCTS ||--o{ PRODUCT_ASSETS : contains
    ORDERS ||--|| ESCROW_TRANSACTIONS : holds
    ESCROW_TRANSACTIONS ||--o{ LEDGER_ENTRIES : journals
    ORDERS ||--o{ TAX_INVOICES : generates
    ORDERS ||--o{ DISPUTES : raises
    DISPUTES ||--o{ DISPUTE_MESSAGES : contains

    USERS {
        uuid id PK
        varchar email UK
        varchar password_hash
        varchar full_name
        varchar role
        varchar pan_number
        varchar gst_number
        boolean email_verified
        timestamp created_at
    }

    PRODUCTS {
        uuid id PK
        uuid seller_id FK
        varchar title
        varchar slug UK
        text description
        varchar asset_type
        bigint base_price_paise
        vector embedding_1536
        boolean is_published
        timestamp created_at
    }

    ORDERS {
        uuid id PK
        uuid buyer_id FK
        uuid product_id FK
        uuid version_id FK
        bigint gross_amount_paise
        bigint tds_amount_paise
        bigint gst_amount_paise
        bigint net_seller_paise
        varchar currency
        varchar payment_provider
        varchar payment_intent_id UK
        varchar status
        timestamp created_at
    }

    ESCROW_TRANSACTIONS {
        uuid id PK
        uuid order_id FK UK
        uuid seller_id FK
        uuid buyer_id FK
        bigint amount_paise
        varchar status
        timestamp release_due_at
        timestamp released_at
        timestamp created_at
    }

    LEDGER_ENTRIES {
        uuid id PK
        uuid transaction_id
        uuid account_id
        varchar entry_type
        bigint amount_paise
        varchar description
        timestamp created_at
    }
```

---

## 6. Non-Functional Requirements (NFR)

1. **Performance & Latency:**
   - Public API endpoints: P95 latency `< 5ms`, P99 latency `< 15ms`.
   - Vector semantic search: P95 latency `< 10ms`.
   - Cold-start time of Rust backend container: `< 500ms`.
2. **Scalability & Concurrency:**
   - 5,000,000 registered users.
   - 50,000 simultaneous active WebSocket connections per node.
   - 5,000 checkout requests per second during flash sales.
3. **High Availability & Fault Tolerance:**
   - 99.99% system availability.
   - Zero data loss (PostgreSQL streaming WAL replication + multi-disk backup).
   - Graceful backpressure handling (Tokio bounded channels prevent OOM crashes).
4. **Security & Compliance:**
   - OWASP Top 10 compliance (Zero SQLi, XSS, CSRF, or SSRF vulnerabilities).
   - Strict CORS policy and security headers (`HSTS`, `X-Content-Type-Options`, `Content-Security-Policy`).
   - AES-256 encryption at rest for all deliverables and sensitive credentials.

---

## 7. Deployment & DevOps Architecture

KodeDock provides an **All-in-One single-command deployment** via Docker Compose:

```text
kodedock/
├── .env.example
├── Cargo.toml
├── docker/
│   ├── docker-compose.yml       # 1-Click All-in-One Orchestration
│   ├── Dockerfile.backend       # Multi-stage ultra-light Rust container (<35MB)
│   ├── Caddyfile                # Auto-SSL & Reverse Proxy
│   └── migrations/              # Auto-applied PostgreSQL migrations
│       ├── 001_auth_security.sql
│       ├── 002_marketplace_products.sql
│       ├── 003_fintech_escrow_ledger.sql
│       ├── 004_tax_tds_compliance.sql
│       └── 005_storage_and_drm.sql
└── src/                         # Modular Rust Domain Codebase
```

### Launch Command:
```bash
docker compose up --build -d
```

---

## 8. Milestone & Execution Roadmap

* **Milestone 1 (Foundation & Schemas):** Docker Compose setup, Caddy reverse proxy, and all 5 SQL migrations.
* **Milestone 2 (Rust Core Engine Scaffold):** Cargo workspace, configuration loader, database pool, Redis client, S3 client, error handlers, and middleware.
* **Milestone 3 (Bank-Grade Auth & Security):** 15m JWT, Token Family Rotation, TOTP 2FA, OAuth, and Argon2id password hashing.
* **Milestone 4 (Fintech & 7-Day Escrow):** Double-entry integer paise ledger, payment webhooks, dispute workflow, and automated release crons.
* **Milestone 5 (Universal Multi-Asset & S3 Engine):** Direct multipart upload tickets, private vault encryption, 15-minute download tokens, and `pgvector` semantic search.
* **Milestone 6 (Tax & Compliance):** 1% Section 194-O TDS deduction, GST calculations, and automated PDF tax invoices.
* **Milestone 7 (AST Secret Scanner & DRM):** Tree-sitter AST scanning, regex secret detection, and Ed25519 cryptographic license generator.
* **Milestone 8 (Realtime WebSockets & Observability):** Tokio WebSockets, chat/notifications, Prometheus `/metrics`, and Grafana dashboards.
* **Milestone 9 (Frontend & WebContainers UI):** Next.js 15 Marketplace Storefront, Seller Studio, Admin HQ, and in-browser code execution.
