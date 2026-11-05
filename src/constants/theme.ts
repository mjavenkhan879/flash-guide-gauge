/**
 * FlashGuideGauge theme — DARK_PREMIUM preset.
 * The `name` field is the preset value verbatim; only accent hexes are overridden
 * with the brief's studio palette (aubergine / violet / flash-yellow).
 */

export const THEME = {
  name: 'dark-premium',

  colors: {
    bg: {
      primary: '#17131F',
      deep: '#0A070F',
      secondary: '#1F1A29',
      tertiary: '#1C1726',
      accent: '#2C2438',
    },
    accent: {
      primary: '#B388FF',
      primaryDeep: '#8257E6',
      secondary: '#A29BFE',
      flash: '#FFE066',
      flashDeep: '#E8C44A',
      cool: '#7FD8C9',
      warm: '#E0607A',
    },
    text: {
      primary: '#F3EFFA',
      secondary: '#A79BB8',
      muted: '#7E7190',
      soft: '#C9BBDE',
      onAccent: '#17131F',
    },
    ui: {
      border: 'rgba(243,239,250,0.08)',
      borderStrong: 'rgba(243,239,250,0.14)',
      divider: 'rgba(243,239,250,0.06)',
      fill: 'rgba(243,239,250,0.06)',
      overlay: 'rgba(10,7,15,0.72)',
      glass: 'rgba(31,26,41,0.92)',
    },
  },

  gradients: {
    primary: ['#B388FF', '#8257E6'] as [string, string],
    flash: ['#FFE066', '#E8C44A'] as [string, string],
    beam: ['#B388FF', '#FFE066'] as [string, string],
    loader: ['rgba(10,7,15,0.94)', 'rgba(23,19,31,0.88)', 'rgba(10,7,15,0.97)'] as [
      string,
      string,
      string,
    ],
    menu: ['rgba(23,19,31,0.74)', 'rgba(23,19,31,0.90)', 'rgba(10,7,15,0.96)'] as [
      string,
      string,
      string,
    ],
    game: ['rgba(10,7,15,0.90)', 'rgba(23,19,31,0.86)', 'rgba(10,7,15,0.94)'] as [
      string,
      string,
      string,
    ],
    result: ['rgba(23,19,31,0.82)', 'rgba(10,7,15,0.95)'] as [string, string],
    lessons: ['rgba(23,19,31,0.86)', 'rgba(10,7,15,0.94)'] as [string, string],
  },

  typography: {
    hero: { fontSize: 30, fontWeight: '800' as const, letterSpacing: 3.5 },
    title: { fontSize: 24, fontWeight: '800' as const, letterSpacing: 0.4 },
    sectionLabel: { fontSize: 11.5, fontWeight: '700' as const, letterSpacing: 1.2 },
    body: { fontSize: 12.5, fontWeight: '500' as const, letterSpacing: 0.1 },
    caption: { fontSize: 9.5, fontWeight: '700' as const, letterSpacing: 1.6 },
    button: { fontSize: 16, fontWeight: '800' as const, letterSpacing: 1.1 },
    value: { fontSize: 24, fontWeight: '800' as const, letterSpacing: 0 },
  },

  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 },

  radius: { sm: 9, md: 12, lg: 16, xl: 18, xxl: 24, pill: 100 },

  shadows: {
    card: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 10,
      elevation: 4,
    },
    button: {
      shadowColor: '#B388FF',
      shadowOffset: { width: 0, height: 7 },
      shadowOpacity: 0.38,
      shadowRadius: 16,
      elevation: 9,
    },
    flashButton: {
      shadowColor: '#FFE066',
      shadowOffset: { width: 0, height: 7 },
      shadowOpacity: 0.34,
      shadowRadius: 16,
      elevation: 9,
    },
    panel: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: -6 },
      shadowOpacity: 0.5,
      shadowRadius: 16,
      elevation: 12,
    },
  },

  animation: {
    buttonSpring: { tension: 180, friction: 12 },
    cardSpring: { tension: 42, friction: 8 },
    popSpring: { tension: 110, friction: 9 },
    screenFade: 300,
    elementFade: 180,
  },
};

export type Theme = typeof THEME;
export default THEME;
