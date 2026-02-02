# Phase 5: Customer Flow Test Plan Summary

**Source**: `automation/input/customer_flow_tests.csv`
**Generated**: 2025-12-02
**Total Test Steps**: 154 across 12 sections
**Validation Status**: ✅ All paths verified after branding updates

---

## Test Validation Notes

**Recent Changes Verified:**
- ✅ Branding updates (BrandedHeader, splash screen, BrandLogos) → No impact on test validity
- ✅ All route paths exist and are accessible
- ✅ No navigation flow changes
- ✅ No API endpoint changes
- ✅ All screens referenced in tests are present

**Components Updated (Cosmetic Only):**
- `frontend/src/components/BrandedHeader.tsx` - Fixed logo import path
- `frontend/app.json` - Updated splash backgroundColor to #000000
- `frontend/src/brandAssets.ts` - Added BrandLogos export

**Test Validity**: All 154 test steps remain valid. No adjustments needed.

---

## Section 1: ACCOUNT CREATION (11 steps)

### Purpose
Verify customer registration flow from app launch through successful account creation and dashboard landing.

| Step ID | Description | Expected Result | Button Actions | API Calls |
|---------|-------------|-----------------|----------------|-----------|
| A1 | Open App | App loads to role-selection screen | - | - |
| A2 | Select "Customer" Role | Route to customer registration | Tap "Customer" card | - |
| A3 | Enter Email | Email input accepts valid email | - | - |
| A4 | Enter Password | Password input accepts valid password | - | - |
| A5 | Enter First Name | First name input accepts text | - | - |
| A6 | Enter Last Name | Last name input accepts text | - | - |
| A7 | Enter Phone Number | Phone input accepts valid phone | - | - |
| A8 | Submit Registration | POST /api/auth/register returns success | Tap "Register" | POST /api/auth/register |
| A9 | Verify Customer Lands on Dashboard | Customer dashboard loads without error | - | - |
| A10 | AuthContext Loads User | User role recognized = customer | - | GET /api/auth/me |
| A11 | Backend Token Stored | Token saved + user persists on reload | - | - |

---

## Section 2: DASHBOARD (8 steps)

### Purpose
Verify customer dashboard renders correctly with all expected UI elements and navigation works.

| Step ID | Description | Expected Result | Button Actions | API Calls |
|---------|-------------|-----------------|----------------|-----------|
| B1 | Dashboard Renders | Customer dashboard loads | - | - |
| B2 | Greeting Renders | Shows "Welcome back customer_name" | - | - |
| B3 | Name Displays Correctly | user.firstName renders | - | - |
| B4 | Active Jobs Display | Current jobs show in dashboard | - | GET /api/jobs |
| B5 | Request New Job Button Visible | CTA button displays | - | - |
| B6 | Recent Activity Shows | Recent job updates display | - | - |
| B7 | Profile Button Visible | profile icon displays | - | - |
| B8 | Tap "Request New Job" | Navigation to job request flow works | Tap "Request New Job" | - |

---

## Section 3: JOB REQUEST (27 steps)

### Purpose
Verify complete job request flow from address entry through photo upload, description, and submission.

**Routes Tested:**
- `/(customer)/job-request/step0-address`
- `/(customer)/job-request/step1-category`
- `/(customer)/job-request/step2-photos`
- `/(customer)/job-request/step3-describe`

| Step ID | Description | Expected Result | Button Actions | API Calls |
|---------|-------------|-----------------|----------------|-----------|
| C1 | Open Job Request | /(customer)/job-request/step0-address loads | - | - |
| C2 | Step 0 Renders | Address form displays | - | - |
| C3 | Enter Street Address | Address input accepts text | - | - |
| C4 | Enter City | City input accepts text | - | - |
| C5 | Enter State | State dropdown or input works | - | - |
| C6 | Enter Zip Code | Zip input accepts valid zip | - | - |
| C7 | Tap "Next" from Step 0 | Navigation to step1-category works | Tap "Next" | - |
| C8 | Step 1 Renders | Service category selection displays | - | - |
| C9 | View Service Categories | All categories render with icons | - | GET /api/services |
| C10 | Select Service Category | Category selection works | Tap category card | - |
| C11 | Tap "Next" from Step 1 | Navigation to step2-photos works | Tap "Next" | - |
| C12 | Step 2 Renders | Photo upload interface displays | - | - |
| C13 | Tap "Add Photos" | Photo picker opens | Tap "Add Photos" | - |
| C14 | Select Photos from Gallery | Multiple photos can be selected | Select photos | - |
| C15 | Take Photo with Camera | Camera opens and photo captured | Tap camera button | - |
| C16 | Photos Display in Grid | Selected photos render in grid | - | - |
| C17 | Remove Photo | Photo removal works | Tap X on photo | - |
| C18 | Upload Photos | POST /api/photos/upload returns URLs | - | POST /api/photos/upload |
| C19 | Tap "Next" from Step 2 | Navigation to step3-describe works | Tap "Next" | - |
| C20 | Step 3 Renders | Description form displays | - | - |
| C21 | Enter Job Description | Description field accepts text | - | - |
| C22 | Enter Preferred Date | Date picker works | Open date picker | - |
| C23 | Enter Preferred Time | Time picker works | Open time picker | - |
| C24 | Enter Additional Notes | Notes field accepts text | - | - |
| C25 | Submit Job Request | POST /api/jobs returns success | Tap "Submit Request" | POST /api/jobs |
| C26 | Confirmation Screen Shows | Success message or confirmation page loads | - | - |
| C27 | Job Appears in Jobs List | New job displays in customer jobs list | - | GET /api/jobs |

---

## Section 4: JOB STATUS TRACKING (10 steps)

### Purpose
Verify customer can view job list, access job details, and track job progress.

**Routes Tested:**
- `/(customer)/jobs`
- `/(customer)/job-detail/[id]`

| Step ID | Description | Expected Result | Button Actions | API Calls |
|---------|-------------|-----------------|----------------|-----------|
| D1 | Open Jobs List | /(customer)/jobs loads | - | GET /api/jobs |
| D2 | Jobs List Renders | All customer jobs display | - | - |
| D3 | Job Status Badges Show | Status indicators display correctly | - | - |
| D4 | Open Job Detail | /(customer)/job-detail/id loads | Tap job card | GET /api/jobs/:id |
| D5 | Job Details Display | Job info/photos/description render | - | - |
| D6 | Assigned Contractor Shows | Contractor name and photo display (if assigned) | - | - |
| D7 | Job Status Updates Display | Status history or timeline renders | - | - |
| D8 | Contact Contractor Button Works | Contact form or phone link works (if assigned) | Tap "Contact" | - |
| D9 | View Job Photos | Customer uploaded photos display | - | - |
| D10 | View Job Timeline | Job progress timeline renders | - | - |

---

## Section 5: QUOTES (14 steps)

### Purpose
Verify customer can view, accept, and reject contractor quotes.

| Step ID | Description | Expected Result | Button Actions | API Calls |
|---------|-------------|-----------------|----------------|-----------|
| E1 | Contractor Sends Quote | Quote appears in job detail | - | - |
| E2 | Quote Notification Shows | Customer notified of new quote | - | - |
| E3 | View Quote Details | Quote amount and breakdown display | - | GET /api/quotes/:id |
| E4 | Review Quote Line Items | Materials and labor costs show | - | - |
| E5 | Accept Quote Button Visible | Accept CTA displays | - | - |
| E6 | Reject Quote Button Visible | Reject CTA displays | - | - |
| E7 | Tap "Accept Quote" | Accept confirmation modal opens | Tap "Accept Quote" | - |
| E8 | Confirm Quote Acceptance | PUT /api/quotes/id/accept returns success | Tap "Confirm" | PUT /api/quotes/:id/accept |
| E9 | Quote Status Updates to Accepted | Status badge updates | - | - |
| E10 | Job Moves to Scheduled | Job status advances | - | - |
| E11 | Tap "Reject Quote" | Rejection form opens | Tap "Reject Quote" | - |
| E12 | Enter Rejection Reason | Reason field accepts text | - | - |
| E13 | Submit Quote Rejection | PUT /api/quotes/id/reject returns success | Tap "Submit" | PUT /api/quotes/:id/reject |
| E14 | Quote Status Updates to Rejected | Status badge updates | - | - |

---

## Section 6: PAYMENTS (11 steps)

### Purpose
Verify customer payment flow including viewing breakdown, entering payment details, and viewing receipt.

| Step ID | Description | Expected Result | Button Actions | API Calls |
|---------|-------------|-----------------|----------------|-----------|
| F1 | Job Completed by Contractor | Payment prompt appears | - | - |
| F2 | View Payment Amount | Total amount due displays | - | - |
| F3 | Payment Breakdown Shows | Materials/Labor/Taxes itemized | - | - |
| F4 | Payment Method Selection | Card/Bank options display | - | - |
| F5 | Enter Card Details | Card form accepts valid card info | - | - |
| F6 | Submit Payment | POST /api/payments returns success | Tap "Pay Now" | POST /api/payments |
| F7 | Payment Confirmation Shows | Success message displays | - | - |
| F8 | Receipt Available | Receipt can be viewed or downloaded | Tap "View Receipt" | - |
| F9 | Job Status Updates to Paid | Job marked as complete and paid | - | - |
| F10 | View Payment History | Payment history screen loads | - | GET /api/payments |
| F11 | Previous Payments Display | All past payments render | - | - |

---

## Section 7: RATINGS (7 steps)

### Purpose
Verify customer can rate contractor and submit review after job completion.

| Step ID | Description | Expected Result | Button Actions | API Calls |
|---------|-------------|-----------------|----------------|-----------|
| G1 | Job Marked Complete | Rating prompt appears | - | - |
| G2 | Star Rating Display | 1-5 star selector renders | - | - |
| G3 | Select Star Rating | Rating selection works | Tap stars | - |
| G4 | Enter Review Text | Review field accepts text | - | - |
| G5 | Submit Rating | POST /api/jobs/id/rate returns success | Tap "Submit Review" | POST /api/jobs/:id/rate |
| G6 | Rating Confirmation Shows | Thank you message displays | - | - |
| G7 | Contractor Rating Updates | Contractor stats reflect new rating | - | - |

---

## Section 8: WARRANTY (13 steps)

### Purpose
Verify customer warranty request flow and status tracking.

**Routes Tested:**
- `/(customer)/warranty/request/[jobId]`
- `/(customer)/warranty/status/[jobId]`

| Step ID | Description | Expected Result | Button Actions | API Calls |
|---------|-------------|-----------------|----------------|-----------|
| H1 | View Completed Job | Completed job detail loads | - | - |
| H2 | Request Warranty Button Visible | Warranty CTA displays | - | - |
| H3 | Tap "Request Warranty" | Navigation to warranty request works | Tap "Request Warranty" | - |
| H4 | Warranty Request Form Loads | /(customer)/warranty/request/jobId loads | - | - |
| H5 | Enter Warranty Description | Description field accepts text | - | - |
| H6 | Attach Warranty Photos | Photo upload works (max 5 photos) | Tap "Add Photos" | POST /api/photos/upload |
| H7 | Submit Warranty Request | POST /api/warranties returns success | Tap "Submit Request" | POST /api/warranties |
| H8 | Warranty Status Shows Pending | New warranty displays as pending | - | - |
| H9 | View Warranty Status | /(customer)/warranty/status/jobId loads | - | GET /api/warranties/:id |
| H10 | Warranty Details Display | Request info and photos render | - | - |
| H11 | Contractor Approves Warranty | Warranty status updates to approved | - | - |
| H12 | Contractor Denies Warranty | Warranty status updates to denied | - | - |
| H13 | View Contractor Notes | Approval or denial notes display | - | - |

---

## Section 9: CHANGE ORDERS (16 steps)

### Purpose
Verify customer can view, approve, and reject contractor change orders.

**Routes Tested:**
- `/(customer)/change-order/[changeOrderId]`

| Step ID | Description | Expected Result | Button Actions | API Calls |
|---------|-------------|-----------------|----------------|-----------|
| I1 | Contractor Creates Change Order | Change order appears in job detail | - | - |
| I2 | Change Order Notification Shows | Customer notified of change order | - | - |
| I3 | View Change Order Details | /(customer)/change-order/changeOrderId loads | Tap change order | GET /api/change-orders/:id |
| I4 | Change Order Cost Displays | Additional cost or credit shows | - | - |
| I5 | Change Order Hours Display | Additional hours show | - | - |
| I6 | Change Order Description Shows | Description and reason render | - | - |
| I7 | Change Order Photos Display | Contractor photos render (if any) | - | - |
| I8 | Approve Change Order Button Visible | Approve CTA displays | - | - |
| I9 | Reject Change Order Button Visible | Reject CTA displays | - | - |
| I10 | Tap "Approve Change Order" | Approval confirmation modal opens | Tap "Approve" | - |
| I11 | Confirm Change Order Approval | PUT /api/change-orders/id/approve returns success | Tap "Confirm" | PUT /api/change-orders/:id/approve |
| I12 | Change Order Status Updates to Approved | Status badge updates | - | - |
| I13 | Tap "Reject Change Order" | Rejection form opens | Tap "Reject" | - |
| I14 | Enter Rejection Notes | Notes field accepts text | - | - |
| I15 | Submit Change Order Rejection | PUT /api/change-orders/id/reject returns success | Tap "Submit" | PUT /api/change-orders/:id/reject |
| I16 | Change Order Status Updates to Rejected | Status badge updates | - | - |

---

## Section 10: PROFILE (16 steps)

### Purpose
Verify customer profile management including updating contact info, address, and profile photo.

**Routes Tested:**
- `/(customer)/profile`

| Step ID | Description | Expected Result | Button Actions | API Calls |
|---------|-------------|-----------------|----------------|-----------|
| J1 | Open Profile | /(customer)/profile loads | - | GET /api/profile |
| J2 | Profile Data Displays | Name/Email/Phone/Address render | - | - |
| J3 | Update Phone Number | Input accepts new phone number | - | - |
| J4 | Save Phone Number | PUT /api/profile returns success | Tap "Save" | PUT /api/profile |
| J5 | Phone Persists on Reload | Updated phone displays after refresh | - | - |
| J6 | Update Email | Input accepts new email | - | - |
| J7 | Save Email | PUT /api/profile returns success | Tap "Save" | PUT /api/profile |
| J8 | Email Persists on Reload | Updated email displays after refresh | - | - |
| J9 | Update Primary Address | Address form accepts new address | - | - |
| J10 | Save Address | PUT /api/profile/address returns success | Tap "Save" | PUT /api/profile/address |
| J11 | Address Persists on Reload | Updated address displays after refresh | - | - |
| J12 | Upload Profile Photo | Photo picker opens | Tap photo | - |
| J13 | Select Profile Photo | Image selected from gallery or camera | Select photo | - |
| J14 | Save Profile Photo | POST /api/photos/upload returns URL | - | POST /api/photos/upload |
| J15 | Photo Displays in Profile | New photo renders in profile | - | - |
| J16 | Photo Persists on Reload | Photo displays after refresh | - | - |

---

## Section 11: AUTH (10 steps)

### Purpose
Verify authentication flow including login, logout, token refresh, and password reset.

| Step ID | Description | Expected Result | Button Actions | API Calls |
|---------|-------------|-----------------|----------------|-----------|
| K1 | Logout Works | User returned to login screen | Tap "Logout" | - |
| K2 | Token Cleared on Logout | Storage cleared successfully | - | - |
| K3 | Login Works | User authenticated successfully | Tap "Login" | POST /api/auth/login |
| K4 | Login Token Stored | POST /api/auth/login returns tokens | - | - |
| K5 | Token Loads on Fresh Boot | User persists through reload | - | GET /api/auth/me |
| K6 | Role Loaded Correctly | Customer role applied correctly | - | - |
| K7 | Invalid Login Rejected | Error message shows for bad credentials | Tap "Login" | POST /api/auth/login |
| K8 | Token Refresh Works | Refresh token successfully renews access token | - | POST /api/auth/refresh |
| K9 | Forgot Password Link Works | Password reset flow initiates | Tap "Forgot Password" | - |
| K10 | Reset Password Email Sent | Email received with reset link | Tap "Send Reset Email" | POST /api/auth/forgot-password |

---

## Section 12: SETTINGS (11 steps)

### Purpose
Verify settings screen functionality including notification preferences, legal pages, and account deletion.

| Step ID | Description | Expected Result | Button Actions | API Calls |
|---------|-------------|-----------------|----------------|-----------|
| L1 | Open Settings Screen | Settings screen loads | - | - |
| L2 | Notification Preferences Display | Notification toggles render | - | - |
| L3 | Update Notification Settings | Toggle changes save | Toggle switch | PUT /api/profile/settings |
| L4 | Email Notifications Toggle | Email notification setting works | Toggle email | - |
| L5 | SMS Notifications Toggle | SMS notification setting works | Toggle SMS | - |
| L6 | View Terms of Service | Terms page loads or modal opens | Tap "Terms of Service" | - |
| L7 | View Privacy Policy | Privacy policy loads or modal opens | Tap "Privacy Policy" | - |
| L8 | Contact Support | Support form or link works | Tap "Contact Support" | - |
| L9 | App Version Displays | Version number shows correctly | - | - |
| L10 | Delete Account Option | Account deletion option visible | - | - |
| L11 | Confirm Account Deletion | Deletion confirmation modal works | Tap "Delete Account" | DELETE /api/profile |

---

## Summary Statistics

| Section | Steps | API Calls | Button Actions |
|---------|-------|-----------|----------------|
| ACCOUNT CREATION | 11 | 2 | 2 |
| DASHBOARD | 8 | 1 | 1 |
| JOB REQUEST | 27 | 3 | 9 |
| JOB STATUS TRACKING | 10 | 2 | 2 |
| QUOTES | 14 | 4 | 4 |
| PAYMENTS | 11 | 2 | 3 |
| RATINGS | 7 | 1 | 2 |
| WARRANTY | 13 | 3 | 3 |
| CHANGE ORDERS | 16 | 4 | 5 |
| PROFILE | 16 | 5 | 4 |
| AUTH | 10 | 5 | 4 |
| SETTINGS | 11 | 2 | 5 |
| **TOTAL** | **154** | **34** | **44** |

---

## Next Steps

1. ✅ Test plan parsed and validated
2. ⏳ Execute tests manually or via automation framework
3. ⏳ Document results in Completed (Y/N) column
4. ⏳ Generate issues CSV for any failing tests
5. ⏳ Address issues and re-test

**Status**: Ready for Phase 5 execution.
