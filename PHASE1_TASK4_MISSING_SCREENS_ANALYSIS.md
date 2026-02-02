# PHASE 1 TASK 4 — MISSING SCREENS ANALYSIS
**Generated:** 2025-12-13
**Purpose:** Identify missing placeholder screens for complete parallel architecture

---

## PARALLEL STRUCTURE REQUIREMENT

BUILD_PHASES.md Phase 1 Task 2: "Mirror handyman/contractor route trees"
**Goal:** Handyman and Contractor should have parallel feature sets (both are service providers)

---

## CURRENT SCREEN COUNTS

| Category | Contractor | Handyman | Customer | Admin |
|----------|------------|----------|----------|-------|
| Total Screens | 22 | 13 | 24 | 7 |
| Layout | ✅ | ✅ | ✅ | ✅ |
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| Profile | ✅ (1) | ✅ (2) | ✅ (2) | - |
| Jobs | ✅ (5) | ✅ (3) | ✅ (multiple) | ✅ (1) |
| Growth | ✅ (4) | ✅ (4) | - | - |
| Expenses | ✅ (3) | ❌ | - | - |
| Mileage | ✅ (3) | ❌ | - | - |
| Reports | ✅ (1) | ❌ | - | - |
| Wallet | - | ✅ (2) | - | - |
| Warranty | ✅ (1) | ❌ | ✅ (3) | ✅ (1) |
| Change Order | ✅ (2) | ❌ | ✅ (1) | - |

---

## MISSING SCREENS IDENTIFIED

### **(handyman)/ - 9 Missing Screens**

#### 1. Expenses Module (Missing - 3 screens)
**Justification:** Contractors track expenses, handymen should too (parallel structure).
- ❌ `(handyman)/expenses/index.tsx` - List all expenses
- ❌ `(handyman)/expenses/add.tsx` - Add new expense
- ❌ `(handyman)/expenses/[id].tsx` - View/edit expense detail

#### 2. Mileage Module (Missing - 3 screens)
**Justification:** Tax deduction tracking is essential for both contractor and handyman roles.
- ❌ `(handyman)/mileage/index.tsx` - Mileage log list
- ❌ `(handyman)/mileage/add.tsx` - Log new trip
- ❌ `(handyman)/mileage/map.tsx` - Visual mileage tracker

#### 3. Reports Module (Missing - 1 screen)
**Justification:** Financial reports needed for both roles.
- ❌ `(handyman)/reports/index.tsx` - Tax and financial reports

#### 4. Warranty Module (Missing - 1 screen)
**Justification:** Handymen provide warranty on completed jobs (parallel to contractor).
- ❌ `(handyman)/warranty/[jobId].tsx` - Warranty details for job

#### 5. Change Order Module (Missing - 2 screens)
**Justification:** Handymen handle scope changes just like contractors.
- ❌ `(handyman)/change-order/create/[jobId].tsx` - Create change order
- ❌ `(handyman)/change-order/list/[jobId].tsx` - List change orders for job

---

### **(contractor)/ - 3 Missing Screens**

#### 1. Wallet Module (Missing - 2 screens)
**Justification:** Contractors need payment tracking like handymen.
- ❌ `(contractor)/wallet/index.tsx` - Earnings overview
- ❌ `(contractor)/wallet/payouts.tsx` - Payout history

**NOTE:** Contractor has extensive job screens (5 total), handyman only has 3. Consider if handyman needs:
- `jobs/accepted.tsx` - Jobs accepted but not started (DEFER - may not need parallel)
- `jobs/scheduled.tsx` - Scheduled jobs (DEFER - may not need parallel)
- `jobs/completed.tsx` - Handyman already has `jobs/history.tsx` (equivalent)

#### 2. Profile Settings (Missing - 1 screen)
**Justification:** Handyman has `profile/settings.tsx`, contractor should too.
- ❌ `(contractor)/profile/settings.tsx` - Profile settings screen

---

### **(customer)/ - Complete** ✅
**Status:** Customer role has all expected screens for their use case.
- No missing screens identified

---

### **admin/ - Complete** ✅
**Status:** Admin has basic screens for system oversight.
- No missing screens identified (admin needs are different from role-based)

---

### **shared/ - Does Not Exist**
**Status:** No shared directory exists.
**Justification:** Not required by BUILD_PHASES.md Phase 1. Legal and auth already exist as separate directories.
**Action:** SKIP - not needed for Phase 1 completion

---

### **legal/ - Complete** ✅
**Status:** Has terms.tsx and contractor-agreement.tsx
**Consideration:** May need privacy.tsx later, but not Phase 1 requirement

---

## SUMMARY

**Total Missing Screens:** 12
- (handyman): 9 screens
- (contractor): 3 screens
- (customer): 0 screens
- admin: 0 screens

**Priority:** HIGH - Required for Phase 1 "Mirror handyman/contractor route trees"

---

## RECOMMENDED PLACEHOLDERS TO CREATE

### High Priority (Core Parallel Structure)
1. `(handyman)/expenses/index.tsx`
2. `(handyman)/expenses/add.tsx`
3. `(handyman)/expenses/[id].tsx`
4. `(handyman)/mileage/index.tsx`
5. `(handyman)/mileage/add.tsx`
6. `(handyman)/mileage/map.tsx`
7. `(handyman)/reports/index.tsx`
8. `(handyman)/warranty/[jobId].tsx`
9. `(handyman)/change-order/create/[jobId].tsx`
10. `(handyman)/change-order/list/[jobId].tsx`
11. `(contractor)/wallet/index.tsx`
12. `(contractor)/wallet/payouts.tsx`
13. `(contractor)/profile/settings.tsx`

**Total to Create:** 13 placeholders

---

## PLACEHOLDER TEMPLATE

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PlaceholderScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.text}>Coming Soon</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    color: '#7F8C8D',
  },
});
```

---

## END OF ANALYSIS

**Next Step:** Manager approval to proceed with placeholder creation.
