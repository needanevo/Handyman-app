# The Real Johnson - Handyman Flow Implementation Plan

## Overview
This document outlines the implementation plan for integrating the handyman (unlicensed) vs licensed contractor flow into The Real Johnson platform, based on the mermaid flowchart provided.

## Mermaid Flowchart Requirements

### Customer Journey ("Hire a Pro" Path)
1. **Landing Page** → Visitor clicks "Hire a Pro"
2. **Address Entry** → Enter address/service area (FIRST STEP)
3. **Service Category** → Choose service type (Plumbing, Electrical, etc.)
4. **Job Description** → Describe job + upload photos
5. **Timing & Budget** → Pick timing & budget range
6. **Account Creation** → Create account or login (AFTER job details)
7. **Job Creation** → Job created in system
8. **Backend Processing** → Match to contractors, send notifications
9. **Contractor Proposals** → Contractors submit quotes
10. **Quote Comparison** → Customer compares quotes
11. **Proposal Acceptance** → Customer accepts one proposal
12. **Job Confirmation** → Date/time + price locked in
13. **Job Completion** → Customer marks job done
14. **Payment Release** → System releases payment
15. **Reviews** → Both parties leave ratings

### Contractor Journey ("Become a Contractor" Path)
1. **Landing Page** → Visitor clicks "Become a Contractor"
2. **Contractor Type Selection** → Choose Handyman OR Licensed Contractor
3. **Account Creation** → Create contractor account
4. **Phone & Email Verification** → Verify contact info
5. **Skills & Service Area** → Enter skills, radius, min job size
6. **Document Upload** → Upload ID, insurance (if licensed), W-9
7. **Banking Setup** → Configure payout method
8. **Admin Review** → Manual approval queue
9. **Approval** → Contractor activated OR request more info
10. **Job Notifications** → Start receiving job offers
11. **Job Acceptance** → Claim jobs and submit proposals
12. **Job Execution** → Complete work
13. **Payment** → Receive payment after customer confirmation
14. **Reviews** → Receive ratings from customers

## Key Differentiations

### Handyman (Unlicensed)
- **Legal Status**: Independent contractor, NOT employee
- **Requirements**: Minimal (ID verification, skills, service radius)
- **Insurance**: Not required (clearly disclosed to customers)
- **Pricing**: Lower rates, competitive advantage
- **Platform Relationship**: Lead generation ONLY
- **Customer Disclosure**: "This is an unlicensed handyman. We are not liable for work quality."

### Licensed Contractor
- **Legal Status**: Independent contractor with professional credentials
- **Requirements**: License, insurance, business registration
- **Insurance**: Required and verified
- **Pricing**: Higher rates, professional service
- **Platform Relationship**: Lead generation + credibility verification
- **Customer Disclosure**: "This is a licensed, insured contractor."

## Legal Framework

### Platform Positioning
**What We Are:**
- Lead generation and advertisement platform
- Connection service between homeowners and service providers
- Record-keeping and communication tools provider
- Transparent pricing facilitator

**What We Are NOT:**
- NOT an employer (all contractors are independent)
- NOT a party to work contracts (customer contracts directly with contractor)
- NOT liable for work quality or outcomes
- NOT providing insurance or warranties
- NOT responsible for contractor tax obligations

### Required Disclaimers

#### Customer-Facing Disclaimers
```
IMPORTANT NOTICE: CONTRACTOR RELATIONSHIP

You are hiring a contractor directly. We provide lead generation
and connection services only.

[For Handyman Jobs]
⚠️ HANDYMAN SERVICES NOTICE:
This service provider is NOT licensed or insured. They offer
lower pricing for basic repairs and tasks. We are not liable
for work quality, damages, or injuries. You contract directly
with the handyman at your own risk.

[For Licensed Contractors]
✓ LICENSED CONTRACTOR:
This service provider is licensed and carries insurance.
We have verified their credentials. However, your work
contract is directly with them, not with us.

YOUR RESPONSIBILITIES:
• You contract directly with the service provider
• We are not a party to the work agreement
• We are not liable for work quality or outcomes
• Service provider insurance status shown is informational only
• Verify credentials independently if desired

By proceeding, you acknowledge this relationship.
```

#### Contractor-Facing Disclaimers
```
INDEPENDENT CONTRACTOR ACKNOWLEDGEMENT

You are registering as an INDEPENDENT CONTRACTOR lead platform member.

YOU ARE RESPONSIBLE FOR:
✓ Tracking and reporting your income and taxes
✓ Managing your mileage and expense records
✓ Maintaining required licenses and insurance (if applicable)
✓ Setting your own pricing and terms
✓ Filing all tax returns (1099-NEC, Schedule C, etc.)
✓ Obtaining necessary business permits
✓ Compliance with all local laws and regulations

WE PROVIDE:
✓ Lead generation and customer connections
✓ Job tracking and workflow tools
✓ Record-keeping dashboards (informational only)
✓ Payment processing facilitation
✓ Communication platform

WE DO NOT PROVIDE:
✗ Employment relationship or benefits
✗ Tax withholding or reporting (you receive 1099 if earnings > $600)
✗ Workers compensation insurance
✗ Liability insurance for your work
✗ Legal representation
✗ Accounting or tax services

DISCLAIMER: All reports in the app are informational only and
not official tax documentation. Consult your tax professional.

By checking this box, I acknowledge that I am an independent
contractor, not an employee, and I am solely responsible for
all tax obligations and legal compliance.

□ I Accept - [version 1.0, logged with timestamp and IP]
```

## Implementation Phases

### Phase 1: Customer Flow Restructure (Priority: P0)
**Tasks:**
1. Create new landing page with prominent "Hire a Pro" and "Become a Contractor" buttons
2. Restructure customer job request flow:
   - Step 0: Address entry (NEW)
   - Step 1: Service category selection (MOVE FROM home.tsx)
   - Step 2: Photos + job description (EXISTING, enhance)
   - Step 3: Budget range + timing selection (NEW)
   - Step 4: Account creation/login (MOVE FROM before)
   - Step 5: Review and submit (EXISTING, update)
3. Add account creation modal that appears AFTER job details collected
4. Update routing to reflect new flow

### Phase 2: Contractor Type Differentiation (Priority: P0)
**Tasks:**
1. Add contractor type selection in registration:
   - "Register as Handyman" option
   - "Register as Licensed Contractor" option
2. Update contractor registration Step 2 to conditionally require:
   - Handyman: Basic ID only
   - Licensed: License, insurance, business registration
3. Add `contractor_type` field to user model (handyman | licensed)
4. Update contractor profile to display type badge
5. Add verification flags: `is_licensed`, `is_insured`, `license_verified`

### Phase 3: Legal Disclaimers (Priority: P0)
**Tasks:**
1. Create disclaimer component for contractor type display
2. Add disclaimer screen in customer flow (before job submission):
   - Show after contractor proposals received
   - Require explicit acknowledgment
   - Log acceptance with timestamp and IP
3. Add contractor terms acceptance screen:
   - Show during registration
   - Require scroll-to-bottom + checkbox
   - Log acceptance with version, timestamp, IP
4. Update database schema:
   - Add `accepted_terms_version` to users table
   - Add `accepted_terms_date` to users table
   - Add `accepted_terms_ip` to users table
   - Add `customer_disclaimer_accepted` boolean
5. Create legal pages:
   - Full Terms of Service
   - Privacy Policy
   - Contractor Agreement
   - Customer Service Agreement

### Phase 4: Job Matching & Proposals (Priority: P1)
**Tasks:**
1. Backend: Implement job matching algorithm:
   - Match by skills
   - Match by service radius (50 miles)
   - Match by contractor type (if customer specifies preference)
2. Backend: Create notification system:
   - Push notifications to contractors
   - SMS to contractors
   - Email to contractors
3. Frontend: Build contractor job board:
   - "Available Jobs" screen
   - Job details view
   - "Submit Proposal" form
4. Frontend: Build customer quote comparison:
   - List of received proposals
   - Contractor profiles with badges (handyman vs licensed)
   - Clear disclaimer for each contractor type
   - Sort by price, rating, distance
   - Accept proposal button

### Phase 5: Job Scheduling & Execution (Priority: P1)
**Tasks:**
1. Frontend: Build job scheduling screen:
   - Date/time picker
   - Confirmation from both parties required
2. Frontend: Build job tracking dashboard:
   - Customer view: Job status, contractor contact, chat
   - Contractor view: Job details, customer contact, chat
3. Backend: Implement job status workflow:
   - States: pending → scheduled → in_progress → completed → reviewed
4. Frontend: Build chat/messaging system (optional, can use SMS initially)

### Phase 6: Completion & Reviews (Priority: P1)
**Tasks:**
1. Frontend: Build job completion flow:
   - Customer marks job complete
   - Contractor confirms completion
2. Frontend: Build review/rating system:
   - 5-star rating
   - Written review
   - Photo uploads (before/after)
3. Backend: Implement payment release trigger:
   - Release payment after customer marks complete
   - Hold period for disputes (24-48 hours)
4. Frontend: Display reviews on contractor profiles:
   - Average rating
   - Review list
   - Response from contractor

### Phase 7: Admin Tools (Priority: P2)
**Tasks:**
1. Build admin dashboard for job monitoring
2. Build contractor approval queue
3. Build dispute resolution interface
4. Build fraud detection tools

## File Structure

### New Files to Create
```
frontend/app/
├── landing.tsx                          # NEW: Main landing page
├── (customer)/
│   ├── job-request/
│   │   ├── step0-address.tsx            # NEW: Address entry
│   │   ├── step1-category.tsx           # NEW: Service category
│   │   ├── step2-photos.tsx             # RENAME from step1-photos.tsx
│   │   ├── step3-describe.tsx           # RENAME from step2-describe.tsx
│   │   ├── step4-budget-timing.tsx      # NEW: Budget and timing
│   │   ├── step5-account.tsx            # NEW: Account creation
│   │   ├── step6-review.tsx             # RENAME from step3-review.tsx
│   ├── quotes/
│   │   ├── compare.tsx                  # NEW: Compare contractor proposals
│   │   ├── [quoteId]/
│   │   │   ├── details.tsx              # NEW: Quote details view
│   │   │   ├── accept.tsx               # NEW: Accept quote flow
│   ├── jobs/
│   │   ├── [jobId]/
│   │   │   ├── schedule.tsx             # NEW: Schedule job
│   │   │   ├── tracking.tsx             # NEW: Track job progress
│   │   │   ├── complete.tsx             # NEW: Mark complete
│   │   │   ├── review.tsx               # NEW: Leave review
│   ├── disclaimers/
│   │   ├── contractor-type.tsx          # NEW: Contractor type disclaimer
├── (contractor)/
│   ├── jobs/
│   │   ├── board.tsx                    # NEW: Available jobs board
│   │   ├── [jobId]/
│   │   │   ├── details.tsx              # ENHANCE: Job details
│   │   │   ├── proposal.tsx             # NEW: Submit proposal
│   ├── onboarding/
│   │   ├── contractor-type.tsx          # NEW: Choose handyman or licensed
├── legal/
│   ├── terms.tsx                        # EXISTS: Enhance with disclaimers
│   ├── privacy.tsx                      # NEW: Privacy policy
│   ├── customer-agreement.tsx           # NEW: Customer service agreement
│   ├── contractor-terms.tsx             # NEW: Contractor terms (detailed)
├── components/
│   ├── ContractorTypeBadge.tsx          # NEW: Badge component
│   ├── DisclaimerCard.tsx               # NEW: Disclaimer component
│   ├── QuoteCard.tsx                    # NEW: Quote display card
│   ├── JobCard.tsx                      # NEW: Job display card
│   ├── ReviewCard.tsx                   # NEW: Review display card
```

### Backend Files to Modify/Create
```
backend/
├── models/
│   ├── user.py                          # ADD: contractor_type, license fields
│   ├── job.py                           # ADD: Job model
│   ├── proposal.py                      # NEW: Proposal model
│   ├── review.py                        # NEW: Review model
├── services/
│   ├── job_matching.py                  # NEW: Job matching algorithm
│   ├── notification_service.py          # NEW: Notifications
├── server.py                            # ADD: Job, proposal, review endpoints
```

## Database Schema Changes

### Users Table (Existing, Add Fields)
```python
{
  # Existing fields...

  # New contractor fields
  "contractor_type": str,  # "handyman" | "licensed" | null (for customers)
  "is_licensed": bool,
  "is_insured": bool,
  "license_number": str,
  "insurance_policy_number": str,
  "license_verified": bool,
  "insurance_verified": bool,
  "license_expiry_date": datetime,
  "insurance_expiry_date": datetime,

  # Legal acceptance tracking
  "accepted_terms_version": str,
  "accepted_terms_date": datetime,
  "accepted_terms_ip": str,
  "customer_disclaimer_accepted": bool,
  "customer_disclaimer_accepted_date": datetime,
}
```

### Jobs Table (New)
```python
{
  "id": str,  # UUID
  "customer_id": str,
  "contractor_id": str,  # null until accepted
  "status": str,  # "pending" | "proposals_received" | "scheduled" | "in_progress" | "completed" | "reviewed"
  "service_category": str,
  "address": {
    "street": str,
    "city": str,
    "state": str,
    "zip": str,
    "lat": float,
    "lon": float,
  },
  "title": str,
  "description": str,
  "photos": [str],  # URLs
  "budget_min": float,
  "budget_max": float,
  "urgency": str,  # "low" | "medium" | "high"
  "preferred_timing": str,
  "contractor_type_preference": str,  # null | "handyman" | "licensed" | "no_preference"
  "created_at": datetime,
  "scheduled_date": datetime,
  "completed_date": datetime,
  "accepted_proposal_id": str,
}
```

### Proposals Table (New)
```python
{
  "id": str,  # UUID
  "job_id": str,
  "contractor_id": str,
  "quoted_price": float,
  "estimated_duration": str,
  "proposed_start_date": datetime,
  "message": str,
  "status": str,  # "pending" | "accepted" | "rejected" | "withdrawn"
  "created_at": datetime,
  "accepted_at": datetime,
}
```

### Reviews Table (New)
```python
{
  "id": str,  # UUID
  "job_id": str,
  "reviewer_id": str,  # Can be customer or contractor
  "reviewee_id": str,  # Can be customer or contractor
  "reviewer_role": str,  # "customer" | "contractor"
  "rating": int,  # 1-5 stars
  "review_text": str,
  "photos": [str],  # Optional before/after photos
  "created_at": datetime,
  "response_text": str,  # Optional response from reviewee
  "response_date": datetime,
}
```

## UI/UX Considerations

### Design Consistency
- Use existing color scheme: `colors.primary.main` (#FF6B35)
- Use existing typography: `typography.sizes.*`, `typography.weights.*`
- Use existing spacing: `spacing.*`
- Use existing components: Button, Input, Card, etc.
- Match existing screen layouts and navigation patterns

### Accessibility
- Ensure all disclaimers are readable and prominent
- Use high contrast for important warnings
- Provide clear visual indicators for contractor types
- Include icons with text labels

### Mobile-First
- All screens must work on mobile (primary platform)
- Use responsive layouts
- Test on iOS and Android
- Ensure touch targets are appropriately sized

## Testing Plan

### Unit Tests
- Test contractor type logic
- Test job matching algorithm
- Test disclaimer acceptance tracking

### Integration Tests
- Test full customer journey
- Test full contractor journey
- Test payment flow
- Test review system

### User Acceptance Testing
1. Customer creates job request (handyman preference)
2. Handyman receives notification
3. Handyman submits proposal
4. Customer sees disclaimer and accepts
5. Customer accepts proposal
6. Job is scheduled
7. Handyman completes job
8. Customer marks complete
9. Both leave reviews
10. Payment is released

## Timeline Estimates

- **Phase 1**: 3-4 days
- **Phase 2**: 2-3 days
- **Phase 3**: 2-3 days
- **Phase 4**: 4-5 days
- **Phase 5**: 3-4 days
- **Phase 6**: 2-3 days
- **Phase 7**: 3-4 days (optional, can defer)

**Total**: 19-26 days for full implementation (Phases 1-6)

## Success Criteria

✅ Customer can request a job without creating account first
✅ Customer explicitly chooses handyman vs licensed contractor (or no preference)
✅ Customer sees clear disclaimers before accepting proposals
✅ Contractor chooses type during registration
✅ Handyman registration requires minimal docs (no license/insurance)
✅ Licensed contractor registration requires full verification
✅ Contractors receive job notifications based on skills and radius
✅ Contractors can submit proposals
✅ Customers can compare proposals and see contractor types clearly
✅ Job scheduling and tracking work end-to-end
✅ Review system works bidirectionally
✅ All legal disclaimers are shown and logged
✅ Design matches existing app perfectly

## Next Steps

1. Review and approve this implementation plan
2. Begin Phase 1: Customer Flow Restructure
3. Implement incrementally, testing each phase
4. Deploy to production after Phase 3 (includes legal disclaimers)
5. Continue with Phases 4-6 for full functionality
