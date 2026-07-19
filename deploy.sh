#!/bin/bash
# ============================================
# FilmedIn — DigitalOcean Deploy Script
# ============================================
# Run this on your DigitalOcean server after:
#   1. Installing Docker & Docker Compose
#   2. Cloning the repo
#   3. Creating .env from .env.example
#
# Usage:
#   chmod +x deploy.sh
#   ./deploy.sh
# ============================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  FilmedIn — Deploy Script${NC}"
echo -e "${BLUE}========================================${NC}"

# ---------- Pre-flight checks ----------

echo -e "\n${YELLOW}[1/6] Pre-flight checks...${NC}"

if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker not found. Install it first:${NC}"
    echo "   curl -fsSL https://get.docker.com | sh"
    echo "   sudo usermod -aG docker \$USER"
    exit 1
fi

if ! docker compose version &> /dev/null; then
    echo -e "${RED}❌ Docker Compose not found. Install it first:${NC}"
    echo "   sudo apt install docker-compose-plugin"
    exit 1
fi

if [ ! -f .env ]; then
    echo -e "${RED}❌ .env file not found.${NC}"
    echo "   Create it and fill in your values (TMDB key, etc):"
    echo "   nano .env"
    exit 1
fi

echo -e "${GREEN}✅ Docker, Compose, and .env found${NC}"

# ---------- Pull latest code ----------

echo -e "\n${YELLOW}[2/6] Pulling latest code...${NC}"
git fetch --all 2>/dev/null && git reset --hard origin/main 2>/dev/null || echo "⚠️  Git pull failed or no remote"
echo -e "${GREEN}✅ Code up to date${NC}"

# ---------- Build containers ----------

echo -e "\n${YELLOW}[3/6] Building Docker images (using cache)...${NC}"
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1
docker compose build

# ---------- Stop old containers FIRST (before anything else) ----------

echo -e "\n${YELLOW}[3.5/6] Stopping old containers...${NC}"
docker compose down --remove-orphans 2>/dev/null || true
docker rm -f filmedin-backend filmedin-frontend 2>/dev/null || true
echo -e "${GREEN}✅ Old containers removed${NC}"

# ---------- Cleanup Database ----------

echo -e "\n${YELLOW}[4/6] Cleaning up database duplicates...${NC}"
echo -e "${GREEN}✅ Skipped (Cleanup script no longer needed)${NC}"

# ---------- Start containers ----------

echo -e "\n${YELLOW}[4.5/6] Starting containers...${NC}"
docker compose up -d
echo -e "${GREEN}✅ Containers started${NC}"

# ---------- Verify ----------

echo -e "\n${YELLOW}[5/6] Verifying services...${NC}"
sleep 5 # Wait a few seconds for services to boot

BACKEND_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/users/me 2>/dev/null || echo "000")
FRONTEND_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/ 2>/dev/null || echo "000")

# Note: Backend returns 401 Unauthorized for /me without token, which means the server is UP!
if [ "$BACKEND_RESPONSE" = "401" ] || [ "$BACKEND_RESPONSE" = "200" ]; then
    echo -e "   Backend  (port 5000): ${GREEN}✅ OK${NC}"
else
    echo -e "   Backend  (port 5000): ${RED}❌ HTTP $BACKEND_RESPONSE${NC}"
fi

if [ "$FRONTEND_RESPONSE" = "200" ]; then
    echo -e "   Frontend (port 3001): ${GREEN}✅ OK${NC}"
else
    echo -e "   Frontend (port 3001): ${RED}❌ HTTP $FRONTEND_RESPONSE${NC}"
fi

# ---------- Pruning ----------

echo -e "\n${YELLOW}[6/6] Pruning unused Docker images...${NC}"
docker system prune -f 2>/dev/null || true
echo -e "${GREEN}✅ Disk space freed${NC}"

echo -e "\n${BLUE}========================================${NC}"
echo -e "${GREEN}🚀 Deployment complete!${NC}"
echo -e "${BLUE}========================================${NC}"

echo -e "\nYour services are running at:"
echo -e "  Backend:  http://localhost:5000"
echo -e "  Frontend: http://localhost:3001"
echo -e "  Database: MongoDB Atlas (cloud)"
echo -e "\nLive at: https://filmedin.tanmaytiwari.me"

echo -e "\nUseful commands:"
echo "  docker compose logs -f          # View live logs"
echo "  docker compose logs backend     # Backend logs only"
echo "  docker compose restart          # Restart all services"
echo "  docker compose down             # Stop all services"
echo "  docker compose ps               # Check running status"
