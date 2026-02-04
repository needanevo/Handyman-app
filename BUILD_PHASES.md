# **12-PHASE MASTER BUILDSHEET (Production Grade)**

**Last Verified:** 2026-01-04
**Verification Status:** Phases 1-4 ✅ COMPLETE | Phase 5A ✅ COMPLETE
**See:** `PHASE_VERIFICATION_REPORT_2026-01-04.md` for detailed evidence

This document defines the ONLY official macro structure for the entire project.
Each Phase includes:
- Objective
- Start Conditions
- Completion Criteria
- Guardrails (what NOT to do)
- Tasks (actionable steps)

Phases MUST be completed in linear order unless explicitly overridden.

---

# **PHASE 1 — Scaffold & Folder Architecture**
**Objective:** Establish a clean, parallel, predictable filesystem architecture.

**Start Conditions:** Repo is active, existing UI may be messy or inconsistent.

**Completion Criteria:**
- Top-level folders follow the parallel structure: `(handyman)`, `(contractor)`, `(customer)`, `shared`, `auth`, `providers`.
- No orphaned or legacy routes.
- All expected screens exist as placeholders.
- Each role has a consistent layout and route entrypoint.

**Guardrails:**
- Do NOT touch auth logic.
- Do NOT implement business logic.
- Do NOT refactor provider code.

**Tasks:**
1. Define top-level folder structure.
2. Mirror handyman/contractor route trees.
3. Remove or archive legacy routes.
4. Create placeholder screens for every major flow.
5. Define global layout and navigation patterns.

---

# **PHASE 2 — Auth Stabilization**
**Objective:** Create an unbreakable identity and user-hydration layer.

**Start Conditions:** Scaffold is stable and predictable.

**Completion Criteria:**
- Registration → login → hydrate works without fail.
- `/auth/me` returns a complete user with role + profile + addresses.
- One global user store — no duplicate sources of truth.
- Token persistence stable across reload.
- Role enforcement validated on backend and frontend.

**Guardrails:**
- Do NOT modify routing structure.
- Do NOT alter provider architecture.
- Do NOT start customer or matching flows.

**Tasks:**
1. Fix registration-to-login pipeline.
2. Fix hydrate-on-auth flow.
3. Normalize user context.
4. Validate role enforcement.
5. Test across all three roles.

---

# **PHASE 3 — Routing Stability & Role Isolation**
**Objective:** Deterministic routing with hard separation between roles.

**Start Conditions:** Auth must be 100% stable.

**Completion Criteria:**
- No cross-role access.
- Parallel routing structure fully respected.
- Role-based layout guards correct and enforced.
- Error boundaries and fallback redirects implemented.
- Routing works on fresh hydration and cold app start.

**Guardrails:**
- Do NOT begin customer funnel.
- Do NOT implement job or billing logic.

**Tasks:**
1. Lock layout guards.
2. Validate routes for handyman, contractor, customer.
3. Fix all parallel routing violations.
4. Implement error boundaries.
5. Test routing flows per role.

---

# **PHASE 4 — Provider UI Stability**
**Objective:** Stabilize contractor and handyman dashboards, job screens, and profile sections with working navigation and safe no-op handlers.

**Start Conditions:** Phase 3 routing stability complete.

**Completion Criteria:**
- All provider dashboard buttons and navigation work correctly.
- Job cards navigate to correct detail screens.
- Broken navigation fixed (available, active, history job screens).
- Profile settings buttons have safe Alert handlers (no crashes).
- Growth screens "Update My Rates" buttons wired.
- Tier display system added (display-only, no business logic).
- 0 TypeScript errors.
- All 26 business suite screens verified accessible.

**Guardrails:**
- Do NOT implement job matching logic.
- Do NOT implement payments.
- Do NOT add new features - only fix broken navigation and add safe placeholders.

**Tasks:**
1. Audit all contractor/handyman dashboard and job screens for broken navigation.
2. Fix handyman job screen onPress handlers (available, active, history).
3. Add safe Alert handlers to profile settings buttons.
4. Fix growth screens "Update My Rates" buttons.
5. Add tier display to User interface and both dashboards (display-only).
6. Verify all business suite screens exist and are accessible.

---

# **PHASE 5A — Provider Registration Integrity** ✅ VERIFIED COMPLETE 2026-01-04
**Objective:** Contractor + Handyman registration must succeed end-to-end and create a stable provider record.

**Start Conditions:** Phase 4 complete. Backend /api/health returns healthy.

**PHASES 1–4 VERIFIED ✅** - Scaffold, Auth, Routing, and Provider UI all stable and match reality.
**PHASE 5A VERIFIED ✅** - All completion criteria verified in codebase. Ready for manual testing.

**Completion Criteria:**
- Contractor registration Step 1 returns HTTP 200 (no 422).
- Provider can login immediately after registration.
- Address entered in onboarding persists and is visible in profile on reload.
- Profile photo requirement enforced for providers (camera-only).
- Address verification is NOT required to register, but countdown fields exist and display.

**Guardrails:**
- Do NOT add new auth routes.
- Do NOT implement job matching/filtering.
- Do NOT implement payments.

**Tasks:**
1. Ensure backend accepts role="contractor" (normalize legacy "technician").
2. Ensure /auth/register schema matches frontend payload.
3. Ensure address persistence propagates to /auth/me and profile views.
4. Add verification countdown fields for providers.
5. Add provider verification warning + dashboard banner.

**Testing (PASS/FAIL):**
- App: Contractor → Register → Step 1 submit must pass.
- Curl: POST /api/auth/register with role=contractor must return 200.
- /api/auth/me after login must show role=contractor and addresses array present after address step.

---

# **PHASE 5B-1 — Provider Identity & Capability Capture**
**Objective:** Capture provider identity + capabilities in a deterministic schema the system can trust.

**Start Conditions:** Phase 5A complete and deployed.

**Completion Criteria:**
- Provider identity fields exist and persist:
  - providerType: "individual" | "business"
  - providerIntent: "not_hiring" | "hiring" | "mentoring"
- Capabilities persist:
  - skills/categories matrix stored on provider
  - specialty categories for contractors stored
- License/insurance/portfolio placeholders captured (no verification yet).
- Onboarding is linear and reload-safe (resume exactly where left off).

**Guardrails:**
- Do NOT implement state-by-state licensing rules.
- Do NOT implement quote visibility logic.
- Do NOT add admin approval workflow.
- Do NOT gate banking suite yet.

**Tasks:**
1. Add provider identity fields to backend user model + /auth/me mapping:
   - provider_type, provider_intent
2. Implement handyman skills matrix UI + persistence endpoint call.
3. Implement contractor business/license/insurance/category capture + persistence.
4. Add portfolio placeholder save.
5. Ensure onboarding step state persists (server-side fields + client resume).

**Testing (PASS/FAIL):**
- Register provider, complete onboarding steps, refresh app/cold start:
  - Step resumes correctly, no data loss.
- Verify in profile screen that skills/categories display after save.
- Verify /api/auth/me contains provider_type, provider_intent, skills/categories.

---

# **PHASE 5B-2 — Provider Readiness & Trust Model**
**Objective:** Define readiness gates (capability ≠ permission), scoring, and non-destructive restriction states.

**Start Conditions:** Phase 5B-1 complete.

**Completion Criteria:**
- Provider status lifecycle exists and persists:
  - status: "draft" → "submitted" → "active" (auto) + "restricted" (non-destructive)
- Completeness scoring exists (role-aware):
  - handymanCompletenessPct, contractorCompletenessPct (or unified with weights)
- Linear onboarding: missing critical fields = no job acceptance (NOT forced logout).
- Address verification timer enforcement exists:
  - After 10 days unverified: status becomes "restricted"
- Auto-cleanup policy defined:
  - restricted + inactive beyond N days -> soft delete + TTL cleanup (not hard delete immediately)

**Guardrails:**
- Do NOT build full admin approvals.
- Do NOT implement payments.
- Do NOT implement cross-state rule engine.

**Tasks:**
1. Add provider status + completeness fields to backend user model.
2. Add backend enforcement helpers (dependency checks) for "canAcceptJobs".
3. Add UI banners:
   - "X days left to verify address" + deep link to verification action
   - "Profile incomplete" banner with "Continue onboarding"
4. Implement restricted state behavior:
   - restricted providers cannot accept jobs (UI + backend gate placeholder)
5. Add TTL cleanup approach (soft delete + TTL index on deleted_at).

**Testing (PASS/FAIL):**
- Create provider, do NOT verify address, simulate deadline passed (manually set deadline in DB):
  - provider becomes restricted
  - dashboard shows restriction banner
- Provider with incomplete onboarding cannot accept jobs (buttons disabled + backend rejects).
- Provider can complete onboarding later and becomes active again.

---

# PHASE 6 — Eligibility Engine & Quote Visibility Rules

**Objective:** Enforce visibility rules so providers only see quotes they are eligible to take.

Start Conditions: Phase 5 provider onboarding unification complete.

**Completion Criteria:**

- Consent enforcement:
- Handymen see ONLY quotes where customer consented.

**Category enforcement:**

- Handymen see only allowed categories.
- Contractors see their allowed categories (and optionally broader).
- Eligibility logic is deterministic and testable (same inputs → same visibility).
- Provider quote feed is filtered correctly.
- Quote accept → transitions into Job correctly (front + backend alignment).

**Guardrails:**

- Do NOT implement full job lifecycle (Phase 7).
- Do NOT implement financial suite (Phase 8).
- Do NOT implement chat (Phase 9).

**Tasks:**

1. Define eligibility rule table (role × category × consent × provider status).
2. Implement filtered quote list queries (or client-side filtering if backend not ready).
3. Enforce consent + category restrictions in UI and API calls.
4. Implement “Accept Quote → Create Job” transition.
5. Add regression tests for visibility rules.

---

# PHASE 7 — Job Lifecycle System

**Objective:** Real jobs with statuses, timeline, completion, and warranty trigger points.

**Start Conditions:** Phase 6 eligibility + accept-to-job complete.

**Completion Criteria:**
- Job status timeline exists and updates (basic).
- Provider can update job status.
- Customer can view job status.
- Completion closes job and triggers warranty entry point.

**Guardrails:**
- No financial reporting expansion (Phase 8).
- No advanced disputes (Phase 10).

**Tasks:**
Make sure you ask me about Contractors with employees and the heirarchy for photos protocol. We need to make a decision on that. 
**note from discussion on 12/13/25:
"Also, profile pic needs to match profile pic on the top of the dashboard for both handyman and Contractor and there should be a step in registration where they take a picture of their face with a caption "Your future customers will need to be able to recognize you from your profile pic". Which means if contractors have employees, we're going to need a process whereas the contractor can provide or message a pic of their employee for verification for the customer. This may be implimented in the messaging system."

1. Define job status state machine.
2. Implement provider status update controls.
3. Implement customer status timeline view.
4. Implement completion flow and warranty trigger stub.

### Admin System (Phase 7 Addendum)

**Objective:** Stand up a minimal admin portal so the platform owner can manage users, oversee jobs, and intervene when needed. Admin is a prerequisite for manual job routing, dispute resolution, and user management.

**Completion Criteria:**
- Admin account creation via seed script or CLI (no public registration).
- Admin login screen at `/admin/login` with role gate (`role === 'admin'`).
- `(admin)/_layout.tsx` enforces admin role — redirects all non-admins.
- Admin dashboard MVP with:
  - **User management:** search/view users, change roles, disable accounts.
  - **Job oversight:** view all jobs by status, reassign contractor, cancel/flag jobs.
  - **Quote moderation:** view flagged quotes, manual pricing override.
  - **System stats:** user counts by role, job counts by status, basic revenue metrics.

**Guardrails:**
- Do NOT build full audit logging yet (Phase 10).
- Do NOT build automated compliance/verification workflows (Phase 10).
- Do NOT build admin-to-user messaging (Phase 9).
- Admin is read-heavy at first — only essential write actions (role change, job reassign, disable account).

**Tasks:**
5. Create admin seed script (`backend/scripts/create_admin.py`) — promotes existing user or creates new admin user.
6. Implement `/admin/login` screen with admin role check.
7. Fix `(admin)/_layout.tsx` to enforce admin role guard with redirect.
8. Fix `(admin)/jobs/index.tsx` crash (missing default export).
9. Build admin dashboard home screen with stat cards (user counts, job counts, revenue).
10. Build admin user management screen (list, search, role change, disable).
11. Build admin job management screen (list all jobs, filter by status, reassign contractor).
12. Add backend admin endpoints: `GET /admin/users`, `PATCH /admin/users/:id/role`, `GET /admin/jobs`, `PATCH /admin/jobs/:id/reassign`.

---

# PHASE 8 — Business Suite

**Objective:** Give providers real financial tools (earned unlocks later) — mileage, expenses, reports, payouts.

**Start Conditions:** Phase 7 job lifecycle stable.

**Completion Criteria:**

- Expenses: add/view/edit + categorization.
- Mileage: add/view/map support (map can be stubbed).
- Reports: exportable summaries.
- Payouts/wallet screens connect to real data or stable placeholders.

**Guardrails:**
- No IRS filing automation yet.
- No paid subscription model.

**Tasks:**

1. Implement expense tracking backend integration.
2. Implement mileage tracking data model + UI.
3. Implement business reports generation.
4. Implement schedule-C oriented export format (later refinement).

---

# PHASE 9 — Messaging, Notifications & AI Assistance

**Objective:** Chat + notifications + AI-powered quote assistance loop.

**Start Conditions:** Eligibility + job lifecycle stable.

**Completion Criteria:**

- Customer ↔ Provider chat works.
- Notifications exist for quote updates/job updates.
- AI quote assist generates structured suggestions (not final authority).

**Guardrails:**

Do NOT let AI make final pricing without provider confirmation.

**Tasks:**

1. Implement messaging provider + backend endpoints.
2. Wire chat UI for customer/provider.
3. Add notification events (push/email later).
4. Add AI quote assist layer with feedback loop.

---

# PHASE 10 — Compliance, Verification, Admin Enforcement

**Objective:** Make the platform enforce real-world trust: verification, approval, audits, disputes.

**Start Conditions:** Phase 7–9 stable enough for real usage.

**Completion Criteria:**

- LLC verification workflow.
- License/insurance verification workflow.
- Admin controls for approvals, disputes, bans.
- Audit logs.

**Guardrails:**

No heavy legal automation without review.

**Tasks:**

1. Define verification workflows + admin screens.
2. Add provider verification states + enforcement.
3. Implement disputes + admin override actions.
4. Implement audit logging.
5. **Job spam controls:** report, rate limit, moderation queue, reputation scoring (deferred from Phase 5-6).

---

# **FINAL NOTE**
A phase is only "COMPLETE" when its **Completion Criteria** and **Guardrails** are satisfied.
Everything else is a TASK, not a Phase.
