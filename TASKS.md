# TASKS.md

This file contains atomic, executable tasks that can be completed by an AI agent.
Tasks are grouped by PHASE.

Each task must:
- Touch only the files required
- Produce a minimal diff
- Include tests or verification steps if applicable

---

# PHASE 1 — Scaffold Tasks
- Task 1.1: Generate full current folder tree.
- Task 1.2: Propose corrected scaffold based on BUILD_PHASES.md.
- Task 1.3: Create missing directories.
- Task 1.4: Create placeholder screens.
- Task 1.5: Remove orphaned routes.

# PHASE 2 — Auth Tasks
- Task 2.1: Audit registration → login pipeline.
- Task 2.2: Fix email/token misbinding.
- Task 2.3: Implement hydrate-on-login fix.
- Task 2.4: Validate `/auth/me` payload shape.
- Task 2.5: Strengthen role enforcement.

# PHASE 3 — Routing Tasks
- Task 3.1: Audit layout guards.
- Task 3.2: Fix parallel routing issues.
- Task 3.3: Implement redirect boundaries.
- Task 3.4: Validate routing per role.

…# PHASE 5B-1 — Registration, Persistence, Identity (Stability Pass)

## Address & State Foundation (BLOCKING)
- [x] Task 5B1.1: REMOVED - Google Places API handles state selection automatically
- [x] Task 5B1.2: REMOVED - Google Places API handles state selection automatically
- [x] Task 5B1.3: REMOVED - Address verification not needed when Google Places API is used

## Persistence & Review Page Integrity
- [x] Task 5B1.4: Persist "Other" skill selection from Handyman registration to profile and review page. VERIFIED WORKING
- [x] Task 5B1.5: Persist Handyman/Contractor phone verification state to review page. COMPLETE (000000 bypass works, persists to DB)
- [x] Task 5B1.6: Persist Handyman banking information to review page. COMPLETE
- [x] Task 5B1.6b: Add Contractor banking page (step 5) and persist to review page. COMPLETE
- [x] Task 5B1.7: Remove Business Intent field from Handyman review page. VERIFIED - no longer present

## Contractor Identity & Compliance Inputs
- [x] Task 5B1.8: Add text input for Contractor professional license number. COMPLETE (in step 2 Documents)
- [x] Task 5B1.9: Restrict Contractor license photo upload to one image with license aspect ratio. COMPLETE
- [x] Task 5B1.10: Add Contractor insurance policy number text input. COMPLETE (in step 2 Documents)

## Photo Handling
- [x] Task 5B1.11: Single-photo rule enforced for professional license and insurance documents. COMPLETE

## Customer Registration (5B-1 Scope Only)
- [x] Task 5B1.12: Add customer profile photo input to registration flow. COMPLETE
