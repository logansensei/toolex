const express = require('express');
const router = express.Router();
const ScanResult = require('../models/ScanResult');

// Generate comprehensive report
router.get('/:scanId', async (req, res) => {
  try {
    const { scanId } = req.params;
    const { format = 'json' } = req.query;
    
    const scanResult = await ScanResult.findOne({ scanId });
    
    if (!scanResult) {
      return res.status(404).json({ error: 'Scan not found' });
    }

    if (scanResult.status !== 'completed') {
      return res.status(400).json({ 
        error: 'Scan not completed yet',
        status: scanResult.status
      });
    }

    const report = generateReport(scanResult);

    if (format === 'html') {
      const htmlReport = generateHTMLReport(report);
      res.setHeader('Content-Type', 'text/html');
      res.send(htmlReport);
    } else if (format === 'pdf') {
      // PDF generation would require additional library like puppeteer
      res.status(501).json({ error: 'PDF format not implemented yet' });
    } else {
      res.json(report);
    }

  } catch (error) {
    console.error('Generate report error:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

// Generate executive summary
router.get('/:scanId/summary', async (req, res) => {
  try {
    const { scanId } = req.params;
    
    const scanResult = await ScanResult.findOne({ scanId });
    
    if (!scanResult) {
      return res.status(404).json({ error: 'Scan not found' });
    }

    const summary = {
      scanId: scanResult.scanId,
      targetUrl: scanResult.targetUrl,
      scanDate: scanResult.startTime,
      duration: scanResult.duration,
      totalVulnerabilities: scanResult.results.vulnerabilities.length,
      severityBreakdown: {
        critical: scanResult.results.vulnerabilities.filter(v => v.severity === 'Critical').length,
        high: scanResult.results.vulnerabilities.filter(v => v.severity === 'High').length,
        medium: scanResult.results.vulnerabilities.filter(v => v.severity === 'Medium').length,
        low: scanResult.results.vulnerabilities.filter(v => v.severity === 'Low').length
      },
      keyFindings: getKeyFindings(scanResult.results),
      recommendations: getTopRecommendations(scanResult.results)
    };

    res.json(summary);

  } catch (error) {
    console.error('Generate summary error:', error);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
});

// Export scan data
router.get('/:scanId/export', async (req, res) => {
  try {
    const { scanId } = req.params;
    const { format = 'json' } = req.query;
    
    const scanResult = await ScanResult.findOne({ scanId });
    
    if (!scanResult) {
      return res.status(404).json({ error: 'Scan not found' });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    let filename, contentType, data;

    if (format === 'csv') {
      filename = `scan_${scanId}_${timestamp}.csv`;
      contentType = 'text/csv';
      data = generateCSV(scanResult);
    } else if (format === 'txt') {
      filename = `scan_${scanId}_${timestamp}.txt`;
      contentType = 'text/plain';
      data = generateTextReport(scanResult);
    } else {
      filename = `scan_${scanId}_${timestamp}.json`;
      contentType = 'application/json';
      data = JSON.stringify(scanResult, null, 2);
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(data);

  } catch (error) {
    console.error('Export scan error:', error);
    res.status(500).json({ error: 'Failed to export scan data' });
  }
});

// Generate vulnerability report
router.get('/:scanId/vulnerabilities', async (req, res) => {
  try {
    const { scanId } = req.params;
    const { severity, category } = req.query;
    
    const scanResult = await ScanResult.findOne({ scanId });
    
    if (!scanResult) {
      return res.status(404).json({ error: 'Scan not found' });
    }

    let vulnerabilities = scanResult.results.vulnerabilities;

    // Filter by severity
    if (severity) {
      vulnerabilities = vulnerabilities.filter(v => v.severity.toLowerCase() === severity.toLowerCase());
    }

    // Filter by category
    if (category) {
      vulnerabilities = vulnerabilities.filter(v => 
        v.name.toLowerCase().includes(category.toLowerCase())
      );
    }

    // Sort by severity
    const severityOrder = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
    vulnerabilities.sort((a, b) => severityOrder[b.severity] - severityOrder[a.severity]);

    res.json({
      scanId: scanResult.scanId,
      targetUrl: scanResult.targetUrl,
      totalVulnerabilities: vulnerabilities.length,
      vulnerabilities: vulnerabilities
    });

  } catch (error) {
    console.error('Get vulnerabilities error:', error);
    res.status(500).json({ error: 'Failed to get vulnerabilities' });
  }
});

// Generate comparison report
router.post('/compare', async (req, res) => {
  try {
    const { scanIds } = req.body;
    
    if (!scanIds || !Array.isArray(scanIds) || scanIds.length < 2) {
      return res.status(400).json({ error: 'At least 2 scan IDs required for comparison' });
    }

    const scans = await ScanResult.find({ scanId: { $in: scanIds } });
    
    if (scans.length !== scanIds.length) {
      return res.status(404).json({ error: 'One or more scans not found' });
    }

    const comparison = generateComparisonReport(scans);
    res.json(comparison);

  } catch (error) {
    console.error('Compare scans error:', error);
    res.status(500).json({ error: 'Failed to compare scans' });
  }
});

// Helper functions
function generateReport(scanResult) {
  const results = scanResult.results;
  
  return {
    metadata: {
      scanId: scanResult.scanId,
      targetUrl: scanResult.targetUrl,
      scanType: scanResult.scanType,
      scanDate: scanResult.startTime,
      duration: scanResult.duration,
      generatedAt: new Date().toISOString()
    },
    executiveSummary: {
      totalVulnerabilities: results.vulnerabilities.length,
      criticalVulnerabilities: results.vulnerabilities.filter(v => v.severity === 'Critical').length,
      highVulnerabilities: results.vulnerabilities.filter(v => v.severity === 'High').length,
      mediumVulnerabilities: results.vulnerabilities.filter(v => v.severity === 'Medium').length,
      lowVulnerabilities: results.vulnerabilities.filter(v => v.severity === 'Low').length,
      riskScore: calculateRiskScore(results.vulnerabilities),
      keyFindings: getKeyFindings(results)
    },
    technicalDetails: {
      endpoints: {
        total: results.endpoints.length,
        vulnerable: results.endpoints.filter(e => e.vulnerabilities.length > 0).length,
        details: results.endpoints
      },
      subdomains: {
        total: results.subdomains.length,
        active: results.subdomains.filter(s => s.status === 'active').length,
        details: results.subdomains
      },
      s3Buckets: {
        total: results.s3Buckets.length,
        public: results.s3Buckets.filter(b => b.public).length,
        details: results.s3Buckets
      },
      secrets: {
        total: results.secrets.length,
        critical: results.secrets.filter(s => s.severity === 'Critical').length,
        details: results.secrets
      },
      cors: {
        total: results.cors.length,
        vulnerable: results.cors.filter(c => c.vulnerable).length,
        details: results.cors
      },
      xss: {
        total: results.xss.length,
        details: results.xss
      },
      openRedirects: {
        total: results.openRedirects.length,
        vulnerable: results.openRedirects.filter(o => o.vulnerable).length,
        details: results.openRedirects
      },
      headers: {
        total: results.headers.length,
        secure: results.headers.filter(h => h.secure).length,
        details: results.headers
      },
      technologies: {
        total: results.technologies.length,
        details: results.technologies
      },
      certificates: {
        total: results.certificates.length,
        valid: results.certificates.filter(c => c.valid).length,
        details: results.certificates
      },
      dns: {
        total: results.dns.length,
        details: results.dns
      },
      ports: {
        total: results.ports.length,
        open: results.ports.filter(p => p.state === 'open').length,
        details: results.ports
      }
    },
    vulnerabilities: {
      total: results.vulnerabilities.length,
      bySeverity: groupBy(results.vulnerabilities, 'severity'),
      byCategory: groupBy(results.vulnerabilities, 'name'),
      details: results.vulnerabilities
    },
    recommendations: getRecommendations(results)
  };
}

function generateHTMLReport(report) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Security Scan Report - ${report.metadata.targetUrl}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #333; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .summary-card { background: #f8f9fa; padding: 20px; border-radius: 6px; text-align: center; }
        .summary-card h3 { margin: 0 0 10px 0; color: #333; }
        .summary-card .number { font-size: 2em; font-weight: bold; }
        .critical { color: #dc3545; }
        .high { color: #fd7e14; }
        .medium { color: #ffc107; }
        .low { color: #28a745; }
        .section { margin-bottom: 30px; }
        .section h2 { color: #333; border-bottom: 1px solid #ddd; padding-bottom: 10px; }
        .vulnerability { background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 6px; border-left: 4px solid #dc3545; }
        .vulnerability.high { border-left-color: #fd7e14; }
        .vulnerability.medium { border-left-color: #ffc107; }
        .vulnerability.low { border-left-color: #28a745; }
        .vulnerability h4 { margin: 0 0 10px 0; }
        .vulnerability .severity { display: inline-block; padding: 4px 8px; border-radius: 4px; color: white; font-size: 0.8em; }
        .severity.critical { background: #dc3545; }
        .severity.high { background: #fd7e14; }
        .severity.medium { background: #ffc107; }
        .severity.low { background: #28a745; }
        .recommendations { background: #e7f3ff; padding: 20px; border-radius: 6px; }
        .recommendations ul { margin: 0; padding-left: 20px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f8f9fa; font-weight: bold; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔒 Security Scan Report</h1>
            <p><strong>Target:</strong> ${report.metadata.targetUrl}</p>
            <p><strong>Scan Date:</strong> ${new Date(report.metadata.scanDate).toLocaleString()}</p>
            <p><strong>Duration:</strong> ${Math.round(report.metadata.duration / 1000)}s</p>
        </div>

        <div class="summary">
            <div class="summary-card">
                <h3>Total Vulnerabilities</h3>
                <div class="number">${report.executiveSummary.totalVulnerabilities}</div>
            </div>
            <div class="summary-card">
                <h3>Critical</h3>
                <div class="number critical">${report.executiveSummary.criticalVulnerabilities}</div>
            </div>
            <div class="summary-card">
                <h3>High</h3>
                <div class="number high">${report.executiveSummary.highVulnerabilities}</div>
            </div>
            <div class="summary-card">
                <h3>Medium</h3>
                <div class="number medium">${report.executiveSummary.mediumVulnerabilities}</div>
            </div>
            <div class="summary-card">
                <h3>Low</h3>
                <div class="number low">${report.executiveSummary.lowVulnerabilities}</div>
            </div>
            <div class="summary-card">
                <h3>Risk Score</h3>
                <div class="number">${report.executiveSummary.riskScore}/100</div>
            </div>
        </div>

        <div class="section">
            <h2>🚨 Vulnerabilities</h2>
            ${report.vulnerabilities.details.map(vuln => `
                <div class="vulnerability ${vuln.severity.toLowerCase()}">
                    <h4>${vuln.name}</h4>
                    <span class="severity ${vuln.severity.toLowerCase()}">${vuln.severity}</span>
                    <p><strong>Description:</strong> ${vuln.description}</p>
                    <p><strong>PoC:</strong> ${vuln.poc}</p>
                    <p><strong>Remediation:</strong> ${vuln.remediation}</p>
                </div>
            `).join('')}
        </div>

        <div class="section">
            <h2>📊 Technical Details</h2>
            <table>
                <tr><th>Category</th><th>Total</th><th>Vulnerable/Issues</th></tr>
                <tr><td>Endpoints</td><td>${report.technicalDetails.endpoints.total}</td><td>${report.technicalDetails.endpoints.vulnerable}</td></tr>
                <tr><td>Subdomains</td><td>${report.technicalDetails.subdomains.total}</td><td>${report.technicalDetails.subdomains.active}</td></tr>
                <tr><td>S3 Buckets</td><td>${report.technicalDetails.s3Buckets.total}</td><td>${report.technicalDetails.s3Buckets.public}</td></tr>
                <tr><td>Secrets</td><td>${report.technicalDetails.secrets.total}</td><td>${report.technicalDetails.secrets.critical}</td></tr>
                <tr><td>CORS</td><td>${report.technicalDetails.cors.total}</td><td>${report.technicalDetails.cors.vulnerable}</td></tr>
                <tr><td>XSS</td><td>${report.technicalDetails.xss.total}</td><td>${report.technicalDetails.xss.total}</td></tr>
                <tr><td>Open Redirects</td><td>${report.technicalDetails.openRedirects.total}</td><td>${report.technicalDetails.openRedirects.vulnerable}</td></tr>
                <tr><td>Security Headers</td><td>${report.technicalDetails.headers.total}</td><td>${report.technicalDetails.headers.total - report.technicalDetails.headers.secure}</td></tr>
            </table>
        </div>

        <div class="section">
            <h2>💡 Recommendations</h2>
            <div class="recommendations">
                <ul>
                    ${report.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                </ul>
            </div>
        </div>

        <div class="footer">
            <p>Report generated by Security Recon Tool on ${new Date().toLocaleString()}</p>
        </div>
    </div>
</body>
</html>
  `;
}

function generateCSV(scanResult) {
  const results = scanResult.results;
  let csv = 'Category,Name,Severity,Description,PoC,Remediation\n';
  
  results.vulnerabilities.forEach(vuln => {
    csv += `Vulnerability,"${vuln.name}","${vuln.severity}","${vuln.description}","${vuln.poc}","${vuln.remediation}"\n`;
  });
  
  results.endpoints.forEach(endpoint => {
    csv += `Endpoint,"${endpoint.url}","N/A","Endpoint discovered","${endpoint.url}","Review endpoint security"\n`;
  });
  
  results.secrets.forEach(secret => {
    csv += `Secret,"${secret.type}","${secret.severity}","${secret.type} found","${secret.location}","Remove or rotate secret"\n`;
  });
  
  return csv;
}

function generateTextReport(scanResult) {
  const report = generateReport(scanResult);
  let text = `SECURITY SCAN REPORT\n`;
  text += `==================\n\n`;
  text += `Target: ${report.metadata.targetUrl}\n`;
  text += `Scan Date: ${new Date(report.metadata.scanDate).toLocaleString()}\n`;
  text += `Duration: ${Math.round(report.metadata.duration / 1000)}s\n\n`;
  
  text += `EXECUTIVE SUMMARY\n`;
  text += `================\n`;
  text += `Total Vulnerabilities: ${report.executiveSummary.totalVulnerabilities}\n`;
  text += `Critical: ${report.executiveSummary.criticalVulnerabilities}\n`;
  text += `High: ${report.executiveSummary.highVulnerabilities}\n`;
  text += `Medium: ${report.executiveSummary.mediumVulnerabilities}\n`;
  text += `Low: ${report.executiveSummary.lowVulnerabilities}\n`;
  text += `Risk Score: ${report.executiveSummary.riskScore}/100\n\n`;
  
  text += `VULNERABILITIES\n`;
  text += `==============\n`;
  report.vulnerabilities.details.forEach((vuln, index) => {
    text += `${index + 1}. ${vuln.name} (${vuln.severity})\n`;
    text += `   Description: ${vuln.description}\n`;
    text += `   PoC: ${vuln.poc}\n`;
    text += `   Remediation: ${vuln.remediation}\n\n`;
  });
  
  text += `RECOMMENDATIONS\n`;
  text += `==============\n`;
  report.recommendations.forEach((rec, index) => {
    text += `${index + 1}. ${rec}\n`;
  });
  
  return text;
}

function generateComparisonReport(scans) {
  const comparison = {
    scans: scans.map(scan => ({
      scanId: scan.scanId,
      targetUrl: scan.targetUrl,
      scanDate: scan.startTime,
      totalVulnerabilities: scan.results.vulnerabilities.length,
      severityBreakdown: {
        critical: scan.results.vulnerabilities.filter(v => v.severity === 'Critical').length,
        high: scan.results.vulnerabilities.filter(v => v.severity === 'High').length,
        medium: scan.results.vulnerabilities.filter(v => v.severity === 'Medium').length,
        low: scan.results.vulnerabilities.filter(v => v.severity === 'Low').length
      }
    })),
    trends: {
      vulnerabilityTrend: 'stable', // Would need historical data
      improvementAreas: [],
      regressionAreas: []
    }
  };
  
  return comparison;
}

function calculateRiskScore(vulnerabilities) {
  const weights = { 'Critical': 10, 'High': 7, 'Medium': 4, 'Low': 1 };
  const totalWeight = vulnerabilities.reduce((sum, vuln) => sum + weights[vuln.severity], 0);
  return Math.min(100, totalWeight);
}

function getKeyFindings(results) {
  const findings = [];
  
  if (results.vulnerabilities.filter(v => v.severity === 'Critical').length > 0) {
    findings.push('Critical vulnerabilities found that require immediate attention');
  }
  
  if (results.secrets.length > 0) {
    findings.push(`${results.secrets.length} secrets exposed in the application`);
  }
  
  if (results.cors.filter(c => c.vulnerable).length > 0) {
    findings.push('CORS misconfigurations detected');
  }
  
  if (results.s3Buckets.filter(b => b.public).length > 0) {
    findings.push('Public S3 buckets discovered');
  }
  
  return findings;
}

function getTopRecommendations(results) {
  const recommendations = [];
  
  if (results.vulnerabilities.filter(v => v.severity === 'Critical').length > 0) {
    recommendations.push('Address all critical vulnerabilities immediately');
  }
  
  if (results.secrets.length > 0) {
    recommendations.push('Remove or rotate all exposed secrets');
  }
  
  if (results.headers.filter(h => !h.secure).length > 0) {
    recommendations.push('Implement proper security headers');
  }
  
  if (results.cors.filter(c => c.vulnerable).length > 0) {
    recommendations.push('Fix CORS misconfigurations');
  }
  
  return recommendations;
}

function getRecommendations(results) {
  const recommendations = [];
  
  // Security headers
  if (results.headers.filter(h => !h.secure).length > 0) {
    recommendations.push('Implement missing security headers (X-Frame-Options, CSP, HSTS, etc.)');
  }
  
  // CORS
  if (results.cors.filter(c => c.vulnerable).length > 0) {
    recommendations.push('Configure CORS properly to prevent unauthorized cross-origin requests');
  }
  
  // Secrets
  if (results.secrets.length > 0) {
    recommendations.push('Implement proper secret management and remove hardcoded secrets');
  }
  
  // XSS
  if (results.xss.length > 0) {
    recommendations.push('Implement proper input validation and output encoding to prevent XSS');
  }
  
  // Open redirects
  if (results.openRedirects.filter(o => o.vulnerable).length > 0) {
    recommendations.push('Implement allowlist for redirect URLs to prevent open redirects');
  }
  
  // S3 buckets
  if (results.s3Buckets.filter(b => b.public).length > 0) {
    recommendations.push('Review S3 bucket permissions and make private if not needed');
  }
  
  return recommendations;
}

function groupBy(array, key) {
  return array.reduce((groups, item) => {
    const group = item[key];
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {});
}

module.exports = router;
