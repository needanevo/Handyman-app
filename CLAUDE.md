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

--- END OF CORE RULES ---
