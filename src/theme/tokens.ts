// Design tokens lifted 1:1 from the Claude Design mock
// ("Car Wash Web Apps.dc.html") — one fixed dark palette, no light mode.

export const color = {
  pageBg: '#0b0a0b',
  surface: '#141014',
  surfaceAlt: '#100d10',
  panel: '#1a161a',
  panelAlt: '#161216',
  input: '#1b171b',

  border: '#262026',
  borderAlt: '#241f24',
  borderStrong: '#2a242a',
  borderDashed: '#383138',
  rowBorder: '#211c21',

  textPrimary: '#f7f2ea',
  textPrimaryAlt: '#f2ece4',
  textSecondary: '#c9bfc6',
  textTertiary: '#9b9198',
  textMuted: '#8a8188',
  textFaint: '#6f666d',
  textDim: '#4f484e',

  gold: '#d9b26a',
  goldLight: '#efd4a0',
  goldOnLight: '#171317',

  ok: '#8ec49a',
  okBg: 'rgba(122,177,132,.12)',
  okBgStrong: 'rgba(122,177,132,.16)',

  warn: '#d9b26a',
  warnBg: 'rgba(217,178,106,.16)',

  bad: '#c98b8b',
  badBg: 'rgba(201,139,139,.14)',
  badBorder: '#3a2b2b',

  mute: '#9b9198',
  muteBg: '#241f24',
} as const;

export const font = {
  display: '"Prata", Georgia, serif',
  body: '"Manrope", system-ui, sans-serif',
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
