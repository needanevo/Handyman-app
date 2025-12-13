# **12-PHASE MASTER BUILDSHEET (Production Grade)**

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

# **PHASE 4 — Provider Architecture (Shared Logic Systems)**
**Objective:** Centralize app-wide services and API integrations.

**Completion Criteria:**
- `providers/` folder exists with clean module patterns.
- API provider supports all existing backend endpoints.
- Storage provider connected to Linode S3.
- Messaging provider skeleton.
- Geo provider skeleton.

**Guardrails:**
- Do NOT modify UI.
- Do NOT create new business flows.
- Keep all provider modules role-agnostic.

**Tasks:**
1. Create provider folder structure.
2. Build API provider modules.
3. Build storage provider.
4. Build messaging provider.
5. Build geo provider.

---

# PHASES 5–12 follow the same pattern as your original version, but with formal criteria:

(Contractor/Handyman UI · Customer Funnel · Matching Engine · Workflows · Billing · Messaging · Search/Geo · AI/Admin/Legal)

---

# **FINAL NOTE**
A phase is only "COMPLETE" when its **Completion Criteria** and **Guardrails** are satisfied.
Everything else is a TASK, not a Phase.
