import { Platform } from 'react-native';

// ===== DESIGN TOKENS - Basado en tap-2-play =====
export const T = {
  // Colors - OKLCH-inspired dark theme
  bg: '#0c0f1a',
  bgAlt: '#111827',
  surface: '#1a1f35',
  surfaceHover: '#232a45',
  elevated: '#1e293b',

  // Brand
  primary: '#00e5c7',      // Neon cyan
  primaryDim: '#00b89e',
  accent: '#f72585',       // Neon magenta
  accentDim: '#d41e6f',

  // Semantic
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',

  // Text
  text: '#f0f4ff',
  textSecondary: '#94a3b8',
  textMuted: '#64748b',

  // Borders
  border: 'rgba(255,255,255,0.08)',
  borderLight: 'rgba(255,255,255,0.12)',

  // Glows
  glowPrimary: 'rgba(0,229,199,0.3)',
  glowAccent: 'rgba(247,37,133,0.3)',
} as const;

// ===== SPACING =====
export const S = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

// ===== BORDER RADIUS =====
export const R = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

// ===== TYPOGRAPHY =====
export const F = {
  regular: 'Outfit-Regular',
  medium: 'Outfit-Medium',
  semibold: 'Outfit-SemiBold',
  bold: 'Outfit-Bold',
  extrabold: 'Outfit-ExtraBold',
  display: 'SpaceGrotesk-Bold',
} as const;

// ===== FONT SIZES =====
export const FS = {
  xs: 12,
  sm: 13,
  base: 15,
  lg: 17,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
} as const;

// ===== BREAKPOINTS =====
export const BP = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;

// ===== HELPERS =====
export const isWeb = Platform.OS === 'web';

export function useResponsive(width: number) {
  return {
    isMobile: width < BP.md,
    isTablet: width >= BP.md && width < BP.lg,
    isDesktop: width >= BP.lg,
    numColumns: width >= BP.lg ? 4 : width >= BP.md ? 3 : 2,
    contentWidth: width >= BP.lg ? Math.min(width - 320, 900) : width,
  };
}

// ===== SHARED STYLES =====
export const SHARED = {
  // Glass card material
  glassCard: {
    backgroundColor: T.surface,
    borderRadius: R.lg,
    borderWidth: 1,
    borderColor: T.border,
  },

  // Button base
  btnPrimary: {
    backgroundColor: T.primary,
    borderRadius: R.md,
    paddingVertical: 14,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },

  btnSecondary: {
    backgroundColor: T.surface,
    borderRadius: R.md,
    paddingVertical: 14,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderWidth: 1,
    borderColor: T.border,
  },

  // Chip
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: R.full,
    backgroundColor: T.surface,
    borderWidth: 1,
    borderColor: T.border,
  },

  // Input
  input: {
    backgroundColor: T.surface,
    borderRadius: R.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: T.text,
    fontSize: FS.base,
    fontFamily: F.regular,
  },

  // Badge
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: R.sm,
  },

  // Safe area top (iOS)
  safeTop: Platform.OS === 'ios' ? 44 : 0,

  // Tab bar height
  tabBarHeight: Platform.OS === 'ios' ? 88 : 64,
} as const;
