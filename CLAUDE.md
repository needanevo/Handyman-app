# CLAUDE_CORE.md
Minimal rules for Claude Code in this repo.

## 1. Operating Mode

- You are a **worker**. The Manager is the **authority**.
- You only act on:
  - Explicit Manager instructions
  - Real files on disk in this repo
- Never assume prior chat = current code. Always reopen files from disk before editing.

Repo root (Windows):
`C:\Users\Joshua\Desktop\TheRealJohnson.com\Handyman-app-main`

## 2. Scope Boundaries

You may edit only:

- Frontend:  
  - `frontend/app/**`  
  - `frontend/src/**`

- Backend:  
  - `backend/**`  
  - `ops/**`

- Docs:  
  - `CLAUDE_CORE.md`  
  - `CLAUDE_HISTORY.md`

Do NOT touch anything else unless the Manager explicitly names the file/path.

## 3. Git Rules (Non-Negotiable)

Every meaningful task ends with:

1. `git status` (confirm what changed)
2. `git add <only the files you actually touched>`
3. `git commit -m "[YYYY-MM-DD HH:MM] <Fix/Feat> — <summary>"`
4. `git push origin dev`

You MUST:

- Always work on branch `dev` unless Manager says otherwise.
- Never leave completed work uncommitted or unpushed.
- Never create or switch branches unless Manager spells out the command.

### Forbidden Git Commands (unless Manager writes them verbatim)

Do NOT run any of these without explicit instruction:

- `git reset`, `git reset --hard`
- `git rebase`
- `git stash`, `git stash pop`
- `git merge --ours`, `git merge --theirs`
- `git clean`
- Any `rm -rf` on the repo

If you see merge conflicts, **stop** and say:
> “Manager: merge conflict in <file>. Tell me how to resolve it.”

## 4. Change Rules

When given a task:

1. Read the instruction once, slowly.
2. Open only the necessary files.
3. Make the smallest change that solves the task.
4. Run any relevant checks/commands the Manager specified.
5. Update `CLAUDE_HISTORY.md` with:
   - Date/time
   - Short fix name
   - Files touched
   - Commit hash on `dev`
6. Report back: what you changed + where.

You MUST NOT:

- Invent API endpoints, models, routes, or providers unless the Manager explicitly asks for them.
- Refactor unrelated code.
- “Improve” architecture without being told to.

## 5. Real Files Only (No Virtual Work)

- All edits must hit actual files on disk in this repo.
- Never claim a fix is “done” unless:
  - The file was opened from disk,
  - The changes are saved,
  - `git diff` would show the change.

You MUST NOT:

- Pretend to apply patches in a “virtual” environment.
- Describe work as completed if it was not written into real files.

## 6. Phase & Task Discipline

- A “fix” or “phase task” = one logical unit of work.
- One commit per logical task, under ~200 changed lines when possible.
- If a task grows too large, tell the Manager and propose a split.

### Role / UI Rules (Phase 5–6)

- UI is **role-based**, not field-based.
- Customer screens: only customer features.
- Contractor/handyman screens: only business features.
- Layout guards must enforce roles for:
  - `(customer)/_layout.tsx`
  - `(contractor)/_layout.tsx`
- Redirect on role mismatch instead of rendering wrong UI.

Do not add new roles, dashboards, or flows without explicit instruction.

## 7. Auth & Backend Safety

- Do not change auth flows, tokens, or security logic unless the task says so.
- Do not create or remove collections, indexes, or major models unless ordered.
- When adding endpoints, follow existing patterns:
  - Use existing db access style.
  - Strip `_id` before returning.
  - Use proper `HTTPException` statuses.

If anything looks destructive or ambiguous, stop and ask.

## 8. Output Rules

When responding after a task:

- Be concise.
- Include:
  - Files edited
  - Short description per file
  - Any commands run
  - Result (tests passed / manual check done)
- Only show full file contents if the Manager asks for them.

## 9. History Log

For every completed fix or feature:

- Append a new entry to `CLAUDE_HISTORY.md`:
  - `[YYYY-MM-DD HH:MM] <Fix/Feat Name>`
  - Bullet list of files changed
  - Commit hash (from `git log -1 --oneline`)
  - One short paragraph of what changed

`CLAUDE_HISTORY.md` is **append-only**. Do not rewrite old entries.
## 10. Backend Runtime & Server Rules

   - All backend runtime and integration testing is done **on the server**, not on the Manager’s local machine.
   - The canonical backend environment is the remote server at `172.234.70.157` behind Nginx/PM2.
   - You MUST treat the server backend as the source of truth for all feature work and manual testing.

   You MUST NOT:
   - Tell the Manager to run `uvicorn`, `fastapi`, or any backend server locally on Windows unless the Manager explicitly orders it.
   - Tell the Manager to change `EXPO_PUBLIC_API_BASE_URL` (or any frontend API base URL) to `localhost` or a local port unless the Manager explicitly orders it.
   - Assume a local venv/bin layout (Linux/macOS) on the Manager’s machine. On Windows, do not give any Python/venv activation or `uvicorn` commands unless the Manager explicitly asks for them.

   Backend change & deploy rules:
   - All backend code edits still happen in this repo under `backend/**` as usual.
   - After completing backend changes:
     - Commit and push to `dev` per the Git Rules section.
     - If and only if the Manager explicitly instructs, ssh into `root@172.234.70.157` using the existing SSH key and run the **exact deploy or restart commands the Manager provides** (for example: `cd /srv/app && ./deploy_dev.sh` or a specific `pm2` reload).
   - You MUST NOT reboot the server on your own initiative.
     - Never run `reboot`, `shutdown`, or equivalent.
     - Never stop or restart services unless the Manager gives the exact command.

   Ambiguity rule:
   - If there is any uncertainty about whether to use local vs server backend, you MUST assume:
     - Backend = server at `172.234.70.157`
     - Frontend = talks to that server
   - If a change would require altering this assumption, stop and ask the Manager.
# BUILD PHASE REFERENCE

Before performing ANY architectural work, ALWAYS load and reference BUILD_PHASES.md.

PHASE DEFINITIONS:
- The 12 phases defined in BUILD_PHASES.md are the ONLY official macro phases.
- Routing audit phases (0–4) were temporary debugging phases and MUST NOT override the macro 12-phase structure.
- Do not confuse macro phases with tasks, PRs, commits, or debugging steps.

EXECUTION RULES:
- Always determine which phase your task belongs to BEFORE editing files.
- Never perform tasks from a higher phase if earlier phases are not complete.
- When restructuring folders or routes, stay strictly within Phase 1 unless explicitly instructed otherwise.
- When authentication or role logic is involved, reference Phase 2.
- When routing or layout guards are involved, reference Phase 3.

MISSION ANCHOR:
Your job is to execute tasks *within the active phase* using the repo’s current file structure, with BUILD_PHASES.md as your authoritative blueprint.


---

This file is the contract.  
If a Manager instruction conflicts with this file, follow the Manager and log what you did.
