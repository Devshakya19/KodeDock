# KodeDock Troubleshooting Guide

This guide covers common issues encountered during development and deployment of KodeDock, along with their solutions.

## Table of Contents
1. [Docker & Container Issues](#docker--container-issues)
2. [Database Issues](#database-issues)
3. [Service Connection Issues](#service-connection-issues)
4. [Frontend Issues](#frontend-issues)
5. [Backend Issues](#backend-issues)
6. [Authentication Issues](#authentication-issues)
7. [Payment Issues](#payment-issues)
8. [Performance Issues](#performance-issues)
9. [Environment & Configuration](#environment--configuration)

## Docker & Container Issues

### Docker Daemon Not Running
**Symptoms**: 
- `docker compose up` fails with "Cannot connect to the Docker daemon"
- `docker info` returns an error

**Solution**:
```bash
# Start Docker daemon
sudo systemctl start docker  # Linux
# Or start Docker Desktop application (Mac/Windows)

# Verify
docker info
```

### Port Conflicts
**Symptoms**:
- Services fail to start with "port is already in use"
- Error messages like "Bind for 0.0.0.0:3000 failed: port is already allocated"

**Solution**:
1. Identify what's using the port:
```bash
lsof -i :3000  # Replace with your port
```
2. Either stop the conflicting service or change the port in docker-compose.yml
3. For development, you can stop common conflicting services:
```bash
# Example: stop another Next.js app
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

### Container Health Checks Failing
**Symptoms**:
- `docker compose ps` shows services as "unhealthy"
- Repeated restarting of containers

**Solution**:
1. Check the logs for the unhealthy service:
```bash
docker compose logs -f [service-name]
```
2. Common causes:
   - Database connection issues (check DATABASE_URL)
   - Redis connection issues (check REDIS_URL)
   - Missing environment variables
   - Port conflicts between containers

### Slow Container Startup
**Symptoms**:
- Services take a long time to become healthy
- Timeout during startup

**Solution**:
1. Increase health check timeouts in docker-compose.yml if needed
2. Ensure sufficient system resources (RAM, CPU)
3. Check if services are doing heavy initialization (database migrations, etc.)

## Database Issues

### Connection Refused
**Symptoms**:
- Backend service logs show "Failed to create PostgreSQL pool"
- Error: "connection to server at "postgres" (172.XX.X.X), port 5432 failed: Connection refused"

**Solution**:
1. Verify PostgreSQL service is running:
```bash
docker compose ps postgres
```
2. Check PostgreSQL logs:
```bash
docker compose logs -f postgres
```
3. Ensure depends_on is set correctly in docker-compose.yml
4. Manually test connection:
```bash
docker compose exec postgres pg_isready -U kodedock -d kodedock
```

### Authentication Failed
**Symptoms**:
- "password authentication failed for user "kodedock""
- Database connection rejected despite service running

**Solution**:
1. Check the POSTGRES_PASSWORD in your .env file matches what's expected
2. Verify the password was correctly passed to the container:
```bash
docker compose exec postgres env | grep POSTGRES
```
3. If you changed the password, you may need to reset the database volume:
```bash
# WARNING: This will delete all data!
docker compose down -v
docker compose up -d
```

### Schema Not Applied
**Symptoms**:
- Tables missing when querying
- Application errors about missing tables/columns

**Solution**:
1. Check if the initialization script ran:
```bash
docker compose logs postgres | grep "initdb"
```
2. Verify the SQL file is mounted correctly:
```bash
docker compose exec postgres ls -la /docker-entrypoint-initdb.d/
```
3. Manually apply schema if needed:
```bash
docker compose exec -T postgres psql -U kodedock -d kodedock < sql/01-schema.sql
```

## Service Connection Issues

### Backend Cannot Connect to Redis
**Symptoms**:
- Error: "Failed to connect to Redis" or "Redis connection refused"
- Services that depend on Redis (Core Engine, AI Service, Worker, Realtime) fail to start

**Solution**:
1. Verify Redis service is healthy:
```bash
docker compose ps redis
docker compose logs -f redis
```
2. Test Redis connectivity:
```bash
docker compose exec redis redis-cli ping
```
3. Check REDIS_URL in backend service .env files
4. Ensure Redis port (6379) is not blocked

### Services Cannot Communicate Internally
**Symptoms**:
- One service calls another but gets connection refused or timeout
- Internal API calls fail despite services running

**Solution**:
1. Verify both services are on the same Docker network:
```bash
docker compose config --services | xargs -I {} docker compose inspect {} | grep -A2 -B2 "networks"
```
2. Check that services are using internal service names (not localhost):
   - Correct: `http://core-engine:4001`
   - Incorrect for internal calls: `http://localhost:4001`
3. Verify port mappings and service names in docker-compose.yml
4. Test connectivity between containers:
```bash
# From core-engine container, test connecting to redis
docker compose exec core-engine curl -s redis:6379
```

### Proxy Returning 403 or 502 Errors
**Symptoms**:
- Frontend API calls return 403 (Path not allowed) or 502 (Backend connection failed)
- Console shows errors like "Failed to fetch resource"

**Solution**:
1. **403 Error** - Path not allowed in proxy:
   - Check that the API path you're calling is in the ALLOWED_PREFIXES list in 
     `web/src/app/api/proxy/[...path]/route.ts`
   - Common missed paths: new API endpoints you've added
2. **502 Error** - Backend connection failed:
   - Verify the Core Engine service is running and healthy
   - Check that CORE_ENGINE_URL in .env is correct (default: http://localhost:4001)
   - Test direct connection to backend:
   ```bash
   curl -s http://localhost:4001/health
   ```

## Frontend Issues

### Next.js Development Server Problems
**Symptoms**:
- `npm run dev` fails to start
- Browser shows blank page or hydration errors
- Module not found errors

**Solution**:
1. Clear Next.js cache and reinstall:
```bash
cd web
rm -rf .next node_modules/cache
npm install
npm run dev
```
2. Check for TypeScript errors:
```bash
npm run build  # Will show type-checking errors
```
3. Verify Node.js version (requires v20+):
```bash
node --version
```

### Environment Variables Not Loading
**Symptoms**:
- `process.env.NEXT_PUBLIC_VAR` is undefined in frontend
- API calls failing due to missing configuration

**Solution**:
1. Remember that only variables prefixed with `NEXT_PUBLIC_` are exposed to the browser
2. Check that your .env.local or .env file contains the variables
3. Restart the development server after changing environment variables
4. Verify variable names are correct (case-sensitive)

### CSS/Tailwind Issues
**Symptoms**:
- Styles not applying
- Classes not being recognized
- Unexpected styling behavior

**Solution**:
1. Ensure Tailwind is properly configured in `tailwind.config.js` and `postcss.config.mjs`
2. Check for conflicting CSS or CSS reset issues
3. Verify that your content paths in tailwind.config.js include all necessary directories
4. Try clearing the Next.js cache:
```bash
rm -rf .next
```

## Backend Issues

### Rust Compilation Errors
**Symptoms**:
- `cargo run` fails with compilation errors
- Missing dependencies or version conflicts

**Solution**:
1. Check the error message for specific guidance
2. Run `cargo clean` and try again:
```bash
cd services/core-engine
cargo clean
cargo run
```
3. Verify Rust toolchain is up to date:
```bash
rustup update
```
4. Check Cargo.toml for correct dependency versions

### Actix-Web Server Fails to Start
**Symptoms**:
- Server starts but immediately exits
- No error message or cryptic panic

**Solution**:
1. Enable detailed logging:
```bash
RUST_LOG=info cargo run
```
2. Check if port is already in use
3. Verify all required environment variables are set
4. Look for panics in initialization code (database connection, etc.)

### Rate Limiting Blocking Legitimate Requests
**Symptoms**:
- HTTP 429 (Too Many Requests) errors during normal development
- API calls being blocked unexpectedly

**Solution**:
1. During development, you can temporarily increase limits in 
   `services/core-engine/src/main.rs` in the GovernorConfigBuilder sections
2. Ensure you're not making rapid-fire requests in loops
3. Check if your IP is being rate-limited due to proxy forwarding issues

### Database Query Errors
**Symptoms**:
- SQLx errors about missing columns or type mismatches
- Panics during database operations

**Solution**:
1. Verify your database schema matches what the code expects
2. Check that migrations have been applied
3. Ensure column types in SQL match Rust types in models/
4. Run `cargo test` to catch schema mismatches early

## Authentication Issues

### JWT Token Problems
**Symptoms**:
- "Unauthorized" errors despite being logged in
- Token validation failures
- Redirect loops to login page

**Solution**:
1. Check that the `kodedock_token` cookie is being set (Application > Cookies in devtools)
2. Verify JWT_SECRET is consistent across services
3. Check token expiration (tokens typically expire in 24h)
4. Verify the cookie path and domain settings
5. Check server time - JWT validation fails if server time is significantly off

### OAuth Issues (GitHub)
**Symptoms**:
- GitHub login fails or redirects incorrectly
- "Invalid state" or "code verification failed" errors

**Solution**:
1. Verify GitHub OAuth App configuration:
   - Callback URL must match: `http://localhost:3000/api/auth/github/callback`
   - Ensure Client ID and Secret are correct in .env
2. Check that the session cookie is being set properly
3. Verify the OAuth flow state is being stored and validated correctly
4. Check logs for specific error messages from the OAuth handler

### Role-Based Access Issues
**Symptoms**:
- Users can't access features they should have access to
- Admin features unavailable to admin users

**Solution**:
1. Verify the user's role in the database:
```bash
docker compose exec -T postgres psql -U kodedock -d kodedock -c "SELECT role FROM profiles WHERE id = 'user-uuid-here';"
```
2. Check that role-based middleware is correctly implemented
3. Verify that the JWT token contains the correct role information
4. Look for hardcoded role checks that may be incorrect

## Payment Issues

### Razorpay Integration Problems
**Symptoms**:
- Payment verification fails
- Orders stuck in pending state
- Webhook signature verification errors

**Solution**:
1. Verify Razorpay keys are correctly set in .env
2. Check that the webhook secret matches what's configured in Razorpay dashboard
3. Test with Razorpay test mode keys (rzp_test_*)
4. Verify that the amount being sent matches what Razorpay expects
5. Check webhook logs:
```bash
docker compose logs -f core-engine | grep razorpay
```
6. Ensure your server is accessible from Razorpay's webhooks (ngrok for local dev)

### Wallet Balance Issues
**Symptoms**:
- Incorrect wallet balances
- Transactions not recording properly
- Insufficient balance errors when funds should be available

**Solution**:
1. Check wallet transactions for accuracy:
```bash
docker compose exec -T postgres psql -U kodedock -d kodedock -c "SELECT * FROM wallet_transactions ORDER BY created_at DESC LIMIT 10;"
```
2. Verify that transaction types are correctly interpreted (positive vs negative amounts)
3. Check for race conditions in concurrent transactions
4. Ensure that all balance updates happen within database transactions

## Performance Issues

### Slow API Response Times
**Symptoms**:
- API endpoints take seconds to respond
- Frontend feels sluggish
- Database queries are slow

**Solution**:
1. Check database query performance:
   - Look for missing indexes in 07-BACKEND.md
   - Consider adding indexes for frequently queried columns
2. Verify Redis caching is working for appropriate endpoints
3. Check for N+1 query problems in backend code
4. Profile slow endpoints with tracing tools
5. Ensure services have adequate resources (CPU, memory)

### High Memory Usage
**Symptoms**:
- Containers hitting memory limits
- System slowing down due to swapping
- Docker showing high memory consumption

**Solution**:
1. Check for memory leaks in long-running processes
2. Verify that services are not caching excessive data in memory
3. Check for large response payloads that could be paginated
4. Consider implementing request/response size limits
5. Increase memory limits in docker-compose.yml if needed and appropriate

### Slow Frontend Load Times
**Symptoms**:
- Initial page load takes several seconds
- Users see blank screens or loading spinners for extended periods

**Solution**:
1. Optimize Next.js build:
   - Use `next build` and analyze output
   - Check for large JavaScript bundles
   - Implement code splitting and dynamic imports where appropriate
2. Optimize images:
   - Use next/image component
   - Ensure images are properly compressed
   - Use appropriate formats (WebP, AVIF)
3. Implement proper caching headers
4. Use CDN for static assets (in production)
5. Reduce third-party scripts and external dependencies

## Environment & Configuration

### Missing Environment Variables
**Symptoms**:
- Services fail to start with "variable not set" errors
- Features not working due to missing configuration

**Solution**:
1. Check which variables are required by looking at:
   - The setup.sh script
   - .env.example files
   - Service-specific code that reads env vars
2. Set missing variables in .env file
3. Restart affected services after changes
4. Use default values where appropriate and safe

### Configuration Drift Between Environments
**Symptoms**:
- Works in development but fails in production/staging
- Different behavior between similar setups

**Solution**:
1. Maintain consistent .env files across environments (with appropriate values for each)
2. Use environment-specific .env files (.env.development, .env.production)
3. Document required vs optional configuration
4. Use configuration validation at startup
5. Keep infrastructure as code (docker-compose.yml, etc.) version controlled

### Timezone Issues
**Symptoms**:
- Timestamps appearing incorrect
- Date-based logic not working as expected
- Escrow hold times wrong

**Solution**:
1. Ensure all services use UTC internally
2. Convert to local time only for display purposes
3. Verify database timezone settings:
```bash
docker compose exec -T postgres psql -U kodedock -d kodedock -c "SHOW timezone;"
```
4. Check that application code handles timezones correctly (especially in escrow calculations)
5. Use libraries like chrono (Rust) or datetime (Python) with proper timezone support

## Getting Further Help

If you've exhausted this troubleshooting guide:

1. **Check the Logs**: 
   ```bash
   docker compose logs -f [service-name]
   ```

2. **Check Existing Documentation**:
   - Architecture: `docs/02-ARCHITECTURE.md`
   - Backend & Schema: `docs/07-BACKEND.md`
   - API Routes: See section 5 in `docs/07-BACKEND.md`

3. **Search for Similar Issues**:
   - Look for commented-out code or TODO items that might indicate known issues
   - Check git history for recent changes that might have introduced the problem

4. **Reproduce in Isolation**:
   - Try to reproduce the issue with minimal setup
   - Remove variables and simplify to isolate the problem

5. **Ask for Help**:
   - When asking for assistance, include:
     - Exact error messages
     - Relevant log snippets
     - Steps to reproduce
     - Environment details (Docker version, OS, etc.)
     - What you've already tried

Remember: Most issues are related to configuration, environment variables, or service connectivity. Start by verifying your .env file and checking that all services can communicate with their dependencies.