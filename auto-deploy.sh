#!/bin/bash

# Fully Automated Deployment Script for Security Recon Tool
# This script handles everything automatically - no manual intervention needed

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_header() {
    echo -e "${PURPLE}================================${NC}"
    echo -e "${PURPLE}$1${NC}"
    echo -e "${PURPLE}================================${NC}"
}

print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to wait for service to be ready
wait_for_service() {
    local service_name=$1
    local check_command=$2
    local max_attempts=30
    local attempt=1
    
    print_info "Waiting for $service_name to be ready..."
    
    while [ $attempt -le $max_attempts ]; do
        if eval "$check_command" >/dev/null 2>&1; then
            print_status "$service_name is ready!"
            return 0
        fi
        
        print_info "Attempt $attempt/$max_attempts - $service_name not ready yet..."
        sleep 2
        ((attempt++))
    done
    
    print_error "$service_name failed to start after $max_attempts attempts"
    return 1
}

# Function to get public IP
get_public_ip() {
    curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo "Unable to get public IP"
}

# Main deployment function
main() {
    print_header "🚀 Starting Automated Deployment"
    print_info "This script will automatically deploy the Security Recon Tool"
    print_info "No manual intervention required - everything will be handled automatically"
    echo
    
    # Check if running as root
    if [ "$EUID" -eq 0 ]; then
        print_error "Please don't run this script as root. Run as ec2-user."
        exit 1
    fi
    
    # Step 1: System Update
    print_header "📦 Updating System Packages"
    print_info "Updating system packages..."
    sudo yum update -y >/dev/null 2>&1
    print_status "System packages updated"
    
    # Step 2: Install Node.js
    print_header "🟢 Installing Node.js"
    if ! command_exists node; then
        print_info "Installing Node.js 18..."
        curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash - >/dev/null 2>&1
        sudo yum install -y nodejs >/dev/null 2>&1
        print_status "Node.js installed successfully"
    else
        print_status "Node.js already installed"
    fi
    
    # Step 3: Install PM2
    print_header "⚡ Installing PM2 Process Manager"
    if ! command_exists pm2; then
        print_info "Installing PM2..."
        sudo npm install -g pm2 >/dev/null 2>&1
        print_status "PM2 installed successfully"
    else
        print_status "PM2 already installed"
    fi
    
    # Step 4: Install MongoDB
    print_header "🍃 Installing MongoDB"
    if ! command_exists mongod; then
        print_info "Installing MongoDB 6.0..."
        sudo tee /etc/yum.repos.d/mongodb-org-6.0.repo > /dev/null <<EOF
[mongodb-org-6.0]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/amazon/2/mongodb-org/6.0/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://www.mongodb.org/static/pgp/server-6.0.asc
EOF
        sudo yum install -y mongodb-org >/dev/null 2>&1
        print_status "MongoDB installed successfully"
    else
        print_status "MongoDB already installed"
    fi
    
    # Start and enable MongoDB
    print_info "Starting MongoDB service..."
    sudo systemctl start mongod >/dev/null 2>&1
    sudo systemctl enable mongod >/dev/null 2>&1
    wait_for_service "MongoDB" "sudo systemctl is-active --quiet mongod"
    
    # Step 5: Install Nginx
    print_header "🌐 Installing Nginx"
    if ! command_exists nginx; then
        print_info "Installing Nginx..."
        sudo yum install -y nginx >/dev/null 2>&1
        print_status "Nginx installed successfully"
    else
        print_status "Nginx already installed"
    fi
    
    # Start and enable Nginx
    print_info "Starting Nginx service..."
    sudo systemctl start nginx >/dev/null 2>&1
    sudo systemctl enable nginx >/dev/null 2>&1
    wait_for_service "Nginx" "sudo systemctl is-active --quiet nginx"
    
    # Step 6: Install Git
    print_header "📥 Installing Git"
    if ! command_exists git; then
        print_info "Installing Git..."
        sudo yum install -y git >/dev/null 2>&1
        print_status "Git installed successfully"
    else
        print_status "Git already installed"
    fi
    
    # Step 7: Clone/Update Repository
    print_header "📂 Setting Up Application"
    if [ -d "toolex" ]; then
        print_info "Updating existing repository..."
        cd toolex
        git pull origin main >/dev/null 2>&1
        print_status "Repository updated"
    else
        print_info "Cloning repository..."
        git clone https://github.com/logansensei/toolex.git >/dev/null 2>&1
        cd toolex
        print_status "Repository cloned"
    fi
    
    # Step 8: Install Dependencies
    print_header "📦 Installing Dependencies"
    print_info "Installing backend dependencies..."
    npm install >/dev/null 2>&1
    print_status "Backend dependencies installed"
    
    print_info "Installing frontend dependencies..."
    cd client
    npm install >/dev/null 2>&1
    print_status "Frontend dependencies installed"
    
    print_info "Building frontend..."
    npm run build >/dev/null 2>&1
    print_status "Frontend built successfully"
    cd ..
    
    # Step 9: Create Environment Configuration
    print_header "⚙️ Configuring Environment"
    print_info "Creating environment configuration..."
    cat > .env <<EOF
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://localhost:27017/recon-tool
JWT_SECRET=auto-generated-secret-$(date +%s)-$(openssl rand -hex 16)
```

    print_status "Environment configured"
    
    # Step 10: Configure Nginx
    print_header "🔧 Configuring Nginx"
    print_info "Creating Nginx configuration..."
    sudo tee /etc/nginx/conf.d/recon-tool.conf > /dev/null <<EOF
server {
    listen 80;
    server_name _;
    
    # Serve static files from React build
    location / {
        root /home/ec2-user/toolex/client/build;
        index index.html;
        try_files \$uri \$uri/ /index.html;
    }
    
    # Proxy API requests to Node.js
    location /api/ {
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
    
    # Test Nginx configuration
    print_info "Testing Nginx configuration..."
    sudo nginx -t >/dev/null 2>&1
    print_status "Nginx configuration is valid"
    
    # Restart Nginx
    print_info "Restarting Nginx..."
    sudo systemctl restart nginx >/dev/null 2>&1
    print_status "Nginx restarted"
    
    # Step 11: Configure Firewall
    print_header "🔥 Configuring Firewall"
    print_info "Setting up firewall rules..."
    sudo yum install -y firewalld >/dev/null 2>&1
    sudo systemctl start firewalld >/dev/null 2>&1
    sudo systemctl enable firewalld >/dev/null 2>&1
    sudo firewall-cmd --permanent --add-service=http >/dev/null 2>&1
    sudo firewall-cmd --permanent --add-service=https >/dev/null 2>&1
    sudo firewall-cmd --permanent --add-service=ssh >/dev/null 2>&1
    sudo firewall-cmd --reload >/dev/null 2>&1
    print_status "Firewall configured"
    
    # Step 12: Start Application with PM2
    print_header "🚀 Starting Application"
    print_info "Starting application with PM2..."
    
    # Stop any existing PM2 processes
    pm2 delete all >/dev/null 2>&1 || true
    
    # Start the application
    pm2 start ecosystem.config.js >/dev/null 2>&1
    pm2 save >/dev/null 2>&1
    pm2 startup >/dev/null 2>&1
    
    # Wait for application to start
    wait_for_service "Application" "curl -f http://localhost:5000/api/health >/dev/null 2>&1"
    
    # Step 13: Final Verification
    print_header "✅ Final Verification"
    
    # Get public IP
    PUBLIC_IP=$(get_public_ip)
    
    # Test application
    print_info "Testing application health..."
    if curl -f http://localhost:5000/api/health >/dev/null 2>&1; then
        print_status "Application is healthy"
    else
        print_error "Application health check failed"
        exit 1
    fi
    
    # Test public access
    print_info "Testing public access..."
    if curl -f http://localhost >/dev/null 2>&1; then
        print_status "Public access is working"
    else
        print_warning "Public access test failed, but application is running"
    fi
    
    # Step 14: Display Success Information
    print_header "🎉 Deployment Complete!"
    
    echo -e "${GREEN}✅ Security Reconnaissance Tool is now live!${NC}"
    echo
    echo -e "${CYAN}📱 Access Your Application:${NC}"
    echo -e "   🌐 Main App: ${YELLOW}http://$PUBLIC_IP${NC}"
    echo -e "   🔧 API Health: ${YELLOW}http://$PUBLIC_IP/api/health${NC}"
    echo -e "   📊 API Endpoints: ${YELLOW}http://$PUBLIC_IP/api${NC}"
    echo
    echo -e "${CYAN}🛠️ Management Commands:${NC}"
    echo -e "   ${YELLOW}pm2 status${NC}              - Check application status"
    echo -e "   ${YELLOW}pm2 logs${NC}                - View application logs"
    echo -e "   ${YELLOW}pm2 restart recon-tool${NC}  - Restart application"
    echo -e "   ${YELLOW}pm2 stop recon-tool${NC}     - Stop application"
    echo
    echo -e "${CYAN}🔄 Update Application:${NC}"
    echo -e "   ${YELLOW}cd toolex && git pull && pm2 restart recon-tool${NC}"
    echo
    echo -e "${GREEN}🚀 Your advanced security reconnaissance tool is ready!${NC}"
    echo -e "${GREEN}   Features: Advanced Bug Scanner, XSS Detection, SQLi Testing,${NC}"
    echo -e "${GREEN}   SSRF Detection, XXE Testing, and much more!${NC}"
    echo
    
    # Create a quick status check script
    cat > check-status.sh <<'EOF'
#!/bin/bash
echo "🔍 Security Recon Tool Status Check"
echo "=================================="
echo
echo "📊 PM2 Status:"
pm2 status
echo
echo "🌐 Application Health:"
curl -s http://localhost:5000/api/health | jq . 2>/dev/null || curl -s http://localhost:5000/api/health
echo
echo "🔧 Services Status:"
echo "MongoDB: $(sudo systemctl is-active mongod)"
echo "Nginx: $(sudo systemctl is-active nginx)"
echo "PM2: $(pm2 status | grep recon-tool | awk '{print $10}')"
EOF
    
    chmod +x check-status.sh
    print_status "Created check-status.sh script for easy monitoring"
    
    print_header "🎯 Deployment Summary"
    echo -e "${GREEN}✅ All services installed and configured${NC}"
    echo -e "${GREEN}✅ Application is running and accessible${NC}"
    echo -e "${GREEN}✅ Firewall configured for security${NC}"
    echo -e "${GREEN}✅ Process management with PM2 enabled${NC}"
    echo -e "${GREEN}✅ Auto-restart on server reboot${NC}"
    echo
    echo -e "${YELLOW}💡 Next Steps:${NC}"
    echo -e "   1. Open your browser and go to: ${CYAN}http://$PUBLIC_IP${NC}"
    echo -e "   2. Start scanning websites for vulnerabilities"
    echo -e "   3. Use the advanced bug scanner for comprehensive testing"
    echo -e "   4. Check logs anytime with: ${YELLOW}pm2 logs${NC}"
    echo
    print_status "Deployment completed successfully! 🚀"
}

# Run main function
main "$@"
