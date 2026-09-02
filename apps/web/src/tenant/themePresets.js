// UI theme presets an admin can pick in Maintenance → Branding & System Settings.
// Applied live by overriding the primary/secondary @theme tokens — the same
// runtime mechanism TenantProvider uses for per-tenant palettes. A preset layers
// on top of the tenant's base palette, so picking one reskins the whole app.
export const THEME_PRESETS = {
  corporate_blue: {
    label: 'Corporate Blue (Default)',
    tokens: {
      '--color-primary-dark': '#002576',
      '--color-primary': '#0038a8',
      '--color-primary-light': '#e8effe',
      '--color-on-primary': '#ffffff',
      '--color-secondary-dark': '#735c00',
      '--color-secondary': '#fecc00',
      '--color-secondary-light': '#fff9e0',
      '--color-on-secondary': '#735c00',
    },
  },
  civic_green: {
    label: 'Civic Green',
    tokens: {
      '--color-primary-dark': '#0a5e2a',
      '--color-primary': '#158a3f',
      '--color-primary-light': '#e6f4ea',
      '--color-on-primary': '#ffffff',
      '--color-secondary-dark': '#735c00',
      '--color-secondary': '#fecc00',
      '--color-secondary-light': '#fff9e0',
      '--color-on-secondary': '#735c00',
    },
  },
}

// For the picker UI: [{ value, label }] in a stable order.
export const THEME_PRESET_LIST = Object.entries(THEME_PRESETS).map(
  ([value, p]) => ({ value, label: p.label }),
)

// ── Custom themes ────────────────────────────────────────────────────
import { mix, contrastText, hexToRgba } from '../lib/color'

// The app's built-in palette (globals.css @theme) — the starting point a custom
// theme derives from, and the fallback shown for any token the admin hasn't
// touched. Only these hex tokens are user-editable (translucent/derived ones
// like -muted are computed, not picked).
export const DEFAULT_TOKENS = {
  '--color-primary-dark': '#002576',
  '--color-primary': '#0038a8',
  '--color-primary-light': '#e8effe',
  '--color-on-primary': '#ffffff',
  '--color-secondary-dark': '#735c00',
  '--color-secondary': '#fecc00',
  '--color-secondary-light': '#fff9e0',
  '--color-on-secondary': '#735c00',
  '--color-tertiary-dark': '#004f1e',
  '--color-tertiary': '#61c574',
  '--color-tertiary-light': '#eaf7ed',
  '--color-success': '#61c574',
  '--color-warning': '#f59e0b',
  '--color-danger': '#ef4444',
  '--color-info': '#3b82f6',
  '--color-surface': '#ffffff',
  '--color-surface-alt': '#f8f9fc',
  '--color-border': '#e2e8f0',
  '--color-content': '#0f172a',
  '--color-content-muted': '#64748b',
}

// Derive a full colour family (dark / base / light / text-on) from one base hex.
function deriveFamily(prefix, base) {
  return {
    [`--color-${prefix}`]: base,
    [`--color-${prefix}-dark`]: mix(base, '#000000', 0.34),
    [`--color-${prefix}-light`]: mix(base, '#ffffff', 0.90),
    [`--color-on-${prefix}`]: contrastText(base),
  }
}

// Build the CSS-variable override map for a custom theme config:
//   { primary, secondary, overrides }
// Primary/secondary auto-derive their shades; `overrides` (from Advanced mode)
// win over the derived values. Untouched tokens fall back to the app defaults.
export function buildThemeTokens({ primary, secondary, overrides } = {}) {
  const p = primary || DEFAULT_TOKENS['--color-primary']
  const s = secondary || DEFAULT_TOKENS['--color-secondary']
  return {
    ...deriveFamily('primary', p),
    '--color-primary-muted': hexToRgba(p, 0.08),
    ...deriveFamily('secondary', s),
    ...(overrides || {}),
  }
}

// The tokens the Advanced panel exposes, grouped for the UI.
export const ADVANCED_TOKEN_GROUPS = [
  {
    label: 'Primary shades',
    tokens: [
      { key: '--color-primary-dark', label: 'Dark' },
      { key: '--color-primary-light', label: 'Light' },
      { key: '--color-on-primary', label: 'Text on primary' },
    ],
  },
  {
    label: 'Secondary shades',
    tokens: [
      { key: '--color-secondary-dark', label: 'Dark' },
      { key: '--color-secondary-light', label: 'Light' },
      { key: '--color-on-secondary', label: 'Text on secondary' },
    ],
  },
  {
    label: 'Surfaces & text',
    tokens: [
      { key: '--color-surface', label: 'Surface' },
      { key: '--color-surface-alt', label: 'Surface alt' },
      { key: '--color-border', label: 'Border' },
      { key: '--color-content', label: 'Text' },
      { key: '--color-content-muted', label: 'Muted text' },
    ],
  },
  {
    label: 'Status & accent',
    tokens: [
      { key: '--color-tertiary', label: 'Progress' },
      { key: '--color-success', label: 'Success' },
      { key: '--color-warning', label: 'Warning' },
      { key: '--color-danger', label: 'Danger' },
      { key: '--color-info', label: 'Info' },
    ],
  },
]
