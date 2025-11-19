#!/bin/bash
# Production Deployment Script - Uses screen for backend
# Author: The Real Johnson
# Date: 2025-10-24

set -e

LOG_FILE="/tmp/handyman-deploy-$(date +%Y%m%d-%H%M%S).log"
ADMIN_EMAIL="cipherbmw@gmail.com"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[$(date +'%H:%M:%S')] WARNING:${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[$(date +'%H:%M:%S')] ERROR:${NC} $1" | tee -a "$LOG_FILE"
}

echo ""
log "🚀 Starting Full Stack Deployment..."
echo ""

# 1. KILL OLD PROCESSES
log "🔪 Step 1: Cleaning up old processes"

# Kill old screen session if exists
screen -S handyman-backend -X quit 2>/dev/null || true
log "   Killed old backend screen session"

# Kill ports (try 3 times with delays)
for i in {1..3}; do
    sudo lsof -ti:8001 | xargs sudo kill -9 2>/dev/null || true
    sudo lsof -ti:8081 | xargs sudo kill -9 2>/dev/null || true
    sudo lsof -ti:19000 | xargs sudo kill -9 2>/dev/null || true
    sleep 2
done

log "   ✅ All ports cleared"

# 2. START MONGODB
log "🗄️  Step 2: Starting MongoDB"
sudo systemctl start mongod
sudo systemctl enable mongod >/dev/null 2>&1
sleep 2

if sudo systemctl is-active --quiet mongod; then
    log "   ✅ MongoDB running"
else
    error "   MongoDB failed to start"
    exit 1
fi

# 3. START BACKEND IN SCREEN
log "🚀 Step 3: Starting Backend API in screen session"

cd /srv/handyman-app/Handyman-app-main

# Create screen session and run backend
screen -dmS handyman-backend bash -c "
    source venv/bin/activate
    PYTHONPATH=\$PWD python3 -m uvicorn backend.server:app --host 127.0.0.1 --port 8001 --reload
"

log "   Backend started in screen session 'handyman-backend'"
log "   To view backend: screen -r handyman-backend"
log "   To detach: Ctrl+A then D"

sleep 5

# 4. HEALTH CHECK
log "🏥 Step 4: Backend Health Check"

max_attempts=10
attempt=0

while [ $attempt -lt $max_attempts ]; do
    if curl -s http://127.0.0.1:8001/api/health >/dev/null 2>&1; then
        log "   ✅ Backend is healthy!"
        break
    else
        attempt=$((attempt + 1))
        if [ $attempt -eq $max_attempts ]; then
            error "   Backend failed to start after $max_attempts attempts"
            log "   Check logs: screen -r handyman-backend"
            exit 1
        fi
        log "   Waiting for backend... ($attempt/$max_attempts)"
        sleep 2
    fi
done

# 5. START FRONTEND
log "📱 Step 5: Starting Frontend"

cd /srv/handyman-app/Handyman-app-main/frontend

if [ ! -d "node_modules" ]; then
    log "   Installing dependencies..."
    npm install
fi

echo ""
log "╔═══════════════════════════════════════════════════════════╗"
log "║         ✅ DEPLOYMENT SUCCESSFUL - ALL SYSTEMS GO          ║"
log "╚═══════════════════════════════════════════════════════════╝"
echo ""
log "📊 System Status:"
log "   ✅ MongoDB: Running"
log "   ✅ Backend: Running on http://127.0.0.1:8001"
log "   🔄 Frontend: Starting..."
echo ""
log "🛠️  Useful Commands:"
log "   View backend: screen -r handyman-backend"
log "   Detach screen: Ctrl+A then D"
log "   Kill backend: screen -S handyman-backend -X quit"
log "   Backend health: curl http://127.0.0.1:8001/api/health"
echo ""
log "🚀 Starting Expo (Press Ctrl+C to stop frontend only)..."
echo ""

npx expo start --clear