# CodeHaat Developer Onboarding Guide

This guide will help you set up the CodeHaat development environment and understand the codebase structure.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Running the Application](#running-the-application)
4. [Codebase Overview](#codebase-overview)
5. [Development Workflow](#development-workflow)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, ensure you have the following installed:

- [Docker](https://docs.docker.com/get-docker/) (v20.10+)
- [Docker Compose](https://docs.docker.com/compose/install/) (v2.0+)
- [Node.js](https://nodejs.org/) (v20+) - for frontend development
- [Rust](https://www.rust-lang.org/tools/install) - for backend development
- [Git](https://git-scm.com/)

## Environment Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Devshakya19/CodeHaat.git
cd CodeHaat
```

### 2. Run the Setup Script

The repository includes an interactive setup script that will:
- Check for Docker and Docker Compose
- Prompt for Razorpay and GitHub API keys (optional for development)
- Generate secure secrets for JWT, database, and Redis
- Create the `.env` file
- Build and start all services using Docker Compose

```bash
chmod +x setup.sh
./setup.sh
```

### 3. Manual Environment Setup (Alternative)

If you prefer to configure manually:

```bash
# Copy environment templates
cp .env.example .env
cp services/core-engine/.env.example services/core-engine/.env
cp services/ai-service/.env.example services/ai-service/.env
cp services/infra-worker/.env.example services/infra-worker/.env
cp services/realtime-service/.env.example services/realtime-service/.env
cp config/seaweedfs/s3.json.example config/seaweedfs/s3.json

# Edit .env files with your configuration
# (You can leave Razorpay/GitHub keys empty for development)
```

### 4. Verify the Setup

Run the test script to ensure all services are healthy:

```bash
./test-docker.sh
```

You should see output indicating all services are healthy.

## Running the Application

### Using Docker Compose (Recommended)

```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f

# Stop all services
docker compose down

# Rebuild after code changes
docker compose up -d --build
```

### Local Development

For faster iteration during development, you can run services individually:

#### Frontend (Next.js)
```bash
cd apps/web
npm install
npm run dev    # Runs on http://localhost:3001
```

#### Backend (Rust Core Engine)
```bash
cd services/core-engine
cargo run      # Runs on http://localhost:4001
```

#### Other Services
Follow similar patterns for AI Service (Python), Infra Worker (Go), and Real-time Service (Node.js).

## Codebase Overview

CodeHaat is a polyglot microservices architecture with five main services:

### 1. Frontend (`apps/web/`)
- **Technology**: Next.js 16, React 19, TypeScript
- **Purpose**: User interface, server-side rendering for SEO
- **Key Directories**:
  - `app/` - Next.js routes and API proxy
  - `features/` - Feature-specific components (auth, browse, seller, etc.)
  - `shared/` - Shared components, utilities, and API client

### 2. Core Engine (`services/core-engine/`)
- **Technology**: Rust, Actix-Web
- **Purpose**: Main API gateway, security, transactions, wallet management
- **Key Features**: JWT authentication, escrow system, payment processing
- **Port**: 4001

### 3. AI Service (`services/ai-service/`)
- **Technology**: Python, FastAPI
- **Purpose**: Recommendations, search, fraud detection
- **Key Features**: Product recommendations, AI-powered search
- **Port**: 4002

### 4. Infra Worker (`services/infra-worker/`)
- **Technology**: Go
- **Purpose**: Background jobs, GitHub operations, Docker management
- **Key Features**: Repository transfers, preview builds, email processing
- **Port**: 4003

### 5. Real-time Service (`services/realtime-service/`)
- **Technology**: Node.js, WebSocket (ws library)
- **Purpose**: Live notifications, real-time updates
- **Key Features**: WebSocket connections, Redis pub/sub, user presence
- **Port**: 4004

### Infrastructure
- **PostgreSQL**: Primary database (14 tables including users, products, orders, wallets)
- **Redis**: Job queues, caching, rate limiting, pub/sub
- **SeaweedFS**: S3-compatible object storage for product images and avatars

## Development Workflow

### Making Changes

1. **Frontend Changes**: Modify files in `apps/web/src/` and see changes immediately with `npm run dev`
2. **Backend Changes**: 
   - Rust: Modify files in `services/core-engine/src/` and restart with `cargo run`
   - Python: Modify files in `services/ai-service/app/` and restart the service
   - Go: Modify files in `services/infra-worker/` and restart the service
   - Node.js: Modify files in `services/realtime-service/src/` and restart the service

### Database Migrations

Database schema is managed through SQL files in `sql/`. The schema is automatically applied on container startup.

### API Development

All frontend API calls go through the Next.js proxy (`/api/proxy/[...path]`) which:
- Forwards requests to the Rust backend (Core Engine)
- Adds authentication from HttpOnly cookies
- Provides SSRF protection through path whitelisting

## Testing

Currently, the codebase does not have automated test suites. Testing is primarily done through:
- Manual verification via the user interface
- Direct API testing with tools like curl or Postman
- Docker health checks

To verify your changes:
1. Start the affected service(s)
2. Test the modified endpoints
3. Check logs for errors
4. Verify frontend behavior

## Troubleshooting

See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for common issues and solutions.

## Useful Commands

```bash
# View running services
docker compose ps

# View logs for a specific service
docker compose logs -f core-engine

# Enter a service container for debugging
docker compose exec core-engine sh

# Check environment variables in a container
docker compose exec core-engine env

# Rebuild a specific service
docker compose build core-engine

# Remove all data (use with caution!)
docker compose down -v
```

## Getting Help

If you encounter issues:
1. Check the troubleshooting guide
2. Look at service logs with `docker compose logs -f [service]`
3. Verify environment variables are set correctly
4. Ensure ports are not conflicting with other applications
5. Consult the architecture documentation in `docs/02-ARCHITECTURE.md`

Welcome to the CodeHaat development team!