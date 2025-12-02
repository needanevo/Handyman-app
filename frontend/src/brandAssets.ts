/**
 * Brand Assets - Source of Truth
 *
 * All logo files, icons, and brand imagery with REAL dimensions.
 * Dimensions scanned from actual files using WIC (PresentationCore).
 * DO NOT modify dimensions manually - they reflect actual file geometry.
 *
 * Last scanned: 2025-11-27
 */

export const brandAssets = {
  // ============================================================
  // PRIMARY COLOR LOGOS
  // ============================================================
  handymanColorPrimary: {
    src: require("../../assets/images/logos/color/Handyman_logo_color.png"),
    width: 2056,
    height: 2316,
    ratio: 0.89, // width / height
    category: "color" as const,
  },

  handymanColor2x: {
    src: require("../../assets/images/logos/color/Handyman_logo_color@2x.png"),
    width: 1514,
    height: 1706,
    ratio: 0.89,
    category: "color" as const,
  },

  handymanColor4x: {
    src: require("../../assets/images/logos/color/Handyman_logo_color@4x.png"),
    width: 2055,
    height: 2314,
    ratio: 0.89,
    category: "color" as const,
  },

  // ============================================================
  // BLACK & WHITE LOGOS
  // ============================================================
  handymanBWPrimary: {
    src: require("../../assets/images/logos/bw/Handyman_logo_bw.png"),
    width: 2792,
    height: 3142,
    ratio: 0.89,
    category: "bw" as const,
  },

  handymanBWSquare: {
    src: require("../../assets/images/logos/variants/handymanBW.jpg"),
    width: 4166,
    height: 4166,
    ratio: 1.0,
    category: "bw" as const,
  },

  handymanFinalBW: {
    src: require("../../assets/images/logos/variants/Handyman_Final_BW.png"),
    width: 2056,
    height: 2316,
    ratio: 0.89,
    category: "bw" as const,
  },

  // ============================================================
  // GRAYSCALE LOGOS
  // ============================================================
  handymanGrayPrimary: {
    src: require("../../assets/images/logos/grayscale/Handyman_logo_gray.png"),
    width: 2056,
    height: 2316,
    ratio: 0.89,
    category: "grayscale" as const,
  },

  handymanGrayFinal: {
    src: require("../../assets/images/logos/grayscale/Final_BW.jpg"),
    width: 2056,
    height: 2316,
    ratio: 0.89,
    category: "grayscale" as const,
  },

  // ============================================================
  // TRANSPARENT VARIANTS
  // ============================================================
  handymanTransparent: {
    src: require("../../assets/images/logos/variants/Handyman_MASTERTransparent.png"),
    width: 881,
    height: 992,
    ratio: 0.89,
    category: "transparent" as const,
  },

  // ============================================================
  // MARK (LOGO WITHOUT TEXT)
  // ============================================================
  handymanMark: {
    src: require("../../assets/images/logos/variants/HMNo_Slogan.png"),
    width: 881,
    height: 992,
    ratio: 0.89,
    category: "mark" as const,
  },

  handymanMarkPrint: {
    src: require("../../assets/images/print/vector/HMNo_Slogan.png"),
    width: 881,
    height: 992,
    ratio: 0.89,
    category: "mark" as const,
  },

  // ============================================================
  // APP ICONS
  // ============================================================
  appIconPrimary: {
    src: require("../../assets/images/icon.png"),
    width: 512,
    height: 513,
    ratio: 1.0,
    category: "icon" as const,
  },

  appIconAdaptive: {
    src: require("../../assets/images/adaptive-icon.png"),
    width: 512,
    height: 513,
    ratio: 1.0,
    category: "icon" as const,
  },

  appIcon1024: {
    src: require("../../assets/images/app/icons/1024x1024Color.png"),
    width: 881,
    height: 992,
    ratio: 0.89,
    category: "icon" as const,
  },

  // ============================================================
  // SPLASH SCREENS
  // ============================================================
  splashImage: {
    src: require("../../assets/images/splash-image.png"),
    width: 336,
    height: 729,
    ratio: 0.46,
    category: "splash" as const,
  },

  appImage: {
    src: require("../../assets/images/app-image.png"),
    width: 336,
    height: 729,
    ratio: 0.46,
    category: "splash" as const,
  },

  // ============================================================
  // FAVICONS
  // ============================================================
  faviconPrimary: {
    src: require("../../assets/images/favicon.png"),
    width: 512,
    height: 513,
    ratio: 1.0,
    category: "favicon" as const,
  },

  faviconWeb1024: {
    src: require("../../assets/images/web/favicons/1024x1024Color.png"),
    width: 881,
    height: 992,
    ratio: 0.89,
    category: "favicon" as const,
  },

  // ============================================================
  // WEB HEADERS
  // ============================================================
  webHeader1024: {
    src: require("../../assets/images/web/headers/1024x1024Color.png"),
    width: 881,
    height: 992,
    ratio: 0.89,
    category: "header" as const,
  },

  // ============================================================
  // ADDITIONAL VARIANTS
  // ============================================================
  handymanFinalColor: {
    src: require("../../assets/images/logos/variants/Final_color.jpg"),
    width: 2056,
    height: 2316,
    ratio: 0.89,
    category: "color" as const,
  },

  handymanFinalVariant: {
    src: require("../../assets/images/logos/variants/Handyman_final.png"),
    width: 2056,
    height: 2316,
    ratio: 0.89,
    category: "color" as const,
  },

  theRealJohnson: {
    src: require("../../assets/images/logos/variants/The_real_johnson.png"),
    width: 4166,
    height: 4166,
    ratio: 1.0,
    category: "variant" as const,
  },

  colorVariant1024: {
    src: require("../../assets/images/logos/variants/1024x1024Color.png"),
    width: 881,
    height: 992,
    ratio: 0.89,
    category: "color" as const,
  },
} as const;

/**
 * Type definition for a brand asset
 */
export type BrandAsset = typeof brandAssets[keyof typeof brandAssets];

/**
 * Helper function to get asset by category
 */
export function getAssetsByCategory(category: BrandAsset['category']) {
  return Object.entries(brandAssets)
    .filter(([_, asset]) => asset.category === category)
    .map(([key, asset]) => ({ key, ...asset }));
}

/**
 * BrandLogos - Organized logo structure for easy access
 * USE THIS for all UI components (Stage 2: Product branding after splash)
 */
export const BrandLogos = {
  color: {
    default: brandAssets.handymanColorPrimary.src,
    x2: brandAssets.handymanColor2x.src,
    x4: brandAssets.handymanColor4x.src,
  },
  bw: {
    default: brandAssets.handymanBWPrimary.src,
    square: brandAssets.handymanBWSquare.src,
    final: brandAssets.handymanFinalBW.src,
  },
  grayscale: {
    default: brandAssets.handymanGrayPrimary.src,
    final: brandAssets.handymanGrayFinal.src,
  },
  variants: {
    transparent: brandAssets.handymanTransparent.src,
    mark: brandAssets.handymanMark.src,
    markPrint: brandAssets.handymanMarkPrint.src,
    theRealJohnson: brandAssets.theRealJohnson.src,
  },
} as const;

/**
 * Recommended usage in components:
 *
 * // NEW: Simplified logo usage
 * import { BrandLogos } from '../brandAssets';
 * <Image source={BrandLogos.color.default} style={styles.logo} resizeMode="contain" />
 *
 * // ADVANCED: With dimensions
 * import { brandAssets } from '../brandAssets';
 * <Image
 *   source={brandAssets.handymanColorPrimary.src}
 *   style={{
 *     width: brandAssets.handymanColorPrimary.width * 0.2,
 *     height: brandAssets.handymanColorPrimary.height * 0.2,
 *   }}
 *   resizeMode="contain"
 * />
 */
