# 🤝 Contributing to KodeDock

Thank you for your interest in contributing to **KodeDock**!  
KodeDock is an enterprise-grade, high-performance universal developer marketplace with zero-tolerance for mock functions or fragile implementations.

---

## ⚡ Non-Negotiable Directives (Read First)
Before writing any code, you must read and adhere strictly to:
1. **[AGENTS.md](AGENTS.md) & [AGENT.md](AGENT.md):** The Zero-Mock Law & 100% Real Code Mandate.
2. **[docs/RULES.md](docs/RULES.md):** Mandatory Fintech Integer Paise Invariants, Zero-Unwrap Crash-Free Rust Law, and Domain Encapsulation.
3. **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md):** Modular Domain Architecture and Container Topology.

---

## 🛠️ Development Setup & Workflow

### 1. Prerequisites
- **Docker Engine & Docker Compose** (v24.0+)
- **Rust Toolchain:** `rustc 1.80+` and `cargo`
- **Node.js:** `v20 LTS` or `v22` & `npm`

### 2. Local Environment Boot
```bash
# 1. Clone repository
git clone https://github.com/your-username/kodedock.git
cd kodedock

# 2. Setup environment variables
cp .env.example .env

# 3. Spin up PostgreSQL 16 (pgvector), Redis 7, SeaweedFS, and Mailpit
docker compose up -d postgres redis storage mailpit
```

---

## 🌿 Branching Strategy & Git Workflow

1. Create a feature branch from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   # or for bug fixes:
   git checkout -b fix/issue-description
   ```
2. Make atomic, well-tested commits following **Conventional Commits**:
   - `feat(fintech): implement 7-day escrow auto-release cron`
   - `fix(auth): handle token replay revocation on expired session`
   - `perf(storage): optimize 64kb streaming buffer in s3 service`
   - `docs(api): update openapi spec for product reviews`
   - `test(tax): add unit tests for section 194-o tds calculation`

---

## 🧪 Quality Assurance & Pre-Flight Checks

Before submitting a Pull Request, run the following verification suite:

### Backend (Rust):
```bash
# Format code
cargo fmt --all -- --check

# Run linter (zero warnings allowed)
cargo clippy --all-targets --all-features -- -D warnings

# Run all unit and integration tests
cargo test --workspace
```

### Frontend (Next.js):
```bash
cd apps/web
npm run lint
npm run typecheck
```

---

## 📋 Pull Request Checklist
- [ ] No fake mocks, dummy stubs, or hardcoded placeholders introduced.
- [ ] All financial math uses integer paise (`i64`) with zero floating-point arithmetic.
- [ ] No `.unwrap()` or `.expect()` calls in request handlers.
- [ ] Database queries are parameterized with SQLx (zero SQL injection risks).
- [ ] All unit tests pass cleanly.
- [ ] Documentation updated in `docs/` if new endpoints or schemas were introduced.
