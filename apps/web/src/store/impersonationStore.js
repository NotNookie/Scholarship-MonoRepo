import { create } from 'zustand'
import { findTenant, DEFAULT_TENANT } from '../tenant/tenants'
import { useAuthStore } from './authStore'
import { useAuditStore } from './auditStore'

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
    // Conservative defaults for an unknown municipality: essay on, extras off.
    features: { essay: true, qualifyingExam: false, orientation: false, payoutTracking: false },
    applicationDeadline: null,
    programs: null,
    qualifications: null,
    guideSteps: null,
    faqs: null,
    theme: DEFAULT_TENANT.theme,
  }
}

// Operator "view as tenant" state. When `tenant` is set, the whole app resolves
// to that municipality (branding + admin access) with a persistent banner.
// Entering/exiting also opens/closes an audit session (see auditStore) so the
// access is accountable to both the platform and the municipality.
export const useImpersonation = create((set, get) => ({
  tenant: null,
  tenantId: null,
  enter: (municipality, meta = {}) => {
    const operator = useAuthStore.getState().user?.name ?? 'Platform operator'
    useAuditStore.getState().startAccess({
      operator,
      tenantId: municipality.id,
      tenantName: municipality.name,
      ticketId: meta.ticketId,
    })
    set({ tenant: brandFor(municipality), tenantId: municipality.id })
  },
  exit: () => {
    const { tenantId } = get()
    if (tenantId) useAuditStore.getState().endAccess(tenantId)
    set({ tenant: null, tenantId: null })
  },
}))
