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
