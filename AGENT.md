# 🤖 KodeDock Agent Guidelines

Welcome to the KodeDock project. This document serves as the primary rulebook for AI agents assisting with this project. 

> [!IMPORTANT]
> When working on this codebase, always adhere strictly to the following guidelines to maintain system integrity and security.

## 🏛️ 1. Core Architecture & Philosophy

- **Polyglot Microservices:** KodeDock is a distributed system with strict network segmentation. Never try to combine services into a monolith.
- **Security-First:** The platform handles financial transactions. Prioritize security (HttpOnly JWTs, Argon2 hashing, SQL parameterization, escaping inputs).
- **Isolated Networks:** Backend services operate on an isolated Docker bridge network. Only the Next.js proxy and WebSocket endpoints are exposed to the public internet.

## 🛠️ 2. Technology Stack Rules

### 🌐 Frontend (Next.js 15, React 19, Tailwind CSS v4, shadcn/ui)

| Rule | Description |
|------|-------------|
| **App Router** | Use the Next.js App Router (`app/` directory). |
| **Components** | Default to Server Components. Add `"use client"` only when necessary for interactivity, DOM manipulation, or React hooks. |
| **Styling** | Use Tailwind CSS utility classes and `shadcn/ui` components for a premium, glassmorphic design system. |
| **Data Fetching** | Prefer server-side data fetching. Proxy API requests securely through Next.js to hide backend endpoints. |
| **Security** | Do not expose backend tokens to the browser. Rely on HttpOnly cookies. |

### ⚙️ Core Engine (Rust, Actix-Web, SQLx)

| Rule | Description |
|------|-------------|
| **Database Access** | Use `sqlx` with compile-time checked queries (e.g., `sqlx::query!`). Never construct raw SQL strings to prevent SQL injections. |
| **Transactions** | Use PostgreSQL row-level locks (`FOR UPDATE`) for atomic wallet and escrow balance updates to prevent double-spending. |
| **Error Handling** | Use Rust's `Result` type robustly. Define custom application error enums for Actix-Web to return proper HTTP status codes. |
| **Rate Limiting** | Protect sensitive endpoints using Actix-Governor. |

### 🧠 AI Service (Python, FastAPI)

| Rule | Description |
|------|-------------|
| **Types** | Use strict Python type hinting and Pydantic models for request/response validation. |
| **Concurrency** | Use `async def` for I/O bound endpoints. Offload heavy ML tasks to background workers or ThreadPoolExecutors. |

### 🏗️ Infra Worker (Go)

| Rule | Description |
|------|-------------|
| **Concurrency** | Use goroutines safely. Avoid goroutine leaks. |
| **Task Processing** | Pull jobs securely from Redis. Handle long-running GitHub API interactions efficiently. |

### ⚡ Real-Time WS (Node.js, ws)

| Rule | Description |
|------|-------------|
| **Statelessness** | Do not store client state in memory. Use Redis Pub/Sub to scale WebSocket broadcasts across instances. |

## 💻 3. General Coding Standards

- **Clean Code:** Write readable, maintainable, and well-documented code. Add comments explaining *why* complex decisions were made.
- **No Hardcoded Secrets:** Never hardcode API keys, database URLs, or secrets in the code. Always use environment variables (`.env`).
- **File Uploads:** Upload assets and files directly to SeaweedFS (S3-compatible) using pre-signed URLs. Do not pass large binary streams through the backend API.

> [!WARNING]
> Hardcoded credentials will lead to immediate security failures. Always use the provided environment variable configurations.

## 🔧 4. Git & System Modification

- Only modify files related to the requested feature or bug fix.
- Do not alter `README.md`, `LICENSE`, `SECURITY`, or other core structural files without explicit user consent.
- Leave existing comments and docstrings intact unless modifying the logic they describe.

> [!NOTE]
> When modifying existing code, prioritize backwards compatibility and verify that adjacent tests or dependencies remain functional.
