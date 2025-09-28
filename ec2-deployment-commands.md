# AWS EC2 Deployment Commands

## Prerequisites
- AWS EC2 instance (Ubuntu 20.04 LTS recommended)
- Domain name pointed to your EC2 instance
- SSH access to your EC2 instance

## Step 1: Connect to EC2 Instance
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

## Step 2: Update System and Install Dependencies
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y curl wget git nginx certbot python3-certbot-nginx ufw

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Logout and login again to apply docker group changes
exit
ssh -i your-key.pem ubuntu@your-ec2-ip
```

## Step 3: Clone Repository
```bash
# Clone the repository
git clone https://github.com/your-username/security-recon-tool.git
cd security-recon-tool

# Make deployment script executable
chmod +x deploy.sh
```

## Step 4: Configure Environment
```bash
# Copy environment file
cp env.example .env

# Edit environment variables
nano .env
```

Update the following variables in `.env`:
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://admin:your-secure-password@mongodb:27017/recon-tool?authSource=admin
MONGO_ROOT_PASSWORD=your-secure-password
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

## Step 5: Configure Firewall
```bash
# Configure UFW firewall
sudo ufw --force reset
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
```

## Step 6: Generate SSL Certificates
```bash
# Create SSL directory
mkdir -p ssl

# Generate self-signed certificates (for initial setup)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout ssl/key.pem \
    -out ssl/cert.pem \
    -subj "/C=US/ST=State/L=City/O=Organization/CN=your-domain.com"
```

## Step 7: Deploy with Docker Compose
```bash
# Build and start the application
docker-compose up -d --build

# Check if all services are running
docker-compose ps

# View logs
docker-compose logs -f
```

## Step 8: Setup Let's Encrypt SSL (Optional but Recommended)
```bash
# Stop nginx temporarily
sudo systemctl stop nginx

# Obtain SSL certificate
sudo certbot certonly --standalone -d your-domain.com --email your-email@example.com --agree-tos --non-interactive

# Copy certificates
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ssl/key.pem
sudo chown $USER:$USER ssl/*.pem

# Restart nginx
sudo systemctl start nginx

# Setup auto-renewal
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
```

## Step 9: Configure Nginx
```bash
# Create nginx configuration
sudo tee /etc/nginx/sites-available/recon-tool > /dev/null <<EOF
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /home/ubuntu/security-recon-tool/ssl/cert.pem;
    ssl_certificate_key /home/ubuntu/security-recon-tool/ssl/key.pem;
    
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

# Test nginx configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

## Step 10: Setup Auto-Start Service
```bash
# Create systemd service
sudo tee /etc/systemd/system/recon-tool.service > /dev/null <<EOF
[Unit]
Description=Security Recon Tool
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/ubuntu/security-recon-tool
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0
User=ubuntu

[Install]
WantedBy=multi-user.target
EOF

# Enable the service
sudo systemctl daemon-reload
sudo systemctl enable recon-tool
```

## Step 11: Verify Installation
```bash
# Check if application is running
curl -f http://localhost:5000/api/health

# Check if nginx is working
curl -f https://your-domain.com

# View application logs
docker-compose logs -f app
```

## Step 12: Access the Application
- Open your browser and navigate to: `https://your-domain.com`
- Default admin credentials:
  - Email: `admin@recon-tool.com`
  - Password: Check MongoDB for default password

## Useful Commands

### View Logs
```bash
# Application logs
docker-compose logs -f app

# All services logs
docker-compose logs -f

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Restart Services
```bash
# Restart application
docker-compose restart

# Restart nginx
sudo systemctl restart nginx

# Restart all services
docker-compose down && docker-compose up -d
```

### Update Application
```bash
# Pull latest changes
git pull

# Rebuild and restart
docker-compose up -d --build

# Or use the service
sudo systemctl restart recon-tool
```

### Backup Data
```bash
# Backup MongoDB data
docker-compose exec mongodb mongodump --out /data/backup

# Backup application data
tar -czf backup-$(date +%Y%m%d).tar.gz uploads/ logs/
```

### Monitor Resources
```bash
# Check Docker containers
docker ps

# Check resource usage
docker stats

# Check disk usage
df -h

# Check memory usage
free -h
```

## Troubleshooting

### Application Not Starting
```bash
# Check logs
docker-compose logs app

# Check if ports are in use
sudo netstat -tlnp | grep :5000

# Restart Docker
sudo systemctl restart docker
```

### Database Connection Issues
```bash
# Check MongoDB logs
docker-compose logs mongodb

# Connect to MongoDB
docker-compose exec mongodb mongosh
```

### SSL Certificate Issues
```bash
# Check certificate
openssl x509 -in ssl/cert.pem -text -noout

# Renew Let's Encrypt certificate
sudo certbot renew
```

### Nginx Issues
```bash
# Test nginx configuration
sudo nginx -t

# Check nginx status
sudo systemctl status nginx

# View nginx error logs
sudo tail -f /var/log/nginx/error.log
```

## Security Considerations

1. **Change default passwords** in the `.env` file
2. **Use strong JWT secrets** (at least 32 characters)
3. **Enable firewall** and only open necessary ports
4. **Keep system updated** regularly
5. **Monitor logs** for suspicious activity
6. **Use HTTPS** in production
7. **Regular backups** of your data

## Performance Optimization

1. **Increase EC2 instance size** if needed
2. **Enable Docker build cache** for faster deployments
3. **Use SSD storage** for better I/O performance
4. **Configure MongoDB** for production use
5. **Enable Redis caching** for better performance

## Monitoring

1. **Set up CloudWatch** monitoring
2. **Configure log aggregation** (ELK stack)
3. **Set up alerts** for critical issues
4. **Monitor resource usage** regularly
5. **Track application metrics**

Your Security Recon Tool should now be running at `https://your-domain.com`!
