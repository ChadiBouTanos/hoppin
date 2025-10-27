#!/bin/bash

# Quick fix script for VPS - fixes CORS and image serving
# Run this on your VPS after uploading new files

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Quick Fix for CORS & Images         ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Get VPS IP
VPS_IP=$(hostname -I | awk '{print $1}')

# Step 1: Update backend .env
echo -e "${BLUE}Step 1: Updating backend/.env${NC}"
if [ -f "backend/.env" ]; then
    # Check if CORS_ALLOW_ALL exists
    if grep -q "CORS_ALLOW_ALL" backend/.env; then
        echo -e "${GREEN}✓ CORS_ALLOW_ALL already in .env${NC}"
    else
        echo "CORS_ALLOW_ALL=True" >> backend/.env
        echo -e "${GREEN}✓ Added CORS_ALLOW_ALL=True${NC}"
    fi
    
    # Update ALLOWED_HOSTS to include VPS IP
    sed -i "s/ALLOWED_HOSTS=.*/ALLOWED_HOSTS=${VPS_IP},localhost,127.0.0.1,backend/" backend/.env
    echo -e "${GREEN}✓ Updated ALLOWED_HOSTS with ${VPS_IP}${NC}"
else
    echo -e "${YELLOW}Creating backend/.env${NC}"
    cat > backend/.env << EOF
SECRET_KEY=$(openssl rand -base64 32)
DEBUG=False
ALLOWED_HOSTS=${VPS_IP},localhost,127.0.0.1,backend
CORS_ALLOW_ALL=True
EOF
    echo -e "${GREEN}✓ Created backend/.env${NC}"
fi

# Step 2: Restart containers
echo ""
echo -e "${BLUE}Step 2: Restarting containers${NC}"
docker-compose down
echo -e "${GREEN}✓ Stopped containers${NC}"

docker-compose up -d --build
echo -e "${GREEN}✓ Started containers${NC}"

# Wait for services
echo -e "${YELLOW}Waiting for services to start...${NC}"
sleep 10

# Step 3: Check status
echo ""
echo -e "${BLUE}Step 3: Checking container status${NC}"
docker-compose ps

# Step 4: Test backend
echo ""
echo -e "${BLUE}Step 4: Testing backend connection${NC}"
sleep 5
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/admin/ | grep -q "200\|301\|302"; then
    echo -e "${GREEN}✓ Backend is responding${NC}"
else
    echo -e "${YELLOW}⚠ Backend may still be starting up${NC}"
fi

# Show logs if there are errors
if docker-compose ps | grep -q "Exit"; then
    echo ""
    echo -e "${YELLOW}Some containers exited. Showing logs:${NC}"
    docker-compose logs --tail=50
fi

echo ""
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   Fix Applied!                         ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Your app should now work at:${NC}"
echo -e "  Frontend: ${YELLOW}http://${VPS_IP}${NC}"
echo -e "  API: ${YELLOW}http://${VPS_IP}/api/${NC}"
echo -e "  Images: ${YELLOW}http://${VPS_IP}/images/logo.png${NC}"
echo ""
echo -e "${BLUE}If you still have issues:${NC}"
echo -e "  1. Check backend logs: ${YELLOW}docker-compose logs backend${NC}"
echo -e "  2. Check frontend for localhost URLs in browser console"
echo -e "  3. Make sure frontend code uses relative URLs (/api/...)"
echo ""