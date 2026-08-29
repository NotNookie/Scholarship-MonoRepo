import { create } from 'zustand'

// Placeholder tenant data for the platform (Super Admin) console while there is
// no multi-tenant backend yet. Swap this store for TanStack Query calls to
// `/platform/municipalities` once the backend exists — the components read from
// selectors, so the shape is what matters.
// NOTE: illustrative sample data — not real municipalities or figures.
const SAMPLE = [
  { id: 'sta-cruz',  name: 'Sta. Cruz',  province: 'Laguna', subdomain: 'stacruz',   status: 'active',     scholars: 1248, admins: 1, staff: 4, programs: 3, cycle: 'A.Y. 2026–2027', applications: 642, onboarded: 'Aug 2025', main: true, ocr: true,  ai: true },
  { id: 'pagsanjan', name: 'Pagsanjan',  province: 'Laguna', subdomain: 'pagsanjan', status: 'active',     scholars: 412,  admins: 1, staff: 2, programs: 2, cycle: 'A.Y. 2026–2027', applications: 198, onboarded: 'Oct 2025', ocr: true,  ai: false },
  { id: 'pakil',     name: 'Pakil',      province: 'Laguna', subdomain: 'pakil',     status: 'active',     scholars: 186,  admins: 1, staff: 1, programs: 1, cycle: 'A.Y. 2026–2027', applications: 74,  onboarded: 'Nov 2025', ocr: true,  ai: false },
  { id: 'nagcarlan', name: 'Nagcarlan',  province: 'Laguna', subdomain: 'nagcarlan', status: 'active',     scholars: 58,   admins: 1, staff: 1, programs: 1, cycle: 'A.Y. 2026–2027', applications: 31,  onboarded: 'Jan 2026', ocr: false, ai: false },
  { id: 'pila',      name: 'Pila',       province: 'Laguna', subdomain: 'pila',      status: 'onboarding', scholars: 0,    admins: 1, staff: 0, programs: 0, cycle: '—',              applications: 0,   onboarded: 'Feb 2026', ocr: false, ai: false },
]

function initials(name) {
  const parts = name.trim().split(/\s+/)
  return (parts.length >= 2 ? parts[0][0] + parts[1][0] : name.slice(0, 2)).toUpperCase()
}

export const usePlatformStore = create((set) => ({
  municipalities: SAMPLE,

  // Toggle a tenant between active and suspended (reversible from the UI).
  toggleStatus: (id) =>
    set((s) => ({
      municipalities: s.municipalities.map((m) =>
        m.id === id ? { ...m, status: m.status === 'suspended' ? 'active' : 'suspended' } : m
      ),
    })),

  // Charter a new tenant (local only, for design iteration).
  onboard: ({ name, province, subdomain }) =>
    set((s) => ({
      municipalities: [
        ...s.municipalities,
        {
          id: subdomain || name.toLowerCase().replace(/\s+/g, '-'),
          name, province: province || '—', subdomain: subdomain || 'new',
          status: 'onboarding', scholars: 0, admins: 1, staff: 0, programs: 0,
          cycle: '—', applications: 0, onboarded: 'Just now', ocr: false, ai: false,
        },
      ],
    })),

  // Our own team's accounts (placeholder — swap for /platform/users API later).
  platformUsers: [
    { id: 'you', name: 'Platform Admin', email: 'admin@iskolar.ph', role: 'super_admin', lastActive: 'Just now', you: true },
    { id: 'mika', name: 'Mika Ramos', email: 'mika@iskolar.ph', role: 'support', lastActive: '2 hours ago' },
    { id: 'dan', name: 'Dan Lim', email: 'dan@iskolar.ph', role: 'readonly', lastActive: 'Yesterday' },
  ],
  invitePlatformUser: ({ name, email, role }) =>
    set((s) => ({
      platformUsers: [
        ...s.platformUsers,
        { id: email || name, name: name || email, email, role, lastActive: 'Invited · pending' },
      ],
    })),
}))

// Platform-level roles for our own team (distinct from the municipal roles).
export const PLATFORM_ROLES = {
  super_admin: { label: 'Super Admin', cls: 'accent', desc: 'Full control — onboard, suspend, manage the platform team.' },
  support: { label: 'Support', cls: 'info', desc: 'Read everything and assist tenants; can open support sessions.' },
  readonly: { label: 'Read-only', cls: 'neutral', desc: 'Oversight only — can view, cannot change anything.' },
}

export const STATUS_META = {
  active: { label: 'Active', cls: 'ok' },
  onboarding: { label: 'Onboarding', cls: 'warn' },
  suspended: { label: 'Suspended', cls: 'stop' },
}

export const sigilOf = initials
