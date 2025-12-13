# PHASE 2 — AUTH STABILIZATION AUDIT
**Generated:** 2025-12-13
**Status:** Initial Audit Complete

---

## OBJECTIVE
Create an unbreakable identity and user-hydration layer where registration → login → hydrate works without fail.

---

## COMPLETION CRITERIA CHECKLIST

- [ ] Registration → login → hydrate works without fail
- [ ] `/auth/me` returns complete user with role + profile + addresses
- [ ] One global user store — no duplicate sources of truth
- [ ] Token persistence stable across reload
- [ ] Role enforcement validated on backend and frontend

---

## CURRENT STATE ANALYSIS

### ✅ WORKING CORRECTLY

1. **Token Storage & Persistence**
   - Uses secure storage utility (AsyncStorage wrapper)
   - Stores accessToken and refreshToken
   - Retrieves token on app start for auto-login
   - Location: `AuthContext.tsx:101-108`

2. **Auth Hydration Flow**
   - checkAuthState() runs on app mount
   - Sets isHydrated flag after check completes
   - Properly handles 401 errors (expired tokens)
   - Location: `AuthContext.tsx:98-119`

3. **Login Pipeline**
   - Calls API → stores tokens → sets API token → refreshes user
   - Proper error handling and console logging
   - Location: `AuthContext.tsx:121-148`

4. **Registration Pipeline**
   - Same flow as login (API → store → set → refresh)
   - Customer registration works correctly
   - Location: `AuthContext.tsx:150-177`

5. **User Data Transformation**
   - Converts snake_case (backend) to camelCase (frontend)
   - Role-safe: different fields for customer vs technician/handyman
   - Location: `AuthContext.tsx:179-249`

6. **Global User Store**
   - Single source of truth: AuthContext user state
   - isAuthenticated derived from !!user
   - No duplicate user stores found

7. **Logout Function**
   - Clears tokens, API header, user state
   - Resets hydration flag with delay
   - Location: `AuthContext.tsx:251-275`

---

## ❌ ISSUES IDENTIFIED

### Issue #1: Legacy /home Route Reference (CRITICAL)
**Location:** `frontend/app/auth/login.tsx:53`
**Problem:** References `/home` route that was deleted in Phase 1
```typescript
} else {
  console.log('Unknown role, redirecting to home...');
  router.replace('/home');  // ❌ This route no longer exists
}
```
**Impact:** Users with unknown roles will get routing error
**Fix:** Replace with `/auth/welcome` or appropriate fallback

---

### Issue #2: Role Terminology Inconsistency (HIGH)
**Problem:** Mixed use of 'technician' and 'contractor' terminology

**Backend Role (from API):** 'technician'
**Frontend Routes:** `/(contractor)/dashboard`
**AuthContext Type:** includes 'technician'
**Registration:** Uses 'technician' role

**Evidence:**
- `AuthContext.tsx:18` - Role type includes 'technician'
- `AuthContext.tsx:209` - Checks for 'technician' role
- `login.tsx:39` - Routes 'technician' to '/(contractor)/dashboard'
- `register.tsx:73` - Routes 'technician' to '/(contractor)/dashboard'

**Impact:** Confusing codebase, potential for bugs
**Question:** Should backend change 'technician' → 'contractor' or should we standardize on 'technician'?

---

### Issue #3: Incomplete Error Handling
**Location:** `AuthContext.tsx:240-248`
**Problem:** refreshUser() only logs out on 401, throws error for other status codes
```typescript
} catch (error: any) {
  console.error('Failed to refresh user:', error);
  if (error.response?.status === 401) {
    await logout();
  }
  throw error;  // ❌ Error thrown, could crash app if not caught
}
```
**Impact:** Network errors could propagate uncaught
**Fix:** Add error boundary or better error recovery

---

### Issue #4: Hydration Reset Timing
**Location:** `AuthContext.tsx:266-269`
**Problem:** Uses setTimeout(50ms) to reset isHydrated after logout
```typescript
setIsHydrated(false);
setTimeout(() => {
  setIsHydrated(true);
}, 50);
```
**Impact:** Race condition potential, unclear why delay is needed
**Fix:** Review necessity of reset, use proper state management

---

### Issue #5: No /auth/me Validation
**Problem:** No verification that `/auth/me` returns complete data
**Missing Checks:**
- User has valid role
- User has at least one address (for customers)
- Required fields populated
**Impact:** Partial user data could cause UI errors
**Fix:** Add data validation after getCurrentUser()

---

## BACKEND API VERIFICATION NEEDED

### Questions for Backend Team:
1. ❓ **Role Field:** Is backend role 'technician' or 'contractor'? Should we rename?
2. ❓ **Handyman vs Technician:** Are 'handyman' and 'technician' separate roles or aliases?
3. ❓ **/auth/me Response:** Can you provide sample JSON for all roles?
4. ❓ **Address Requirement:** Are addresses required for all roles or just customers?
5. ❓ **Token Refresh:** Is there a /auth/refresh endpoint for refreshing expired tokens?

---

## ROLE ROUTING AUDIT

### Current Role → Dashboard Mapping:

| Role (Backend) | Dashboard Route | Status |
|----------------|-----------------|--------|
| customer | `/(customer)/dashboard` | ✅ Working |
| technician | `/(contractor)/dashboard` | ⚠️ Terminology mismatch |
| handyman | `/(handyman)/dashboard` | ✅ Working |
| admin | `/admin` | ✅ Working |
| unknown | `/home` | ❌ Broken (deleted) |

---

## REGISTRATION FLOW ANALYSIS

### Customer Registration
**File:** `auth/register.tsx`
**Role:** 'customer'
**Flow:**
1. Form submission → register() in AuthContext
2. AuthContext stores tokens → refreshUser()
3. useEffect watches hydration → redirects to /(customer)/dashboard
**Status:** ✅ Working

### Contractor Registration
**Files:** `auth/contractor/register-step1-4.tsx`
**Role:** 'technician' (likely)
**Flow:**
1. Multi-step form (basic info, documents, profile, portfolio)
2. Final step calls register() or profile update
3. Redirects to /(contractor)/dashboard
**Status:** ⚠️ Need to verify role field sent to backend

### Handyman Registration
**Files:** `auth/handyman/register-step1-4.tsx`
**Role:** 'handyman'
**Flow:**
1. Multi-step form (basic info, documents, profile, banking)
2. Final step saves banking info to profile
3. Redirects to /(handyman)/dashboard
**Status:** ⚠️ Need to verify registration completion

---

## TOKEN MANAGEMENT AUDIT

### ✅ Working:
- Token storage on login/register
- Token retrieval on app start
- Token sent with API requests
- Token cleared on logout

### ⚠️ Needs Review:
- No token refresh mechanism (when accessToken expires)
- No handling of refresh token expiration
- No automatic token renewal

---

## PHASE 2 FIX PLAN

### Priority 1 (Critical - Must Fix)
1. ✅ **Fix /home reference in login.tsx:53**
   - Replace with `/auth/welcome`
   - Test unknown role scenario

### Priority 2 (High - Should Fix)
2. ⚠️ **Standardize role terminology**
   - Decision: Keep 'technician' or rename to 'contractor'?
   - Update all references consistently
   - Document in code comments

3. ⚠️ **Add /auth/me response validation**
   - Verify required fields present
   - Add error handling for incomplete data
   - Log warnings for missing optional fields

4. ⚠️ **Improve refreshUser error handling**
   - Don't throw errors that could crash app
   - Add graceful degradation
   - Show user-friendly error messages

### Priority 3 (Medium - Nice to Have)
5. ⏸️ **Add token refresh logic**
   - Implement automatic token renewal
   - Handle refresh token expiration
   - Add retry logic for failed refreshes

6. ⏸️ **Review hydration reset logic**
   - Understand why setTimeout is needed
   - Consider alternative state management
   - Document the reason in code

### Priority 4 (Low - Future Enhancement)
7. ⏸️ **Add role enforcement on routes**
   - Verify user role matches route role boundary
   - Redirect if role mismatch
   - Add guards to layout files

---

## FILES TO MODIFY

### Phase 2 Task 1: Fix Critical Issues
- [ ] `frontend/app/auth/login.tsx` (line 53)
- [ ] `frontend/src/contexts/AuthContext.tsx` (add validation)

### Phase 2 Task 2: Standardize Roles
- [ ] Verify backend role field with Manager
- [ ] Update AuthContext.tsx if needed
- [ ] Update registration flows if needed

### Phase 2 Task 3: Add Validation
- [ ] `frontend/src/contexts/AuthContext.tsx` (refreshUser function)

### Phase 2 Task 4: Test All Roles
- [ ] Test customer login/register
- [ ] Test contractor login/register
- [ ] Test handyman login/register
- [ ] Test admin login

---

## NEXT STEPS

**Manager Decision Required:**
1. Should backend role be 'technician' or 'contractor'?
2. Are we implementing token refresh in Phase 2 or deferring?
3. Priority order for fixes above?

**Ready to proceed with:**
- Fix #1: /home route reference (can do immediately)
- Once Manager provides direction on roles, can proceed with remaining fixes

---

## END OF AUDIT

**Status:** ✅ Audit Complete
**Critical Issues:** 1
**High Priority Issues:** 3
**Medium Priority Issues:** 2
**Low Priority Issues:** 2

**Awaiting Manager instruction to proceed with fixes.**
