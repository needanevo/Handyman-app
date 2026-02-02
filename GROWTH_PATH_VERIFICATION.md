# Growth Path Verification Features

**Status:** Planned for Phase 6+
**Last Updated:** 2026-01-15

## Overview

The Real Johnson platform is designed to help handymen grow from individuals into licensed contractors. As they hit milestones, we need to verify their progress and unlock new features/higher rates.

## Current State (Phase 5)

✅ **Already Tracked in Database** (see `backend/models/user.py`):
- `has_llc: bool` - Whether they've formed an LLC
- `llc_formation_date: datetime` - When LLC was formed
- `is_licensed: bool` - Trade license status
- `license_number: str` - License number
- `license_state: str` - State of licensure
- `license_expiry: datetime` - License expiration
- `is_insured: bool` - Liability insurance status
- `insurance_policy_number: str` - Policy number
- `insurance_expiry: datetime` - Insurance expiration
- `upgrade_to_technician_date: datetime` - When handyman became licensed contractor

✅ **Already in UI** (handyman dashboard):
- Growth Path panel shows milestones: "Form an LLC", "Get Licensed", "Add Insurance"
- Milestone cards navigate to growth center

## Phase 6: Verification System

### 1. LLC Verification

**What to verify:**
- Business name registered with state
- EIN from IRS
- Operating agreement exists

**Implementation:**
- Upload document: Certificate of Formation or Articles of Organization
- OCR scan for business name, formation date, state
- Manual admin review if OCR fails
- Mark `has_llc = True` and set `llc_formation_date`

**UI Changes:**
- `/handyman/growth/llc` - Document upload form
- Show "Pending Verification" badge after upload
- Admin dashboard: Queue of LLC verifications

### 2. Insurance Verification

**What to verify:**
- General liability insurance certificate
- Coverage amount (minimum $1M recommended)
- Policy is current (not expired)
- Named insured matches user

**Implementation:**
- Upload Certificate of Insurance (COI)
- Parse: policy number, coverage amount, expiry date, insurer name
- Verify not expired
- Optional: Call insurance company API to verify active policy
- Mark `is_insured = True` and set `insurance_policy_number`, `insurance_expiry`

**UI Changes:**
- `/handyman/growth/insurance` - COI upload form
- Show expiry date and renewal reminders (30 days, 7 days before)
- Admin dashboard: Insurance verification queue

### 3. Trade License Verification

**What to verify:**
- Valid trade license from state/county
- License number matches name
- Not expired or suspended
- Covers appropriate trade categories

**Implementation:**
- Upload license document or enter license number
- State-specific verification:
  - Some states have online lookup (scrape or API)
  - Others require manual verification
- Parse: license number, expiry, categories/classifications
- Mark `is_licensed = True` and set all license fields
- Trigger `upgrade_to_technician_date` when verified

**UI Changes:**
- `/handyman/growth/license` - License upload/entry form
- Show license categories and expiry
- Admin dashboard: License verification queue

### 4. Brand/Logo

**What to verify:**
- Professional logo image
- Meets minimum quality standards (resolution, file size)
- Not offensive or trademarked

**Implementation:**
- Upload logo image
- Validate: PNG/JPG, min 512x512px, max 2MB
- Store in Linode Object Storage
- Manual admin review for appropriateness
- Save to `profile_photo` field

**UI Changes:**
- `/handyman/growth/branding` - Logo upload form
- Preview logo in profile and job cards
- Admin dashboard: Logo approval queue

## Impact of Verification

### Tier System (already in database)
- `tier: 'beginner' | 'verified' | 'contractor' | 'master'`

**Tier Progression:**
1. **Beginner Handyman** - Just signed up, no verifications
2. **Verified Business Handyman** - Has LLC + Insurance
3. **Licensed Contractor** - Has license (triggers `is_licensed = True`)
4. **Master Contractor** - License + 50+ completed jobs + 4.8+ rating

### Unlocked Features
- **LLC Verified:** Can hire helpers, access team management
- **Insurance Verified:** Higher job limits, commercial work
- **Licensed:** Rebrand as "Contractor", access restricted job categories (electrical, plumbing, HVAC)
- **Branding:** Logo shows in all customer-facing materials

### Rate Increases
- Beginner: Base rate
- Verified Business: +15% rate premium
- Licensed Contractor: +30% rate premium
- Master: +50% rate premium

## Admin Dashboard Requirements

**Verification Queue:**
- List of pending verifications by type
- Document viewer (PDF/image)
- Approve/Reject buttons with reason field
- Auto-email user on decision

**Provider Management:**
- Search providers by name, tier, verification status
- Manually adjust tiers or verification status
- View document history

## Future Enhancements (Phase 7+)

- Automated OCR for all document types
- Integration with state license lookup APIs
- Insurance carrier API integrations (Progressive, State Farm, etc.)
- Expiration tracking and auto-renewal reminders
- Background check integration (Checkr, etc.)
- Continuing education credit tracking

---

## Implementation Priority

1. **Phase 6A:** Basic document upload + manual admin review
2. **Phase 6B:** OCR parsing for automation
3. **Phase 6C:** Tier progression + rate premium enforcement
4. **Phase 7:** API integrations for real-time verification

---

**Note:** This document is a planning reference. Do not implement until Phase 5 is complete and customer job posting is live.
