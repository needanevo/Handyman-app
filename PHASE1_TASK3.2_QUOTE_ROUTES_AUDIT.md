# PHASE 1 — TASK 3.2: QUOTE ROUTES AUDIT
**Generated:** 2025-12-11
**Status:** READ-ONLY ANALYSIS (No modifications made)

---

## EXECUTIVE SUMMARY

**Critical Finding:** Two parallel job request flows exist, causing architectural confusion.

**OLD Flow:** `quote/request.tsx` → Used by `home.tsx` (orphaned root file)
**NEW Flow:** `(customer)/job-request/step0-step4` → Used by customer dashboard

**Recommendation:** Archive or delete OLD flow, update home.tsx to use NEW flow

---

## 1. DIRECTORY STRUCTURE

### 1.1 quote/ Directory (OLD FLOW)
```
quote/
├── request.tsx ⚠️ (1005 lines - OLD job request screen)
└── request-backup.txt ❌ (Backup file - safe to delete)
```

### 1.2 quotes/ Directory (QUOTE VIEWING)
```
quotes/
├── quotes.tsx ⚠️ (Root-level quotes list - should move to (customer)?)
└── [id].tsx ⚠️ (817 lines - Quote detail screen)
```

### 1.3 NEW Flow (CURRENT ACTIVE)
```
(customer)/job-request/
├── step0-address.tsx ✅
├── step1-category.tsx ✅
├── step2-photos.tsx ✅
├── step3-describe.tsx ✅
├── step3-review.tsx ✅
└── step4-budget-timing.tsx ✅
```

---

## 2. FILE-BY-FILE ANALYSIS

### 2.1 quote/request.tsx (OLD FLOW)

**Size:** 1005 lines
**Functionality:**
- Full job request screen with category selection
- Photo upload with immediate S3 upload
- Address collection via AddressForm component
- Service category selection (12 categories)
- Description, urgency, budget fields
- Submits to `jobsAPI.createJob()`

**Referenced By:**
- `home.tsx:134` - `router.push('/quote/request?category=${category}')`
- `home.tsx:174` - `router.push('/quote/request')`
- `quotes.tsx:79` - `router.push('/quote/request')` (Add button)
- `quotes.tsx:149` - `router.push('/quote/request')` (Empty state)

**Status:** ⚠️ **LEGACY - Still actively used by home.tsx**

**Issues:**
- Redirects to `/home` after submission (line 410, 414)
- Not role-isolated (exists outside (customer) boundary)
- Duplicates functionality of (customer)/job-request flow

---

### 2.2 quote/request-backup.txt

**Size:** Unknown (backup file)
**Status:** ❌ **DELETE - Safe to remove**

---

### 2.3 quotes.tsx (ROOT LEVEL)

**Size:** ~150 lines (estimated from read)
**Functionality:**
- Lists all quotes for current user
- Fetches from `quotesAPI.getQuotes()`
- Status icons (draft, sent, viewed, accepted, rejected, expired)
- Pull-to-refresh support
- Links to `/quotes/[id]` for detail view
- "Add Quote" button → `/quote/request`

**Referenced By:**
- `home.tsx:210` - `router.push('/quotes')`
- `home.tsx:223` - Links to quote details

**Status:** ⚠️ **FUNCTIONAL but NOT role-isolated**

**Issues:**
- Exists at root level (violates parallel role architecture)
- Should be moved to `(customer)/quotes/index.tsx`
- Uses OLD flow for creating new quotes

---

### 2.4 quotes/[id].tsx (QUOTE DETAIL)

**Size:** 817 lines
**Functionality:**
- Comprehensive quote detail view
- Hero section with photo gallery
- Status badges, pricing breakdown, location
- Action buttons:
  - Contact about quote
  - Request additional work → `/quote/request`
  - Delete quote
  - Report issue
- Full-screen photo modal
- React Query integration

**Referenced By:**
- `quotes.tsx:99` - `router.push('/quotes/${quote.id}')`
- `home.tsx` (indirect via quotes list)

**Status:** ⚠️ **FUNCTIONAL but NOT role-isolated**

**Issues:**
- Exists outside (customer) boundary
- "Request additional work" links to OLD flow (line 124)
- Should be moved to `(customer)/quotes/[id].tsx`

---

## 3. REFERENCE ANALYSIS

### 3.1 Files Referencing OLD Quote Flow

| File | Line | Reference | Status |
|------|------|-----------|--------|
| **home.tsx** | 134 | `/quote/request?category=` | ⚠️ Orphaned file using old flow |
| **home.tsx** | 174 | `/quote/request` | ⚠️ Same |
| **home.tsx** | 210 | `/quotes` | ⚠️ Links to root quotes list |
| **home.tsx** | 223 | `/quotes/detail?id=` | ⚠️ Wrong route format |
| **quotes.tsx** | 79 | `/quote/request` | ⚠️ Root file using old flow |
| **quotes.tsx** | 99 | `/quotes/${quote.id}` | ✅ Correct dynamic route |
| **quotes.tsx** | 149 | `/quote/request` | ⚠️ Root file using old flow |
| **quotes/[id].tsx** | 124 | `/quote/request` | ⚠️ Should use new flow |
| **quote/request-backup.txt** | 156 | `/quotes` | ❌ Backup file |

### 3.2 Files Referencing NEW Job Request Flow

| File | Line | Reference | Status |
|------|------|-----------|--------|
| **(customer)/dashboard.tsx** | 142 | `/(customer)/job-request/step0-address` | ✅ Correct new flow |
| **(customer)/jobs.tsx** | 211 | `/(customer)/job-request/step0-address` | ✅ Correct new flow |
| **(customer)/jobs.tsx** | 309 | `/(customer)/job-request/step0-address` | ✅ Correct new flow |
| **(customer)/jobs.tsx** | 222 | `/(customer)/quote-detail/${job.id}` | ⚠️ Route doesn't exist? |

---

## 4. ARCHITECTURAL PROBLEMS

### Problem 1: Dual Job Request Flows
**Impact:** Confusion, inconsistent UX, difficult maintenance

- OLD: `quote/request.tsx` (single-page flow)
- NEW: `(customer)/job-request/step0-step4` (multi-step flow)

**Consequence:**
- home.tsx users → OLD flow → redirects to `/home` (orphaned)
- Customer dashboard users → NEW flow → stays in role boundary

### Problem 2: Root-Level Quote Routes
**Impact:** Violates Phase 1 parallel architecture

Routes at root:
- `quotes.tsx`
- `quotes/[id].tsx`

Should be:
- `(customer)/quotes/index.tsx`
- `(customer)/quotes/[id].tsx`

### Problem 3: Orphaned home.tsx Dependency
**Impact:** home.tsx keeps OLD flow alive

home.tsx is:
- Orphaned root file (flagged in Task 3.1)
- Only file preventing deletion of OLD quote flow
- Should be deleted or relocated

### Problem 4: Inconsistent Route Patterns
**Impact:** Navigation errors

- `home.tsx:223` uses `/quotes/detail?id=` (query param)
- `quotes.tsx:99` uses `/quotes/${id}` (dynamic segment) ✅ Correct
- `(customer)/jobs.tsx:222` uses `/(customer)/quote-detail/${id}` (doesn't exist)

---

## 5. BACKEND INTEGRATION

### 5.1 API Methods Used

**OLD Flow (quote/request.tsx):**
```typescript
quotesAPI.uploadPhotoImmediate()  // Line 195
quotesAPI.getQuotes()             // Used by quotes.tsx
jobsAPI.createJob()               // Line 401
profileAPI.addAddress()           // Line 369
```

**NEW Flow ((customer)/job-request/):**
```typescript
// (Needs investigation - likely similar)
```

**Quote Viewing (quotes.tsx, quotes/[id].tsx):**
```typescript
quotesAPI.getQuotes()             // quotes.tsx:28
quotesAPI.getQuote(id)            // quotes/[id].tsx:44
quotesAPI.deleteQuote(id)         // quotes/[id].tsx:50
quotesAPI.contactAboutQuote()     // quotes/[id].tsx:69
quotesAPI.reportIssue()           // quotes/[id].tsx:86
```

### 5.2 Data Models

**Quote Object Fields (from quotes/[id].tsx):**
- id, status, created_at, service_category
- description, photos[], items[]
- total_amount, address{}

**Job Object Fields:**
- (Needs comparison with quote fields)

---

## 6. DECISION MATRIX

### Option A: DELETE OLD Flow Entirely
**Pros:**
- Clean architecture
- Single source of truth
- Forces migration to NEW flow

**Cons:**
- Breaks home.tsx (orphaned anyway)
- Breaks quotes.tsx "Add Quote" buttons
- May lose features from OLD flow

**Files to Delete:**
- `quote/request.tsx`
- `quote/request-backup.txt`

**Files to Update:**
- `quotes.tsx` → Change `/quote/request` to `/(customer)/job-request/step0-address`
- `quotes/[id].tsx` → Same update (line 124)

---

### Option B: RELOCATE Quote Viewing to (customer)
**Pros:**
- Preserves quote viewing functionality
- Aligns with role-based architecture
- Maintains quote history access

**Cons:**
- Requires route updates across multiple files
- May need backend route changes

**Files to Move:**
- `quotes.tsx` → `(customer)/quotes/index.tsx`
- `quotes/[id].tsx` → `(customer)/quotes/[id].tsx`

**Files to Update:**
- home.tsx references (but home.tsx is orphaned)
- Any customer-facing links

---

### Option C: HYBRID (Recommended)
**Combine A + B:**

1. **DELETE:**
   - `quote/request.tsx` (OLD flow)
   - `quote/request-backup.txt` (backup)

2. **RELOCATE:**
   - `quotes.tsx` → `(customer)/quotes/index.tsx`
   - `quotes/[id].tsx` → `(customer)/quotes/[id].tsx`

3. **UPDATE:**
   - `(customer)/quotes/index.tsx:79,149` → Change to `/(customer)/job-request/step0-address`
   - `(customer)/quotes/[id].tsx:124` → Same update
   - `(customer)/dashboard.tsx` → Add "View Quotes" link to new location
   - `(customer)/jobs.tsx:222` → Fix route to `/(customer)/quotes/${job.id}` (if quote viewing is intended)

4. **IGNORE:**
   - home.tsx (orphaned, will be handled separately)

**Result:**
- Clean role-based architecture ✅
- Single job request flow (NEW) ✅
- Quote viewing preserved and relocated ✅
- No orphaned dependencies ✅

---

## 7. FEATURE COMPARISON

### OLD Flow (quote/request.tsx)
- ✅ Single-page UX
- ✅ Immediate photo upload to S3
- ✅ 12 service categories with descriptions
- ✅ AddressForm integration
- ✅ Urgency selection (flexible/normal/urgent)
- ✅ Budget field
- ❌ Not multi-step
- ❌ Redirects to orphaned `/home`

### NEW Flow ((customer)/job-request/step0-step4)
- ✅ Multi-step wizard UX
- ✅ Role-isolated (customer boundary)
- ✅ Step-by-step validation
- ❌ More complex navigation
- ❌ More files to maintain

**Question for Manager:** Are there features in OLD flow that NEW flow lacks?

---

## 8. RECOMMENDATIONS

### Immediate Actions (Task 3.2 Cleanup)

1. **DELETE (2 files):**
   ```
   ❌ quote/request-backup.txt
   ```

2. **DEFER DECISION on quote/request.tsx:**
   - Wait for Manager confirmation
   - Needs feature comparison with NEW flow
   - home.tsx dependency (orphaned file)

### Phase 1 Task 3.3 (Next Task - Awaiting Approval)

1. **RELOCATE (2 files):**
   ```
   quotes.tsx → (customer)/quotes/index.tsx
   quotes/[id].tsx → (customer)/quotes/[id].tsx
   ```

2. **UPDATE Route References:**
   - Both relocated files: `/quote/request` → `/(customer)/job-request/step0-address`
   - Customer dashboard: Add "My Quotes" link if needed
   - Fix `(customer)/jobs.tsx:222` if quote viewing intended

3. **VALIDATION:**
   - Test quote list loading
   - Test quote detail view
   - Test "Request Additional Work" flow
   - Verify no broken links

### Questions for Manager

1. **Feature Parity:** Does NEW flow have all features of OLD flow?
2. **Quote vs Job:** Are "quotes" and "jobs" different entities, or same thing at different stages?
3. **home.tsx Status:** Delete home.tsx now or keep temporarily?
4. **Migration Path:** Should we support both flows during transition, or hard cut?

---

## 9. FILE STATUS SUMMARY

| File | Lines | Status | Action | Priority |
|------|-------|--------|--------|----------|
| quote/request.tsx | 1005 | Legacy - Active | ⏸️ DEFER | Medium |
| quote/request-backup.txt | ? | Backup | ❌ DELETE | High |
| quotes.tsx | ~150 | Active - Wrong location | 🔄 RELOCATE | High |
| quotes/[id].tsx | 817 | Active - Wrong location | 🔄 RELOCATE | High |

---

## 10. PHASE 1 COMPLIANCE

**Guardrails Check:**
- ✅ No auth logic touched
- ✅ No business logic implemented
- ✅ No provider code modified

**Completion Criteria Progress:**
- ⚠️ Orphaned routes identified (quotes.tsx, quotes/[id].tsx)
- ⚠️ Legacy routes identified (quote/request.tsx)
- ⏳ Awaiting Manager decision on cleanup approach

---

## END OF AUDIT

**Next Step:** Manager approval for Option C (Hybrid Approach) or alternative.

**Blocked By:** Feature parity verification between OLD and NEW flows.

**Generated by:** Claude Code Phase 1 Worker
**Branch:** dev2
**Date:** 2025-12-11
