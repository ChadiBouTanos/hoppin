#!/bin/bash

# SSL Setup Script for Hoppin Deployment
# Sets up free SSL certificates using Let's Encrypt with Docker

set -e

echo "🔒 Setting up SSL/HTTPS for Hoppin"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
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

# Get domain name from user
echo "Enter your domain name (e.g., yourdomain.com):"
read -p "Domain: " DOMAIN

if [ -z "$DOMAIN" ]; then
    print_error "Domain name is required!"
    exit 1
fi

# Get email for Let's Encrypt
echo ""
echo "Enter your email address for Let's Encrypt notifications:"
read -p "Email: " EMAIL

if [ -z "$EMAIL" ]; then
    print_error "Email is required!"
    exit 1
fi

# Ask about www subdomain
echo ""
read -p "Do you want to include www.$DOMAIN? (y/n): " INCLUDE_WWW

# Get server IP
SERVER_IP=$(curl -4 -s ifconfig.me)
print_status "Server IP: $SERVER_IP"

# Check DNS configuration
echo ""
print_info "Checking DNS configuration..."
DOMAIN_IP=$(dig +short $DOMAIN A | tail -n1)

if [ -z "$DOMAIN_IP" ]; then
    print_error "No DNS A record found for $DOMAIN"
    echo ""
    echo "📝 Please configure your DNS first:"
    echo "   1. Go to your domain provider's DNS settings"
    echo "   2. Add A record: @  ->  $SERVER_IP"
    if [[ $INCLUDE_WWW == "y" || $INCLUDE_WWW == "Y" ]]; then
        echo "   3. Add A record: www  ->  $SERVER_IP"
    fi
    echo "   4. Wait 10-30 minutes for DNS propagation"
    echo "   5. Run this script again"
    exit 1
fi

if [ "$DOMAIN_IP" != "$SERVER_IP" ]; then
    print_warning "DNS A record points to different IP"
    echo ""
    echo "Current DNS: $DOMAIN -> $DOMAIN_IP"
    echo "Server IP: $SERVER_IP"
    echo ""
    read -p "Continue anyway? (y/n): " continue_setup
    if [ "$continue_setup" != "y" ]; then
        exit 1
    fi
else
    print_status "DNS correctly configured! ($DOMAIN -> $SERVER_IP)"
fi

# Stop nginx temporarily
echo ""
print_info "Stopping Nginx temporarily..."
$SUDO docker-compose stop nginx
print_status "Nginx stopped"

# Create directory for certificates
$SUDO mkdir -p /etc/letsencrypt

# Build certbot command
CERTBOT_DOMAINS="-d $DOMAIN"
if [[ $INCLUDE_WWW == "y" || $INCLUDE_WWW == "Y" ]]; then
    CERTBOT_DOMAINS="$CERTBOT_DOMAINS -d www.$DOMAIN"
fi

# Get SSL certificate using Certbot Docker
echo ""
print_info "Obtaining SSL certificate from Let's Encrypt..."
echo "(This may take a minute...)"

$SUDO docker run --rm \
    -v /etc/letsencrypt:/etc/letsencrypt \
    -v /var/lib/letsencrypt:/var/lib/letsencrypt \
    -p 80:80 \
    certbot/certbot certonly \
    --standalone \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    $CERTBOT_DOMAINS

if [ $? -eq 0 ]; then
    print_status "SSL certificate obtained successfully!"
else
    print_error "Failed to obtain SSL certificate"
    echo ""
    echo "Possible reasons:"
    echo "1. Port 80 is blocked by firewall"
    echo "2. DNS is not yet propagated"
    echo "3. Domain is not pointing to this server"
    echo ""
    echo "Try: sudo ufw allow 80"
    echo "      sudo ufw allow 443"
    echo "Wait 30 minutes and try again"
    exit 1
fi

# Backup current nginx.conf
if [ -f nginx/nginx.conf ]; then
    print_status "Backing up current nginx.conf..."
    cp nginx/nginx.conf nginx/nginx.conf.backup
fi

# Build server_name directive
if [[ $INCLUDE_WWW == "y" || $INCLUDE_WWW == "Y" ]]; then
    SERVER_NAME="$DOMAIN www.$DOMAIN"
else
    SERVER_NAME="$DOMAIN"
fi

# Create new nginx.conf with SSL
print_info "Creating SSL-enabled Nginx configuration..."
cat > nginx/nginx.conf << NGINXCONF
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    upstream backend {
        server backend:8000;
    }
    
    # Redirect HTTP to HTTPS
    server {
        listen 80;
        listen [::]:80;
        server_name ${SERVER_NAME};
        
        # Allow Let's Encrypt challenges
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }
        
        # Redirect all other HTTP traffic to HTTPS
        location / {
            return 301 https://\$host\$request_uri;
        }
    }
    
    # HTTPS Server
    server {
        listen 443 ssl http2;
        listen [::]:443 ssl http2;
        server_name ${SERVER_NAME};
        
        # SSL configuration
        ssl_certificate /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;
        
        # Modern SSL settings
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
        ssl_prefer_server_ciphers off;
        ssl_session_cache shared:SSL:10m;
        ssl_session_timeout 1d;
        ssl_session_tickets off;
        
        # Security headers
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        
        client_max_body_size 100M;
        
        # Timeouts
        proxy_connect_timeout 600s;
        proxy_send_timeout 600s;
        proxy_read_timeout 600s;
        send_timeout 600s;
        
        # Images served by Django
        location /images/ {
            proxy_pass http://backend;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }

        # Backend API
        location /api/ {
            proxy_pass http://backend;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }

        # Django admin
        location /admin/ {
            proxy_pass http://backend;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }

        # Frontend - React app (must be last)
        location / {
            root /usr/share/nginx/html;
            try_files \$uri \$uri/ /index.html;
        }
    }
}
NGINXCONF

print_status "Nginx configuration created with SSL"

# Update docker-compose.yml to expose port 443 and mount SSL certificates
print_info "Updating docker-compose.yml..."

# Check if port 443 is already configured
if grep -q "443:443" docker-compose.yml; then
    print_warning "Port 443 already configured in docker-compose.yml"
else
    # Add port 443 to nginx service (after port 80)
    sed -i '/- "80:80"/a\      - "443:443"' docker-compose.yml
    print_status "Added port 443 to docker-compose.yml"
fi

# Check if SSL volume is already mounted
if grep -q "/etc/letsencrypt:/etc/letsencrypt" docker-compose.yml; then
    print_warning "SSL certificates already mounted in docker-compose.yml"
else
    # Find the nginx service volumes section and add SSL certificate mount
    # This assumes there's a volumes section under nginx service
    awk '/nginx:/{flag=1} flag && /volumes:/{print; print "      - /etc/letsencrypt:/etc/letsencrypt:ro"; flag=0; next} 1' docker-compose.yml > docker-compose.yml.tmp
    mv docker-compose.yml.tmp docker-compose.yml
    print_status "Added SSL certificate volume to docker-compose.yml"
fi

# Update backend .env with domain
if [ -f "backend/.env" ]; then
    print_info "Updating backend/.env with domain..."
    if grep -q "ALLOWED_HOSTS=" backend/.env; then
        sed -i "s/ALLOWED_HOSTS=.*/ALLOWED_HOSTS=${DOMAIN},www.${DOMAIN},localhost,127.0.0.1/" backend/.env
    else
        echo "ALLOWED_HOSTS=${DOMAIN},www.${DOMAIN},localhost,127.0.0.1" >> backend/.env
    fi
    print_status "Updated ALLOWED_HOSTS in backend/.env"
fi

# Open firewall ports if UFW is active
if command -v ufw &> /dev/null; then
    if $SUDO ufw status | grep -q "Status: active"; then
        print_info "Configuring firewall..."
        $SUDO ufw allow 80/tcp
        $SUDO ufw allow 443/tcp
        print_status "Firewall configured (ports 80 and 443 open)"
    fi
fi

# Restart services
echo ""
print_info "Restarting services with SSL enabled..."
$SUDO docker-compose up -d --force-recreate nginx

# Wait for services to start
sleep 10

# Test HTTPS
echo ""
print_info "Testing HTTPS connection..."
if curl -fsSL https://$DOMAIN/ > /dev/null 2>&1; then
    print_status "HTTPS is working!"
else
    print_warning "HTTPS test failed. Check logs: docker-compose logs nginx"
fi

# Set up auto-renewal cron job
echo ""
print_info "Setting up automatic certificate renewal..."

# Get current directory
CURRENT_DIR=$(pwd)

# Create renewal script
$SUDO bash -c "cat > /usr/local/bin/renew-ssl.sh" << RENEWSCRIPT
#!/bin/bash
docker run --rm \\
    -v /etc/letsencrypt:/etc/letsencrypt \\
    -v /var/lib/letsencrypt:/var/lib/letsencrypt \\
    -p 80:80 \\
    certbot/certbot renew --quiet

# Restart nginx if renewal was successful
if [ \$? -eq 0 ]; then
    cd $CURRENT_DIR && docker-compose restart nginx
fi
RENEWSCRIPT

$SUDO chmod +x /usr/local/bin/renew-ssl.sh

# Add to crontab (runs daily at 3 AM)
(crontab -l 2>/dev/null | grep -v renew-ssl.sh; echo "0 3 * * * /usr/local/bin/renew-ssl.sh >> /var/log/certbot-renew.log 2>&1") | crontab -

print_status "Auto-renewal configured (runs daily at 3 AM)"

# Success message
echo ""
echo "================================"
echo -e "${GREEN}✅ SSL Setup Complete!${NC}"
echo "================================"
echo ""
echo "🌐 Your site is now available at:"
echo "   ✓ https://$DOMAIN"
if [[ $INCLUDE_WWW == "y" || $INCLUDE_WWW == "Y" ]]; then
    echo "   ✓ https://www.$DOMAIN"
fi
echo "   ✓ https://$DOMAIN/api/"
echo "   ✓ https://$DOMAIN/admin/"
echo ""
echo "📝 IMPORTANT: Update your Django settings!"
echo "   Edit backend settings and ensure:"
echo "   - SECURE_SSL_REDIRECT = True"
echo "   - SESSION_COOKIE_SECURE = True"
echo "   - CSRF_COOKIE_SECURE = True"
echo "   - SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')"
echo ""
echo "   Then restart: docker-compose restart backend"
echo ""
echo "🔄 SSL certificates will auto-renew every 60 days"
echo "📋 View logs: docker-compose logs nginx"
echo ""
print_status "Done!"