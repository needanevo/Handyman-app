#!/bin/bash
cd /srv/handyman-app/Handyman-app-main
source venv/bin/activate
uvicorn backend.server:app --host 0.0.0.0 --port 8001
