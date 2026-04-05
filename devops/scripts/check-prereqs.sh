#!/bin/bash
# ─── PlaceTrack — Pre-flight Check ───────────────────────────────────────────
# Verifies all required tools are installed before you begin

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

pass() { echo -e "${GREEN}  ✅ $1${NC}"; }
fail() { echo -e "${RED}  ❌ $1${NC}"; FAILED=1; }
warn() { echo -e "${YELLOW}  ⚠️  $1${NC}"; }

FAILED=0

echo ""
echo "  PlaceTrack — Environment Check"
echo "  ─────────────────────────────────────"

# Node.js
if node -v &>/dev/null; then
  NODE_VER=$(node -v | sed 's/v//')
  MAJOR=$(echo $NODE_VER | cut -d. -f1)
  [ "$MAJOR" -ge 18 ] && pass "Node.js $NODE_VER" || warn "Node.js $NODE_VER (recommend v20+)"
else
  fail "Node.js not found — install from nodejs.org"
fi

# npm
npm -v &>/dev/null && pass "npm $(npm -v)" || fail "npm not found"

# Docker
docker version &>/dev/null && pass "Docker $(docker version --format '{{.Server.Version}}')" || fail "Docker not running — start Docker Desktop"

# Docker Compose
docker compose version &>/dev/null && pass "Docker Compose" || fail "Docker Compose not found"

# MongoDB (optional local)
mongosh --version &>/dev/null && pass "mongosh (optional)" || warn "mongosh not installed (use Docker instead)"

# kubectl (optional)
kubectl version --client &>/dev/null && pass "kubectl $(kubectl version --client -o json | grep gitVersion | head -1 | tr -d '\",' | awk '{print $2}')" || warn "kubectl not installed (needed for K8s deploy)"

# AWS CLI (optional)
aws --version &>/dev/null && pass "AWS CLI $(aws --version 2>&1 | cut -d/ -f2 | cut -d' ' -f1)" || warn "AWS CLI not installed (needed for cloud deploy)"

# Trivy (optional)
trivy --version &>/dev/null && pass "Trivy $(trivy --version | head -1)" || warn "Trivy not installed (needed for security scan)"

echo ""
if [ "$FAILED" -eq 0 ]; then
  echo -e "${GREEN}  All required tools present. You're ready to go!${NC}"
  echo ""
  echo "  Next steps:"
  echo "    1. cp backend/.env.example backend/.env"
  echo "    2. Edit backend/.env (set JWT_SECRET)"
  echo "    3. make up          # Full Docker stack"
  echo "    4. make seed        # Load demo data"
  echo "    5. open http://localhost:3000"
else
  echo -e "${RED}  Some required tools are missing. Fix them before proceeding.${NC}"
  exit 1
fi
echo ""
