#!/bin/bash
# SSH deployment script for Windows/Git Bash

HOST="172.234.70.157"
USER="root"
PASS='$1Jennifer$1Joshua'

# Function to execute remote command
ssh_exec() {
    ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "$USER@$HOST" "$@"
}

echo "=== Step 1: Testing SSH Connection ==="
ssh_exec "echo 'SSH connection successful' && hostname && pwd"

if [ $? -ne 0 ]; then
    echo "ERROR: SSH connection failed"
    exit 1
fi

echo -e "\n=== Step 2: Checking Existing Setup ==="
ssh_exec "
    if [ -d '/srv/handyman-app/Handyman-app-main' ]; then
        echo 'Repository directory exists'
        cd /srv/handyman-app/Handyman-app-main
        echo 'Current directory:' \$(pwd)
        echo 'Git status:'
        git status
        echo 'Git branch:'
        git branch -a | grep '*'
    else
        echo 'Repository directory does not exist'
    fi
"

echo -e "\n=== Step 3: Clone or Update Repository ==="
ssh_exec "
    if [ ! -d '/srv/handyman-app' ]; then
        echo 'Creating /srv/handyman-app directory...'
        mkdir -p /srv/handyman-app
    fi

    cd /srv/handyman-app

    if [ ! -d 'Handyman-app-main' ]; then
        echo 'Cloning repository...'
        git clone https://github.com/needanevo/Handyman-app.git Handyman-app-main
        cd Handyman-app-main
        git checkout merged
    else
        echo 'Updating repository...'
        cd Handyman-app-main
        git fetch origin
        git checkout merged
        git pull origin merged
    fi

    echo 'Current commit:'
    git log -1 --oneline
"

echo -e "\n=== Step 4: Python Environment Setup ==="
ssh_exec "
    cd /srv/handyman-app/Handyman-app-main

    echo 'Python version:'
    python3 --version

    if [ ! -d 'venv' ]; then
        echo 'Creating virtual environment...'
        python3 -m venv venv
    else
        echo 'Virtual environment exists'
    fi

    echo 'Installing/updating dependencies...'
    source venv/bin/activate
    pip install --upgrade pip
    pip install -r backend/requirements.txt
    echo 'Dependencies installed'
"

echo -e "\n=== Step 5: MongoDB Status ==="
ssh_exec "
    echo 'Checking MongoDB status...'
    systemctl status mongod --no-pager | head -20

    if ! systemctl is-active --quiet mongod; then
        echo 'Starting MongoDB...'
        systemctl start mongod
        systemctl enable mongod
        sleep 2
        systemctl status mongod --no-pager | head -10
    fi
"

echo -e "\n=== Step 6: Systemd Service Setup ==="
ssh_exec "
    if [ ! -f '/etc/systemd/system/handyman-api.service' ]; then
        echo 'Copying systemd service file...'
        if [ -f '/srv/handyman-app/Handyman-app-main/ops/systemd/handyman-api.service' ]; then
            cp /srv/handyman-app/Handyman-app-main/ops/systemd/handyman-api.service /etc/systemd/system/
            echo 'Service file copied'
        else
            echo 'ERROR: Service file not found in ops/systemd/'
        fi
    else
        echo 'Systemd service file exists'
    fi

    echo 'Reloading systemd daemon...'
    systemctl daemon-reload

    echo 'Restarting handyman-api service...'
    systemctl restart handyman-api

    echo 'Waiting 5 seconds for startup...'
    sleep 5
"

echo -e "\n=== Step 7: Deployment Verification ==="
ssh_exec "
    echo 'Service status:'
    systemctl status handyman-api --no-pager | head -20

    echo -e '\nTesting health endpoint...'
    curl -s http://localhost:8001/api/health || echo 'Health check failed'

    echo -e '\nRecent logs:'
    journalctl -u handyman-api -n 30 --no-pager

    echo -e '\nChecking providers.env...'
    if [ -f '/srv/handyman-app/Handyman-app-main/backend/providers/providers.env' ]; then
        echo 'providers.env exists'
    else
        echo 'WARNING: providers.env not found - needs to be configured'
    fi
"

echo -e "\n=== Deployment Complete ==="
