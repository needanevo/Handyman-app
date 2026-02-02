# PHASE 5B — Provider Onboarding Test Plan

**Document Version:** 1.0
**Date:** 2025-12-13
**Scope:** Phase 5B-1 (Identity & Capability Capture) and 5B-2 (Readiness & Trust Model)

---

## Prerequisites

**Phase 5A must be deployed and passing:**
- Contractor registration Step 1 returns HTTP 200 ✅
- Provider can login immediately after registration ✅
- Address persists and appears in profile ✅
- Profile photo enforced (camera-only) ✅
- Verification countdown fields exist ✅

**Backend Health:**
```bash
curl https://handyman.therealjohnson.com/api/health
# Expected: {"status": "ok", "timestamp": "..."}
```

---

## PHASE 5B-1 TESTS — Identity & Capability Capture

### Test 1: Contractor Registration with Provider Fields

**Manual Test:**
1. Open app → Register as Contractor
2. Complete Step 1 (basic info + profile photo)
3. Complete Step 2 (documents)
4. Complete Step 3 (address + skills)
5. Complete Step 4 (portfolio)
6. Force quit app / cold start
7. Login with same credentials
8. Navigate to Profile screen

**PASS Criteria:**
- ✅ Onboarding resumes at correct step if interrupted
- ✅ All entered data persists (no data loss on reload)
- ✅ Profile screen shows skills/categories entered
- ✅ No crashes, no blank screens

---

### Test 2: /auth/me Returns Provider Identity Fields

**Curl Test:**
```bash
# Step 1: Register contractor
curl -X POST https://handyman.therealjohnson.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test_provider_identity@example.com",
    "password": "TestPassword123!",
    "phone": "555-9001",
    "firstName": "Provider",
    "lastName": "Test",
    "role": "contractor",
    "marketingOptIn": false,
    "businessName": "Provider Test Services"
  }'

# Expected: HTTP 200
# Save access_token from response

# Step 2: Get user profile
curl -X GET https://handyman.therealjohnson.com/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

**PASS Criteria:**
```json
{
  "role": "contractor",
  "provider_type": "individual",
  "provider_intent": "not_hiring",
  "provider_status": "draft",
  "provider_completeness": 0,
  "address_verification_status": "pending",
  "address_verification_started_at": "2025-12-13T...",
  "address_verification_deadline": "2025-12-23T..."
}
```

---

### Test 3: Handyman Skills Matrix Persistence

**Manual Test:**
1. Register as Handyman
2. Complete onboarding through skills selection
3. Select 3-5 skills from matrix (Drywall, Painting, Electrical)
4. Save and continue
5. Force quit app
6. Reopen and login
7. Navigate to Profile → View skills

**PASS Criteria:**
- ✅ Skills array persists correctly
- ✅ Skills display in profile screen
- ✅ /auth/me response includes skills array:
  ```json
  {
    "skills": ["Drywall", "Painting", "Electrical"]
  }
  ```

---

### Test 4: Contractor License/Insurance Placeholder Capture

**Manual Test:**
1. Register as Contractor
2. Upload driver's license (Step 2)
3. Upload professional licenses (optional)
4. Upload insurance documents (optional)
5. Complete registration
6. Check profile → Documents section

**PASS Criteria:**
- ✅ Documents saved and visible in profile
- ✅ /auth/me returns:
  ```json
  {
    "documents": {
      "license": "https://...",
      "business_license": ["https://...", "https://..."],
      "insurance": "https://..."
    }
  }
  ```

---

### Test 5: Onboarding State Resume (Reload Safety)

**Manual Test:**
1. Start contractor registration
2. Complete Step 1 only
3. Close app completely
4. Reopen app and login
5. App should resume at Step 2 (documents)
6. Complete Step 2
7. Close app again
8. Reopen and verify resume at Step 3

**PASS Criteria:**
- ✅ Step state tracked server-side
- ✅ No data loss on reload
- ✅ Resume always goes to next incomplete step
- ✅ User never forced to re-enter completed steps

---

## PHASE 5B-2 TESTS — Readiness & Trust Model

### Test 6: Provider Status Lifecycle

**DB Test (Manual):**
1. Create provider via registration (status should be "draft")
2. Complete all onboarding steps
3. Manually update provider_status in MongoDB:
   ```javascript
   db.users.updateOne(
     {"email": "test@example.com"},
     {"$set": {"provider_status": "submitted"}}
   )
   ```
4. Verify frontend sees "submitted" status
5. Manually set to "active":
   ```javascript
   db.users.updateOne(
     {"email": "test@example.com"},
     {"$set": {"provider_status": "active"}}
   )
   ```
6. Verify provider can now see jobs

**PASS Criteria:**
- ✅ Status transitions: draft → submitted → active
- ✅ Frontend reflects current status from /auth/me
- ✅ Each status renders correct UI state

---

### Test 7: Address Verification Deadline Enforcement (Restricted State)

**DB Test (Manual):**
1. Create provider account
2. Do NOT verify address
3. Manually set deadline to past date:
   ```javascript
   db.users.updateOne(
     {"email": "test@example.com"},
     {"$set": {
       "address_verification_deadline": new Date("2025-12-01T00:00:00Z"),
       "provider_status": "restricted"
     }}
   )
   ```
4. Login to app
5. Dashboard should show restriction banner

**PASS Criteria:**
- ✅ Dashboard shows: "Address verification deadline has passed - Account restricted"
- ✅ Banner is red (urgent state)
- ✅ Provider cannot accept jobs (buttons disabled)
- ✅ Backend rejects job acceptance attempts

---

### Test 8: Completeness Scoring

**Curl Test:**
```bash
# Register minimal provider (incomplete)
curl -X POST https://handyman.therealjohnson.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "incomplete_provider@example.com",
    "password": "TestPassword123!",
    "phone": "555-9002",
    "firstName": "Incomplete",
    "lastName": "Provider",
    "role": "handyman",
    "marketingOptIn": false
  }'

# Get profile
curl -X GET https://handyman.therealjohnson.com/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

**PASS Criteria:**
```json
{
  "provider_completeness": 20,  // Only basic fields filled
  "provider_status": "draft"
}
```

After completing all onboarding:
```json
{
  "provider_completeness": 100,
  "provider_status": "active"
}
```

---

### Test 9: Profile Incomplete Banner

**Manual Test:**
1. Register provider
2. Complete only Step 1 and Step 2
3. Skip Step 3 (skills/address)
4. Navigate to Dashboard

**PASS Criteria:**
- ✅ Dashboard shows "Profile incomplete" banner
- ✅ Banner includes "Continue onboarding" button
- ✅ Clicking button navigates to next incomplete step
- ✅ Banner disappears when provider_completeness = 100

---

### Test 10: Restricted Provider Job Acceptance Block

**Manual Test:**
1. Create provider and complete registration
2. Manually set provider_status = "restricted" in DB
3. Login and navigate to Available Jobs
4. Attempt to accept a job

**PASS Criteria:**
- ✅ UI: "Accept Job" button is disabled/grayed out
- ✅ UI: Tooltip shows "Profile restricted - complete verification"
- ✅ Backend: If API called anyway, returns 403 Forbidden:
  ```json
  {
    "detail": "Provider account is restricted. Complete address verification to accept jobs."
  }
  ```

---

## Negative Tests

### Test 11: Invalid Provider Type

**Curl Test:**
```bash
# Attempt to set invalid provider_type via API
curl -X PATCH https://handyman.therealjohnson.com/api/contractors/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "provider_type": "invalid_value"
  }'
```

**PASS Criteria:**
- ✅ Returns HTTP 422 validation error
- ✅ Error message: "provider_type must be 'individual' or 'business'"

---

### Test 12: Missing Critical Fields

**Manual Test:**
1. Register provider
2. Skip Step 3 (address)
3. Try to navigate to Dashboard
4. Attempt to accept a job

**PASS Criteria:**
- ✅ UI shows: "Complete your profile to access jobs"
- ✅ Job acceptance blocked (UI + backend)
- ✅ No crashes, clear messaging

---

## Database Checks

### Test 13: Field Existence Verification

**MongoDB Shell:**
```javascript
// Find one contractor/handyman user
db.users.findOne({role: {$in: ["contractor", "handyman"]}})
```

**PASS Criteria - Document must include:**
```javascript
{
  "provider_type": "individual",
  "provider_intent": "not_hiring",
  "provider_status": "draft",
  "provider_completeness": 0,
  "address_verification_status": "pending",
  "address_verification_started_at": ISODate("..."),
  "address_verification_deadline": ISODate("...")
}
```

---

### Test 14: Status Change Audit

**MongoDB Shell:**
```javascript
// Check status transitions are logged (if audit implemented)
db.users.find({"provider_status": "active"}).count()
db.users.find({"provider_status": "restricted"}).count()
```

**PASS Criteria:**
- ✅ Counts match expected states
- ✅ No users stuck in invalid states

---

## Performance Tests

### Test 15: Onboarding Load Time

**Manual Test:**
1. Start registration
2. Complete all 4 steps
3. Measure time from Step 1 start to dashboard load

**PASS Criteria:**
- ✅ Total time < 3 minutes (normal user pace)
- ✅ No step takes > 30 seconds to load
- ✅ No network timeouts

---

## Regression Tests

### Test 16: Customer Registration Unaffected

**Curl Test:**
```bash
curl -X POST https://handyman.therealjohnson.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer_test@example.com",
    "password": "TestPassword123!",
    "phone": "555-9003",
    "firstName": "Customer",
    "lastName": "Test",
    "role": "customer",
    "marketingOptIn": false
  }'
```

**PASS Criteria:**
- ✅ HTTP 200 (registration succeeds)
- ✅ /auth/me does NOT include provider fields:
  ```json
  {
    "role": "customer",
    "provider_type": undefined,  // Should not be present
    "provider_status": undefined
  }
  ```

---

## Success Metrics

**Phase 5B-1 Complete When:**
- ✅ All identity fields persist correctly
- ✅ Onboarding is reload-safe (no data loss)
- ✅ Skills/categories save and display
- ✅ /auth/me returns all provider fields

**Phase 5B-2 Complete When:**
- ✅ Provider status lifecycle works (draft → active)
- ✅ Completeness scoring accurate
- ✅ Restricted state blocks job acceptance
- ✅ Address verification deadline enforced
- ✅ Banners display correctly (incomplete profile, restricted)

---

## Rollback Plan

If critical bugs discovered:
1. Revert commits on dev2
2. Restore provider_status to null for all users:
   ```javascript
   db.users.updateMany(
     {role: {$in: ["contractor", "handyman"]}},
     {$unset: {provider_status: "", provider_type: "", provider_intent: "", provider_completeness: ""}}
   )
   ```
3. Redeploy previous stable version
4. Notify team of blockers

---

**Test Plan Version:** 1.0
**Last Updated:** 2025-12-13
**Next Review:** After Phase 5B-1 deployment
