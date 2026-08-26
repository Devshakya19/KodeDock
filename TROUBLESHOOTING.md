# KodeDock Troubleshooting Guide

This guide provides professional diagnostics and resolutions for common issues encountered during the development and deployment of KodeDock.

> [!NOTE]
> Most issues stem from configuration drift, missing environment variables, or service connectivity blockages. Always verify your `.env` configuration before proceeding with complex diagnostics.

## Table of Contents
1. [Docker & Container Issues](#docker--container-issues)
2. [Database Connectivity & State](#database-connectivity--state)
3. [Service Communication](#service-communication)
4. [Frontend Operations](#frontend-operations)
5. [Backend & Rust Ecosystem](#backend--rust-ecosystem)
6. [Authentication & Authorization](#authentication--authorization)
7. [Payment & Wallet Integrations](#payment--wallet-integrations)
8. [Performance & System Health](#performance--system-health)
9. [Environment Configuration](#environment-configuration)

---

## 1. Docker & Container Issues

### Daemon Availability
**Symptoms**
- `docker compose up` fails with "Cannot connect to the Docker daemon"
- `docker info` returns connection errors

**Resolution**
Ensure the Docker daemon is actively running on your host system:
```bash
# Start Docker daemon (Linux)
sudo systemctl start docker

# Verify health status
docker info
```

### Port Conflicts
**Symptoms**
- Container fails to bind with "port is already in use" (e.g., `0.0.0.0:3000 failed`)

**Resolution**
Identify the process consuming the required port and terminate it or adjust your `docker-compose.yml`.
```bash
# Identify port usage (e.g., port 3000)
lsof -i :3000

# Force-stop conflicting Next.js instances (if applicable)
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

### Container Health Checks Failing
**Symptoms**
- Services report as "unhealthy" via `docker compose ps`
- Containers restart in an infinite loop

**Resolution**
Inspect the logs of the failing service. This often correlates to backend connections (e.g., Database, Redis).
```bash
docker compose logs -f [service-name]
```

---

## 2. Database Connectivity & State

### Connection Refusal
**Symptoms**
- Backend logs report: `Failed to create PostgreSQL pool`
- `connection to server at "postgres" (172.XX.X.X), port 5432 failed: Connection refused`

**Resolution**
Verify the database service state and attempt a manual connection.
```bash
# Check postgres service status
docker compose ps postgres

# Test connection internally
docker compose exec postgres pg_isready -U kodedock -d kodedock
```

### Authentication Failures
**Symptoms**
- `password authentication failed for user "kodedock"`

**Resolution**
Ensure the `POSTGRES_PASSWORD` in your `.env` matches the initialized volume. If credentials have drifted, you may need to recreate the database volume.

> [!WARNING]
> The following command wipes all persistent database data. Only execute this in development environments.

```bash
docker compose down -v
docker compose up -d
```

### Schema Unapplied
**Symptoms**
- Application panics due to missing tables or columns.

**Resolution**
Manually apply the initialization schema to the running database instance:
```bash
docker compose exec -T postgres psql -U kodedock -d kodedock < sql/01-init.sql
```

---

## 3. Service Communication

### Redis Unavailability
**Symptoms**
- `Failed to connect to Redis` or `Redis connection refused` from Core Engine, AI, or Worker services.

**Resolution**
1. Check Redis container health (`docker compose ps redis`).
2. Verify connectivity: `docker compose exec redis redis-cli ping`.
3. Validate `REDIS_URL` in your configuration.

### Internal Network Failures
**Symptoms**
- Inter-service requests fail with timeouts or connection refusals.

**Resolution**
Services must communicate via internal Docker DNS names, not `localhost`.
- **Correct**: `http://core-engine:4001`
- **Incorrect**: `http://localhost:4001`

Test connectivity explicitly from the dependent container:
```bash
docker compose exec core-engine curl -s redis:6379
```

### Reverse Proxy 403 / 502
**Symptoms**
- Client receives HTTP `403` (Path not allowed) or `502` (Bad Gateway).

**Resolution**
- **403 Errors**: Check `web/src/app/api/proxy/[...path]/route.ts`. The API path must be explicitly registered in `ALLOWED_PREFIXES`.
- **502 Errors**: The proxy cannot reach the Core Engine. Verify `CORE_ENGINE_URL` is set correctly and the backend is healthy (`curl -s http://localhost:4001/health`).

---

## 4. Frontend Operations

### Next.js Development Server Failures
**Symptoms**
- `npm run dev` crashes or fails to compile
- Hydration mismatches or module not found errors

**Resolution**
Purge the Next.js cache and verify dependencies:
```bash
cd web
rm -rf .next node_modules/cache
npm install
npm run dev
```

> [!TIP]
> Ensure you are running Node.js version 20 or higher (`node --version`).

### Environment Variables Undefined
**Symptoms**
- `process.env.NEXT_PUBLIC_VAR` evaluates to `undefined` on the client.

**Resolution**
Ensure variables intended for the browser are prefixed with `NEXT_PUBLIC_`. Always restart the Next.js development server after altering `.env` or `.env.local`.

---

## 5. Backend & Rust Ecosystem

### Actix-Web Boot Failures
**Symptoms**
- Server starts and exits instantly with cryptic panics.

**Resolution**
Elevate logging levels to reveal configuration or connection panics:
```bash
RUST_LOG=info cargo run
```

### Rate Limiting (Development)
**Symptoms**
- HTTP `429 Too Many Requests` when executing legitimate workflows.

**Resolution**
Temporarily relax the limits in `services/core-engine/src/main.rs` via `GovernorConfigBuilder`. Ensure downstream proxy configuration passes genuine client IPs instead of the proxy address.

---

## 6. Authentication & Authorization

### JWT / Session Validation Failures
**Symptoms**
- Unauthorized errors despite successful login workflows
- Continuous redirection loops

**Resolution**
1. Inspect the browser's application tab for the `kodedock_token` cookie.
2. Confirm `JWT_SECRET` is synchronized across all services.
3. Verify host system time. Significant clock drift invalidates JWT expiries.

### OAuth Integrations (GitHub)
**Symptoms**
- Callback errors stating "invalid state" or mismatched signatures.

**Resolution**
Ensure the GitHub OAuth App configuration precisely matches your local setup:
- Callback URL must be: `http://localhost:3000/api/auth/github/callback`
- Both Client ID and Secret must be populated in `.env`.

---

## 7. Payment & Wallet Integrations

### Razorpay Webhook Disconnects
**Symptoms**
- Orders stuck pending, wallet funds fail to top up, signature verification fails.

**Resolution**
1. Validate your `.env` contains the correct Razorpay keys (e.g., `rzp_test_...`).
2. Ensure the configured Webhook Secret matches the Razorpay dashboard.
3. For local development, expose your environment using an ngrok tunnel so Razorpay can reach the webhook endpoints.

```bash
docker compose logs -f core-engine | grep razorpay
```

---

## 8. Performance & System Health

### Degraded API Response Times
**Symptoms**
- Queries take seconds to execute
- System feels generally sluggish under low load

**Resolution**
- **Database**: Consult `07-BACKEND.md` for proper indexing patterns. Analyze slow queries and run `EXPLAIN ANALYZE`.
- **Compute**: Check for unoptimized N+1 query structures.

### Resource Exhaustion
**Symptoms**
- Docker daemon reporting extreme memory usage
- System utilizing swap space

**Resolution**
1. Monitor memory consumption for leaks within long-running processes.
2. Consider imposing pagination on large payload responses.
3. Implement request body limits to mitigate resource exhaustion attacks.

---

## 9. Environment Configuration

### Configuration Drift
**Symptoms**
- Discrepancies between local development, staging, and production behaviors.

**Resolution**
Strictly maintain environment-specific configuration files (`.env.development`, `.env.production`). Do not rely on unversioned defaults. Validate infrastructure definitions (e.g., `docker-compose.yml`) through code review.

### Timezone Discrepancies
**Symptoms**
- Escrow hold times calculate incorrectly; logs mismatch local time.

**Resolution**
All internal processing must use **UTC**.
Validate PostgreSQL time configuration:
```bash
docker compose exec -T postgres psql -U kodedock -d kodedock -c "SHOW timezone;"
```

---

## Advanced Troubleshooting Escalation

If your issue persists past these initial diagnostics:

1. **Enable Deep Logging**: `docker compose logs -f [service-name]`
2. **Consult Architecture Specifications**: `docs/02-ARCHITECTURE.md` and `docs/07-BACKEND.md`
3. **Isolate**: Strip the issue to a minimal reproducible scenario.
4. **Escalate**: When requesting engineering support, always provide the exact error trace, service logs, and explicit steps to reproduce the fault.