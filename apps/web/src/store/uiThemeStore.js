import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// The admin-selected UI theme preset. `null` means "use the tenant's own
// palette as-is". Persisted per-origin, so it survives reloads; in production
// each tenant is its own subdomain, so the choice is naturally scoped to that
// municipality. TenantProvider reads this and applies the preset's tokens on
// top of the tenant palette (see tenant/themePresets.js).
export const useUiTheme = create(
  persist(
    (set) => ({
      preset: null,
      setPreset: (preset) => set({ preset }),
    }),
    { name: 'iskolar-ui-theme' },
  ),
)
