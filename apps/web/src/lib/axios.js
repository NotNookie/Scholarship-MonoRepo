import axios from 'axios'
import { useAuthStore } from '../store/authStore'

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
    if (error.response?.status === 401) {
      const role = useAuthStore.getState().user?.role
      useAuthStore.getState().logout()
      const isAdmin = role && role !== 'student'
      window.location.href = isAdmin ? '/admin/login' : '/login'
    }
    return Promise.reject(error)
  }
)
