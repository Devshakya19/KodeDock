# KodeDock — System Architecture

> Polyglot Microservices — Each service has a specific role and doesn't interfere with others.

---

## Table of Contents
1. [Architecture Overview](#1-architecture-overview)
2. [Service Responsibilities](#2-service-responsibilities)
3. [Service Communication](#3-service-communication)
4. [Purchase Flow (End-to-End)](#4-purchase-flow-end-to-end)
5. [Deployment Architecture](#5-deployment-architecture)
6. [Network Isolation & Security](#6-network-isolation--security)
7. [Scalability Strategy](#7-scalability-strategy)

---

## 1. Architecture Overview

```mermaid
flowchart TD
    Users((USERS<br>Browser))
    
    subgraph UI_Layer [1. UI LAYER]
        UI[Next.js<br>TypeScript + React 19<br>Port: 3000]
    end
    
    subgraph Core_Engine [2. CORE ENGINE]
        Core[Rust Actix-Web<br>Port: 4001]
    end
    
    subgraph Services [Supporting Services]
        AI[3. AI SERVICE<br>Python FastAPI<br>Port: 4002]
        Worker[4. INFRASTRUCTURE WORKER<br>Go<br>Port: 4003]
        RealTime[5. REAL-TIME SERVICE<br>Node.js<br>Port: 4004]
    end
    
    subgraph Storage [6. DATA & STORAGE LAYER]
        DB[(PostgreSQL)]
        Cache[(Redis)]
        ObjectStore[(SeaweedFS)]
    end

    Users -- HTTPS --> UI
    UI -- REST / gRPC + JWT --> Core
    
    Core -- SQLx Client --> DB
    Core -- Pub/Sub & Sessions --> Cache
    Core -- File Uploads --> ObjectStore
    
    Core -- Events --> Cache
    AI -- Subscribe --> Cache
    Worker -- Jobs --> Cache
    
    Worker -- WebSocket --> RealTime
    RealTime -- Notifications --> Users
    
    classDef default fill:#f9f9f9,stroke:#333,stroke-width:2px;
    classDef ui fill:#e1f5fe,stroke:#0288d1;
    classDef core fill:#fce4ec,stroke:#c2185b;
    classDef ai fill:#f3e5f5,stroke:#7b1fa2;
    classDef worker fill:#e8f5e9,stroke:#388e3c;
    classDef realtime fill:#fff3e0,stroke:#f57c00;
    classDef db fill:#e0f7fa,stroke:#0097a7;
    
    class UI ui;
    class Core core;
    class AI ai;
    class Worker worker;
    class RealTime realtime;
    class DB,Cache,ObjectStore db;
```

---

## 2. Service Responsibilities

### Service 1: UI Layer (Next.js)
| Aspect | Detail |
|--------|--------|
| **Language** | TypeScript |
| **Framework** | Next.js 15 (App Router) + React 19 |
| **Port** | 3000 |
| **Role** | Render user interfaces, handle SSR/SEO |
| **Database Access** | None — calls backend services only |
| **Auth** | JWT-based (custom auth) |

### Service 2: Core Engine (Rust)
| Aspect | Detail |
|--------|--------|
| **Language** | Rust |
| **Framework** | Actix-Web |
| **Port** | 4001 |
| **Role** | Main gateway, security, transactions, Razorpay Integration |
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

### Service 6: Data & Storage Layer
| Component | Purpose |
|-----------|---------|
| **PostgreSQL 16** | Primary database — users, products, orders, wallets, escrow |
| **Redis 7** | Job queues (BullMQ), caching, rate limiting, pub/sub |
| **SeaweedFS 3.76** | Fast, distributed object storage for images, product assets |

---

## 3. Service Communication

| From | To | Protocol | Purpose |
|------|----|----------|---------|
| Next.js | Rust Core | REST + JWT | All API calls |
| Rust Core | PostgreSQL | TCP | Database operations |
| Rust Core | Redis | TCP | Publish events, Cache |
| Rust Core | SeaweedFS | HTTP | Store/Retrieve Assets |
| Go Worker | Redis | TCP | Consume jobs |
| Go Worker | GitHub API | HTTPS | Repo operations |
| Go Worker | Docker | TCP | Container management |
| Python AI | Redis | TCP | Subscribe to events |
| Python AI | PostgreSQL | TCP | Read data |
| Go Worker | Node.js Realtime | WebSocket | Send notifications |
| Node.js Realtime | Browser | WebSocket | Push to client |

---

## 4. Purchase Flow (End-to-End)

```mermaid
sequenceDiagram
    participant Buyer
    participant NextJS as 1. UI Layer (Next.js)
    participant Rust as 2. Core (Rust)
    participant Redis as Redis (Pub/Sub)
    participant Go as 4. Worker (Go)
    participant Node as 5. Real-Time (Node)
    participant GitHub
    
    Buyer->>NextJS: Clicks "Buy Now"
    NextJS->>Rust: Request with JWT
    Rust->>Rust: Verify JWT & Process Payment
    Rust->>Rust: Create Escrow Record (7 days hold)
    Rust->>Redis: Publish "repo_transfer_needed"
    Rust->>Redis: Publish "user_activity"
    Redis-->>Go: Pick up "repo_transfer_needed"
    Go->>GitHub: Bare-clone seller's repo
    Go->>GitHub: Create private repo for buyer
    Go->>GitHub: Push code to buyer's repo
    Go->>Rust: Update order status to "completed"
    Go->>Node: Fire "order_completed" event
    Node->>Buyer: WebSocket Notification
    Note over Buyer: "Success! Code delivered to your GitHub!"
    Note over Rust: After 7 days, auto-release Escrow
```

---

## 5. Deployment Architecture

```mermaid
flowchart TD
    CDN[Cloudflare<br>CDN + Tunnel / DDoS / SSL]
    
    subgraph Docker_Compose [Docker Compose - Single VPS or Cluster]
        UI[Next.js :3000]
        Core[Rust :4001]
        AI[Python :4002]
        Worker[Go :4003]
        RealTime[Node.js :4004]
        Storage[SeaweedFS :8333]
    end
    
    DB[(Managed PostgreSQL<br>Primary Database)]
    
    CDN --> Docker_Compose
    Docker_Compose --> DB
    
    classDef cdn fill:#ffcc80,stroke:#e65100;
    classDef container fill:#b3e5fc,stroke:#0288d1;
    classDef db fill:#c8e6c9,stroke:#2e7d32;
    
    class CDN cdn;
    class UI,Core,AI,Worker,RealTime,Storage container;
    class DB db;
```

---

## 6. Network Isolation & Security

To ensure maximum security and prevent unauthorized cross-service communication, services are isolated using **Docker Bridge Networks**:
- **`public_net`**: Only Next.js is exposed to the outside world via reverse proxy (Cloudflare Tunnels or Nginx).
- **`internal_api_net`**: Next.js communicates with Rust Core over this internal network.
- **`data_net`**: Rust Core, Go Worker, and Python AI communicate with PostgreSQL, Redis, and SeaweedFS over a strictly internal database network. UI layers and external connections cannot reach this network directly.

---

## 7. Scalability Strategy

| Level | Strategy |
|-------|----------|
| **Horizontal** | Docker containers can be scaled per service |
| **Database** | PostgreSQL handles connection pooling + read replicas |
| **Caching** | Redis caches frequent queries (products, categories) |
| **Queue** | Redis + BullMQ handles job processing asynchronously |
| **Object Storage** | SeaweedFS distributes files across nodes highly efficiently |
| **CDN** | Cloudflare serves static assets globally |
| **Rate Limiting** | Redis-based rate limiting per user/IP |

---

*Document Version: 1.3.0 | Last Updated: August 2026*
