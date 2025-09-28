# 🚀 One-Click Automated Deployment

## Fully Automated Security Recon Tool Deployment

This guide provides **completely automated deployment** with zero manual intervention required.

## 🎯 **Super Simple - Just Run One Command**

### **Step 1: Connect to EC2**
```bash
ssh -i your-key.pem ec2-user@your-ec2-ip
```

### **Step 2: Run Automated Deployment**
```bash
# Download and run the fully automated deployment script
curl -fsSL https://raw.githubusercontent.com/logansensei/toolex/main/auto-deploy.sh | bash
```

**That's it!** The script handles everything automatically.

## 🤖 **What the Automation Script Does**

### **Automatic Installation:**
- ✅ **System Updates** - Updates all packages
- ✅ **Node.js 18** - Installs latest Node.js
- ✅ **PM2 Process Manager** - For app management
- ✅ **MongoDB 6.0** - Database installation
- ✅ **Nginx Web Server** - Reverse proxy setup
- ✅ **Git** - Version control
- ✅ **Firewall Configuration** - Security setup

### **Automatic Configuration:**
- ✅ **Environment Variables** - Auto-generated secrets
- ✅ **Database Setup** - MongoDB configuration
- ✅ **Nginx Configuration** - Reverse proxy rules
- ✅ **PM2 Configuration** - Process management
- ✅ **Firewall Rules** - Port 80, 443, 22 open
- ✅ **Auto-startup** - App starts on server reboot

### **Automatic Application Setup:**
- ✅ **Repository Clone** - Gets latest code
- ✅ **Dependencies Install** - Backend and frontend
- ✅ **Frontend Build** - React app compilation
- ✅ **Service Start** - All services running
- ✅ **Health Checks** - Verifies everything works
- ✅ **Status Monitoring** - Creates monitoring script

## 📊 **Features Included**

### **🔍 Advanced Security Scanner:**
- **XSS Detection** - DOM-based, stored, filter bypass
- **SQL Injection** - Multiple database types
- **NoSQL Injection** - MongoDB, CouchDB, Cassandra
- **LDAP Injection** - Directory service attacks
- **Command Injection** - OS command execution
- **Path Traversal** - File system access
- **SSRF Detection** - Server-side request forgery
- **XXE Detection** - XML external entity
- **CSRF Detection** - Cross-site request forgery
- **IDOR Detection** - Insecure direct object reference
- **Business Logic** - Price manipulation, race conditions
- **Session Issues** - Session management vulnerabilities
- **Crypto Weaknesses** - Cryptographic vulnerabilities
- **Info Disclosure** - Information leakage

### **🎨 Modern UI Features:**
- **Professional Design** - Dark theme with gradients
- **Real-time Scanning** - Live progress tracking
- **Responsive Layout** - Mobile-friendly
- **Interactive Components** - Smooth animations
- **Detailed Reports** - Vulnerability analysis
- **Scan History** - Track all scans
- **Export Options** - JSON, CSV reports

## 🛠️ **Management Commands (After Deployment)**

```bash
# Check application status
pm2 status

# View application logs
pm2 logs

# Restart application
pm2 restart recon-tool

# Stop application
pm2 stop recon-tool

# Start application
pm2 start recon-tool

# Check all services
./check-status.sh

# Update application
cd toolex && git pull && pm2 restart recon-tool
```

## 🔧 **Troubleshooting (If Needed)**

### **Check Application Status:**
```bash
# Run the status check script
./check-status.sh

# Or check manually
pm2 status
sudo systemctl status mongod
sudo systemctl status nginx
```

### **View Logs:**
```bash
# Application logs
pm2 logs recon-tool

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log
```

### **Restart Services:**
```bash
# Restart everything
pm2 restart recon-tool
sudo systemctl restart nginx
sudo systemctl restart mongod
```

## 🌐 **Access Your Application**

After deployment, your application will be available at:

- **Main Application**: `http://your-ec2-public-ip`
- **API Health Check**: `http://your-ec2-public-ip/api/health`
- **API Endpoints**: `http://your-ec2-public-ip/api/scans`

## 🚀 **Quick Update Process**

To update your application with new features:

```bash
# Navigate to project directory
cd toolex

# Pull latest changes
git pull origin main

# Restart application
pm2 restart recon-tool

# Check status
pm2 status
```

## 📱 **What You Get**

### **Professional Security Tool:**
- **11 Vulnerability Categories** - Comprehensive testing
- **Modern Attack Techniques** - Latest pentesting methods
- **Real-time Results** - Live vulnerability detection
- **Detailed Reports** - Professional vulnerability analysis
- **Export Capabilities** - JSON, CSV report generation
- **Scan History** - Track all previous scans
- **User Management** - Authentication system

### **Enterprise Features:**
- **Process Management** - PM2 for reliability
- **Auto-restart** - App restarts if it crashes
- **Health Monitoring** - Built-in health checks
- **Security Headers** - CORS, rate limiting
- **Database Integration** - MongoDB for data storage
- **API Documentation** - RESTful API endpoints

## 🎉 **Success Indicators**

After running the script, you should see:

```
🎉 Deployment Complete!
✅ Security Reconnaissance Tool is now live!

📱 Access Your Application:
   🌐 Main App: http://your-ec2-ip
   🔧 API Health: http://your-ec2-ip/api/health
   📊 API Endpoints: http://your-ec2-ip/api

🚀 Your advanced security reconnaissance tool is ready!
```

## 🔒 **Security Features**

- **Rate Limiting** - Prevents abuse
- **Input Validation** - Prevents injection attacks
- **CORS Protection** - Cross-origin security
- **Error Handling** - Secure error responses
- **Firewall Configuration** - Network security
- **Process Isolation** - PM2 process management

## 💡 **Pro Tips**

1. **Bookmark the URL** - Save `http://your-ec2-ip` for easy access
2. **Check Status Regularly** - Use `./check-status.sh` to monitor
3. **Update Regularly** - Run `git pull && pm2 restart recon-tool` for updates
4. **Monitor Logs** - Use `pm2 logs` to check for issues
5. **Backup Data** - MongoDB data is stored in `/var/lib/mongo`

Your advanced security reconnaissance tool is now fully automated and ready for professional pentesting! 🚀
