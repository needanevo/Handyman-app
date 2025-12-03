# MANAGER CORE — MASTER OPERATIONS FILE
This file defines the Manager’s responsibilities, the development chain of command, active project state, and daily synchronization procedures.  
This file is maintained by the Manager (ChatGPT).  
The Entrepreneur does not edit this file, only directs the Manager.  
Claude executes based on this file.

---

# 1. CHAIN OF COMMAND
## Entrepreneur (Joshua)
- Defines vision and outcomes.
- Chooses priorities.
- Approves direction and architecture.
- Provides high-level objectives.

## Manager (ChatGPT)
- Translates Entrepreneur vision into actionable development instructions.
- Maintains UI → UX → Data → Implementation pipeline.
- Writes all specs, flowcharts, CSV test sheets, and .md technical planning.
- Maintains daily progress synchronization.
- Ensures Claude stays inside boundaries.
- Prevents divergence, duplication, or lost context.
- Holds the master files and progress logs.
- Hands Claude exact instructions with no ambiguity.

## Technician (Claude)
- Executes code.
- Follows instructions exactly.
- Builds backend + frontend according to Manager specs.
- Fixes issues generated through CSV automation.
- Never makes architecture decisions.
- Never skips steps.

---

# 2. ACTIVE PROJECT: HANDYMAN APP
- Platform: Full-stack (FastAPI + MongoDB + React Native/Web)
- Status: Phase 5 backend completed
- Next major work: Frontend admin dashboard + QA automation + deployment readiness

---

# 3. CURRENT COMPLETED WORK (through today)
## Phase 5 Backend Systems
- Warranty system (4 endpoints)
- Change order system (4 endpoints)
- Provider integration layer completed with 3 provider stubs
- Provider gate / kill switch
- Dead code deletion (4 obsolete screens)
- Admin endpoints (users, jobs, stats, provider gate)
- All 33 contractor endpoints verified and validated

## Test Automation System
- New automation folder at:
  C:\Users\Joshua\Desktop\TheRealJohnson.com\Handyman-app-main\automation

- CSV-driven testing workflow:
  - ChatGPT generates CSV test suite
  - Excel used to evaluate PASS/FAIL + notes
  - generate_issues.py converts CSV → Issue list → fed to Claude

This is now the required QA pipeline.

---

# 4. MANAGER DEVELOPMENT PIPELINE (MANDATORY)
Claude must only write code when Manager gives clear instruction.

### Step 1 — UI
Manager defines:
- Screens
- Layouts
- Components
- Widgets

### Step 2 — UX
Manager defines:
- Flows
- Button behaviors
- Edge cases
- Admin control logic

### Step 3 — Data Contracts
Manager defines:
- Expected request bodies
- Expected responses
- Mappings to backend

### Step 4 — Implementation (Claude executes)
Claude writes:
- Code for pages
- Code for components
- API integrations
- Files with correct paths
- No unauthorized placeholders

Manager verifies — THEN next feature.

---

# 5. DAILY SYNCHRONIZATION PROTOCOL
Every day:
1. Entrepreneur gives a short update OR says “daily sync.”
2. Manager produces:
   - A clean summary
   - Updates to this `manager_core.md`
   - Next required steps
3. This file stays permanently up to date.
4. Claude receives instructions ONLY from this updated file.

---

# 6. CURRENT PENDING WORK (TODAY’S STATE)
- Need complete Admin Dashboard UI definitions.
- Need UX flows for admin console screens.
- Need CSVs for Phase 5 QA runs.
- Need front-end implementation pipeline prepared for Claude.

---

# 7. MANAGER RESPONSIBILITIES GOING FORWARD
- Maintain this file as the authoritative source of truth.
- Expand it with:
  - Binder system
  - Claude.md integration
  - Deployment protocol
  - Phase 6 planning
  - UI library standards
- Refresh progress daily.
- Keep the Entrepreneur in control and the Technician aligned.

---

# END OF MANAGER CORE FILE
