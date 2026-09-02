import { Platform, ViewStyle, TextStyle, ImageStyle } from 'react-native';

type NamedStyles<T> = { [P in keyof T]: ViewStyle | TextStyle | ImageStyle };

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

// ===== GLASS / GLOW EFFECTS (React Native compatible) =====
export const GLASS = {
  // Glass card — semi-transparent bg + border glow
  card: {
    backgroundColor: 'rgba(26,31,53,0.85)',
    borderRadius: R.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  // Elevated glass — for modals, sheets
  elevated: {
    backgroundColor: 'rgba(17,24,39,0.92)',
    borderRadius: R.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  // Chip / pill material
  chip: {
    backgroundColor: 'rgba(26,31,53,0.7)',
    borderRadius: R.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  // Tab bar material
  tabBar: {
    backgroundColor: 'rgba(12,15,26,0.88)',
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
} as const;

// ===== SHADOW PRESETS =====
export const SHADOW = {
  // Subtle elevation
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  } as ViewStyle,
  // Medium card shadow
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 6,
  } as ViewStyle,
  // Large — modal / floating
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 32,
    elevation: 12,
  } as ViewStyle,
  // Neon cyan glow
  neonCyan: {
    shadowColor: T.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 8,
  } as ViewStyle,
  // Neon magenta glow
  neonMagenta: {
    shadowColor: T.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 8,
  } as ViewStyle,
  // Combined neon glow (cyan + magenta border)
  neonDual: {
    shadowColor: T.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 10,
  } as ViewStyle,
} as const;

// ===== NEON BORDER PRESETS =====
export const NEON = {
  cyan: {
    borderColor: 'rgba(0,229,199,0.4)',
    shadowColor: T.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
  } as ViewStyle,
  magenta: {
    borderColor: 'rgba(247,37,133,0.4)',
    shadowColor: T.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
  } as ViewStyle,
  subtle: {
    borderColor: 'rgba(255,255,255,0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  } as ViewStyle,
} as const;

// ===== SHARED STYLES =====
export const SHARED: { [key: string]: ViewStyle } = {
  // Glass card material (legacy alias)
  glassCard: {
    backgroundColor: 'rgba(26,31,53,0.85)',
    borderRadius: R.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    ...({
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 16,
      elevation: 6,
    } as ViewStyle),
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
    backgroundColor: 'rgba(26,31,53,0.7)',
    borderRadius: R.md,
    paddingVertical: 14,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },

  // Chip
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: R.full,
    backgroundColor: 'rgba(26,31,53,0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },

  // Input
  input: {
    backgroundColor: 'rgba(26,31,53,0.7)',
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
