/* eslint-disable react-refresh/only-export-components -- context module: the
   provider and its consumer hooks (useTenant/useBrand) are intentionally
   colocated with the context they share. */
import { createContext, useContext, useEffect, useState } from 'react'
import { resolveSubdomain, findTenant, DEFAULT_TENANT } from './tenants'
import { THEME_PRESETS, buildThemeTokens } from './themePresets'
import { useImpersonation } from '../store/impersonationStore'
import { useUiTheme } from '../store/uiThemeStore'

// Private — components read tenant state through the hooks below, never the
// raw context (keeps this file Fast-Refresh friendly).
const TenantContext = createContext(null)

/**
 * Resolves "which municipality am I?" from the URL (or the tenant an operator is
 * impersonating, which overrides it) and makes it available app-wide.
 */
export function TenantProvider({ children }) {
  // Base tenant, resolved once from the URL (host doesn't change without a full
  // reload). No / unknown subdomain falls back to the default tenant for now.
  const [base] = useState(() => {
    const subdomain = resolveSubdomain(window.location.hostname, window.location.search)
    return findTenant(subdomain) ?? DEFAULT_TENANT
  })

  // When an operator is impersonating a municipality, that tenant wins.
  const impersonated = useImpersonation((s) => s.tenant)
  const tenant = impersonated ?? base
  const isImpersonating = !!impersonated

  // The admin-selected UI theme (a named preset, a custom palette, or null).
  const preset = useUiTheme((s) => s.preset)
  const customConfig = useUiTheme((s) => s.customConfig)

  // Apply the active palette by overriding the @theme CSS variables: the
  // tenant's base palette first, then the selected preset/custom theme on top.
  // Re-runs when the tenant changes (impersonation) or the admin edits the
  // theme, so the whole app reskins live.
  useEffect(() => {
    const themeTokens =
      preset === 'custom'
        ? (customConfig ? buildThemeTokens(customConfig) : {})
        : preset
        ? THEME_PRESETS[preset]?.tokens ?? {}
        : {}
    const overrides = { ...(tenant?.theme ?? {}), ...themeTokens }
    if (Object.keys(overrides).length === 0) return
    const el = document.documentElement
    const previous = {}
    Object.entries(overrides).forEach(([k, v]) => {
      previous[k] = el.style.getPropertyValue(k)
      el.style.setProperty(k, v)
    })
    return () => {
      Object.entries(previous).forEach(([k, v]) => {
        if (v) el.style.setProperty(k, v)
        else el.style.removeProperty(k)
      })
    }
  }, [tenant, preset, customConfig])

  return (
    <TenantContext.Provider value={{ tenant, isImpersonating }}>
      {children}
    </TenantContext.Provider>
  )
}

// Full resolution result: { tenant, isImpersonating }.
export function useTenant() {
  const ctx = useContext(TenantContext)
  if (!ctx) throw new Error('useTenant must be used within a TenantProvider')
  return ctx
}

// The identity to display for any name/tagline/office/contact in shared chrome.
export function useBrand() {
  return useTenant().tenant
}
