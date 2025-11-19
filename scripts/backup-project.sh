#!/bin/bash

# Project Backup Script
# Creates compressed tar.gz backup of the entire project
# Sends email notification on failure

PROJECT_DIR="/root/Handyman-app"
BACKUP_DIR="/root/backups/handyman-app"
LOG_FILE="$PROJECT_DIR/scripts/backup.log"
NOTIFY_EMAIL="needanevo@me.com"
TIMESTAMP=$(date +'%Y%m%d_%H%M%S')
BACKUP_NAME="handyman-app_$TIMESTAMP.tar.gz"
PYTHON_BIN="$PROJECT_DIR/.venv/bin/python3"
NOTIFY_SCRIPT="$PROJECT_DIR/scripts/send_notification.py"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR" || {
    ERROR_MSG="Failed to create backup directory at $(date)"
    echo "$ERROR_MSG" | tee -a "$LOG_FILE"
    "$PYTHON_BIN" "$NOTIFY_SCRIPT" "Backup Failed: Directory Creation" "$ERROR_MSG" "$NOTIFY_EMAIL"
    exit 1
}

# Log start
echo "$(date): Starting backup process" >> "$LOG_FILE"

# Create tar.gz backup (exclude .git, node_modules, __pycache__, .venv, .metro-cache)
cd /root || exit 1
if ! tar -czf "$BACKUP_DIR/$BACKUP_NAME" \
    --exclude='Handyman-app/.git' \
    --exclude='Handyman-app/node_modules' \
    --exclude='Handyman-app/frontend/node_modules' \
    --exclude='Handyman-app/__pycache__' \
    --exclude='Handyman-app/**/__pycache__' \
    --exclude='Handyman-app/.venv' \
    --exclude='Handyman-app/frontend/.metro-cache' \
    --exclude='Handyman-app/backend/backend.log' \
    Handyman-app 2>> "$LOG_FILE"; then

    ERROR_MSG="Backup failed at $(date). Check $LOG_FILE for details."
    echo "$ERROR_MSG" | tee -a "$LOG_FILE"
    "$PYTHON_BIN" "$NOTIFY_SCRIPT" "Backup Failed: Tar Creation" "$ERROR_MSG" "$NOTIFY_EMAIL"
    exit 1
fi

# Get backup size
BACKUP_SIZE=$(du -h "$BACKUP_DIR/$BACKUP_NAME" | cut -f1)

# Log success
SUCCESS_MSG="$(date): Backup completed successfully - $BACKUP_NAME ($BACKUP_SIZE)"
echo "$SUCCESS_MSG" >> "$LOG_FILE"

# Keep only last 7 backups (delete older ones)
cd "$BACKUP_DIR" || exit 1
ls -t handyman-app_*.tar.gz | tail -n +8 | xargs -r rm --
echo "$(date): Cleaned up old backups, keeping last 7" >> "$LOG_FILE"

exit 0
