# SECURITY BASELINE – THE REAL JOHNSON PLATFORM

This document defines non-negotiable security requirements for the Handyman platform
(API, mobile apps, web, automation, and infra). All future work MUST comply.

---

## 1. Secrets & Configuration

- No API keys, passwords, or tokens in git.
- All secrets live only in:
  - `backend/.env`
  - `backend/providers/providers.env`
  - server env vars / systemd units
- Rotate keys immediately if any secret ever touches logs, screenshots, or commits.

## 2. Transport Security

- All public endpoints served only over **HTTPS** (Let's Encrypt).
- HTTP → 301 redirect to HTTPS at Nginx.
- HSTS enabled on production domains.

## 3. Auth & Session

- Passwords: bcrypt (or better) only; never logged.
- JWT:
  - Access tokens: short TTL (≤ 30 min).
  - Refresh tokens: stored server-side or securely, revocable.
- Role-based access:
  - `CUSTOMER`, `TECHNICIAN`, `HANDYMAN`, `ADMIN` enforced on every protected route.
- No anonymous access to any data that can identify a user.

## 4. Data Protection

- PII stored only in necessary collections.
- Sensitive fields (address, phone, email) never logged in plaintext.
- Backups:
  - Regular MongoDB backups.
  - Encrypted at rest.
- Data deletion path for user account removal (soft delete OK but documented).

## 5. Payments & Accounting (Stripe / Intuit)

- Stripe publishable keys only in frontend; secret keys only on server.
- All Stripe webhooks:
  - Verified signatures.
  - Idempotent handlers.
- Intuit / QuickBooks:
  - OAuth tokens stored encrypted.
  - Scopes limited to the minimal needed.

## 6. External Providers (HD / Lowe's / Email / SMS / Maps)

- Each provider isolated behind a provider interface.
- Timeouts + retries + circuit-breaker style fallbacks for every external call.
- Provider errors never leak raw API responses to clients.

## 7. Logging & Monitoring

- Logs:
  - No secrets, JWTs, or full card data.
  - Only last 4 of card where needed.
- Centralized logging on server (journalctl + rotated files).
- Health endpoints for:
  - API
  - n8n
  - DB
  - background workers

## 8. Server & Network Hardening

- SSH:
  - Key-based auth only (no password logins) on production.
  - Root login disabled where feasible, or used only for emergency with audit.
- Firewall (ufw):
  - Only 22, 80, 443, and required app ports open.
- Fail2ban (or equivalent) enabled for SSH + nginx.

## 9. Automation & n8n

- n8n only reachable through HTTPS domain (no raw port exposed publicly).
- Workflows that touch production:
  - Read-only by default; writes explicitly documented.
- Any AI agents with repo access:
  - Read-only on main unless explicitly allowed.
  - Writes via PRs / patches.

## 10. IP Protection / Legal

- All code MIT or proprietary as decided (document in LICENSE).
- Trademarks:
  - "The Real Johnson"
  - "[Handyman product name]"
- No third-party assets (fonts, images, logos) used without a license trail.

---

**Rule:**
If a change conflicts with this baseline, update the baseline *first*, then the code.
Nothing ships that violates this file.
