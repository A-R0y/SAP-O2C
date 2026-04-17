#!/usr/bin/env bash
# =============================================================
#  SAP O2C Dashboard — Master Setup & Run Script
#  Run this once from the sap-o2c-dashboard/ root folder:
#    chmod +x setup.sh && ./setup.sh
# =============================================================

set -e

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; RESET='\033[0m'

banner() {
  echo ""
  echo -e "${CYAN}╔══════════════════════════════════════════════════════╗${RESET}"
  echo -e "${CYAN}║         SAP Order-to-Cash Dashboard Setup            ║${RESET}"
  echo -e "${CYAN}║         Capstone Project — Full-Stack Setup          ║${RESET}"
  echo -e "${CYAN}╚══════════════════════════════════════════════════════╝${RESET}"
  echo ""
}

step() { echo -e "\n${BOLD}${YELLOW}▶ $1${RESET}"; }
ok()   { echo -e "  ${GREEN}✓ $1${RESET}"; }
info() { echo -e "  ${CYAN}ℹ $1${RESET}"; }

banner

# ── Check Node ──────────────────────────────────────────────
step "Checking prerequisites"
if ! command -v node &>/dev/null; then
  echo -e "${RED}✗ Node.js not found. Install from https://nodejs.org${RESET}"
  exit 1
fi
NODE_VER=$(node --version)
ok "Node.js $NODE_VER"
ok "npm $(npm --version)"

# ── Backend Setup ────────────────────────────────────────────
step "Installing backend dependencies"
cd backend
npm install
ok "Backend packages installed (Express, CORS, UUID)"
cd ..

# ── Frontend Setup ────────────────────────────────────────────
step "Installing frontend dependencies"
cd frontend
npm install
ok "Frontend packages installed (React, Vite, Axios)"
cd ..

# ── Create .env (optional) ────────────────────────────────────
echo "VITE_API_BASE=http://localhost:3000" > frontend/.env
ok "Frontend .env created"

# ── Done ─────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}${BOLD}╔══════════════════════════════════════════════════════╗${RESET}"
echo -e "${GREEN}${BOLD}║           ✓ Setup complete! Ready to launch.         ║${RESET}"
echo -e "${GREEN}${BOLD}╠══════════════════════════════════════════════════════╣${RESET}"
echo -e "${GREEN}${BOLD}║  Open TWO terminal windows and run:                  ║${RESET}"
echo -e "${GREEN}${BOLD}║                                                      ║${RESET}"
echo -e "${GREEN}${BOLD}║  Terminal 1 (Backend):                               ║${RESET}"
echo -e "${GREEN}${BOLD}║    cd backend && npm start                           ║${RESET}"
echo -e "${GREEN}${BOLD}║    → Runs on http://localhost:3000                   ║${RESET}"
echo -e "${GREEN}${BOLD}║                                                      ║${RESET}"
echo -e "${GREEN}${BOLD}║  Terminal 2 (Frontend):                              ║${RESET}"
echo -e "${GREEN}${BOLD}║    cd frontend && npm run dev                        ║${RESET}"
echo -e "${GREEN}${BOLD}║    → Opens at http://localhost:5173                  ║${RESET}"
echo -e "${GREEN}${BOLD}║                                                      ║${RESET}"
echo -e "${GREEN}${BOLD}║  OR use the launch script below for both at once:    ║${RESET}"
echo -e "${GREEN}${BOLD}║    ./run-all.sh                                      ║${RESET}"
echo -e "${GREEN}${BOLD}╚══════════════════════════════════════════════════════╝${RESET}"
echo ""
