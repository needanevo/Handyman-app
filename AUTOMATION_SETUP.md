# Automation Setup Summary

## Overview
Automated git commit/push and backup system with email notifications via SendGrid.

## What Was Set Up

### 1. Git Automation (`scripts/auto-git-commit.sh`)
- **Schedule**: Every day at 10:00 PM
- **Actions**:
  - Commits tracked files that have been modified (`git add -u`)
  - Pushes to `dev` branch on GitHub
  - Sends email notification on failures
- **Logs**: `/root/Handyman-app/scripts/git-auto.log`

### 2. Backup System (`scripts/backup-project.sh`)
- **Schedule**: Every day at 10:05 PM
- **Actions**:
  - Creates compressed tar.gz backup of entire project
  - Excludes: `.git`, `node_modules`, `__pycache__`, `.venv`, `.metro-cache`, `backend.log`
  - Keeps last 7 backups (auto-deletes older ones)
  - Sends email notification on failures
- **Backup Location**: `/root/backups/handyman-app/`
- **Backup Size**: ~127MB per backup
- **Logs**: `/root/Handyman-app/scripts/backup.log`

### 3. Email Notifications (`scripts/send_notification.py`)
- **Provider**: SendGrid
- **Recipient**: needanevo@me.com
- **Triggers**: Script failures (git commit/push errors, backup failures)
- **Configuration**: Uses existing SendGrid setup from `backend/providers/providers.env`

### 4. Cron Schedule
```
0 22 * * * /root/Handyman-app/scripts/auto-git-commit.sh
5 22 * * * /root/Handyman-app/scripts/backup-project.sh
```

## Test Results
- **Email Notifications**: ✓ Working (test email sent successfully)
- **Backup Script**: ✓ Working (127MB backup created at `/root/backups/handyman-app/`)
- **Git Automation**: ✓ Working (committed 3 files, pushed to origin/dev successfully)
- **Cron Service**: ✓ Active

## Manual Testing

### Test Git Automation
```bash
/root/Handyman-app/scripts/auto-git-commit.sh
```

### Test Backup
```bash
/root/Handyman-app/scripts/backup-project.sh
```

### Test Email Notification
```bash
source /root/Handyman-app/.venv/bin/activate
python3 /root/Handyman-app/scripts/send_notification.py "Test" "Message" "your-email@example.com"
```

## View Logs

### Git Automation Log
```bash
tail -f /root/Handyman-app/scripts/git-auto.log
```

### Backup Log
```bash
tail -f /root/Handyman-app/scripts/backup.log
```

### Cron Log
```bash
tail -f /root/Handyman-app/scripts/cron.log
```

### View Crontab
```bash
crontab -l
```

## Modify Schedule

To change the 10PM schedule:
```bash
crontab -e
```

Cron time format: `minute hour day month weekday`
- Example: `0 22 * * *` = 10:00 PM daily
- Example: `30 14 * * 1-5` = 2:30 PM Monday-Friday

## Important Notes

1. **Git Behavior**: Only commits **tracked files** that have been modified (uses `git add -u`)
   - Untracked files are ignored
   - This is intentional to avoid accidentally committing sensitive files

2. **Branch**: Currently set to push to `dev` branch
   - To change: Edit `BRANCH="dev"` in `auto-git-commit.sh`

3. **Email Setup**: Uses existing SendGrid credentials from backend
   - No additional email configuration needed
   - Falls back to ADMIN_EMAIL if target email not specified

4. **Backup Retention**: Keeps last 7 backups automatically
   - Older backups are deleted to save disk space
   - Adjust in `backup-project.sh` line: `tail -n +8` (change 8 to N+1 for N backups)

5. **Network Requirements**: Both scripts require:
   - Git: Internet connection to push to GitHub
   - Backup: No network required (local storage)
   - Notifications: Internet connection for SendGrid API

## Troubleshooting

### If cron jobs don't run:
```bash
# Check cron service
systemctl status cron

# Restart cron service
systemctl restart cron

# Check cron logs
grep CRON /var/log/syslog
```

### If email notifications fail:
- Check SendGrid API key in `backend/providers/providers.env`
- Verify API key is not expired
- Check `scripts/git-auto.log` or `scripts/backup.log` for error details

### If git push fails:
- Check GitHub authentication (may need to update credentials)
- Verify internet connection
- Check if repository exists and you have push access
- Review `scripts/git-auto.log` for error details

### If backups fail:
- Check available disk space: `df -h /root/backups`
- Verify backup directory permissions
- Review `scripts/backup.log` for error details
