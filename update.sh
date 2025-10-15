#!/bin/bash
# --- Handyman App Auto Update Script ---

echo "🧩 Pulling latest code from GitHub..."
git pull origin main

echo "📦 Updating backend dependencies..."
cd backend
pip install -r requirements.txt --quiet
cd ..

echo "⚙️ Updating frontend dependencies..."
cd frontend
npm install --silent
cd ..

#Stop any old process
pkill -f "python3 backend/server.py" 2>/dev/null || true

# Start backend fresh
nohup python3 backend/server.py > /srv/handyman-app/Handyman-app-main/backend/backend.log 2>&1 &

sleep 2
if pgrep -f "python3 backend/server.py" >/dev/null; then
  echo "✅ Backend is now running!"
else
  echo "❌ Backend failed to start. Check backend/backend.log for details."
fi

