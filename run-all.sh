#!/usr/bin/env bash
# =============================================================
#  run-all.sh  — Start backend + frontend concurrently
# =============================================================

# Install concurrently if not present
npx --yes concurrently \
  --names "BACKEND,FRONTEND" \
  --prefix-colors "cyan,magenta" \
  "cd backend && npm start" \
  "cd frontend && npm run dev"
