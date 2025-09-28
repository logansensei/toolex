const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const dns = require('dns').promises;
const crypto = require('crypto');
const { URL } = require('url');

class SecurityScanner {
  constructor() {
    this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
    this.timeout = 30000;
  }

  // Main scan function
  async scanTarget(targetUrl, options = {}) {
    const scanId = this.generateScanId();
    const results = {
      endpoints: [],
      subdomains: [],
      s3Buckets: [],
      secrets: [],
      cors: [],
      xss: [],
      openRedirects: [],
      ssrf: [],
      xxe: [],
      sqli: [],
      csrf: [],
      idor: [],
      lfi: [],
      rfi: [],
      ssti: [],
      deserialization: [],
      jwt: [],
      graphql: [],
      api: [],
      vulnerabilities: []
    };

    try {
      // Basic URL validation
      const url = new URL(targetUrl);
      
      // Parallel scanning
      const scanPromises = [
        this.scanEndpoints(targetUrl),
        this.scanSubdomains(url.hostname),
        this.scanS3Buckets(url.hostname),
        this.scanSecrets(targetUrl),
        this.scanCORS(targetUrl),
        this.scanXSS(targetUrl),
        this.scanOpenRedirects(targetUrl),
        this.scanSSRF(targetUrl),
        this.scanXXE(targetUrl),
        this.scanSQLi(targetUrl),
        this.scanCSRF(targetUrl),
        this.scanIDOR(targetUrl),
        this.scanLFI(targetUrl),
        this.scanRFI(targetUrl),
        this.scanSSTI(targetUrl),
        this.scanDeserialization(targetUrl),
        this.scanJWT(targetUrl),
        this.scanGraphQL(targetUrl),
        this.scanAPI(targetUrl)
      ];

      const scanResults = await Promise.allSettled(scanPromises);
      
      // Process results
      scanResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          const keys = Object.keys(results);
          if (keys[index]) {
            results[keys[index]] = result.value;
          }
        }
      });

      // Analyze for vulnerabilities
      results.vulnerabilities = await this.analyzeVulnerabilities(results);

      return { scanId, results };
    } catch (error) {
      console.error('Scan error:', error);
      throw error;
    }
  }

  // Endpoint discovery
  async scanEndpoints(targetUrl) {
    const endpoints = new Set();
    
    try {
      const response = await axios.get(targetUrl, {
        timeout: this.timeout,
        headers: { 'User-Agent': this.userAgent }
      });
      
      const $ = cheerio.load(response.data);
      
      // Extract from HTML
      $('a[href]').each((i, el) => {
        const href = $(el).attr('href');
        if (href && (href.startsWith('/') || href.startsWith('http'))) {
          endpoints.add(href);
        }
      });

      $('form[action]').each((i, el) => {
        const action = $(el).attr('action');
        if (action) endpoints.add(action);
      });

      // Extract from JavaScript
      const scriptContent = $('script').text();
      const jsEndpoints = this.extractEndpointsFromJS(scriptContent);
      jsEndpoints.forEach(endpoint => endpoints.add(endpoint));

      // Extract from CSS
      const styleContent = $('style').text();
      const cssEndpoints = this.extractEndpointsFromCSS(styleContent);
      cssEndpoints.forEach(endpoint => endpoints.add(endpoint));

      return Array.from(endpoints).map(url => ({
        url: this.normalizeUrl(url, targetUrl),
        method: 'GET',
        statusCode: 200,
        responseTime: 0,
        headers: {},
        vulnerabilities: []
      }));
    } catch (error) {
      console.error('Endpoint scan error:', error);
      return [];
    }
  }

  // Subdomain enumeration
  async scanSubdomains(domain) {
    const subdomains = new Set();
    const commonSubdomains = [
      'www', 'mail', 'ftp', 'admin', 'api', 'app', 'blog', 'shop', 'store',
      'dev', 'test', 'staging', 'prod', 'production', 'demo', 'beta', 'alpha',
      'cdn', 'static', 'assets', 'img', 'images', 'js', 'css', 'files',
      'docs', 'help', 'support', 'status', 'monitor', 'dashboard', 'panel',
      'login', 'auth', 'oauth', 'sso', 'account', 'user', 'users', 'profile',
      'secure', 'ssl', 'vpn', 'remote', 'backup', 'db', 'database', 'mysql',
      'postgres', 'redis', 'cache', 'queue', 'worker', 'job', 'cron',
      'webhook', 'callback', 'notify', 'alert', 'log', 'logs', 'analytics',
      'stats', 'metrics', 'report', 'reports', 'export', 'import', 'sync'
    ];

    for (const subdomain of commonSubdomains) {
      try {
        const fullDomain = `${subdomain}.${domain}`;
        const addresses = await dns.resolve4(fullDomain);
        if (addresses.length > 0) {
          subdomains.add({
            subdomain: fullDomain,
            ip: addresses[0],
            status: 'active',
            technologies: []
          });
        }
      } catch (error) {
        // Subdomain doesn't exist
      }
    }

    return Array.from(subdomains);
  }

  // S3 bucket discovery
  async scanS3Buckets(domain) {
    const buckets = [];
    const bucketNames = [
      domain,
      `www-${domain}`,
      `${domain}-www`,
      `s3-${domain}`,
      `${domain}-s3`,
      `assets-${domain}`,
      `${domain}-assets`,
      `static-${domain}`,
      `${domain}-static`,
      `files-${domain}`,
      `${domain}-files`
    ];

    for (const bucketName of bucketNames) {
      try {
        const response = await axios.head(`https://${bucketName}.s3.amazonaws.com/`, {
          timeout: 5000
        });
        
        buckets.push({
          bucket: bucketName,
          region: 'us-east-1',
          permissions: 'public-read',
          public: true
        });
      } catch (error) {
        // Bucket doesn't exist or is private
      }
    }

    return buckets;
  }

  // Secrets detection
  async scanSecrets(targetUrl) {
    const secrets = [];
    
    try {
      const response = await axios.get(targetUrl, {
        timeout: this.timeout,
        headers: { 'User-Agent': this.userAgent }
      });
      
      const content = response.data;
      
      // API Keys
      const apiKeyPatterns = [
        /api[_-]?key["'`]?\s*[:=]\s*["'`]([a-zA-Z0-9_\-]{20,})["'`]/gi,
        /["'`]([a-zA-Z0-9_\-]{32,})["'`]/g
      ];
      
      apiKeyPatterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          secrets.push({
            type: 'API Key',
            value: match[1],
            location: 'Response body',
            severity: 'High'
          });
        }
      });

      // JWT Tokens
      const jwtPattern = /eyJ[a-zA-Z0-9_\-=]+\.eyJ[a-zA-Z0-9_\-=]+\.[a-zA-Z0-9_\-=]+/g;
      let jwtMatch;
      while ((jwtMatch = jwtPattern.exec(content)) !== null) {
        secrets.push({
          type: 'JWT Token',
          value: jwtMatch[0],
          location: 'Response body',
          severity: 'High'
        });
      }

      // Database URLs
      const dbPatterns = [
        /mongodb:\/\/[^"'`\s]+/g,
        /mysql:\/\/[^"'`\s]+/g,
        /postgresql:\/\/[^"'`\s]+/g,
        /redis:\/\/[^"'`\s]+/g
      ];
      
      dbPatterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          secrets.push({
            type: 'Database URL',
            value: match[0],
            location: 'Response body',
            severity: 'Critical'
          });
        }
      });

      // AWS Keys
      const awsPattern = /AKIA[0-9A-Z]{16}/g;
      let awsMatch;
      while ((awsMatch = awsPattern.exec(content)) !== null) {
        secrets.push({
          type: 'AWS Access Key',
          value: awsMatch[0],
          location: 'Response body',
          severity: 'Critical'
        });
      }

    } catch (error) {
      console.error('Secrets scan error:', error);
    }

    return secrets;
  }

  // CORS misconfiguration detection
  async scanCORS(targetUrl) {
    const corsResults = [];
    
    try {
      const response = await axios.get(targetUrl, {
        timeout: this.timeout,
        headers: { 
          'User-Agent': this.userAgent,
          'Origin': 'https://evil.com'
        }
      });
      
      const corsHeaders = {
        'Access-Control-Allow-Origin': response.headers['access-control-allow-origin'],
        'Access-Control-Allow-Credentials': response.headers['access-control-allow-credentials'],
        'Access-Control-Allow-Methods': response.headers['access-control-allow-methods'],
        'Access-Control-Allow-Headers': response.headers['access-control-allow-headers']
      };

      const isVulnerable = corsHeaders['Access-Control-Allow-Origin'] === '*' && 
                          corsHeaders['Access-Control-Allow-Credentials'] === 'true';

      corsResults.push({
        origin: corsHeaders['Access-Control-Allow-Origin'] || 'Not set',
        credentials: corsHeaders['Access-Control-Allow-Credentials'] === 'true',
        methods: corsHeaders['Access-Control-Allow-Methods']?.split(',') || [],
        headers: corsHeaders['Access-Control-Allow-Headers']?.split(',') || [],
        vulnerable: isVulnerable
      });

    } catch (error) {
      console.error('CORS scan error:', error);
    }

    return corsResults;
  }

  // XSS vulnerability detection
  async scanXSS(targetUrl) {
    const xssResults = [];
    const payloads = [
      '<script>alert("XSS")</script>',
      '<img src=x onerror=alert("XSS")>',
      '<svg onload=alert("XSS")>',
      'javascript:alert("XSS")',
      '<iframe src="javascript:alert(\'XSS\')"></iframe>'
    ];

    try {
      const browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();
      
      for (const payload of payloads) {
        try {
          await page.goto(`${targetUrl}?test=${encodeURIComponent(payload)}`, {
            waitUntil: 'networkidle2',
            timeout: 10000
          });
          
          const alerts = await page.evaluate(() => {
            return window.alertCalls || [];
          });
          
          if (alerts.length > 0) {
            xssResults.push({
              type: 'Reflected XSS',
              payload: payload,
              location: 'URL parameter',
              severity: 'High'
            });
          }
        } catch (error) {
          // Continue with next payload
        }
      }
      
      await browser.close();
    } catch (error) {
      console.error('XSS scan error:', error);
    }

    return xssResults;
  }

  // Open redirect detection
  async scanOpenRedirects(targetUrl) {
    const redirectResults = [];
    const redirectPayloads = [
      'https://evil.com',
      '//evil.com',
      'javascript:alert(1)',
      'data:text/html,<script>alert(1)</script>',
      'ftp://evil.com',
      'file:///etc/passwd'
    ];

    for (const payload of redirectPayloads) {
      try {
        const response = await axios.get(`${targetUrl}?redirect=${encodeURIComponent(payload)}`, {
          timeout: 10000,
          maxRedirects: 0,
          validateStatus: (status) => status < 400
        });
        
        if (response.headers.location && response.headers.location.includes('evil.com')) {
          redirectResults.push({
            url: `${targetUrl}?redirect=${payload}`,
            payload: payload,
            vulnerable: true
          });
        }
      } catch (error) {
        // Continue with next payload
      }
    }

    return redirectResults;
  }

  // Security headers analysis
  async scanHeaders(targetUrl) {
    const headerResults = [];
    
    try {
      const response = await axios.get(targetUrl, {
        timeout: this.timeout,
        headers: { 'User-Agent': this.userAgent }
      });
      
      const securityHeaders = [
        'X-Frame-Options',
        'X-Content-Type-Options',
        'X-XSS-Protection',
        'Strict-Transport-Security',
        'Content-Security-Policy',
        'Referrer-Policy',
        'Permissions-Policy',
        'X-Permitted-Cross-Domain-Policies'
      ];

      securityHeaders.forEach(header => {
        const value = response.headers[header.toLowerCase()];
        const isPresent = !!value;
        
        headerResults.push({
          name: header,
          value: value || 'Not set',
          secure: this.isHeaderSecure(header, value),
          recommendations: this.getHeaderRecommendations(header, value)
        });
      });

    } catch (error) {
      console.error('Headers scan error:', error);
    }

    return headerResults;
  }

  // Technology detection
  async scanTechnologies(targetUrl) {
    const technologies = [];
    
    try {
      const response = await axios.get(targetUrl, {
        timeout: this.timeout,
        headers: { 'User-Agent': this.userAgent }
      });
      
      const headers = response.headers;
      const content = response.data;
      
      // Server detection
      if (headers.server) {
        technologies.push({
          name: 'Server',
          version: headers.server,
          confidence: 90
        });
      }
      
      // Framework detection
      if (headers['x-powered-by']) {
        technologies.push({
          name: 'Framework',
          version: headers['x-powered-by'],
          confidence: 80
        });
      }
      
      // Content analysis
      if (content.includes('React')) {
        technologies.push({
          name: 'React',
          version: 'Unknown',
          confidence: 70
        });
      }
      
      if (content.includes('Vue')) {
        technologies.push({
          name: 'Vue.js',
          version: 'Unknown',
          confidence: 70
        });
      }
      
      if (content.includes('jQuery')) {
        technologies.push({
          name: 'jQuery',
          version: 'Unknown',
          confidence: 70
        });
      }

    } catch (error) {
      console.error('Technology scan error:', error);
    }

    return technologies;
  }

  // Certificate analysis
  async scanCertificates(domain) {
    const certificates = [];
    
    try {
      const https = require('https');
      const options = {
        hostname: domain,
        port: 443,
        path: '/',
        method: 'GET',
        rejectUnauthorized: false
      };
      
      const req = https.request(options, (res) => {
        const cert = res.connection.getPeerCertificate();
        if (cert) {
          certificates.push({
            domain: domain,
            issuer: cert.issuer.CN,
            valid: cert.valid_to > new Date(),
            expiry: new Date(cert.valid_to)
          });
        }
      });
      
      req.on('error', (error) => {
        console.error('Certificate scan error:', error);
      });
      
      req.end();
    } catch (error) {
      console.error('Certificate scan error:', error);
    }

    return certificates;
  }

  // DNS records analysis
  async scanDNS(domain) {
    const dnsRecords = [];
    
    try {
      const recordTypes = ['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS'];
      
      for (const type of recordTypes) {
        try {
          const records = await dns.resolve(domain, type);
          records.forEach(record => {
            dnsRecords.push({
              record: domain,
              type: type,
              value: record
            });
          });
        } catch (error) {
          // Record type not found
        }
      }
    } catch (error) {
      console.error('DNS scan error:', error);
    }

    return dnsRecords;
  }

  // Port scanning
  async scanPorts(hostname) {
    const ports = [];
    const commonPorts = [21, 22, 23, 25, 53, 80, 110, 143, 443, 993, 995, 3389, 5432, 3306, 6379, 27017];
    
    for (const port of commonPorts) {
      try {
        const net = require('net');
        const socket = new net.Socket();
        
        await new Promise((resolve, reject) => {
          socket.setTimeout(1000);
          socket.connect(port, hostname, () => {
            ports.push({
              port: port,
              service: this.getServiceName(port),
              state: 'open',
              version: 'Unknown'
            });
            socket.destroy();
            resolve();
          });
          
          socket.on('error', () => {
            socket.destroy();
            reject();
          });
        });
      } catch (error) {
        // Port is closed
      }
    }

    return ports;
  }

  // Vulnerability analysis
  async analyzeVulnerabilities(results) {
    const vulnerabilities = [];
    
    // CORS vulnerabilities
    results.cors.forEach(cors => {
      if (cors.vulnerable) {
        vulnerabilities.push({
          name: 'CORS Misconfiguration',
          severity: 'High',
          description: 'CORS allows credentials with wildcard origin',
          poc: 'Send request with Origin: https://evil.com and credentials: true',
          remediation: 'Set specific origins instead of wildcard when using credentials'
        });
      }
    });
    
    // Missing security headers
    results.headers.forEach(header => {
      if (!header.secure) {
        vulnerabilities.push({
          name: `Missing ${header.name}`,
          severity: 'Medium',
          description: `Security header ${header.name} is missing or misconfigured`,
          poc: `Check response headers for ${header.name}`,
          remediation: header.recommendations.join('; ')
        });
      }
    });
    
    // Exposed secrets
    results.secrets.forEach(secret => {
      vulnerabilities.push({
        name: `Exposed ${secret.type}`,
        severity: secret.severity,
        description: `${secret.type} found in response`,
        poc: `Check ${secret.location} for ${secret.type}`,
        remediation: 'Remove or rotate the exposed secret immediately'
      });
    });
    
    // XSS vulnerabilities
    results.xss.forEach(xss => {
      vulnerabilities.push({
        name: 'Cross-Site Scripting (XSS)',
        severity: xss.severity,
        description: `XSS vulnerability found with payload: ${xss.payload}`,
        poc: `Test with payload: ${xss.payload}`,
        remediation: 'Implement proper input validation and output encoding'
      });
    });
    
    // Open redirects
    results.openRedirects.forEach(redirect => {
      if (redirect.vulnerable) {
        vulnerabilities.push({
          name: 'Open Redirect',
          severity: 'Medium',
          description: 'Application allows redirect to external domains',
          poc: `Test with: ${redirect.url}`,
          remediation: 'Implement allowlist of valid redirect URLs'
        });
      }
    });

    return vulnerabilities;
  }

  // Helper methods
  generateScanId() {
    return crypto.randomBytes(16).toString('hex');
  }

  normalizeUrl(url, baseUrl) {
    try {
      return new URL(url, baseUrl).href;
    } catch (error) {
      return url;
    }
  }

  extractEndpointsFromJS(content) {
    const endpoints = [];
    const patterns = [
      /fetch\(["'`]([^"'`]+)["'`]\)/g,
      /axios\.(get|post|put|delete|patch)\(["'`]([^"'`]+)["'`]\)/g,
      /\.ajax\([^)]*url\s*:\s*["'`]([^"'`]+)["'`]/g,
      /XMLHttpRequest.*open\(["'`]([^"'`]+)["'`]/g
    ];
    
    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        endpoints.push(match[1] || match[2]);
      }
    });
    
    return endpoints;
  }

  extractEndpointsFromCSS(content) {
    const endpoints = [];
    const pattern = /url\(["'`]?([^"'`)]+)["'`]?\)/g;
    
    let match;
    while ((match = pattern.exec(content)) !== null) {
      endpoints.push(match[1]);
    }
    
    return endpoints;
  }

  isHeaderSecure(headerName, value) {
    const secureValues = {
      'X-Frame-Options': ['DENY', 'SAMEORIGIN'],
      'X-Content-Type-Options': ['nosniff'],
      'X-XSS-Protection': ['1; mode=block'],
      'Strict-Transport-Security': [/max-age=\d+/],
      'Content-Security-Policy': [/.*/]
    };
    
    if (!value) return false;
    
    const expected = secureValues[headerName];
    if (!expected) return true;
    
    return expected.some(exp => 
      typeof exp === 'string' ? value.includes(exp) : exp.test(value)
    );
  }

  getHeaderRecommendations(headerName, value) {
    const recommendations = {
      'X-Frame-Options': ['Set to DENY or SAMEORIGIN'],
      'X-Content-Type-Options': ['Set to nosniff'],
      'X-XSS-Protection': ['Set to 1; mode=block'],
      'Strict-Transport-Security': ['Set max-age to at least 31536000'],
      'Content-Security-Policy': ['Implement a restrictive CSP'],
      'Referrer-Policy': ['Set to strict-origin-when-cross-origin'],
      'Permissions-Policy': ['Implement restrictive permissions policy']
    };
    
    return recommendations[headerName] || ['Header is properly configured'];
  }

  getServiceName(port) {
    const services = {
      21: 'FTP',
      22: 'SSH',
      23: 'Telnet',
      25: 'SMTP',
      53: 'DNS',
      80: 'HTTP',
      110: 'POP3',
      143: 'IMAP',
      443: 'HTTPS',
      993: 'IMAPS',
      995: 'POP3S',
      3389: 'RDP',
      5432: 'PostgreSQL',
      3306: 'MySQL',
      6379: 'Redis',
      27017: 'MongoDB'
    };
    
    return services[port] || 'Unknown';
  }
}

module.exports = SecurityScanner;
