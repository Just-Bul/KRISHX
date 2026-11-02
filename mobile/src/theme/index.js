import { Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

export const COLORS = {
  // ── Core backgrounds ────────────────────────────────────────────────────────
  BACKGROUND:   '#0F172A',   // Deep midnight navy
  SURFACE:      '#1E293B',   // Elevated card surface
  SURFACE_ALT:  '#162032',   // Slightly sunken alt surface
  SURFACE_GLASS:'rgba(30, 41, 59, 0.85)', // Glassmorphism card

  // ── Brand — Purple/Violet ───────────────────────────────────────────────────
  PRIMARY:       '#8B5CF6',  // Violet 500
  PRIMARY_DARK:  '#7C3AED',  // Violet 600
  PRIMARY_LIGHT: '#A78BFA',  // Violet 400

  // ── Accent — Cyan ───────────────────────────────────────────────────────────
  ACCENT:        '#06B6D4',  // Cyan 500
  ACCENT_DARK:   '#0891B2',  // Cyan 600

  // ── Gradient triplet (used by all LinearGradient headers) ───────────────────
  GRADIENT_START: '#0F172A',  // Midnight
  GRADIENT_MID:   '#1E1052',  // Dark indigo
  GRADIENT_END:   '#4C1D95',  // Deep purple

  // ── Text ────────────────────────────────────────────────────────────────────
  TEXT_PRIMARY:   '#F1F5F9',  // Slate 100
  TEXT_SECONDARY: '#94A3B8',  // Slate 400
  TEXT_MUTED:     '#475569',  // Slate 600
  TEXT_ON_DARK:   '#FFFFFF',

  // ── Borders & dividers ──────────────────────────────────────────────────────
  BORDER:        '#334155',  // Slate 700
  BORDER_LIGHT:  '#1E293B',  // Matches SURFACE (for unit badges etc.)

  // ── Status ──────────────────────────────────────────────────────────────────
  SUCCESS:  '#10B981',  // Emerald 500
  ERROR:    '#EF4444',  // Red 500
  WARNING:  '#F59E0B',  // Amber 500
  INFO:     '#3B82F6',  // Blue 500
  DANGER:   '#DC2626',

  // ── Form inputs ─────────────────────────────────────────────────────────────
  INPUT_BG:     '#0B1120',  // Even darker well
  INPUT_BORDER: '#334155',

  // ── Misc ────────────────────────────────────────────────────────────────────
  CARD_BG:      '#1E293B',
  SHADOW:       'rgba(0,0,0,0.6)',
  OVERLAY:      'rgba(0,0,0,0.75)',

  PEST_BG:     '#1C1531',  // Dark purple tint for pest icon background
  PEST_BORDER: '#4C1D95',  // Deep purple border for pest cards
};

export const FONTS = {
  REGULAR: Platform.OS === 'ios' ? 'System' : 'Roboto',
  SIZE: {
    XS:      11,
    SM:      13,
    MD:      15,
    LG:      17,
    XL:      20,
    XXL:     24,
    XXXL:    30,
    DISPLAY: 38,
  },
  WEIGHT: {
    LIGHT:     '300',
    REGULAR:   '400',
    MEDIUM:    '500',
    SEMIBOLD:  '600',
    BOLD:      '700',
    EXTRABOLD: '800',
  },
};

export const SPACING = {
  XS:      4,
  SM:      8,
  MD:      12,
  LG:      16,
  XL:      20,
  XXL:     24,
  XXXL:    32,
  SECTION: 40,
};

export const RADIUS = {
  SM:   8,
  MD:   12,
  LG:   16,
  XL:   20,
  XXL:  28,
  FULL: 9999,
};

export const SHADOW = {
  SM: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  MD: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  LG: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 14,
  },
};

export const SCREEN = { WIDTH: width, HEIGHT: height };

export default { COLORS, FONTS, SPACING, RADIUS, SHADOW, SCREEN };
