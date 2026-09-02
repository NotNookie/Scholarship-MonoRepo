import axios from 'axios'
import { useAuthStore } from '../store/authStore'
import { installMockAdapter } from '../mocks/adapter'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config.url.startsWith('/auth/')) {
      // Centralized login — everyone re-authenticates at /login, which routes by role.
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// DEV-ONLY: serve /admin/* from an in-memory demo dataset so the admin portal
// renders full without a backend. Dead-code-eliminated in production builds.
if (import.meta.env.DEV) {
  installMockAdapter(api)
}
