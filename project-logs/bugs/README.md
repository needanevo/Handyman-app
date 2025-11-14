# Bug Tracking System - Usage Guide

## Overview

This directory contains XML-based bug tracking for The Real Johnson Handyman App project. Each bug is documented with complete details including root cause analysis, resolution, and lessons learned.

## File Structure

```
project-logs/
├── bug-tracker-template.xml    # Template for the XML structure
└── bugs/
    ├── README.md               # This file
    ├── 2025-11-linode-storage.xml    # Example: Linode photo upload bug
    └── YYYY-MM-bug-name.xml    # Additional bugs as discovered
```

## How to Document a New Bug

### 1. Create New XML File

Copy the template and create a new file:
```bash
cp ../bug-tracker-template.xml bugs/YYYY-MM-bug-name.xml
```

### 2. Fill in Bug Details

Open the file and replace template values with actual bug information:

**Required Fields:**
- `bug-id`: Unique identifier (format: BUG-YYYY-NNN)
- `date-discovered`: When the bug was first identified
- `severity`: CRITICAL, HIGH, MEDIUM, or LOW
- `category`: BACKEND, FRONTEND, DEPLOYMENT, etc.
- `status`: Current state of the bug
- `title`: Brief one-line description
- `description`: Detailed problem description

**Recommended Fields:**
- `affected-files`: List of files that need changes
- `error-messages`: Exact error text for future reference
- `root-cause`: Analysis of why the bug occurred
- `resolution`: How it was fixed
- `tokens-used`: AI token cost (for tracking efficiency)
- `lessons-learned`: Insights gained
- `prevention-strategy`: How to avoid similar bugs

**Optional Fields:**
- `reproduction-steps`: How to reproduce the bug
- `related-bugs`: Links to similar issues
- `tags`: Keywords for searching

### 3. Update Status

As you work on the bug, update these fields:
- Change `status` from OPEN → IN_PROGRESS → RESOLVED → CLOSED
- Add `date-resolved` when fixed
- Fill in `resolution` with fix details
- Add `resolution-commit` with the git commit hash

## Severity Levels

**CRITICAL**: System down, data loss, security breach
- Examples: Database corruption, authentication bypass, server crash
- Response: Immediate attention required

**HIGH**: Major feature broken, significant user impact
- Examples: Photo uploads failing, payments not processing
- Response: Fix within 24 hours

**MEDIUM**: Feature partially working, workaround available
- Examples: UI layout issues, minor API errors
- Response: Fix within 1 week

**LOW**: Cosmetic issues, edge cases
- Examples: Typos, color inconsistencies
- Response: Fix when convenient

## Bug Categories

- **BACKEND**: FastAPI, database, API endpoints
- **FRONTEND**: React Native, Expo, UI components
- **DEPLOYMENT**: Server configuration, systemd, nginx
- **INTEGRATION**: External services (Linode, SendGrid, etc.)
- **DATABASE**: MongoDB schema, queries, indexes
- **STORAGE**: Photo storage, file uploads
- **AUTHENTICATION**: JWT, login, registration
- **PAYMENTS**: Stripe integration

## Token Usage Tracking

Track approximate tokens spent on each bug to identify:
- Which types of bugs are most expensive to debug
- Patterns in token usage (environment issues vs code bugs)
- Opportunities for optimization

### Token Ranges:
- **< 5,000**: Quick fix, clear error message
- **5,000 - 15,000**: Moderate debugging, some investigation
- **15,000 - 30,000**: Extensive debugging, multiple approaches
- **30,000+**: Major investigation, compatibility issues, deep dives

## Lessons Learned

Always fill in the `lessons-learned` and `prevention-strategy` fields. These become your knowledge base for:
- Training future developers
- Preventing duplicate effort
- Improving development processes
- Token optimization strategies

### Example Lessons:
- "Check environment variable format before debugging code"
- "Test with S3-compatible services before deploying"
- "Always verify MongoDB connection string format"
- "Use provider pattern to isolate third-party dependencies"

## Searching Bugs

### By Severity:
```bash
grep -r "CRITICAL" bugs/*.xml
```

### By Category:
```bash
grep -r "BACKEND" bugs/*.xml
```

### By Date Range:
```bash
ls bugs/2025-11-*.xml
```

### By Keyword:
```bash
grep -r "linode" bugs/*.xml
```

## Status Workflow

```
OPEN → IN_PROGRESS → RESOLVED → CLOSED
                         ↓
                     WONTFIX
```

- **OPEN**: Bug reported, not yet started
- **IN_PROGRESS**: Actively debugging/fixing
- **RESOLVED**: Fix implemented, waiting for verification
- **CLOSED**: Fix verified and deployed
- **WONTFIX**: Bug acknowledged but not fixing (document reason)

## Best Practices

1. **Document Early**: Create bug file as soon as issue is discovered
2. **Update Continuously**: Keep status current during debugging
3. **Be Specific**: Include exact error messages and file paths
4. **Link Commits**: Always reference the fixing commit
5. **Extract Lessons**: Don't skip the lessons-learned section
6. **Track Tokens**: Estimate token usage for efficiency analysis

## Example Bug Entry

See `bugs/2025-11-linode-storage.xml` for a complete example of a well-documented bug including:
- Detailed problem description
- Multiple error messages at different stages
- Root cause analysis
- Complete resolution steps
- Token usage tracking
- Actionable lessons learned

## Integration with Development

### When Creating a Commit:
Reference the bug ID in commit messages:
```
fix: resolve Linode boto3 checksum issue (BUG-2025-001)
```

### When Updating CLAUDE.md:
Add a reference to the bug file for future context:
```markdown
See project-logs/bugs/2025-11-linode-storage.xml for complete details.
```

### When Planning Sprints:
Review OPEN bugs by severity to prioritize work.

---

**Last Updated**: 2025-11-11
**Total Bugs Tracked**: See bugs/ directory
**System Version**: 1.0
