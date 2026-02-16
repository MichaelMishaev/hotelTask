#!/bin/bash

# Hotel Booking Platform - Stop All Services

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${RED}Stopping all Hotel Booking services...${NC}"
docker compose down --remove-orphans
echo -e "${GREEN}All services stopped.${NC}"
