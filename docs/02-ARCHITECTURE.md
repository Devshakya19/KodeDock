# CodeHaat — System Architecture

> Polyglot Microservices — Each service has a specific role and doesn't interfere with others.

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USERS (Browser)                         │
└─────────────────────────┬───────────────────────────────────────┘
                          │ HTTPS
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    1. UI LAYER (Next.js)                        │
│                    TypeScript + React 19                         │
│                    Port: 3000                                   │
│                                                                 │
│  • Landing page, Browse, Product detail                         │
│  • Seller dashboard, Auth pages                                 │
│  • Server-Side Rendering for SEO                                │
│  • No direct DB access — calls backend services                 │
└─────────────────────────┬───────────────────────────────────────┘
                          │ REST / gRPC + JWT
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                2. CORE ENGINE (Rust)                             │
│                Actix-Web 4                                       │
│                Port: 4001                                       │
│                                                                 │
│  • JWT token verification                                       │
│  • Request validation & authorization                           │
│  • Wallet balance management                                    │
│  • Escrow system (hold/release/refund)                          │
│  • Transaction processing                                       │
│  • Database read/write (SQLx client)                              │
│                                                                 │
│  NOTE: Redis integration planned for Phase 2                    │
└───────┬─────────────────────────┬───────────────────────────────┘
        │ (future: Redis)         │ Redis
        ▼                         ▼
┌───────────────────┐   ┌─────────────────────────────────────────┐
│  3. AI SERVICE    │   │     4. INFRASTRUCTURE WORKER (Go)       │
│  Python + FastAPI │   │     Port: 4003                          │
│  Port: 4002       │   │                                         │
│                   │   │  • Picks jobs from Redis queue           │
│  • Recommendations│   │  • GitHub API integration               │
│  • AI search      │   │  • Repo cloning & transfer              │
│  • Fraud detection│   │  • Docker container management          │
│  • User profiling │   │  • Live preview sandbox                 │
│                   │   │  • Background automation                 │
└───────────────────┘   └───────────┬─────────────────────────────┘
                                    │ WebSocket
                                    ▼
                    ┌─────────────────────────────────────────────┐
                    │     5. REAL-TIME SERVICE (Node.js)          │
                    │     Port: 4004                              │
                    │                                             │
                    │  • WebSocket connections                    │
                    │  • Live notifications                       │
                    │  • Preview terminal streaming                │
                    │  • Instant status updates                   │
                    └─────────────────┬───────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    6. DATA LAYER                                │
│                                                                 │
│  ┌─────────────────────┐    ┌─────────────────────────────┐    │
│  │  PostgreSQL (Postgres)│    │  Redis                       │    │
│  │                     │    │                              │    │
│  │  • Users & Profiles │    │  • Job queues (BullMQ)       │    │
│  │  • Products         │    │  • Session cache             │    │
│  │  • Orders           │    │  • Rate limiting             │    │
│  │  • Wallets          │    │  • Pub/Sub messaging         │    │
│  │  • Escrow           │    │  • Real-time state           │    │
│  │  • Reviews          │    │                              │    │
│  │  • Triggers/RLS     │    │                              │    │
│  └─────────────────────┘    └─────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Service Responsibilities

### Service 1: UI Layer (Next.js)

| Aspect | Detail |
|--------|--------|
| **Language** | TypeScript |
| **Framework** | Next.js 15 (App Router) |
| **Port** | 3000 |
| **Role** | Render user interfaces, handle SSR/SEO |
| **Database Access** | None — calls backend services only |
| **Auth** | JWT-based (custom auth) |

### Service 2: Core Engine (Rust)

| Aspect | Detail |
|--------|--------|
| **Language** | Rust |
| **Framework** | Actix-Web or Axum |
| **Port** | 4001 |
| **Role** | Main gateway, security, transactions |
| **Database Access** | PostgreSQL (service-role connection) |
| **Responsibilities** | JWT verification, wallet management, escrow, transactions |

### Service 3: AI Service (Python)

| Aspect | Detail |
|--------|--------|
| **Language** | Python |
| **Framework** | FastAPI |
| **Port** | 4002 |
| **Role** | Intelligence layer |
| **Database Access** | Read-only (SQLx client) |
| **Responsibilities** | Recommendations, AI search, fraud detection |

### Service 4: Infrastructure Worker (Go)

| Aspect | Detail |
|--------|--------|
| **Language** | Go |
| **Framework** | Standard library + goroutines |
| **Port** | 4003 |
| **Role** | Background automation |
| **Database Access** | PostgreSQL (service-role connection) |
| **Responsibilities** | Job processing, GitHub API, Docker management |

### Service 5: Real-Time Service (Node.js)

| Aspect | Detail |
|--------|--------|
| **Language** | TypeScript |
| **Framework** | ws / Socket.io |
| **Port** | 4004 |
| **Role** | Live updates |
| **Database Access** | Redis (pub/sub) |
| **Responsibilities** | WebSocket connections, notifications, streaming |

### Service 6: Data Layer

| Component | Purpose |
|-----------|---------|
| **PostgreSQL** | Primary database — users, products, orders, wallets |
| **Redis** | Job queues, caching, rate limiting, pub/sub |

---

## 3. Service Communication

| From | To | Protocol | Purpose |
|------|----|----------|---------|
| Next.js | Rust Core | REST + JWT | All API calls |
| Rust Core | PostgreSQL | TCP | Database operations |
| Rust Core | Redis | TCP | Publish events |
| Go Worker | Redis | TCP | Consume jobs |
| Go Worker | GitHub API | HTTPS | Repo operations |
| Go Worker | Docker | TCP | Container management |
| Python AI | Redis | TCP | Subscribe to events |
| Python AI | PostgreSQL | TCP | Read data |
| Go Worker | Node.js Realtime | WebSocket | Send notifications |
| Node.js Realtime | Browser | WebSocket | Push to client |

---

## 4. Purchase Flow (End-to-End)

```
1. Buyer clicks "Buy Now" on product page
   ↓
2. Next.js sends request to Rust Core with JWT
   ↓
3. Rust Core verifies JWT token
   ↓
4. Rust Core checks buyer's wallet balance
   ↓
5. Rust Core deducts amount from buyer's wallet
   ↓
6. Rust Core creates escrow record (amount held)
   ↓
7. Rust Core publishes "repo_transfer_needed" event to Redis
   ↓
8. Rust Core publishes "user_activity" to Python AI service
   ↓
9. Go Worker picks up "repo_transfer_needed" job
   ↓
10. Go Worker bare-clones seller's GitHub repo
    ↓
11. Go Worker creates new private repo in buyer's GitHub
    ↓
12. Go Worker pushes code + history to buyer's repo
    ↓
13. Go Worker updates order status to "completed"
    ↓
14. Go Worker fires event to Node.js Realtime
    ↓
15. Node.js sends WebSocket notification to buyer's browser
    ↓
16. Buyer sees: "Success! Code delivered to your GitHub!"
    ↓
17. After 48 hours (no dispute), escrow auto-releases
    ↓
18. Seller receives 95.5% (after 2.5% platform fee)
```

---

## 5. Deployment Architecture

```
┌─────────────────────────────────────────────┐
│              Cloudflare (CDN + Tunnel)       │
│              DDoS protection, SSL            │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│              Docker Compose                  │
│              (Single VPS or Cluster)         │
│                                             │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│  │ Next.js │ │  Rust   │ │ Python  │       │
│  │ :3000   │ │ :4001   │ │ :4002   │       │
│  └─────────┘ └─────────┘ └─────────┘       │
│                                             │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│  │   Go    │ │ Node.js │ │  Redis  │       │
│  │ :4003   │ │ :4004   │ │ :6379   │       │
│  └─────────┘ └─────────┘ └─────────┘       │
│                                             │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│              PostgreSQL (Managed)            │
│              Primary Database               │
└─────────────────────────────────────────────┘
```

---

## 6. Scalability Strategy

| Level | Strategy |
|-------|----------|
| **Horizontal** | Docker containers can be scaled per service |
| **Database** | PostgreSQL handles connection pooling + read replicas |
| **Caching** | Redis caches frequent queries (products, categories) |
| **Queue** | Redis + BullMQ handles job processing asynchronously |
| **CDN** | Cloudflare serves static assets globally |
| **Rate Limiting** | Redis-based rate limiting per user/IP |

---

*Document Version: 1.0 | Last Updated: July 2026*
