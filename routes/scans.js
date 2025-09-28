const express = require('express');
const router = express.Router();
const EnhancedSecurityScanner = require('../services/enhancedSecurityScanner');
const AdvancedBugScanner = require('../services/advancedBugScanner');
const ScanResult = require('../models/ScanResult');

// Initialize scanners
const scanner = new EnhancedSecurityScanner();
const advancedScanner = new AdvancedBugScanner();

// Start new scan
router.post('/start', async (req, res) => {
  try {
    const { targetUrl, scanType = 'full', options = {} } = req.body;
    
    if (!targetUrl) {
      return res.status(400).json({ error: 'Target URL is required' });
    }

    // Validate URL
    try {
      new URL(targetUrl);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    // Create scan record
    const scanResult = new ScanResult({
      targetUrl,
      scanType,
      status: 'running',
      metadata: {
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        referer: req.get('Referer'),
        scanOptions: options
      }
    });

    await scanResult.save();

    // Start scan in background
    scanner.scanTarget(targetUrl, options)
      .then(async (scanData) => {
        scanResult.results = scanData.results;
        scanResult.status = 'completed';
        scanResult.endTime = new Date();
        scanResult.duration = scanResult.endTime - scanResult.startTime;
        await scanResult.save();
      })
      .catch(async (error) => {
        console.error('Scan failed:', error);
        scanResult.status = 'failed';
        scanResult.endTime = new Date();
        scanResult.duration = scanResult.endTime - scanResult.startTime;
        await scanResult.save();
      });

    res.json({
      scanId: scanResult.scanId,
      status: 'started',
      message: 'Scan started successfully'
    });

  } catch (error) {
    console.error('Start scan error:', error);
    res.status(500).json({ error: 'Failed to start scan' });
  }
});

// Get scan status
router.get('/status/:scanId', async (req, res) => {
  try {
    const { scanId } = req.params;
    
    const scanResult = await ScanResult.findOne({ scanId });
    
    if (!scanResult) {
      return res.status(404).json({ error: 'Scan not found' });
    }

    res.json({
      scanId: scanResult.scanId,
      targetUrl: scanResult.targetUrl,
      status: scanResult.status,
      startTime: scanResult.startTime,
      endTime: scanResult.endTime,
      duration: scanResult.duration,
      progress: scanResult.status === 'completed' ? 100 : 
                scanResult.status === 'failed' ? 0 : 50
    });

  } catch (error) {
    console.error('Get scan status error:', error);
    res.status(500).json({ error: 'Failed to get scan status' });
  }
});

// Get scan results
router.get('/results/:scanId', async (req, res) => {
  try {
    const { scanId } = req.params;
    
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

    res.json({
      scanId: scanResult.scanId,
      targetUrl: scanResult.targetUrl,
      scanType: scanResult.scanType,
      status: scanResult.status,
      startTime: scanResult.startTime,
      endTime: scanResult.endTime,
      duration: scanResult.duration,
      results: scanResult.results,
      summary: {
        totalEndpoints: scanResult.results.endpoints.length,
        totalSubdomains: scanResult.results.subdomains.length,
        totalS3Buckets: scanResult.results.s3Buckets.length,
        totalSecrets: scanResult.results.secrets.length,
        totalVulnerabilities: scanResult.results.vulnerabilities.length,
        criticalVulnerabilities: scanResult.results.vulnerabilities.filter(v => v.severity === 'Critical').length,
        highVulnerabilities: scanResult.results.vulnerabilities.filter(v => v.severity === 'High').length,
        mediumVulnerabilities: scanResult.results.vulnerabilities.filter(v => v.severity === 'Medium').length,
        lowVulnerabilities: scanResult.results.vulnerabilities.filter(v => v.severity === 'Low').length
      }
    });

  } catch (error) {
    console.error('Get scan results error:', error);
    res.status(500).json({ error: 'Failed to get scan results' });
  }
});

// Get all scans
router.get('/list', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, targetUrl } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (targetUrl) query.targetUrl = { $regex: targetUrl, $options: 'i' };
    
    const scans = await ScanResult.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('scanId targetUrl scanType status startTime endTime duration results.vulnerabilities')
      .exec();

    const total = await ScanResult.countDocuments(query);

    res.json({
      scans,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Get scans list error:', error);
    res.status(500).json({ error: 'Failed to get scans list' });
  }
});

// Cancel scan
router.post('/cancel/:scanId', async (req, res) => {
  try {
    const { scanId } = req.params;
    
    const scanResult = await ScanResult.findOne({ scanId });
    
    if (!scanResult) {
      return res.status(404).json({ error: 'Scan not found' });
    }

    if (scanResult.status === 'completed' || scanResult.status === 'failed') {
      return res.status(400).json({ error: 'Cannot cancel completed or failed scan' });
    }

    scanResult.status = 'cancelled';
    scanResult.endTime = new Date();
    scanResult.duration = scanResult.endTime - scanResult.startTime;
    await scanResult.save();

    res.json({
      scanId: scanResult.scanId,
      status: 'cancelled',
      message: 'Scan cancelled successfully'
    });

  } catch (error) {
    console.error('Cancel scan error:', error);
    res.status(500).json({ error: 'Failed to cancel scan' });
  }
});

// Delete scan
router.delete('/:scanId', async (req, res) => {
  try {
    const { scanId } = req.params;
    
    const scanResult = await ScanResult.findOneAndDelete({ scanId });
    
    if (!scanResult) {
      return res.status(404).json({ error: 'Scan not found' });
    }

    res.json({
      message: 'Scan deleted successfully'
    });

  } catch (error) {
    console.error('Delete scan error:', error);
    res.status(500).json({ error: 'Failed to delete scan' });
  }
});

// Quick scan endpoint
router.post('/quick', async (req, res) => {
  try {
    const { targetUrl } = req.body;
    
    if (!targetUrl) {
      return res.status(400).json({ error: 'Target URL is required' });
    }

    // Quick scan with limited checks
    const quickOptions = {
      endpoints: true,
      headers: true,
      cors: true,
      secrets: true
    };

    const scanData = await scanner.scanTarget(targetUrl, quickOptions);

    res.json({
      scanId: scanData.scanId,
      status: 'completed',
      results: scanData.results,
      message: 'Quick scan completed'
    });

  } catch (error) {
    console.error('Quick scan error:', error);
    res.status(500).json({ error: 'Quick scan failed' });
  }
});

// Advanced bug scan
router.post('/advanced-bug-scan', async (req, res) => {
  try {
    const { targetUrl, categories = {} } = req.body;

    if (!targetUrl) {
      return res.status(400).json({ error: 'Target URL is required' });
    }

    // Create scan result
    const scanResult = new ScanResult({
      targetUrl,
      scanType: 'advanced-bug-scan',
      status: 'running',
      startTime: new Date()
    });

    await scanResult.save();

    // Perform advanced bug scan
    const results = await advancedScanner.scanAdvancedBugs(targetUrl, { categories });

    // Update scan result
    scanResult.status = 'completed';
    scanResult.endTime = new Date();
    scanResult.results = results;
    await scanResult.save();

    res.json({
      success: true,
      scanId: scanResult._id,
      results: results
    });

  } catch (error) {
    console.error('Advanced bug scan error:', error);
    res.status(500).json({ error: 'Advanced bug scan failed' });
  }
});

module.exports = router;
