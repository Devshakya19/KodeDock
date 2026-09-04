# KodeDock Ecosystem — Comprehensive Audit, Missing Features & Master Roadmap

This document serves as the **Master Engineering Roadmap** for the entire **KodeDock** platform, consolidating all architectural gaps, missing features, security items, and implementation priorities across all backend and frontend services.

---

## 🏛️ System-Wide Status Overview

```
KodeDock Platform
├── 🦀 core-engine/         ── Financial core & Auth (Missing: Refresh Tokens, Real Email Dispatch, 2FA)
├── ⚡ realtime-service/    ── WebSocket engine (Missing: Multi-Tab support fix, Wallet channels, Rooms)
├── 🐹 infra-worker/        ── Background automation (Missing: Real GitHub clone/push, DB sync, PDF Invoices)
├── 🧠 ai-service/          ── Semantic search (Missing: Vector embeddings, Recommendations, DB connection)
├── 🌐 web/ (Next.js)       ── Marketplace UI (Missing: Realtime balance hook, 2FA settings UI)
└── 🐘 postgres/            ── PostgreSQL 16 (Missing: refresh_tokens table, auth_audit_logs, 2fa_secrets)
```

---

## 📊 Master Service Audit & Priority Matrix

| Service | Component | Current State | Missing Feature / Fix Required | Priority |
| :--- | :--- | :---: | :--- | :---: |
| **`core-engine`** (Rust) | Authentication | 🟡 Partial | Refresh Token Rotation (`/api/auth/refresh`) | 🔴 **High** |
| **`core-engine`** (Rust) | Password Reset | 🟡 Partial | Real Transactional Email Dispatch (SMTP/Resend) | 🔴 **High** |
| **`core-engine`** (Rust) | Security & Fintech | ❌ Missing | Two-Factor Authentication (2FA / TOTP) | 🔴 **High** |
| **`core-engine`** (Rust) | User Verification | ❌ Missing | Email Verification flow on registration | 🟡 **Medium** |
| **`core-engine`** (Rust) | OAuth Providers | 🟡 Partial | Google OAuth 2.0 (`/api/auth/google`) | 🟡 **Medium** |
| **`realtime-service`** (Node.js) | Connection Mgmt | 🔴 Buggy | Multi-Tab / Multi-Device support (`Set<ws>`) | 🔴 **Critical** |
| **`realtime-service`** (Node.js) | Redis Channels | 🟡 Partial | `wallet_updates` & `payout_updates` channels | 🔴 **High** |
| **`realtime-service`** (Node.js) | Multiplexing | ❌ Missing | Topic & Room subscriptions (`order:id`, `dispute:id`) | 🟡 **Medium** |
| **`infra-worker`** (Go) | Repo Duplication | 🔴 Mock (`Sleep`) | Real GitHub API & `git clone/push` engine | 🔴 **Critical** |
| **`infra-worker`** (Go) | DB State Sync | ❌ Missing | PostgreSQL connection & Order delivery status sync | 🔴 **Critical** |
| **`infra-worker`** (Go) | File Storage | ❌ Missing | SeaweedFS S3 `.zip` archive extraction | 🔴 **High** |
| **`infra-worker`** (Go) | Invoicing | 🔴 Mock (`Sleep`) | Real PDF Invoice generator (`maroto`) | 🟡 **Medium** |
| **`ai-service`** (Python) | Code Search | 🔴 Empty `TODO` | Semantic Vector Search (Sentence-Transformers/Gemini) | 🔴 **Critical** |
| **`ai-service`** (Python) | Recommendations | 🔴 Empty `TODO` | Tech-stack affinity & Collaborative filtering | 🔴 **Critical** |
| **`ai-service`** (Python) | Database | ❌ Missing | PostgreSQL connection (`asyncpg`) to fetch products | 🔴 **Critical** |
| **`ai-service`** (Python) | Analytics | 🔴 Empty `TODO` | Search demand analytics & Zero-result query tracker | 🟡 **Medium** |

---

## 🗺️ Master Engineering Roadmap (Step-by-Step)

### 🚩 Phase 1: Core Functionality & Mock Elimination
1. **`infra-worker`:** Replace all `time.Sleep()` mock logic with real GitHub API repository duplication and PostgreSQL order delivery updates.
2. **`realtime-service`:** Fix multi-tab disconnect bug by replacing `Map<userId, ws>` with `Map<userId, Set<ws>>` and adding `wallet_updates` channel.
3. **`ai-service`:** Connect `ai-service` to PostgreSQL via `asyncpg` and implement Hybrid Full-Text + Keyword search.

### 🚩 Phase 2: Production Security & Email Dispatch
1. **`core-engine`:** Implement Refresh Token rotation (`refresh_tokens` table + `/api/auth/refresh`).
2. **`core-engine` & `worker`:** Integrate Resend / SMTP for real Password Reset emails and PDF Invoice attachments.
3. **`core-engine`:** Add Email Verification requirement for seller listings and buyer checkouts.

### 🚩 Phase 3: Fintech Hardening & AI Intelligence
1. **`core-engine`:** Add RFC 6238 TOTP 2FA for seller payouts and wallet withdrawals.
2. **`ai-service`:** Integrate Vector Embeddings (`all-MiniLM-L6-v2` / Gemini) for natural language semantic code search.
3. **`core-engine`:** Add Google OAuth 2.0 provider support alongside GitHub.

---

## 📁 Individual Service Detailed Documents
- 🦀 [`services/core-engine/MISSING.md`](services/core-engine/MISSING.md) — Auth & Core Engine Deep-Dive
- ⚡ [`services/realtime-service/MISSING.md`](services/realtime-service/MISSING.md) — Realtime & WebSocket Deep-Dive
- 🐹 [`services/infra-worker/MISSING.md`](services/infra-worker/MISSING.md) — Worker & GitHub Duplication Deep-Dive
- 🧠 [`services/ai-service/MISSING.md`](services/ai-service/MISSING.md) — AI & Semantic Search Deep-Dive
