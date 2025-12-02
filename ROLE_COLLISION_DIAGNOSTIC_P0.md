# P0 Bug: Customer Profile Rendering Handyman Dashboard

**Date**: 2025-12-02
**Severity**: P0 (Critical - Production Blocker)
**Status**: Root Cause Identified - Awaiting Fix Instruction

---

## Bug Reproduction

1. User registers as **CUSTOMER** role
2. App fails to redirect after profile completion
3. Back button shows correct customer dashboard (stub)
4. Navigate to profile screen → **WRONG**: Shows handyman/contractor information:
   - Rating, jobs completed, years experience
   - Business status icons
   - "View Growth Center" button
   - Handyman quick actions
   - Business name, skills, service areas
   - Document verification status
   - Portfolio photos

---

## Root Cause Analysis

### Issue #1: Unconditional Handyman Field Loading (AuthContext.tsx)

**File**: `frontend/src/contexts/AuthContext.tsx`
**Lines**: 173-184

**Problem**: The `refreshUser()` function **ALWAYS** copies handyman/contractor-specific fields into the user object, regardless of the user's role.

```typescript
// Lines 173-184 - WRONG: No role check
// Contractor-specific fields
businessName: userData.business_name,
skills: userData.skills,
yearsExperience: userData.years_experience,
serviceAreas: userData.service_areas,
documents: userData.documents ? {
  license: userData.documents.license,
  businessLicense: userData.documents.business_license,
  insurance: userData.documents.insurance,
} : undefined,
portfolioPhotos: userData.portfolio_photos,
profilePhoto: userData.profile_photo,
```

**Impact**:
- If backend `/auth/me` returns ANY handyman fields for a customer user (even if null/undefined), they get included in the frontend user object
- Components checking for these fields (like `if (user.businessName)`) may render contractor UI for customers
- No role-based filtering occurs

**Expected Behavior**:
Only copy handyman fields if `userData.role === 'handyman'` or `userData.role === 'technician'`.

---

### Issue #2: Backend Returns All Fields Without Role Filtering

**File**: `backend/server.py`
**Lines**: 245-250

**Problem**: The `/auth/me` endpoint returns the entire User object from database without filtering role-specific fields.

```python
@api_router.get("/auth/me", response_model=User)
async def get_current_user_info(
    current_user: User = Depends(get_current_user_dependency),
):
    """Get current user information"""
    return current_user  # ← Returns ALL fields including handyman fields
```

**Database Schema** (`backend/models/user.py`, lines 40-60):
All users (customers, handymen, technicians) share the same collection with optional handyman fields:
```python
# Technician/Handyman specific fields (shared by both)
business_name: Optional[str] = None
hourly_rate: Optional[float] = None
skills: List[str] = []
years_experience: Optional[int] = None
service_areas: List[str] = []
documents: Optional[dict] = None
portfolio_photos: List[str] = []
profile_photo: Optional[str] = None
```

**Impact**:
- MongoDB returns the entire document including null/empty handyman fields for customers
- FastAPI serializes all fields to JSON
- Frontend receives handyman fields even for customer users

**Expected Behavior**:
- Return role-specific User models (CustomerUser vs HandymanUser)
- OR filter/mask handyman fields when `role == 'customer'`

---

### Issue #3: Routing Confusion - Multiple Profile Components

**File Structure**:
```
frontend/app/
├── profile.tsx                    ← CUSTOMER profile (addresses only)
├── (customer)/
│   └── dashboard.tsx              ← Customer dashboard (stub)
├── (contractor)/
│   └── profile.tsx                ← CONTRACTOR profile (business info)
└── (handyman)/
    └── dashboard.tsx              ← Handyman dashboard (growth center)
```

**Problem**: Expo Router file-based routing creates ambiguity:

1. **Root route `/profile`** → Resolves to `frontend/app/profile.tsx` (customer profile)
2. **Grouped route `/(contractor)/profile`** → Resolves to `frontend/app/(contractor)/profile.tsx`
3. **No grouped customer profile** → `frontend/app/(customer)/profile.tsx` does NOT exist

**Current Behavior**:
- All roles navigate to `/profile` (root-level)
- Root profile.tsx is hardcoded as "Customer" profile (line 137: `<Text>Customer</Text>`)
- BUT if user object has contractor fields, they may render

**Navigation Call** (from various screens):
```typescript
router.push('/profile')  // ← Goes to root profile.tsx
// vs
router.push('/(contractor)/profile')  // ← Goes to contractor-specific profile
```

**Impact**:
- If contractors/handymen navigate to `/profile` instead of `/(contractor)/profile`, they see customer profile
- If customers have contractor fields in user object, customer profile might conditionally render contractor content

---

### Issue #4: Profile Component Renders Based on User Fields, Not Role

**File**: `frontend/app/profile.tsx` (Customer Profile)
**Lines**: 125-140

**Current Implementation**: Profile checks user fields to render content:
```typescript
<Text style={styles.profileRole}>Customer</Text>  // ← Hardcoded "Customer"
```

**File**: `frontend/app/(contractor)/profile.tsx` (Contractor Profile)
**Lines**: 259-295, 297-373

**Current Implementation**: Contractor profile displays:
- Business Name: `{user?.businessName || 'Not provided'}`
- Skills: `{user?.skills?.join(', ')  || 'Not provided'}`
- Service Areas: `{user?.serviceAreas?.join(', ') || 'Not provided'}`
- Documents: Checks `user.documents?.license`, `user.documents?.businessLicense`, etc.
- Portfolio: `{user.portfolioPhotos.length} photos uploaded`

**Problem**:
If a customer user object has `businessName`, `skills`, `documents`, or `portfolioPhotos` fields (even if null/undefined), the contractor profile UI will render "Not provided" or empty states, making it appear as though the customer has a contractor profile.

---

### Issue #5: No Role-Based Route Guards

**Problem**: No middleware or guards prevent customers from accessing contractor routes.

**Missing Checks**:
```typescript
// MISSING in frontend/app/(contractor)/profile.tsx
if (user?.role !== 'technician' && user?.role !== 'handyman') {
  router.replace('/profile');  // Redirect to customer profile
  return null;
}
```

**Current Behavior**:
- Any user can navigate to `/(contractor)/profile`
- Component renders regardless of role
- Displays contractor-specific fields (business name, skills, documents)

---

### Issue #6: Profile Photo Upload Writes to Contractor Fields

**File**: `frontend/app/(contractor)/profile.tsx`
**Lines**: 109-136

**Problem**: Profile photo upload uses `contractorAPI.uploadProfilePhoto()`:
```typescript
await contractorAPI.uploadProfilePhoto({
  uri,
  type: mimeType,
  name: `profile.${fileExtension}`,
});
```

**Backend Endpoint** (likely `/contractors/photos/profile`):
- Writes to `profile_photo` field (shared field in User model)
- No role check to prevent customers from using contractor-specific API

**Impact**:
If customer navigates to contractor profile and uploads a photo, it writes to their user document's `profile_photo` field, further blurring the role boundary.

---

### Issue #7: Registration May Set Contractor Fields for Customers

**File**: `backend/server.py`
**Lines**: 167-176

**Problem**: Registration accepts `businessName` for all roles:
```python
user = User(
    id=user_id,
    email=user_data.email,
    phone=user_data.phone,
    first_name=user_data.firstName,
    last_name=user_data.lastName,
    role=user_data.role,
    marketing_opt_in=user_data.marketingOptIn,
    business_name=user_data.businessName if user_data.businessName else None,  # ← Set for ANY role
    created_at=datetime.utcnow(),
    updated_at=datetime.utcnow()
)
```

**Impact**:
If customer registration form accidentally includes `businessName` field (frontend bug, API test, malicious request), it gets stored in the database and returned via `/auth/me`.

---

## Fields Bleeding Into Customer Role

**Handyman/Contractor Fields Found in Customer User Object**:

From `AuthContext.tsx` transformation (lines 173-184):
1. ✅ `businessName` - Always copied
2. ✅ `skills` - Always copied
3. ✅ `yearsExperience` - Always copied
4. ✅ `serviceAreas` - Always copied
5. ✅ `documents` (license, businessLicense, insurance) - Always copied
6. ✅ `portfolioPhotos` - Always copied
7. ✅ `profilePhoto` - Always copied

**Contractor Profile Rendering Logic** (checks these fields):
- Line 267: `{user?.businessName || 'Not provided'}`
- Line 278: `{user?.skills?.join(', ') || 'Not provided'}`
- Line 290: `{user?.serviceAreas?.join(', ') || 'Not provided'}`
- Line 298: `{user?.documents && (...)}`
- Line 358: `{user?.portfolioPhotos && user.portfolioPhotos.length > 0 && (...)}`

**Result**: If customer user has ANY of these fields set (even to `[]`, `{}`, `null`), contractor profile renders sections with "Not provided" or empty states.

---

## Why Post-Registration Redirect Fails

**Suspected Issue**: After profile completion (adding address), the app should redirect to dashboard.

**File**: `frontend/app/profile.tsx`
**Lines**: 61-97 (handleAddAddress function)

**Current Flow**:
1. User adds address via `profileAPI.addAddress()`
2. Success → `await refreshUser()` (line 78)
3. Resets form and closes add address modal (lines 81-85)
4. Shows success alert (line 87)
5. **NO REDIRECT** - User remains on profile screen

**Expected Flow**:
After first address is added during initial setup, should redirect to:
- Customer dashboard: `/` or `/(customer)/dashboard`
- OR onboarding completion screen

**Missing Logic**:
```typescript
// MISSING after line 87
if (user?.addresses?.length === 1) {
  // First address added, complete onboarding
  router.replace('/');  // or '/(customer)/dashboard'
}
```

**Possible Root Causes**:
1. No onboarding state tracking (is this first-time setup vs profile edit?)
2. No redirect logic after address completion
3. `refreshUser()` might fail or return wrong role data
4. User expects automatic redirect but none is implemented

---

## Affected Files Summary

### Frontend Files with Issues:

1. **`frontend/src/contexts/AuthContext.tsx`** (Lines 173-184)
   - ❌ Unconditionally copies handyman fields for all roles
   - ❌ No role-based filtering

2. **`frontend/app/profile.tsx`** (Lines 61-97)
   - ❌ No redirect after address completion
   - ⚠️ Hardcodes "Customer" role text (line 137)

3. **`frontend/app/(contractor)/profile.tsx`** (Entire file)
   - ❌ No role guard to prevent customer access
   - ❌ Renders contractor fields based on presence, not role
   - ❌ Uses `contractorAPI` which may write to customer records

4. **`frontend/app/(handyman)/dashboard.tsx`** (Entire file)
   - ❌ No role guard to prevent customer access
   - ⚠️ Renders based on user fields, not role check

### Backend Files with Issues:

1. **`backend/server.py`** (Lines 245-250)
   - ❌ `/auth/me` returns all fields without role filtering
   - ❌ No response model differentiation by role

2. **`backend/server.py`** (Lines 167-176)
   - ⚠️ Registration accepts `businessName` for all roles
   - ❌ No validation that only contractors can set contractor fields

3. **`backend/models/user.py`** (Lines 40-60)
   - ⚠️ Single User model for all roles with optional handyman fields
   - ⚠️ No role-specific models (CustomerUser vs HandymanUser)

---

## Incorrect Logic Paths

### Path #1: Customer Profile Load
```
1. Customer navigates to /profile
2. AuthContext user object includes businessName, skills, documents (from refreshUser)
3. Profile component renders
4. IF app accidentally routed to /(contractor)/profile:
   → Contractor profile checks user.businessName
   → Renders "Not provided" for all contractor sections
   → Customer sees contractor UI
```

### Path #2: Backend Data Pollution
```
1. Customer registers with accidental businessName field
2. Backend stores businessName in customer's user document
3. Customer logs in
4. /auth/me returns full user object including businessName
5. AuthContext copies businessName to frontend user state
6. Any component checking user.businessName renders contractor UI
```

### Path #3: Navigation Confusion
```
1. Customer taps "Profile" button
2. App calls router.push('/profile')
3. Expo Router resolves to root app/profile.tsx (customer profile) ✅
4. BUT if code calls router.push('/(contractor)/profile'):
   → Routes to contractor profile ❌
   → Contractor profile renders with customer data
```

---

## Recommended Fix Options

### Option 1: Role-Based Field Filtering (Quick Fix)

**Frontend** (`AuthContext.tsx`):
```typescript
// Only copy contractor fields if role is contractor/handyman
...(userData.role === 'technician' || userData.role === 'handyman' ? {
  businessName: userData.business_name,
  skills: userData.skills,
  yearsExperience: userData.years_experience,
  serviceAreas: userData.service_areas,
  documents: userData.documents,
  portfolioPhotos: userData.portfolio_photos,
  profilePhoto: userData.profile_photo,
} : {})
```

**Backend** (`server.py`):
```python
@api_router.get("/auth/me")
async def get_current_user_info(current_user: User = Depends(get_current_user_dependency)):
    user_dict = current_user.model_dump()

    # Filter contractor fields for customers
    if current_user.role == UserRole.CUSTOMER:
        contractor_fields = ['business_name', 'skills', 'years_experience',
                            'service_areas', 'documents', 'portfolio_photos',
                            'hourly_rate', 'available_hours']
        for field in contractor_fields:
            user_dict.pop(field, None)

    return user_dict
```

### Option 2: Separate User Models (Better Architecture)

**Create role-specific Pydantic models**:
- `CustomerUser` - Only customer fields
- `ContractorUser` - Includes contractor fields
- Return appropriate model from `/auth/me` based on role

### Option 3: Role-Based Route Guards (Navigation Safety)

**Add guards to contractor/handyman routes**:
```typescript
// In (contractor)/profile.tsx and (handyman)/dashboard.tsx
const { user } = useAuth();

if (user?.role === 'customer') {
  router.replace('/profile');  // Redirect customers away
  return <LoadingSpinner />;
}
```

### Option 4: Profile Routing Normalization

**Consolidate profile routes**:
- Keep root `/profile` route
- Use role-based conditional rendering inside one component
- Remove duplicate profile components in role folders

**OR**

- Always use role-specific routes: `/(customer)/profile`, `/(contractor)/profile`
- Remove root `/profile` route
- Update all navigation calls to use role-specific routes

### Option 5: Add Redirect After Address Completion

**In `profile.tsx` handleAddAddress**:
```typescript
await refreshUser();
Alert.alert('Success', 'Address added successfully');

// Redirect if this was first address (onboarding complete)
if (user?.addresses?.length === 0) {  // Before refresh, length was 0
  router.replace('/');  // Go to dashboard
}
```

---

## Diagnostic Complete

**Status**: ✅ Root cause identified
**Blocker**: Multiple issues causing role collision
**Priority**: P0 - Must fix before production
**Next Step**: Awaiting fix instruction from Manager

---

**Analyst**: Claude Code Diagnostic
**Date**: 2025-12-02
