# Manual Test Plan - Registration & Profile Systems

**Test Date:**  7:00 PM 12/10/2025
**Tester:** _Joshua_
**Build Version:** dev branch (latest)

---

## Test Environment Setup

1. **Start Frontend:**
   ```bash
   cd frontend
   npx expo start --clear
   ```

2. **Start Backend:**
   ```bash
   cd backend
   ../venv/Scripts/python.exe -m uvicorn server
   :app --reload
   ```

3. **Clear App Data:** Delete app and reinstall to test fresh registration flows

---

## Test Suite 1: Customer Registration → Quote Flow

### TC-1.1: Customer Registration with Address
**Route:** `/auth/register`

**Steps:**
1. Open registration screen
2. Enter email: `test.customer@example.com`
3. Enter password: `TestPass123!`
4. Enter first name: `John`
5. Enter last name: `Doe`
6. Enter phone: `555-123-4567`
7. **Address Section:**
   - Street: `123 Main St`
   - Unit: `Apt 4B` (optional)
   - City: `Springfield`
   - State: Select `IL` from dropdown
   - ZIP: `62701`
8. Tap "Create Account"

**Expected Results:**
- ✅ No TypeScript errors in console
- ✅ Address dropdown shows all 50 states + DC + PR
- ✅ Registration succeeds
- ✅ Redirects to `/quote/request` (quote onboarding)
- ✅ Address is saved to user profile

**Actual Results:** Immediatly went to "unmatched route" Dissappointing. but the UI was perfect and when passwords didn't match, it wasn't a Conf Box. That was great. 


---

### TC-1.2: Quote Request Flow
**Route:** `/quote/request` (after registration)

**Steps:**
1. Verify quote request form loads
2. Enter job description
3. Upload at least 1 photo
4. Select service category
5. Submit quote request

**Expected Results:**
- ✅ Form displays with all fields
- ✅ Photo upload works
- ✅ Submit succeeds
- ✅ Redirects to customer dashboard

**Actual Results:** _______________________________________________

---

## Test Suite 2: Handyman Registration (Multi-Step)

### TC-2.1: Handyman Registration Step 1
**Route:** `/auth/handyman/register-step1`

**Steps:**
1. Open handyman registration step 1
2. Enter email: `handyman.test@example.com`
3. Enter password: `TestPass123!`
4. Enter first name: `Mike`
5. Enter last name: `Builder`
6. Enter phone: `555-987-6543`
7. Tap "Next"

**Expected Results:**
- ✅ No console errors
- ✅ Form validation works
- ✅ Advances to step 2

**Actual Results:** __Page requests "business name. There should be no business name. Also, phone number should format correctly after input. Conf box appeats at press of "Continue" Says "Alert [object Object]. Reg failed.

---

### TC-2.2: Handyman Registration Step 2 
**Route:** `/auth/handyman/register-step2`

**Steps:**
1. Enter business name: `Builder's Best LLC`
2. Enter years of experience: `10`
3. Select at least 2 skills from list
4. Enter service areas (cities/zips)
5. **Business Address:**
   - Street: `456 Commerce Dr`
   - City: `Springfield`
   - State: `IL`
   - ZIP: `62702`
6. Tap "Complete Registration"

**Expected Results:**
- ✅ Business address form works
- ✅ State dropdown includes DC + PR
- ✅ Registration completes
- ✅ Account created with role=handyman
- ✅ Redirects to handyman dashboard

**Actual Results:** ____Unable to due to reg failure.

---
Testing stopped due to complete failure. 

## Test Suite 3: Customer Profile Photo Update

### TC-3.1: Profile Photo Upload
**Route:** `/customer/profile/edit`

**Prerequisites:** Logged in as customer

**Steps:**
1. Navigate to customer profile
2. Tap "Edit Profile" button
3. Tap profile photo placeholder
4. Select "Choose from Library"
5. Pick an image
6. Verify preview appears
7. Tap "Save"

**Expected Results:**
- ✅ Image picker opens
- ✅ Selected image displays in preview
- ✅ Save uploads image
- ✅ Profile updates with new photo
- ✅ Returns to profile view
- ✅ Photo persists after refresh

**Actual Results:** _______________________________________________

---

## Test Suite 4: Address Verification

### TC-4.1: Address Verification Button (Customer Profile)
**Route:** `/customer/profile`

**Prerequisites:** Logged in as customer with address on file

**Steps:**
1. Open customer profile
2. Locate address display section
3. Tap "Verify Address" button
4. Wait for verification response

**Expected Results:**
- ✅ Button displays
- ✅ Button shows loading state during verification
- ✅ API call to `/address/verify` succeeds
- ✅ Success/failure alert displays
- ✅ Verification status updates in profile

**Actual Results:** _______________________________________________

---

### TC-4.2: Address Verification (Handyman Profile)
**Route:** `/handyman/profile` (after editing address)

**Prerequisites:** Logged in as handyman

**Steps:**
1. Open handyman profile
2. Edit business address
3. Tap "Verify Address" button

**Expected Results:**
- ✅ Same behavior as customer verification
- ✅ Business address can be verified

**Actual Results:** _______________________________________________

---

## Test Suite 5: Login/Logout (Both Roles)

### TC-5.1: Customer Login
**Route:** `/auth/login`

**Steps:**
1. Log out if currently logged in
2. Open login screen
3. Enter customer email
4. Enter password
5. Tap "Log In"

**Expected Results:**
- ✅ Login succeeds
- ✅ Redirects to `/customer/dashboard`
- ✅ Bottom nav shows customer tabs
- ✅ Profile shows customer-only fields

**Actual Results:** _______________________________________________

---

### TC-5.2: Customer Logout
**Route:** Any customer screen

**Steps:**
1. While logged in as customer
2. Navigate to profile or settings
3. Tap "Logout" button
4. Confirm logout

**Expected Results:**
- ✅ Logout confirmation prompt appears
- ✅ User logged out
- ✅ Redirects to login screen
- ✅ Cannot access protected routes

**Actual Results:** _______________________________________________

---

### TC-5.3: Handyman Login
**Route:** `/auth/login`

**Steps:**
1. Open login screen
2. Enter handyman email
3. Enter password
4. Tap "Log In"

**Expected Results:**
- ✅ Login succeeds
- ✅ Redirects to `/handyman/dashboard`
- ✅ Bottom nav shows handyman tabs
- ✅ Profile shows business fields

**Actual Results:** _______________________________________________

---

### TC-5.4: Handyman Logout
**Route:** Any handyman screen

**Steps:**
1. While logged in as handyman
2. Navigate to profile or settings
3. Tap "Logout" button
4. Confirm logout

**Expected Results:**
- ✅ Logout confirmation prompt appears
- ✅ User logged out
- ✅ Redirects to login screen
- ✅ Cannot access protected routes

**Actual Results:** _______________________________________________

---

## Test Suite 6: State Picker Validation

### TC-6.1: State Dropdown (All Address Forms)

**Test Locations:**
- `/auth/register` (customer address)
- `/auth/handyman/register-step2` (business address)
- `/customer/profile/edit` (edit address)
- `/handyman/profile` (edit business address)

**Steps:**
1. Open any address form
2. Tap "State" dropdown
3. Scroll through entire list

**Expected Results:**
- ✅ Modal opens with scrollable list
- ✅ Contains all 50 states
- ✅ Contains "District of Columbia" (DC)
- ✅ Contains "Puerto Rico" (PR)
- ✅ Total: 52 options
- ✅ Selecting state closes modal
- ✅ Selected state displays correctly

**Actual Results:** _______________________________________________

---

## Critical Verification Checklist

After running all tests above, verify:

- [ ] Zero TypeScript compilation errors
- [ ] Zero runtime console errors on startup
- [ ] All registration flows complete end-to-end
- [ ] Address forms work across all screens
- [ ] State picker includes DC + PR
- [ ] Photo upload works
- [ ] Address verification button functions
- [ ] Login/logout works for both roles
- [ ] Role-based routing enforced (customer ≠ handyman screens)

---

## Known Issues / Notes

_Document any bugs, warnings, or unexpected behavior here:_

_______________________________________________
_______________________________________________
_______________________________________________

---

**Test Completion Signature:** _______________ **Date:** _______________
