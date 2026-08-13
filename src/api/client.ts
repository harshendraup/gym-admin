import axios, { type AxiosInstance, type AxiosResponse } from 'axios'
import { useAuthStore } from '@/store/auth.store'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3333/api/v1'

export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { Accept: 'application/json' },
  timeout: 30_000,
})

// ─── Request interceptor: attach JWT ────────────────────────────────────────
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Endpoints where a 401 means "bad credentials", not "session expired" —
// they must not trigger the auto-logout redirect below.
const AUTH_ENDPOINTS = ['/auth/login', '/auth/register']

// ─── Response interceptor: log out on 401 ────────────────────────────────────
// The API issues long-lived access tokens with no refresh endpoint, so an
// expired/revoked token on any other request just means the session is over.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthEndpoint = AUTH_ENDPOINTS.some((url) => error.config?.url?.includes(url))

    if (error.response?.status === 401 && !isAuthEndpoint) {
      useAuthStore.getState().logout()
      window.location.href = '/auth/login'
    }

    return Promise.reject(error)
  }
)

export type ApiResponse<T> = {
  success: boolean
  data: T
  meta?: {
    total: number
    page: number
    perPage: number
    lastPage: number
  }
}

export async function get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  const res: AxiosResponse<ApiResponse<T>> = await apiClient.get(url, { params })
  return res.data.data
}

export async function post<T>(url: string, body?: unknown): Promise<T> {
  const res: AxiosResponse<ApiResponse<T>> = await apiClient.post(url, body)
  return res.data.data
}

export async function put<T>(url: string, body?: unknown): Promise<T> {
  const res: AxiosResponse<ApiResponse<T>> = await apiClient.put(url, body)
  return res.data.data
}

export async function del<T>(url: string): Promise<T> {
  const res: AxiosResponse<ApiResponse<T>> = await apiClient.delete(url)
  return res.data.data
}

export async function getPaginated<T>(
  url: string,
  params?: Record<string, unknown>
): Promise<{ data: T[]; meta: ApiResponse<T[]>['meta'] }> {
  const res: AxiosResponse<ApiResponse<T[]>> = await apiClient.get(url, { params })
  return { data: res.data.data, meta: res.data.meta }
}

// Convenience object used by pages/hooks that prefer `api.get(...)` style
export const api = { get, post, put, del, getPaginated }
