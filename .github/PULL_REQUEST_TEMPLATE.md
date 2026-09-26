## Description
<!-- Provide a clear, concise summary of the changes in this PR. -->

## Changes Proposed
- 

## Related Issue / Ticket
Closes #

## Monorepo Areas Impacted
- [ ] `apps/store` (Marketplace & Explore)
- [ ] `apps/portal` (Buyer Developer Portal)
- [ ] `apps/studio` (Creator Studio)
- [ ] `apps/www` (Marketing Hub)
- [ ] `api` (HTTP Gateway & Auth Router)
- [ ] `packages/*` (types, ui, auth)
- [ ] `docker` (PostgreSQL, Redis, Compose)

## Engineering Standards Checklist
- [ ] **ZERO Mock Data**: No hardcoded arrays, dummy test objects, or placeholder text. All data is backed by PostgreSQL.
- [ ] **Financial Precision**: All monetary values are strictly integers stored in **paise (INR)**.
- [ ] **Typography Suite**: Follows Fontshare suite (`Clash Display`, `Satoshi`, `Azeret Mono`).
- [ ] **Typecheck Passed**: `pnpm run typecheck` executed with 0 errors.
- [ ] **Build Passed**: `pnpm run build` completed clean production builds.
- [ ] **Schema Parity**: If schema was changed, both `docker/schema.sql` and `src/db/schema.sql` are identical.
- [ ] **Zero Secrets**: No `.env` secrets or Ed25519 private keys are committed.
