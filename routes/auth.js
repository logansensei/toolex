const express = require('express');
const router = express.Router();
const crypto = require('crypto');

// Simple API key authentication for demo purposes
// In production, implement proper JWT authentication
const API_KEYS = new Map([
  ['demo-key-123', { name: 'Demo User', permissions: ['read', 'write'] }],
  ['admin-key-456', { name: 'Admin User', permissions: ['read', 'write', 'admin'] }]
]);

// Middleware to check API key
const authenticateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.query.api_key;
  
  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }
  
  const user = API_KEYS.get(apiKey);
  if (!user) {
    return res.status(401).json({ error: 'Invalid API key' });
  }
  
  req.user = user;
  next();
};

// Generate new API key
router.post('/generate-key', (req, res) => {
  try {
    const { name, permissions = ['read'] } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    
    const apiKey = crypto.randomBytes(32).toString('hex');
    API_KEYS.set(apiKey, { name, permissions });
    
    res.json({
      apiKey,
      name,
      permissions,
      message: 'API key generated successfully'
    });
  } catch (error) {
    console.error('Generate API key error:', error);
    res.status(500).json({ error: 'Failed to generate API key' });
  }
});

// Validate API key
router.get('/validate', authenticateApiKey, (req, res) => {
  res.json({
    valid: true,
    user: req.user
  });
});

// Get user info
router.get('/me', authenticateApiKey, (req, res) => {
  res.json({
    name: req.user.name,
    permissions: req.user.permissions
  });
});

module.exports = router;
