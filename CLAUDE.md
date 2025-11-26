# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🎉 RECENT UPDATES

### [2025-11-26 22:50] — Phase 6 Task 6: Placeholder Branding Applied

**Files Modified:**
- `frontend/app/auth/welcome.tsx` (TASK 1)
- `frontend/app/auth/provider-type.tsx` (TASK 1)
- `frontend/app/auth/role-selection.tsx` (TASK 1)
- `frontend/app/auth/handyman/onboarding-intro.tsx` (TASK 6)
- `frontend/app.json` (TASK 5)

**Purpose:**
Completed full branding consolidation by replacing all external asset URLs with local logo imports and updating app configuration to use B&W logo variant with brand-paper background color.

**Summary:**
All external CDN logo URLs successfully replaced with local asset imports using `Handyman_logo_bw.png`. App icon and splash screen now use consistent branding with proper background color (#EFE8DE brand-paper). All logos now load from local assets, eliminating external dependencies.

**Phase 6 COMPLETE:** All 6 tasks successfully implemented:
- ✅ TASK 1: External asset URLs replaced
- ✅ TASK 2: Warranty system UI created (4 screens)
- ✅ TASK 3: Change order UI created (3 screens)
- ✅ TASK 4: Admin dashboard UI created (5 screens)
- ✅ TASK 5: App icon & splash screen configured
- ✅ TASK 6: Placeholder branding applied

---

### [2025-11-26 22:45] — Phase 6 Task 5: App Icon & Splash Screen

**Files Modified:**
- `frontend/app.json`

**Purpose:**
Updated Expo app configuration to use temporary branding for app icon and splash screen using the black and white logo variant with brand-paper background color.

**Changes:**
- App icon: Changed to `Handyman_logo_bw.png`
- Splash screen image: Changed to `Handyman_logo_bw.png`
- Splash background color: Changed to `#EFE8DE` (brand-paper)

**Next Steps:**
- TASK 6: Apply placeholder branding across UI (navbar, footer, landing page, dashboards)

---

### [2025-11-26 22:40] — Phase 6 Task 4: Admin Dashboard UI

**Files Created:**
- `frontend/app/admin/index.tsx`
- `frontend/app/admin/stats.tsx`
- `frontend/app/admin/users.tsx`
- `frontend/app/admin/jobs.tsx`
- `frontend/app/admin/provider-gate.tsx`

**Purpose:**
Created comprehensive admin dashboard system with full platform management capabilities. Admins can view statistics, manage users with search/filtering, manage jobs with status tracking, and control contractor registration types via provider gate.

**Key Features:**
- Admin navigation hub with quick stats overview
- Platform statistics (users, jobs, revenue, pending actions)
- User management table with role filtering and search
- Job management table with status filtering and search
- Provider gate control with visual status indicators and mode selection
- Responsive cards, tables, and status badges throughout

**Next Steps:**
- TASK 5: Add temporary app icon + splash screen
- TASK 6: Apply placeholder branding across UI

---

### [2025-11-26 22:35] — Phase 6 Task 3: Change Order System UI

**Files Created:**
- `frontend/app/(contractor)/change-order/create/[jobId].tsx`
- `frontend/app/(customer)/change-order/[changeOrderId].tsx`
- `frontend/app/(contractor)/change-order/list/[jobId].tsx`

**Purpose:**
Created complete change order workflow UI connected to Phase 5 backend endpoints. Contractors can create change orders with photos and additional cost/hours, customers can approve/reject with notes, contractors can view list of all change orders with status badges and decision notes.

**Key Features:**
- Cost validation supports negative values (credits to customer)
- Visual indicators (green for credits, yellow for additional costs)
- Photo upload capability (max 5 photos)
- Status tracking (pending/approved/rejected)
- Decision notes system for customer feedback

**Next Steps:**
- TASK 4: Create Admin Dashboard UI
- TASK 5: Add temporary app icon + splash
- TASK 6: Apply placeholder branding

---

### [2025-11-26 22:30] — Phase 6 Task 2: Warranty System UI

**Files Created:**
- `frontend/app/(customer)/warranty/request/[jobId].tsx`
- `frontend/app/(customer)/warranty/status/[jobId].tsx`
- `frontend/app/(contractor)/warranty/[jobId].tsx`
- `frontend/app/admin/warranties.tsx`

**Purpose:**
Created complete warranty system UI connected to Phase 5 backend endpoints. Customers can request warranties with photos and view status, contractors can approve/deny with notes, admin can view all warranty requests with filtering.

**Next Steps:**
- TASK 3: Create Change Order UI
- TASK 4: Create Admin Dashboard UI
- TASK 5: Add temporary app icon + splash

---

### [2025-11-26 22:20] — Phase 6 Task 1: Replace External Asset URLs

**Files Modified:**
- `frontend/app/auth/welcome.tsx`
- `frontend/app/auth/provider-type.tsx`
- `frontend/app/auth/role-selection.tsx`

**Purpose:**
Replaced all `customer-assets.emergentagent.com` URLs with local asset imports using temporary logo: `frontend/assets/images/logos/color/Handyman_logo_color.png`.

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

**on 11-10-2025**
I had emergent:
Here is a summary of the security fix and push instructions:

## ✅ Security Fix Summary

### 🔒 .env Files Removed from Git

**What Was Done:**

- Removed `backend/.env` and `backend/providers/providers.env` from git tracking

- Verified these files are listed in .gitignore

- Local .env files remain for development

- API keys and credentials are no longer in version control

**Verification:**

```bash

No .env files found in the repository (checked 10,430 tracked files)

Local .env files still exist for development

.gitignore correctly configured

```

### 📦 Latest Commits on Dev Branch:

1. Security commit (4c844ac) - removed .env files

2. Merge commit (2d1ee63) - merged Emergent branch with service categories and photo fixes

### 🚀 Ready to Push to GitHub:

You can now push your development branch with:

```bash

git push origin dev

```

### 📋 Summary of All Changes:

**Backend:**

- Added 10 new service categories

- Fixed Linode photo upload URL format

- MongoDB Atlas connection established

- API endpoints tested and working

**Security:**

- Sensitive files removed from version control

- Credentials protected

- .gitignore updated

**Frontend:**

- Package conflicts resolved

- Dependencies updated

- Metro Bundler running correctly (React Native/Expo)

### ⚠️ Important Reminder:

When deploying or working on another machine, please make sure to:

1. Create `backend/providers/providers.env` with your API keys

2. Configure the MongoDB connection string

3. Set up provider credentials (OpenAI, Linode, SendGrid, Twilio, etc.)
