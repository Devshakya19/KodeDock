# CodeHaat — India's Digital Code Marketplace

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: light)" srcset="assets/banner.jpg">
    <img src="assets/banner.jpg" alt="CodeHaat — India's #1 Digital Code Marketplace" width="100%">
  </picture>
</p>

<p align="center">
  <a href="https://github.com/Devshakya19/CodeHaat/actions"><img src="https://img.shields.io/github/actions/workflow/status/Devshakya19/CodeHaat/ci.yml?branch=main&style=flat-square&label=CI" alt="CI Status"></a>
  <a href="https://github.com/Devshakya19/CodeHaat/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-Proprietary-red?style=flat-square" alt="License: Proprietary"></a>
  <a href="https://nodejs.org/en"><img src="https://img.shields.io/badge/node-%3E%3D%2020.x-brightgreen?style=flat-square" alt="Node.js ≥ 20"></a>
  <a href="https://www.rust-lang.org/"><img src="https://img.shields.io/badge/rust-%3E%3D%201.70-orange?style=flat-square" alt="Rust ≥ 1.70"></a>
  <a href="https://docs.docker.com/"><img src="https://img.shields.io/badge/docker-%3E%3D%2024.0-blue?style=flat-square" alt="Docker ≥ 24.0"></a>
  <img src="https://img.shields.io/badge/version-1.3.0-informational?style=flat-square" alt="Version 1.3.0">
</p>

> **⚠️ PROPRIETARY SOFTWARE** — This repository contains proprietary and confidential code owned by CodeHaat.
> Unauthorized copying, cloning, distribution, or use of this code is strictly prohibited and may result in legal action.
> See [LICENSE](LICENSE) for full terms.

---

## Table of Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Access & Security](#access--security)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Service Responsibilities](#service-responsibilities)
- [Security Mitigations](#security-mitigations)
- [Documentation](#documentation)
- [Contributors](#contributors)
- [License](#license)

---

## Overview

**CodeHaat** is India's premier digital code marketplace connecting developers who build production-grade code assets with businesses and developers who need them. Unlike traditional platforms that distribute static `.zip` archives, CodeHaat delivers purchased code directly to buyers' private GitHub repositories — providing a seamless, version-controlled experience from day one.

The platform is built on a highly optimized polyglot microservices architecture. It leverages the raw performance of Rust for its financial core, Next.js for a premium frontend experience, Go for background automation, Python for AI-driven recommendations, and Node.js for real-time WebSocket capabilities.

---

## How It Works

1. 📤 **Sellers Upload:** Developers upload their code repositories or link their private GitHub repos to the platform.
2. 🛒 **Buyers Purchase:** Buyers browse the marketplace, review products, and purchase them securely via Razorpay (INR-native).
3. 🔒 **Escrow Protection:** Funds are held in a secure database escrow for 7 days. If a dispute is raised, admins intervene. Otherwise, the funds are automatically released to the seller's wallet.
4. 🚀 **Instant Delivery:** Upon successful payment, CodeHaat's background infrastructure automatically duplicates the purchased codebase into the buyer's GitHub account as a private repository.

---

## Access & Security

CodeHaat is designed **security-first** across every layer of the stack. To prevent external tampering, the platform utilizes strict network segmentation and deep defense mechanisms.

### Network Topology & Access

```mermaid
graph TD
    classDef public fill:#e53e3e,stroke:#c53030,color:#fff,stroke-width:2px;
    classDef proxy fill:#3182ce,stroke:#2b6cb0,color:#fff,stroke-width:2px;
    classDef private fill:#38a169,stroke:#2f855a,color:#fff,stroke-width:2px;

    Internet(("🌐 Public Internet")):::public
    Proxy["🛡️ Next.js Reverse Proxy\n(Only Exposed Node)"]:::proxy
    
    subgraph isolated_network [🔒 Isolated Internal Docker Network]
        RustCore["⚙️ Rust Core Engine"]:::private
        PythonAI["🧠 Python AI Service"]:::private
        GoWorker["🛠️ Go Infra Worker"]:::private
        DB[("🐘 PostgreSQL")]:::private
        Redis[("🔥 Redis")]:::private
        Storage[("☁️ SeaweedFS")]:::private
    end

    Internet -- "HTTPS (Port 443)" --> Proxy
    Proxy -- "Internal Routing" --> RustCore
    RustCore --> DB
    RustCore --> Redis
    RustCore --> Storage
```

- **Public Entry Points:** Only the main web interface (Next.js proxy) and WebSocket endpoints are exposed securely.
- **Internal Microservices:** All backend services operate exclusively on an **isolated, internal Docker bridge network**. They are completely invisible to the public internet and can only be accessed through authorized internal routing from the proxy.
- **Database/Cache Isolation:** PostgreSQL, Redis, and SeaweedFS instances do not expose their connection protocols outside the internal container network.

---

## Key Features

CodeHaat packs powerful features to ensure a premium experience for both buyers and sellers:

| Feature Category | Capabilities & Details |
|-----------------|------------------------|
| 🔐 **Identity & Auth** | • **HttpOnly JWTs:** Tokens never exposed to JS.<br>• **Argon2 Hashing:** GPU-resistant password security.<br>• **GitHub OAuth:** 1-click secure onboarding.<br>• **RBAC:** Multi-tier user/developer/admin roles. |
| 💳 **Fintech & Escrow** | • **Razorpay Integration:** Native INR payments & top-ups.<br>• **Atomic Transactions:** DB-level row locks prevent double spending.<br>• **7-Day Escrow Hold:** Funds held securely to protect buyers.<br>• **Low Commission:** 2.5% platform fee. |
| 📦 **Code Delivery** | • **GitHub Repo Duplication:** Buyers receive code as private repos, not zip files.<br>• **Deferred Uploads:** Images & assets upload directly to S3 storage via pre-signed URLs only upon publish. |
| 💬 **Engagement** | • **Real-time Notifications:** WebSockets via Redis Pub/Sub.<br>• **Seller Reviews:** Analytics, average rating, star distributions, and buyer feedback.<br>• **Live Dashboards:** Auto-polling sales counters and wallet balances. |
| 🤖 **AI Intelligence** | • **Smart Search:** FastAPI-powered semantic searching.<br>• **Personalization:** Algorithmic product recommendations *(In Development)*. |

---

## Tech Stack

We utilize a Polyglot Microservices architecture, selecting the best language for each specific job:

### 🌐 Frontend & UI
- <img src="https://img.shields.io/badge/Next.js-black?style=flat-square&logo=next.js&logoColor=white" /> **Next.js 15 (React 19)** – Server-Side Rendering (SSR), SEO, and secure API Proxying.
- <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white" /> **Tailwind CSS v4** & **shadcn/ui** – Premium, glassmorphic design system.

### ⚙️ Backend & Microservices
- <img src="https://img.shields.io/badge/Rust-000000?style=flat-square&logo=rust&logoColor=white" /> **Rust (Actix-Web & SQLx)** – The Core Engine. Blazing fast, memory-safe handling of payments, auth, and DB transactions.
- <img src="https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white" /> **Python (FastAPI)** – AI Service for smart search and data modeling.
- <img src="https://img.shields.io/badge/Go-00ADD8?style=flat-square&logo=go&logoColor=white" /> **Go** – Infra Worker. Concurrent execution of background tasks and GitHub API automations.
- <img src="https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white" /> **Node.js (ws)** – High-concurrency WebSocket server for real-time notifications.

### 🗄️ Infrastructure & Storage
- <img src="https://img.shields.io/badge/PostgreSQL-316192?style=flat-square&logo=postgresql&logoColor=white" /> **PostgreSQL 16** – Primary relational data store with advanced triggers.
- <img src="https://img.shields.io/badge/Redis-DC382D?style=flat-square&logo=redis&logoColor=white" /> **Redis 7** – High-speed caching and inter-service Pub/Sub message broker.
- <img src="https://img.shields.io/badge/SeaweedFS-005571?style=flat-square&logo=seaweedfs&logoColor=white" /> **SeaweedFS** – S3-compatible, ultra-fast distributed object storage for images and codebase binaries.
- <img src="https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white" /> **Docker Compose** – Containerized environment orchestration.

---

## Architecture

The system operates across highly isolated microservices that communicate through strict internal bridges. 

```mermaid
graph TD
    %% Define styles
    classDef user fill:#2d3748,stroke:#4a5568,color:#fff,stroke-width:2px;
    classDef frontend fill:#3182ce,stroke:#2b6cb0,color:#fff,stroke-width:2px;
    classDef core fill:#e53e3e,stroke:#c53030,color:#fff,stroke-width:2px;
    classDef microservice fill:#805ad5,stroke:#6b46c1,color:#fff,stroke-width:2px;
    classDef database fill:#38a169,stroke:#2f855a,color:#fff,stroke-width:2px;

    %% Nodes
    User(("🌐 External Users\n(Browser/Mobile)")):::user

    FE["💻 Next.js Frontend\n(UI & API Proxy)"]:::frontend
    
    CORE["⚙️ Rust Core Engine\n(Auth, Payments, Escrow)"]:::core

    DB[("🐘 PostgreSQL\n(Primary Data Store)")]:::database
    CACHE[("🔥 Redis\n(Cache & Pub/Sub)")]:::database
    STORAGE[("☁️ SeaweedFS\n(S3 Object Storage)")]:::database

    AI["🧠 AI Service\n(Python)"]:::microservice
    WORKER["🛠️ Infra Worker\n(Go)"]:::microservice
    RT["⚡ Real-Time WS\n(Node.js)"]:::microservice

    %% Connections
    User -- "HTTPS / WSS" --> FE
    User -- "WSS" --> RT
    
    FE -- "Internal REST" --> CORE
    
    CORE -- "Atomic Queries" --> DB
    CORE -- "Cache & State" --> CACHE
    CORE -- "Blob/Assets" --> STORAGE

    AI -- "Analytics Data" --> DB
    WORKER -- "Background Jobs" --> CACHE
    RT -- "Subscribes" --> CACHE
```

---

## Service Responsibilities

To maintain a secure, decoupled ecosystem, each service acts independently within the private cluster.

| Service | Technology Focus | Core Responsibility |
|---------|------------------|---------------------|
| 💻 **Frontend Proxy** | TypeScript / Next.js | Serves as the public-facing application and Secure API Proxy. Manages HttpOnly cookies to defend against XSS, shielding backend tokens from browser exposure. |
| ⚙️ **Core Engine** | Rust / Actix-Web | The heart of the platform. Handles JWT verification, wallet balances, escrow locks, product CRUD, and high-stakes database transactions safely with zero data races. |
| 🧠 **AI Service** | Python / FastAPI | Powers intelligent marketplace features, including semantic search, product recommendations, and automated fraud detection signals. |
| 🛠️ **Infra Worker** | Go | Handles long-running background tasks securely, including interacting with the GitHub API to automate repository duplication and syncs for buyers. |
| ⚡ **Real-Time WS** | Node.js / ws | Dedicated WebSocket handler. Listens to internal Redis Pub/Sub channels to push real-time notifications to users globally with minimal latency. |

---

## Security Mitigations

We employ rigorous security measures to protect users, creators, and financial transactions.

```mermaid
graph LR
    classDef auth fill:#2b6cb0,stroke:#fff,color:#fff;
    classDef data fill:#2f855a,stroke:#fff,color:#fff;
    classDef network fill:#c53030,stroke:#fff,color:#fff;
    classDef finance fill:#d69e2e,stroke:#fff,color:#fff;

    Shield((🛡️ Security<br>Shield))

    Shield --> Auth[🔐 Authentication]:::auth
    Auth -.-> JWT(HttpOnly JWTs)
    Auth -.-> Argon2(Argon2 Hashing)
    Auth -.-> OAuth(OAuth Validation)

    Shield --> Data[💾 Data Protection]:::data
    Data -.-> SQL(Compile-time SQL Parameterization)
    Data -.-> Locks(Database Row-Level Locks)
    Data -.-> S3(Pre-signed URL Uploads)

    Shield --> Net[🕸️ Network & Traffic]:::network
    Net -.-> Docker(Isolated Docker Bridges)
    Net -.-> Proxy(Reverse Proxy Shielding)
    Net -.-> Rate(Actix Governor Rate Limiting)

    Shield --> Fin[💳 Fintech Security]:::finance
    Fin -.-> Webhook(HMAC-SHA256 Webhook Verification)
    Fin -.-> Escrow(7-Day Escrow Hold)
    Fin -.-> Atomic(Atomic Balance Updates)
```

### 🛡️ Threat Mitigations Details

| 🚨 Threat Scenario | 🛡️ Mitigation Implementation | 🔍 Deep Dive |
|-------------------|---------------------------|-------------|
| **XSS (Cross-Site Scripting)** | **HttpOnly JWTs** | Tokens are completely invisible to browser JavaScript, negating payload extraction. |
| **Brute Force / Rainbow Tables** | **Argon2 Hashing** | Uses GPU/ASIC-resistant memory-hard hashing for maximum password security. |
| **SQL Injection (SQLi)** | **SQLx Parameterization** | Enforces compile-time parameterized queries across all Rust handlers; raw strings are never executed. |
| **DDoS / API Spam** | **Actix-Governor** | Enforces strict, IP-based rate limiting on sensitive endpoints (e.g., Auth, Uploads, Checkout). |
| **Payment Spoofing** | **HMAC-SHA256 Verification** | Payment webhooks are validated using constant-time string comparison to prevent timing attacks. |
| **Race Conditions / Double Spends** | **Atomic DB Transactions** | Wallet updates use atomic `FOR UPDATE` row locks in PostgreSQL to ensure sequential ledger updates. |
| **Malicious File Uploads** | **Pre-signed URLs** | Uploads bypass backend APIs and go directly to SeaweedFS via temporary, size-restricted pre-signed URLs. |

To report a security vulnerability, please email **security@codehaat.com**. See [SECURITY](SECURITY) for our responsible disclosure policy.

---

## Documentation

CodeHaat maintains comprehensive documentation for developers, contributors, and auditors.

| Area | Documentation Link | Description |
|------|-------------------|-------------|
| 📖 **API** | [API_REFERENCE.md](API_REFERENCE.md) | Complete REST API reference, endpoints, payloads, and response codes. |
| 🛡️ **Security** | [SECURITY.md](SECURITY.md) | Detailed breakdown of our security architecture, threat models, and policies. |
| 📝 **Changelog** | [CHANGE.md](CHANGE.md) | Ongoing log of platform updates, bug fixes, and feature additions. |
| 🤝 **Contributing** | [CONTRIBUTING.md](CONTRIBUTING.md) | Guidelines for contributing code, architecture standards, and team info. |

---

## Contributors

<!-- readme: contributors -start -->
<p align="center">
  <a href="https://github.com/Devshakya19"><img src="https://avatars.githubusercontent.com/u/285248958?v=4&s=64" width="64px;" style="border-radius: 50%; margin: 5px;" alt="Devshakya19"/></a>
  <a href="https://github.com/RzaMohammed"><img src="https://avatars.githubusercontent.com/u/182957211?v=4&s=64" width="64px;" style="border-radius: 50%; margin: 5px;" alt="RzaMohammed"/></a>
</p>
<!-- readme: contributors -end -->

---

## License

This project is **proprietary software** owned by CodeHaat. All rights reserved.

- Unauthorized copying, cloning, or distribution is **strictly prohibited**
- See [LICENSE](LICENSE) for the complete license agreement
- Licensing inquiries: **legal@codehaat.me**

---

<p align="center">Built with passion for the Indian developer community 🇮🇳</p>
