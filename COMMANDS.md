# ⚓ KodeDock Master Commands & Sync Reference

This document contains all the essential commands for managing the **KodeDock 3-Repo Ecosystem**, syncing with open-source contributors, and orchestrating Docker containers.

---

## ⚡ Quick Shortcuts (Using `Makefile` or `./dock.sh`)

You don't need to type long commands! You can either run the interactive CLI or use single-word `make` shortcuts:

| Action | 🚀 1-Word Shortcut | 📋 Full Git / Docker Command |
| :--- | :--- | :--- |
| **Interactive Menu** | `./dock.sh` | Opens visual terminal UI with numbered options |
| **Push Web to Contributors** | `make push-web` | `git subtree push --prefix web web-public main` |
| **Pull Contributor Web PRs** | `make pull-web` | `git subtree pull --prefix web web-public main --squash` |
| **Push HQ to Admin Repo** | `make push-hq` | `git subtree push --prefix kodedock-hq hq-public main` |
| **Pull HQ PRs into Master** | `make pull-hq` | `git subtree pull --prefix kodedock-hq hq-public main --squash` |
| **Start Full Stack** | `make dev` | `docker compose up -d` |
| **Start Backend Only** | `make dev-backend` | `docker compose up -d postgres redis seaweedfs core-engine ai-service infra-worker realtime-service` |
| **Stop All Services** | `make stop` | `docker compose down` |
| **Check Health & Status** | `make status` | `docker compose ps` |
| **Stream Live Logs** | `make logs` | `docker compose logs -f` |

---

## 🌐 1. Repository Ecosystem Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       ⚓ KODEDOCK REPOSITORY LINKS                           │
├───────────────────────────────┬───────────────────────────┬─────────────────┤
│ 📦 REPOSITORY                 │ 🌐 GITHUB URL             │ 🔒 VISIBILITY   │
├───────────────────────────────┼───────────────────────────┼─────────────────┤
│ 1. KodeDock-web               │ github.com/Devshakya19/   │ 🟢 PUBLIC       │
│    (Marketplace Frontend)     │ KodeDock-web              │ (Contributors)  │
├───────────────────────────────┼───────────────────────────┼─────────────────┤
│ 2. kodedock-hq                │ github.com/Devshakya19/   │ 🔴 PRIVATE      │
│    (Admin Portal)             │ kodedock-hq               │ (Admin Team)    │
├───────────────────────────────┼───────────────────────────┼─────────────────┤
│ 3. KodeDock (Master)          │ Private Master Monorepo   │ 🔴 PRIVATE      │
│    (All-in-One Full Stack)    │ (Your local machine)      │ (You)           │
└───────────────────────────────┴───────────────────────────┴─────────────────┘
```

---

## 🔄 2. Git Subtree Syncing Details

### A. Working with `web/` (Contributors)

#### 1. Push your local `web/` changes to the public repo:
```bash
git subtree push --prefix web web-public main
# OR: make push-web
```

#### 2. Pull contributor PRs from `KodeDock-web` into your master repo:
```bash
git subtree pull --prefix web web-public main --squash
# OR: make pull-web
```
*(The `--squash` flag bundles contributor commits into 1 clean commit inside your master repo).*

---

### B. Working with `kodedock-hq/` (Admin Panel)

#### 1. Push your local `kodedock-hq/` changes to the private HQ repo:
```bash
git subtree push --prefix kodedock-hq hq-public main
# OR: make push-hq
```

#### 2. Pull HQ updates into your master repo:
```bash
git subtree pull --prefix kodedock-hq hq-public main --squash
# OR: make pull-hq
```

---

## 🐳 3. Docker & Stack Management

### Start All Services (Web + HQ + Backend + DB + S3 + Redis)
```bash
docker compose up -d
# OR: make dev
```

### Start Only Backend Services
```bash
make dev-backend
```

### Check Container Status
```bash
docker compose ps
# OR: make status
```

### View Live Logs for a Specific Service
```bash
docker compose logs -f core-engine   # Rust Core Engine logs
docker compose logs -f realtime-service # Node.js WebSocket logs
docker compose logs -f postgres         # PostgreSQL logs
```

### Stop Everything Cleanly
```bash
docker compose down
# OR: make stop
```

---

## 💻 4. Contributor Quick-Start Guide (Share with Contributors)

Contributors only need to run these 3 commands on their laptops:

```bash
git clone https://github.com/Devshakya19/KodeDock-web.git
cd KodeDock-web
npm install
npm run dev
```

Frontend will run locally on `http://localhost:3000` with hot reload!
