# 🤖 .agents/rules.md: AGENT CODING & ARCHITECTURE STANDARD

## 1. Zero Mocks & 100% Real Code Mandate
- No stubs, no fake data, no dummy mocks (`mock_payment()`, `fake_token()`), no empty `// TODO` blocks.
- Real Argon2id password hashing + 15m JWT + 7-Day Refresh Token Family Rotation.
- Real RFC 6238 TOTP 2FA with AES-256-GCM encrypted database secrets.
- Real Tree-Sitter AST & Regex secret scanner.
- Real Tokio async child process git cloner.
- Real double-entry integer paise (`i64`) ledger with `SELECT ... FOR UPDATE` row locks.
- Real 1% Section 194-O TDS & GST tax calculation.
- Real S3 direct presigned multipart uploads & 64KB chunked streaming.

## 2. Crash-Free Rust Architecture
- Zero `.unwrap()` or `.expect()` in request paths. Always use `?` with `Result<T, AppError>`.
- Bounded async queues (`tokio::sync::mpsc::channel(1024)`).
- Domain-isolated modules under `src/` (`auth/`, `marketplace/`, `fintech/`, `tax/`, `storage/`, `security/`, `realtime/`, `jobs/`).

## 3. Dynamic Configuration
- Commission & fees must be loaded from `platform_configs` table with Redis caching.

## 4. Single-Command Deployment
- `docker compose up --build -d` must launch Postgres 16 (pgvector), Redis 7, SeaweedFS S3, Rust Engine, and Caddy.

## 5. Mandatory Auto-Changelog Updates
- Every task, feature, fix, or codebase modification MUST automatically update `CHANGELOG.md` following Keep a Changelog standard.
