import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Platform-wide operator settings. Persisted locally (per origin) so they
// survive reloads and actually feed the onboard flow — swap for a
// `/platform/settings` API once the backend exists. The new-municipality
// defaults (blur / OCR / AI) are read by OnboardDrawer when chartering a tenant.
const DEFAULTS = {
  platformName: 'Iskolar',
  issueEmail: 'support@iskolar.ph',
  subdomainRoot: 'iskolar.ph',
  requireHeadInvite: true,
  defaultBlur: true,
  defaultOcr: false,
  defaultAi: false,
}

export const usePlatformSettings = create(
  persist(
    (set) => ({
      ...DEFAULTS,
      set: (patch) => set(patch),
      reset: () => set(DEFAULTS),
    }),
    { name: 'iskolar-platform-settings' },
  ),
)

export const PLATFORM_SETTINGS_DEFAULTS = DEFAULTS
