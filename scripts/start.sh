#!/bin/bash
set -e

# Hotel Booking Platform - Full Stack Launcher
# Starts all services via Docker and opens the browser

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${CYAN}"
echo "============================================"
echo "   Hotel Booking Platform - Starting Up"
echo "============================================"
echo -e "${NC}"

# Check Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}Docker is not running. Please start Docker Desktop first.${NC}"
    exit 1
fi

# Stop any existing containers from this project
echo -e "${YELLOW}Stopping any existing containers...${NC}"
docker compose down --remove-orphans 2>/dev/null || true

# Kill anything already using our ports
PORTS=(5672 15672 1025 8025 5288 5289 5010 3000)
for port in "${PORTS[@]}"; do
    pid=$(lsof -ti :$port 2>/dev/null || true)
    if [ -n "$pid" ]; then
        echo -e "${YELLOW}Port $port in use (PID $pid) - killing...${NC}"
        kill -9 $pid 2>/dev/null || true
    fi
done
sleep 1

# Build and start all services
echo -e "${GREEN}Building and starting all services...${NC}"
docker compose up --build -d

# Wait for services to be healthy
echo -e "${YELLOW}Waiting for services to be ready...${NC}"

# Wait for backend (up to 60 seconds)
echo -n "  Backend API:    "
for i in $(seq 1 60); do
    if curl -s http://localhost:5288/api/health > /dev/null 2>&1 || curl -s http://localhost:5288/swagger/index.html > /dev/null 2>&1; then
        echo -e "${GREEN}Ready${NC}"
        break
    fi
    if [ "$i" -eq 60 ]; then
        echo -e "${YELLOW}Timeout (may still be starting)${NC}"
    fi
    sleep 1
    echo -n "."
done

# Wait for frontend (up to 30 seconds)
echo -n "  Frontend:       "
for i in $(seq 1 30); do
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo -e "${GREEN}Ready${NC}"
        break
    fi
    if [ "$i" -eq 30 ]; then
        echo -e "${YELLOW}Timeout (may still be starting)${NC}"
    fi
    sleep 1
    echo -n "."
done

# Print service URLs
echo ""
echo -e "${CYAN}============================================"
echo "   All Services Running!"
echo "============================================${NC}"
echo ""
echo -e "  ${GREEN}Frontend:${NC}        http://localhost:3000"
echo -e "  ${GREEN}Backend API:${NC}     http://localhost:5288"
echo -e "  ${GREEN}Swagger Docs:${NC}    http://localhost:5288/swagger"
echo -e "  ${GREEN}API Gateway:${NC}     http://localhost:5010"
echo -e "  ${GREEN}RabbitMQ UI:${NC}     http://localhost:15672  (guest/guest)"
echo -e "  ${GREEN}MailHog UI:${NC}      http://localhost:8025"
echo ""
echo -e "  ${YELLOW}To stop:${NC}  ./scripts/stop.sh  or  docker compose down"
echo ""

# Open browser
if [[ "$OSTYPE" == "darwin"* ]]; then
    open http://localhost:3000
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open http://localhost:3000 2>/dev/null || true
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
    start http://localhost:3000
fi

echo -e "${GREEN}Browser opened at http://localhost:3000${NC}"
