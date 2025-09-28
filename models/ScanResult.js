const mongoose = require('mongoose');

const ScanResultSchema = new mongoose.Schema({
  targetUrl: {
    type: String,
    required: true,
    index: true
  },
  scanId: {
    type: String,
    required: true,
    unique: true
  },
  scanType: {
    type: String,
    enum: ['full', 'quick', 'custom'],
    default: 'full'
  },
  status: {
    type: String,
    enum: ['running', 'completed', 'failed', 'cancelled'],
    default: 'running'
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  duration: {
    type: Number // in milliseconds
  },
  results: {
    endpoints: [{
      url: String,
      method: String,
      statusCode: Number,
      responseTime: Number,
      headers: Object,
      vulnerabilities: [String]
    }],
    subdomains: [{
      subdomain: String,
      ip: String,
      status: String,
      technologies: [String]
    }],
    s3Buckets: [{
      bucket: String,
      region: String,
      permissions: String,
      public: Boolean
    }],
    secrets: [{
      type: String,
      value: String,
      location: String,
      severity: String
    }],
    cors: [{
      origin: String,
      credentials: Boolean,
      methods: [String],
      headers: [String],
      vulnerable: Boolean
    }],
    xss: [{
      type: String,
      payload: String,
      location: String,
      severity: String
    }],
    openRedirects: [{
      url: String,
      payload: String,
      vulnerable: Boolean
    }],
    headers: [{
      name: String,
      value: String,
      secure: Boolean,
      recommendations: [String]
    }],
    technologies: [{
      name: String,
      version: String,
      confidence: Number
    }],
    certificates: [{
      domain: String,
      issuer: String,
      valid: Boolean,
      expiry: Date
    }],
    dns: [{
      record: String,
      type: String,
      value: String
    }],
    ports: [{
      port: Number,
      service: String,
      state: String,
      version: String
    }],
    vulnerabilities: [{
      name: String,
      severity: String,
      description: String,
      poc: String,
      remediation: String
    }]
  },
  metadata: {
    userAgent: String,
    ip: String,
    referer: String,
    scanOptions: Object
  }
}, {
  timestamps: true
});

// Indexes for better performance
ScanResultSchema.index({ targetUrl: 1, createdAt: -1 });
ScanResultSchema.index({ scanId: 1 });
ScanResultSchema.index({ status: 1 });

module.exports = mongoose.model('ScanResult', ScanResultSchema);
