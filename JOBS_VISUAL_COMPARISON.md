# Visual Comparison: Quote Request → Job Request

## UI Text Changes

### Page Header
```diff
- Request Quote
+ Create Job Request
```

### Section Titles
```diff
- Describe the issue
+ Describe the work needed
```

### Helper Text
```diff
- Photos help us provide more accurate estimates
+ Photos help contractors understand your project better
```

### Submit Button
```diff
- Get AI-Powered Quote  ⚡
+ Submit Job Request    🔨
```

### Submit Note
```diff
- You'll receive an AI-generated estimate in minutes. Our team will review and send the final quote within 24-48 hours.
+ We'll match you with an available contractor and send you updates within 24 hours.
```

### Success Message
```diff
- Title: Quote Generated!
- Message: Your quote has been generated. Estimated total: $450.
-          This is a preliminary AI-generated estimate. Our team will review and send the final quote within 24-48 hours.
- Buttons: [View Quotes] [OK]

+ Title: Job Request Submitted!
+ Message: Your job request has been submitted successfully. Job ID: abc-123.
+          We'll match you with an available contractor and send you updates soon.
+ Buttons: [View Jobs] [OK]
```

---

## Data Flow Changes

### OLD Flow (Quotes)
```
User Input (Form)
    ↓
quotesAPI.requestQuote()
    ↓
POST /api/quotes/request
    ↓
{
  service_category: "drywall",
  address_id: "addr-123",
  description: "Need hole patched",
  photos: ["url1", "url2"],
  preferred_dates: [],
  budget_range: { min: 0, max: 500 },
  urgency: "normal"
}
    ↓
Response: {
  quote_id: "quote-456",
  estimated_total: 450,
  status: "DRAFT"
}
    ↓
Alert: "Quote Generated!"
```

### NEW Flow (Jobs)
```
User Input (Form)
    ↓
jobsAPI.createJob()
    ↓
POST /api/jobs
    ↓
{
  service_category: "drywall",
  address_id: "addr-123",
  description: "Need hole patched",
  photos: ["url1", "url2"],
  preferred_dates: [],
  budget_min: 0,
  budget_max: 500,
  urgency: "normal",
  source: "app",        ← NEW
  status: "requested"   ← NEW
}
    ↓
Response: {
  job_id: "job-789",
  status: "requested",
  estimated_total: 450,
  created_at: "2025-11-16T10:30:00Z"
}
    ↓
Alert: "Job Request Submitted!"
```

---

## API Changes

### Request Payload Diff
```diff
{
  service_category: "drywall",
  address_id: "addr-123",
  description: "Need hole patched",
  photos: ["url1", "url2"],
  preferred_dates: [],
- budget_range: {
-   min: 0,
-   max: 500
- },
+ budget_min: 0,
+ budget_max: 500,
  urgency: "normal",
+ source: "app",
+ status: "requested"
}
```

### Response Payload Diff
```diff
{
- quote_id: "quote-456",
+ job_id: "job-789",
+ status: "requested",
  estimated_total: 450,
+ created_at: "2025-11-16T10:30:00Z"
}
```

---

## User Journey Comparison

### OLD Journey (Quote-Based)
1. User selects service → "Request Quote" screen
2. Fills form → "Get AI-Powered Quote" button
3. Sees "Quote Generated!" → Estimated total shown
4. Reads "AI-generated estimate, team will review in 24-48 hours"
5. **Mental model**: "I requested a quote, now I wait for a response"
6. **Expectation**: Will receive email with final quote
7. **Action**: Check email for quote, accept/reject

### NEW Journey (Job-Based)
1. User selects service → "Create Job Request" screen
2. Fills form → "Submit Job Request" button
3. Sees "Job Request Submitted!" → Job ID shown
4. Reads "We'll match you with contractor, updates in 24 hours"
5. **Mental model**: "I created a job, now it's being matched"
6. **Expectation**: Will be matched with contractor
7. **Action**: Wait for status updates (claimed → scheduled → completed)

---

## Emotional Impact

### OLD (Quote)
- **Feeling**: Passive, waiting for approval
- **Language**: "Request", "estimate", "preliminary", "review"
- **Uncertainty**: "AI-generated" + "team will review" = two-step process
- **Timeline**: "24-48 hours" feels slow
- **Outcome**: Unclear what happens after quote

### NEW (Job)
- **Feeling**: Active, job is in progress
- **Language**: "Create", "submit", "match", "contractor"
- **Certainty**: Clear single-step process
- **Timeline**: "24 hours" feels faster
- **Outcome**: Clear next step (contractor match)

---

## Technical Architecture

### Frontend Structure
```
Frontend (React Native)
│
├─ app/quote/request.tsx          ← Modified (terminology only)
│  └─ JobRequestScreen()          ← Renamed from QuoteRequestScreen
│     └─ JobRequestForm           ← Renamed from QuoteRequestForm
│        ├─ Service Selection    (unchanged)
│        ├─ Description Input    (title changed)
│        ├─ Photo Upload         (description changed)
│        ├─ Urgency Selection    (unchanged)
│        ├─ Budget Input         (unchanged)
│        └─ Submit Button        (text + icon changed)
│
└─ src/services/api.ts            ← Modified (added jobsAPI)
   ├─ jobsAPI                     ← NEW
   │  ├─ createJob()             ← NEW (POST /api/jobs)
   │  ├─ getJobs()               ← NEW
   │  ├─ getJob()                ← NEW
   │  ├─ updateJobStatus()       ← NEW
   │  └─ cancelJob()             ← NEW
   └─ quotesAPI                   (unchanged)
      ├─ requestQuote()
      ├─ getQuotes()
      ├─ uploadPhotoImmediate()  (still used for jobs!)
      └─ respondToQuote()
```

### Backend Requirements
```
Backend (FastAPI + MongoDB)
│
├─ POST /api/jobs                 ← NEEDS IMPLEMENTATION
│  ├─ Validate request payload
│  ├─ Create job in MongoDB
│  ├─ Calculate estimated_total
│  ├─ Trigger notifications:
│  │  ├─ Email to customer (confirmation)
│  │  ├─ SMS to customer (optional)
│  │  └─ Email to admin (new job alert)
│  └─ Return job details
│
├─ GET /api/jobs                  ← FUTURE
│  └─ List customer's jobs
│
├─ GET /api/jobs/:id              ← FUTURE
│  └─ Get single job details
│
└─ MongoDB: jobs collection       ✅ ALREADY EXISTS
   └─ Indexes already created
```

---

## Code Size Impact

### Lines Modified
- `frontend/app/quote/request.tsx`: ~15 lines changed (out of 963)
  - Interface name: 1 line
  - Component name: 1 line
  - Page title: 1 line
  - Section titles: 2 lines
  - Submit button: 3 lines
  - Submit note: 1 line
  - Success alert: 4 lines
  - Request payload: 2 lines

- `frontend/src/services/api.ts`: ~30 lines added (out of 387)
  - New jobsAPI object: 30 lines
  - No lines removed

### Bundle Size Impact
- Negligible (< 1KB increase)
- jobsAPI adds ~30 lines of code
- No new dependencies
- No new components

---

## User-Facing Changes Summary

### What Users Will Notice
1. Page title changed from "Request Quote" to "Create Job Request"
2. Button text changed from "Get AI-Powered Quote" to "Submit Job Request"
3. Button icon changed from lightning bolt to hammer
4. Success message now says "Job Request Submitted" instead of "Quote Generated"
5. Helper text now mentions "contractors" instead of "estimates"

### What Users Won't Notice
1. Form fields are identical
2. Photo upload works the same
3. Service categories are the same
4. Validation is the same
5. Error handling is the same
6. Navigation is the same

---

## Migration Strategy

### Phase 1: Dual Support (Current)
- Frontend supports both `quotesAPI` and `jobsAPI`
- Old quote flow still works
- New job flow ready but needs backend
- **Status**: ✅ Complete

### Phase 2: Backend Implementation
- Create POST `/api/jobs` endpoint
- Test with frontend
- Add notification triggers
- **Status**: 🔴 Not Started

### Phase 3: Full Switchover
- All new requests use jobs flow
- Quote flow deprecated (or renamed to legacy)
- Update navigation to show "Jobs" instead of "Quotes"
- **Status**: 🔴 Not Started

### Phase 4: Feature Parity
- Job list screen
- Job details screen
- Job status tracking
- Contractor claiming
- **Status**: 🔴 Not Started

---

## Testing Scenarios

### Scenario 1: Happy Path
1. User selects "Drywall" from home screen
2. Navigates to job request screen
3. Sees "Drywall" pre-selected with icon and description
4. Enters description: "Need to patch a hole in bedroom wall"
5. Takes 2 photos of the wall
6. Photos upload successfully to Linode
7. Selects urgency: "Normal" (within 1 week)
8. Enters max budget: $300
9. Taps "Submit Job Request"
10. Loading indicator shows
11. Success alert appears: "Job Request Submitted! Job ID: abc-123..."
12. Taps "View Jobs" (or "OK")
13. Returns to home screen

**Expected Backend Behavior:**
- Creates job with status='requested'
- Returns job_id, status, estimated_total, created_at
- Sends confirmation email to customer
- Sends alert email to admin
- Job appears in contractor "Available Jobs" screen

### Scenario 2: No Photos
1. User fills form without taking photos
2. Submits job request
3. Backend receives empty photos array
4. Job created successfully without photos

**Expected**: Should work fine, photos are optional

### Scenario 3: Photo Upload Fails
1. User takes photo
2. Upload to Linode fails (network error)
3. Photo shows "Failed" status with retry button
4. User taps "Retry"
5. Upload succeeds
6. User submits job request
7. Job created with photo URL

**Expected**: Retry logic works, job created after retry

### Scenario 4: Backend Error
1. User fills form and submits
2. Backend returns 500 error
3. Frontend shows alert: "Request Failed: [error message]"
4. User can retry submission

**Expected**: Error handling works, user can retry

### Scenario 5: Missing Required Fields
1. User doesn't select service category
2. Taps submit
3. Alert shows: "Please select a service category"

**Expected**: Validation works, prevents invalid submission

---

## Accessibility Notes

### Screen Reader Support
- All labels are descriptive (changed from "issue" to "work needed")
- Button text is action-oriented ("Submit Job Request")
- Success messages are complete sentences
- Error messages are helpful and specific

### Color Contrast
- No changes to colors
- All text meets WCAG AA standards (inherited from existing design)

### Touch Targets
- No changes to button sizes
- All interactive elements maintain 44x44px minimum

### Keyboard Navigation
- No changes to tab order
- All form fields accessible via keyboard

---

## Performance Impact

### Frontend
- No performance impact
- Same number of API calls
- Same photo upload logic
- Same rendering logic

### Backend
- POST `/api/jobs` will have similar performance to POST `/api/quotes/request`
- MongoDB write operation (minimal impact)
- Notification triggers (async, don't block response)

### Network
- Same payload size (~1-2KB for form data)
- Photo uploads unchanged (Linode direct upload)

---

## Rollback Plan

If the job creation flow has issues:

1. **Frontend Rollback**: Simple revert of 2 files
   - Revert `frontend/app/quote/request.tsx`
   - Revert `frontend/src/services/api.ts`
   - Users see old quote flow

2. **Backend Rollback**: Remove endpoint
   - Comment out POST `/api/jobs` route
   - No database changes needed (jobs collection exists separately)

3. **Partial Rollback**: Keep code, change text
   - Keep jobsAPI in place
   - Change UI text back to "quote" temporarily
   - Fix backend, then switch UI text back to "jobs"

---

## Future Enhancements

### Short Term (1-2 weeks)
- [ ] Implement POST `/api/jobs` backend endpoint
- [ ] Add notification triggers
- [ ] Test end-to-end flow
- [ ] Create job list screen
- [ ] Create job details screen

### Medium Term (1 month)
- [ ] Real-time status updates
- [ ] Push notifications
- [ ] Contractor chat integration
- [ ] Job cancellation
- [ ] Job editing (before claimed)

### Long Term (3+ months)
- [ ] Job history and reviews
- [ ] Recurring jobs
- [ ] Job templates (saved common requests)
- [ ] Price comparison (multiple contractors bid)
- [ ] Scheduled jobs (future date)

---

**Document Version**: 1.0
**Last Updated**: 2025-11-16
**Author**: Claude (Frontend Design Agent)
**Status**: Ready for Review
