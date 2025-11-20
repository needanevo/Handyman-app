# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## SSH ACCESS

**IMPORTANT**: SSH to the production server (172.234.70.157) is configured with key-based authentication. **DO NOT** use passwords with ssh/scp/sshpass commands. Simply use `ssh root@172.234.70.157` directly.

Example correct commands:
```bash
ssh root@172.234.70.157 'systemctl restart handyman-api'
scp file.py root@172.234.70.157:/srv/handyman-app/
```

## CURRENT DIRECTIVE: Complete Production MVP

**STATUS: Core Features Working ✅ | Jobs System Needed 🔴 | Infrastructure Hardening Required 🟡**

**Progress: 55% Complete** (30/55 tasks)

---

## 📋 COMPLETE API ENDPOINT REFERENCE

### Authentication Endpoints
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user (customer or contractor) | No |
| POST | `/api/auth/login` | Login and get JWT tokens | No |
| POST | `/api/auth/refresh` | Refresh access token using refresh token | No |
| GET | `/api/auth/me` | Get current user profile | Yes |

### Contractor Profile Endpoints
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| PATCH | `/api/contractors/documents` | Update contractor documents (license, insurance, business_license) | Contractor |
| PATCH | `/api/contractors/portfolio` | Update contractor portfolio photos | Contractor |
| PATCH | `/api/contractors/profile` | Update contractor profile (skills, experience, business_name) | Contractor |
| POST | `/api/contractor/profile-photo/upload` | Upload contractor profile photo/logo | Contractor |

### Contractor Jobs Endpoints
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/contractor/dashboard/stats` | Get dashboard statistics (job counts, revenue, expenses, mileage) | Contractor |
| GET | `/api/contractor/jobs/available` | Get available jobs within 50-mile radius matching skills | Contractor |
| GET | `/api/contractor/jobs/accepted` | Get jobs accepted by contractor (pending/accepted status) | Contractor |
| GET | `/api/contractor/jobs/scheduled` | Get jobs scheduled with date/time | Contractor |
| GET | `/api/contractor/jobs/completed` | Get completed jobs (sorted by completion date) | Contractor |

### Contractor Photo Uploads
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/contractor/photos/document` | Upload contractor document (license, insurance, business_license) | Contractor |
| POST | `/api/contractor/photos/portfolio` | Upload portfolio photo | Contractor |
| POST | `/api/contractor/photos/job/{job_id}` | Upload job photo | Contractor |

### User Profile Endpoints
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/profile/addresses` | Add new address to user profile | Yes |
| PUT | `/api/profile/addresses/business` | Update/replace business address (with geocoding) | Yes |
| GET | `/api/profile/addresses` | Get all user addresses | Yes |

### Customer Endpoints (Planned)
| Method | Endpoint | Description | Auth Required | Status |
|--------|----------|-------------|---------------|--------|
| POST | `/api/jobs` | Create new job request | Customer | 🔴 TODO |
| GET | `/api/jobs` | Get customer's jobs | Customer | 🔴 TODO |
| GET | `/api/jobs/{id}` | Get job details | Customer | 🔴 TODO |
| PATCH | `/api/jobs/{id}` | Update job (cancel, etc.) | Customer | 🔴 TODO |
| POST | `/api/jobs/{id}/photos` | Upload job photos | Customer | 🔴 TODO |
| GET | `/api/quotes/{id}` | Get quote details | Customer | ✅ EXISTS |
| POST | `/api/quotes/request` | Request a quote | Customer | ✅ EXISTS |

### Health & System
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/health` | Health check endpoint | No |

---

## 🎉 RECENT UPDATES (2025-11-19)

### Session Summary: Contractor Registration & Job System Fixes

**What Was Fixed:**
1. ✅ **Contractor Registration Completion** - Fixed 422 error in Step 4 portfolio upload
2. ✅ **Address Geocoding** - Geocoded contractor business address using Nominatim (OpenStreetMap)
3. ✅ **Geofence Map** - Map now displays contractor location and 50-mile service radius
4. ✅ **Duplicate Address Prevention** - Created `PUT /profile/addresses/business` to replace instead of add
5. ✅ **Contractor Job Endpoints** - Added accepted, scheduled, and completed jobs endpoints
6. ✅ **Web Platform Support** - Fixed react-native-maps to work on web with graceful fallback
7. ✅ **Tunnel Mode** - Configured Expo to use tunnel mode by default for stable dev server

**Key Technical Changes:**

**Backend (`server.py`):**
- Added `PUT /profile/addresses/business` - Updates business address with automatic geocoding
- Added `GET /contractor/jobs/accepted` - Returns accepted jobs for contractor
- Added `GET /contractor/jobs/scheduled` - Returns scheduled jobs sorted by date
- Added `GET /contractor/jobs/completed` - Returns completed jobs sorted by completion date
- Fixed `PATCH /contractors/portfolio` - Changed from `List[str]` to `dict` parameter to fix 422 error

**Frontend:**
- `register-step3.tsx` - Replaced GooglePlacesAutocomplete with manual address inputs (library was crashing)
- `register-step4.tsx` - Improved error handling to show specific backend error messages
- `jobs/completed.tsx` - Created missing completed jobs page with proper empty state
- `jobs/accepted.tsx` - TODO: Needs to be created (currently missing)
- `jobs/scheduled.tsx` - TODO: Needs to be created (currently missing)
- `mileage/map.tsx` - Added Platform.OS check to conditionally load react-native-maps (web fallback)
- `package.json` - Changed default start script to `expo start --tunnel`

**Database:**
- Geocoded contractor address: `13 shore lane, Milford, DE 19963` → `38.9372175, -75.4239711`
- Cleaned up 3 duplicate addresses (kept only first address)
- Verified 0 jobs in database (no phantom data)

**Deployment:**
- All backend changes deployed to production (172.234.70.157)
- API service restarted successfully
- Frontend changes committed to main branch

---

## 🎉 RECENT UPDATES (2025-11-14)

### MongoDB Atlas & Database Issues - RESOLVED ✅
**Fixed critical database connectivity and schema issues**

**Problems Solved:**
1. ✅ **Local MongoDB Interference** - Stopped and disabled local MongoDB instance on production server that was competing with Atlas
2. ✅ **Backend now 100% connected to MongoDB Atlas** - All data properly stored in cloud instance
3. ✅ **Pydantic v2 Compatibility** - Fixed `.dict()` → `.model_dump()` for Pydantic 2.x (resolved 422 errors on address endpoint)
4. ✅ **Contractor Registration Flow** - All 4 steps now work end-to-end (was blocked by address endpoint error)
5. ✅ **MongoDB Schema Complete** - All required collections and indexes created

**MongoDB Collections Created:**
- ✅ users: 4 documents, 4 indexes (email unique, role, phone unique sparse)
- ✅ user_passwords: 4 documents, 2 indexes (user_id unique)
- ✅ quotes: 16 documents, 5 indexes (customer_id+status, created_at)
- ✅ services: 5 documents, 2 indexes
- ✅ **jobs**: 0 documents, 4 indexes (NEW - contractor_id+status, customer_id+created_at, status+scheduled_date)
- ✅ **photos**: 0 documents, 4 indexes (NEW - customer_id+created_at, quote_id, job_id)
- ✅ **events**: 0 documents, 3 indexes (NEW - entity tracking, created_at)

### Linode Object Storage Organization - IMPLEMENTED ✅
**Implemented proper folder structure for contractor vs customer photos**

**Problem:** All photos (including contractor documents and portfolio) were being saved in `customers/` folder.

**Solution Implemented:**
- ✅ **Backend**: Added contractor-specific upload methods in `LinodeObjectStorage`:
  - `upload_contractor_document()` → `contractors/{id}/profile/{type}_{file}`
  - `upload_contractor_portfolio()` → `contractors/{id}/portfolio/{file}`
  - `upload_contractor_job_photo()` → `contractors/{id}/jobs/{job_id}/{file}`

- ✅ **Backend**: Created new API endpoints:
  - `POST /contractor/photos/document` - Upload license, insurance, business_license
  - `POST /contractor/photos/portfolio` - Upload portfolio photos
  - `POST /contractor/photos/job/{job_id}` - Upload job photos

- ✅ **Frontend**: Added new API methods in `api.ts`:
  - `contractorAPI.uploadDocument(file, documentType)`
  - `contractorAPI.uploadPortfolioPhoto(file)`
  - `contractorAPI.uploadJobPhoto(jobId, file)`

- ✅ **Frontend**: Updated `PhotoUploader` component to accept `customUpload` prop
- ✅ **Frontend**: Updated Step 2 and Step 4 to use contractor-specific endpoints

**Folder Structure:**
```
customers/
  {customer_id}/
    quotes/{quote_id}/photo.jpg
    jobs/{job_id}/photo.jpg

contractors/
  {contractor_id}/
    profile/
      license_{uuid}.jpg
      insurance_{uuid}.jpg
      business_license_{uuid}.jpg
    portfolio/
      portfolio_{uuid}.jpg
    jobs/{job_id}/{timestamp}_{uuid}.jpg
```

**Files Modified:**
- `backend/providers/linode_storage_provider.py` - Added 3 new upload methods (152 lines)
- `backend/server.py` - Added 3 new photo endpoints, fixed Pydantic v2 compatibility (320 lines)
- `frontend/src/services/api.ts` - Added contractor photo upload methods
- `frontend/src/components/PhotoUploader.tsx` - Added customUpload prop
- `frontend/app/auth/contractor/register-step2.tsx` - Integrated document uploads
- `frontend/app/auth/contractor/register-step4.tsx` - Integrated portfolio uploads

**Deployment Status:**
- ✅ Backend deployed to production (172.234.70.157)
- ✅ MongoDB Atlas schema created
- ✅ Frontend code committed to dev branch
- ⏳ **Testing Required**: Need to test contractor registration with frontend running to verify correct folder paths

**Next Testing Steps:**
1. Start frontend (`npx expo start`)
2. Complete contractor registration (Step 2 documents, Step 4 portfolio)
3. Verify photos upload to `contractors/` folders (not `customers/`)
4. Verify MongoDB saves correct URLs with `contractors/` prefix
5. Optionally migrate existing contractor photos from wrong folders

---

## 🎯 CURRENT FOCUS (2025-11-16)

**STATUS: Quote-to-Job System Architecture | Testing & Infrastructure Planning**

### 1. Jobs Frontend Architecture (P0 - CRITICAL)

**Three User Flows Required:**

**A. Homeowner Flow:**
- Create Job (currently "request quote") → See Job Status / Messages → Edit / Cancel
- Mental model shift: "Quote" is just a job status, not a separate thing
- Job object fields: `{ service_category, address_id, description, photos, budget_min, budget_max, urgency, preferred_dates, source: 'app', status: 'requested' }`

**B. Contractor Flow:**
- See Available Jobs → Claim Job → Update Status / Chat with Customer
- Status transitions: `requested → quoted → accepted → in_progress → completed`
- Track: `start_odometer, end_odometer, start_time, end_time, materials_cost`

**C. Admin/Owner Flow:**
- See All Jobs → Force-assign to Contractor → Override status / Add notes
- View: `distance_miles, time_on_site_minutes, materials_cost, contractor_invoice_amount`

**Implementation Plan:**
- [ ] Rename quote request screen to "Create Job Request" mentally
- [ ] Change `quotesAPI.requestQuote` → `jobsAPI.createJob`
- [ ] POST to `/api/jobs` instead of `/api/quotes`
- [ ] Backend response: `{ job_id, status, estimated_total, created_at }`
- [ ] Update success message from "quote" to "job"

---

### 2. Notification System Design (P0 - CRITICAL)

**Trigger → Recipient → Channel Matrix:**

| Trigger | Recipient(s) | Channel | Message Content |
|---------|-------------|---------|-----------------|
| Job Created | Homeowner | Email + SMS | "New Job Request #{job_id}" - category, description, budget, link |
| Job Created | Admin/You | Email | Full job details for manual assignment |
| Job Claimed | Homeowner | SMS | "Your [category] job has been claimed by [contractor]" |
| Job Claimed | Contractor | Email | Job details, customer contact, estimated completion |
| Status → Scheduled | Homeowner | Email + SMS | "Your job is scheduled for [date]" |
| Status → In Progress | Homeowner | Email | "Work has started on your [category] job" |
| Status → Complete | Homeowner | Email + SMS | "Your job is complete! Please review and confirm" |

**SendGrid Email Templates Needed:**
1. `job_created_homeowner.html` - Confirmation to customer
2. `job_created_admin.html` - Alert to you with job details
3. `job_claimed_contractor.html` - Assignment notification
4. `job_scheduled_homeowner.html` - Scheduling confirmation
5. `job_completed_homeowner.html` - Completion + review request

**Twilio SMS Templates Needed:**
1. Job created: "We got your request for [category]. Est: $X–$Y. We'll follow up soon. –The Real Johnson"
2. Job claimed: "Your [category] job has been claimed. Updates coming soon!"
3. Job completed: "Your job is complete! Check your email for details."

**Implementation Priority:**
- [ ] Design all trigger points in backend job workflow
- [ ] Create SendGrid email templates
- [ ] Create Twilio SMS templates
- [ ] Wire triggers to backend POST `/api/jobs` endpoint
- [ ] Test notification delivery for each trigger

---

### 3. Frontend/Backend Connectivity Testing (P1 - HIGH)

**Test Plan - Next Laptop Session:**
1. Start frontend: `cd frontend && npx expo start`
2. Open DevTools Network tab in browser
3. Perform ONE action (health check or login)
4. Confirm `200 OK` from `https://therealjohnson.com/api/...`
5. Verify: No IP addresses, no `http://`, all HTTPS

**Success Criteria:**
- ✅ Frontend connects to production backend via HTTPS
- ✅ CORS headers allow requests
- ✅ JWT tokens persist and refresh correctly
- ✅ No mixed content warnings (HTTP resources on HTTPS page)

**If Tests Fail:**
- Check `EXPO_PUBLIC_BACKEND_URL` in `frontend/.env`
- Verify SSL certificate is installed and valid
- Check nginx CORS configuration
- Review browser console for specific errors

---

### 4. Welcome Tutorial & First-Run Experience (P2 - MEDIUM)

**User Profile Field Addition:**
```javascript
// Add to users collection:
{
  has_seen_tutorial: Boolean,  // default: false
  tutorial_completed_date: ISODate
}
```

**Tutorial Flow Design:**
- 3-4 cards maximum, ~2 minutes total
- Card 1: "How requests work" - Submit jobs with photos, get estimates
- Card 2: "How estimates work" - Transparent pricing, change order process
- Card 3: "How scheduling works" - Contractor claims, you confirm dates
- Card 4: "How payments work" - Pay after completion, review contractors

**UI Components:**
- Skip button on every card
- Exit tutorial button (always visible)
- Progress dots (1 of 4, 2 of 4, etc.)
- "Watch tutorial again" link in Settings

**Implementation:**
- [ ] Create `TutorialModal` component with card carousel
- [ ] Add `has_seen_tutorial` check on first login
- [ ] Store tutorial completion in user profile
- [ ] Add "Tutorial" option to Settings menu

---

### 5. Contractor Accounting & Mileage Tracking (P1 - HIGH)

**Data Backend Must Store:**

```javascript
// Jobs collection additions:
{
  // Contractor tracking fields
  distance_miles: Number,          // Auto-calculated from addresses
  time_on_site_minutes: Number,    // Contractor enters start/end time
  materials_cost: Number,           // Contractor itemizes materials
  contractor_invoice_amount: Number, // Final amount contractor charges

  // Mileage tracking
  contractor_start_odometer: Number,
  contractor_end_odometer: Number,
  contractor_mileage_notes: String,

  // Time tracking
  contractor_clock_in: ISODate,
  contractor_clock_out: ISODate,

  // Materials tracking
  materials: [{
    item: String,
    quantity: Number,
    unit_cost: Number,
    total_cost: Number,
    receipt_photo_url: String
  }]
}
```

**Frontend Tests Required:**
1. Create fake jobs in dev environment
2. Run "complete job" flow where contractor enters:
   - Start odometer: 12345
   - End odometer: 12375 → Computes 30 miles
   - Start time: 9:00 AM
   - End time: 11:30 AM → Computes 2.5 hours
3. Verify API receives expected numbers in logs/database
4. Contractor sees summary: "30 miles, 2.5 hours, $150 materials = $XXX invoice"

**Dashboard Views Needed:**
- Contractor: "Your Jobs" - total miles, total hours, total materials this month
- Admin: "All Contractors" - aggregated stats per contractor per month

**Legal Disclaimers (CRITICAL):**
- All reports labeled: "For your records only"
- "Not official tax documentation"
- "Consult your tax professional"
- Never use terms: "1099", "W-2", "K-1"
- Only say: "Payout summary" or "Earnings report"

---

### 6. Legal Framework & Independent Contractor Model (P1 - HIGH)

**Platform Legal Positioning:**

**What We Are:**
- Lead-generation and workflow platform
- Connection service between homeowners and contractors
- Record-keeping and communication tools provider
- Transparent pricing and process facilitator

**What We Are NOT:**
- NOT an employer (contractors are independent)
- NOT a financial institution or bank
- NOT tax advisors or accountants
- NOT legal service or authority
- NOT insurance provider
- NOT party to work contracts

**Contractor Onboarding Legal Copy:**

```
INDEPENDENT CONTRACTOR ACKNOWLEDGEMENT

We connect you with customers as an independent contractor lead platform.

YOU ARE RESPONSIBLE FOR:
✓ Tracking and reporting your income and taxes
✓ Managing your mileage and expense records
✓ Maintaining required licenses and insurance
✓ Setting your own pricing and terms
✓ Filing all tax returns (1099-NEC, Schedule C, etc.)

WE PROVIDE:
✓ Lead generation and customer connections
✓ Job tracking and workflow tools
✓ Record-keeping dashboards (informational only)
✓ Payment processing facilitation

DISCLAIMER: We do not provide accounting, payroll, or tax services.
All reports in the app are informational only and not official tax
documentation. Consult your tax professional.

By checking this box, I acknowledge that I am an independent contractor,
not an employee, and I am solely responsible for all tax obligations.

□ I Accept - [version 1.0, date, IP logged]
```

**Homeowner Onboarding Legal Copy:**

```
SERVICE USE TERMS

You contract directly with the contractor for all work performed.
We are not a party to the work agreement.

PLATFORM ROLE:
• We help you find vetted professionals
• We show clear estimates and pricing
• We track jobs from request to completion
• We facilitate secure payments

YOUR AGREEMENT:
• The work contract is between you and the contractor
• We are not liable for work quality or outcomes
• Contractors carry their own insurance (when applicable)
• You can review and rate contractors after completion

By tapping Confirm, you agree to these terms.
[Link to full Terms of Service]
```

**Implementation Checklist:**
- [ ] Add `accepted_contractor_terms_version` field to users collection
- [ ] Add `accepted_contractor_terms_date` field to users collection
- [ ] Add `accepted_contractor_terms_ip` field to users collection
- [ ] Create scrollable terms screen in contractor registration
- [ ] Add checkbox + "I Accept" button (disabled until scrolled)
- [ ] Log acceptance: version + timestamp + IP + device
- [ ] Add similar homeowner acceptance at first checkout/booking
- [ ] Create full Terms of Service page (linked from footer)
- [ ] Create Privacy Policy page
- [ ] Have real lawyer review all legal copy

---

### 7. Brand Positioning & Value Proposition (P2 - MEDIUM)

**Tagline:** "Assurance, Not Insurance"

**Core Message:**
We bring transparency and structure to home repairs. You get clear pricing,
vetted contractors, and tools to track everything. We're not your insurance
policy—we're your assurance that the process is fair and documented.

---

**Contractor Promise:**

**"Real Leads. Real Tools. Real Independence."**

✓ We bring you qualified leads that match your skills
✓ You get direct access to customers who actually need work done (not random clicks)
✓ We give you tools to track expenses, mileage, materials, and scheduling
✓ We help you generate take-offs and compare material pricing (Home Depot, Lowe's data)
✓ Customers submit photos up front so you can verify estimates before stepping on site
✓ We give you a simple way to submit and document change orders
✓ You stay fully independent—set your own pricing, manage your own taxes

**What we protect:**
- Your time (no fake leads)
- Your reputation (structured review system)
- Your records (mileage, time, materials tracked automatically)
- Your growth (start without insurance, build your business, graduate to licensed pro)

---

**Homeowner Promise:**

**"Fair Pricing. Clear Communication. Verified Contractors."**

✓ You deserve to know what a fair price is
✓ You deserve to see who's doing the work
✓ You deserve solid workmanship and clear explanations

**How we help:**
- We match you with contractors and skilled handymen
- Some are new to business (lower pricing, may not have insurance—we always tell you)
- Some are licensed pros (higher pricing, fully insured—we always tell you)
- Everyone gets a chance to build a business; you get competitive pricing and motivated workers
- We show estimates based on photos you submit
- We explain that quotes can change as the job progresses
- We give contractors a clear way to document change orders
- We keep pricing, communication, and financial records transparent

**What we protect:**
- Your budget (transparent estimates)
- Your trust (reviews and ratings matter)
- Your time (structured process from quote to completion)
- Your home (only vetted contractors can claim jobs)

---

**Implementation:**
- [ ] Add "About" page with brand positioning
- [ ] Update landing page hero section with tagline
- [ ] Create contractor recruitment page with value prop
- [ ] Create homeowner FAQ page addressing common concerns
- [ ] Add brand voice guidelines to design system docs

---

## 🔴 HIGH PRIORITY - BLOCKING MVP LAUNCH

### Jobs Management System (CRITICAL)
**Status**: Architecture Defined, Implementation Needed | **Priority**: P0 - Blocking

**See Section "1. Jobs Frontend Architecture" above for complete three-flow design (Homeowner, Contractor, Admin)**

**Backend Implementation Tasks:**

- [ ] Expand Job model in `backend/models/job.py`
  - Core fields: id, contractor_id, customer_id, address_id, status, service_category
  - Status enum: `requested → quoted → accepted → in_progress → completed → cancelled`
  - Accounting fields: distance_miles, time_on_site_minutes, materials_cost, contractor_invoice_amount
  - Tracking fields: contractor_start_odometer, contractor_end_odometer, contractor_clock_in, contractor_clock_out
  - Materials array: item, quantity, unit_cost, total_cost, receipt_photo_url
  - Customer fields: description, photos, budget_min, budget_max, urgency, preferred_dates

- [ ] Implement POST `/api/jobs` endpoint
  - Replace quote creation flow
  - Create job record with status='requested'
  - Trigger notification system (see Section 2 above)
  - Return: { job_id, status, estimated_total, created_at }

- [ ] Implement GET `/api/jobs/available` endpoint (Contractor)
  - Filter by contractor skills
  - Filter by 50-mile radius from business address
  - Sort by distance (closest first)
  - Only show jobs with status='requested' or 'quoted'

- [ ] Implement PATCH `/api/jobs/:id/claim` endpoint (Contractor)
  - Assign contractor_id to job
  - Change status to 'accepted'
  - Trigger notifications (homeowner SMS, contractor email)

- [ ] Implement PATCH `/api/jobs/:id/status` endpoint (Contractor)
  - Update status (in_progress, completed)
  - Trigger appropriate notifications
  - Validate status transitions

- [ ] Implement PATCH `/api/jobs/:id/tracking` endpoint (Contractor)
  - Update odometer readings, clock in/out times
  - Update materials list
  - Calculate derived values (distance, duration)

- [ ] Implement GET `/api/jobs` endpoint (Admin)
  - List all jobs with filtering
  - Aggregated stats per contractor
  - Override capabilities for status and assignment

- [ ] Integrate notification triggers (see Section 2 above)
  - Job created → Email + SMS to homeowner, Email to admin
  - Job claimed → SMS to homeowner, Email to contractor
  - Status changed → Email + optional SMS to homeowner

**Frontend Implementation Tasks:**

- [ ] Rename "Quote Request" to "Job Request" in UI
- [ ] Change API call from `quotesAPI.requestQuote` to `jobsAPI.createJob`
- [ ] Create homeowner job list/status screen
- [ ] Create contractor "Available Jobs" screen
- [ ] Create contractor "My Jobs" screen with tracking inputs
- [ ] Create admin job management dashboard
- [ ] Add odometer/time tracking UI for contractors
- [ ] Add materials itemization UI for contractors
- [ ] Add job status update UI for contractors

**Why Critical**: Customers can request quotes but can't actually book and track jobs. Contractors can't claim or complete work. This breaks the entire workflow.

**Estimated Effort**: 5-7 days (includes notification system)

---

### Database Schema & Constraints
**Status**: COMPLETE ✅ | **Priority**: P0 - Blocking

- [x] Create `jobs` collection with indexes ✅ (2025-11-14)
  ```javascript
  db.jobs.createIndex({ contractor_id: 1, status: 1 })
  db.jobs.createIndex({ customer_id: 1, created_at: -1 })
  db.jobs.createIndex({ status: 1, scheduled_date: 1 })
  ```

- [x] Create `events` collection for audit trail ✅ (2025-11-14)
  ```javascript
  db.events.createIndex({ entity_type: 1, entity_id: 1, created_at: -1 })
  db.events.createIndex({ created_at: -1 })
  ```

- [x] Add phone unique constraint ✅ (2025-11-14)
  ```javascript
  db.users.createIndex({ phone: 1 }, { unique: true, sparse: true })
  ```

- [x] Create `photos` metadata collection ✅ (2025-11-14)
  ```javascript
  db.photos.createIndex({ customer_id: 1, created_at: -1 })
  db.photos.createIndex({ quote_id: 1 })
  db.photos.createIndex({ job_id: 1 })
  ```

- [x] Verify and document all existing indexes ✅ (2025-11-14)
  - Created diagnostic script: `backend/setup_mongodb_schema.py`
  - All collections documented in RECENT UPDATES section above

**Completed**: All required collections and indexes created in MongoDB Atlas.

---

## 🟡 MEDIUM PRIORITY - PRODUCTION READINESS

### Security & Infrastructure Hardening
**Status**: Not Started | **Priority**: P1 - Pre-Launch

- [ ] Install & configure Let's Encrypt SSL certificate
  - Use certbot with nginx
  - Auto-renewal setup
  - Update frontend EXPO_PUBLIC_BACKEND_URL to https://

- [ ] Test HTTPS configuration
  - Verify SSL grade (ssllabs.com)
  - Test CORS with HTTPS
  - Update all API calls to https

- [ ] Harden server security
  - Verify UFW firewall rules (only 22, 80, 443 open)
  - Verify fail2ban is active and configured
  - Review SSH config (disable root login, key-only auth)

- [ ] Finalize domain name
  - Purchase/configure domain
  - Point A record to 172.234.70.157
  - Update all references from IP to domain

**Why Important**: HTTP-only is insecure for production. Domain name is more professional than IP address.

**Estimated Effort**: 1 day

---

### Backups & Monitoring
**Status**: Not Started | **Priority**: P1 - Pre-Launch

- [ ] Setup nightly MongoDB dumps to Linode Object Storage
  - Create backup script (ops/backup_mongodb.sh)
  - Add to crontab (2 AM daily)
  - Retain last 30 days
  - Test restore procedure

- [ ] Enable system metrics
  - CPU, memory, disk usage
  - API response times
  - Error rates
  - Use simple monitoring (uptimerobot.com or similar)

- [ ] Configure log rotation
  - Setup logrotate for backend.log
  - Rotate daily, keep 30 days
  - Compress old logs

- [ ] Create smoke test script
  - Test all critical endpoints
  - Run post-deployment
  - Alert on failures

**Why Important**: Data loss is unacceptable. Monitoring prevents downtime. Logs help debugging.

**Estimated Effort**: 2 days

---

## 🟢 LOW PRIORITY - NICE TO HAVE

### Customer Endpoints (Future)
**Status**: Using Auth Endpoints | **Priority**: P2 - Post-Launch

- [ ] Dedicated POST `/api/customers` endpoint
  - Currently using `/api/auth/register`
  - Create customer-specific registration

- [ ] Dedicated GET `/api/customers/:id` endpoint
  - Currently using `/api/auth/me`
  - Add customer-specific fields

**Why Low Priority**: Current auth endpoints work fine. This is code organization, not functionality.

**Estimated Effort**: 4 hours

---

### Admin & Operations Tools
**Status**: Not Started | **Priority**: P2 - Post-Launch

- [ ] Verify MongoDB least privilege
  - Review current user permissions
  - Create read-only user for monitoring
  - Create admin user separate from app user

- [ ] Create admin user accounts
  - Admin dashboard access
  - Role-based permissions

- [ ] Install mongo-express (development only)
  - Docker container for DB browsing
  - Only accessible via SSH tunnel
  - NEVER expose publicly

**Why Low Priority**: App works without this. Makes operations easier but not required for launch.

**Estimated Effort**: 1 day

---

### Docker Migration (Future Consideration)
**Status**: Not Started | **Priority**: P3 - Future

- [ ] Install Docker & Docker Compose
- [ ] Containerize backend API
- [ ] Create docker-compose.yml for services
- [ ] Update deployment scripts

**Why Low Priority**: Current systemd setup works. Docker adds complexity without immediate benefit.

**Estimated Effort**: 3 days

---

## 🔧 CONTRACTOR REGISTRATION & UX IMPROVEMENTS (2025-11-13)

**STATUS: Testing Complete | Bugs Identified | Priority: P1**

### Issues Identified During Testing

**Navigation & UX Issues:**
- [x] **Issue #1**: Available jobs page has no back button to return to main dashboard ✅ FIXED
  - **Priority**: P1 - High
  - **Solution**: Added back button with centered title in header
  - **Files**: `frontend/app/(contractor)/jobs/available.tsx`

- [x] **Issue #2**: Tax Reports page shows no calculations on contractor dashboard ✅ FIXED
  - **Priority**: P2 - Medium
  - **Solution**: Removed "View Reports" link (reports page not implemented)
  - **Files**: `frontend/app/(contractor)/dashboard.tsx`

- [x] **Issue #3**: Check all pages for back/home button consistency ✅ FIXED
  - **Priority**: P2 - Medium
  - **Solution**: Added back buttons to expenses and other key contractor pages
  - **Files**: `frontend/app/(contractor)/expenses/index.tsx`, `jobs/available.tsx`

**Contractor Profile & Skills:**
- [x] **Issue #4**: Skills input is freeform text instead of checkboxes ✅ FIXED
  - **Priority**: P1 - High
  - **Solution**: Converted to checkbox grid with 12 service categories matching customer selection
  - **Categories**: Drywall, Painting, Electrical, Plumbing, Carpentry, HVAC, Flooring, Roofing, Landscaping, Appliance, Windows & Doors, Other
  - **Files**: `frontend/app/auth/contractor/register-step3.tsx`

**Geo-Location & Service Areas:**
- [x] **Issue #5**: Service area zip codes need geo-boundary implementation ✅ FIXED (2025-11-13)
  - **Priority**: P0 - Critical
  - **Solution Implemented**:
    - Replaced service areas text field with full business address form (street, city, state, zip)
    - Business address is automatically geocoded by backend using Google Maps API
    - Implemented 50-mile radius filtering using geodesic distance calculation (geopy library)
    - Created new endpoint GET `/api/contractor/jobs/available` that:
      - Returns only jobs within 50 miles of contractor's business address
      - Filters by contractor's skills
      - Sorts by distance (closest first)
      - Includes distance_miles field for each job
    - Updated contractor routing logic to use actual lat/lon distance instead of zip code matching
    - Updated job assignment to pass customer address for distance calculation
    - Test contractor account now has business address in Baltimore, MD (39.2904, -76.6122)
  - **Files Modified**:
    - `frontend/app/auth/contractor/register-step3.tsx` ✅ Added business address fields (street, city, state, zip)
    - `backend/services/contractor_routing.py` ✅ Implemented 50-mile geodesic distance filtering
    - `backend/server.py` ✅ Added GET `/contractor/jobs/available` endpoint
    - `backend/server.py` ✅ Updated job creation to use address-based routing
    - `backend/models/job.py` ✅ Job model already existed (copied to server)
  - **Dependencies Added**:
    - `geopy` library for geodesic distance calculations
  - **Testing**:
    - Backend deployed and running successfully
    - Test contractor has business address with geocoded coordinates
    - Available jobs endpoint ready for testing with frontend

**Profile Pictures & Branding:**
- [x] **Issue #6**: No contractor logo/profile picture upload ✅ FIXED (2025-11-19)
  - **Priority**: P2 - Medium
  - **Solution**:
    - Added profile photo upload with image picker (camera/gallery options)
    - 1:1 aspect ratio cropping built-in
    - Stores in Linode Object Storage: `contractors/{id}/profile/profile_{uuid}.{ext}`
    - Displays in dashboard (40x40px avatar) and profile page (120x120px)
    - Shows initials placeholder when no photo uploaded
    - Permission handling for camera and photo library
    - Loading states and error handling
    - Auto-refresh after upload
  - **Files Modified**:
    - `backend/models/user.py` ✅ Added profile_photo field
    - `backend/providers/linode_storage_provider.py` ✅ Added upload_contractor_profile_photo method
    - `backend/server.py` ✅ Added POST /contractor/profile-photo/upload endpoint
    - `frontend/src/services/api.ts` ✅ Added uploadProfilePhoto method
    - `frontend/src/contexts/AuthContext.tsx` ✅ Added profilePhoto field and mapping
    - `frontend/app/(contractor)/profile.tsx` ✅ Added profile photo upload UI (120x120px)
    - `frontend/app/(contractor)/dashboard.tsx` ✅ Added profile photo avatar (40x40px)

**Legal & Compliance:**
- [x] **Issue #7**: Terms and conditions page needed ✅ FIXED
  - **Priority**: P1 - High
  - **Solution**:
    - Created comprehensive Terms of Service page
    - Created Contractor Service Agreement with requirements, payments, renewal policy
    - Professional styling with proper legal sections
    - Links accessible from footer and beta page
  - **Files**:
    - `frontend/app/legal/terms.tsx` ✅ Created
    - `frontend/app/legal/contractor-agreement.tsx` ✅ Created

**Marketing & Onboarding:**
- [x] **Issue #8**: Create beta contractor advertisement and QR code system ✅ FIXED
  - **Priority**: P3 - Low
  - **Solution**:
    - Created professional landing page for beta contractor recruitment
    - Benefits grid (6 key benefits)
    - Requirements checklist
    - How-to-join steps (1. Download Expo Go, 2. Scan QR, 3. Register, 4. Start Earning)
    - QR code placeholder for Expo Go deep linking
    - Links to Terms and Contractor Agreement
    - CTA buttons for registration
  - **Files**:
    - `frontend/app/contractor-beta.tsx` ✅ Created

**Profile Editing Issues:**
- [x] **Issue #9**: Contractor profile editing doesn't recall uploaded documents (PHANTOM PHOTOS BUG) ✅ FIXED
  - **Priority**: P0 - Critical
  - **Root Cause**: Photos uploaded to Linode Object Storage but URLs never saved to MongoDB
    - PhotoUploader uploaded files to Linode successfully ✅
    - URLs stored in React component state only ✅
    - URLs passed as route params ✅
    - **URLs never persisted to database** ❌
    - Result: UI showed photos exist but couldn't display or access them
  - **Solution**:
    - **Backend**: Created 3 new PATCH endpoints to save contractor data:
      - `PATCH /contractors/documents` - Saves license, business licenses, insurance
      - `PATCH /contractors/portfolio` - Saves portfolio photos array
      - `PATCH /contractors/profile` - Saves skills, experience, business name
    - **Frontend APIClient**: Added `patch()` method to support PATCH requests
    - **Frontend API**: Added `contractorAPI.updateDocuments()`, `updatePortfolio()`, `updateProfile()`
    - **Step 2**: Now calls `updateDocuments()` to persist license, business licenses, insurance to DB
    - **Step 3**: Now calls `updateProfile()` to persist skills, experience, business name to DB
    - **Step 4**: Now calls `updatePortfolio()` to persist portfolio photos to DB
    - **Data Recall**: Added useEffect hooks to pre-fill existing documents from user context
    - **AuthContext**: Extended User interface with contractor-specific fields (documents, portfolioPhotos, skills, etc.)
  - **Testing**:
    - Backend endpoints deployed and API restarted ✅
    - Frontend changes committed to dev branch ✅
    - Ready for end-to-end testing with contractor account
  - **Files Modified**:
    - `backend/server.py` ✅ Added contractor profile endpoints (lines 948-1074)
    - `frontend/src/services/api.ts` ✅ Added patch method and contractorAPI methods
    - `frontend/src/contexts/AuthContext.tsx` ✅ Extended User interface with contractor fields
    - `frontend/app/auth/contractor/register-step2.tsx` ✅ Added document persistence
    - `frontend/app/auth/contractor/register-step3.tsx` ✅ Added profile persistence
    - `frontend/app/auth/contractor/register-step4.tsx` ✅ Added portfolio persistence
  - **Documentation**:
    - `CONTRACTOR_DATA_GUIDE.md` ✅ Created comprehensive guide to contractor data storage
    - `check_contractor_data.py` ✅ Created diagnostic script for inspecting contractor data

### Technical Debt Created Today
- Test contractor account had incorrect role casing (TECHNICIAN vs technician)
- Test contractor account had incorrect password field name (hashed_password vs password_hash)
- These issues should be prevented in create scripts with validation

---

## 📊 COMPLETION TRACKING

### Current Status (2025-11-16)

**COMPLETED** (30 tasks - 50%):
- ✅ Backend API deployment (uvicorn + systemd)
- ✅ MongoDB Atlas connection
- ✅ Linode Object Storage integration
- ✅ Photo upload endpoints
- ✅ Authentication system (register, login, JWT)
- ✅ Quote generation with AI
- ✅ Email system (SendGrid + templates)
- ✅ Contractor registration (4-step flow)
- ✅ Service categories (12 total)
- ✅ CORS configuration
- ✅ Collections: users, user_passwords, quotes, services, jobs, photos, events
- ✅ iPhone photo upload fix
- ✅ Contractor profile page
- ✅ Registration step navigation
- ✅ Test contractor account
- ✅ Role-based routing (customer vs contractor login)
- ✅ Contractor login authentication fixes
- ✅ 50-mile radius job filtering with geodesic distance

**IN PROGRESS** (10 tasks - 17%):
- 🟡 Jobs system architecture (defined, needs implementation)
- 🟡 Notification system design (planned, needs templates)
- 🟡 Legal framework (copy written, needs lawyer review)
- 🟡 Brand positioning (defined, needs pages)
- 🟡 Contractor accounting/mileage (schema designed, needs UI)
- 🟡 Frontend/backend connectivity testing (pending next session)
- 🟡 Welcome tutorial (designed, needs implementation)
- 🟡 Contractor annual renewal system (documented, not implemented)
- 🟡 SSL/HTTPS setup (needed for production)
- 🟡 Infrastructure testing (basic deployment done, hardening needed)

**NOT STARTED** (20 tasks - 33%):
- ❌ Jobs backend endpoints (POST /jobs, PATCH /jobs/:id/claim, etc.)
- ❌ Jobs frontend screens (homeowner, contractor, admin)
- ❌ SendGrid email templates (7 templates needed)
- ❌ Twilio SMS templates (3 templates needed)
- ❌ Contractor tracking UI (odometer, time, materials)
- ❌ Legal acceptance screens (contractor + homeowner terms)
- ❌ Brand pages (About, FAQ, contractor recruitment)
- ❌ Tutorial modal component
- ❌ Backups and monitoring (HIGH)
- ❌ Server hardening verification (MEDIUM)
- ❌ Admin job management dashboard
- ❌ Docker migration (FUTURE)

---

## 🎯 REVISED SPRINT GOALS (2025-11-16)

**Sprint 1 (Week of 2025-11-18): Core Jobs System**
1. ✅ Test frontend/backend HTTPS connectivity
2. Expand Job model with accounting/tracking fields
3. Implement POST `/api/jobs` endpoint (replaces quote creation)
4. Implement GET `/api/jobs/available` endpoint (contractor view)
5. Implement PATCH `/api/jobs/:id/claim` endpoint (contractor claims job)
6. Create basic notification triggers (job created, job claimed)
7. Update frontend: quotesAPI → jobsAPI

**Sprint 2 (Week of 2025-11-25): Contractor Workflow**
1. Implement PATCH `/api/jobs/:id/status` endpoint
2. Implement PATCH `/api/jobs/:id/tracking` endpoint (odometer, time, materials)
3. Create contractor "My Jobs" screen with tracking inputs
4. Create contractor "Available Jobs" screen
5. Create SendGrid email templates (3 priority templates)
6. Create Twilio SMS templates (3 templates)
7. Wire all notification triggers

**Sprint 3 (Week of 2025-12-02): Legal & Polish**
1. Create legal acceptance screens (contractor + homeowner)
2. Add accepted_terms fields to users collection
3. Create Terms of Service and Privacy Policy pages
4. Create brand pages (About, FAQ)
5. Implement welcome tutorial modal
6. Create homeowner job status screen
7. **Legal review**: Have attorney review all legal copy

**Sprint 4 (Week of 2025-12-09): Production Hardening**
1. Install Let's Encrypt SSL certificate
2. Setup nightly MongoDB backups to Linode
3. Enable system monitoring (UptimeRobot or similar)
4. Configure log rotation
5. Create smoke test script
6. Final security audit
7. Load testing

**Sprint 5 (Week of 2025-12-16): Admin & Launch Prep**
1. Create admin job management dashboard
2. Implement admin job override capabilities
3. Create contractor stats aggregation views
4. Final end-to-end testing (homeowner → contractor → completion)
5. Production launch checklist
6. **LAUNCH** 🚀

---

## PREVIOUS STATUS: Production Deployment & Stabilization

**STATUS: Backend Deployed ✅ | Frontend Photo Upload FIXED ✅ | Testing In Progress**

### Completed ✅
1. **Backend Deployment**: Successfully deployed on server 172.234.70.157:8001
   - Git repo updated to `merged` branch
   - Python 3.12.3 with venv configured
   - All dependencies installed
   - MongoDB connected and running
   - Systemd service active and enabled
   - Health endpoint responding: `/api/health` returns healthy status

2. **Linode Object Storage**: Credentials configured
   - Fixed `S3_ENDPOINT_HOSTNAME` in providers.env (removed extra text)
   - Bucket: photos.us-iad-10.linodeobjects.com
   - Access key: KI6TNAOLFKWODXWX3M1I
   - Region: us-iad-10
   - **Action Required**: Re-enable storage_provider in server.py line 85 and restart service

3. **Frontend Setup & Photo Upload**: NPM dependencies installed, iOS photo upload fixed
   - Created frontend/.env with EXPO_PUBLIC_BACKEND_URL=http://172.234.70.157:8001
   - Ready to start with `npx expo start`

### In Progress ⏳
4. **Expo Frontend Testing**: Need to start frontend and verify connection to backend
5. **Contractor Dashboard Testing**: Verify dashboard functionality after frontend starts

### Pending 📋
6. **MongoDB Metadata Verification**: Test photo tracking, geomapping, mileage features
7. **Branch Consolidation**: Merge to main after all tests pass

**Next Steps:**
1. Start frontend: `cd frontend && npx expo start`
2. Test contractor dashboard and all features
3. Verify Linode photo uploads work
4. Push changes to merged branch
5. Merge to main when stable

**Server Details:**
- Host: 172.234.70.157
- Backend API: http://172.234.70.157:8001
- API Docs: http://172.234.70.157:8001/docs
- MongoDB: Atlas cluster connected
- Service: handyman-api (systemd)


## CRITICAL BUG FIX: iPhone Photo Upload (2025-11-11)

**ISSUE**: Photos were not displaying correctly on iPhone and duplicate/broken files were being created in Linode Object Storage.

### Root Causes Identified:
1. **iOS FormData Construction**: React Native on iOS requires proper `file://` URI prefix for file uploads. Missing prefix caused empty (0 byte) files.
2. **Duplicate Upload Logic**: Quote submission endpoint was attempting to re-upload photos that were already uploaded via immediate upload endpoint, creating broken duplicate files.
3. **Missing Thumbnails**: UI only showed status indicators (checkmarks) instead of actual photo thumbnails.

### Files Modified:
- `frontend/src/services/api.ts` (lines 120-144, 187-210, 220-236)
  - Fixed: Added proper URI formatting for iOS (`file://` prefix validation)
  - Fixed: Added fallback values for type and name
  - Applied to: `uploadPhotoImmediate`, `uploadJobPhoto`, `uploadReceiptPhoto`

- `frontend/app/quote/request.tsx`
  - Fixed: Added Image component to display actual photo thumbnails
  - Fixed: Added overlay status indicators (uploading/success/failed)
  - Fixed: Added detailed console logging for debugging

- `backend/models/quote.py` (lines 41, 65)
  - Fixed: Updated model comments from "Base64 images" to "Photo URLs (from Linode Object Storage)"

- `backend/server.py` (lines 328-342)
  - **CRITICAL**: Removed duplicate photo upload logic from quote submission endpoint
  - Now: Quote submission uses pre-uploaded photo URLs directly (no re-upload)
  - Result: Only one file per photo in Object Storage

### Photo Upload Flow (CORRECT):
1. User takes/selects photo → Frontend immediately uploads via `/api/photos/upload`
2. Backend uploads to Linode → Returns URL like `https://photos.us-iad-10.linodeobjects.com/customers/{id}/quotes/temp_{uuid}/{filename}.jpg`
3. Frontend stores URL in state with status 'success'
4. User submits quote → Frontend sends photo URLs in `photos` array
5. Backend saves quote with photo URLs (NO re-upload)

### Storage Path Structure:
- Immediate uploads: `customers/{customer_id}/quotes/temp_{uuid}/{photo_random}.jpg` ✅ WORKING
- These paths are kept and referenced in quote documents

### Testing Checklist:
- [x] iPhone photo thumbnails display correctly
- [x] Photos upload to Linode successfully
- [x] No duplicate files created
- [x] Bucket cleanup script created (`cleanup_linode_bucket.py`)


## FEATURE ADDITIONS & IMPROVEMENTS (2025-11-11)

### 1. Contractor Registration Auto-Login Fix

**ISSUE**: Contractor registration required login before photo uploads in later steps, creating poor UX.

**SOLUTION**: Modified contractor registration flow to auto-register and auto-login after Step 1.

**Files Modified**:
- `frontend/app/auth/contractor/register-step1.tsx`
  - Added password and confirmPassword fields to Step1Form interface
  - Added password validation (minimum 8 characters, confirmation match)
  - Implemented immediate registration via `authAPI.register()` after form submit
  - Added auto-login using `login(access_token, refresh_token)` from AuthContext
  - User is now authenticated for all subsequent steps (Step 2-4)

- `frontend/app/auth/contractor/register-step4.tsx`
  - Removed duplicate registration logic
  - Changed to simple completion alert and navigation to contractor dashboard
  - Portfolio photos now upload with valid auth tokens from Step 1

**New Flow**:
1. User fills Step 1 (name, email, phone, business name, password)
2. System registers user immediately with role='TECHNICIAN'
3. System auto-logs in user with JWT tokens
4. User proceeds to Steps 2-4 as authenticated user
5. Photo uploads in Step 2 and Step 4 work correctly with auth headers

### 2. Apple AutoFill Support

**FEATURE**: Added iOS/Safari AutoFill support for better user experience on Apple devices.

**Files Modified**:
- `frontend/app/auth/login.tsx`
  - Added `textContentType="emailAddress"` and `autoComplete="email"` to email input
  - Added `textContentType="password"` and `autoComplete="password"` to password input

- `frontend/app/auth/register.tsx`
  - Added `textContentType="givenName"` and `autoComplete="name-given"` to firstName
  - Added `textContentType="familyName"` and `autoComplete="name-family"` to lastName
  - Added `textContentType="emailAddress"` and `autoComplete="email"` to email
  - Added `textContentType="telephoneNumber"` and `autoComplete="tel"` to phone
  - Added `textContentType="newPassword"` and `autoComplete="password-new"` to password fields

- `frontend/app/auth/contractor/register-step1.tsx`
  - Applied same AutoFill attributes to all contractor registration inputs
  - Added `autoComplete="organization"` and `textContentType="organizationName"` to business name

**Benefits**:
- iOS devices can suggest saved credentials from Keychain
- Safari AutoFill works correctly
- Password managers (1Password, LastPass, etc.) can detect and fill forms
- Better accessibility and UX on Apple platforms

### 3. Service Categories Expansion

**FEATURE**: Expanded service categories from 6 to 12 across homeowner interface.

**Categories Added**:
- HVAC - Thermostats, filters, maintenance
- Flooring - Hardwood, tile, carpet repairs
- Roofing - Shingles, gutters, leak repairs
- Landscaping - Fences, decks, outdoor work
- Appliance - Installation, repair, hookups
- Windows & Doors - Installation, screens, sealing

**Files Modified**:
- `frontend/app/home.tsx` (lines 22-107)
  - Updated serviceCategories array to include all 12 categories
  - Each category has: id, title, icon (Ionicons name), color, description
  - Maintained consistent styling and grid layout

- `frontend/app/quote/request.tsx` (lines 42-139)
  - Updated serviceCategories array to match home.tsx
  - Added both shortDesc (for grid) and fullDesc (for selected view)
  - Categories display in 3-column grid layout for easy selection

**Category Details**:
1. Drywall - Patches, repairs, texturing
2. Painting - Interior, exterior, touch-ups
3. Electrical - Outlets, switches, fixtures
4. Plumbing - Faucets, leaks, installations
5. Carpentry - Doors, trim, repairs
6. HVAC - Thermostats, filters, maintenance (NEW)
7. Flooring - Hardwood, tile, carpet repairs (NEW)
8. Roofing - Shingles, gutters, leak repairs (NEW)
9. Landscaping - Fences, decks, outdoor work (NEW)
10. Appliance - Installation, repair, hookups (NEW)
11. Windows & Doors - Installation, screens, sealing (NEW)
12. Other - TV mounts, honey-do lists

**Contractor Side**:
- Contractor registration (Step 3) uses freeform text input for skills
- No hardcoded category buttons needed on contractor side
- Contractors can list any skills/services in text format

### Testing Status:
- [ ] Manual testing pending by user
- [ ] Photo uploads on homeowner side
- [ ] Photo uploads on contractor side
- [ ] Contractor login and registration flow
- [ ] All 12 service categories display and function correctly
- [ ] Apple AutoFill works on iOS devices

### Next Steps After Testing:
1. User will perform manual testing of all features
2. Delete all branches except main
3. Merge everything to main branch
4. Create comprehensive app summary/documentation
5. Begin work on contractor job creation feature
6. Enhance contractor dashboard functionality


## CONTRACTOR SYSTEM REQUIREMENTS (2025-11-12)

**STATUS: Phase 1 Complete ✅ | Backend Implementation In Progress ⏳**

### Phase 1: Test Account & Navigation (COMPLETED ✅ 2025-11-12)

**1. Test Contractor Account** ✅
- Successfully created test contractor via `backend/create_test_contractor.py`
- Email: contractor@test.com
- Password: TestContractor123!
- User ID: c94813be-e2a2-41c0-9a30-5dca8ffb6688
- Role: TECHNICIAN
- Business: John's Handyman Services
- Skills: Drywall, Painting, Electrical, Plumbing, Carpentry
- Registration Status: ACTIVE
- Registration Expires: 2026-11-12

**2. Contractor Registration Navigation** ✅
- Updated `StepIndicator` component (frontend/src/components/StepIndicator.tsx)
  - Added `onStepPress` prop for navigation callbacks
  - Wrapped steps in TouchableOpacity for clickable interaction
- Updated all registration steps with navigation handlers:
  - `register-step1.tsx` - Prevents forward navigation without completion
  - `register-step2.tsx` - Allows back to step 1, blocks forward until complete
  - `register-step3.tsx` - Allows back to steps 1-2, blocks forward until complete
  - `register-step4.tsx` - Allows navigation to all previous steps
- Navigation preserves params between steps

**3. Edit Profile & Dashboard Updates** ✅
- Created comprehensive contractor profile page (frontend/app/(contractor)/profile.tsx)
  - Displays contact information (email, phone)
  - Shows business details (business name, skills, service areas)
  - Displays registration status and expiration date
  - "Edit Registration" button navigates to registration steps
  - Logout functionality
- Updated contractor dashboard (frontend/app/(contractor)/dashboard.tsx)
  - Added Registration Status card at top
  - Shows registration status badge (ACTIVE)
  - Displays expiration date
  - "Edit" button navigates to registration flow
  - Existing profile button in header navigates to full profile page

**4. Pre-filled Registration Forms** ✅
- Step 1 (Basic Info) pre-fills from user context:
  - First name, last name, email, phone, business name
  - Password fields only required for new registrations
  - Detects edit mode vs new registration
- Step 3 (Profile Details) pre-fills from user context:
  - Skills (comma-separated)
  - Service areas (comma-separated)
  - Years of experience
- Forms use React Hook Form defaultValues for seamless editing

### Phase 2: Backend Implementation (NEXT)

**3. Annual Registration Renewal System**

**Business Rules**:
- Contractor registration must be renewed annually
- All documents (licenses, insurance, certifications) must be re-uploaded
- Registration expiration is calculated from completion date + 365 days
- Contractors receive warning notifications 30 days before expiration
- Contractors receive warning notifications 7 days before expiration
- Expired contractors cannot accept new jobs

**Exemption Rules**:
- If contractor has active jobs (status: IN_PROGRESS, SCHEDULED, or PENDING), they are exempt from forced re-upload
- Exempted contractors can continue working but must renew within grace period
- Grace period: 30 days after expiration if active jobs exist
- After grace period, contractor is marked inactive even with active jobs

**Implementation Details**:

Database Schema Changes:
```javascript
// Add to users collection for TECHNICIAN role:
{
  registration_completed_date: ISODate,
  registration_expiration_date: ISODate,
  registration_status: "ACTIVE" | "EXPIRING_SOON" | "EXPIRED" | "GRACE_PERIOD",
  last_renewal_date: ISODate,
  renewal_notifications_sent: {
    thirty_day: Boolean,
    seven_day: Boolean,
    expiration: Boolean
  }
}

// Add to jobs collection:
{
  status: "PENDING" | "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"
}
```

**Frontend Requirements**:
1. Contractor dashboard displays registration status and expiration date
2. Warning banner when registration is expiring (< 30 days)
3. Renewal button navigates to registration flow
4. Registration steps are pre-filled with existing data
5. Document upload shows current documents with re-upload option
6. Profile page shows registration history

**Backend Requirements**:
1. Endpoint: `GET /api/contractors/registration-status` - Returns current registration status
2. Endpoint: `POST /api/contractors/renew-registration` - Initiates renewal process
3. Endpoint: `GET /api/contractors/active-jobs` - Returns active jobs count and details
4. Scheduled task: Daily check for expiring registrations (send notifications)
5. Scheduled task: Daily check for expired registrations (mark inactive if no grace period)
6. Business logic: Prevent accepting new jobs if registration expired and no grace period

**Testing Requirements**:
- Create contractor with registration expiring in 29 days (test warning)
- Create contractor with registration expiring in 6 days (test urgent warning)
- Create contractor with expired registration and active jobs (test grace period)
- Create contractor with expired registration and no jobs (test inactive status)
- Verify notifications are sent at correct intervals
- Verify job acceptance blocked for expired contractors

**Related Files**:
- `backend/models/user.py` - Add registration date fields
- `backend/models/job.py` - Create job model (if not exists)
- `backend/server.py` - Add contractor endpoints
- `frontend/app/(contractor)/dashboard.tsx` - Add status banner
- `frontend/app/(contractor)/profile.tsx` - Add renewal UI
- `frontend/app/auth/contractor/register-step*.tsx` - Make steps navigable

**Priority**: HIGH - Required for production launch

**Related GitHub Issues**: #TBD (to be created)


---

## Project Overview

**The Real Johnson Handyman Services** - A full-stack handyman booking platform with AI-powered quote generation. The application consists of:
- **Backend**: FastAPI (Python) REST API with MongoDB
- **Frontend**: React Native mobile app with Expo Router (iOS, Android, Web)

## Development Commands

### Backend (FastAPI)

**Setup:**
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Unix/MacOS:
source venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt
```

**Run Server:**
```bash
# From project root with venv activated
uvicorn backend.server:app --host 0.0.0.0 --port 8001 --reload
```

**Environment Setup:**
- Backend environment variables are in `backend/providers/providers.env`
- Required: `MONGO_URL`, `DB_NAME`, `JWT_SECRET`, provider API keys
- Feature flags: `FEATURE_AI_QUOTE_ENABLED`, `ACTIVE_AI_PROVIDER`, `ACTIVE_EMAIL_PROVIDER`, `ACTIVE_SMS_PROVIDER`, `ACTIVE_MAPS_PROVIDER`

**Testing:**
- Integration tests for providers: `python test_email.py`, `python test_sms.py`, `python test_geocode.py`
- Backend API tests: `python backend_test.py`

### Frontend (React Native + Expo)

**Setup:**
```bash
cd frontend
yarn install  # Note: uses yarn, not npm (see packageManager in package.json)
```

**Run Development Server:**
```bash
yarn start          # Start Metro bundler with QR code
yarn android        # Run on Android emulator/device
yarn ios            # Run on iOS simulator/device
yarn web            # Run in web browser
```

**Linting:**
```bash
yarn lint           # Run ESLint with Expo config
```

**Clear Metro Cache (if issues):**
```bash
# Windows:
rmdir /s /q frontend\.metro-cache
# Unix/MacOS:
rm -rf frontend/.metro-cache
```

**Frontend Environment:**
- API base URL configured via `EXPO_PUBLIC_BACKEND_URL` environment variable
- Defaults to `https://therealjohnson.com` in `frontend/src/services/api.ts`
- Uses `react-native-dotenv` for environment variable support

## Code Architecture

### Backend Architecture (FastAPI)

**Core Pattern: Provider Strategy + Service Layer**

The backend uses a **pluggable provider pattern** with abstract base classes for external services:

```
/backend
├── server.py                   # Main FastAPI app, routes, DB initialization
├── auth/
│   └── auth_handler.py         # JWT generation/validation, bcrypt hashing
├── models/                     # Pydantic models (user.py, service.py, quote.py)
├── services/
│   └── pricing_engine.py       # Deterministic pricing calculations
└── providers/                  # Strategy pattern for external services
    ├── __init__.py             # Provider registration and factory
    ├── base.py                 # Abstract base classes
    ├── mock_providers.py       # Mock implementations for dev/test
    ├── ai_provider.py          # OpenAI wrapper
    ├── openai_provider.py      # AI quote suggestions
    ├── google_maps_provider.py # Geocoding
    ├── linode_storage_provider.py # S3-compatible photo storage
    ├── sendgrid_email_provider.py # Email service
    ├── mock_email_provider.py  # Mock email for testing
    ├── twilio_sms_provider.py  # SMS service
    ├── stripe_payment_provider.py # Payment processing
    └── quote_email_service.py  # Quote email HTML generation
```

**Key Architectural Decisions:**

1. **Async-First**: All I/O operations use `async`/`await` (MongoDB via Motor, HTTP calls)
2. **Separate Password Storage**: User passwords stored in separate `user_passwords` collection for security
3. **Two-Token JWT**: Access tokens (30 min) + refresh tokens (7 days) for secure session management
4. **AI as Advisory**: OpenAI suggests hours/materials/complexity, but `PricingEngine` applies deterministic formulas
5. **Immediate Photo Upload**: Photos upload directly to Linode S3 during form submission via `/api/photos/upload` (not embedded in quote documents)
6. **Provider Switching**: Use environment variables (`ACTIVE_AI_PROVIDER=mock|openai`) to switch implementations
7. **Provider Factory Pattern**: `providers/__init__.py` contains provider dictionaries (`AI_PROVIDERS`, `EMAIL_PROVIDERS`, etc.) that map names to classes

**MongoDB Collections:**
- `users` - Customer/technician profiles (indexed: email unique)
- `user_passwords` - Hashed passwords (separate collection for security)
- `services` - Service catalog with pricing models (FLAT|HOURLY|UNIT)
- `quotes` - Quote requests with status workflow (DRAFT→SENT→VIEWED→ACCEPTED/REJECTED)

**Route Prefixes:**
- `/api/auth/*` - Authentication (register, login, refresh, me)
- `/api/services/*` - Service catalog
- `/api/quotes/*` - Quote management (customer-facing)
- `/api/profile/*` - User profile and address management
- `/api/photos/*` - Photo upload to Linode
- `/api/admin/*` - Admin-only routes (require_admin dependency)

**Role-Based Access:**
- Three roles: `CUSTOMER`, `TECHNICIAN`, `ADMIN`
- Use `get_current_user_dependency`, `require_admin`, `require_technician_or_admin` as FastAPI dependencies
- Auth handler provides `require_role()` decorator factory for custom role combinations

### Frontend Architecture (React Native + Expo)

**Core Pattern: File-Based Routing + Context API + React Query**

```
/frontend
├── app/                        # Expo Router (file-based routing)
│   ├── _layout.tsx             # Root layout with QueryClient + AuthProvider
│   ├── index.tsx               # Auth redirect logic (/ → /home or /auth/welcome)
│   ├── home.tsx                # Main dashboard
│   ├── quotes.tsx              # Quotes list
│   ├── auth/
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   ├── contractor/         # Contractor-specific registration flow
│   │   │   └── register-step4.tsx
│   │   └── welcome.tsx
│   └── quote/
│       └── request.tsx         # Quote request form with image picker
└── src/
    ├── components/             # Reusable UI (Button, LoadingSpinner)
    ├── contexts/
    │   └── AuthContext.tsx     # Custom context for auth state (not Zustand)
    ├── services/
    │   └── api.ts              # Axios singleton with interceptors, API methods
    ├── utils/
    │   └── storage.ts          # Cross-platform secure storage wrapper
    └── constants/
        └── theme.ts            # Design system theme constants
```

**Key Architectural Decisions:**

1. **State Management**:
   - **Auth State**: Custom React Context (`AuthContext`) - stores `user`, `isLoading`, `isAuthenticated`
   - **Server State**: TanStack React Query (5 min stale time, retry: 2)
   - **Local State**: `useState` for form inputs
   - **Token Storage**: Expo SecureStore (mobile) / localStorage (web) via `storage.ts` wrapper

2. **API Client Pattern** (`api.ts`):
   - Singleton `APIClient` class with Axios instance
   - **Request Interceptor**: Auto-adds Bearer token from storage
   - **Response Interceptor**: Handles 401 by clearing auth and redirecting
   - Organized methods: `authAPI`, `servicesAPI`, `quotesAPI`, `profileAPI`, `healthAPI`
   - Special `postFormData()` method for multipart uploads with 60s timeout

3. **Authentication Flow**:
   - App load → check storage for token → fetch user → navigate to `/home` or `/auth/welcome`
   - Login/Register → store tokens → fetch user → update context → navigate
   - Logout → clear storage + context → navigate to welcome
   - Data transformation: Backend snake_case → Frontend camelCase in `AuthContext.refreshUser()`

4. **Cross-Platform Support**:
   - `Platform.OS === 'web'` checks for alerts and storage differences
   - Uses `expo-secure-store` on mobile, falls back to `localStorage` on web
   - Metro bundler with file store caching

5. **Routing**:
   - Uses Expo Router's `useRouter()` for programmatic navigation
   - Typed routes enabled (`typedRoutes: true` in app.json)
   - No traditional navigator - routes defined by file structure
   - Use `router.push()`, `router.replace()` for navigation

**Data Flow:**
1. Component calls `authAPI.login(credentials)` → API client
2. API client → Axios request → Backend `/api/auth/login`
3. Response → tokens saved to secure storage
4. `AuthContext.login()` → fetch user data → update context
5. Components re-render via context consumer

## Important Patterns

### Adding a New Provider (Backend)

1. Create abstract base in `providers/base.py` (if needed)
2. Implement mock version in `providers/mock_providers.py`
3. Create real implementation in `providers/<name>_provider.py`
4. Register in `providers/__init__.py` provider dictionaries (e.g., `AI_PROVIDERS["name"] = YourProvider`)
5. Add environment variable for activation (`ACTIVE_<TYPE>_PROVIDER`)
6. Initialize in `server.py` based on env variable

### Adding a New API Endpoint (Backend)

1. Define Pydantic models in `backend/models/`
2. Add route handler in `server.py` under `api_router`
3. Use `Depends(get_current_user_dependency)` for authenticated routes
4. Use `Depends(require_admin)` for admin-only routes
5. Access MongoDB via `db.collection_name` (async operations)
6. Convert datetime objects to ISO strings before saving to MongoDB
7. Parse ISO strings back to datetime/date objects when loading from MongoDB

### Adding a New Screen (Frontend)

1. Create file in `app/` directory (e.g., `app/settings.tsx`)
2. Export default React component
3. Use `useRouter()` from `expo-router` for navigation
4. Use `router.push('/settings')` from any screen to navigate
5. Access auth state via `useAuth()` hook from `AuthContext`

### Making API Calls (Frontend)

1. Add method to `APIClient` class in `src/services/api.ts`
2. Export via namespaced API objects (`authAPI`, `quotesAPI`, etc.)
3. Use React Query for data fetching:
   ```typescript
   const { data, isLoading } = useQuery({
     queryKey: ['quotes'],
     queryFn: () => quotesAPI.getQuotes()
   });
   ```
4. Use `useMutation` for create/update/delete operations

## Critical Implementation Notes

### Backend
- **Always use async/await** for database and external API calls
- **Password hashing**: Use `auth_handler.hash_password()` and `verify_password()`, never store plaintext
- **Token generation**: Use `auth_handler.create_access_token()` with appropriate expiry
- **Provider errors**: Catch `ProviderError` exceptions and handle gracefully
- **MongoDB**: Use `await db.collection.find_one()` syntax (Motor async driver)
- **Feature flags**: Check `FEATURE_AI_QUOTE_ENABLED` before calling AI provider
- **Date serialization**: Convert datetime objects to ISO strings before MongoDB insertion
- **User ID handling**: Check both string and ObjectId formats when querying (`{"$or": [{"user_id": user.id}, {"user_id": str(user.id)}]}`)
- **Photo uploads**: Use `LinodeObjectStorage.upload_photo_direct()` for immediate uploads during form submission
- **Quote email flow**: Two emails sent - immediate confirmation via `send_quote_received_notification()`, then detailed quote via admin endpoint

### Frontend
- **Token management**: Let `APIClient` handle token injection via interceptors
- **Navigation**: Use `router.push()`, `router.replace()`, never manual history manipulation
- **Auth checks**: Use `useAuth()` hook, check `isAuthenticated` before protected screens
- **Platform differences**: Always check `Platform.OS` for web-specific code (alerts, storage)
- **Form validation**: Use React Hook Form for complex forms
- **Image uploads**: Use `expo-image-picker` → FormData → `quotesAPI.uploadPhotoImmediate()`
- **Data transformation**: Transform backend snake_case to camelCase in API responses
- **Error handling**: API client returns Axios errors - check `error.response?.data?.detail` for backend error messages

## Deployment

**Backend Deployment (Systemd + Nginx):**
- Systemd service file: `ops/systemd/handyman-api.service`
- Nginx config: `ops/nginx/`
- Deploy script: `ops/deploy.sh`
- Runs on port 8001, proxied by Nginx

**Frontend Deployment:**
- Web build: `npx expo export --platform web`
- Mobile: Use Expo EAS Build for production apps
- Development: Expo Go app or development builds

## MongoDB Operations

**Common queries** (see `ops/mongodb_commands.txt`):
```javascript
// Find users
db.users.find({ email: "test@example.com" })

// Update quote status
db.quotes.updateOne(
  { _id: "quote-uuid" },
  { $set: { status: "ACCEPTED" } }
)

// Create indexes
db.users.createIndex({ email: 1 }, { unique: true })
db.quotes.createIndex({ customer_id: 1, status: 1 })
```

## Troubleshooting

**Backend Issues:**
- Check `backend/backend.log` for errors
- Verify `backend/providers/providers.env` has all required variables
- Test providers individually: `python test_email.py`, `python test_sms.py`
- Check MongoDB connection: `python test_linode_connection.py`
- ImportError for providers: Check if optional dependencies are installed (sendgrid, twilio, stripe)

**Frontend Issues:**
- Clear Metro cache: `rmdir /s /q frontend\.metro-cache` (Windows) or `rm -rf frontend/.metro-cache` (Unix)
- Check API base URL in `frontend/src/services/api.ts`
- Verify backend is running and accessible
- Check Expo logs for JavaScript errors
- Token issues: Check `storage.ts` implementation for platform-specific behavior

**Common Errors:**
- `401 Unauthorized`: Token expired or invalid, check auth flow
- `Provider not initialized`: Check environment variables in `providers.env`
- `CORS errors`: Verify CORS middleware allows your origin in `server.py`
- `Module not found`: Run `pip install -r backend/requirements.txt` or `yarn install`
- Duplicate photo uploads: Photos are uploaded immediately to Linode, not re-uploaded during quote submission
