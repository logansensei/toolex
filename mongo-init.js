// MongoDB initialization script
db = db.getSiblingDB('recon-tool');

// Create collections
db.createCollection('scanresults');
db.createCollection('users');
db.createCollection('settings');

// Create indexes for better performance
db.scanresults.createIndex({ "targetUrl": 1, "createdAt": -1 });
db.scanresults.createIndex({ "scanId": 1 }, { unique: true });
db.scanresults.createIndex({ "status": 1 });
db.scanresults.createIndex({ "startTime": -1 });

db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "apiKey": 1 }, { unique: true, sparse: true });

// Create default admin user
db.users.insertOne({
  email: 'admin@recon-tool.com',
  password: '$2b$10$rQZ8K9vX8K9vX8K9vX8K9e', // Change this password
  role: 'admin',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
});

// Create default settings
db.settings.insertOne({
  key: 'system',
  value: {
    siteName: 'Security Recon Tool',
    siteDescription: 'Advanced web security reconnaissance platform',
    timezone: 'UTC',
    language: 'en',
    maintenanceMode: false,
    registrationEnabled: true,
    maxScansPerUser: 100,
    scanTimeout: 300000,
    maxConcurrentScans: 5
  },
  createdAt: new Date(),
  updatedAt: new Date()
});

print('Database initialized successfully');
