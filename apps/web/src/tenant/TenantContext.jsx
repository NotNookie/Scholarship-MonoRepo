/* eslint-disable react-refresh/only-export-components -- context module: the
   provider and its consumer hooks (useTenant/useBrand) are intentionally
   colocated with the context they share. */
import { createContext, useContext, useEffect, useState } from 'react'
import { resolveSubdomain, findTenant, DEFAULT_TENANT } from './tenants'

// Private — components read tenant state through the hooks below, never the
// raw context (keeps this file Fast-Refresh friendly).
const TenantContext = createContext(null)

/**
 * Resolves "which municipality am I?" once from the URL and makes it available
 * app-wide. status is one of:
 *   'tenant'   — a known municipality (tenant is set)
 *   'root'     — the bare platform host, no subdomain (tenant is null)
 *   'notfound' — a subdomain that matches no municipality (tenant is null)
 */
export function TenantProvider({ children }) {
  // Resolved once from the URL; the host doesn't change without a full reload.
  // No / unknown subdomain falls back to the default tenant for now.
  const [value] = useState(() => {
    const subdomain = resolveSubdomain(window.location.hostname, window.location.search)
    const tenant = findTenant(subdomain) ?? DEFAULT_TENANT
    return { tenant, subdomain }
  })

  // Apply the tenant's palette by overriding the @theme CSS variables on :root.
  useEffect(() => {
    const theme = value.tenant?.theme
    if (!theme) return
    const el = document.documentElement
    const previous = {}
    Object.entries(theme).forEach(([k, v]) => {
      previous[k] = el.style.getPropertyValue(k)
      el.style.setProperty(k, v)
    })
    return () => {
      Object.entries(previous).forEach(([k, v]) => {
        if (v) el.style.setProperty(k, v)
        else el.style.removeProperty(k)
      })
    }
  }, [value.tenant])

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>
}

// Full resolution result: { tenant, subdomain, status }.
export function useTenant() {
  const ctx = useContext(TenantContext)
  if (!ctx) throw new Error('useTenant must be used within a TenantProvider')
  return ctx
}

// The identity to display for any name/tagline/office/contact in shared chrome.
export function useBrand() {
  return useTenant().tenant
}
