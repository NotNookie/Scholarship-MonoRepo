import { create } from 'zustand'
import { findTenant, DEFAULT_TENANT } from '../tenant/tenants'

// Build a brand-shaped object for any municipality the operator enters. Use the
// tenant registry when it has a full entry (Sta. Cruz, Pagsanjan); otherwise
// derive a minimal brand from the platform record so impersonation still works.
function brandFor(m) {
  const known = findTenant(m.subdomain)
  if (known) return known

  const short = (m.name.replace(/[^A-Za-z]/g, '').slice(0, 3) || 'MSO').toUpperCase()
  return {
    id: m.id,
    subdomain: m.subdomain,
    municipality: [m.name, m.province].filter(Boolean).join(', '),
    office: 'Municipal Scholarship Office',
    officeShort: short,
    program: `${m.name} Scholarship Program`,
    tagline: 'Empowering Youth Through Education',
    blurb: `The official scholarship portal of the Municipality of ${m.name}.`,
    contact: {
      addressLines: [`${m.name} Municipal Hall`, [m.name, m.province].filter(Boolean).join(', ')],
      phone: '(000) 000-0000',
      phoneHref: 'tel:+630000000000',
      email: `scholarship@${m.subdomain}.gov.ph`,
    },
    walkthroughVideoUrl: null,
    mapEmbedUrl: null,
    website: null,
    facebook: null,
    manualUrl: null,
    theme: DEFAULT_TENANT.theme,
  }
}

// Operator "view as tenant" state. When `tenant` is set, the whole app resolves
// to that municipality (branding + admin access) with a persistent banner.
export const useImpersonation = create((set) => ({
  tenant: null,
  enter: (municipality) => set({ tenant: brandFor(municipality) }),
  exit: () => set({ tenant: null }),
}))
