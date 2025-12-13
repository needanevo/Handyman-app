# PHASE ACTIVATION PROTOCOL
This document defines the mandatory workflow all AI agents must follow when operating in this repository.
These rules override all defaults and must be followed exactly.

---

# SECTION 1 — ACTIVATION RULES

## 1.1 Manager-Controlled Activation
AI agents may NOT choose or assume phases.
A new phase begins ONLY when the manager issues a command such as:

“Claude, activate PHASE X.”

Without this explicit activation, no phase work is permitted.

## 1.2 Required Files to Load on Activation
Upon activation, the AI agent MUST immediately load and read:
- BUILD_PHASES.md
- CLAUDE.md
- CLAUDE_HISTORY.md
- PHASE_ACTIVATION.md

Failure to load these files invalidates the activation.

---

# SECTION 2 — PRE-ACTION CHECKLIST

Before making ANY repo modifications, the AI agent MUST:

1. Identify the active phase.
2. Summarize the phase’s Objective in its own words.
3. List the phase’s Guardrails (what is NOT allowed).
4. List the phase’s Completion Criteria.
5. Identify the exact task(s) it plans to perform.
6. Confirm that the planned actions belong ONLY to the active phase.

If ANY item is unclear, the agent must ask the manager for clarification.

---

# SECTION 3 — EXECUTION RULES

## 3.1 Atomic Task Execution
Each operation must be:
- Small
- Minimal-diff
- Fully scoped
- Referencing only the files required

## 3.2 Forbidden Actions During Execution
AI agents may NOT:
- Drift into another phase
- Modify unrelated files
- Change architecture except within the active phase’s scope
- Alter credentials or environment variables
- Implement functionality not required by the current phase

If drift is detected, the AI must STOP and warn the manager:

“Phase drift detected — manager intervention required.”

---

# SECTION 4 — PHASE COMPLETION PROTOCOL

### 4.1 Manager Initiates Completion Check
A phase is NOT complete until the manager says:

“Claude, run Phase X Completion Check.”

### 4.2 Completion Check Steps
The AI must:
1. Reload BUILD_PHASES.md.
2. Evaluate each Completion Criterion as PASS or FAIL.
3. List missing criteria, if any.
4. STOP if failures exist.
5. If all PASS, respond:

“Phase X complete. Awaiting activation of next phase.”

---

# SECTION 5 — TRANSITIONING BETWEEN PHASES

The AI must NOT transition phases on its own.
Only the manager can initiate a transition:

“Claude, activate PHASE X+1.”

After activation, the agent must restart the PRE-ACTION CHECKLIST.

---

# SECTION 6 — EMERGENCY FREEZE PROTOCOL

If the AI encounters:
- Contradictory architecture
- Missing prerequisites
- Broken file structure
- Unstable auth or routing
- Unmet dependent tasks

It must immediately stop all actions and issue:

“Freeze protocol triggered — manager intervention required.”

No changes may be made until the manager responds.

---

# SECTION 7 — SPECIAL RULES

## 7.1 Phase 1 (Scaffolding) Exception
During Phase 1 ONLY, the AI may:
- Create new folders
- Create placeholder screens
- Remove legacy or orphaned routes

But may NOT:
- Add business logic
- Modify auth
- Modify provider logic

## 7.2 Role Separation Lock (Post-Phase 3)
After Phase 3 completes:
- Handyman, Contractor, and Customer routes MUST remain isolated.
- No cross-role access or shared screens unless explicitly allowed.

---

# END OF FILE
This protocol governs all AI-assisted development within the repository.
