# Contractor Registration & Annual Renewal System

## Overview
Implement comprehensive contractor registration management system with annual renewal requirements, active job exemptions, and enhanced navigation capabilities.

## Priority
**HIGH** - Required for production launch

## Requirements

### 1. Test Contractor Account
**Description**: Create test credentials for contractor dashboard testing and development.

**Acceptance Criteria**:
- [ ] Test contractor created with email: contractor@test.com
- [ ] Password: TestContractor123!
- [ ] Role: TECHNICIAN
- [ ] Status: ACTIVE with complete registration
- [ ] Pre-populated with sample data (skills, service areas, documents)

**Implementation**:
- Run `python backend/create_test_contractor.py`

---

### 2. Contractor Registration Navigation
**Description**: Make contractor registration steps clickable and allow contractors to edit their profile after initial completion.

**Acceptance Criteria**:
- [ ] Step indicator buttons are clickable (not just visual)
- [ ] Clicking a step navigates to that registration step
- [ ] Contractors can navigate back and forth between steps
- [ ] "Edit Profile" button in contractor dashboard
- [ ] "Update Registration" option accessible from contractor menu
- [ ] Form fields pre-populated with existing data when editing
- [ ] Save draft functionality for incomplete edits

**Files to Modify**:
- `frontend/src/components/StepIndicator.tsx` - Add onPress handlers
- `frontend/app/auth/contractor/register-step*.tsx` - Handle navigation
- `frontend/app/(contractor)/dashboard.tsx` - Add Edit Profile button
- `frontend/app/(contractor)/profile.tsx` - Create or update profile page

---

### 3. Annual Registration Renewal System
**Description**: Implement automatic registration expiration tracking, notifications, and renewal workflow.

#### 3.1 Business Rules

**Annual Renewal**:
- Contractor registration expires 365 days after completion
- All documents must be re-uploaded during renewal
- Registration status tracked: ACTIVE | EXPIRING_SOON | EXPIRED | GRACE_PERIOD

**Notification Schedule**:
- 30 days before expiration → "EXPIRING_SOON" warning
- 7 days before expiration → Urgent warning
- On expiration day → Expiration notification

**Active Jobs Exemption**:
- Contractors with active jobs (IN_PROGRESS, SCHEDULED, PENDING) are exempt from immediate deactivation
- Exempted contractors enter 30-day grace period after expiration
- Can continue working on existing jobs but cannot accept new jobs
- Must renew within grace period or account becomes inactive

**Job Acceptance Rules**:
- ACTIVE status → Can accept new jobs ✅
- EXPIRING_SOON status → Can accept new jobs ✅
- EXPIRED status (no active jobs) → Cannot accept new jobs ❌
- EXPIRED status (with active jobs, in grace period) → Cannot accept new jobs ❌
- GRACE_PERIOD expired → Account inactive, cannot work ❌

#### 3.2 Database Schema Changes

**Users Collection (TECHNICIAN role)**:
```javascript
{
  id: String,
  email: String,
  role: "TECHNICIAN",

  // NEW FIELDS:
  registration_completed_date: ISODate,
  registration_expiration_date: ISODate,
  registration_status: "ACTIVE" | "EXPIRING_SOON" | "EXPIRED" | "GRACE_PERIOD",
  last_renewal_date: ISODate | null,
  renewal_notifications_sent: {
    thirty_day: Boolean,
    seven_day: Boolean,
    expiration: Boolean
  },
  grace_period_start: ISODate | null,
  grace_period_end: ISODate | null
}
```

**Jobs Collection (NEW)**:
```javascript
{
  id: String,
  contractor_id: String,
  customer_id: String,
  quote_id: String,
  status: "PENDING" | "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED",
  scheduled_date: ISODate,
  completed_date: ISODate | null,
  created_at: ISODate,
  updated_at: ISODate
}
```

#### 3.3 Backend Requirements

**New Endpoints**:

1. `GET /api/contractors/registration-status`
   - Returns current registration status
   - Response: `{ status, expiration_date, days_until_expiration, has_active_jobs, in_grace_period }`

2. `POST /api/contractors/renew-registration`
   - Initiates renewal process
   - Updates expiration date to +365 days
   - Resets notification flags
   - Returns: `{ success, new_expiration_date }`

3. `GET /api/contractors/active-jobs`
   - Returns active jobs count and details
   - Filters: IN_PROGRESS, SCHEDULED, PENDING
   - Response: `{ count, jobs: [...] }`

4. `POST /api/contractors/check-can-accept-job`
   - Business logic to determine if contractor can accept new jobs
   - Checks registration status and expiration
   - Response: `{ can_accept, reason }`

**Scheduled Tasks** (Cron Jobs or Background Workers):

1. **Daily Expiration Check** (runs at 2 AM UTC)
   - Query contractors with expiration dates in next 30 days
   - Update status to EXPIRING_SOON
   - Send 30-day notification email if not sent

2. **Daily Urgent Check** (runs at 2 AM UTC)
   - Query contractors with expiration dates in next 7 days
   - Send 7-day urgent notification if not sent

3. **Daily Expired Check** (runs at 2 AM UTC)
   - Query contractors with expiration date < today
   - Check for active jobs
   - If no active jobs: Set status to EXPIRED, set is_active=False
   - If active jobs: Set status to GRACE_PERIOD, set grace_period_end to +30 days

4. **Daily Grace Period Check** (runs at 2 AM UTC)
   - Query contractors in GRACE_PERIOD with grace_period_end < today
   - Set is_active=False, send final notification

**Files to Create/Modify**:
- `backend/models/job.py` - Create Job model
- `backend/models/user.py` - Add registration fields
- `backend/server.py` - Add contractor endpoints
- `backend/services/contractor_service.py` - Business logic
- `backend/tasks/registration_renewal.py` - Scheduled tasks

#### 3.4 Frontend Requirements

**Dashboard Updates** (`frontend/app/(contractor)/dashboard.tsx`):
- Display registration status badge
- Show expiration date
- Warning banner for EXPIRING_SOON (yellow, < 30 days)
- Urgent banner for EXPIRED or GRACE_PERIOD (red)
- "Renew Registration" button in banner
- Days remaining counter

**Profile Page** (`frontend/app/(contractor)/profile.tsx`):
- Registration history section
- Current status display
- Renewal button
- Document re-upload interface
- Shows current documents with timestamps

**Registration Flow Updates** (`frontend/app/auth/contractor/register-step*.tsx`):
- Pre-fill forms with existing data during renewal
- Show "existing document" vs "new upload" for document steps
- Allow skipping document upload if renewing and no changes
- Confirmation screen shows what was updated

**Navigation Updates**:
- Step indicator clickable
- Back/Next navigation between steps
- Progress saved automatically

#### 3.5 Email Notifications

**30-Day Warning**:
```
Subject: Your Registration Expires in 30 Days

Hi [First Name],

Your contractor registration with The Real Johnson Handyman Services will expire on [Expiration Date].

Please renew your registration before it expires to continue accepting new jobs.

[Renew Registration Button]
```

**7-Day Urgent Warning**:
```
Subject: URGENT: Registration Expires in 7 Days

Hi [First Name],

This is an urgent reminder that your contractor registration expires in 7 days on [Expiration Date].

Renew now to avoid service interruption.

[Renew Registration Button]
```

**Expiration Notice**:
```
Subject: Registration Expired - Action Required

Hi [First Name],

Your contractor registration has expired as of [Expiration Date].

[If active jobs]: You may continue working on your current jobs, but you cannot accept new jobs. You have 30 days to renew your registration.

[If no active jobs]: Your account has been deactivated. Please renew your registration to continue working.

[Renew Registration Button]
```

---

## Testing Checklist

### Manual Testing
- [ ] Create test contractor with script
- [ ] Log in as contractor@test.com
- [ ] Verify dashboard displays registration status
- [ ] Click step indicator buttons (verify navigation)
- [ ] Edit profile and verify changes saved
- [ ] Create test contractor expiring in 29 days (verify warning)
- [ ] Create test contractor expiring in 6 days (verify urgent warning)
- [ ] Create test contractor with expired registration + active jobs (verify grace period)
- [ ] Create test contractor with expired registration + no jobs (verify inactive)
- [ ] Attempt to accept job as expired contractor (verify blocked)
- [ ] Renew registration and verify new expiration date

### Automated Testing
- [ ] Unit tests for registration status calculation
- [ ] Unit tests for grace period logic
- [ ] Unit tests for can_accept_job business logic
- [ ] Integration tests for renewal endpoints
- [ ] Mock scheduled tasks and verify behavior

---

## Implementation Order

### Phase 1: Test Account & Navigation (Immediate)
1. ✅ Create test contractor script
2. Run script to create test account
3. Make step indicator clickable
4. Add Edit Profile button to dashboard
5. Test navigation flow

### Phase 2: Database & Backend (Week 1)
1. Update user model with registration fields
2. Create jobs model
3. Implement contractor endpoints
4. Add business logic for job acceptance
5. Write unit tests

### Phase 3: Frontend UI (Week 1)
1. Add registration status to dashboard
2. Create warning banners
3. Update profile page with renewal UI
4. Pre-fill registration forms
5. Add days remaining counter

### Phase 4: Scheduled Tasks (Week 2)
1. Implement daily expiration checks
2. Implement notification system
3. Implement grace period logic
4. Test scheduled tasks
5. Deploy to production with monitoring

### Phase 5: Testing & Documentation (Week 2)
1. Create test scenarios
2. Manual QA testing
3. Fix bugs
4. Update documentation
5. Production launch

---

## Related Files

**Backend**:
- `backend/models/user.py`
- `backend/models/job.py` (new)
- `backend/server.py`
- `backend/services/contractor_service.py` (new)
- `backend/tasks/registration_renewal.py` (new)
- `backend/create_test_contractor.py` (new)

**Frontend**:
- `frontend/app/(contractor)/dashboard.tsx`
- `frontend/app/(contractor)/profile.tsx`
- `frontend/app/auth/contractor/register-step1.tsx`
- `frontend/app/auth/contractor/register-step2.tsx`
- `frontend/app/auth/contractor/register-step3.tsx`
- `frontend/app/auth/contractor/register-step4.tsx`
- `frontend/src/components/StepIndicator.tsx`

**Documentation**:
- `CLAUDE.md` - Updated with requirements
- `.github/CONTRACTOR_REGISTRATION_SYSTEM.md` - This file

---

## Questions for Product Owner

1. Should expired contractors with active jobs be able to message customers?
2. What happens to customer quotes if contractor expires mid-quote?
3. Should we allow partial document renewal (e.g., just insurance)?
4. Renewal fee amount and payment processing?
5. How to handle contractors who don't respond to notifications?
6. Should we auto-cancel scheduled jobs if contractor expires in grace period?

---

## Success Criteria

- [ ] Test contractor account created and working
- [ ] Contractors can navigate registration steps freely
- [ ] Contractors can edit profile after completion
- [ ] Registration status accurately tracked
- [ ] Notifications sent at correct intervals
- [ ] Expired contractors cannot accept new jobs
- [ ] Active job exemption works correctly
- [ ] Grace period logic functions as designed
- [ ] All tests passing
- [ ] Documentation complete
