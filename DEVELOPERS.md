# KodeDock Developer Cheatsheet & Internal Reference

This document provides internal developer workflows, debugging tips, and common operations across the KodeDock monorepo.

---

## 1. Quick Development Commands

```bash
# Start all services concurrently
pnpm run dev

# Filter to a specific application
pnpm --filter @kodedock/store run dev
pnpm --filter @kodedock/portal run dev
pnpm --filter @kodedock/studio run dev
pnpm --filter @kodedock/www run dev
pnpm --filter @kodedock/api run dev

# Run TypeScript checks across all packages
pnpm run typecheck

# Build all production bundles
pnpm run build
```

---

## 2. Database Maintenance (PostgreSQL)

```bash
# Start local PostgreSQL and Redis containers
pnpm run db:up

# Stop containers
pnpm run db:down

# Check container logs
pnpm run db:logs

# Direct interactive psql session
docker exec -it kodedock-postgres psql -U kodedock -d kodedock_db

# Re-apply base DDL schema
docker exec -i kodedock-postgres psql -U kodedock -d kodedock_db < docker/schema.sql

# Check active database connections
docker exec -it kodedock-postgres psql -U kodedock -d kodedock_db -c "
  SELECT pid, usename, client_addr, state, query 
  FROM pg_stat_activity 
  WHERE datname = 'kodedock_db';
"
```

---

## 3. Cryptographic License Verification Test

To test offline verification of Ed25519 digital license keys:

```bash
# Verify license engine unit integrity
pnpm --filter @kodedock/backend test
```

---

## 4. Helpful Links

- [System Architecture & Overview](README.md)
- [Agent & Subagent Guidelines](AGENTS.md)
- [Contributing Standards](CONTRIBUTING.md)
- [Design Tokens & UI Aesthetics](docs/DESIGN_SYSTEM.md)
- [Security Policy](SECURITY.md)
