const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 5000;

// Simple server
const server = http.createServer((req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // API routes
  if (req.url === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      features: [
        'Advanced XSS Detection',
        'SQL Injection Testing',
        'SSRF Detection',
        'XXE Testing',
        'CSRF Detection',
        'IDOR Testing',
        'Path Traversal',
        'Command Injection',
        'NoSQL Injection',
        'LDAP Injection',
        'Business Logic Testing'
      ]
    }));
    return;
  }
  
  if (req.url === '/api/scans') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      message: 'Security Recon Tool API is running',
      features: [
        'Advanced XSS Detection',
        'SQL Injection Testing',
        'SSRF Detection',
        'XXE Testing',
        'CSRF Detection',
        'IDOR Testing',
        'Path Traversal',
        'Command Injection',
        'NoSQL Injection',
        'LDAP Injection',
        'Business Logic Testing'
      ],
      endpoints: {
        'health': '/api/health',
        'scans': '/api/scans',
        'vulnerabilities': '/api/vulnerabilities'
      }
    }));
    return;
  }
  
  if (req.url === '/api/vulnerabilities') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      vulnerabilities: [
        {
          name: 'Advanced XSS',
          severity: 'High',
          description: 'Cross-Site Scripting vulnerabilities',
          types: ['DOM-based', 'Stored', 'Reflected', 'Filter bypass']
        },
        {
          name: 'SQL Injection',
          severity: 'Critical',
          description: 'Database injection attacks',
          types: ['Union-based', 'Boolean-based', 'Time-based', 'Error-based']
        },
        {
          name: 'SSRF',
          severity: 'High',
          description: 'Server-Side Request Forgery',
          types: ['Internal network access', 'Cloud metadata access']
        },
        {
          name: 'XXE',
          severity: 'High',
          description: 'XML External Entity attacks',
          types: ['File inclusion', 'SSRF', 'DoS']
        },
        {
          name: 'CSRF',
          severity: 'Medium',
          description: 'Cross-Site Request Forgery',
          types: ['State-changing operations', 'Authentication bypass']
        },
        {
          name: 'IDOR',
          severity: 'Medium',
          description: 'Insecure Direct Object Reference',
          types: ['Data access', 'Privilege escalation']
        },
        {
          name: 'Path Traversal',
          severity: 'High',
          description: 'Directory traversal attacks',
          types: ['File inclusion', 'Information disclosure']
        },
        {
          name: 'Command Injection',
          severity: 'Critical',
          description: 'OS command execution',
          types: ['Shell injection', 'Code execution']
        },
        {
          name: 'NoSQL Injection',
          severity: 'High',
          description: 'NoSQL database injection',
          types: ['MongoDB', 'CouchDB', 'Cassandra']
        },
        {
          name: 'LDAP Injection',
          severity: 'High',
          description: 'LDAP query injection',
          types: ['Authentication bypass', 'Information disclosure']
        },
        {
          name: 'Business Logic',
          severity: 'High',
          description: 'Business logic vulnerabilities',
          types: ['Price manipulation', 'Race conditions', 'Workflow bypass']
        }
      ]
    }));
    return;
  }
  
  // Serve the web interface for root path
  if (req.url === '/' || req.url === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    
    // Read the web interface file
    fs.readFile(path.join(__dirname, 'web-interface.html'), (err, data) => {
      if (err) {
        // Fallback HTML if file doesn't exist
        res.end(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Security Recon Tool</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
                color: #fff; 
                min-height: 100vh;
                overflow-x: hidden;
              }
              .container { 
                max-width: 1200px; 
                margin: 0 auto; 
                padding: 20px; 
              }
              .header { 
                text-align: center; 
                margin-bottom: 40px; 
                padding: 40px 0;
                background: linear-gradient(135deg, #00ff88, #0088ff);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                font-size: 3em; 
                font-weight: 700;
                text-shadow: 0 0 20px rgba(0, 255, 136, 0.3);
              }
              .subtitle {
                font-size: 1.2em;
                color: #b0b0b0;
                margin-bottom: 30px;
                text-align: center;
              }
              .scan-section {
                background: rgba(255, 255, 255, 0.05);
                padding: 30px;
                border-radius: 12px;
                margin: 30px 0;
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.1);
              }
              .scan-form {
                display: flex;
                gap: 15px;
                margin-bottom: 30px;
                flex-wrap: wrap;
              }
              .url-input {
                flex: 1;
                min-width: 300px;
                padding: 15px 20px;
                border: 2px solid #00ff88;
                border-radius: 8px;
                background: rgba(0, 0, 0, 0.3);
                color: #fff;
                font-size: 16px;
                transition: all 0.3s ease;
              }
              .url-input:focus {
                outline: none;
                border-color: #0088ff;
                box-shadow: 0 0 20px rgba(0, 136, 255, 0.3);
              }
              .url-input::placeholder {
                color: #666;
              }
              .scan-button {
                background: linear-gradient(135deg, #00ff88, #00cc6a);
                color: #000;
                padding: 15px 30px;
                border: none;
                border-radius: 8px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                box-shadow: 0 4px 15px rgba(0, 255, 136, 0.3);
                min-width: 150px;
              }
              .scan-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(0, 255, 136, 0.4);
              }
              .scan-button:disabled {
                opacity: 0.6;
                cursor: not-allowed;
                transform: none;
              }
              .scan-options {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 15px;
                margin: 20px 0;
              }
              .option-card {
                background: rgba(255, 255, 255, 0.03);
                padding: 20px;
                border-radius: 8px;
                border: 1px solid rgba(255, 255, 255, 0.1);
                transition: all 0.3s ease;
                cursor: pointer;
              }
              .option-card:hover {
                background: rgba(0, 255, 136, 0.1);
                border-color: #00ff88;
              }
              .option-card.selected {
                background: rgba(0, 255, 136, 0.2);
                border-color: #00ff88;
              }
              .option-card h3 {
                color: #00ff88;
                margin-bottom: 10px;
                font-size: 1.1em;
              }
              .option-card p {
                color: #b0b0b0;
                font-size: 0.9em;
                line-height: 1.4;
              }
              .results-section {
                margin-top: 30px;
                padding: 20px;
                background: rgba(0, 0, 0, 0.3);
                border-radius: 8px;
                border: 1px solid rgba(255, 255, 255, 0.1);
                display: none;
              }
              .results-section.show {
                display: block;
              }
              .result-item {
                background: rgba(255, 255, 255, 0.05);
                padding: 15px;
                margin: 10px 0;
                border-radius: 6px;
                border-left: 4px solid #00ff88;
              }
              .result-item.critical {
                border-left-color: #ff4444;
              }
              .result-item.high {
                border-left-color: #ff8800;
              }
              .result-item.medium {
                border-left-color: #ffaa00;
              }
              .result-item.low {
                border-left-color: #00ff88;
              }
              .severity {
                display: inline-block;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 0.8em;
                font-weight: 600;
                margin-right: 10px;
              }
              .severity.critical {
                background: #ff4444;
                color: #fff;
              }
              .severity.high {
                background: #ff8800;
                color: #fff;
              }
              .severity.medium {
                background: #ffaa00;
                color: #000;
              }
              .severity.low {
                background: #00ff88;
                color: #000;
              }
              .loading {
                text-align: center;
                padding: 20px;
                color: #00ff88;
              }
              .error {
                background: rgba(255, 68, 68, 0.1);
                border: 1px solid #ff4444;
                color: #ff4444;
                padding: 15px;
                border-radius: 6px;
                margin: 10px 0;
              }
              .success {
                background: rgba(0, 255, 136, 0.1);
                border: 1px solid #00ff88;
                color: #00ff88;
                padding: 15px;
                border-radius: 6px;
                margin: 10px 0;
              }
              .features-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 20px;
                margin: 30px 0;
              }
              .feature {
                background: rgba(255, 255, 255, 0.05);
                padding: 20px;
                border-radius: 12px;
                border-left: 4px solid #00ff88;
                backdrop-filter: blur(10px);
                transition: all 0.3s ease;
                border: 1px solid rgba(255, 255, 255, 0.1);
              }
              .feature:hover {
                transform: translateY(-5px);
                box-shadow: 0 10px 30px rgba(0, 255, 136, 0.2);
                border-left-color: #0088ff;
              }
              .feature h3 {
                color: #00ff88;
                margin-bottom: 10px;
                font-size: 1.2em;
              }
              .feature p {
                color: #b0b0b0;
                line-height: 1.6;
              }
              @media (max-width: 768px) {
                .header { font-size: 2em; }
                .scan-form { flex-direction: column; }
                .url-input { min-width: 100%; }
                .features-grid { grid-template-columns: 1fr; }
                .container { padding: 10px; }
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1 class="header">🔍 Security Recon Tool</h1>
              <p class="subtitle">Advanced Web Security Testing Platform</p>
              
              <div class="scan-section">
                <h2 style="color: #00ff88; margin-bottom: 20px;">Start Security Scan</h2>
                
                <form class="scan-form" id="scanForm">
                  <input 
                    type="url" 
                    class="url-input" 
                    id="targetUrl" 
                    placeholder="Enter target URL (e.g., https://example.com)"
                    required
                  >
                  <button type="submit" class="scan-button" id="scanButton">
                    🚀 Start Scan
                  </button>
                </form>
                
                <div class="scan-options">
                  <div class="option-card" data-scan="xss">
                    <h3>🔍 Advanced XSS</h3>
                    <p>DOM-based, stored, reflected, and filter bypass XSS vulnerabilities</p>
                  </div>
                  <div class="option-card" data-scan="sqli">
                    <h3>💉 SQL Injection</h3>
                    <p>Union-based, boolean-based, time-based, and error-based SQL injection</p>
                  </div>
                  <div class="option-card" data-scan="ssrf">
                    <h3>🌐 SSRF Detection</h3>
                    <p>Server-side request forgery and internal network access testing</p>
                  </div>
                  <div class="option-card" data-scan="xxe">
                    <h3>📄 XXE Testing</h3>
                    <p>XML external entity attacks and file inclusion vulnerabilities</p>
                  </div>
                  <div class="option-card" data-scan="csrf">
                    <h3>🛡️ CSRF Detection</h3>
                    <p>Cross-site request forgery and state-changing operations</p>
                  </div>
                  <div class="option-card" data-scan="idor">
                    <h3>🔑 IDOR Testing</h3>
                    <p>Insecure direct object reference and privilege escalation</p>
                  </div>
                  <div class="option-card" data-scan="path-traversal">
                    <h3>📁 Path Traversal</h3>
                    <p>Directory traversal and file inclusion attacks</p>
                  </div>
                  <div class="option-card" data-scan="command-injection">
                    <h3>💻 Command Injection</h3>
                    <p>OS command execution and shell injection vulnerabilities</p>
                  </div>
                  <div class="option-card" data-scan="nosql-injection">
                    <h3>🗄️ NoSQL Injection</h3>
                    <p>MongoDB, CouchDB, and Cassandra injection testing</p>
                  </div>
                  <div class="option-card" data-scan="ldap-injection">
                    <h3>👥 LDAP Injection</h3>
                    <p>LDAP query injection and authentication bypass</p>
                  </div>
                  <div class="option-card" data-scan="business-logic">
                    <h3>💰 Business Logic</h3>
                    <p>Price manipulation, race conditions, and workflow bypass</p>
                  </div>
                  <div class="option-card" data-scan="session-management">
                    <h3>🔐 Session Management</h3>
                    <p>Session fixation, timeout, and hijacking vulnerabilities</p>
                  </div>
                </div>
              </div>
              
              <div class="results-section" id="resultsSection">
                <h3 style="color: #00ff88; margin-bottom: 20px;">Scan Results</h3>
                <div id="resultsContent"></div>
              </div>
              
              <div class="features-grid">
                <div class="feature">
                  <h3>🔍 Advanced XSS Detection</h3>
                  <p>Comprehensive XSS testing including DOM-based, stored, reflected, and filter bypass techniques</p>
                </div>
                <div class="feature">
                  <h3>💉 SQL Injection Testing</h3>
                  <p>Multiple SQL injection vectors including union-based, boolean-based, time-based, and error-based</p>
                </div>
                <div class="feature">
                  <h3>🌐 SSRF Detection</h3>
                  <p>Server-side request forgery testing and internal network access detection</p>
                </div>
                <div class="feature">
                  <h3>📄 XXE Testing</h3>
                  <p>XML external entity attacks and file inclusion vulnerability testing</p>
                </div>
                <div class="feature">
                  <h3>🛡️ CSRF Detection</h3>
                  <p>Cross-site request forgery and state-changing operations testing</p>
                </div>
                <div class="feature">
                  <h3>🔑 IDOR Testing</h3>
                  <p>Insecure direct object reference and privilege escalation testing</p>
                </div>
              </div>
            </div>

            <script>
              // Scan options selection
              const optionCards = document.querySelectorAll('.option-card');
              const selectedScans = new Set();
              
              optionCards.forEach(card => {
                card.addEventListener('click', () => {
                  card.classList.toggle('selected');
                  const scanType = card.dataset.scan;
                  
                  if (card.classList.contains('selected')) {
                    selectedScans.add(scanType);
                  } else {
                    selectedScans.delete(scanType);
                  }
                });
              });
              
              // Form submission
              document.getElementById('scanForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const targetUrl = document.getElementById('targetUrl').value;
                const scanButton = document.getElementById('scanButton');
                const resultsSection = document.getElementById('resultsSection');
                const resultsContent = document.getElementById('resultsContent');
                
                if (!targetUrl) {
                  alert('Please enter a target URL');
                  return;
                }
                
                // Show loading
                scanButton.disabled = true;
                scanButton.textContent = '🔄 Scanning...';
                resultsSection.classList.add('show');
                resultsContent.innerHTML = '<div class="loading">🔄 Scanning target for vulnerabilities...</div>';
                
                try {
                  // Simulate scan (replace with actual API call)
                  const results = await performScan(targetUrl, Array.from(selectedScans));
                  displayResults(results);
                } catch (error) {
                  resultsContent.innerHTML = `<div class="error">❌ Scan failed: ${error.message}</div>`;
                } finally {
                  scanButton.disabled = false;
                  scanButton.textContent = '🚀 Start Scan';
                }
              });
              
              // Simulate scan function
              async function performScan(url, scanTypes) {
                // Simulate API delay
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                // Mock results based on scan types
                const mockResults = [];
                
                if (scanTypes.includes('xss') || scanTypes.length === 0) {
                  mockResults.push({
                    name: 'XSS Vulnerability',
                    severity: 'High',
                    description: 'Potential Cross-Site Scripting vulnerability detected',
                    url: url,
                    type: 'XSS',
                    details: 'Input validation bypass detected in form fields'
                  });
                }
                
                if (scanTypes.includes('sqli') || scanTypes.length === 0) {
                  mockResults.push({
                    name: 'SQL Injection',
                    severity: 'Critical',
                    description: 'SQL injection vulnerability detected',
                    url: url,
                    type: 'SQL Injection',
                    details: 'Database query manipulation possible'
                  });
                }
                
                if (scanTypes.includes('ssrf') || scanTypes.length === 0) {
                  mockResults.push({
                    name: 'SSRF Vulnerability',
                    severity: 'High',
                    description: 'Server-Side Request Forgery detected',
                    url: url,
                    type: 'SSRF',
                    details: 'Internal network access possible'
                  });
                }
                
                if (scanTypes.includes('csrf') || scanTypes.length === 0) {
                  mockResults.push({
                    name: 'CSRF Vulnerability',
                    severity: 'Medium',
                    description: 'Cross-Site Request Forgery detected',
                    url: url,
                    type: 'CSRF',
                    details: 'State-changing operations vulnerable'
                  });
                }
                
                return mockResults;
              }
              
              // Display results
              function displayResults(results) {
                const resultsContent = document.getElementById('resultsContent');
                
                if (results.length === 0) {
                  resultsContent.innerHTML = '<div class="success">✅ No vulnerabilities detected</div>';
                  return;
                }
                
                let html = `<div class="success">✅ Scan completed - ${results.length} vulnerabilities found</div>`;
                
                results.forEach(result => {
                  html += `
                    <div class="result-item ${result.severity.toLowerCase()}">
                      <span class="severity ${result.severity.toLowerCase()}">${result.severity}</span>
                      <strong>${result.name}</strong>
                      <p>${result.description}</p>
                      <p><strong>URL:</strong> ${result.url}</p>
                      <p><strong>Details:</strong> ${result.details}</p>
                    </div>
                  `;
                });
                
                resultsContent.innerHTML = html;
              }
              
              // Auto-focus URL input
              document.getElementById('targetUrl').focus();
            </script>
          </body>
          </html>
        `);
        return;
      }
      
      res.end(data);
    });
    return;
  }
  
  // Serve static files
  let filePath = path.join(__dirname, 'client/build', req.url === '/' ? 'index.html' : req.url);
  
  // Check if file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      // File not found, serve index.html for SPA routing
      filePath = path.join(__dirname, 'client/build', 'index.html');
    }
    
    // Read and serve file
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>404 - Page Not Found</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #1a1a1a; color: #fff; text-align: center; }
              .container { max-width: 600px; margin: 0 auto; }
              h1 { color: #00ff88; font-size: 3em; margin-bottom: 20px; }
              p { font-size: 1.2em; margin-bottom: 30px; }
              a { color: #0088ff; text-decoration: none; font-weight: bold; }
              a:hover { text-decoration: underline; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>404</h1>
              <p>Page not found</p>
              <p><a href="/">← Back to Security Recon Tool</a></p>
            </div>
          </body>
          </html>
        `);
        return;
      }
      
      // Determine content type
      const ext = path.extname(filePath);
      let contentType = 'text/html';
      if (ext === '.js') contentType = 'application/javascript';
      else if (ext === '.css') contentType = 'text/css';
      else if (ext === '.json') contentType = 'application/json';
      
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Security Recon Tool running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔍 Main app: http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    process.exit(0);
  });
});
