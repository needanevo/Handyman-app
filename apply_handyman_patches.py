#!/usr/bin/env python3
"""
Apply handyman role patches to user.py and role-selection.tsx
Run this script to complete Phase 1 of handyman implementation.
"""

import os
import re

def patch_user_model():
    """Add HANDYMAN role to UserRole enum and growth tracking fields"""
    filepath = "backend/models/user.py"

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Patch 1: Add HANDYMAN to UserRole enum
    old_enum = '''class UserRole(str, Enum):
    CUSTOMER = "customer"
    TECHNICIAN = "technician"
    ADMIN = "admin"'''

    new_enum = '''class UserRole(str, Enum):
    CUSTOMER = "customer"
    HANDYMAN = "handyman"  # Unlicensed, starting business
    TECHNICIAN = "technician"  # Licensed contractor
    ADMIN = "admin"'''

    content = content.replace(old_enum, new_enum)

    # Patch 2: Add growth tracking fields (find the technician fields section)
    old_fields = '''    # Technician specific fields
    business_name: Optional[str] = None  # Business/company name for contractors
    hourly_rate: Optional[float] = None
    skills: List[str] = []  # drywall, painting, electrical, etc.
    available_hours: Optional[dict] = None  # weekly schedule
    years_experience: Optional[int] = None  # Years of experience
    service_areas: List[str] = []  # Cities or zip codes they serve
    documents: Optional[dict] = None  # license, insurance, etc.
    portfolio_photos: List[str] = []  # Portfolio photo URLs
    profile_photo: Optional[str] = None  # Profile picture/logo URL'''

    new_fields = '''    # Technician/Handyman specific fields (shared by both)
    business_name: Optional[str] = None  # Business/company name
    hourly_rate: Optional[float] = None
    skills: List[str] = []  # drywall, painting, electrical, etc.
    available_hours: Optional[dict] = None  # weekly schedule
    years_experience: Optional[int] = None  # Years of experience
    service_areas: List[str] = []  # Cities or zip codes they serve
    documents: Optional[dict] = None  # license, insurance, etc.
    portfolio_photos: List[str] = []  # Portfolio photo URLs
    profile_photo: Optional[str] = None  # Profile picture/logo URL

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
    registration_status: Optional[str] = "ACTIVE"  # ACTIVE, PENDING, SUSPENDED'''

    content = content.replace(old_fields, new_fields)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"[OK] Patched {filepath}")
    print("   - Added HANDYMAN role to UserRole enum")
    print("   - Added business growth tracking fields")

def patch_role_selection():
    """Add handyman card to role selection screen"""
    filepath = "frontend/app/auth/role-selection.tsx"

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Patch 1: Add handyman handler
    handler_insert_point = '''  const handleContractorSelect = () => {
    router.push('/auth/contractor/onboarding-intro');
  };

  return ('''

    handler_replacement = '''  const handleContractorSelect = () => {
    router.push('/auth/contractor/onboarding-intro');
  };

  const handleHandymanSelect = () => {
    router.push('/auth/handyman/onboarding-intro');
  };

  return ('''

    content = content.replace(handler_insert_point, handler_replacement)

    # Patch 2: Update customer card text
    old_text = '''                <Text style={styles.featureText}>Licensed contractors</Text>'''
    new_text = '''                <Text style={styles.featureText}>Licensed contractors & handymen</Text>'''
    content = content.replace(old_text, new_text)

    # Patch 3: Insert handyman card (find the contractor card closing tag)
    contractor_card_end = '''          </TouchableOpacity>
        </View>

        {/* Login Link */}'''

    handyman_card = '''          </TouchableOpacity>

          {/* Handyman Card - NEW! */}
          <TouchableOpacity
            style={[styles.roleCard, styles.handymanCard]}
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
        </View>

        {/* Login Link */}'''

    content = content.replace(contractor_card_end, handyman_card)

    # Patch 4: Add handymanCard style
    styles_end = '''  loginLink: {
    ...typography.sizes.base,
    color: colors.primary.main,
    fontWeight: typography.weights.semibold,
  },
});'''

    styles_replacement = '''  loginLink: {
    ...typography.sizes.base,
    color: colors.primary.main,
    fontWeight: typography.weights.semibold,
  },
  handymanCard: {
    borderColor: '#FFA500',
    borderWidth: 2,
  },
});'''

    content = content.replace(styles_end, styles_replacement)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"[OK] Patched {filepath}")
    print("   - Added handleHandymanSelect handler")
    print("   - Updated customer card feature text")
    print("   - Inserted handyman card")
    print("   - Added handymanCard style")

def main():
    print("=" * 60)
    print("PHASE 1: Applying Handyman Role Patches")
    print("=" * 60)
    print()

    try:
        patch_user_model()
        print()
        patch_role_selection()
        print()
        print("=" * 60)
        print("[SUCCESS] Phase 1 Complete!")
        print("=" * 60)
        print()
        print("Next steps:")
        print("1. Test the role selection screen (3 cards should appear)")
        print("2. Verify handyman onboarding intro appears when clicked")
        print("3. Proceed to Phase 2: Build handyman registration flow")

    except Exception as e:
        print(f"[ERROR] {e}")
        import traceback
        traceback.print_exc()
        return 1

    return 0

if __name__ == "__main__":
    exit(main())
