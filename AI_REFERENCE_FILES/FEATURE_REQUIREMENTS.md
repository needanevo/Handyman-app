# Handyman App - Feature Requirements Document

**Project**: The Real Johnson Handyman Services
**Date**: 2025-11-05
**Status**: Planning Phase
**Current Stack**: FastAPI (Backend), React Native + Expo (Frontend), MongoDB, JWT Auth

---

## Executive Summary

This document outlines the feature requirements for expanding the handyman application from a basic quote request system to a comprehensive contractor marketplace with escrow payments, contractor management, and automated job distribution.

---

## Current System Overview

### Backend (FastAPI)
- User authentication (JWT-based)
- Quote request system
- Service catalog
- OpenAI integration for quote suggestions
- SendGrid email notifications
- Linode object storage for photos
- MongoDB database

### Frontend (React Native + Expo)
- User registration and login
- Service browsing
- Quote request submission with photo upload
- Profile management

---

## New Feature Requirements

### 1. Enhanced Contractor Registration System

**Priority**: High
**Complexity**: Medium
**Dependencies**: None

#### Requirements
- **License Verification**
  - Upload and store contractor licenses
  - Validation workflow for admin approval
  - Expiration date tracking with automatic notifications
  - Support for multiple license types (general contractor, electrical, plumbing, etc.)

- **Driver's License Verification**
  - Secure upload and storage of driver's license
  - ID verification workflow (manual or automated via third-party service)
  - Privacy compliance (PII handling)

- **Extended Contractor Profile**
  - Business name and EIN
  - Insurance information (liability, workers comp)
  - Service areas (zip codes or radius-based)
  - Years of experience
  - Specializations and certifications

#### Technical Considerations
- Secure document storage (Linode Object Storage with encryption)
- Admin dashboard for verification workflow
- Email notifications for verification status updates
- Consider integration with license verification APIs (if available)

---

### 2. Contractor Profile Questionnaire & Portfolio

**Priority**: High
**Complexity**: Medium
**Dependencies**: Enhanced Registration System

#### Requirements
- **Profile Questionnaire**
  - Skills and expertise areas
  - Preferred job types and sizes
  - Availability (hours, days of week)
  - Equipment and tools owned
  - Team size (solo vs crew)
  - Emergency service availability

- **Portfolio Management**
  - Upload multiple photos per project
  - Project descriptions and completion dates
  - Before/after photo organization
  - Customer testimonials (optional)
  - Public-facing portfolio page

#### Technical Considerations
- Image optimization and thumbnail generation
- Gallery UI component for mobile and web
- Storage quota management per contractor
- Content moderation for uploaded photos

---

### 3. Email Blast System for Job Distribution

**Priority**: Critical
**Complexity**: Medium-High
**Dependencies**: Contractor Profile System

#### Requirements
- **Automated Job Matching**
  - Match jobs to contractors based on:
    - Service category expertise
    - Geographic proximity (zip code or radius)
    - Availability status
    - Past performance ratings
    - License type requirements

- **Email Distribution**
  - Send job notification to 5 best-matched contractors simultaneously
  - Email includes:
    - Job description and photos
    - Customer location (masked address for privacy)
    - Budget range
    - Urgency level
    - Preferred dates
    - Link to accept job

- **Selection Algorithm**
  - Prioritize contractors with:
    - Right of first refusal status (if applicable)
    - Highest ratings in relevant category
    - Closest geographic proximity
    - Recent availability updates
    - Low decline/penalty rates

#### Technical Considerations
- Queue management for email sending (avoid spam limits)
- Template system for email customization
- Tracking of email opens and clicks
- Fallback mechanism if no contractors accept
- Load balancing to prevent over-distribution to top contractors

---

### 4. First-Come-First-Served Job Acceptance

**Priority**: Critical
**Complexity**: Medium
**Dependencies**: Email Blast System

#### Requirements
- **2-Hour Decision Window**
  - Contractors have 2 hours from email receipt to accept job
  - Clear countdown timer in email and app
  - Automatic expiration after 2 hours

- **One-Click Acceptance**
  - Authenticated link in email for instant acceptance
  - Confirmation page showing job details
  - Immediate notification to customer upon acceptance

- **Race Condition Handling**
  - First contractor to click "Accept" gets the job
  - Immediate lock-out of other contractors
  - Notification to declined contractors

- **Automatic Re-Distribution**
  - If no acceptance within 2 hours, send to next batch of 5 contractors
  - Maximum 3 distribution rounds before manual intervention

#### Technical Considerations
- Real-time job status updates (WebSocket or polling)
- Atomic operations for job assignment (prevent double-booking)
- Email delivery tracking to calculate 2-hour window accurately
- Push notifications for mobile app users

---

### 5. Right of First Refusal Mechanism

**Priority**: Medium
**Complexity**: Medium
**Dependencies**: Job History, Performance Tracking

#### Requirements
- **Eligibility Criteria**
  - Completed at least 3 jobs for the customer
  - Average rating of 4.5+ stars from that customer
  - No penalties in last 6 months

- **ROFR Process**
  - Customer option to enable/disable ROFR for specific contractors
  - Preferred contractor gets 4-hour exclusive window (before 5-contractor blast)
  - If declined/expired, proceeds to standard email blast

- **Customer Control**
  - Customer can set multiple preferred contractors (ranked)
  - Option to bypass ROFR for urgent jobs

- **Contractor Dashboard**
  - List of customers with ROFR status
  - Notification when new ROFR job is available

#### Technical Considerations
- Customer-contractor relationship tracking in database
- Performance metrics calculation
- Modified job distribution workflow with ROFR pre-check
- Clear communication to customers about ROFR benefits

---

### 6. Escrow Payment System with Milestone-Based Releases

**Priority**: Critical
**Complexity**: High
**Dependencies**: Stripe Integration, Job Acceptance System

#### Requirements

##### 6.1 Initial Payment (Upfront)
- **2/3 Upfront Payment**
  - Customer pays 2/3 of quoted amount upon job acceptance
  - Funds held in escrow (Stripe Connect or similar)
  - Breakdown: Majority for materials, remainder for labor deposit

- **Payment Method**
  - Credit card, debit card, ACH
  - Saved payment methods for returning customers
  - Payment receipt generation

##### 6.2 First Release: Materials Delivery
- **80% Materials Cost Release**
  - Triggered when contractor uploads material receipts
  - Customer reviews receipts in app
  - Default auto-approval after 24 hours
  - Customer can override approval/rejection

- **Receipt Upload Requirements**
  - Photos of itemized receipts
  - Must match estimated materials list
  - Contractor can add notes/explanations

- **Approval Workflow**
  - Customer notification of receipt upload
  - Review interface showing receipts and estimated costs
  - Approve/Reject buttons with reason field
  - If rejected, contractor can dispute or upload new receipts

##### 6.3 Second Release: 50% Job Completion
- **Progress Milestone**
  - Contractor marks job as 50% complete
  - Upload progress photos
  - Brief description of work completed

- **Release Amount**
  - 50% of remaining escrowed labor cost
  - Automatic release after customer approval or 48-hour timeout

- **Customer Verification**
  - Photo review
  - Option to schedule on-site inspection (virtual or in-person)
  - Dispute mechanism if unsatisfied

##### 6.4 Final Release: Job Completion
- **Completion Requirements**
  - Contractor uploads final photos (before/after comparison)
  - Marks job as complete
  - Customer receives notification

- **Customer Review Period**
  - 3-day review window
  - On-site or photo verification
  - Option to request revisions (punch list)

- **Final Payment Release**
  - Remaining escrowed funds released to contractor
  - Customer prompted to rate and tip

- **Tipping Option**
  - Optional tip (suggested 10%, 15%, 20%, custom)
  - Tip goes directly to contractor (no platform fee)
  - Tip processed separately from escrow release

##### 6.5 Dispute Resolution
- **Dispute Triggers**
  - Customer rejects materials receipts
  - Customer unsatisfied with 50% milestone
  - Customer disputes final completion

- **Escalation Process**
  - In-app messaging for contractor/customer communication
  - Admin review if not resolved within 3 days
  - Photo evidence and messaging history available to admin
  - Admin decision is final (or third-party arbitration for high-value disputes)

- **Refund Policy**
  - Partial refunds based on work completed
  - Platform fee non-refundable
  - Chargeback protection for contractors

#### Technical Considerations
- **Stripe Connect Account Structure**
  - Platform account (The Real Johnson)
  - Connected accounts for each contractor
  - Escrow holding (Stripe Balance or separate escrow service)

- **Transaction Flow**
  - Customer → Platform → Escrow → Contractor (staged releases)
  - Transaction fee calculation (platform fee + payment processing)

- **Security & Compliance**
  - PCI DSS compliance for payment handling
  - ACH verification for contractor bank accounts
  - Tax reporting (1099 generation for contractors)

- **Database Schema**
  - Payment transaction history
  - Escrow release timeline
  - Receipt uploads linked to transactions
  - Dispute records and resolutions

---

### 7. Material Receipt Upload & Approval Workflow

**Priority**: High
**Complexity**: Medium
**Dependencies**: Escrow System, Photo Upload

#### Requirements
- **Upload Interface (Contractor)**
  - Drag-and-drop or camera upload
  - Multiple receipts per job
  - OCR to extract totals (optional enhancement)
  - Notes field for explanations

- **Review Interface (Customer)**
  - Side-by-side view: estimated vs actual costs
  - Zoom and pan for receipt images
  - Approve all/individual receipts
  - Request clarification button

- **Automatic Approval**
  - 24-hour timer starts on upload
  - Customer notified via email and push notification
  - Auto-approve if no action taken

- **Receipt Storage**
  - Linked to specific job and payment milestone
  - Accessible in job history
  - Export option for customer tax records

#### Technical Considerations
- Integration with Linode Object Storage
- OCR library (Tesseract or cloud-based)
- Notification system for approval reminders
- Audit trail for all approval actions

---

### 8. Contractor Availability Locking (One Job at a Time)

**Priority**: Medium
**Complexity**: Low-Medium
**Dependencies**: Job Acceptance System

#### Requirements
- **Automatic Lock**
  - When contractor accepts job, status changes to "Unavailable"
  - Removed from email blast distribution for new jobs
  - Clear indicator in contractor dashboard

- **Manual Override**
  - Contractor can mark themselves available even with active job
  - Use case: Job is small, contractor can handle multiple
  - Admin can unlock if needed

- **Automatic Unlock**
  - When job is marked complete and final payment released
  - Contractor automatically returned to available pool

- **Availability Calendar (Future Enhancement)**
  - Contractors set available dates/times in advance
  - System respects calendar when sending job blasts

#### Technical Considerations
- Contractor status field in database
- Job distribution query filters out unavailable contractors
- Real-time status updates via push notifications

---

### 9. Penalty System for Post-Acceptance Declines

**Priority**: Medium
**Complexity**: Low
**Dependencies**: Job Acceptance System

#### Requirements
- **Penalty Trigger**
  - Contractor accepts job then declines/cancels
  - Does not apply to customer-initiated cancellations

- **1-Week Ineligibility**
  - Contractor blocked from receiving new job emails for 7 days
  - Clearly communicated in acceptance confirmation
  - Dashboard countdown timer during penalty period

- **Exceptions**
  - Medical emergency (requires documentation)
  - Family emergency (admin discretion)
  - Force majeure events

- **Appeal Process**
  - Contractor can submit appeal with explanation
  - Admin reviews within 24 hours
  - One appeal per penalty instance

- **Escalating Penalties (Future)**
  - 2nd offense: 2-week suspension
  - 3rd offense: 30-day suspension
  - 4th offense: Account termination

#### Technical Considerations
- Penalty tracking in contractor profile
- Automated suspension expiration
- Email notification when penalty is lifted
- Admin override capability

---

### 10. Legal Disclaimer & Liability Protection

**Priority**: Critical
**Complexity**: Low (Legal) / Medium (Technical)
**Dependencies**: Terms of Service, User Agreement

#### Requirements
- **Platform Liability Disclaimer**
  - Clear statement that platform is a marketplace, not the service provider
  - Contractors are independent contractors, not employees
  - Platform not liable for work quality, injuries, or property damage

- **Acceptance Points**
  - User registration (checkbox required)
  - Before first job request (customer)
  - Before first job acceptance (contractor)
  - Updated terms require re-acceptance

- **Insurance Requirements**
  - Contractors must maintain liability insurance
  - Proof of insurance upload during registration
  - Annual renewal reminders

- **Customer Acknowledgment**
  - Customer acknowledges they are hiring independent contractor
  - Customer responsible for verifying contractor credentials
  - Platform provides matching service only

- **Dispute Resolution Clause**
  - Binding arbitration for disputes
  - Venue and governing law
  - Class action waiver

#### Technical Considerations
- Legal document versioning system
- User acceptance audit trail (timestamp, IP, version)
- Insurance document storage and expiration tracking
- Integration with e-signature service (optional)

#### Legal Counsel Requirements
- Draft terms of service with attorney
- Review liability limitations per state law
- Ensure compliance with contractor classification laws
- Review payment processing agreements

---

### 11. Future Integration: Home Depot/Lowes Pricing API

**Priority**: Low (Future Phase)
**Complexity**: High
**Dependencies**: Vendor API Access, Material Estimation System

#### Requirements
- **Real-Time Pricing**
  - API integration with Home Depot and Lowes
  - Fetch current prices for materials in estimate
  - Display price comparison (if both available)

- **Material Database**
  - Common handyman materials catalog
  - SKU mapping to vendor catalogs
  - Quantity calculation based on job scope

- **Contractor Selection**
  - Contractor chooses preferred vendor
  - Customer can override vendor preference
  - Price updates reflected in quote

- **Receipt Verification**
  - Compare uploaded receipt to estimated materials
  - Flag significant discrepancies
  - Explain price differences (sale, different brand, etc.)

#### Technical Considerations
- API rate limiting and caching
- Handling API downtime gracefully
- Product matching algorithms (SKU variations)
- Geographic availability (store location matters)

#### Current Status
- Research phase: Determine API availability and costs
- Not blocking any other features
- Can start with manual material pricing

---

### 12. In-App Chat System

**Priority**: Medium-High
**Complexity**: High
**Dependencies**: WebSocket infrastructure, Push Notifications

#### Requirements
- **Chat Functionality**
  - Real-time messaging between customer and contractor
  - Available after job acceptance
  - Photo sharing in chat
  - Read receipts
  - Message history persistence

- **Notifications**
  - Push notifications for new messages
  - Email fallback if app not installed
  - Mute/unmute options

- **Security & Privacy**
  - Messages encrypted in transit (TLS)
  - Messages linked to specific job
  - Auto-delete messages after job completion + 90 days

- **Moderation**
  - Flagging inappropriate messages
  - Admin review capability
  - Automated profanity filter

- **File Sharing**
  - Images (progress photos, receipts)
  - PDFs (contracts, permits)
  - Size limits and virus scanning

#### Technical Considerations
- **Technology Options**
  - WebSocket server (Socket.io, Django Channels, custom)
  - Third-party chat SDK (Twilio, SendBird, Stream)
  - Cost-benefit analysis

- **Backend Architecture**
  - Message storage (MongoDB or separate chat DB)
  - Message queue for delivery
  - Scalability considerations

- **Frontend Components**
  - React Native chat UI library
  - Typing indicators
  - Image gallery view
  - Voice message support (future)

---

## Implementation Roadmap

### Phase 1: Foundation (4-6 weeks)
**Goal**: Contractor onboarding and job distribution

1. Enhanced Contractor Registration (License + Driver's License)
2. Contractor Profile Questionnaire
3. Email Blast System (5 contractors)
4. First-Come-First-Served Job Acceptance (2-hour window)
5. Contractor Availability Locking

**Deliverables**:
- Contractor registration flow
- Admin verification dashboard
- Job matching algorithm
- Email templates
- Acceptance workflow

### Phase 2: Payments & Compliance (6-8 weeks)
**Goal**: Escrow system and legal protection

1. Stripe Connect Integration
2. Escrow Payment System (3 milestone releases)
3. Material Receipt Upload & Approval
4. Legal Disclaimers & Terms of Service
5. Penalty System Implementation

**Deliverables**:
- Payment processing infrastructure
- Receipt review UI
- Escrow release automation
- Legal document management
- Penalty tracking system

### Phase 3: Enhanced Features (4-6 weeks)
**Goal**: Improved user experience and retention

1. Right of First Refusal
2. In-App Chat System
3. Contractor Portfolio System
4. Customer Review & Rating Improvements
5. Push Notification Infrastructure

**Deliverables**:
- Chat functionality (real-time messaging)
- Portfolio gallery UI
- ROFR matching logic
- Enhanced notification system

### Phase 4: Advanced Integrations (Future)
**Goal**: Automation and third-party services

1. Home Depot/Lowes API Integration
2. Automated License Verification (third-party API)
3. OCR for Receipt Processing
4. Advanced Analytics Dashboard
5. Contractor Performance Metrics

**Deliverables**:
- Vendor API integrations
- Automated verification systems
- Analytics reporting
- Performance dashboards

---

## Technical Architecture Updates

### Database Schema Extensions

#### Contractors Collection (Extended)
```javascript
{
  _id: ObjectId,
  user_id: String,
  business_name: String,
  ein: String,
  licenses: [
    {
      type: String, // "general", "electrical", "plumbing", etc.
      number: String,
      state: String,
      expiration_date: Date,
      document_url: String,
      verified: Boolean,
      verified_by: String, // admin user_id
      verified_at: Date
    }
  ],
  drivers_license: {
    number: String,
    state: String,
    expiration_date: Date,
    document_url: String,
    verified: Boolean,
    verified_at: Date
  },
  insurance: {
    liability_policy_number: String,
    liability_expiration: Date,
    liability_document_url: String,
    workers_comp_policy_number: String,
    workers_comp_expiration: Date,
    workers_comp_document_url: String
  },
  profile: {
    years_experience: Number,
    specializations: [String],
    service_areas: [String], // zip codes
    team_size: Number,
    equipment_owned: [String],
    availability_hours: String,
    emergency_services: Boolean
  },
  portfolio: [
    {
      id: String,
      title: String,
      description: String,
      photos: [String], // URLs
      completion_date: Date,
      category: String
    }
  ],
  availability_status: String, // "available", "busy", "unavailable"
  stripe_account_id: String,
  penalties: [
    {
      reason: String,
      start_date: Date,
      end_date: Date,
      appealed: Boolean,
      appeal_result: String
    }
  ],
  performance_metrics: {
    total_jobs_completed: Number,
    average_rating: Number,
    on_time_completion_rate: Number,
    acceptance_rate: Number,
    decline_after_acceptance_count: Number
  }
}
```

#### Jobs Collection (New)
```javascript
{
  _id: ObjectId,
  quote_id: String, // links to quotes collection
  customer_id: String,
  contractor_id: String,
  status: String, // "pending_acceptance", "materials_ordered", "in_progress_50", "completed", "disputed"
  distributed_to: [
    {
      contractor_id: String,
      sent_at: Date,
      expires_at: Date,
      opened: Boolean,
      declined: Boolean
    }
  ],
  accepted_by: String, // contractor_id
  accepted_at: Date,
  rofr_contractor_id: String, // if ROFR applied
  rofr_sent_at: Date,
  rofr_expires_at: Date,
  distribution_round: Number,
  created_at: Date,
  updated_at: Date
}
```

#### Payments Collection (New)
```javascript
{
  _id: ObjectId,
  job_id: String,
  customer_id: String,
  contractor_id: String,
  total_amount: Number,
  initial_payment: {
    amount: Number,
    stripe_payment_intent_id: String,
    paid_at: Date,
    status: String
  },
  escrow_balance: Number,
  releases: [
    {
      milestone: String, // "materials", "50_percent", "completion"
      amount: Number,
      requested_at: Date,
      approved_at: Date,
      released_at: Date,
      stripe_transfer_id: String,
      status: String, // "pending", "approved", "released", "disputed"
      evidence: [String], // photo URLs
      customer_notes: String
    }
  ],
  tip: {
    amount: Number,
    stripe_payment_intent_id: String,
    paid_at: Date
  },
  platform_fee: Number,
  created_at: Date,
  updated_at: Date
}
```

#### Customer-Contractor Relationships Collection (New)
```javascript
{
  _id: ObjectId,
  customer_id: String,
  contractor_id: String,
  jobs_completed: Number,
  average_rating: Number,
  rofr_enabled: Boolean,
  rofr_priority: Number, // if multiple preferred contractors
  last_job_date: Date,
  created_at: Date
}
```

#### Messages Collection (New)
```javascript
{
  _id: ObjectId,
  job_id: String,
  sender_id: String,
  sender_role: String, // "customer" or "contractor"
  recipient_id: String,
  message_text: String,
  attachments: [
    {
      type: String, // "image", "pdf"
      url: String,
      filename: String
    }
  ],
  read: Boolean,
  read_at: Date,
  flagged: Boolean,
  created_at: Date,
  expires_at: Date // auto-delete after 90 days post-job
}
```

### API Endpoints to Add

#### Contractor Management
- `POST /api/contractors/register` - Enhanced registration with license upload
- `GET /api/contractors/profile` - Get contractor profile
- `PUT /api/contractors/profile` - Update profile and questionnaire
- `POST /api/contractors/portfolio` - Add portfolio item
- `GET /api/contractors/portfolio` - List portfolio items
- `PUT /api/contractors/availability` - Update availability status

#### Job Distribution
- `POST /api/jobs/distribute` - Trigger job distribution to contractors
- `GET /api/jobs/pending` - Get jobs pending acceptance
- `POST /api/jobs/{job_id}/accept` - Accept a job
- `POST /api/jobs/{job_id}/decline` - Decline a job

#### Payments & Escrow
- `POST /api/payments/initial` - Process initial payment
- `POST /api/payments/{job_id}/request-release` - Request milestone release
- `POST /api/payments/{job_id}/approve-release` - Customer approves release
- `POST /api/payments/{job_id}/dispute` - File payment dispute
- `POST /api/payments/{job_id}/tip` - Process tip

#### Material Receipts
- `POST /api/receipts/upload` - Upload material receipts
- `GET /api/receipts/{job_id}` - Get receipts for job
- `POST /api/receipts/{receipt_id}/approve` - Approve receipt
- `POST /api/receipts/{receipt_id}/reject` - Reject receipt

#### Chat
- `POST /api/messages/send` - Send message
- `GET /api/messages/{job_id}` - Get message history
- `PUT /api/messages/{message_id}/read` - Mark message as read
- `POST /api/messages/{message_id}/flag` - Flag inappropriate message

#### Admin
- `GET /api/admin/contractors/pending-verification` - List contractors needing verification
- `POST /api/admin/contractors/{id}/verify` - Verify contractor documents
- `GET /api/admin/disputes` - List active disputes
- `POST /api/admin/disputes/{id}/resolve` - Resolve dispute

### Frontend Navigation Updates

#### Contractor App Sections
1. **Dashboard**
   - Available jobs (if not locked)
   - Active job status
   - Upcoming milestones
   - Earnings summary

2. **Profile**
   - Business information
   - License management
   - Portfolio gallery
   - Performance metrics

3. **Jobs**
   - Job history
   - Current job details
   - Payment timeline

4. **Messages**
   - Active job chats
   - Notification badge

5. **Payments**
   - Earnings breakdown
   - Pending releases
   - Payment history
   - Tax documents

#### Customer App Sections
1. **Home**
   - Request new service
   - Active jobs
   - Preferred contractors (ROFR)

2. **Jobs**
   - Job history
   - Track current job progress
   - Review milestones

3. **Messages**
   - Chat with assigned contractor

4. **Payments**
   - Payment methods
   - Transaction history
   - Receipts review

5. **Profile**
   - Addresses
   - Preferences
   - Saved contractors

---

## Risk Assessment & Mitigation

### Technical Risks

1. **Payment Processing Failures**
   - **Risk**: Escrow release failures, double charges
   - **Mitigation**: Idempotent API calls, extensive testing, Stripe webhooks for verification

2. **Race Conditions in Job Acceptance**
   - **Risk**: Multiple contractors accepting same job
   - **Mitigation**: Atomic database operations, pessimistic locking, real-time status checks

3. **Chat System Scalability**
   - **Risk**: WebSocket server overload
   - **Mitigation**: Use proven third-party service, horizontal scaling, message queues

4. **MongoDB Authentication Issues**
   - **Risk**: Database connection failures blocking startup
   - **Mitigation**: Graceful degradation, connection pooling, health check endpoints (already implemented)

### Business Risks

1. **Contractor Adoption**
   - **Risk**: Not enough contractors register
   - **Mitigation**: Incentive programs, referral bonuses, competitive fee structure

2. **Customer Trust in Escrow**
   - **Risk**: Customers hesitant to pay upfront
   - **Mitigation**: Clear explanation of escrow protection, money-back guarantee, testimonials

3. **Dispute Volume**
   - **Risk**: High dispute rate overwhelming admin
   - **Mitigation**: Clear milestone definitions, photo evidence requirements, automated resolutions where possible

4. **Legal Liability**
   - **Risk**: Lawsuits from customers or contractors
   - **Mitigation**: Strong ToS, insurance requirements, legal counsel review, platform liability insurance

### Compliance Risks

1. **Contractor Misclassification**
   - **Risk**: IRS/state claims contractors are employees
   - **Mitigation**: Clear independent contractor agreements, no control over work methods, 1099 reporting

2. **Payment Processing Regulations**
   - **Risk**: PCI-DSS, AML, KYC violations
   - **Mitigation**: Use Stripe's compliance infrastructure, contractor identity verification

3. **Data Privacy (GDPR, CCPA)**
   - **Risk**: Improper handling of PII (licenses, IDs)
   - **Mitigation**: Data encryption, retention policies, user data export/deletion features

---

## Success Metrics

### KPIs to Track

1. **Contractor Metrics**
   - Contractor registration completion rate
   - Average time to verification
   - Job acceptance rate (target: >60%)
   - Decline-after-acceptance rate (target: <5%)
   - Average contractor rating (target: >4.5)

2. **Customer Metrics**
   - Quote request to job completion rate
   - Customer satisfaction score (target: >4.7)
   - Repeat customer rate (target: >40%)
   - ROFR utilization rate

3. **Platform Metrics**
   - Jobs distributed per week
   - Average time to contractor acceptance (target: <1 hour)
   - Dispute rate (target: <3%)
   - Payment processing success rate (target: >99%)
   - Chat message volume (engagement indicator)

4. **Financial Metrics**
   - Gross merchandise value (GMV)
   - Platform revenue (fees)
   - Average job value
   - Payment release velocity

---

## Open Questions & Decisions Needed

1. **Platform Fee Structure**
   - Percentage-based or flat fee per job?
   - Different rates for different service categories?
   - Fee charged to contractor, customer, or split?

2. **Contractor Vetting Rigor**
   - Manual verification for all contractors, or automated for some?
   - Background checks required?
   - Credit checks for high-value jobs?

3. **Escrow Provider**
   - Use Stripe Connect exclusively, or separate escrow service?
   - What's the cost difference?
   - Compliance requirements?

4. **Chat System Build vs Buy**
   - Build custom WebSocket server?
   - Use third-party SDK (SendBird, Stream, Twilio)?
   - Cost analysis?

5. **Home Depot/Lowes API**
   - Is API access available?
   - What are the costs and rate limits?
   - Fallback if APIs unavailable?

6. **Geographic Expansion**
   - Start local (Baltimore area) or nationwide?
   - State-by-state license requirements research needed
   - Insurance requirements vary by state

7. **Customer Support Staffing**
   - In-house support team vs outsourced?
   - 24/7 support or business hours?
   - Phone, email, chat, or all three?

---

## Conclusion

This feature set transforms the application from a simple quote request system to a comprehensive contractor marketplace with escrow payments, automated job distribution, and built-in accountability mechanisms. The phased approach allows for iterative development and validation of core features before adding advanced functionality.

**Next Steps**:
1. Prioritize Phase 1 features and create detailed technical specifications
2. Consult with legal counsel on terms of service and liability protection
3. Research Stripe Connect account structure and pricing
4. Design database schema updates and plan migration strategy
5. Create wireframes for new UI screens (contractor dashboard, receipt review, chat)
6. Estimate development timeline and resource requirements

**MongoDB Connection Issue Note**:
The current MongoDB authentication failure has been addressed by implementing graceful degradation in the startup event handler. The server now starts successfully and serves API requests even if database seeding fails. The connection string has been updated with URL encoding for the password's special character. For production use, verify the MongoDB credentials are correct and the database user has appropriate permissions.
