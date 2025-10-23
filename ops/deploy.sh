#!/bin/bash
# deploy-handyman-backend.sh

set -e

echo "🚀 Deploying Handyman Backend..."

cd /srv/handyman-app/Handyman-app-main

# Pull latest code (optional)
# git pull --ff-only

# Activate venv (just so your terminal shows it's active)
echo "🐍 Activating virtual environment..."
source venv/bin/activate

#Loading Database
echo "Loading all these awesome customers and important businesses"
sudo systemctl start mongod
sudo systemctl enable mongod

# Restart the service (systemd handles venv automatically)
echo "🔄 Restarting service..."
sudo systemctl restart handyman-api

# Wait for startup
sleep 2

# Check status
echo "✅ Service status:"
sudo systemctl status handyman-api --no-pager

# Test health
echo "🏥 Testing health endpoint..."
curl -s http://localhost:8001/api/health | jq || curl -s http://localhost:8001/api/health

cd /srv/handyman-app/Handyman-app-main/frontend


echo "✅ Deployment complete!"
