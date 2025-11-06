/**
 * Design System - Theme Constants
 *
 * A cohesive visual language for the handyman marketplace app.
 * Colors chosen for trust, professionalism, and clarity.
 */

export const colors = {
  // Primary - Trust and action
  primary: {
    main: '#2563EB', // Professional blue - trust, reliability
    light: '#60A5FA',
    dark: '#1E40AF',
    lighter: '#DBEAFE',
    lightest: '#EFF6FF',
  },

  // Secondary - Energy and calls-to-action
  secondary: {
    main: '#F97316', // Warm orange - action, completion
    light: '#FB923C',
    dark: '#EA580C',
    lighter: '#FED7AA',
    lightest: '#FFEDD5',
  },

  // Success - Approvals, completions
  success: {
    main: '#10B981',
    light: '#34D399',
    dark: '#059669',
    lighter: '#A7F3D0',
    lightest: '#D1FAE5',
  },

  // Warning - Pending actions, alerts
  warning: {
    main: '#F59E0B',
    light: '#FBBF24',
    dark: '#D97706',
    lighter: '#FDE68A',
    lightest: '#FEF3C7',
  },

  // Error - Rejections, problems
  error: {
    main: '#EF4444',
    light: '#F87171',
    dark: '#DC2626',
    lighter: '#FCA5A5',
    lightest: '#FEE2E2',
  },

  // Neutral - Text, borders, backgrounds
  neutral: {
    900: '#111827', // Darkest text
    800: '#1F2937',
    700: '#374151',
    600: '#4B5563',
    500: '#6B7280', // Secondary text
    400: '#9CA3AF',
    300: '#D1D5DB', // Borders
    200: '#E5E7EB',
    100: '#F3F4F6', // Light backgrounds
    50: '#F9FAFB',
  },

  // Background
  background: {
    primary: '#FFFFFF',
    secondary: '#F9FAFB',
    tertiary: '#F3F4F6',
  },

  // Escrow-specific colors
  escrow: {
    held: '#F59E0B', // Money held in escrow
    released: '#10B981', // Money released
    pending: '#6B7280', // Pending approval
  },
};

export const typography = {
  // Font sizes with line heights
  sizes: {
    xs: { fontSize: 12, lineHeight: 16 },
    sm: { fontSize: 14, lineHeight: 20 },
    base: { fontSize: 16, lineHeight: 24 },
    lg: { fontSize: 18, lineHeight: 28 },
    xl: { fontSize: 20, lineHeight: 28 },
    '2xl': { fontSize: 24, lineHeight: 32 },
    '3xl': { fontSize: 30, lineHeight: 36 },
    '4xl': { fontSize: 36, lineHeight: 40 },
  },

  // Font weights
  weights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
};

// Minimum touch target size for accessibility
export const touchTarget = {
  minWidth: 44,
  minHeight: 44,
};

// Animation durations (in milliseconds)
export const animation = {
  fast: 150,
  normal: 250,
  slow: 350,
};

// Z-index layers
export const zIndex = {
  base: 0,
  dropdown: 100,
  sticky: 200,
  modal: 300,
  popover: 400,
  toast: 500,
};
