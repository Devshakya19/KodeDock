# Contributing to KodeDock

Thank you for your interest in contributing to **KodeDock**! We are building the open, verified marketplace for production codebases, software architectures, and developer tooling backed by Ed25519 cryptographic licensing.

Before submitting code, please read this document and our [Code of Conduct](CODE_OF_CONDUCT.md) carefully to ensure a smooth contribution process.

---

## 1. Core Engineering Mandates

> [!CAUTION]
> **ABSOLUTELY ZERO MOCK DATA & 100% REAL POSTGRESQL DATABASE**
> Contributions containing hardcoded mock arrays (`mockProducts`, `dummyUsers`), placeholder images (`via.placeholder.com`), or dummy text ("Lorem Ipsum") will be rejected immediately. Every single UI component across all apps must be powered by parameterized queries to our real PostgreSQL database schema.

1. **Zero Mock Arrays or Toy Fixtures**: All data must flow through backend API gateway routes (`api/`) connected to PostgreSQL.
2. **Financial Precision in Paise**: Monetary values are stored as **integers in paise (INR)** (e.g. ₹999 is stored as `99900`) to completely eliminate floating-point rounding errors.
3. **Typography & Design Token Fidelity**:
   - Headings & Hero: **`Clash Display`**
   - UI, Body & Forms: **`Satoshi`**
   - Code, Terminal & Licenses: **`Azeret Mono`**
   - Palette: 60% Obsidian Black (`#090A0F`), 30% Deep Graphite (`#12131A`), 10% Electric Purple (`#8B5CF6`) / Cyber Cyan (`#38BDF8`).

---

## 2. Monorepo Architecture

KodeDock is organized as a high-performance **Turborepo** monorepo managed with **pnpm workspaces**:

```
kodedock/
├── api/                    # Secure Node.js HTTP API Gateway & RBAC Router (Port 4000)
├── apps/
│   ├── portal/             # Buyer Developer Dashboard (Port 3002)
│   ├── store/              # Public Marketplace & Explore Catalog (Port 3003)
│   ├── studio/             # Creator & Seller Dashboard (Port 3001)
│   └── www/                # Marketing & Central Auth Hub (Port 3000)
├── docker/                 # Containerized Infrastructure & docker/schema.sql
├── packages/
│   ├── auth/               # Unified frontend Better Auth client
│   ├── types/              # Monorepo TypeScript definitions & interfaces
│   └── ui/                 # Design tokens and shared UI primitives
└── src/                    # Core Backend Domain Logic, PostgreSQL models & Ed25519 Licensing
```

---

## 3. Local Development Setup

### Prerequisites
- **Node.js**: `v20.x` or `v22.x` (LTS recommended)
- **pnpm**: `v10.x` or `v11.x` (`corepack enable && corepack prepare pnpm@latest --activate`)
- **Docker & Docker Compose**: For local PostgreSQL and Redis

### Step-by-Step Setup

1. **Fork and Clone the Repository**:
   ```bash
   git clone https://github.com/<your-username>/kodedock.git
   cd kodedock
   ```

2. **Install Workspace Dependencies**:
   ```bash
   pnpm install --frozen-lockfile
   ```

3. **Configure Environment Variables**:
   Copy the example environment configuration:
   ```bash
   cp .env.example .env
   ```

4. **Start PostgreSQL Container**:
   ```bash
   pnpm run db:up
   ```
   *This launches PostgreSQL 16 on port `5432` with automatic database initialization via `docker/schema.sql`.*

5. **Verify Database Initialization**:
   Ensure tables are created properly:
   ```bash
   docker exec -it kodedock-postgres psql -U kodedock -d kodedock_db -c "\dt"
   ```

6. **Start All Services in Development Mode**:
   ```bash
   pnpm run dev
   ```
   - Storefront & Explore: `http://localhost:3003`
   - Buyer Portal: `http://localhost:3002`
   - Creator Studio: `http://localhost:3001`
   - Marketing Hub: `http://localhost:3000`
   - API Gateway: `http://localhost:4000`

---

## 4. Quality Gates & Pre-Commit Checklist

Before opening a pull request or committing code, run the monorepo quality checks locally:

```bash
# 1. Monorepo Typecheck (Must complete with 0 errors across all 7 packages)
pnpm run typecheck

# 2. Production Build Verification (Ensures clean Turbopack & Next.js builds)
pnpm run build

# 3. Code Quality / Linting
pnpm run lint
```

> [!IMPORTANT]
> Any pull request that fails `.github/workflows/ci.yml` or introduces type errors will not be merged.

---

## 5. Git Commit Guidelines

We enforce the **Conventional Commits** specification:

```
<type>(<scope>): <short imperative summary>

[optional detailed body]
```

### Allowed Types
- **`feat`**: A new feature or user-facing functionality (e.g. `feat(store): add minimal sort by dropdown`)
- **`fix`**: A bug fix (e.g. `fix(portal): resolve token expiration check`)
- **`perf`**: Performance improvement (e.g. `perf(store): optimize font loading with inline font-face`)
- **`refactor`**: Code refactoring without behavioral changes
- **`docs`**: Documentation changes (`README.md`, `CONTRIBUTING.md`)
- **`test`**: Adding or updating tests
- **`chore`**: Maintenance, package updates, or build configuration

### Allowed Scopes
- `store`, `studio`, `portal`, `www`, `api`, `auth`, `types`, `ui`, `db`, `ci`

---

## 6. Pull Request Process

1. Create a descriptive feature branch from `main`:
   ```bash
   git checkout -b feat/epic-store-filters
   ```
2. Make clean, atomic commits following conventional commit rules.
3. Keep database schema in sync: if schema changes are required, update both `docker/schema.sql` and `src/db/schema.sql`.
4. Push your branch to GitHub and open a Pull Request against the `main` branch.
5. Provide a clear description of changes, screenshots/recordings for UI updates, and confirmation that all CI checks pass.

Thank you for helping make KodeDock the standard for verified software architectures!
