#!/bin/bash

# Complete Docker Environment Cleanup Script
# This will remove ALL Docker containers, images, volumes, and networks

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${RED}╔════════════════════════════════════════╗${NC}"
echo -e "${RED}║   COMPLETE DOCKER CLEANUP SCRIPT      ║${NC}"
echo -e "${RED}║   ⚠️  THIS WILL DELETE EVERYTHING ⚠️   ║${NC}"
echo -e "${RED}╔════════════════════════════════════════╗${NC}"
echo ""

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Check if running with sudo
if [[ $EUID -ne 0 ]]; then
   SUDO='sudo'
else
   SUDO=''
fi

# Warning and confirmation
echo -e "${RED}This script will remove:${NC}"
echo "  • All Docker containers (running and stopped)"
echo "  • All Docker images"
echo "  • All Docker volumes (including databases!)"
echo "  • All Docker networks"
echo "  • All Docker build cache"
echo "  • .env files in backend and frontend"
echo "  • SSL certificates (optional)"
echo ""
print_warning "This action CANNOT be undone!"
echo ""
read -p "Are you absolutely sure you want to continue? (type 'yes' to confirm): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Cleanup cancelled."
    exit 0
fi

echo ""
echo -e "${BLUE}Starting cleanup...${NC}"
echo ""

# Step 1: Stop all running containers
print_info "Step 1: Stopping all running containers..."
if [ -f "docker-compose.yml" ]; then
    $SUDO docker-compose down 2>/dev/null || true
    print_status "Docker Compose stopped"
fi

# Stop all other running containers
RUNNING_CONTAINERS=$($SUDO docker ps -q)
if [ -n "$RUNNING_CONTAINERS" ]; then
    $SUDO docker stop $RUNNING_CONTAINERS
    print_status "All containers stopped"
else
    print_status "No running containers found"
fi

# Step 2: Remove all containers
print_info "Step 2: Removing all containers..."
ALL_CONTAINERS=$($SUDO docker ps -a -q)
if [ -n "$ALL_CONTAINERS" ]; then
    $SUDO docker rm -f $ALL_CONTAINERS
    print_status "All containers removed"
else
    print_status "No containers to remove"
fi

# Step 3: Remove all images
print_info "Step 3: Removing all Docker images..."
ALL_IMAGES=$($SUDO docker images -q)
if [ -n "$ALL_IMAGES" ]; then
    $SUDO docker rmi -f $ALL_IMAGES
    print_status "All images removed"
else
    print_status "No images to remove"
fi

# Step 4: Remove all volumes
print_info "Step 4: Removing all Docker volumes..."
ALL_VOLUMES=$($SUDO docker volume ls -q)
if [ -n "$ALL_VOLUMES" ]; then
    $SUDO docker volume rm -f $ALL_VOLUMES 2>/dev/null || true
    print_status "All volumes removed"
else
    print_status "No volumes to remove"
fi

# Step 5: Remove all networks (except default ones)
print_info "Step 5: Removing all custom Docker networks..."
ALL_NETWORKS=$($SUDO docker network ls --filter type=custom -q)
if [ -n "$ALL_NETWORKS" ]; then
    $SUDO docker network rm $ALL_NETWORKS 2>/dev/null || true
    print_status "All custom networks removed"
else
    print_status "No custom networks to remove"
fi

# Step 6: Prune everything
print_info "Step 6: Pruning Docker system..."
$SUDO docker system prune -a -f --volumes
print_status "Docker system pruned"

# Step 7: Remove environment files
print_info "Step 7: Removing environment files..."
if [ -f "backend/.env" ]; then
    rm backend/.env
    print_status "Removed backend/.env"
fi

if [ -f "frontend/.env" ]; then
    rm frontend/.env
    print_status "Removed frontend/.env"
fi

if [ -f ".env" ]; then
    rm .env
    print_status "Removed .env"
fi

# Step 8: Ask about SSL certificates
echo ""
read -p "Do you want to remove SSL certificates? (y/n): " remove_ssl

if [[ $remove_ssl == "y" || $remove_ssl == "Y" ]]; then
    if [ -d "/etc/letsencrypt" ]; then
        print_info "Removing SSL certificates..."
        $SUDO rm -rf /etc/letsencrypt
        $SUDO rm -rf /var/lib/letsencrypt
        print_status "SSL certificates removed"
    else
        print_status "No SSL certificates found"
    fi
fi

# Step 9: Remove cron job for SSL renewal
if crontab -l 2>/dev/null | grep -q "renew-ssl.sh"; then
    print_info "Removing SSL renewal cron job..."
    crontab -l | grep -v "renew-ssl.sh" | crontab -
    print_status "SSL renewal cron job removed"
fi

if [ -f "/usr/local/bin/renew-ssl.sh" ]; then
    $SUDO rm /usr/local/bin/renew-ssl.sh
    print_status "SSL renewal script removed"
fi

# Step 10: Backup nginx config
if [ -f "nginx/nginx.conf" ]; then
    print_info "Backing up nginx.conf..."
    cp nginx/nginx.conf nginx/nginx.conf.old
    print_status "nginx.conf backed up to nginx.conf.old"
fi

# Step 11: Show disk space recovered
echo ""
print_info "Checking disk space..."
df -h / | grep -v Filesystem

# Summary
echo ""
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   ✅ CLEANUP COMPLETE!                 ║${NC}"
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo ""
echo -e "${BLUE}What was removed:${NC}"
echo "  ✓ All Docker containers"
echo "  ✓ All Docker images"
echo "  ✓ All Docker volumes"
echo "  ✓ All Docker networks"
echo "  ✓ Docker build cache"
echo "  ✓ Environment files (.env)"
if [[ $remove_ssl == "y" || $remove_ssl == "Y" ]]; then
    echo "  ✓ SSL certificates"
fi
echo ""
echo -e "${BLUE}What remains:${NC}"
echo "  • Your source code (backend, frontend)"
echo "  • docker-compose.yml"
echo "  • nginx/nginx.conf.old (backup)"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Run your setup script again: ./setup.sh"
echo "  2. Or manually configure and run: docker-compose up -d --build"
echo ""
print_status "You can now start with a clean setup!"