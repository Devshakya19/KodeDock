# CodeHaat �� 💻 — Digital Code Marketplace

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: light)" srcset="assets/banner.jpg">
    <img src="assets/banner.jpg" alt="CodeHaat — India's #1 Digital Code Marketplace">
  </picture>
</p>

<p align="center">
  <a href="https://github.com/Devshakya19/CodeHaat/actions"><img src="https://img.shields.io/github/actions/workflow/status/Devshakya19/CodeHaat/ci.yml?branch=main&style=flat-square" alt="CI Status"></a>
  <a href="https://github.com/Devshakya19/CodeHaat/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-Proprietary-red?style=flat-square" alt="License: Proprietary"></a>
  <a href="https://nodejs.org/en"><img src="https://img.shields.io/badge/node-%3E%3D%2020.x-brightgreen?style=flat-square" alt="Node.js Version"></a>
  <a href="https://www.rust-lang.org/"><img src="https://img.shields.io/badge/rust-%3E%3D%201.70-orange?style=flat-square" alt="Rust Version"></a>
  <a href="https://docs.docker.com/"><img src="https://img.shields.io/badge/docker-%3E%3D%2024.0-blue?style=flat-square" alt="Docker Version"></a>
</p>

> **PROPRIETARY SOFTWARE** — This repository contains proprietary and confidential
> code owned by CodeHaat. Unauthorized copying, cloning, distribution, or use of this
> code is strictly prohibited and may result in legal action. See [LICENSE](LICENSE) for details.

## What is CodeHaat?

CodeHaat is India's #1 digital code marketplace where developers can buy and sell production-grade code assets. Unlike traditional platforms that distribute static .zip files, CodeHaat delivers code directly to buyers' GitHub accounts as private repositories.

**Key Features:**
- �� 🔐 **Secure Auth** — JWT with HttpOnly cookies, Argon2 password hashing, role-based access
- �� 💳 **Razorpay Payments** — INR payments, wallet top-ups, 2.5% platform commission (lowest in market)
- �� 🏦 **Seller Payouts** — Bank account & UPI withdrawal system with escrow protection
- �� 📦 **GitHub Repo Delivery** — Code delivered as private repos, not .zip files
- �� 🛡��️ **Escrow System** — 7-day hold protects both buyers and sellers
- �� 🗄��️ **Self-hosted Storage** — SeaweedFS (S3-compatible) for images, presigned URL uploads
- �� ⚡ **Real-time** — WebSocket notifications via Redis pub/sub
- �� 🤖 **AI Service** — FastAPI-powered search & recommendations (in development)

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
│   ├── 07-BACKEND.md                 # Backend & Schema
│   ├── 08-PRESENTATION.md            # Investor/company PPT
│   └── foundation/                   # Terms, policies, legal
│
�└── docker-compose.yml                # Docker orchestration (8 services)
```

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

## How It Fits Together

```
�┌─────────────────────────────────────────────────────────────────�┐
│                         USERS (Browser)                         │
�└─────────────────────────�┬───────────────────────────────────────�┘
                          │ HTTPS (HttpOnly cookies)
                          � ▼
�┌─────────────────────────────────────────────────────────────────�┐
│                    1. Frontend (Next.js :3000)                   │
│   Pure UI + API proxy layer (no direct DB access)                │
│   JWT stored in HttpOnly cookies (XSS-proof)                     │
�└─────────────────────────�┬───────────────────────────────────────�┘
                          │ REST API (Bearer token)
                          � ▼
�┌─────────────────────────────────────────────────────────────────�┐
│               2. Core Engine (Rust :4001)                       │
│   Auth, products, orders, wallet, payments, payouts              │
│   PostgreSQL transactions with FOR UPDATE row locks              │
�└───────�┬──────────�┬──────────────�┬───────────────────────────────�┘
        │          │              │
        � ▼          � ▼              � ▼
�┌───────────�┐ � ┌──────────�┐ � ┌──────────────────────────────�┐
│ PostgreSQL│ │  Redis   │ │ SeaweedFS (S3 storage :8333) │
│  16 (DB)  │ │ 7 (cache)│ │ Images: products/, avatars/  │
�└───────────�┘ └────�┬─────�┘ └──────────────────────────────�┘
                   │ pub/sub
        � ┌───────────�┼───────────�┐
        � ▼           � ▼           � ▼
�┌───────────�┐ � ┌──────────�┐ � ┌──────────────�┐
│ 3. AI Svc │ │ 4. Worker│ │ 5. Real-Time │
│ (Python)  │ │ (Go)     │ │ (Node.js WS) │
�└───────────�┘ └──────────�┘ └──────────────�┘
```

### Service Responsibilities

**Service 1: Frontend (Next.js)**
- Language: TypeScript
- Framework: Next.js 15 (App Router)
- Port: 3000
- Role: Render user interfaces, handle SSR/SEO
- Database Access: None — calls backend services only
- Auth: JWT-based (custom auth)

**Service 2: Core Engine (Rust)**
- Language: Rust
- Framework: Actix-Web
- Port: 4001
- Role: Main gateway, security, transactions
- Database Access: PostgreSQL (service-role connection)
- Responsibilities: JWT verification, wallet management, escrow, transactions

**Service 3: AI Service (Python)**
- Language: Python
- Framework: FastAPI
- Port: 4002
- Role: Intelligence layer
- Database Access: Read-only (SQLx client)
- Responsibilities: Recommendations, AI search, fraud detection

**Service 4: Infrastructure Worker (Go)**
- Language: Go
- Framework: Standard library + goroutines
- Port: 4003
- Role: Background automation
- Database Access: PostgreSQL (service-role connection)
- Responsibilities: Job processing, GitHub API, Docker management

**Service 5: Real-Time Service (Node.js)**
- Language: TypeScript
- Framework: ws / Socket.io
- Port: 4004
- Role: Live updates
- Database Access: Redis (pub/sub)
- Responsibilities: WebSocket connections, notifications, streaming

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

## Documentation

| Document | Description |
|----------|-------------|
| [ONBOARDING.md](ONBOARDING.md) | Step-by-step setup guide for new developers |
| [TROUBLESHOOTING.md](TROUBLESHOOTING.md) | Common issues and solutions |
| [API_REFERENCE.md](API_REFERENCE.md) | Combined API documentation |
| [SECURITY.md](SECURITY.md) | Detailed security architecture |
| [CONTRIBUTORS.md](CONTRIBUTORS.md) | Team member information |
| [docs/01-PRD.md](docs/01-PRD.md) | Project Requirement Document |
| [docs/02-ARCHITECTURE.md](docs/02-ARCHITECTURE.md) | System Architecture |
| [docs/03-RULES.md](docs/03-RULES.md) | Rules & Conventions |
| [docs/04-DESIGN.md](docs/04-DESIGN.md) | UI/UX Design System |
| [docs/05-TRD.md](docs/05-TRD.md) | Technical Requirements |
| [docs/06-APP-FLOW.md](docs/06-APP-FLOW.md) | Application Flows |
| [docs/07-BACKEND.md](docs/07-BACKEND.md) | Backend & Schema |
| [docs/08-PRESENTATION.md](docs/08-PRESENTATION.md) | Company/Investor Presentation |

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

## Contributors

Thanks to these wonderful people who have contributed to CodeHaat:

<table>
  <tr>
    <td align="center"><a href="https://github.com/Devshakya19"><img src="https://avatars.githubusercontent.com/u/Devshakya19?v=4&s=100" width="100px;" alt="Dev Shakya"/><br /><sub><b>Dev Shakya</b></sub></a><br /><a href="https://github.com/Devshakya19" title="Code">���💻</a></td>
    <td align="center"><a href="https://github.com/Deekshajain28"><img src="https://avatars.githubusercontent.com/u/Deekshajain28?v=4&s=100" width="100px;" alt="Deeksha Jain"/><br /><sub><b>Deeksha Jain</b></sub></a><br /><a href="https://github.com/Deekshajain28" title="Code">���💻</a></td>
  </tr>
</table>

## License

This project is **proprietary software** owned by CodeHaat.

- Unauthorized copying, cloning, or distribution is **strictly prohibited**
- See [LICENSE](LICENSE) for the full license agreement
- For licensing inquiries, contact: legal@codehaat.com

---

*Built with passion for the Indian developer community.*