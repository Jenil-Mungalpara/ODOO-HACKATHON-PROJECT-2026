// Design tokens exported as JS constants
// Mirrors CSS custom properties in index.css

export const COLORS = {
  primary: '#1a73e8',
  primaryHover: '#1765cc',
  primaryLight: '#e8f0fe',
  surface: '#ffffff',
  muted: '#f1f3f4',
  text: '#202124',
  textMuted: '#5f6368',
  success: '#0d904f',
  successLight: '#e6f4ea',
  warning: '#e37400',
  warningLight: '#fef7e0',
  danger: '#ea4335',
  dangerLight: '#fce8e6',
  accent: '#018786',
  border: '#dadce0',
  borderLight: '#e8eaed',
};

export const SPACING = {
  baseline: 8,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  gutters: 24,
  grid: 12,
};

export const TYPOGRAPHY = {
  fontFamily: "'Inter', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  baseFontSize: '16px',
  lineHeight: 1.4,
  sizes: {
    xs: '0.75rem',   // 12px
    sm: '0.875rem',  // 14px
    base: '1rem',    // 16px
    lg: '1.125rem',  // 18px
    xl: '1.25rem',   // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '2rem',   // 32px
  },
  weights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
};

export const BORDERS = {
  radius: '8px',
  radiusSm: '4px',
  radiusLg: '12px',
  radiusFull: '50%',
};

export const SHADOWS = {
  sm: '0 1px 3px rgba(0,0,0,0.08)',
  md: '0 2px 8px rgba(0,0,0,0.12)',
  lg: '0 4px 16px rgba(0,0,0,0.16)',
};
