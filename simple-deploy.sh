#!/bin/bash

# Simple Deployment Script for Security Recon Tool
# This script will deploy the application without Docker for easier setup

echo "🚀 Starting Simple Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    print_error "Please don't run this script as root. Run as ec2-user."
    exit 1
fi

# Update system
print_status "Updating system packages..."
sudo yum update -y

# Install Node.js
print_status "Installing Node.js..."
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Install PM2 for process management
print_status "Installing PM2..."
sudo npm install -g pm2

# Install MongoDB
print_status "Installing MongoDB..."
sudo tee /etc/yum.repos.d/mongodb-org-6.0.repo > /dev/null <<EOF
[mongodb-org-6.0]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/amazon/2/mongodb-org/6.0/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://www.mongodb.org/static/pgp/server-6.0.asc
EOF

sudo yum install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod

# Install Nginx
print_status "Installing Nginx..."
sudo yum install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Install Git if not present
sudo yum install -y git

# Clone repository if not already present
if [ ! -d "toolex" ]; then
    print_status "Cloning repository..."
    git clone https://github.com/logansensei/toolex.git
fi

cd toolex

# Install backend dependencies
print_status "Installing backend dependencies..."
npm install

# Install frontend dependencies
print_status "Installing frontend dependencies..."
cd client
npm install
npm run build
cd ..

# Create environment file
print_status "Creating environment configuration..."
cat > .env <<EOF
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://localhost:27017/recon-tool
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-$(date +%s)
```

# Create PM2 ecosystem file
print_status "Creating PM2 configuration..."
cat > ecosystem.config.js <<EOF
module.exports = {
  apps: [{
    name: 'recon-tool',
    script: 'server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    }
  }]
};
EOF

# Create Nginx configuration
print_status "Configuring Nginx..."
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
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Start the application with PM2
print_status "Starting application with PM2..."
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Configure firewall
print_status "Configuring firewall..."
sudo yum install -y firewalld
sudo systemctl start firewalld
sudo systemctl enable firewalld
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --reload

# Get public IP
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)

print_status "Deployment completed successfully! 🎉"
print_status "Your application is now running at: http://$PUBLIC_IP"
print_status "API endpoint: http://$PUBLIC_IP/api"
print_status ""
print_status "Useful commands:"
print_status "  pm2 status          - Check application status"
print_status "  pm2 logs            - View application logs"
print_status "  pm2 restart recon-tool - Restart application"
print_status "  pm2 stop recon-tool    - Stop application"
print_status ""
print_status "To update the application:"
print_status "  git pull && pm2 restart recon-tool"
