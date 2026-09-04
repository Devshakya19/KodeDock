.PHONY: help dev dev-backend stop push-web pull-web push-hq pull-hq status logs

help:
	@echo "====================================================="
	@echo "          ⚓ KODEDOCK DEVELOPER SHORTCUTS ⚓"
	@echo "====================================================="
	@echo "  make dev          - 🚀 Start entire stack (Web + HQ + Backend)"
	@echo "  make dev-backend  - ⚙️  Start backend services only"
	@echo "  make stop         - 🛑 Stop all running containers"
	@echo "  make push-web     - 📤 Push web/ updates to public KodeDock-web"
	@echo "  make pull-web     - 📥 Pull contributor PRs into master"
	@echo "  make push-hq      - 📤 Push kodedock-hq/ updates to private KodeDock-hq"
	@echo "  make pull-hq      - 📥 Pull HQ PRs into master"
	@echo "  make status       - 📊 Check health status of all containers"
	@echo "  make logs         - 📜 Stream live container logs"
	@echo "====================================================="

dev:
	docker compose up -d

dev-backend:
	docker compose up -d postgres redis seaweedfs core-engine ai-service infra-worker realtime-service

stop:
	docker compose down

push-web:
	git subtree push --prefix web web-public main

pull-web:
	git subtree pull --prefix web web-public main --squash

push-hq:
	git subtree push --prefix kodedock-hq hq-public main

pull-hq:
	git subtree pull --prefix kodedock-hq hq-public main --squash

status:
	docker compose ps

logs:
	docker compose logs -f
