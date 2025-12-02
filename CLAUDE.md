# CLAUDE_CORE.md
Core rules for Claude Code when operating in this repository.

## 1. Behavior Rules
- You ONLY write code when the Manager instructs you explicitly.
- You NEVER invent files, endpoints, routes, or features.
- You DO NOT modify files outside the scope of the Manager task.
- You MUST keep changes small, isolated, and incremental.
- You MUST update CLAUDE_HISTORY.md after each fix.

## 2. Branching Rules
- Every new phase → new branch:
  git checkout main
  git pull
  git checkout -b feature/phase<N>-<name>
- Never mix phase work.
- Never merge unless Manager says:
  “Claude — merge Phase <N> into main”

## 3. Commit Rules
Each commit MUST be:
- Single-purpose
- Under 200 changed lines
- With a message in this format:
  [YYYY-MM-DD HH:MM] <Fix/Feat> — <summary>

## 4. Allowed Actions
Claude may:
- Modify frontend files
- Modify backend files
- Create new files ONLY if Manager says
- Update documentation in CLAUDE_HISTORY.md

## 5. Forbidden Actions
Claude may NOT:
- Invent API endpoints
- Invent models
- Invent routes not in file tree
- Change authentication logic
- Change provider architecture
- Touch deployment unless instructed
- Write test automation unless instructed

## 6. Task Execution Format
Every task MUST follow this pattern:
1. Read Manager instruction
2. Make required code changes ONLY
3. Update CLAUDE_HISTORY.md (append entry)
4. Return:
   "Manager: <Fix Name> applied. Ready for next fix."

## 7. Phase 5 Endpoint Testing Protocol
Claude never starts Phase 5 by himself.
Only responds to issue batch files produced by:
automation/generate_issues.py

Fix rules:
- Fix ONLY endpoints in the issues list
- One commit per issue
- Update CLAUDE_HISTORY.md after each fix

## 8. File Boundaries
Frontend:
  /frontend/app/**
  /frontend/src/**

Backend:
  /backend/**
  /ops/**
  
Documentation:
  /CLAUDE_CORE.md (current file)
  /CLAUDE_HISTORY.md (append-only log)

No writing outside these boundaries.

## 9. Output Requirements
Claude must:
- NEVER output full files unless asked
- NEVER output placeholder code
- NEVER output TODOs
- NEVER output commented-out blocks
- ALWAYS produce functional, working code

## 10. Phase 5 Fix 6: Role-Based UI Isolation Rules
Completed: 2025-12-02

MANDATORY UI ISOLATION:
- All UI rendering MUST be role-based, NEVER field-based
- Customer screens show ONLY customer features
- Contractor/handyman screens show ONLY business features
- No mixed-role components allowed

Customer UI (customer role only):
- Job requests, active jobs, completed jobs
- Warranties
- Addresses
- Profile (name, email, phone only)
- NO: earnings, payouts, expenses, mileage, growth center, business metrics

Contractor/Handyman UI (technician/handyman roles only):
- Available jobs, accepted jobs, scheduled jobs
- Earnings, payouts, expenses
- Mileage tracking, tax reports
- Growth Center
- Business profile (skills, documents, portfolio)
- NO: customer job requests, warranties, consumer service categories

Role Guards (MANDATORY):
- Every screen MUST check user.role, NOT field presence
- Layout guards at (customer)/_layout, (contractor)/_layout, (handyman)/_layout
- Redirect to correct dashboard if role mismatch
- No UI should render based on "if field exists"

Routing Rules:
- login → explicit routing for customer/technician/handyman/admin
- index → role-based dashboard routing
- home → customer-only page with role guard
- All role routing MUST be explicit, no fallback assumptions

--- END OF CORE RULES ---
