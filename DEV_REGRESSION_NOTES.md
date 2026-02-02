# DEV REGRESSION NOTES — Issues #35-#41

**Test Date:** 2025-12-10
**Commit Tested:** ad6f12c
**Branch:** dev

---

## CRITICAL ISSUES

### VerifyAddressButton — authAPI.post() does not exist
- **File:** `frontend/src/components/address/VerifyAddressButton.tsx:40`
- **Issue:** Calling `authAPI.post('/address/verify', {...})` but authAPI doesn't expose a generic `.post()` method
- **Error:** `Property 'post' does not exist on type {...}`
- **Impact:** Address verification button will crash at runtime
- **Fix Required:** Use `apiClient.post()` instead of `authAPI.post()`, or add address verification method to appropriate API namespace

### Customer Registration — address field not in RegisterData interface
- **File:** `frontend/app/auth/register.tsx:93`
- **Issue:** Passing `address: {...}` to `register()` but RegisterData interface doesn't include address field
- **Error:** `Object literal may only specify known properties, and 'address' does not exist in type 'RegisterData'`
- **Impact:** Customer registration will fail TypeScript validation
- **Fix Required:** Update RegisterData interface in AuthContext or api.ts to include address field

### Customer Registration — route type error
- **File:** `frontend/app/auth/register.tsx:65`
- **Issue:** `router.replace('/(customer)/quote/start')` not recognized as valid route type
- **Error:** Type `'"/(customer)/quote/start"'` not assignable to router parameter
- **Impact:** May cause navigation failures or TypeScript compilation errors
- **Fix Required:** Verify route exists in Expo Router config or use type assertion

### Login — redirect parameter type error
- **File:** `frontend/app/auth/login.tsx:34`
- **Issue:** Dynamic redirect from URL params not typed correctly for router
- **Error:** Type 'string' is not assignable to router parameter
- **Impact:** Redirect after login may fail
- **Fix Required:** Type assertion or route validation for redirect parameter

---

## HIGH PRIORITY ISSUES

### AddressForm — Control type mismatch in register.tsx
- **File:** `frontend/app/auth/register.tsx:250`
- **Issue:** Passing `Control<RegisterForm>` to AddressForm which expects `Control<AddressFormData>`
- **Error:** Form state types incompatible (RegisterForm vs AddressFormData)
- **Impact:** Form validation and state management may break
- **Fix Required:** AddressForm should accept parent form control or use separate form instance

### AddressForm — Control type mismatch in quote/request.tsx
- **File:** `frontend/app/quote/request.tsx:528,530`
- **Issue:** Passing `Control<JobRequestForm>` and `setValue<JobRequestForm>` to AddressForm
- **Error:** Form state types incompatible (JobRequestForm vs AddressFormData)
- **Impact:** Form validation and state management may break
- **Fix Required:** Same as above - AddressForm needs to handle parent form controls

### AddressForm — Invalid autoComplete value
- **File:** `frontend/src/components/AddressForm.tsx:185`
- **Issue:** Using `autoComplete="address-level2"` but valid values don't include this
- **Error:** Type `'"address-level2"'` not assignable (suggests "address-line2")
- **Impact:** iOS autofill may not work correctly for city field
- **Fix Required:** Use correct autoComplete attribute per React Native spec

---

## MEDIUM PRIORITY ISSUES

### Customer Profile — Missing style properties
- **File:** `frontend/app/(customer)/profile/index.tsx:418-420`
- **Issue:** Referencing `styles.statusVerified`, `styles.statusMismatch`, `styles.statusUnverified` but these don't exist
- **Error:** Property does not exist in styles object (suggests statusTextVerified, statusTextMismatch)
- **Impact:** Profile verification status display will crash
- **Fix Required:** Define missing styles or use correct style names

### Handyman Profile — Missing style properties
- **File:** `frontend/app/(handyman)/profile/index.tsx:164,252,254,255,271,319,323`
- **Issues:** Multiple missing styles:
  - `styles.keyboardView` (line 164)
  - `styles.emptyState` (line 252)
  - `styles.emptyText` (line 254)
  - `styles.emptySubtext` (line 255)
  - `styles.addressFormContainer` (line 271)
  - `styles.saveButton` (line 319)
  - `styles.saveButtonText` (line 323)
- **Impact:** Handyman profile will crash when rendering address editing UI
- **Fix Required:** Define all missing styles in StyleSheet

### Customer Jobs — Invalid route type
- **File:** `frontend/app/(customer)/jobs.tsx:222`
- **Issue:** Route template string not recognized as valid route type
- **Error:** Type not assignable to router parameter
- **Impact:** Navigation from jobs list may fail
- **Fix Required:** Verify route exists or add type assertion

---

## LOW PRIORITY ISSUES / WARNINGS

### Backend — No tests found
- **Test:** `pytest --co -q` in backend directory
- **Result:** "no tests collected in 5.26s"
- **Impact:** Cannot verify backend functionality via automated tests
- **Note:** May be intentional if tests are in different location or not yet written

### Backend — GeoFenceProvider warning (expected)
- **Test:** Import and initialize GeoFenceProvider
- **Result:** Warning logged: "GEO_API_KEY not configured in environment - geofence features will be limited"
- **Impact:** None - this is expected behavior per Issue #40 requirements
- **Status:** Working as intended

### Expo Web — Port conflicts
- **Test:** Multiple Expo servers running simultaneously
- **Result:** Ports 8081, 8082, 8083 all in use, servers prompting for alternative ports
- **Impact:** Unable to start clean web build without killing existing processes
- **Fix Required:** Kill existing Expo processes before starting new servers

---

## POSITIVE FINDINGS ✅

### State Picker — DC and PR present
- **File:** `frontend/src/components/AddressForm.tsx:35,66`
- **Result:** District of Columbia and Puerto Rico both present in US_STATES array
- **Status:** ✅ Issue #36 verified working

### Backend — Address verification endpoint exists
- **File:** `backend/server.py`
- **Result:** POST /address/verify endpoint present and uses maps_provider
- **Status:** ✅ Backend portion of Issue #37 implemented (frontend has API call bug)

### Backend — GeoFenceProvider loads correctly
- **Test:** Import and initialize provider
- **Result:** Provider loads, logs expected warning, returns proper status
- **Status:** ✅ Issue #40 verified working

### Customer Profile Edit — File exists and structured correctly
- **File:** `frontend/app/(customer)/profile/edit.tsx`
- **Result:** Screen created with photo picker, form validation, React Hook Form integration
- **Status:** ✅ Issue #38 UI implemented (backend stub still needed)

### Security — SSH passwords removed
- **Files:** `.claude/settings.local.json`, `deploy_ssh.sh` (deleted)
- **Result:** No hardcoded passwords found in tracked files
- **Status:** ✅ Security remediation complete

---

## TESTING STATUS

### Tests NOT Run (Manual Testing Required)
- ❌ Customer registration end-to-end flow (TypeScript errors prevent compilation)
- ❌ Handyman registration step1→step2 flow (requires running app)
- ❌ Address verification button click (API call will fail due to authAPI.post bug)
- ❌ Customer profile edit save (requires running app + backend)
- ❌ Login/logout for all roles (requires running app)
- ❌ React Native Web clean build (port conflicts prevent clean start)

### Tests Completed (Code Analysis)
- ✅ TypeScript compilation check (19 errors found)
- ✅ State picker verification (DC and PR present)
- ✅ Backend provider initialization (GeoFenceProvider working)
- ✅ Backend test discovery (no tests found)
- ✅ Security audit (passwords removed)

---

## SUMMARY

**Total Issues Found:** 19
**Critical:** 4
**High Priority:** 3
**Medium Priority:** 3
**Low Priority:** 3
**Positive Findings:** 6

**Blocker Issues (Prevent Runtime):**
1. VerifyAddressButton authAPI.post() call
2. Customer registration address type mismatch
3. Customer profile missing styles (statusVerified, etc.)
4. Handyman profile missing styles (keyboardView, emptyState, etc.)

**Recommendation:**
Fix all Critical and High Priority issues before attempting manual testing. TypeScript errors indicate runtime crashes are likely.

---

**Generated by:** Claude Code
**Next Steps:** Fix documented issues, rerun TypeScript check, proceed with manual testing
