# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**The Real Johnson Handyman Services** - A full-stack handyman booking platform with AI-powered quote generation. The application consists of:
- **Backend**: FastAPI (Python) REST API with MongoDB
- **Frontend**: React Native mobile app with Expo Router (iOS, Android, Web)

## Development Commands

### Backend (FastAPI)

**Setup:**
```bash
cd /root/Handyman-app
python -m venv .venv
source .venv/bin/activate  # or `.venv/bin/activate` on Windows
pip install -r backend/requirements.txt
```

**Run Server:**
```bash
# From project root with venv activated
uvicorn backend.server:app --host 0.0.0.0 --port 8001 --reload
```

**Alternative (using start script):**
```bash
./start.sh
```

**Environment Setup:**
- Backend environment variables are in `backend/providers/providers.env`
- Required: `MONGO_URL`, `DB_NAME`, `JWT_SECRET`, provider API keys
- Feature flags: `FEATURE_AI_QUOTE_ENABLED`, `ACTIVE_AI_PROVIDER`, `ACTIVE_EMAIL_PROVIDER`

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
rm -rf frontend/.metro-cache
```

**Frontend Environment:**
- No `.env` file by default - API base URL is hardcoded in `frontend/src/services/api.ts`
- Uses `react-native-dotenv` for environment variable support if needed

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
    ├── base.py                 # Abstract base classes
    ├── mock_providers.py       # Mock implementations for dev/test
    ├── openai_provider.py      # AI quote suggestions
    ├── google_maps_provider.py # Geocoding
    ├── linode_storage_provider.py # S3-compatible photo storage
    ├── sendgrid_email_provider.py # Email service
    ├── twilio_sms_provider.py  # SMS service
    ├── stripe_payment_provider.py # Payment processing
    └── quote_email_service.py  # Quote email HTML generation
```

**Key Architectural Decisions:**

1. **Async-First**: All I/O operations use `async`/`await` (MongoDB via Motor, HTTP calls)
2. **Separate Password Storage**: User passwords stored in separate `user_passwords` collection
3. **Two-Token JWT**: Access tokens (30 min) + refresh tokens (7 days)
4. **AI as Advisory**: OpenAI suggests hours/materials/complexity, but `PricingEngine` applies deterministic formulas
5. **Immediate Photo Upload**: Photos upload directly to Linode S3 during form submission (not embedded in quote documents)
6. **Provider Switching**: Use environment variables (`ACTIVE_AI_PROVIDER=mock|openai`) to switch implementations

**MongoDB Collections:**
- `users` - Customer/technician profiles (indexed: email unique)
- `user_passwords` - Hashed passwords (separate for security)
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
- Use `get_current_user`, `require_admin`, `require_technician_or_admin` as FastAPI dependencies

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
│   │   └── welcome.tsx
│   └── quote/
│       └── request.tsx         # Quote request form with image picker
└── src/
    ├── components/             # Reusable UI (Button, LoadingSpinner)
    ├── contexts/
    │   └── AuthContext.tsx     # Custom context for auth state (not Zustand)
    ├── services/
    │   └── api.ts              # Axios singleton with interceptors, API methods
    └── utils/
        └── storage.ts          # Cross-platform secure storage wrapper
```

**Key Architectural Decisions:**

1. **State Management**:
   - **Auth State**: Custom React Context (`AuthContext`) - stores `user`, `isLoading`, `isAuthenticated`
   - **Server State**: TanStack React Query (5 min stale time, retry: 2)
   - **Local State**: `useState` for form inputs
   - **Token Storage**: Expo SecureStore (mobile) / localStorage (web)

2. **API Client Pattern** (`api.ts`):
   - Singleton `APIClient` class with Axios instance
   - **Request Interceptor**: Auto-adds Bearer token from storage
   - **Response Interceptor**: Handles 401 by clearing auth and redirecting
   - Organized methods: `authAPI`, `servicesAPI`, `quotesAPI`, `profileAPI`

3. **Authentication Flow**:
   - App load → check storage for token → fetch user → navigate to `/home` or `/auth/welcome`
   - Login/Register → store tokens → fetch user → update context → navigate
   - Logout → clear storage + context → navigate to welcome

4. **Cross-Platform Support**:
   - `Platform.OS === 'web'` checks for alerts and storage differences
   - Uses `expo-secure-store` on mobile, falls back to `localStorage` on web
   - Metro bundler with file store caching

5. **Routing**:
   - Uses Expo Router's `useRouter()` for programmatic navigation
   - Typed routes enabled (`typedRoutes: true` in app.json)
   - No traditional navigator - routes defined by file structure

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
4. Register in `providers/__init__.py` provider dictionaries
5. Add environment variable for activation (`ACTIVE_<TYPE>_PROVIDER`)
6. Initialize in `server.py` based on env variable

### Adding a New API Endpoint (Backend)

1. Define Pydantic models in `backend/models/`
2. Add route handler in `server.py` under `api_router`
3. Use `Depends(get_current_user)` for authenticated routes
4. Use `Depends(require_admin)` for admin-only routes
5. Access MongoDB via `db.collection_name` (async operations)

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
- **Token generation**: Use `auth_handler.encode_token()` with appropriate expiry
- **Provider errors**: Catch `ProviderError` exceptions and handle gracefully
- **MongoDB**: Use `await db.collection.find_one()` syntax (Motor async driver)
- **Feature flags**: Check `FEATURE_AI_QUOTE_ENABLED` before calling AI provider

### Frontend
- **Token management**: Let `APIClient` handle token injection via interceptors
- **Navigation**: Use `router.push()`, `router.replace()`, never manual history manipulation
- **Auth checks**: Use `useAuth()` hook, check `isAuthenticated` before protected screens
- **Platform differences**: Always check `Platform.OS` for web-specific code (alerts, storage)
- **Form validation**: Use React Hook Form for complex forms
- **Image uploads**: Use `expo-image-picker` → FormData → `photosAPI.uploadPhotoImmediate()`

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

**Frontend Issues:**
- Clear Metro cache: `rm -rf frontend/.metro-cache`
- Check API base URL in `frontend/src/services/api.ts`
- Verify backend is running and accessible
- Check Expo logs for JavaScript errors

**Common Errors:**
- `401 Unauthorized`: Token expired or invalid, check auth flow
- `Provider not initialized`: Check environment variables in `providers.env`
- `CORS errors`: Verify CORS middleware allows your origin in `server.py`
- `Module not found`: Run `pip install -r requirements.txt` or `yarn install`
