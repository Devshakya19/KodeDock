#!/usr/bin/env bash

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m' # No Color

while true; do
  clear
  echo -e "${CYAN}=====================================================${NC}"
  echo -e "${BLUE}          ⚓ KODEDOCK DEVELOPER SUITE ⚓${NC}"
  echo -e "${CYAN}=====================================================${NC}"
  echo -e "  ${GREEN}[1]${NC} 🚀 Start Everything (Web + HQ + Backend)"
  echo -e "  ${GREEN}[2]${NC} ⚙️  Start Backend Services Only"
  echo -e "  ${RED}[3]${NC} 🛑 Stop Everything Cleanly"
  echo -e "${CYAN}  ---------------------------------------------------${NC}"
  echo -e "  ${YELLOW}[4]${NC} 📤 Push Web to Contributors (KodeDock-web)"
  echo -e "  ${YELLOW}[5]${NC} 📥 Pull Contributor Web PRs (Into Master)"
  echo -e "  ${YELLOW}[6]${NC} 📤 Push HQ to Admin Repo (kodedock-hq)"
  echo -e "  ${YELLOW}[7]${NC} 📥 Pull HQ PRs (Into Master)"
  echo -e "${CYAN}  ---------------------------------------------------${NC}"
  echo -e "  ${CYAN}[8]${NC} 📊 Check Health & Status of All Services"
  echo -e "  ${CYAN}[9]${NC} 📜 View Live Container Logs"
  echo -e "  ${RED}[0]${NC} 🚪 Exit"
  echo -e "${CYAN}=====================================================${NC}"
  read -p "Choose an option [0-9]: " choice

  case $choice in
    1)
      echo -e "\n${GREEN}Starting entire KodeDock stack...${NC}"
      docker compose up -d
      read -p "Press Enter to continue..."
      ;;
    2)
      echo -e "\n${GREEN}Starting backend services only...${NC}"
      docker compose up -d postgres redis seaweedfs core-engine ai-service infra-worker realtime-service
      read -p "Press Enter to continue..."
      ;;
    3)
      echo -e "\n${RED}Stopping all containers...${NC}"
      docker compose down
      read -p "Press Enter to continue..."
      ;;
    4)
      echo -e "\n${YELLOW}Pushing 'web/' subtree to 'web-public' (main branch)...${NC}"
      git subtree push --prefix web web-public main
      read -p "Press Enter to continue..."
      ;;
    5)
      echo -e "\n${YELLOW}Pulling contributor changes from 'web-public' into 'web/'...${NC}"
      git subtree pull --prefix web web-public main --squash
      read -p "Press Enter to continue..."
      ;;
    6)
      echo -e "\n${YELLOW}Pushing 'kodedock-hq/' subtree to 'hq-public' (main branch)...${NC}"
      git subtree push --prefix kodedock-hq hq-public main
      read -p "Press Enter to continue..."
      ;;
    7)
      echo -e "\n${YELLOW}Pulling changes from 'hq-public' into 'kodedock-hq/'...${NC}"
      git subtree pull --prefix kodedock-hq hq-public main --squash
      read -p "Press Enter to continue..."
      ;;
    8)
      echo -e "\n${CYAN}Checking container health & ports...${NC}"
      docker compose ps
      read -p "Press Enter to continue..."
      ;;
    9)
      echo -e "\n${CYAN}Streaming live logs (Press Ctrl+C to stop)...${NC}"
      docker compose logs -f
      read -p "Press Enter to continue..."
      ;;
    0)
      echo -e "\n${GREEN}Exiting. Happy coding! ⚓${NC}"
      exit 0
      ;;
    *)
      echo -e "\n${RED}Invalid option! Please choose between 0-9.${NC}"
      sleep 1
      ;;
  esac
done
