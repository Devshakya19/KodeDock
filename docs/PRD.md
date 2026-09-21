# Kodedock - Product Requirements Document (PRD)

| **Document Version** | 1.0.0 |
| :--- | :--- |
| **Status** | Approved / Living Document |
| **Last Updated** | 2026-09-20 |
| **Target Audience** | Engineering, Product, Design, Founders |

---

## 1. Executive Summary & Vision

### 1.1 Vision Statement
**Kodedock** is a modern, developer-centric digital code commerce and marketplace ecosystem. It empowers software engineers, UI/UX designers, and tech creators to monetize their production-ready code, full-stack boilerplates, UI component libraries, AI agents, and DevOps assets, while enabling developers and companies to dramatically reduce their time-to-market.

### 1.2 Elevator Pitch
> *"Just as Docker Hub is the dock for container images, Kodedock is the high-performance dock for production-ready codebases, modern templates, and developer tooling."*

### 1.3 Core Philosophy & Security Architecture
- **Thin Presentation Frontends (`apps/*`)**: Frontend applications handle UI/UX presentation and state display only. Zero sensitive business logic or direct database interactions occur on the frontend.
- **Secure Backend Engine (`src/` & `api/`)**: All business logic, verification, payment validation, license generation, authentication via **Better Auth**, and encrypted asset delivery are governed strictly by the backend.
- **Verified Code Quality**: Automated and manual quality gates ensure that assets listed on Kodedock adhere to modern security standards, lack malicious dependencies, and provide authentic documentation.

---

## 2. Problem Statement & Market Opportunity

### 2.1 The Problem
1. **Legacy Marketplaces are Outdated**: Existing marketplaces (e.g., ThemeForest/Envato) are dominated by bloated, WordPress/PHP-centric templates that modern developers do not use.
2. **Fragmented Developer Commerce**: Indie hackers and creators sell SaaS boilerplates across fragmented Gumroad links, Substack newsletters, or Twitter DMs with no automated license enforcement, version updating, or secure source code hosting.
3. **High Reinvention Cost**: Developers spend hundreds of hours re-writing boilerplate code (auth, billing, database setup, UI layouts, AI integrations) for every new project.
4. **Trust & Security Deficit**: Downloading unverified zip files from random websites exposes engineering teams to supply-chain attacks, outdated dependencies, and broken code.

### 2.2 The Solution: Kodedock
- **Curated, Tech-Stack Focused Marketplace**: Built exclusively for modern stacks (Next.js, React, Vue, TypeScript, Tailwind, Go, Rust, Python, Docker).
- **Two-Sided Purpose-Built Dashboards**:
  - **Buyer Portal (`apps/portal`)**: Secure source downloads, automated license key management, version update notifications, invoice tracking.
  - **Creator Studio (`apps/studio`)**: Streamlined asset publishing, pricing tiers, version releases, revenue analytics, and automated payouts.
- **Enterprise-Grade Security**: Signed time-limited download URLs, cryptographic license keys, and Better Auth authentication.

---

## 3. User Personas & Roles

```
               ┌────────────────────────────────────────────────────────┐
               │                  User Personas & Roles                 │
               └───────────┬────────────────┬───────────────────────────┘
                           │                │
            ┌──────────────┴─────┐    ┌─────┴──────────────┐
            ▼                    ▼    ▼                    ▼
     ┌──────────────┐     ┌──────────────┐          ┌──────────────┐
     │  The Buyer   │     │  The Seller  │          │  The Admin   │
     │  (Developer) │     │  (Creator)   │          │  (Platform)  │
     └──────────────┘     └──────────────┘          └──────────────┘
```

### 3.1 The Buyer (Developer, Indie Hacker, Agency)
- **Role**: `BUYER`
- **Primary Touchpoints**: `apps/store`, `apps/portal`
- **Needs**:
  - Search by specific tech stack (e.g., "Next.js 15", "Better Auth", "Tailwind").
  - Live interactive demos and component sandboxes before purchasing.
  - Instant access to GitHub repository or downloadable clean zip file.
  - Transparent licensing terms (Personal vs Commercial).
  - Ongoing version updates (e.g., patch fixes, framework updates).

### 3.2 The Seller (Senior Engineer, Tech Creator, Designer)
- **Role**: `SELLER`
- **Primary Touchpoints**: `apps/studio`
- **Needs**:
  - Straightforward product listing flow with markdown description support, screenshots, and demo links.
  - Multiple licensing tiers (Single Project, Extended/Commercial, Team).
  - Version release management (v1.0.0, v1.1.0 with changelogs).
  - Real-time sales analytics, conversion rates, and revenue dashboards.
  - Automated payout integration (Stripe Connect).

### 3.3 The Platform Admin (Kodedock Ops)
- **Role**: `ADMIN`
- **Primary Touchpoints**: Admin Control Center / CLI
- **Needs**:
  - Asset review and approval pipeline (security, linting, authenticity check).
  - Dispute resolution and refund management.
  - Platform fee configuration and payout approvals.
  - User and seller moderation.

---

## 4. Product Portfolio & Application Architecture

| Application | Path | Target Audience | Primary Function |
| :--- | :--- | :--- | :--- |
| **Landing & Marketing** | `apps/www` | Public Visitors, Dev Community | Brand positioning, hero showcase, featured assets, pricing, central login/signup hub. |
| **Marketplace Store** | `apps/store` | Buyers | Search, discovery, filtering, product pages, reviews, checkout. |
| **Buyer Portal** | `apps/portal` | Authenticated Buyers | Purchased code downloads, license key management, invoices, support tickets. |
| **Creator Studio** | `apps/studio` | Verified Sellers | Asset creation, version uploads, sales telemetry, payout requests, buyer messaging. |
| **Developer Documentation** | `apps/docs` | All Developers | Guides, seller submission guidelines, API documentation, licensing specifications. |

---

## 5. Asset Taxonomy (What Sellers Can Sell)

Sellers on Kodedock can publish assets within seven primary categories:

```
                                  KODEDOCK CATALOG
                                         │
     ┌───────────┬───────────┬───────────┼───────────┬───────────┬───────────┐
     ▼           ▼           ▼           ▼           ▼           ▼           ▼
1. SaaS     2. UI Kits  3. AI Agents 4. Backend  5. DevOps   6. Tools &   7. DB &
Boilerplates & Dashboards & MCPs     Services    & Stacks   Extensions   Schemas
```

1. **Full-Stack SaaS Boilerplates**: Complete starter apps with authentication, billing, database, emails, and dashboards (e.g., Next.js + Better Auth + Stripe + Drizzle).
2. **UI Component Kits & Dashboards**: High-craft design systems, Tailwind/Shadcn packs, animated UI components (Framer Motion/Three.js), and admin panels.
3. **AI Agents & Custom MCP Servers**: LangChain / LlamaIndex workflows, Model Context Protocol servers for Cursor/Antigravity/Claude, prompt collections, and RAG pipelines.
4. **Backend Services & Microservices**: Authentication modules, payment processing webhooks, real-time WebSocket servers, BullMQ queue dispatchers.
5. **DevOps & Infrastructure-as-Code (IaC)**: Docker Compose multi-container environments, Kubernetes Helm charts, Terraform cloud deployment scripts.
6. **Developer Tools & Extensions**: VS Code extensions, Chrome dev extensions, terminal CLI tools (Node/Go/Rust).
7. **Database Schemas & Data Assets**: Production-tested PostgreSQL/Drizzle schemas, data migrations, industry-specific mock datasets.

---

## 6. Licensing & Commercial Model

### 6.1 License Types

| License Type | Scope | Usage Rights | Resale / Redistribution |
| :--- | :--- | :--- | :--- |
| **Standard / Personal** | 1 End Product | Personal projects, non-commercial use, internal learning. | Strictly Prohibited |
| **Commercial / Single SaaS** | 1 Commercial Product | 1 Revenue-generating SaaS or client application. | Prohibited (code cannot be resold as a template) |
| **Extended / Unlimited** | Unlimited Products | Unlimited client projects, internal enterprise tools. | Prohibited from standalone template resale |

### 6.2 Platform Economics & Pricing
- **Primary Currency**: Indian Rupee (**INR - ₹**) with 1-click UPI (GPay, PhonePe, Paytm), NetBanking, and Cards.
- **Minimum Listing Price Floor**: **₹299** (protects unit economics from gateway flat fees).
- **Total Deduction (Take Rate)**: **5.0% Total All-Inclusive** (covers payment gateway fees + platform fee combined).
- **Developer Net Earnings**: **95.0%** of net product price.
- **Payout Schedule**: Weekly automated payouts via direct Indian Bank Transfer (IMPS/NEFT) or UPI, subject to a 3-day verification escrow window.

---

## 7. Key User Journeys

### 7.1 Buyer Purchase & Download Journey
1. **Discovery**: Buyer visits `apps/store`, uses tech-stack filters (`Next.js`, `TypeScript`, `Better Auth`).
2. **Evaluation**: Inspects product details, live interactive preview, tech requirements, and customer reviews.
3. **Checkout**: Selects license type, clicks "Buy Now". If unauthenticated, a sleek modal opens (powered by `packages/auth`).
4. **Payment**: Secure payment processing via backend gateway.
5. **Fulfillment**: Order confirmed. Instant redirect to `apps/portal` where:
   - Unique cryptographically signed license key is generated.
   - Secure time-limited signed download link (S3/Cloudflare R2) is provided.
   - Optional GitHub repo invitation link dispatched.

### 7.2 Seller Publishing & Management Journey
1. **Onboarding**: Developer signs in via `apps/www` using Better Auth (GitHub OAuth recommended for developers).
2. **Seller Activation**: Completes seller profile and payout details in `apps/studio`.
3. **New Listing Creation**:
   - Title, slug, category, tech stack tags.
   - Markdown description, feature list, setup prerequisites.
   - Live demo URL, screenshots, preview video.
   - Code asset upload (Zip archive or connected GitHub repo).
   - Version tag (e.g., `v1.0.0`).
   - Pricing configuration across license tiers.
4. **Review & Publication**: Listing passes automated verification (security, structure) and goes live on `apps/store`.
5. **Maintenance**: Seller releases updates (`v1.1.0`), views revenue graphs, and initiates payouts.

---

## 8. Success Metrics (KPIs)

- **Gross Merchandise Value (GMV)**: Total sales volume across the platform.
- **Buyer Conversion Rate**: Percentage of `apps/store` visitors completing an asset purchase.
- **Active Verified Sellers**: Number of creators with at least 1 active, reviewed product listing.
- **Product Repeat Rate**: Buyers purchasing 2 or more products within 90 days.
- **Download Security & Uptime**: Zero unauthorized source-code leakages, 99.9% platform availability.

---

## 9. Release Roadmap

- **Phase 1: Foundation (Current)**:
  - Monorepo structure, pnpm workspace setup.
  - Better Auth integration (Backend + Shared Client).
  - Database schema definition & Core API architecture.
- **Phase 2: MVP Store & Studio**:
  - `apps/www` marketing landing page & authentication hub.
  - `apps/store` product catalog, filters, and product details view.
  - `apps/studio` product upload and basic sales tracking.
  - `apps/portal` digital downloads and license keys.
- **Phase 3: Commerce & Automation**:
  - Stripe / Lemon Squeezy payment integration.
  - Automated security scanning for submitted zip files.
  - Automated GitHub repository transfer/invitation system.
- **Phase 4: Community & Ecosystem**:
  - `apps/docs` comprehensive guides.
  - Seller review system, developer badges, CLI tool (`kodedock pull <asset-slug>`).
