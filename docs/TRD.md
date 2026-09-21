# Kodedock - Technical Requirements Document (TRD)

| **Document Version** | 1.0.0 |
| :--- | :--- |
| **Status** | Approved / Living Document |
| **Last Updated** | 2026-09-20 |
| **Target Audience** | Engineering, Tech Leads, DevOps, Security |

---

## 1. Technical Architecture Overview

Kodedock is designed as a **modular, secure monorepo** managed via **pnpm workspaces**. The architecture strictly separates **presentation layers (Thin Frontends)** from **business logic, security, and data layers (Backend Core & API Gateway)**.

```
+-----------------------------------------------------------------------------------+
|                                  CLIENT LAYER                                     |
|  apps/www (Landing & Auth) | apps/store (Market) | apps/portal (Buyer) | apps/studio (Seller) |
+------------------------------------------+----------------------------------------+
                                           | HTTPS / JSON (Bearer Token / Cookie)
                                           v
+-----------------------------------------------------------------------------------+
|                                  API GATEWAY (api/)                               |
|  • Route Dispatcher      • Better Auth Handler (/api/auth/*)  • Rate Limiting     |
|  • Input Validation (Zod) • Auth & RBAC Middleware             • CORS & Security  |
+------------------------------------------+----------------------------------------+
                                           | Internal Typesafe Calls
                                           v
+-----------------------------------------------------------------------------------+
|                             CORE DOMAIN & BUSINESS (src/)                         |
|  • src/auth: Better Auth Server Instance & OAuth Providers                        |
|  • src/products: Catalog indexing, versioning, moderation                         |
|  • src/orders: Checkout, payment webhooks, billing engine                         |
|  • src/licenses: Cryptographic key generator & validator                          |
|  • src/storage: Encrypted file upload & time-limited signed download URLs        |
+------------------------------------------+----------------------------------------+
                                           | Drizzle ORM
                                           v
+-----------------------------------------------------------------------------------+
|                             DATA & STORAGE LAYER                                  |
|  • Database: PostgreSQL (or SQLite in Dev) via Drizzle ORM                        |
|  • Object Storage: Cloudflare R2 / AWS S3 / MinIO (Asset Zips & Media)            |
|  • Cache & Queues: Redis / BullMQ (Background Jobs, Webhooks)                     |
+-----------------------------------------------------------------------------------+
```

---

## 2. Technology Stack & Workspace Tooling

| Component | Technology | Rationale |
| :--- | :--- | :--- |
| **Package Manager** | `pnpm` (v11+) | Strict dependency isolation, hard-link efficiency, fastest monorepo resolution. |
| **Build Orchestrator** | `Turborepo` | Caching, parallel execution for dev, build, and lint tasks across workspaces. |
| **Runtime Environment** | Node.js (v22+ / v26) | Modern LTS JavaScript/TypeScript runtime with native ESM and web APIs. |
| **Language** | TypeScript (v5.5+) | End-to-end type safety shared between `packages/types`, backend, and frontends. |
| **Authentication** | **Better Auth** | Modern, framework-agnostic, plugin-ready auth supporting Email/Password, OAuth, 2FA, and RBAC. |
| **Database & ORM** | PostgreSQL + Drizzle ORM | High-speed, lightweight, type-safe SQL queries with zero runtime bloat. |
| **Asset Storage** | Cloudflare R2 / AWS S3 | Encrypted object storage; downloads delivered exclusively via presigned URLs. |
| **Containerization** | Docker & Docker Compose | Uniform development and deployment containers defined in `docker/`. |

---

## 3. Monorepo Organization & Directory Strategy

```
kodedock/
├── pnpm-workspace.yaml        # Workspaces declaration
├── package.json               # Root monorepo scripts & dev tools
├── apps/
│   ├── www/                   # Landing page, Marketing, & Central Auth (/login, /register)
│   ├── store/                 # Public Marketplace catalog, filters, product detail pages
│   ├── portal/                # Authenticated Buyer dashboard (downloads, licenses, invoices)
│   ├── studio/                # Authenticated Seller dashboard (listings, analytics, payouts)
│   └── docs/                  # Developer and user documentation web application
├── packages/
│   ├── auth/                  # Shared Better Auth client SDK, React hooks, & modal triggers
│   ├── ui/                    # Shared design system components (buttons, dialogs, badges)
│   ├── types/                 # Shared TypeScript interfaces, DTOs, and schemas
│   ├── database/              # Drizzle schema definitions, migrations, and DB client
│   └── config/                # Shared ESLint, Prettier, and TypeScript configurations
├── src/                       # Core Backend Engine & Domain Logic
│   ├── auth/                  # Better Auth server configuration, plugins, and providers
│   ├── products/              # Product catalog domain logic & asset verification
│   ├── orders/                # Checkout flows, payment processing, invoice generation
│   ├── licenses/              # License key generation, signature, and verification logic
│   └── storage/               # S3/R2 client, presigned download URL generator
├── api/                       # API Gateway & HTTP Server
│   ├── routes/                # Route handlers (/api/auth, /api/products, /api/orders)
│   ├── middlewares/           # Authentication, RBAC, Rate Limiting, Error handling
│   └── server.ts              # API entrypoint and HTTP listener
├── assets/                    # Platform logos, brand icons, SVG assets
├── docker/                    # Dockerfiles and docker-compose configurations
└── docs/                      # PRD, TRD, System Architecture, & Licensing specs
```

---

## 4. Authentication & Authorization Design (Better Auth)

### 4.1 Server Setup (`src/auth/`)
Better Auth serves as the single source of truth for identities and sessions:
- **Email / Password**: Argon2 / Scrypt hashing via Better Auth built-in security.
- **Social OAuth**: GitHub (primary for developers) and Google OAuth.
- **RBAC Roles**: Every user has a `role` field:
  - `BUYER`: Can browse, purchase, and access `apps/portal`.
  - `SELLER`: Can access `apps/studio` to publish products and request payouts.
  - `ADMIN`: Platform moderation, dispute handling, payout approvals.
- **Multi-Role Support**: A user can be both a buyer and a seller seamlessly.

### 4.2 API Integration (`api/routes/auth.ts`)
Better Auth exposes handlers for standard endpoints:
```typescript
// api/routes/auth.ts
import { auth } from "../src/auth";
import { toNodeHandler } from "better-auth/node";

// Handles all /api/auth/* requests:
// /api/auth/sign-in/email, /api/auth/sign-up/email, /api/auth/sign-in/social
// /api/auth/session, /api/auth/sign-out
export const authHandler = toNodeHandler(auth);
```

### 4.3 Shared Frontend Client (`packages/auth/`)
Frontends use the shared client package without exposing any backend credentials:
```typescript
// packages/auth/src/client.ts
import { createAuthClient } from "better-auth/client";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://api.kodedock.com",
});

export const { signIn, signUp, useSession, signOut } = authClient;
```

---

## 5. Database Schema Specification (Drizzle ORM)

### 5.1 Better Auth Core Tables

```
users
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid()
  name          VARCHAR(255) NOT NULL
  email         VARCHAR(255) UNIQUE NOT NULL
  emailVerified BOOLEAN DEFAULT FALSE
  image         TEXT
  role          VARCHAR(50) DEFAULT 'BUYER' -- 'BUYER' | 'SELLER' | 'ADMIN'
  createdAt     TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  updatedAt     TIMESTAMP WITH TIME ZONE DEFAULT NOW()

sessions
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid()
  userId        UUID REFERENCES users(id) ON DELETE CASCADE
  token         TEXT UNIQUE NOT NULL
  expiresAt     TIMESTAMP WITH TIME ZONE NOT NULL
  ipAddress     VARCHAR(45)
  userAgent     TEXT
  createdAt     TIMESTAMP WITH TIME ZONE DEFAULT NOW()

accounts
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid()
  userId        UUID REFERENCES users(id) ON DELETE CASCADE
  accountId     TEXT NOT NULL
  providerId    TEXT NOT NULL -- 'github' | 'google' | 'credential'
  accessToken   TEXT
  refreshToken  TEXT
  expiresAt     TIMESTAMP WITH TIME ZONE
  password      TEXT -- hashed password for email/password provider
```

### 5.2 Marketplace Core Tables

```
products
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid()
  sellerId      UUID REFERENCES users(id) ON DELETE CASCADE
  title         VARCHAR(255) NOT NULL
  slug          VARCHAR(255) UNIQUE NOT NULL
  tagline       VARCHAR(300) NOT NULL
  description   TEXT NOT NULL
  category      VARCHAR(100) NOT NULL -- 'saas-starter' | 'ui-kit' | 'ai-agent' | 'backend' | 'devops' | 'tools'
  techStack     TEXT[] NOT NULL       -- ['Next.js', 'Better-Auth', 'TypeScript', 'Tailwind']
  liveDemoUrl   TEXT
  thumbnailUrl  TEXT NOT NULL
  previewImages TEXT[] NOT NULL
  status        VARCHAR(50) DEFAULT 'DRAFT' -- 'DRAFT' | 'IN_REVIEW' | 'PUBLISHED' | 'REJECTED'
  standardPrice INTEGER NOT NULL -- price in paise (INR) (e.g., 99900 for ₹999)
  extendedPrice INTEGER          -- optional extended license price in paise
  totalSales    INTEGER DEFAULT 0
  avgRating     NUMERIC(3, 2) DEFAULT 0.00
  createdAt     TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  updatedAt     TIMESTAMP WITH TIME ZONE DEFAULT NOW()

product_versions
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid()
  productId     UUID REFERENCES products(id) ON DELETE CASCADE
  version       VARCHAR(50) NOT NULL -- e.g., '1.0.0'
  changelog     TEXT
  storageKey    TEXT NOT NULL        -- R2/S3 encrypted object key
  checksumSha256 VARCHAR(64) NOT NULL
  fileSizeBytes BIGINT NOT NULL
  createdAt     TIMESTAMP WITH TIME ZONE DEFAULT NOW()

orders
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid()
  buyerId       UUID REFERENCES users(id) ON DELETE RESTRICT
  productId     UUID REFERENCES products(id) ON DELETE RESTRICT
  licenseType   VARCHAR(50) NOT NULL -- 'STANDARD' | 'COMMERCIAL' | 'EXTENDED'
  amount        INTEGER NOT NULL     -- amount paid in paise (INR)
  currency      VARCHAR(10) DEFAULT 'INR' -- 'INR' (Primary) | 'USD'
  paymentStatus VARCHAR(50) NOT NULL -- 'PENDING' | 'COMPLETED' | 'REFUNDED'
  paymentMethod VARCHAR(50) NOT NULL -- 'razorpay' | 'cashfree' | 'stripe'
  transactionId TEXT UNIQUE
  createdAt     TIMESTAMP WITH TIME ZONE DEFAULT NOW()

licenses
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid()
  orderId       UUID REFERENCES orders(id) ON DELETE CASCADE
  buyerId       UUID REFERENCES users(id) ON DELETE CASCADE
  productId     UUID REFERENCES products(id) ON DELETE CASCADE
  licenseKey    VARCHAR(128) UNIQUE NOT NULL -- KD-XXXX-XXXX-XXXX-XXXX
  status        VARCHAR(50) DEFAULT 'ACTIVE' -- 'ACTIVE' | 'REVOKED' | 'EXPIRED'
  createdAt     TIMESTAMP WITH TIME ZONE DEFAULT NOW()

seller_payouts
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid()
  sellerId      UUID REFERENCES users(id) ON DELETE CASCADE
  amount        INTEGER NOT NULL     -- amount in paise (95% to creator)
  platformFee   INTEGER NOT NULL     -- total 5% all-inclusive fee in paise
  status        VARCHAR(50) DEFAULT 'PENDING' -- 'PENDING' | 'PROCESSED' | 'FAILED'
  payoutAccount TEXT NOT NULL        -- UPI ID or Bank Account (IMPS/NEFT)
  processedAt   TIMESTAMP WITH TIME ZONE
  createdAt     TIMESTAMP WITH TIME ZONE DEFAULT NOW()
```

---

## 6. Security & Data Protection Specification

1. **Zero-Trust Frontend Architecture**:
   - No frontend application has direct access to database credentials, S3 secret keys, or payment private keys.
   - All interactions go through `api/` with authentication tokens.
2. **Secure Asset Downloads (Presigned URLs)**:
   - Product archives are stored in private Cloudflare R2 / S3 buckets with public access completely disabled.
   - When a buyer clicks "Download" in `apps/portal`, the backend verifies that an active order/license exists for that `userId` + `productId`.
   - If verified, the backend generates an HMAC-signed presigned download URL expiring in **60 seconds**.
3. **Input Sanitization & Validation**:
   - Every API endpoint validates incoming payloads using `zod` schemas located in `packages/types`.
4. **Rate Limiting & Abuse Prevention**:
   - API endpoints are protected by sliding-window rate limiters (e.g., max 100 requests/minute for general endpoints, 10 requests/minute for auth endpoints).

---

## 7. API Gateway Specifications

All endpoints are served under `/api` with unified error handling and JSON envelopes:

### 7.1 Authentication Endpoints (`/api/auth/*`)
- Handled directly by Better Auth (`signIn`, `signUp`, `social`, `session`, `signOut`).

### 7.2 Catalog Endpoints (Public)
- `GET /api/products`: Filterable list of published products (by category, tech stack, price range, search query).
- `GET /api/products/:slug`: Detailed product metadata, versions, and seller bio.
- `GET /api/categories`: Catalog categories and active item counts.

### 7.3 Buyer Portal Endpoints (Protected: `BUYER`)
- `GET /api/portal/purchases`: List of all purchased items and active licenses.
- `POST /api/portal/download`: Requests a signed one-time download URL for a specific product version.
- `GET /api/portal/licenses/:key`: Verifies license status and details.

### 7.4 Creator Studio Endpoints (Protected: `SELLER`)
- `GET /api/studio/products`: Products created by the authenticated seller.
- `POST /api/studio/products`: Create a new product draft.
- `POST /api/studio/products/:id/versions`: Upload a new version archive and changelog.
- `GET /api/studio/analytics`: Sales statistics, conversion rates, and revenue telemetry.
- `POST /api/studio/payouts`: Initiate a payout request.

---

## 8. Development & Deployment Environments

- **Development (`docker/docker-compose.dev.yml`)**:
  - Local PostgreSQL instance.
  - Local MinIO instance (S3-compatible local object storage).
  - Local Redis instance for queues and rate-limiting.
  - Apps running via `pnpm dev` with hot reloading.
- **Production**:
  - Managed PostgreSQL (Neon / Supabase / AWS RDS).
  - Cloudflare R2 for globally distributed, zero-egress-fee asset storage.
  - Docker containerized API and Next.js applications deployed to Vercel or cloud containers.
