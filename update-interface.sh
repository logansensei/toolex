#!/bin/bash

# Quick update script to deploy the new web interface

echo "🔄 Updating Security Recon Tool with Web Interface..."

# Stop PM2 process
pm2 stop recon-tool

# Replace the server file
cp updated-server.js simple-server.js

# Start PM2 process
pm2 start recon-tool

echo "✅ Web interface updated successfully!"
echo "🌐 Access your tool at: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):5000"
echo "📊 Check status: pm2 status"
