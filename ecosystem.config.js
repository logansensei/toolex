module.exports = {
  apps: [{
    name: 'recon-tool',
    script: 'server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 5000,
      MONGODB_URI: 'mongodb://localhost:27017/recon-tool',
      JWT_SECRET: 'your-super-secret-jwt-key-change-this-in-production'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000,
      MONGODB_URI: 'mongodb://localhost:27017/recon-tool',
      JWT_SECRET: 'your-super-secret-jwt-key-change-this-in-production'
    }
  }]
};
