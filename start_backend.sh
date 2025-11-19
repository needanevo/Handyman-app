#!/bin/bash
# Backend Server Startup Script
# The Real Johnson Handyman Services

set -e

echo "=========================================="
echo "Starting Backend Server"
echo "=========================================="

# Activate virtual environment
echo "Activating virtual environment..."
source /root/Handyman-app/venv/bin/activate

# Check if providers.env exists
if [ ! -f "/root/Handyman-app/backend/providers/providers.env" ]; then
    echo "ERROR: providers.env not found!"
    exit 1
fi

# Start the server
echo "Starting uvicorn server on port 8001..."
echo "Server will be accessible at http://0.0.0.0:8001"
echo ""
echo "API Documentation: http://0.0.0.0:8001/docs"
echo "Health Check: http://0.0.0.0:8001/api/health"
echo ""
echo "Press Ctrl+C to stop the server"
echo "=========================================="

cd /root/Handyman-app
uvicorn backend.server:app --host 0.0.0.0 --port 8001 --reload
