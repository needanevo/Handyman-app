#!/bin/bash
# Full deployment script - starts EVERYTHING

set -e

echo "🚀 Full Stack Deployment Starting..."
echo ""

cd /srv/handyman-app/Handyman-app-main

# 1. Start MongoDB
echo "🗄️  Starting MongoDB..."
sudo systemctl start mongod
sudo systemctl enable mongod
sleep 2

# 2. Activate venv
echo "🐍 Activating Python virtual environment..."
source venv/bin/activate

# 3. Start Backend API
echo "🔧 Starting Backend API..."
sudo systemctl restart handyman-api
sleep 3

# 4. Health check
echo "🏥 Backend Health Check..."
curl -s http://localhost:8001/api/health | jq || echo "Backend not responding"
echo ""

# 5. Start Frontend
echo "📱 Starting Expo Frontend..."
cd frontend
echo "   Navigate to: http://localhost:8081"
echo "   Press Ctrl+C to stop"
echo ""
npx expo start

