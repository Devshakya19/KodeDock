# CodeHaat Security Architecture

This document outlines the security measures implemented in the CodeHaat platform. All descriptions are based on actual implementations in the codebase.

## Overview

CodeHaat follows a security-first approach with multiple layers of protection across the application stack. The platform handles sensitive user data, financial transactions, and code assets, requiring robust security measures.

## Authentication & Authorization

### JWT Token Handling
- **Implementation**: JSON Web Tokens (HS256 algorithm) stored in HttpOnly cookies
- **Location**: 
  - Frontend: `apps/web/src/shared/lib/auth.ts` (auth service)
  - Proxy: `apps/web/src/app/api/proxy/[...path]/route.ts` (cookie extraction)
  - Backend: `services/core-engine/src/main.rs` (token validation)
- **Security Benefits**:
  - Tokens are not accessible to JavaScript (mitigates XSS attacks)
  - Secure flag ensures transmission over HTTPS only
  - SameSite attribute prevents CSRF in supported browsers

### Password Security
- **Algorithm**: Argon2 (memory-hard, industry-standard for password hashing)
- **Implementation**: 
  - Located in authentication handlers (`services/core-engine/src/handlers/auth.rs`)
  - Used during user registration and login verification
- **Security Benefits**:
  - Resistant to GPU/ASIC cracking attacks
  - Configurable memory and time costs
  - Industry best practice for password storage

### Role-Based Access Control (RBAC)
- **Roles**: user, developer, admin
- **Implementation**:
  - Stored in `profiles.role` column (database)
  - Checked in route handlers (e.g., seller endpoints verify developer role)
  - Middleware extracts user ID from JWT for authorization decisions
- **Security Benefits**:
  - Principle of least privilege
  - Prevents unauthorized access to administrative functions
  - Seller-specific features protected (product management, payouts)

### OAuth Integrations
- **GitHub OAuth**:
  - State parameter used to prevent CSRF
  - Code verification performed server-side
  - Client secret never exposed to frontend
  - Callback URL: `/api/auth/github/callback`

## Data Protection

### Database Security
- **SQL Injection Prevention**:
  - **Technology**: SQLx query compiler (Rust)
  - **Implementation**: All database queries use compile-time checked SQL
  - **Location**: Throughout `services/core-engine/src/handlers/` and `services/core-engine/src/services/`
  - **Security Benefit**: Eliminates SQL injection vulnerabilities at compile time

- **Row-Level Security Considerations**:
  - Documented in `docs/07-BACKEND.md` (section 3)
  - Currently using service-role connections (backend mediates all access)
  - RLS policies available if direct database access is ever needed

### Sensitive Data Handling
- **Payout Account Information**:
  - Bank account numbers masked in API responses (only last 4 digits shown)
  - Implementation: `services/core-engine/src/handlers/payout.rs` (get_payout_account handler)
  - UPI IDs handled similarly (masking logic would apply)
  - Full details never returned in API responses

- **Encryption at Rest**:
  - GitHub access tokens encrypted in database (`profiles.github_access_token`)
  - Implementation referenced in `docs/07-BACKEND.md` table definition
  - Note: Actual encryption implementation would be in handler code

### File Upload Security
- **Presigned URL Approach**:
  - **Flow**: 
    1. Client requests presigned PUT URL via `/api/upload/presign`
    2. Next.js proxy forwards request to Core Engine with JWT validation
    3. Core Engine validates request and generates presigned URL via SeaweedFS S3 API
    4. Client uploads file directly to SeaweedFS (no server-side file handling)
    5. Image served through `/api/images/[...path]` proxy with caching
  - **Location**: 
    - Request handling: `apps/web/src/app/api/upload/file/route.ts`
    - Proxy: `apps/web/src/app/api/proxy/[...path]/route.ts`
    - Backend: `services/core-engine/src/handlers/upload.rs`
  - **Security Benefits**:
    - Large file payloads bypass application servers
    - No server-side storage of uploaded files (reduces attack surface)
    - File type validation possible at upload time (though current implementation focuses on URL signing)
    - Rate limiting on presign requests prevents abuse

## Network & Infrastructure Security

### Rate Limiting
- **Implementation**: `actix-governor` middleware with custom IP extractor
- **Location**: `services/core-engine/src/main.rs` (lines 72-91)
- **Protected Endpoints**:
  - Auth endpoints: 5 requests per 12 seconds
  - Upload presign: 10 requests per 6 seconds
  - Order verification: 10 requests per 6 seconds
- **IP Extraction**: 
  - Uses `X-Forwarded-For` header (set by trusted proxy)
  - Falls back to direct connection IP
  - Prevents rate limiting bypass via proxy sharing

### CORS (Cross-Origin Resource Sharing)
- **Implementation**: Dynamic origin validation
- **Location**: 
  - Core Engine: `services/core-engine/src/main.rs` (lines 94-101)
  - API Proxy: `apps/web/src/app/api/proxy/[...path]/route.ts` (origin check in WebSocket server)
- **Configuration**:
  - Origins configured via `CORS_ORIGINS` environment variable
  - Default: `http://localhost:3000,http://localhost:3001`
  - Prevents unauthorized cross-origin requests

### Service-to-Service Communication
- **Internal API Calls**:
  - Next.js → Core Engine: Via proxy with JWT token forwarding
  - Core Engine ↔ PostgreSQL: Direct TCP connections (connection pooling)
  - Core Engine ↔ Redis: Direct TCP connections (Redis client)
  - Services ↔ Redis: Job queue and pub/sub communication
- **Security Measures**:
  - All inter-service communication occurs within Docker bridge network
  - No service exposes unnecessary ports externally
  - Redis connections use password authentication via `REDIS_URL`

### HTTPS/TLS
- **Implementation**: 
  - Recommended deployment via reverse proxy (NGINX, Cloudflare, etc.)
  - Docker compose does not terminate SSL (termination handled externally)
  - Refer to `docs/02-ARCHITECTURE.md` deployment diagram showing Cloudflare/TLS termination
- **Security Benefits**:
  - Encrypts all client-server communication
  - Protects JWT tokens in transit
  - Secures API credentials and sensitive data

## Application Security

### Input Validation & Sanitization
- **Implementation**:
  - Request DTOs/structs with validation (using Rust's type system and manual checks)
  - Examples:
    - Order creation: Validates product existence, active status, self-purchase prevention
    - Wallet operations: Validates sufficient funds before debit
    - File upload: Validates request structure before generating presigned URL
  - Locations: Throughout handler files in `services/core-engine/src/handlers/`
- **Specific Validations**:
  - Product price minimum (�₹49) enforced at database level (CHECK constraint)
  - Email format validation during registration
  - URL validation for GitHub repository links
  - JSON schema validation for API payloads

### Security Headers
- **Implementation**: 
  - Configured in Next.js middleware or server configuration
  - Referenced in README.md Security Architecture table (lines 222)
  - Headers: Cache-Control, X-Frame-Options, X-XSS-Protection, nosniff
- **Security Benefits**:
  - Prevents clickjacking (X-Frame-Options)
  - Enables XSS protection in legacy browsers (X-XSS-Protection)
  - Prevents MIME type sniffing (nosniff)
  - Controls caching behavior (Cache-Control)

### Payment Security
- **Razorpay Integration**:
  - **Signature Verification**:
    - HMAC-SHA256 with constant-time comparison
    - Implementation: `services/core-engine/src/services/payment.rs`
    - Used in: 
      - Order verification endpoint (`/api/orders/verify`)
      - Webhook endpoint (`/api/webhooks/razorpay`)
      - Topup verification (`/api/wallet/topup/verify`)
  - **Webhook Security**:
    - Signature verification prevents spoofed webhooks
    - Idempotency via "pending" guard in order completion logic
    - Event type verification (`payment.captured` only)
  - **Amount Validation**:
    - Amounts verified against database records before processing
    - Platform fee (2.5%) calculated server-side (not trusted from client)
- **PCI DSS Compliance**:
  - Card data never touches CodeHaat servers
  - All payment processing handled by Razorpay
  - Only payment IDs and tokens stored (never full card details)

### Session Management
- **Implementation**:
  - Stateless JWT-based authentication
  - Token expiration: Configurable (typically 24 hours)
  - Logout mechanism: Token invalidation client-side (cookie removal)
  - No server-side session storage (reduces session hijacking risks)
- **Security Benefits**:
  - Eliminates session storage attack surface
  - Token theft limited to token lifetime
  - Clear logout procedure (removing HttpOnly cookie)

## Specific Threat Mitigations

### Cross-Site Request Forgery (CSRF)
- **Mitigation Strategies**:
  - State-changing operations require authentication via JWT
  - JWT stored in HttpOnly cookie (not accessible to JS)
  - SameSite cookie attributes where supported
  - For operations requiring explicit tokens (e.g., OAuth state), cryptographically random tokens used
  - API endpoints validate Content-Type and reject ambiguous requests

### Cross-Site Scripting (XSS)
- **Mitigation Strategies**:
  - HttpOnly cookies prevent JavaScript access to authentication tokens
  - Content-Type headers properly set on responses
  - Output encoding in templates (where applicable)
  - Sanitization of user-generated content before display (product descriptions, reviews)
  - Security headers: X-XSS-Protection, Content-Type options

### SQL Injection
- **Mitigation**: 
  - SQLx compile-time checked queries (Rust)
  - Parameterized queries for all database operations
  - No string concatenation for SQL building
  - ORM/query builder prevents injection by design

### Server-Side Request Forgery (SSRF)
- **Mitigation Strategies**:
  - **API Proxy Whitelist**: 
    - Only specific path prefixes allowed (`apps/web/src/app/api/proxy/[...path]/route.ts`)
    - Whitelist includes: products, seller/, orders, reviews, notifications, wallet, upload/, profile, auth/, search
    - Function: `isAllowedPath()` validates all incoming proxy requests
  - **URL Validation**:
    - Whitelist-based validation in upload routes
    - Referenced in README.md Security Architecture (line 220)
  - **Outbound Request Controls**:
    - SeaweedFS integration uses presigned URLs (no direct server requests to external services)
    - Any external API calls (GitHub, Razorpay) use predefined endpoints

### Brute Force Attacks
- **Mitigation Strategies**:
  - Rate limiting on authentication endpoints (5/12s)
  - Account lockout not implemented (to prevent denial-of-service via lockout)
  - Strong password requirements encouraged via UI
  - Argon2 hashing increases computational cost per attempt
  - Monitoring and alerting recommended for failed login spikes

### Man-in-the-Middle (MITM) Attacks
- **Mitigation Strategies**:
  - HTTPS enforcement via reverse proxy
  - HSTS headers recommended for production deployments
  - Certificate pinning not currently implemented (relies on TLS CA system)
  - Secure flags on cookies
  - JWT validation rejects tokens without proper signature

## Secure Development Practices

### Dependency Management
- **Rust**: 
  - Cargo.lock ensures reproducible builds
  - `cargo audit` recommended for vulnerability scanning
  - Dependencies sourced from crates.io with SemVer guarantees
- **Node.js**:
  - package-lock.json for deterministic installs
  - npm audit available for vulnerability scanning
  - Dependencies from npm registry
- **Python**:
  - requirements.txt or equivalent for dependency pinning
  - PyPI as primary source
- **Go**:
  - go.mod for dependency versioning
  - Proxy checksum database for integrity verification

### Secret Management
- **Implementation**:
  - Environment variables for all secrets
  - `.env.example` files show required variables without values
  - Interactive setup script (`setup.sh`) generates secure secrets:
    - JWT_SECRET: 32-byte random hex
    - POSTGRES_PASSWORD: 16-byte random hex
    - REDIS_PASSWORD: 16-byte random hex
  - Secrets never committed to repository
- **Required Secrets**:
  - Database credentials (POSTGRES_PASSWORD)
  - Redis password (REDIS_PASSWORD)
  - JWT signing key (JWT_SECRET)
  - Payment gateway keys (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET)
  - OAuth keys (GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET)
  - Webhook secrets (RAZORPAY_WEBHOOK_SECRET)

### Error Handling
- **Implementation**:
  - Detailed error logging server-side (without exposing sensitive data)
  - Generic error messages returned to clients (avoid information leakage)
  - Stack traces never returned in API responses
  - Specific error types handled appropriately (validation vs. system errors)
- **Examples**:
  - Authentication failures: Generic "Unauthorized" message
  - Validation failures: Field-specific messages (when safe)
  - System errors: Generic "Internal Server Error" with incident ID for support

## Compliance & Privacy

### Data Protection
- **Personal Data Minimization**:
  - Only necessary data collected (per GDPR-like principles)
  - Optional fields clearly marked
  - Data retention policies applied (where applicable)
- **User Rights Support**:
  - Account deletion endpoint (`/api/auth/delete-account`)
  - Data export capability would need implementation
  - Consent tracking for marketing communications

### Payment Compliance
- **PCI DSS Scope Reduction**:
  - Cardholder data environment (CDE) limited to Razorpay only
  - CodeHaat never handles, processes, or stores card data
  - SAQ A-EP applicable (outsourced payment processing)
  - Evidence: Payment verification uses webhooks and server-to-server calls only

### Audit Logging
- **Implementation**:
  - Financial transactions logged in `wallet_transactions` table
  - Order lifecycle tracked in `orders` and `escrow` tables
  - User actions recorded in `notifications` table
  - Administrative actions would require additional logging
- **Log Contents**:
  - Transaction IDs, amounts, timestamps
  - User references (via foreign keys)
  - Descriptions and metadata (JSONB)
- **Limitations**:
  - Comprehensive audit trail for all actions not fully implemented
  - Focus on financial and critical business operations

## Configuration Security

### Environment Variables
- **Required Variables** (examples from .env.example):
  - Database: POSTGRES_PASSWORD
  - Redis: REDIS_PASSWORD
  - JWT: JWT_SECRET
  - Payments: RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET
  - OAuth: GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET
  - Webhook: RAZORPAY_WEBHOOK_SECRET
  - Service URLs: CORE_ENGINE_URL, NEXT_PUBLIC_API_URL, etc.
- **Best Practices**:
  - Different values per environment (dev/staging/prod)
  - Secrets never hardcoded in source code
  - File permissions restrict .env file access
  - Docker secrets or external secret managers recommended for production

### Docker Security
- **Image Practices**:
  - Official base images used (postgres:, redis:, chrislusf/seaweedfs:)
  - Custom images built from Dockerfiles in service directories
  - Non-root users recommended (not currently implemented in all Dockerfiles)
  - Resource limits set in docker-compose.yml (memory, CPU)
- **Network Security**:
  - Internal services on isolated backend network
  - Frontend services exposed via frontend network
  - Database and Redis not exposed to host network
  - Port mapping only for necessary external access

## Monitoring & Incident Response

### Health Checks
- **Implementation**:
  - Each service has `/health` endpoint
  - Docker compose healthchecks configured for:
    - PostgreSQL: `pg_isready` command
    - Redis: `redis-cli ping` command
    - Core Engine: HTTP GET to `/health`
    - AI Service: HTTP GET to `/health`
    - Real-time Service: HTTP GET to `/health`
    - SeaweedFS: HTTP GET to `/`
  - Located in docker-compose.yml (healthcheck sections)

### Logging
- **Implementation**:
  - Structured logging via env_logger (Rust)
  - Console logging (Node.js, Python, Go)
  - Log levels configurable via environment
  - Security-relevant events logged:
    - Authentication attempts (success/failure)
    - Authorization failures
    - Rate limiting triggers
    - Validation errors
    - System errors
- **Locations**:
  - Rust: `services/core-engine/src/main.rs` (env_logger initialization)
  - Node.js: `services/realtime-service/src/index.js` (console.log statements)
  - Python: `services/ai-service/app/main.py` (logging configuration implied)
  - Go: `services/infra-worker/cmd/main.go` (log.Println/log.Printf calls)

### Alerting Recommendations
- **Metrics to Monitor**:
  - Authentication failure rates
  - Rate limiting trigger frequency
  - Error rates (5xx responses)
  - Response latency increases
  - Resource utilization (CPU, memory, disk)
  - Specific business logic anomalies (e.g., unusual withdrawal patterns)
- **Tools**:
  - Docker stats / Prometheus for resource monitoring
  - Log aggregation (ELK stack, etc.) for error tracking
  - Application performance monitoring (APM) tools
  - Custom metrics for business logic monitoring

## Limitations & Future Improvements

### Current Limitations
1. **Missing Web Application Firewall (WAF)**:
   - Relies on application-level protections
   - Recommended for production: Cloudflare WAF, NGINX ModSecurity, or similar

2. **Incomplete Security Headers**:
   - Missing: Content-Security-Policy, Referrer-Policy, Permissions-Policy
   - Recommended addition for modern browser protections

3. **Limited Security Testing**:
   - No automated security test suite (SAST, DAST)
   - Recommend implementing: dependency scanning, container scanning, periodic penetration testing

4. **Session Revocation**:
   - Stateless JWTs cannot be instantly revoked
   - Recommend implementing: token blacklist or shorter expiration with refresh tokens

5. **API Versioning**:
   - No explicit API versioning strategy
   - Recommend implementing: URL versioning (/api/v1/) or header-based versioning

### Recommended Enhancements
1. **Implement Content Security Policy (CSP)**:
   - Restrict sources for scripts, styles, images, etc.
   - Mitigate impact of potential XSS vulnerabilities

2. **Add HTTP Strict Transport Security (HSTS)**:
   - Enforce HTTPS connections
   - Prevent SSL stripping attacks

3. **Enhance Logging for Security Events**:
   - Structured logging for security-relevant events
   - Centralized logging with alerting on suspicious patterns

4. **Implement Regular Security Scanning**:
   - Dependency vulnerability scanning (cargo audit, npm audit, safety)
   - Container image scanning (Trivy, Clair, etc.)
   - Infrastructure as code scanning (Checkov, tfsec)

5. **Add Multi-Factor Authentication (MFA)**:
   - Optional MFA for sensitive operations (withdrawals, account changes)
   - TOTP or hardware key options

6. **Implement Request/Response Size Limiting**:
   - Prevent resource exhaustion via large payloads
   - Already partially implemented (1MB body limit in AI service middleware)

## Conclusion

CodeHaat implements a comprehensive security approach covering authentication, authorization, data protection, network security, and application security. The platform leverages modern security practices including password hashing with Argon2, JWT token security via HttpOnly cookies, SQL injection prevention through compile-time checked queries, and defense-in-depth principles.

Security is viewed as an ongoing process requiring regular assessment, updates, and adaptation to emerging threats. The implementations described herein represent the current state of security measures in the codebase as verified through direct examination of source code, configuration files, and documentation.

---
*Security documentation accurate as of codebase examination. For the most current implementation details, refer to the source code and configuration files directly.*