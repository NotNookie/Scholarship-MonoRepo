import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      // Whether the persisted auth has finished loading from localStorage.
      // Guards against a flash-redirect to /login on a hard refresh of a
      // gated page, before rehydration has run (see RequireAuth).
      hasHydrated: false,
      login: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
      setHasHydrated: (v) => set({ hasHydrated: v }),
    }),
    {
      name: 'iskolar-auth',
      // Only persist the credentials, never the hydration flag.
      partialize: (s) => ({ user: s.user, token: s.token }),
      onRehydrateStorage: () => (state) => { state?.setHasHydrated(true) },
    }
  )
)
