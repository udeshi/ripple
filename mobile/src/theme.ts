export const colors = {
  background: '#090c14',
  surface: '#171b27',
  surfaceRaised: '#1d2230',
  foreground: '#eef3f7',
  muted: '#8993a5',
  line: '#2a3040',
  accent: '#16d9e9',
  accentSoft: '#123e49',
  danger: '#fb4570',
};

export const radii = {
  sm: 8,
  md: 12,
  lg: 20,
  xl: 24,
  xxl: 28,
  pill: 999,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};

export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
    elevation: 6,
  },
} as const;

export const gradientBanner = ['#12374b', '#172033', '#241d4b'] as const;
