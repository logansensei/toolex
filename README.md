# 🔒 Security Recon Tool

A comprehensive web-based security reconnaissance platform that performs automated security assessments, vulnerability scanning, and infrastructure analysis. Built with modern web technologies and designed for easy deployment on AWS EC2.

## ✨ Features

### 🔍 **Comprehensive Security Scanning**
- **Endpoint Discovery**: Automatically discovers all API endpoints, hidden paths, and internal routes
- **Vulnerability Detection**: Identifies XSS, CORS misconfigurations, open redirects, and other security issues
- **Secrets Detection**: Finds exposed API keys, tokens, database credentials, and sensitive data
- **Infrastructure Analysis**: Analyzes subdomains, S3 buckets, DNS records, and network infrastructure
- **Security Headers**: Checks for missing or misconfigured security headers
- **Technology Detection**: Identifies frameworks, libraries, and technologies used

### 🎯 **Advanced Reconnaissance**
- **Subdomain Enumeration**: Discovers subdomains using multiple techniques
- **S3 Bucket Discovery**: Finds and analyzes S3 bucket permissions
- **Port Scanning**: Identifies open ports and running services
- **Certificate Analysis**: Analyzes SSL/TLS certificates and configurations
- **DNS Analysis**: Performs comprehensive DNS record analysis

### 📊 **Reporting & Analytics**
- **Interactive Dashboard**: Real-time monitoring of scan progress and results
- **Detailed Reports**: Comprehensive HTML, JSON, and CSV export options
- **Vulnerability Management**: Categorized and prioritized security findings
- **Historical Analysis**: Track security posture over time
- **Executive Summaries**: High-level reports for stakeholders

### 🛠️ **Developer Tools**
- **Bookmarklet**: Client-side reconnaissance tool for browser-based analysis
- **REST API**: Full-featured API for integration with other tools
- **Webhook Support**: Real-time notifications for scan completion
- **Scheduled Scans**: Automated recurring security assessments

## 🏗️ **Architecture**

### **Backend (Node.js/Express)**
- RESTful API with comprehensive security scanning capabilities
- MongoDB for data persistence and scan result storage
- Redis for caching and session management
- Puppeteer for dynamic content analysis
- Rate limiting and security middleware

### **Frontend (React)**
- Modern, responsive UI with dark theme
- Real-time scan monitoring and progress tracking
- Interactive data visualization and reporting
- Mobile-friendly design with PWA capabilities

### **Infrastructure**
- Docker containerization for easy deployment
- Nginx reverse proxy with SSL termination
- MongoDB and Redis for data storage
- Health checks and monitoring

## 🚀 **Quick Start**

### **Prerequisites**
- Docker and Docker Compose
- Node.js 18+ (for development)
- MongoDB (for production)
- SSL certificates (for production)

### **1. Clone the Repository**
```bash
git clone https://github.com/your-username/security-recon-tool.git
cd security-recon-tool
```

### **2. Environment Configuration**
```bash
cp env.example .env
# Edit .env with your configuration
```

### **3. Start with Docker Compose**
```bash
docker-compose up -d
```

### **4. Access the Application**
- Web Interface: https://your-domain.com
- API Documentation: https://your-domain.com/api/health

## 📋 **Installation Guide**

### **Development Setup**

1. **Install Dependencies**
```bash
npm install
cd client && npm install
```

2. **Start Development Servers**
```bash
# Backend (Terminal 1)
npm run dev

# Frontend (Terminal 2)
npm run client
```

3. **Access Development Environment**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### **Production Deployment on AWS EC2**

1. **Launch EC2 Instance**
```bash
# Ubuntu 20.04 LTS
# Instance Type: t3.medium or larger
# Security Groups: HTTP (80), HTTPS (443), SSH (22)
```

2. **Install Docker**
```bash
sudo apt update
sudo apt install docker.io docker-compose
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER
```

3. **Deploy Application**
```bash
git clone https://github.com/your-username/security-recon-tool.git
cd security-recon-tool
cp env.example .env
# Configure .env file
docker-compose up -d
```

4. **SSL Certificate Setup**
```bash
# Using Let's Encrypt
sudo apt install certbot
sudo certbot certonly --standalone -d your-domain.com
# Copy certificates to ./ssl/ directory
```

5. **Configure Nginx**
```bash
# Update nginx.conf with your domain
# Restart nginx container
docker-compose restart nginx
```

## 🔧 **Configuration**

### **Environment Variables**

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Application port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/recon-tool` |
| `JWT_SECRET` | JWT signing secret | `your-secret-key` |
| `API_RATE_LIMIT` | API rate limit per 15 minutes | `100` |
| `SCAN_TIMEOUT` | Maximum scan duration (ms) | `300000` |
| `MAX_CONCURRENT_SCANS` | Maximum concurrent scans | `5` |

### **Security Configuration**

The application includes comprehensive security features:

- **Rate Limiting**: Prevents API abuse
- **CORS Protection**: Configurable cross-origin policies
- **Security Headers**: Helmet.js for security headers
- **Input Validation**: Comprehensive input sanitization
- **Authentication**: JWT-based authentication system

## 📚 **API Documentation**

### **Authentication**
```bash
# Generate API Key
POST /api/auth/generate-key
{
  "name": "My API Key",
  "permissions": ["read", "write"]
}
```

### **Start Scan**
```bash
POST /api/scans/start
{
  "targetUrl": "https://example.com",
  "scanType": "full",
  "options": {
    "endpoints": true,
    "secrets": true,
    "cors": true
  }
}
```

### **Get Scan Results**
```bash
GET /api/scans/results/{scanId}
```

### **Export Report**
```bash
GET /api/reports/{scanId}/export?format=json
```

## 🎯 **Usage Examples**

### **Basic Security Scan**
1. Navigate to the web interface
2. Enter target URL
3. Select scan type (Full/Quick/Custom)
4. Configure scan options
5. Start scan and monitor progress
6. Review results and export reports

### **Using the Bookmarklet**
1. Go to the Bookmarklet page
2. Copy the JavaScript code
3. Create a bookmark with the code as URL
4. Visit target website and click bookmarklet
5. Review discovered endpoints and parameters

### **API Integration**
```javascript
// Start a scan via API
const response = await fetch('/api/scans/start', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'your-api-key'
  },
  body: JSON.stringify({
    targetUrl: 'https://example.com',
    scanType: 'full'
  })
});

const { scanId } = await response.json();

// Poll for results
const checkStatus = async () => {
  const status = await fetch(`/api/scans/status/${scanId}`);
  return status.json();
};
```

## 🔒 **Security Considerations**

### **For Users**
- Only scan websites you own or have explicit permission to test
- Unauthorized scanning may violate laws and terms of service
- Use the tool responsibly and ethically

### **For Administrators**
- Change default passwords and API keys
- Configure proper SSL certificates
- Set up monitoring and logging
- Regular security updates and patches
- Implement proper access controls

## 🐛 **Troubleshooting**

### **Common Issues**

1. **Scan Fails to Start**
   - Check target URL accessibility
   - Verify scan timeout settings
   - Review application logs

2. **Database Connection Issues**
   - Verify MongoDB is running
   - Check connection string format
   - Ensure proper authentication

3. **Performance Issues**
   - Increase EC2 instance size
   - Optimize database queries
   - Configure proper caching

### **Logs and Monitoring**
```bash
# View application logs
docker-compose logs app

# View database logs
docker-compose logs mongodb

# Monitor resource usage
docker stats
```

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 **Support**

- **Documentation**: [Wiki](https://github.com/your-username/security-recon-tool/wiki)
- **Issues**: [GitHub Issues](https://github.com/your-username/security-recon-tool/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/security-recon-tool/discussions)

## 🙏 **Acknowledgments**

- Security research community
- Open source security tools
- Contributors and testers

---

**⚠️ Disclaimer**: This tool is for authorized security testing only. Users are responsible for ensuring they have proper authorization before scanning any systems. The authors are not responsible for any misuse of this tool.
