import { User } from '../contexts/AuthContext';

/**
 * Determines if handyman onboarding is complete
 */
export function isHandymanOnboardingComplete(user: User | null): boolean {
  if (!user || user.role !== 'handyman') return false;

  // Check if required fields are present
  const hasSkills = user.skills && user.skills.length > 0;
  const hasAddress = user.addresses && user.addresses.length > 0;
  const hasExperience = user.yearsExperience !== undefined && user.yearsExperience !== null;
  const hasIntent = user.providerIntent !== undefined && user.providerIntent !== null;

  return hasSkills && hasAddress && hasExperience && hasIntent;
}

/**
 * Determines if contractor onboarding is complete
 */
export function isContractorOnboardingComplete(user: User | null): boolean {
  if (!user || user.role !== 'contractor') return false;

  // Check if required fields are present
  const hasBusinessName = !!user.businessName;
  const hasDocuments = user.documents && (user.documents.license || user.documents.businessLicense);
  const hasSkills = user.skills && user.skills.length > 0;
  const hasAddress = user.addresses && user.addresses.length > 0;
  const hasExperience = user.yearsExperience !== undefined && user.yearsExperience !== null;
  const hasIntent = user.providerIntent !== undefined && user.providerIntent !== null;

  return hasBusinessName && hasDocuments && hasSkills && hasAddress && hasExperience && hasIntent;
}

/**
 * Determines the next incomplete handyman onboarding step
 */
export function getHandymanOnboardingStep(user: User | null): string | null {
  if (!user || user.role !== 'handyman') return null;

  // Step 1: Basic info (always complete after registration)
  // If we're here, Step 1 is done

  // Step 2: Skills, experience, address, intent
  const hasSkills = user.skills && user.skills.length > 0;
  const hasAddress = user.addresses && user.addresses.length > 0;
  const hasExperience = user.yearsExperience !== undefined;
  const hasIntent = user.providerIntent !== undefined;

  if (!hasSkills || !hasAddress || !hasExperience || !hasIntent) {
    return '/auth/handyman/register-step2';
  }

  // Step 3: Phone verification (optional/placeholder)
  // Step 4: Banking (optional)

  // All required steps complete
  return null;
}

/**
 * Determines the next incomplete contractor onboarding step
 */
export function getContractorOnboardingStep(user: User | null): string | null {
  if (!user || user.role !== 'contractor') return null;

  // Step 1: Basic info (always complete after registration)
  const hasBusinessName = !!user.businessName;
  if (!hasBusinessName) {
    return '/auth/contractor/register-step1';
  }

  // Step 2: Documents (profile photo, license required)
  const hasProfilePhoto = !!user.profilePhoto;
  const hasLicense = user.documents && !!user.documents.license;
  if (!hasProfilePhoto || !hasLicense) {
    return '/auth/contractor/register-step2';
  }

  // Step 3: Skills, specialties, address, intent, experience
  const hasSkills = user.skills && user.skills.length > 0;
  const hasAddress = user.addresses && user.addresses.length > 0;
  const hasExperience = user.yearsExperience !== undefined;
  const hasIntent = user.providerIntent !== undefined;

  if (!hasSkills || !hasAddress || !hasExperience || !hasIntent) {
    return '/auth/contractor/register-step3';
  }

  // Step 4: Portfolio (optional)
  // All required steps complete
  return null;
}
