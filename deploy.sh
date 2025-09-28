#!/bin/bash

# Security Recon Tool Deployment Script
# This script automates the deployment process on AWS EC2

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN=""
EMAIL=""
MONGODB_PASSWORD=""
JWT_SECRET=""

# Functions
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        print_error "This script should not be run as root"
        exit 1
    fi
}

# Check system requirements
check_requirements() {
    print_status "Checking system requirements..."
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    # Check if Git is installed
    if ! command -v git &> /dev/null; then
        print_error "Git is not installed. Please install Git first."
        exit 1
    fi
    
    print_success "All requirements met"
}

# Get user input
get_user_input() {
    print_status "Gathering configuration information..."
    
    if [[ -z "$DOMAIN" ]]; then
        read -p "Enter your domain name (e.g., recon.example.com): " DOMAIN
    fi
    
    if [[ -z "$EMAIL" ]]; then
        read -p "Enter your email address for SSL certificates: " EMAIL
    fi
    
    if [[ -z "$MONGODB_PASSWORD" ]]; then
        read -s -p "Enter MongoDB root password: " MONGODB_PASSWORD
        echo
    fi
    
    if [[ -z "$JWT_SECRET" ]]; then
        JWT_SECRET=$(openssl rand -base64 32)
        print_success "Generated JWT secret: $JWT_SECRET"
    fi
}

# Update system packages
update_system() {
    print_status "Updating system packages..."
    sudo apt update && sudo apt upgrade -y
    print_success "System updated"
}

# Install required packages
install_packages() {
    print_status "Installing required packages..."
    
    # Install Docker if not present
    if ! command -v docker &> /dev/null; then
        print_status "Installing Docker..."
        curl -fsSL https://get.docker.com -o get-docker.sh
        sudo sh get-docker.sh
        sudo usermod -aG docker $USER
        rm get-docker.sh
        print_success "Docker installed"
    fi
    
    # Install Docker Compose if not present
    if ! command -v docker-compose &> /dev/null; then
        print_status "Installing Docker Compose..."
        sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        sudo chmod +x /usr/local/bin/docker-compose
        print_success "Docker Compose installed"
    fi
    
    # Install other required packages
    sudo apt install -y curl wget git nginx certbot python3-certbot-nginx ufw
    print_success "Required packages installed"
}

# Configure firewall
configure_firewall() {
    print_status "Configuring firewall..."
    
    sudo ufw --force reset
    sudo ufw default deny incoming
    sudo ufw default allow outgoing
    sudo ufw allow ssh
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    sudo ufw --force enable
    
    print_success "Firewall configured"
}

# Clone repository
clone_repository() {
    print_status "Cloning repository..."
    
    if [[ -d "security-recon-tool" ]]; then
        print_warning "Repository already exists. Updating..."
        cd security-recon-tool
        git pull
    else
        git clone https://github.com/your-username/security-recon-tool.git
        cd security-recon-tool
    fi
    
    print_success "Repository ready"
}

# Configure environment
configure_environment() {
    print_status "Configuring environment..."
    
    cp env.example .env
    
    # Update .env file with user input
    sed -i "s/your-domain.com/$DOMAIN/g" .env
    sed -i "s/securepassword123/$MONGODB_PASSWORD/g" .env
    sed -i "s/your-super-secret-jwt-key-change-this-in-production/$JWT_SECRET/g" .env
    sed -i "s/NODE_ENV=development/NODE_ENV=production/g" .env
    
    print_success "Environment configured"
}

# Generate SSL certificates
generate_ssl_certificates() {
    print_status "Generating SSL certificates..."
    
    # Create SSL directory
    mkdir -p ssl
    
    # Generate self-signed certificates for initial setup
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout ssl/key.pem \
        -out ssl/cert.pem \
        -subj "/C=US/ST=State/L=City/O=Organization/CN=$DOMAIN"
    
    print_success "SSL certificates generated"
    
    # Note about Let's Encrypt
    print_warning "Self-signed certificates generated. For production, use Let's Encrypt:"
    print_warning "sudo certbot certonly --standalone -d $DOMAIN"
    print_warning "Then copy certificates to ./ssl/ directory"
}

# Build and start application
start_application() {
    print_status "Building and starting application..."
    
    # Build the application
    docker-compose build
    
    # Start the application
    docker-compose up -d
    
    # Wait for services to be ready
    print_status "Waiting for services to start..."
    sleep 30
    
    # Check if services are running
    if docker-compose ps | grep -q "Up"; then
        print_success "Application started successfully"
    else
        print_error "Failed to start application"
        docker-compose logs
        exit 1
    fi
}

# Configure Nginx
configure_nginx() {
    print_status "Configuring Nginx..."
    
    # Create Nginx configuration
    sudo tee /etc/nginx/sites-available/recon-tool > /dev/null <<EOF
server {
    listen 80;
    server_name $DOMAIN;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF
    
    # Enable the site
    sudo ln -sf /etc/nginx/sites-available/recon-tool /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
    
    # Test Nginx configuration
    sudo nginx -t
    
    # Restart Nginx
    sudo systemctl restart nginx
    sudo systemctl enable nginx
    
    print_success "Nginx configured"
}

# Setup SSL with Let's Encrypt
setup_ssl() {
    print_status "Setting up SSL with Let's Encrypt..."
    
    # Stop Nginx temporarily
    sudo systemctl stop nginx
    
    # Obtain SSL certificate
    sudo certbot certonly --standalone -d $DOMAIN --email $EMAIL --agree-tos --non-interactive
    
    # Copy certificates
    sudo cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem ssl/cert.pem
    sudo cp /etc/letsencrypt/live/$DOMAIN/privkey.pem ssl/key.pem
    sudo chown $USER:$USER ssl/*.pem
    
    # Update Nginx configuration for HTTPS
    sudo tee /etc/nginx/sites-available/recon-tool > /dev/null <<EOF
server {
    listen 80;
    server_name $DOMAIN;
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN;
    
    ssl_certificate /home/$USER/security-recon-tool/ssl/cert.pem;
    ssl_certificate_key /home/$USER/security-recon-tool/ssl/key.pem;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF
    
    # Start Nginx
    sudo systemctl start nginx
    
    # Setup auto-renewal
    echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
    
    print_success "SSL configured with Let's Encrypt"
}

# Setup monitoring
setup_monitoring() {
    print_status "Setting up monitoring..."
    
    # Create log rotation configuration
    sudo tee /etc/logrotate.d/recon-tool > /dev/null <<EOF
/home/$USER/security-recon-tool/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 $USER $USER
}
EOF
    
    # Create systemd service for auto-start
    sudo tee /etc/systemd/system/recon-tool.service > /dev/null <<EOF
[Unit]
Description=Security Recon Tool
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/$USER/security-recon-tool
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0
User=$USER

[Install]
WantedBy=multi-user.target
EOF
    
    # Enable the service
    sudo systemctl daemon-reload
    sudo systemctl enable recon-tool
    
    print_success "Monitoring configured"
}

# Verify installation
verify_installation() {
    print_status "Verifying installation..."
    
    # Check if application is accessible
    if curl -f -s http://localhost:5000/api/health > /dev/null; then
        print_success "Application is running and accessible"
    else
        print_error "Application is not accessible"
        return 1
    fi
    
    # Check if Nginx is working
    if curl -f -s http://$DOMAIN > /dev/null; then
        print_success "Nginx is working correctly"
    else
        print_warning "Nginx may not be working correctly"
    fi
    
    # Display access information
    print_success "Installation completed successfully!"
    echo
    echo "Access your Security Recon Tool at:"
    echo "  HTTP:  http://$DOMAIN"
    echo "  HTTPS: https://$DOMAIN"
    echo
    echo "Default admin credentials:"
    echo "  Email: admin@recon-tool.com"
    echo "  Password: (check MongoDB for default password)"
    echo
    echo "Useful commands:"
    echo "  View logs: docker-compose logs -f"
    echo "  Restart: docker-compose restart"
    echo "  Stop: docker-compose down"
    echo "  Update: git pull && docker-compose up -d --build"
}

# Main deployment function
main() {
    echo "🔒 Security Recon Tool Deployment Script"
    echo "========================================"
    echo
    
    check_root
    check_requirements
    get_user_input
    update_system
    install_packages
    configure_firewall
    clone_repository
    configure_environment
    generate_ssl_certificates
    start_application
    configure_nginx
    
    # Ask if user wants to setup Let's Encrypt
    read -p "Do you want to setup SSL with Let's Encrypt? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        setup_ssl
    fi
    
    setup_monitoring
    verify_installation
}

# Run main function
main "$@"
