#!/bin/bash

# Script to prepare your project for deployment
# Run this on your LOCAL machine before uploading to VPS

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Hoppin Project Preparation          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Check if we're in the right directory
if [ ! -d "backend" ]; then
    echo -e "${RED}Error: backend directory not found!${NC}"
    echo -e "${YELLOW}Please run this script from your HOPPIN project root${NC}"
    exit 1
fi

# Step 1: Generate requirements.txt from venv
echo -e "${BLUE}Step 1: Generating requirements.txt from venv${NC}"

if [ -d "backend/venv" ]; then
    echo "Found venv in backend/"
    cd backend
    source venv/bin/activate
    pip freeze > requirements.txt
    
    # Add gunicorn if not present
    if ! grep -q "gunicorn" requirements.txt; then
        echo "gunicorn==21.2.0" >> requirements.txt
        echo -e "${GREEN}✓ Added gunicorn to requirements.txt${NC}"
    fi
    
    # Add python-decouple if not present
    if ! grep -q "python-decouple" requirements.txt; then
        echo "python-decouple==3.8" >> requirements.txt
        echo -e "${GREEN}✓ Added python-decouple to requirements.txt${NC}"
    fi
    
    deactivate
    cd ..
    echo -e "${GREEN}✓ requirements.txt generated${NC}"
elif [ -d "venv" ]; then
    echo "Found venv in project root"
    source venv/bin/activate
    pip freeze > backend/requirements.txt
    
    # Add gunicorn if not present
    if ! grep -q "gunicorn" backend/requirements.txt; then
        echo "gunicorn==21.2.0" >> backend/requirements.txt
        echo -e "${GREEN}✓ Added gunicorn to requirements.txt${NC}"
    fi
    
    # Add python-decouple if not present
    if ! grep -q "python-decouple" backend/requirements.txt; then
        echo "python-decouple==3.8" >> backend/requirements.txt
        echo -e "${GREEN}✓ Added python-decouple to requirements.txt${NC}"
    fi
    
    deactivate
    echo -e "${GREEN}✓ requirements.txt generated${NC}"
else
    echo -e "${RED}Error: venv not found!${NC}"
    echo -e "${YELLOW}Please activate your venv and run:${NC}"
    echo -e "${YELLOW}  pip freeze > backend/requirements.txt${NC}"
    exit 1
fi

# Step 2: Create necessary directories
echo ""
echo -e "${BLUE}Step 2: Creating directory structure${NC}"
mkdir -p nginx
echo -e "${GREEN}✓ nginx/ directory created${NC}"

# Step 3: Check for Docker files
echo ""
echo -e "${BLUE}Step 3: Checking deployment files${NC}"

MISSING_FILES=0

check_file() {
    if [ ! -f "$1" ]; then
        echo -e "${RED}✗ Missing: $1${NC}"
        echo -e "${YELLOW}  Please create this file from the artifacts${NC}"
        MISSING_FILES=$((MISSING_FILES + 1))
    else
        echo -e "${GREEN}✓ Found: $1${NC}"
    fi
}

check_file "docker-compose.yml"
check_file "backend/Dockerfile"
check_file "frontend/Dockerfile"
check_file "nginx/nginx.conf"
check_file "complete-setup.sh"

# Step 4: Check backend/frontend structure
echo ""
echo -e "${BLUE}Step 4: Verifying project structure${NC}"

if [ -f "backend/manage.py" ]; then
    echo -e "${GREEN}✓ Django backend found${NC}"
else
    echo -e "${RED}✗ backend/manage.py not found${NC}"
    MISSING_FILES=$((MISSING_FILES + 1))
fi

if [ -f "frontend/package.json" ]; then
    echo -e "${GREEN}✓ React frontend found${NC}"
else
    echo -e "${RED}✗ frontend/package.json not found${NC}"
    MISSING_FILES=$((MISSING_FILES + 1))
fi

# Step 5: Create .env.example files
echo ""
echo -e "${BLUE}Step 5: Creating .env.example files${NC}"

if [ ! -f "backend/.env.example" ]; then
    cat > backend/.env.example << 'EOF'
SECRET_KEY=your-super-secret-key-change-this
DEBUG=False
ALLOWED_HOSTS=your-vps-ip,yourdomain.com,localhost,51.91.109.69
CORS_ALLOW_ALL=True
EOF
    echo -e "${GREEN}✓ Created backend/.env.example${NC}"
else
    echo -e "${GREEN}✓ backend/.env.example already exists${NC}"
fi

if [ ! -f "frontend/.env.example" ]; then
    cat > frontend/.env.example << 'EOF'
GEMINI_API_KEY=your-gemini-api-key-here
EOF
    echo -e "${GREEN}✓ Created frontend/.env.example${NC}"
else
    echo -e "${GREEN}✓ frontend/.env.example already exists${NC}"
fi

# Step 6: Create .dockerignore files
echo ""
echo -e "${BLUE}Step 6: Creating .dockerignore files${NC}"

if [ ! -f "backend/.dockerignore" ]; then
    cat > backend/.dockerignore << 'EOF'
venv/
__pycache__/
*.pyc
*.pyo
*.pyd
.Python
*.so
*.egg
*.egg-info
dist/
build/
.env
.git/
.gitignore
*.sqlite3
db.sqlite3
.vscode/
.idea/
EOF
    echo -e "${GREEN}✓ Created backend/.dockerignore${NC}"
else
    echo -e "${GREEN}✓ backend/.dockerignore already exists${NC}"
fi

if [ ! -f "frontend/.dockerignore" ]; then
    cat > frontend/.dockerignore << 'EOF'
node_modules/
.git/
.gitignore
.vscode/
.idea/
dist/
build/
*.log
EOF
    echo -e "${GREEN}✓ Created frontend/.dockerignore${NC}"
else
    echo -e "${GREEN}✓ frontend/.dockerignore already exists${NC}"
fi

# Step 7: Make scripts executable
echo ""
echo -e "${BLUE}Step 7: Making scripts executable${NC}"
chmod +x complete-setup.sh 2>/dev/null && echo -e "${GREEN}✓ complete-setup.sh is executable${NC}" || echo -e "${YELLOW}⚠ complete-setup.sh not found${NC}"

# Final summary
echo ""
echo -e "${BLUE}═══════════════════════════════════════${NC}"
if [ $MISSING_FILES -eq 0 ]; then
    echo -e "${GREEN}✓ All files ready!${NC}"
    echo ""
    echo -e "${GREEN}Your project is ready for deployment!${NC}"
    echo ""
    echo -e "${BLUE}Next steps:${NC}"
    echo -e "  1. Review backend/requirements.txt"
    echo -e "  2. Upload project to your VPS:"
    echo -e "     ${YELLOW}scp -r HOPPIN root@YOUR_VPS_IP:/root/${NC}"
    echo -e "  3. SSH to VPS and run:"
    echo -e "     ${YELLOW}cd HOPPIN && ./complete-setup.sh${NC}"
    echo ""
    echo -e "${BLUE}Files generated:${NC}"
    echo -e "  ${GREEN}✓${NC} backend/requirements.txt"
    echo -e "  ${GREEN}✓${NC} backend/.env.example"
    echo -e "  ${GREEN}✓${NC} frontend/.env.example"
    echo -e "  ${GREEN}✓${NC} backend/.dockerignore"
    echo -e "  ${GREEN}✓${NC} frontend/.dockerignore"
else
    echo -e "${RED}✗ Missing $MISSING_FILES file(s)${NC}"
    echo -e "${YELLOW}Please add the missing files from the artifacts before deploying${NC}"
    exit 1
fi

echo ""