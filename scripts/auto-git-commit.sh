#!/bin/bash

# Auto Git Commit and Push Script
# Commits tracked files and pushes to remote
# Sends email notification on failure

PROJECT_DIR="/root/Handyman-app"
LOG_FILE="$PROJECT_DIR/scripts/git-auto.log"
NOTIFY_EMAIL="needanevo@me.com"
BRANCH="dev"
PYTHON_BIN="$PROJECT_DIR/.venv/bin/python3"
NOTIFY_SCRIPT="$PROJECT_DIR/scripts/send_notification.py"

# Change to project directory
cd "$PROJECT_DIR" || {
    echo "$(date): Failed to change to project directory" | tee -a "$LOG_FILE"
    "$PYTHON_BIN" "$NOTIFY_SCRIPT" "Git Auto-Commit Failed" "Failed to change to $PROJECT_DIR" "$NOTIFY_EMAIL"
    exit 1
}

# Log start
echo "$(date): Starting auto-commit process" >> "$LOG_FILE"

# Check if there are any changes to tracked files
if git diff --quiet && git diff --cached --quiet; then
    echo "$(date): No changes to commit" >> "$LOG_FILE"
    exit 0
fi

# Add only tracked files that have been modified
git add -u >> "$LOG_FILE" 2>&1

# Check if there's anything to commit
if git diff --cached --quiet; then
    echo "$(date): No tracked files to commit" >> "$LOG_FILE"
    exit 0
fi

# Commit with timestamp
COMMIT_MSG="Auto-commit: $(date +'%Y-%m-%d %H:%M:%S')"
if ! git commit -m "$COMMIT_MSG" >> "$LOG_FILE" 2>&1; then
    ERROR_MSG="Git commit failed at $(date)"
    echo "$ERROR_MSG" >> "$LOG_FILE"
    "$PYTHON_BIN" "$NOTIFY_SCRIPT" "Git Auto-Commit Failed" "$ERROR_MSG" "$NOTIFY_EMAIL"
    exit 1
fi

# Push to remote
if ! git push origin "$BRANCH" >> "$LOG_FILE" 2>&1; then
    ERROR_MSG="Git push failed at $(date). Commit was successful but not pushed."
    echo "$ERROR_MSG" >> "$LOG_FILE"
    "$PYTHON_BIN" "$NOTIFY_SCRIPT" "Git Auto-Push Failed" "$ERROR_MSG" "$NOTIFY_EMAIL"
    exit 1
fi

echo "$(date): Auto-commit and push completed successfully" >> "$LOG_FILE"
exit 0
