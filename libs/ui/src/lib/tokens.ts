export type ThemeMode = 'light' | 'dark' | 'system';

export const lightTokens = {
  '--color-bg': '#f4f7fb',
  '--color-surface': '#ffffff',
  '--color-surface-2': '#eef3fb',
  '--color-fg': '#0f172a',
  '--color-muted': '#475569',
  '--color-border': '#e2e8f4',
  '--color-primary': '#2563eb',
  '--color-on-primary': '#ffffff',
  '--color-primary-soft': '#e8f0fe',
  '--color-online': '#059669',
  '--color-kakao': '#fee500',
  '--color-kakao-fg': '#191919',
  '--color-danger': '#dc2626',
} as const;

export const darkTokens = {
  '--color-bg': '#0b1220',
  '--color-surface': '#121a2b',
  '--color-surface-2': '#1a2438',
  '--color-fg': '#f8fafc',
  '--color-muted': '#94a3b8',
  '--color-border': '#243049',
  '--color-primary': '#2563eb',
  '--color-on-primary': '#ffffff',
  '--color-primary-soft': '#1e3a5f',
  '--color-online': '#059669',
  '--color-kakao': '#fee500',
  '--color-kakao-fg': '#191919',
  '--color-danger': '#dc2626',
} as const;

export type CssVarMap = Record<string, string>;
