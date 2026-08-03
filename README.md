# CodeHaat

> India's #1 Digital Code Marketplace — Where Code Meets Commerce

<div align="center">
  <img src="assets/banner.jpg" alt="CodeHaat Banner" />
</div>

---

> **PROPRIETARY SOFTWARE** — This repository contains proprietary and confidential
> code owned by CodeHaat. Unauthorized copying, cloning, distribution, or use of this
> code is strictly prohibited and may result in legal action. See [LICENSE](LICENSE) for details.

---

## What is CodeHaat?

CodeHaat is a two-sided digital goods marketplace where developers can buy and sell production-grade code assets. Unlike traditional platforms that distribute static .zip files, CodeHaat delivers code directly to buyers' GitHub accounts as private repositories.

**Key Features:**
- 🔐 **Secure Auth** — JWT with HttpOnly cookies, Argon2 password hashing, role-based access
- 💳 **Razorpay Payments** — INR payments, wallet top-ups, 2.5% platform commission (lowest in market)
- 🏦 **Seller Payouts** — Bank account & UPI withdrawal system with escrow protection
- 📦 **GitHub Repo Delivery** — Code delivered as private repos, not .zip files
- 🛡️ **Escrow System** — 7-day hold protects both buyers and sellers
- 🗄️ **Self-hosted Storage** — SeaweedFS (S3-compatible) for images, presigned URL uploads
- ⚡ **Real-time** — WebSocket notifications via Redis pub/sub
- 🤖 **AI Service** — FastAPI-powered search & recommendations (in development)

---

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 20+ (for local development)
- Rust toolchain (for backend development)

### 1. Clone & Setup

```bash
git clone https://github.com/Devshakya19/CodeHaat.git
cd CodeHaat
```

### 2. Configure Environment

The `setup.sh` script auto-generates secrets and env files:

```bash
chmod +x setup.sh
./setup.sh
```

Or manually configure:

```bash
# Root .env (secrets shared across services)
cp .env.example .env

# Per-service env files
cp services/core-engine/.env.example services/core-engine/.env
cp services/ai-service/.env.example services/ai-service/.env
cp services/infra-worker/.env.example services/infra-worker/.env
cp services/realtime-service/.env.example services/realtime-service/.env

# SeaweedFS S3 config
cp config/seaweedfs/s3.json.example config/seaweedfs/s3.json

# Edit .env files with your Razorpay keys, DB passwords, etc.
```

### 3. Run with Docker

```bash
# Start all services (PostgreSQL auto-provisions schema on first run)
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f

# Verify all services are healthy
./test-docker.sh
```

### 4. Access Services

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | Next.js app |
| Core Engine | http://localhost:4001 | Rust API |
| AI Service | http://localhost:4002 | Python AI (internal) |
| Infra Worker | - | Go worker (no HTTP) |
| Real-Time | ws://localhost:4004 | WebSocket (internal) |
| PostgreSQL | localhost:5432 | Database (internal) |
| Redis | localhost:6379 | Cache & queues (internal) |
| SeaweedFS S3 | localhost:8333 | Object storage (internal) |
| SeaweedFS Filer | localhost:8888 | File API (internal) |

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | Next.js 16, React 19, TypeScript | User interface |
| **Styling** | Tailwind CSS v4, shadcn/ui | Design system |
| **Core API** | Rust, Actix-Web, SQLx | API gateway, transactions |
| **AI Service** | Python, FastAPI | Recommendations, search |
| **Worker** | Go | Background jobs, GitHub ops |
| **Real-Time** | Node.js, WebSockets (ws) | Live notifications |
| **Database** | PostgreSQL 16 | Primary data store |
| **Cache/Queue** | Redis 7 | Job queues, cache, pub/sub |
| **Storage** | SeaweedFS 3.76 | S3-compatible object storage |
| **Auth** | JWT (HS256), Argon2 | Authentication |
| **Payments** | Razorpay | INR payments & escrow |

---

## Project Structure

```
codehaat/
├── apps/
│   └── web/                          # Next.js frontend
│       └── src/
│           ├── features/             # Feature modules
│           │   ├── auth/             # Authentication pages
│           │   ├── browse/           # Buyer marketplace
│           │   ├── products/         # Product detail
│           │   ├── seller/           # Seller dashboard + earnings
│           │   ├── wallet/           # Wallet popups + payout methods
│           │   ├── landing/          # Marketing page
│           │   ├── developer/        # Seller marketing
│           │   └── pages/            # Company & Legal pages
│           ├── shared/               # Shared components, UI, utils
│           └── app/                  # Next.js routes + API proxy
│
├── services/
│   ├── core-engine/                  # Rust API gateway (Actix-Web)
│   ├── ai-service/                   # Python AI service (FastAPI)
│   ├── infra-worker/                 # Go background worker
│   └── realtime-service/             # Node.js WebSocket
│
├── sql/
│   └── 01-schema.sql                 # PostgreSQL schema (13 tables)
│
├── config/
│   └── seaweedfs/                    # SeaweedFS S3 config
│
├── assets/                           # Brand assets
├── docs/                             # Documentation
│   ├── 01-PRD.md                     # Project requirements
│   ├── 02-ARCHITECTURE.md            # System architecture
│   ├── 03-RULES.md                   # Coding rules
│   ├── 04-DESIGN.md                  # Design system
│   ├── 05-TRD.md                     # Technical specs
│   ├── 06-APP-FLOW.md                # User flows
│   ├── 07-BACKEND.md                 # Backend & schema
│   ├── 08-PRESENTATION.md            # Investor/company PPT
│   └── foundation/                   # Terms, policies, legal
│
└── docker-compose.yml                # Docker orchestration (8 services)
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    USERS (Browser)                       │
└─────────────────────────┬───────────────────────────────┘
                          │ HTTPS (HttpOnly cookies)
                          ▼
┌─────────────────────────────────────────────────────────┐
│              1. Frontend (Next.js :3000)                 │
│   Pure UI + API proxy layer (no direct DB access)       │
│   JWT stored in HttpOnly cookies (XSS-proof)            │
└─────────────────────────┬───────────────────────────────┘
                          │ REST API (Bearer token)
                          ▼
┌─────────────────────────────────────────────────────────┐
│           2. Core Engine (Rust :4001)                    │
│   Auth, products, orders, wallet, payments, payouts     │
│   PostgreSQL transactions with FOR UPDATE row locks     │
└───────┬──────────┬──────────────┬───────────────────────┘
        │          │              │
        ▼          ▼              ▼
┌───────────┐ ┌──────────┐ ┌──────────────────────────────┐
│ PostgreSQL│ │  Redis   │ │ SeaweedFS (S3 storage :8333) │
│  16 (DB)  │ │ 7 (cache)│ │ Images: products/, avatars/  │
└───────────┘ └────┬─────┘ └──────────────────────────────┘
                   │ pub/sub
       ┌───────────┼───────────┐
       ▼           ▼           ▼
┌───────────┐ ┌──────────┐ ┌──────────────┐
│ 3. AI Svc │ │ 4. Worker│ │ 5. Real-Time │
│ (Python)  │ │ (Go)     │ │ (Node.js WS) │
└───────────┘ └──────────┘ └──────────────┘
```

---

## Security Architecture

CodeHaat is built **security-first**:

| Layer | Protection |
|-------|-----------|
| **Password Hashing** | Argon2 (memory-hard, industry best) |
| **Token Storage** | JWT in HttpOnly cookies — never exposed to browser JS |
| **SQL Injection** | Impossible — SQLx compile-time checked queries |
| **Rate Limiting** | Per-endpoint: auth (5/12s), upload (10/6s), verify (10/6s) |
| **SSRF Protection** | Whitelist-based URL validation in proxy + upload routes |
| **CORS** | Dynamic, configurable per-origin |
| **Security Headers** | Cache-Control, X-Frame-Options, X-XSS-Protection, nosniff |
| **Payment Verification** | HMAC-SHA256 + constant-time comparison |
| **Escrow** | 7-day hold enforced at DB level with row locks |
| **Account Numbers** | Masked in API responses (only last 4 digits shown) |

---

## API Endpoints (Rust Core Engine)

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register (user or developer) |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/logout` | Logout |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password |
| POST | `/api/auth/change-password` | Change password |
| DELETE | `/api/auth/delete-account` | Delete account |

### Profile
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/profile/:id` | Get profile |
| PUT | `/api/profile` | Update profile |

### Products (Public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List products (search/filter) |
| GET | `/api/products/:id` | Get product detail |

### Seller (Developer Only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/seller/products` | List seller's products |
| POST | `/api/seller/products` | Create product |
| PUT | `/api/seller/products/:id` | Update product |
| DELETE | `/api/seller/products/:id` | Delete product |
| GET | `/api/seller/stats` | Seller dashboard stats |
| GET | `/api/seller/payout-account` | Get payout method |
| POST | `/api/seller/payout-account` | Add/update payout (bank/UPI) |
| DELETE | `/api/seller/payout-account` | Remove payout method |

### Wallet
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/wallet` | Get wallet balance |
| POST | `/api/wallet/topup` | Create Razorpay top-up order |
| POST | `/api/wallet/topup/verify` | Verify top-up payment |
| GET | `/api/wallet/transactions` | Transaction history (paginated) |
| POST | `/api/wallet/withdraw` | Request withdrawal (requires payout method) |
| POST | `/api/wallet/release-escrow` | Release expired escrow funds |

### Orders & Reviews
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders` | Create order (wallet or Razorpay) |
| POST | `/api/orders/verify` | Verify Razorpay payment |
| GET | `/api/orders` | List orders |
| GET | `/api/orders/:id` | Get order detail |
| POST | `/api/webhooks/razorpay` | Razorpay webhook |
| GET | `/api/reviews/:productId` | List reviews |
| POST | `/api/reviews` | Create review (verified purchase) |

### Notifications & Upload
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | List notifications |
| PUT | `/api/notifications/:id/read` | Mark as read |
| POST | `/api/upload/presign` | Get presigned upload URL |

---

## Database

### Tables (14 tables)

| Table | Purpose |
|-------|---------|
| `users` | Core auth: email, password_hash, role, OAuth fields |
| `profiles` | Extended user data: bio, avatar, GitHub, website |
| `categories` | Product categories (6 seeded) |
| `products` | Product listings with prices, tags, images |
| `wallets` | User wallet: balance, pending, total_earned, total_spent |
| `wallet_transactions` | Transaction log (7 types: topup, purchase, sale, withdrawal, refund, adjustment, commission) |
| `orders` | Purchase orders with Razorpay integration |
| `escrow` | 7-day payment hold for seller protection |
| `reviews` | Product reviews (1-5 rating, verified purchase) |
| `notifications` | In-app notifications |
| `disputes` | Order dispute resolution |
| `product_views` | Unique view tracking |
| `password_reset_tokens` | Password reset tokens |
| `seller_payout_accounts` | Seller bank account or UPI for withdrawals |

### Setup

Database is auto-provisioned and schema auto-imported via Docker Compose on first `docker compose up -d`. PostgreSQL triggers auto-create profiles and wallets on user registration.

---

## Pages

### Public Pages
| Route | Page |
|-------|------|
| `/` | Landing page (marketing) |
| `/developer` | Seller marketing page |
| `/browse` | Product marketplace |

### Auth Pages
| Route | Page |
|-------|------|
| `/login` | Sign in |
| `/register` | Create buyer account |
| `/developer-register` | Create seller account |
| `/forgot-password` | Reset password |
| `/reset-password` | Set new password |
| `/verify` | Email verification |

### Buyer Pages (role: user)
| Route | Page |
|-------|------|
| `/browse` | Product browsing |
| `/products/[id]` | Product detail + reviews |
| `/cart` | Shopping cart |
| `/checkout` | Razorpay/wallet checkout |
| `/orders/[id]` | Order detail |
| `/dashboard` | Buyer dashboard |
| `/dashboard/profile` | User profile |
| `/dashboard/purchases` | Purchase history |
| `/dashboard/wallet` | Buyer wallet + add money |
| `/dashboard/settings` | Account settings |
| `/notifications` | Notifications |
| `/search` | Search results |
| `/category/[slug]` | Category browse |

### Seller Pages (role: developer)
| Route | Page |
|-------|------|
| `/seller` | Seller dashboard |
| `/seller/products` | Product management |
| `/seller/products/new` | Create product |
| `/seller/products/[id]/edit` | Edit product |
| `/seller/orders` | Order management |
| `/seller/earnings` | Earnings analytics |
| `/seller/wallet` | Wallet + withdrawals + payout methods |
| `/seller/profile` | Seller profile |
| `/seller/settings` | Account settings |

---

## Development

### Local Development

```bash
# Frontend
cd apps/web
npm install
npm run dev    # Runs on port 3001

# Backend (requires Rust)
cd services/core-engine
cargo run      # Runs on port 4001
```

### Docker Development

```bash
docker compose up -d          # Start all services
docker compose up -d --build  # Rebuild after changes
docker compose logs -f        # View logs
docker compose down           # Stop all services
```

---

## Documentation

| Document | Description |
|----------|-------------|
| [01-PRD.md](docs/01-PRD.md) | Project Requirement Document |
| [02-ARCHITECTURE.md](docs/02-ARCHITECTURE.md) | System Architecture |
| [03-RULES.md](docs/03-RULES.md) | Rules & Conventions |
| [04-DESIGN.md](docs/04-DESIGN.md) | UI/UX Design System |
| [05-TRD.md](docs/05-TRD.md) | Technical Requirements |
| [06-APP-FLOW.md](docs/06-APP-FLOW.md) | Application Flows |
| [07-BACKEND.md](docs/07-BACKEND.md) | Backend & Schema |
| [08-PRESENTATION.md](docs/08-PRESENTATION.md) | Company/Investor Presentation |
| [LOGO-DESIGN.md](assets/LOGO-DESIGN.md) | Brand Assets Guide |

### Foundation Documents (Policies & Legal)

| Document | Description |
|----------|-------------|
| [Terms of Service](docs/foundation/01-TERMS-OF-SERVICE.md) | Platform terms |
| [Privacy Policy](docs/foundation/02-PRIVACY-POLICY.md) | Data handling |
| [Refund Policy](docs/foundation/03-REFUND-POLICY.md) | Refunds & cancellations |
| [Help & Support](docs/foundation/04-HELP-AND-SUPPORT.md) | Support guide |
| [Contact](docs/foundation/05-CONTACT.md) | Contact information |

---

## License

This project is **proprietary software** owned by CodeHaat.

- Unauthorized copying, cloning, or distribution is **strictly prohibited**
- See [LICENSE](LICENSE) for the full license agreement
- For licensing inquiries, contact: legal@codehaat.com

---

## Copyright

Copyright (c) 2025-2026 CodeHaat. All rights reserved.

---

*Built with passion for the Indian developer community.*
