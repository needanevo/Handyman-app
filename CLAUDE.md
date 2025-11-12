# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## CURRENT DIRECTIVE: Complete Production MVP

**STATUS: Core Features Working ✅ | Jobs System Needed 🔴 | Infrastructure Hardening Required 🟡**

**Progress: 45% Complete** (25/55 tasks)

---

## 🔴 HIGH PRIORITY - BLOCKING MVP LAUNCH

### Jobs Management System (CRITICAL)
**Status**: Not Started | **Priority**: P0 - Blocking

- [ ] Create Job model (`backend/models/job.py`)
  - Fields: id, contractor_id, customer_id, quote_id, status, scheduled_date, completed_date
  - Status enum: PENDING, SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED

- [ ] Implement POST `/api/jobs` endpoint
  - Accept quote acceptance
  - Create job record
  - Trigger contractor assignment workflow

- [ ] Implement GET `/api/jobs/:id/quotes` endpoint
  - Return all quotes associated with a job

- [ ] Implement routing logic
  - Skill matching algorithm
  - Nearest zip code calculation
  - Contractor capacity checks
  - `routingEnabled` flag with email fallback

- [ ] Email notifications
  - Customer: Quote accepted, job scheduled
  - Contractor: New job assigned
  - Admin: Job created (if routingEnabled=false)

**Why Critical**: Customers can request quotes but can't actually book jobs. This breaks the entire workflow.

**Estimated Effort**: 2-3 days

---

### Database Schema & Constraints
**Status**: Partially Complete | **Priority**: P0 - Blocking

- [ ] Create `jobs` collection with indexes
  ```javascript
  db.jobs.createIndex({ contractor_id: 1, status: 1 })
  db.jobs.createIndex({ customer_id: 1, created_at: -1 })
  db.jobs.createIndex({ status: 1, scheduled_date: 1 })
  ```

- [ ] Create `events` collection for audit trail
  ```javascript
  db.events.createIndex({ entity_type: 1, entity_id: 1, created_at: -1 })
  db.events.createIndex({ created_at: -1 })
  ```

- [ ] Add phone unique constraint
  ```javascript
  db.users.createIndex({ phone: 1 }, { unique: true, sparse: true })
  ```

- [ ] Create `photos` metadata collection
  ```javascript
  db.photos.createIndex({ customer_id: 1, created_at: -1 })
  db.photos.createIndex({ quote_id: 1 })
  db.photos.createIndex({ job_id: 1 })
  ```

- [ ] Verify and document all existing indexes
  - Run `db.users.getIndexes()`, `db.quotes.getIndexes()`, etc.
  - Document in ops/mongodb_commands.txt

**Why Critical**: Missing indexes cause slow queries. Missing unique constraints allow duplicate data.

**Estimated Effort**: 1 day

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

## 📊 COMPLETION TRACKING

### Current Status (2025-11-12)

**COMPLETED** (25 tasks - 45%):
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
- ✅ Collections: users, user_passwords, quotes, services
- ✅ iPhone photo upload fix
- ✅ Contractor profile page
- ✅ Registration step navigation
- ✅ Test contractor account

**IN PROGRESS** (5 tasks - 10%):
- 🟡 Contractor annual renewal system (documented, not implemented)
- 🟡 Success criteria documentation (partially complete)
- 🟡 Infrastructure testing (basic deployment done, hardening needed)

**NOT STARTED** (25 tasks - 45%):
- ❌ Jobs management system (CRITICAL)
- ❌ Contractor routing logic (CRITICAL)
- ❌ Database indexes and constraints (CRITICAL)
- ❌ HTTPS/SSL setup (HIGH)
- ❌ Backups and monitoring (HIGH)
- ❌ Server hardening verification (MEDIUM)
- ❌ Admin tools and users (LOW)
- ❌ Docker migration (FUTURE)

---

## 🎯 NEXT SPRINT GOALS

**Sprint 1 (This Week): Jobs System**
1. Create Job model
2. Implement POST /jobs endpoint
3. Implement contractor routing (skill + zip + capacity)
4. Add email notifications
5. Create jobs collection with indexes

**Sprint 2 (Next Week): Production Hardening**
1. Install Let's Encrypt SSL
2. Setup nightly backups
3. Enable monitoring and alerts
4. Configure log rotation
5. Finalize domain name

**Sprint 3 (Following Week): Polish & Launch**
1. Complete contractor renewal system backend
2. Create admin dashboard
3. Final security audit
4. Load testing
5. Production launch

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
