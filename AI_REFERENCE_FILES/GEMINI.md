
# Handyman App

## Project Overview

This project is a full-stack application for a handyman service marketplace. It connects customers with contractors, providing a platform for quote requests, job management, and payments.

**Key Technologies:**

*   **Backend:** FastAPI (Python)
*   **Frontend:** React Native with Expo (TypeScript)
*   **Database:** MongoDB
*   **Authentication:** JWT
*   **Payments:** Stripe (with escrow)
*   **File Storage:** Linode Object Storage
*   **Email:** SendGrid
*   **AI:** OpenAI for quote suggestions

**Architecture:**

The application follows a modern client-server architecture. The FastAPI backend provides a RESTful API for all application logic, while the React Native frontend offers a cross-platform mobile experience for both customers and contractors.

## Building and Running

### Backend

1.  **Install dependencies:**
    ```bash
    pip install -r backend/requirements.txt
    ```

2.  **Run the server:**
    ```bash
    uvicorn backend.server:app --reload
    ```

### Frontend

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Run the development server:**
    ```bash
    npx expo start
    ```

## Development Conventions

### Frontend

*   **Component Library:** The project uses a custom component library, with components located in `frontend/src/components`.
*   **Design System:** A design system is in place, with tokens for colors, typography, spacing, etc., defined in `frontend/src/constants/theme.ts`. See `frontend/DESIGN_SYSTEM_GUIDE.md` for more details.
*   **State Management:** `AuthContext` is used for authentication state.
*   **API Service:** A centralized API service at `frontend/src/services/api.ts` is used for all backend communication.

### Backend

*   **Modular Structure:** The backend is organized into modules for authentication, models, providers, and services.
*   **Dependency Injection:** FastAPI's dependency injection system is used to manage dependencies.
*   **Providers:** The `providers` module contains abstractions for external services like email, storage, and payments.

## Known Issues

### Photo Uploads Not Working

*   **Issue:** The photo upload feature was not working because the API call to upload the photos was commented out and the data was not being sent in the correct format.
*   **Fix:** The `handleSubmit` function in `frontend/app/(customer)/job-request/step3-review.tsx` has been updated to first upload the photos to the backend using the `quotesAPI.uploadPhotoImmediate` function and then create the job request with the returned photo URLs.

## Deployment

### Production vs Development

**IMPORTANT:** The deployment strategy differs significantly between development and production environments.

#### Development Environment
- **Backend:** Run locally with `uvicorn backend.server:app --reload`
- **Frontend:** Run locally with `npx expo start` (Metro bundler)
- **Resource Usage:** Metro bundler is RAM-intensive (300-500MB+)

#### Production Environment (Live Server)

**DO NOT run `npx expo start` on the production server.** The Expo development server (Metro bundler) is extremely RAM-intensive and will crash servers with limited RAM (< 4GB).

**Correct Production Setup:**

1. **Backend (FastAPI):**
   - Runs continuously on port 8001
   - Managed via systemd service or `start.sh` script
   - RAM usage: ~120-150MB
   - Location: `/srv/handyman-app/Handyman-app-main/`

2. **Frontend (React Native Web):**
   - Build static files: `npx expo export --platform web`
   - Deploy to nginx directory: `/var/www/handyman-frontend/`
   - Served by nginx (no separate process needed)
   - RAM usage: ~0 (served as static files)

3. **Nginx Configuration:**
   - Frontend: Serves static files from `/var/www/handyman-frontend/`
   - API Proxy: Routes `/api/*` requests to `http://127.0.0.1:8001`
   - Config: `/etc/nginx/sites-available/therealjohnson.com`

### Deploying Frontend Updates

To deploy frontend changes to production:

```bash
# Build the frontend for web
cd /root/Handyman-app/frontend
npx expo export --platform web

# Deploy to nginx directory
rm -rf /var/www/handyman-frontend/*
cp -r dist/* /var/www/handyman-frontend/

# Fix permissions
chown -R www-data:www-data /var/www/handyman-frontend/
```

### Common Deployment Issues

#### Port Conflicts (Error: Address Already in Use)
- **Symptom:** Backend crashes with `[Errno 98] address already in use`
- **Cause:** Multiple processes trying to bind to port 8001
- **Solution:** Ensure only ONE backend process is running
  - Check running processes: `ps aux | grep uvicorn`
  - Check port usage: `netstat -tlnp | grep 8001`
  - Stop systemd service if using manual start: `systemctl mask handyman-api`

#### Server Crashes When Running Expo
- **Symptom:** SSH connection drops, server becomes unresponsive
- **Cause:** Metro bundler exhausts available RAM
- **Solution:** Never run `npx expo start` on production server; use static build instead

#### RAM Considerations
- **Minimum Recommended:** 2GB RAM (tight but workable)
- **Comfortable:** 4GB+ RAM
- **Current Usage:**
  - Backend: ~120MB
  - Nginx: ~50MB
  - System: ~1GB
  - Available: ~700MB (on 2GB server)

### Mobile App Deployment

For native mobile apps (iOS/Android):

1. **Build with EAS:**
   ```bash
   npx eas build --platform ios
   npx eas build --platform android
   ```

2. **Distribution:**
   - iOS: TestFlight → App Store
   - Android: Google Play Store

Mobile apps connect directly to the backend API at `https://therealjohnson.com/api/`

## Features Under Development

### Contractor Registration

*   **Description:** A comprehensive registration flow for contractors to join the platform.
*   **Implementation:** A multi-step registration process to collect basic information, documents (licenses, insurance), and profile details. The frontend implementation is now complete in `frontend/app/auth/contractor/`. A "Register as a Contractor" button has been added to the welcome screen (`frontend/app/auth/welcome.tsx`) to initiate this flow.

### Dashboards

*   **Description:** Dashboards for both customers and contractors to manage their jobs and interactions.
*   **Implementation Plan:**
    1.  **Customer Dashboard:** A central place for customers to view their active and past jobs, track job progress, and communicate with contractors.
    2.  **Contractor Dashboard:** A dashboard for contractors to manage their profile, view available jobs, and track their earnings.
    3.  Placeholder files have been created at `frontend/app/(customer)/dashboard.tsx` and `frontend/app/(contractor)/dashboard.tsx`.

### Scheduler

*   **Description:** A scheduling system to coordinate job times between customers and contractors.
*   **Implementation Plan:** This feature will be implemented after the contractor registration and dashboards are complete.
