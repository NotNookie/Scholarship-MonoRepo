import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Onboarding requests submitted from the public landing form (/iskolar/request),
// reviewed by the super admin (Platform → Requests). Persisted so a request
// submitted on the public site shows up in the operator inbox in the same demo.
// In production this is a server-side table; here it's the frontend stand-in.
const SEED = [
  { id: 'req-1', municipality: 'Municipality of Magdalena', province: 'Laguna', scholars: '300–500', name: 'Elena Rosales', position: 'LYDO Head', email: 'lydo@magdalena.gov.ph', contact: '0917 555 0142', message: 'We run a yearly college assistance program and want to move it online before the next cycle.', status: 'new', submittedAt: '2026-09-10T09:20:00Z' },
  { id: 'req-2', municipality: 'Municipality of Cavinti', province: 'Laguna', scholars: '100–300', name: 'Mark Delos Reyes', position: 'MSWDO Officer', email: 'mswdo@cavinti.gov.ph', contact: '0918 222 7781', message: '', status: 'new', submittedAt: '2026-09-08T14:05:00Z' },
  { id: 'req-3', municipality: 'Municipality of Luisiana', province: 'Laguna', scholars: '500–1,000', name: 'Grace Villanueva', position: 'Municipal Administrator', email: 'admin@luisiana.gov.ph', contact: '0920 118 3345', message: 'Interested — can you walk us through your data-privacy handling?', status: 'in_review', submittedAt: '2026-09-02T11:40:00Z' },
]

export const useOnboardingRequests = create(
  persist(
    (set) => ({
      requests: SEED,
      submit: (data) =>
        set((s) => ({
          requests: [
            { id: `req-${Date.now()}`, ...data, status: 'new', submittedAt: new Date().toISOString() },
            ...s.requests,
          ],
        })),
      setStatus: (id, status) =>
        set((s) => ({ requests: s.requests.map((r) => (r.id === id ? { ...r, status } : r)) })),
    }),
    { name: 'iskolar-onboarding-requests' }
  )
)
