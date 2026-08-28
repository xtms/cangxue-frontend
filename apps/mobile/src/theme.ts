// Shared mobile theme tokens. Mirrors the web palette (primary = sky-500).
export const theme = {
  primary: '#0ea5e9',
  primaryDark: '#0369a1',
  bg: '#f9fafb',
  surface: '#ffffff',
  text: '#111827',
  textMuted: '#6b7280',
  border: '#e5e7eb',
} as const;

export type Theme = typeof theme;
