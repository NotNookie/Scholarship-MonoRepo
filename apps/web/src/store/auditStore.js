import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Accountability trail for operator (platform-team) access into tenant portals.
// Each consent-based "enter tenant" opens a session; exiting (or a revoke) closes
// it. Persisted so the record survives across role switches in the demo — an
// operator enters, and the municipality Head can later review who accessed their
// portal and when. In production this belongs server-side and append-only; here
// it is the frontend representation of that audit log.
export const useAuditStore = create(
  persist(
    (set) => ({
      sessions: [],

      startAccess: ({ operator, tenantId, tenantName, ticketId }) => {
        const entry = {
          id: `acc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          operator: operator ?? 'Platform operator',
          tenantId,
          tenantName,
          ticketId: ticketId ?? null,
          enteredAt: new Date().toISOString(),
          exitedAt: null,
        }
        set((s) => ({ sessions: [entry, ...s.sessions] }))
      },

      // Close the most recent still-open session for this tenant.
      endAccess: (tenantId) =>
        set((s) => {
          let closed = false
          return {
            sessions: s.sessions.map((x) => {
              if (!closed && x.tenantId === tenantId && !x.exitedAt) {
                closed = true
                return { ...x, exitedAt: new Date().toISOString() }
              }
              return x
            }),
          }
        }),
    }),
    { name: 'iskolar-operator-audit' }
  )
)
