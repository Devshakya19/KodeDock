import { CatalogProduct, ProductDetail } from "./types";

export const INITIAL_CATALOG: ProductDetail[] = [
  {
    id: "kd-prod-001",
    seller_id: "seller-001",
    title: "SaaS Multi-Tenant Boilerplate (Next.js 15 + Rust)",
    slug: "saas-multitenant-nextjs-rust",
    summary: "Production-grade multi-tenant architecture with subdomains, JWT token family rotation, Postgres RLS, and Stripe/Razorpay billing.",
    description: `### Complete Production SaaS Architecture

A battle-tested foundation for building high-scale B2B multi-tenant web applications. Built strictly with Zero-Mock standards.

#### Key Features Included:
- **Rust Backend Engine:** Powered by Actix-Web, Tokio, and SQLx with connection pooling.
- **Next.js 15 App Router:** Server actions, dynamic layout caching, and Tailwind CSS v4 styling.
- **Bank-Grade Fintech:** Double-entry ledger with integer paise currency calculations.
- **Docker Compose:** One-command local development with PostgreSQL, Redis, and MinIO/SeaweedFS.
- **Automated Tax Compliance:** Real-time CGST/SGST/IGST breakdown and Section 194-O 1% TDS calculation.`,
    asset_type: "code_boilerplate",
    base_price_paise: 499900, // ₹4,999.00
    status: "published",
    is_verified: true,
    sales_count: 38,
    rating_average: 4.95,
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    tags: ["Rust", "Next.js 15", "PostgreSQL", "Docker", "Stripe"],
    tech_stack: ["Rust", "Next.js", "PostgreSQL", "Docker", "Redis"],
    seller: {
      username: "alex_rustacean",
      verified: true,
      rating: 4.98,
      sales: 142,
    },
    demo_url: "https://demo.kodedock.com/saas-preview",
    github_repo_url: "https://github.com/kodedock-verified/saas-core",
    security_scan: {
      is_clean: true,
      ast_tree_verified: true,
      secrets_leaked_count: 0,
      entropy_scan_status: "PASSED (0 High-Entropy Keys Found)",
      inspected_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
    escrow_terms: {
      inspection_hours: 48,
      tds_rate_percent: 1.0,
      gst_rate_percent: 18.0,
      platform_fee_percent: 3.5,
    },
  },
  {
    id: "kd-prod-002",
    seller_id: "seller-002",
    title: "AI Semantic Vector Search Engine & RAG Pipeline",
    slug: "ai-vector-search-rag-pipeline",
    summary: "Sub-5ms semantic document indexing with pgvector, HNSW indexing, chunking workers, and hybrid BM25 re-ranking in Python and Go.",
    description: `### Production-Ready RAG & Vector Engine

Scalable semantic vector retrieval system designed for high-throughput enterprise document question-answering.

#### Core Modules:
- **pgvector HNSW Indexing:** 1536-dimensional embeddings with cosine distance operators.
- **Asynchronous Ingestion Worker:** Tokio async channel with backpressure and bounded queues.
- **Hybrid Retrieval:** Dense cosine vector similarity combined with sparse BM25 lexical ranking.
- **REST & gRPC APIs:** High-performance Go microservice with Actix-Web gateway.`,
    asset_type: "api_microservice",
    base_price_paise: 799900, // ₹7,999.00
    status: "published",
    is_verified: true,
    sales_count: 22,
    rating_average: 4.9,
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    tags: ["Go", "Python", "pgvector", "RAG", "Docker"],
    tech_stack: ["Go", "Python", "pgvector", "Docker"],
    seller: {
      username: "neural_vault",
      verified: true,
      rating: 4.92,
      sales: 87,
    },
    demo_url: "https://rag-demo.kodedock.com",
    github_repo_url: "https://github.com/kodedock-verified/rag-engine",
    security_scan: {
      is_clean: true,
      ast_tree_verified: true,
      secrets_leaked_count: 0,
      entropy_scan_status: "PASSED (Clean Tree-Sitter Parse)",
      inspected_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
    escrow_terms: {
      inspection_hours: 48,
      tds_rate_percent: 1.0,
      gst_rate_percent: 18.0,
      platform_fee_percent: 3.5,
    },
  },
  {
    id: "kd-prod-003",
    seller_id: "seller-003",
    title: "Cross-Platform Fintech Wallet App (Flutter + Go)",
    slug: "flutter-go-fintech-wallet-app",
    summary: "Bank-grade mobile wallet with QR code payments, biometric authentication, double-entry ledger, and encrypted offline storage.",
    description: `### Mobile Fintech Application & Ledger Engine

Complete cross-platform iOS & Android mobile application with banking compliance and real-time transaction notifications.

#### Highlights:
- **Flutter 3.x UI:** Custom dark neomorphic theme with 60fps animations.
- **Go Distributed Ledger:** ACID transactions with row-level locks and append-only audit trail.
- **Biometric 2FA:** FaceID and TouchID hardware authentication integration.
- **Offline Sync:** AES-256 encrypted SQLite database with conflict-free replication.`,
    asset_type: "code_boilerplate",
    base_price_paise: 999900, // ₹9,999.00
    status: "published",
    is_verified: true,
    sales_count: 19,
    rating_average: 4.88,
    created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    tags: ["Flutter", "Go", "PostgreSQL", "Mobile", "Fintech"],
    tech_stack: ["Flutter", "Go", "PostgreSQL", "Docker"],
    seller: {
      username: "fintech_forge",
      verified: true,
      rating: 4.85,
      sales: 64,
    },
    demo_url: "https://wallet.kodedock.com/preview",
    github_repo_url: "https://github.com/kodedock-verified/fintech-wallet",
    security_scan: {
      is_clean: true,
      ast_tree_verified: true,
      secrets_leaked_count: 0,
      entropy_scan_status: "PASSED (0 Hardcoded Secrets)",
      inspected_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    },
    escrow_terms: {
      inspection_hours: 48,
      tds_rate_percent: 1.0,
      gst_rate_percent: 18.0,
      platform_fee_percent: 3.5,
    },
  },
  {
    id: "kd-prod-004",
    seller_id: "seller-004",
    title: "Real-Time WebSocket Collaboration Suite (Rust + React)",
    slug: "realtime-websocket-collab-suite",
    summary: "CRDT-based collaborative canvas and document editor with sub-10ms state synchronization, presence indicators, and Redis streams.",
    description: `### Real-Time Multiplayer Collaboration Infrastructure

High-throughput distributed canvas and document editor engine using Conflict-Free Replicated Data Types (CRDTs).

#### Technical Specifications:
- **Rust WebSocket Actor System:** Powered by Actix-Web actors with bounded Tokio channels.
- **Redis Pub/Sub & Streams:** Multi-node session broadcast with room partitioning.
- **React Canvas Frontend:** Canvas rendering at 120Hz with undo/redo and live cursor presence.
- **Zero Memory Bottlenecks:** Chunked binary message protocol using MessagePack serialization.`,
    asset_type: "code_boilerplate",
    base_price_paise: 649900, // ₹6,499.00
    status: "published",
    is_verified: true,
    sales_count: 31,
    rating_average: 4.96,
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    tags: ["Rust", "React", "WebSockets", "Redis", "CRDT"],
    tech_stack: ["Rust", "React", "Redis", "Docker"],
    seller: {
      username: "stream_master",
      verified: true,
      rating: 4.94,
      sales: 110,
    },
    demo_url: "https://collab.kodedock.com",
    github_repo_url: "https://github.com/kodedock-verified/collab-suite",
    security_scan: {
      is_clean: true,
      ast_tree_verified: true,
      secrets_leaked_count: 0,
      entropy_scan_status: "PASSED (Tree-Sitter Syntax Verified)",
      inspected_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    },
    escrow_terms: {
      inspection_hours: 48,
      tds_rate_percent: 1.0,
      gst_rate_percent: 18.0,
      platform_fee_percent: 3.5,
    },
  },
];
