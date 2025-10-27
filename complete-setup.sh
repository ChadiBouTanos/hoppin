#!/bin/bash

# Complete automated setup script for Hoppin deployment
# Run this script once you've uploaded all files to your VPS

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Hoppin Complete Setup Script        ║${NC}"
echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo ""

# Function to print section headers
print_section() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════${NC}"
}

# Function to check if command succeeded
check_success() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ $1${NC}"
    else
        echo -e "${RED}✗ $1 failed${NC}"
        exit 1
    fi
}

# Check if running as root or with sudo access
print_section "Checking Permissions"
if [[ $EUID -ne 0 ]]; then
   echo -e "${YELLOW}This script needs sudo privileges for some operations${NC}"
   echo -e "${YELLOW}You may be prompted for your password${NC}"
   SUDO='sudo'
else
   SUDO=''
fi

# Step 1: Update system packages
print_section "Step 1: Updating System Packages"
$SUDO apt update
check_success "System packages updated"

# Step 2: Install Docker if not installed
print_section "Step 2: Installing Docker"
if ! command -v docker &> /dev/null; then
    echo "Docker not found. Installing Docker..."
    $SUDO apt install -y apt-transport-https ca-certificates curl software-properties-common
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | $SUDO gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | $SUDO tee /etc/apt/sources.list.d/docker.list > /dev/null
    $SUDO apt update
    $SUDO apt install -y docker-ce docker-ce-cli containerd.io
    check_success "Docker installed"
else
    echo -e "${GREEN}✓ Docker already installed${NC}"
fi

# Step 3: Install Docker Compose if not installed
print_section "Step 3: Installing Docker Compose"
if ! command -v docker-compose &> /dev/null; then
    echo "Docker Compose not found. Installing..."
    $SUDO curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    $SUDO chmod +x /usr/local/bin/docker-compose
    check_success "Docker Compose installed"
else
    echo -e "${GREEN}✓ Docker Compose already installed${NC}"
fi

# Step 4: Add user to docker group
print_section "Step 4: Configuring Docker Permissions"
if groups $USER | grep &>/dev/null '\bdocker\b'; then
    echo -e "${GREEN}✓ User already in docker group${NC}"
else
    $SUDO usermod -aG docker $USER
    echo -e "${YELLOW}⚠ User added to docker group${NC}"
    echo -e "${YELLOW}⚠ You may need to log out and back in for this to take effect${NC}"
fi

# Step 5: Start Docker service
$SUDO systemctl enable docker
$SUDO systemctl start docker
check_success "Docker service started"

# Step 6: Create necessary directories
print_section "Step 5: Creating Directory Structure"
mkdir -p nginx
mkdir -p backend
mkdir -p frontend
check_success "Directories created"

# Step 7: Check for required files
print_section "Step 6: Checking Required Files"
MISSING_FILES=0

check_file() {
    if [ ! -f "$1" ]; then
        echo -e "${RED}✗ Missing: $1${NC}"
        MISSING_FILES=$((MISSING_FILES + 1))
    else
        echo -e "${GREEN}✓ Found: $1${NC}"
    fi
}

check_file "docker-compose.yml"
check_file "backend/Dockerfile"
check_file "frontend/Dockerfile"
check_file "nginx/nginx.conf"
check_file "backend/manage.py"
check_file "frontend/package.json"

if [ $MISSING_FILES -gt 0 ]; then
    echo -e "${RED}ERROR: $MISSING_FILES required files are missing!${NC}"
    echo -e "${YELLOW}Please ensure all files are uploaded before running this script${NC}"
    exit 1
fi

# Step 8: Configure environment variables
print_section "Step 7: Configuring Environment Variables"

# Backend .env file
if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}Creating backend/.env file...${NC}"
    read -p "Enter your VPS IP address or domain: " VPS_HOST
    read -p "Enter Django SECRET_KEY (or press Enter for auto-generated): " SECRET_KEY
    
    if [ -z "$SECRET_KEY" ]; then
        SECRET_KEY=$(openssl rand -base64 32)
        echo -e "${GREEN}Generated SECRET_KEY${NC}"
    fi
    
    cat > backend/.env << EOF
SECRET_KEY=${SECRET_KEY}
DEBUG=False
ALLOWED_HOSTS=${VPS_HOST},localhost,127.0.0.1
CORS_ALLOW_ALL=True
EOF
    check_success "Backend .env file created"
else
    echo -e "${GREEN}✓ backend/.env already exists${NC}"
fi

# Frontend .env file (if Gemini API key is needed)
if [ ! -f "frontend/.env" ]; then
    echo -e "${YELLOW}Frontend .env file not found${NC}"
    read -p "Do you have a Gemini API key to add? (y/n): " HAS_GEMINI
    if [[ $HAS_GEMINI == "y" || $HAS_GEMINI == "Y" ]]; then
        read -p "Enter your Gemini API key: " GEMINI_KEY
        cat > frontend/.env << EOF
GEMINI_API_KEY=${GEMINI_KEY}
EOF
        check_success "Frontend .env file created"
    fi
else
    echo -e "${GREEN}✓ frontend/.env already exists${NC}"
fi

# Step 9: Stop any existing containers
print_section "Step 8: Cleaning Up Previous Deployments"
if $SUDO docker-compose ps | grep -q "Up"; then
    echo "Stopping existing containers..."
    $SUDO docker-compose down
    check_success "Stopped existing containers"
else
    echo -e "${GREEN}✓ No existing containers to stop${NC}"
fi

# Step 10: Build and start containers
print_section "Step 9: Building Docker Containers"
echo -e "${YELLOW}This may take several minutes...${NC}"
$SUDO docker-compose build
check_success "Docker containers built"

# Step 11: Start containers
print_section "Step 10: Starting Containers"
$SUDO docker-compose up -d
check_success "Containers started"

# Wait for services to be ready
echo -e "${YELLOW}Waiting for services to initialize...${NC}"
sleep 15

# Step 12: Run Django migrations
print_section "Step 11: Running Database Migrations"
$SUDO docker-compose exec -T backend python manage.py migrate --noinput
check_success "Database migrations completed"

# Step 13: Collect static files
print_section "Step 12: Collecting Static Files"
$SUDO docker-compose exec -T backend python manage.py collectstatic --noinput
check_success "Static files collected"

# Step 14: Create superuser (optional)
print_section "Step 13: Creating Django Superuser (Optional)"
read -p "Do you want to create a Django admin superuser? (y/n): " CREATE_SUPER
if [[ $CREATE_SUPER == "y" || $CREATE_SUPER == "Y" ]]; then
    echo "You'll need to provide username, email, and password"
    $SUDO docker-compose exec backend python manage.py createsuperuser
fi

# Step 15: Show container status
print_section "Step 14: Deployment Status"
$SUDO docker-compose ps

# Step 16: Get server IP
SERVER_IP=$(hostname -I | awk '{print $1}')

# Final success message
echo ""
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   🎉 DEPLOYMENT SUCCESSFUL! 🎉        ║${NC}"
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo ""
echo -e "${GREEN}Your Hoppin application is now running!${NC}"
echo ""
echo -e "${BLUE}Access your application at:${NC}"
echo -e "  ${YELLOW}Frontend: http://${SERVER_IP}${NC}"
echo -e "  ${YELLOW}API: http://${SERVER_IP}/api/${NC}"
echo -e "  ${YELLOW}Admin: http://${SERVER_IP}/admin/${NC}"
echo ""
echo -e "${BLUE}Useful Commands:${NC}"
echo -e "  View logs: ${YELLOW}docker-compose logs -f${NC}"
echo -e "  Restart: ${YELLOW}docker-compose restart${NC}"
echo -e "  Stop: ${YELLOW}docker-compose down${NC}"
echo -e "  Rebuild: ${YELLOW}docker-compose up -d --build${NC}"
echo ""
echo -e "${BLUE}Logs Location:${NC}"
echo -e "  Backend: ${YELLOW}docker-compose logs backend${NC}"
echo -e "  Frontend: ${YELLOW}docker-compose logs frontend${NC}"
echo -e "  Nginx: ${YELLOW}docker-compose logs nginx${NC}"
echo ""
echo -e "${YELLOW}Note: If you added yourself to the docker group, you may need to${NC}"
echo -e "${YELLOW}log out and back in to run docker commands without sudo.${NC}"
echo ""