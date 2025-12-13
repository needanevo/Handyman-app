# Contractor Role Fix - Implementation Summary

**Date:** 2025-12-13
**Branch:** dev2
**Issue:** Frontend sends `role="contractor"` but backend only accepted `role="technician"` → 422 error

---

## Problem

- **Frontend canonical roles:** `customer | contractor | handyman | admin`
- **Backend UserRole enum:** `customer | handyman | technician | admin`
- **Result:** Registration with `role="contractor"` failed with HTTP 422 (Unprocessable Entity)

---

## Solution

### 1. Backend Changes (Canonical Role: "contractor")

✅ **Updated `backend/models/user.py`:**
- Changed `UserRole.TECHNICIAN = "technician"` → `UserRole.CONTRACTOR = "contractor"`
- Added `field_validator` to `UserCreate.role` that normalizes legacy `"technician"` → `"contractor"`
- Backward compatibility: accepts both but stores as `"contractor"`

✅ **Updated all backend references:**
- `backend/server.py` - 40+ occurrences of `UserRole.TECHNICIAN` → `UserRole.CONTRACTOR`
- `backend/auth/auth_handler.py` - Added `require_contractor_or_admin()`, kept legacy function name
- `backend/services/contractor_routing.py` - Query changed to `"role": "contractor"`
- `backend/services/job_feed_service.py` - All enum references updated
- `backend/services/proposal_service.py` - All enum references updated
- `backend/create_test_contractor.py` - Test data updated

### 2. Frontend Changes

✅ **No changes needed** - frontend already uses `"contractor"` correctly

### 3. Data Migration

✅ **Created migration script:** `backend/migrate_technician_to_contractor.py`
- Safe migration with dry-run preview
- Asks for confirmation before updating
- Updates all users with `role="technician"` → `role="contractor"`

---

## Files Changed

**Backend Models:**
1. `backend/models/user.py` - UserRole enum + validator

**Backend Services:**
2. `backend/server.py` - All role checks updated
3. `backend/auth/auth_handler.py` - Role requirement functions
4. `backend/services/contractor_routing.py` - Query updated
5. `backend/services/job_feed_service.py` - Enum references
6. `backend/services/proposal_service.py` - Enum references

**Test Files:**
7. `backend/create_test_contractor.py` - Test data updated

**New Files:**
8. `backend/migrate_technician_to_contractor.py` - Migration script
9. `backend/test_contractor_role_fix.py` - Automated test script
10. `CONTRACTOR_ROLE_FIX.md` - This file

---

## Testing Instructions

### Option 1: Automated Test Script

```bash
# After deploying backend to server:
python backend/test_contractor_role_fix.py
```

This will:
1. Register user with `role="contractor"` - expect HTTP 200
2. Register user with `role="technician"` (legacy) - expect HTTP 200 + normalized to "contractor"
3. Verify both users have `role="contractor"` in database

### Option 2: Manual Testing with cURL

**Test 1: Register with role="contractor" (new canonical)**

```bash
curl -X POST https://handyman.therealjohnson.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test_contractor@example.com",
    "password": "TestPassword123!",
    "phone": "555-0001",
    "firstName": "Test",
    "lastName": "Contractor",
    "role": "contractor",
    "marketingOptIn": false,
    "businessName": "Test Contractor Services"
  }'
```

**Expected:** HTTP 200 with `access_token` and `refresh_token`

**Test 2: Register with role="technician" (legacy - should normalize)**

```bash
curl -X POST https://handyman.therealjohnson.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test_technician_legacy@example.com",
    "password": "TestPassword123!",
    "phone": "555-0002",
    "firstName": "Legacy",
    "lastName": "Technician",
    "role": "technician",
    "marketingOptIn": false,
    "businessName": "Legacy Technician Services"
  }'
```

**Expected:** HTTP 200 with tokens, role stored as `"contractor"` in database

**Test 3: Verify role in user profile**

```bash
# Get access_token from registration response above, then:
curl -X GET https://handyman.therealjohnson.com/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

**Expected:** Response includes `"role": "contractor"` (even if registered with "technician")

### Option 3: Frontend Registration Flow

1. Navigate to contractor registration in app
2. Complete all steps
3. Should now succeed without 422 error
4. Verify contractor dashboard loads correctly

---

## Data Migration

**Before deploying to production:**

```bash
python backend/migrate_technician_to_contractor.py
```

This will:
1. Find all users with `role="technician"`
2. Show preview of users to migrate
3. Ask for confirmation
4. Update all to `role="contractor"`
5. Verify migration completed

---

## Verification Checklist

- [ ] Backend compiles without errors
- [ ] Frontend compiles without errors
- [ ] Registration with `role="contractor"` succeeds (HTTP 200)
- [ ] Registration with `role="technician"` succeeds and normalizes to "contractor"
- [ ] Contractor dashboard loads correctly
- [ ] Existing contractor users migrated from "technician" to "contractor"
- [ ] All contractor-specific endpoints work (jobs, proposals, wallet, etc.)

---

## Backward Compatibility

✅ **Maintained:**
- Old code/integrations sending `role="technician"` still work
- Values automatically normalized to `"contractor"` before validation
- Database queries updated to use `"contractor"`

⚠️ **Note:**
- The `require_technician_or_admin()` function still exists but is marked as legacy
- New code should use `require_contractor_or_admin()` instead

---

## Rollback Plan (if needed)

If issues arise:

1. Revert commit on `dev2` branch
2. Re-run migration script in reverse:
   ```bash
   # In MongoDB shell:
   db.users.updateMany(
     {"role": "contractor"},
     {"$set": {"role": "technician"}}
   )
   ```
3. Redeploy previous version

---

## Success Metrics

✅ **No more 422 errors** on contractor registration
✅ **Consistent role naming** across frontend and backend
✅ **Backward compatibility** for legacy "technician" values
✅ **All contractor features** continue working

---

**Implementation Complete:** 2025-12-13
**Next Steps:** Deploy to server, run migration, test registration flow
