// Design tokens lifted 1:1 from the Claude Design mock
// ("Car Wash Web Apps.dc.html") — refreshed 2026-09-19 (new palette/font/logo).
// One fixed dark palette, no light mode.

export const color = {
  pageBg: '#0A0A09',
  surface: '#121211',
  surfaceAlt: '#0F0F0E',
  panel: '#191917',
  panelAlt: '#151513',
  input: '#1A1A18',

  border: '#262026',
  borderAlt: '#232320',
  borderStrong: '#2B2B26',
  borderDashed: '#373731',
  rowBorder: '#211c21',

  textPrimary: '#F6F5EF',
  textPrimaryAlt: '#F1F0E9',
  textSecondary: '#C9C7BF',
  textTertiary: '#93918A',
  textMuted: '#A5A39B',
  textFaint: '#93918A',
  textDim: '#4E4E47',

  gold: '#F2D14B',
  goldLight: '#F8E489',
  goldOnLight: '#191813',

  ok: '#8FCB86',
  okBg: 'rgba(143,203,134,.14)',
  okBgStrong: 'rgba(143,203,134,.18)',

  warn: '#F2D14B',
  warnBg: 'rgba(242,209,75,.16)',

  bad: '#D08A7A',
  badBg: 'rgba(208,138,122,.14)',
  badBorder: '#3A2B26',

  mute: '#A5A39B',
  muteBg: '#232320',
} as const;

export const font = {
  display: '"Sora", system-ui, sans-serif',
  body: '"Sora", system-ui, sans-serif',
} as const;

export const radius = {
  xs: 8,
  sm: 10,
  md: 12,
  lg: 14,
  xl: 16,
  xxl: 18,
  xxxl: 20,
  pill: 9999,
} as const;

export const shadow = {
  panel: '0 40px 90px rgba(0,0,0,.6)',
} as const;
