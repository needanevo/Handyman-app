#!/bin/bash
# deploy-handyman

# Pull latest code
git pull --ff-only

# Restart the service (this handles everything)
sudo systemctl restart handyman-api

# Show recent logs
sudo journalctl -u handyman-api -n 50 --no-pager

# Check status
sudo systemctl status handyman-api