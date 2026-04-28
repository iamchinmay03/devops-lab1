#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════
#  PlaceNova - Quick Setup Script (Linux/Mac)
# ═══════════════════════════════════════════════════════════════════════

set -e

echo ""
echo "  ╔══════════════════════════════════════════════════╗"
echo "  ║       PlaceNova - Setting up your project       ║"
echo "  ╚══════════════════════════════════════════════════╝"
echo ""

# Check Node.js
echo "[1/5] Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo "  ❌ Node.js not found. Please install from https://nodejs.org"
    exit 1
fi
echo "  ✓ Node.js $(node --version) found"

# Check MongoDB
echo "[2/5] Checking MongoDB..."
if ! command -v mongod &> /dev/null; then
    echo "  ⚠ MongoDB not found. Make sure MongoDB is installed and running"
    echo "  ⚠ Or use Docker: docker run -d -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=admin -e MONGO_INITDB_ROOT_PASSWORD=adminpassword mongo:7.0"
else
    echo "  ✓ MongoDB found"
fi

# Install Backend Dependencies
echo "[3/5] Installing backend dependencies..."
cd "$(dirname "$0")/backend"
if [ ! -d "node_modules" ]; then
    npm install
else
    echo "  ✓ Backend dependencies already installed"
fi

# Install Frontend Dependencies
echo "[4/5] Installing frontend dependencies..."
cd "$(dirname "$0")/frontend"
if [ ! -d "node_modules" ]; then
    npm install
else
    echo "  ✓ Frontend dependencies already installed"
fi

# Create .env files if they don't exist
echo "[5/5] Setting up environment files..."
cd "$(dirname "$0")/backend"
if [ ! -f ".env" ]; then
    cp .env.example .env 2>/dev/null || true
    echo "  ✓ Created backend .env file"
fi

cd "$(dirname "$0")/frontend"
if [ ! -f ".env" ]; then
    cp .env.example .env 2>/dev/null || true
    echo "  ✓ Created frontend .env file"
fi

echo ""
echo "  ╔══════════════════════════════════════════════════╗"
echo "  ║              Setup Complete! 🎉                  ║"
echo "  ╚══════════════════════════════════════════════════╝"
echo ""
echo "  Next steps:"
echo "  ───────────────────────────────────────────────────"
echo "  1. Start MongoDB (or use Docker)"
echo "  2. Run: make dev"
echo "     OR"
echo "  3. Open two terminals:"
echo "     - Terminal 1: cd backend && npm run dev"
echo "     - Terminal 2: cd frontend && npm start"
echo ""
echo "  URLs:"
echo "  ───────────────────────────────────────────────────"
echo "  • Frontend: http://localhost:3000"
echo "  • Backend:  http://localhost:5000"
echo "  • Health:   http://localhost:5000/health"
echo ""