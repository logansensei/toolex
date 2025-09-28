# 🚀 Quick Deploy Guide - Security Recon Tool

## One-Command Deployment for EC2

This guide provides the easiest way to deploy your security reconnaissance tool on AWS EC2.

### Prerequisites
- AWS EC2 instance (Amazon Linux 2)
- SSH access to your EC2 instance
- Domain name (optional)

## 🎯 **Super Easy Deployment (3 Steps)**

### Step 1: Connect to EC2
```bash
ssh -i your-key.pem ec2-user@your-ec2-ip
```

### Step 2: Run the Deploy Script
```bash
# Download and run the deployment script
curl -fsSL https://raw.githubusercontent.com/logansensei/toolex/main/simple-deploy.sh | bash
```

### Step 3: Access Your Application
- **URL**: `http://your-ec2-ip`
- **API**: `http://your-ec2-ip/api`

## 🔧 **Manual Deployment (If Script Fails)**

### Step 1: Clone Repository
```bash
git clone https://github.com/logansensei/toolex.git
cd toolex
```

### Step 2: Run Setup
```bash
chmod +x simple-deploy.sh
./simple-deploy.sh
```

### Step 3: Verify Installation
```bash
# Check if application is running
pm2 status

# View logs
pm2 logs

# Check health
curl http://localhost:5000/api/health
```

## 📊 **What Gets Installed**

- ✅ **Node.js 18** - Runtime environment
- ✅ **MongoDB 6.0** - Database
- ✅ **Nginx** - Web server and reverse proxy
- ✅ **PM2** - Process manager
- ✅ **Security Recon Tool** - Your application

## 🛠 **Management Commands**

```bash
# Application Management
pm2 status              # Check status
pm2 logs                # View logs
pm2 restart recon-tool  # Restart app
pm2 stop recon-tool     # Stop app
pm2 start recon-tool    # Start app

# Update Application
git pull
pm2 restart recon-tool

# View Nginx Logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx
```

## 🌐 **Accessing Your Application**

### Local Access
- **Main App**: `http://localhost:5000`
- **API Health**: `http://localhost:5000/api/health`

### Public Access
- **Main App**: `http://your-ec2-public-ip`
- **API Health**: `http://your-ec2-public-ip/api/health`

## 🔒 **Security Features**

- ✅ **Rate Limiting** - Prevents abuse
- ✅ **CORS Protection** - Cross-origin security
- ✅ **Input Validation** - Prevents injection attacks
- ✅ **Error Handling** - Secure error responses
- ✅ **Process Management** - PM2 for reliability

## 📱 **Features Available**

- 🔍 **Advanced Bug Scanner** - 11 vulnerability categories
- 🛡️ **Security Testing** - XSS, SQLi, SSRF, XXE, etc.
- 📊 **Real-time Scanning** - Live progress tracking
- 📈 **Detailed Reports** - Vulnerability analysis
- 🎨 **Modern UI** - Professional interface
- 🔐 **Authentication** - User management
- 📝 **Scan History** - Track all scans

## 🚨 **Troubleshooting**

### Application Not Starting
```bash
# Check PM2 status
pm2 status

# View detailed logs
pm2 logs recon-tool --lines 50

# Restart application
pm2 restart recon-tool
```

### Database Issues
```bash
# Check MongoDB status
sudo systemctl status mongod

# Restart MongoDB
sudo systemctl restart mongod

# Check MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log
```

### Nginx Issues
```bash
# Check Nginx status
sudo systemctl status nginx

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### Port Issues
```bash
# Check if ports are in use
sudo netstat -tlnp | grep :5000
sudo netstat -tlnp | grep :80

# Check firewall
sudo firewall-cmd --list-all
```

## 🔄 **Updating the Application**

```bash
# Navigate to application directory
cd toolex

# Pull latest changes
git pull

# Restart application
pm2 restart recon-tool

# Check status
pm2 status
```

## 📋 **Environment Variables**

The application uses these environment variables (automatically set):

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://localhost:27017/recon-tool
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

## 🎉 **Success!**

Your Security Reconnaissance Tool is now live and ready to use!

- **Main Application**: `http://your-ec2-ip`
- **API Documentation**: `http://your-ec2-ip/api/health`
- **Scan Management**: Available through the web interface

## 📞 **Support**

If you encounter any issues:

1. Check the logs: `pm2 logs`
2. Verify services: `pm2 status`
3. Check Nginx: `sudo systemctl status nginx`
4. Check MongoDB: `sudo systemctl status mongod`

Your advanced security reconnaissance tool is now deployed and ready for professional pentesting! 🚀
