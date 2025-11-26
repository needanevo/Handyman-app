/**
 * Design System - Theme Constants
 *
 * A cohesive visual language for the handyman marketplace app.
 * Colors chosen for trust, professionalism, and clarity.
 */

export const colors = {
  // Brand Colors - Core identity
  brand: {
    navy: '#0A1117',   // Primary brand color - headers, buttons, emphasis
    gold: '#F0A81F',   // Accent color - CTAs, highlights, success states
    paper: '#EFE8DE',  // Background color - surfaces, cards
    white: '#FFFFFF',  // Pure white - text on dark, clean backgrounds
    black: '#000000',  // Pure black - strong text, borders
    gray: '#6B7280',   // Neutral gray - secondary text, subtle elements
  },

  // Primary - Trust and action
  primary: {
    main: '#E88035', // Kinder (from a_slow_uncovering.html)
    light: '#FFA96B', // Hello Meows (from a_slow_uncovering.html)
    dark: '#C26A2C', // Calculated darker shade of main
    lighter: '#FADDCB', // Calculated lighter shade of main
    lightest: '#FEF3ED', // Calculated lightest shade of main
  },

  // Secondary - Energy and calls-to-action
  secondary: {
    main: '#2D8691', // Undressed (from a_slow_uncovering.html)
    light: '#B3F2CC', // Sea foam (from sea.html)
    dark: '#246B72', // Calculated darker shade of main
    lighter: '#D1F0F2', // Calculated lighter shade of main
    lightest: '#F0FAFA', // Calculated lightest shade of main
  },

  // Success - Approvals, completions
  success: {
    main: '#CCE699', // Baby leaves (from sea.html)
    light: '#E0F2B3',
    dark: '#A3B87A',
    lighter: '#F0F8E0',
    lightest: '#F8FCF0',
  },

  // Warning - Pending actions, alerts
  warning: {
    main: '#FFCC33', // Sunset (from sea.html)
    light: '#FFE073',
    dark: '#D9AD00',
    lighter: '#FFF5CC',
    lightest: '#FFFBEB',
  },

  // Error - Rejections, problems
  error: {
    main: '#FF776B', // Burnt (from a_slow_uncovering.html)
    light: '#FF9E96',
    dark: '#D9645C',
    lighter: '#FFDCDC',
    lightest: '#FFF5F5',
  },

  // Neutral - Text, borders, backgrounds (keeping existing for now, might adjust later if needed)
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
    held: '#FFCC33', // Using new warning color
    released: '#CCE699', // Using new success color
    pending: '#6B7280', // Keeping existing neutral
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

  // Semantic heading styles
  headings: {
    h1: { fontSize: 36, lineHeight: 40, fontWeight: '700' as const }, // Page titles
    h2: { fontSize: 30, lineHeight: 36, fontWeight: '700' as const }, // Section titles
    h3: { fontSize: 24, lineHeight: 32, fontWeight: '600' as const }, // Subsection titles
    h4: { fontSize: 20, lineHeight: 28, fontWeight: '600' as const }, // Card titles
    h5: { fontSize: 18, lineHeight: 28, fontWeight: '600' as const }, // List headers
    h6: { fontSize: 16, lineHeight: 24, fontWeight: '600' as const }, // Small headers
  },

  // Body text styles
  body: {
    large: { fontSize: 18, lineHeight: 28, fontWeight: '400' as const },
    regular: { fontSize: 16, lineHeight: 24, fontWeight: '400' as const },
    small: { fontSize: 14, lineHeight: 20, fontWeight: '400' as const },
  },

  // Button text styles
  button: {
    large: { fontSize: 18, lineHeight: 24, fontWeight: '600' as const },
    medium: { fontSize: 16, lineHeight: 20, fontWeight: '600' as const },
    small: { fontSize: 14, lineHeight: 18, fontWeight: '600' as const },
  },

  // Caption text styles
  caption: {
    regular: { fontSize: 14, lineHeight: 20, fontWeight: '400' as const },
    small: { fontSize: 12, lineHeight: 16, fontWeight: '400' as const },
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
