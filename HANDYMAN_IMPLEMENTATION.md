# Handyman Role Implementation Guide

## Overview
Adding "Handyman" as a third role alongside Customer and Licensed Contractor (Technician). The philosophy: **Empower blue-collar workers to start their own businesses, escape the employee trap, and grow from handyman → licensed contractor.**

## Frontend Changes

### 1. Role Selection Screen (`frontend/app/auth/role-selection.tsx`)

**STATUS**: Manual update required (file sync issue)

Add this handler after line 24:
```typescript
const handleHandymanSelect = () => {
  router.push('/auth/handyman/onboarding-intro');
};
```

Insert Handyman card between Customer and Contractor cards (around line 93):
```typescript
{/* Handyman Card - NEW! */}
<TouchableOpacity
  style={[styles.roleCard, { borderColor: '#FFA500', borderWidth: 2 }]}
  onPress={handleHandymanSelect}
  activeOpacity={0.7}
>
  <View style={[styles.iconCircle, { backgroundColor: '#FFA50020' }]}>
    <Ionicons name="hammer" size={40} color="#FFA500" />
  </View>

  <Text style={styles.roleTitle}>I'm starting my business</Text>
  <Text style={styles.roleDescription}>
    Begin as a handyman and grow into a licensed contractor
  </Text>

  <View style={styles.featuresList}>
    <View style={styles.featureItem}>
      <Ionicons name="checkmark-circle" size={20} color={colors.success.main} />
      <Text style={styles.featureText}>No license required to start</Text>
    </View>
    <View style={styles.featureItem}>
      <Ionicons name="checkmark-circle" size={20} color={colors.success.main} />
      <Text style={styles.featureText}>Build your reputation</Text>
    </View>
    <View style={styles.featureItem}>
      <Ionicons name="checkmark-circle" size={20} color={colors.success.main} />
      <Text style={styles.featureText}>Get jobs immediately</Text>
    </View>
    <View style={styles.featureItem}>
      <Ionicons name="checkmark-circle" size={20} color={colors.success.main} />
      <Text style={styles.featureText}>Grow to licensed contractor</Text>
    </View>
  </View>

  <View style={[styles.cardButton, { backgroundColor: '#FFA50020' }]}>
    <Text style={[styles.cardButtonText, { color: '#FFA500' }]}>Start as Handyman</Text>
    <Ionicons name="arrow-forward" size={20} color="#FFA500" />
  </View>
</TouchableOpacity>
```

Also update Customer card text from "Licensed contractors" to "Licensed contractors & handymen" (line 81).

### 2. Handyman Onboarding Intro (`frontend/app/auth/handyman/onboarding-intro.tsx`)

**STATUS**: ✅ CREATED

This file emphasizes:
- "Stop giving 40-60% to a boss"
- "Build YOUR business, keep YOUR money"
- Growth path from handyman → LLC → licensed contractor
- No license required to start

### 3. Handyman Registration Flow

**STATUS**: TO DO

Create these files (mirror contractor registration):
- `frontend/app/auth/handyman/register-step1.tsx` - Basic info (name, email, phone, business name, password)
- `frontend/app/auth/handyman/register-step2.tsx` - Skills & service area
- `frontend/app/auth/handyman/register-step3.tsx` - Portfolio photos (OPTIONAL - no license required)
- `frontend/app/auth/handyman/register-step4.tsx` - Banking/payout setup

**Key Differences from Contractor Registration:**
- No license upload required
- No insurance upload required
- Simpler documentation
- Emphasis on "start now, upgrade later"

### 4. Handyman Dashboard (`frontend/app/(handyman)/dashboard.tsx`)

**STATUS**: TO DO

Same features as contractor dashboard, but with:
- Growth progress tracker ("You're a Handyman - Ready to form an LLC?")
- LLC formation guidance link
- Licensing pathway information
- Badge showing "Handyman" status

## Backend Changes

### 1. Update User Model (`backend/models/user.py`)

**Add HANDYMAN role to enum:**
```python
class UserRole(str, Enum):
    CUSTOMER = "customer"
    HANDYMAN = "handyman"  # Unlicensed, starting business
    TECHNICIAN = "technician"  # Licensed contractor
    ADMIN = "admin"
```

**Add business growth tracking fields:**
```python
    # Business growth tracking
    has_llc: bool = False  # Whether they've formed an LLC
    llc_formation_date: Optional[datetime] = None
    is_licensed: bool = False  # Whether they have trade license
    license_number: Optional[str] = None
    license_state: Optional[str] = None
    license_expiry: Optional[datetime] = None
    is_insured: bool = False  # Whether they have liability insurance
    insurance_policy_number: Optional[str] = None
    insurance_expiry: Optional[datetime] = None

    # Growth milestone tracking
    upgrade_to_technician_date: Optional[datetime] = None  # When handyman became licensed
    registration_completed_date: Optional[datetime] = None
    registration_status: Optional[str] = "ACTIVE"  # ACTIVE, PENDING, SUSPENDED
```

### 2. Update Authentication (`backend/server.py`)

**In the registration endpoint (around line 150-200):**

Add support for `role="handyman"` in registration:
```python
@api_router.post("/auth/register")
async def register(user_data: UserCreate):
    # ... existing validation ...

    # Allow HANDYMAN role
    if user_data.role not in [UserRole.CUSTOMER, UserRole.HANDYMAN, UserRole.TECHNICIAN]:
        raise HTTPException(status_code=400, detail="Invalid role")

    # ... rest of registration ...
```

**In the index route routing logic (around line 50-60):**

Add handyman role check:
```python
if user.role == "technician":
    router.replace('/(contractor)/dashboard')
elif user.role == "handyman":
    router.replace('/(handyman)/dashboard')  # NEW
else:
    router.replace('/home')
```

### 3. Create Handyman-Specific Endpoints (`backend/server.py`)

**Add these endpoints (mirror contractor endpoints):**

```python
# Handyman Profile Endpoints
@api_router.get("/handyman/profile")
async def get_handyman_profile(current_user: User = Depends(get_current_user_dependency)):
    if current_user.role != UserRole.HANDYMAN:
        raise HTTPException(status_code=403, detail="Handyman access only")
    return current_user

@api_router.patch("/handyman/profile")
async def update_handyman_profile(
    updates: dict,
    current_user: User = Depends(get_current_user_dependency)
):
    if current_user.role != UserRole.HANDYMAN:
        raise HTTPException(status_code=403, detail="Handyman access only")

    # Update handyman profile
    await db.users.update_one(
        {"id": current_user.id},
        {"$set": updates}
    )
    return {"message": "Profile updated"}

# Handyman Jobs Endpoints (same as contractor)
@api_router.get("/handyman/jobs/available")
async def get_available_jobs_handyman(
    current_user: User = Depends(get_current_user_dependency)
):
    """Get available jobs for handyman (50-mile radius, matching skills)"""
    if current_user.role != UserRole.HANDYMAN:
        raise HTTPException(status_code=403, detail="Handyman access only")

    # Reuse contractor job matching logic
    # Handymen see the same jobs as contractors
    return await get_available_jobs_for_contractor(current_user)

# Growth/Upgrade Endpoints
@api_router.post("/handyman/upgrade-to-technician")
async def upgrade_handyman_to_technician(
    license_data: dict,
    current_user: User = Depends(get_current_user_dependency)
):
    """Upgrade a handyman to licensed technician"""
    if current_user.role != UserRole.HANDYMAN:
        raise HTTPException(status_code=400, detail="Only handymen can upgrade")

    # Validate license data
    # Update role to TECHNICIAN
    # Set upgrade_to_technician_date
    # Update is_licensed = True
    await db.users.update_one(
        {"id": current_user.id},
        {"$set": {
            "role": UserRole.TECHNICIAN.value,
            "upgrade_to_technician_date": datetime.utcnow(),
            "is_licensed": True,
            "license_number": license_data.get("license_number"),
            "license_state": license_data.get("license_state"),
            "license_expiry": license_data.get("license_expiry"),
        }}
    )
    return {"message": "Congratulations! You're now a licensed contractor!"}
```

### 4. Update Job Matching Logic (`backend/services/contractor_routing.py`)

**Ensure handymen are included in job matching:**

```python
async def find_available_contractors(job):
    """Find contractors AND handymen within 50 miles of job"""
    contractors = await db.users.find({
        "role": {"$in": ["technician", "handyman"]},  # Include both
        "registration_status": "ACTIVE",
        # ... existing radius and skills logic ...
    }).to_list(None)

    return contractors
```

### 5. Update Customer-Facing Job Creation

**When customer creates a job, show them both handymen and contractors in proposals.**

No changes needed to job creation logic - just ensure UI shows contractor type badge clearly.

## Database Schema

### MongoDB Collections

**users collection** - Add these fields to existing documents:
```javascript
{
  // ... existing fields ...

  // NEW FIELDS
  "has_llc": false,
  "llc_formation_date": null,
  "is_licensed": false,
  "license_number": null,
  "license_state": null,
  "license_expiry": null,
  "is_insured": false,
  "insurance_policy_number": null,
  "insurance_expiry": null,
  "upgrade_to_technician_date": null,
  "registration_completed_date": ISODate("2025-01-15T10:00:00Z"),
  "registration_status": "ACTIVE"
}
```

**No new collections needed** - handymen use the same structure as contractors.

## Testing Checklist

### Frontend Testing
- [ ] Role selection shows 3 options (Customer, Handyman, Contractor)
- [ ] Handyman onboarding intro displays empowerment messaging
- [ ] Handyman registration flow works end-to-end
- [ ] Handyman can register without license/insurance
- [ ] Handyman dashboard shows growth tracking

### Backend Testing
- [ ] Can register as handyman role
- [ ] Handyman can log in
- [ ] Handyman receives job notifications
- [ ] Handyman can submit proposals
- [ ] Handyman can upgrade to technician
- [ ] Job matching includes both handymen and contractors

### Integration Testing
- [ ] Customer sees handyman proposals with appropriate badges
- [ ] Customer sees clear disclaimer about handyman vs licensed
- [ ] Handyman completes job successfully
- [ ] Payment flows correctly to handyman
- [ ] Review system works for handyman

## Growth Path Implementation (Future)

### LLC Formation Guidance
- Link to state-specific LLC formation resources
- Partnership with LegalZoom or similar
- "Form Your LLC" wizard in dashboard

### Licensing Pathway
- State-by-state licensing requirements
- Study materials and exam prep resources
- "Get Licensed" checklist in dashboard

### Insurance Options
- Partner with insurance providers
- "Get Insured" button in dashboard
- Insurance cost calculator

### Upgrade Flow
- "I've got my license!" button in dashboard
- Upload license document
- Admin verification
- Automatic role change to TECHNICIAN
- Celebration screen: "You're now a Licensed Contractor!"

## Philosophy & Messaging

### For Handymen:
**Core Message:** "You do the work. You should get paid for it. Stop giving half your paycheck to someone who just answers phones."

**Growth Message:** "Start as a handyman. Do good work. Build your reputation. When you're ready, we'll help you get your LLC, then your license. You control your timeline."

**Empowerment:** "You're not a 'helper' or an 'assistant.' You're a business owner."

### For Customers:
**Transparency:** "John is a handyman - not licensed. He charges $40/hr instead of $80/hr. He's building his business. You take on slightly more risk for a much better price."

**Safety:** "All handymen are reviewed and rated. You see their work history. You're protected by escrow payments."

## Implementation Timeline

**Week 1: Frontend**
- Day 1-2: Role selection + onboarding intro ✅ DONE
- Day 3-4: Handyman registration flow
- Day 5: Handyman dashboard

**Week 2: Backend**
- Day 1-2: User model updates + endpoints
- Day 3: Job matching updates
- Day 4-5: Testing and bug fixes

**Week 3: Polish**
- Day 1-2: Growth tracking features
- Day 3-4: LLC/licensing guidance
- Day 5: End-to-end testing

## Success Metrics

### Launch Goals (3 months)
- 100 handymen registered
- 500 jobs completed
- 10 handymen upgraded to licensed contractors
- 4.5+ average rating from customers

### Growth Indicators
- % of handymen who form LLC within 6 months
- % of handymen who get licensed within 12 months
- Customer satisfaction with handyman vs contractor services
- Repeat booking rate for handymen

---

**Philosophy:** This isn't just a feature. This is about changing lives. We're giving people the tools to escape wage slavery and build real businesses. Every handyman who becomes a licensed contractor is a success story we should celebrate.
