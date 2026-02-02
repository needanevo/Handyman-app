# CONTRIBUTING.md (AI-Optimized)

This project uses AI agents (Claude CLI, ChatGPT Manager) as active contributors.
The following rules apply to ALL AI-generated changes.

## 1. Always load these files before working:
- BUILD_PHASES.md
- CLAUDE.md
- CLAUDE_HISTORY.md

## 2. Determine your current PHASE before making ANY changes.
Never perform tasks from a higher-numbered phase unless explicitly instructed.

## 3. All commits must:
- Be scoped to ONE task.
- Include a descriptive commit message referencing phase + task.
- Never introduce unrelated changes.

## 4. Never modify:
- App credentials
- Environment files
- Legal or financial calculations
- Database migrations
… unless explicitly instructed.

## 5. When unsure:
Stop and request clarification instead of assuming.

## 6. If multiple approaches exist:
Describe the tradeoffs and wait for direction.

## 7. When creating files:
Prefer placeholders over fully implemented logic unless the task demands it.

## 8. When editing:
Prefer minimal diff patches that respect existing structure.
