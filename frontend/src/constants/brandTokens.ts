/**
 * Brand Tokens - Design System Core Colors
 *
 * These are the SOURCE OF TRUTH color values extracted from brand palette HTML files.
 * Referenced palettes:
 * - sea.html: Undressed, Sea foam, Baby leaves, Sunset
 * - a_slow_uncovering.html: Kinder, Hello Meows, Burnt
 *
 * DO NOT modify these values manually - they represent official brand palette.
 * Theme.ts derives semantic color mappings and shades from these tokens.
 *
 * Last updated: 2025-11-27
 */

export const brandTokens = {
  /**
   * Core Brand Identity Colors
   * Used for headers, primary buttons, backgrounds, and brand presence
   */
  identity: {
    navy: '#0A1117',    // Primary brand color - headers, emphasis, dark backgrounds
    gold: '#F0A81F',    // Accent color - CTAs, highlights, success states
    paper: '#EFE8DE',   // Brand background - surfaces, cards, soft backgrounds
    white: '#FFFFFF',   // Pure white - text on dark, clean surfaces
    black: '#000000',   // Pure black - strong text, deep borders
    gray: '#6B7280',    // Neutral gray - secondary text, subtle elements
  },

  /**
   * Palette: a_slow_uncovering.html
   * Warm, energetic colors for primary actions and error states
   */
  palette_uncovering: {
    kinder: '#E88035',       // Primary action color (main orange)
    helloMeows: '#FFA96B',   // Light orange for hover/active states
    burnt: '#FF776B',        // Error/danger color (coral red)
  },

  /**
   * Palette: sea.html
   * Cool, natural colors for secondary actions and success states
   */
  palette_sea: {
    undressed: '#2D8691',    // Secondary action color (teal)
    seafoam: '#B3F2CC',      // Light teal/mint for backgrounds
    babyLeaves: '#CCE699',   // Success color (light green)
    sunset: '#FFCC33',       // Warning color (yellow)
  },

  /**
   * Neutral Scale
   * Grayscale values for text hierarchy, borders, and backgrounds
   */
  neutral: {
    900: '#111827',   // Darkest - primary text
    800: '#1F2937',   // Very dark - strong headings
    700: '#374151',   // Dark - subheadings
    600: '#4B5563',   // Medium dark - body text
    500: '#6B7280',   // Medium - secondary text
    400: '#9CA3AF',   // Medium light - placeholder text
    300: '#D1D5DB',   // Light - borders, dividers
    200: '#E5E7EB',   // Very light - subtle borders
    100: '#F3F4F6',   // Lightest - backgrounds
    50: '#F9FAFB',    // Near white - subtle backgrounds
  },

  /**
   * Semantic Color Mappings
   * Direct references to palette colors for semantic use
   */
  semantic: {
    primary: '#E88035',      // → kinder (main action)
    primaryLight: '#FFA96B', // → helloMeows

    secondary: '#2D8691',    // → undressed (secondary action)
    secondaryLight: '#B3F2CC', // → seafoam

    success: '#CCE699',      // → babyLeaves
    warning: '#FFCC33',      // → sunset
    error: '#FF776B',        // → burnt

    info: '#2D8691',         // → undressed (same as secondary)
  },

  /**
   * Background Colors
   */
  backgrounds: {
    primary: '#FFFFFF',      // Main app background
    secondary: '#F9FAFB',    // Subtle background variation
    tertiary: '#F3F4F6',     // Card backgrounds
    paper: '#EFE8DE',        // Brand paper background
  },
} as const;

/**
 * Type definition for brand token categories
 */
export type BrandTokenCategory = keyof typeof brandTokens;

/**
 * Usage Notes:
 *
 * 1. Import in theme.ts to derive semantic colors:
 *    import { brandTokens } from './brandTokens';
 *
 * 2. Map to semantic scales:
 *    primary: {
 *      main: brandTokens.palette_uncovering.kinder,
 *      light: brandTokens.palette_uncovering.helloMeows,
 *      ...derive additional shades
 *    }
 *
 * 3. Use semantic mappings directly:
 *    backgroundColor: brandTokens.semantic.primary
 *
 * 4. Reference identity colors for brand presence:
 *    color: brandTokens.identity.navy
 */
