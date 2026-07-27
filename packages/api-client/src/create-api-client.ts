import axios, { type AxiosError, type AxiosInstance } from 'axios'
import {
  DEFAULT_API_TIMEOUT_MS,
  DEFAULT_PORTAL_API_TIMEOUT_MS,
  resolveApiBaseUrl,
  resolveApiRootUrl,
  type ApiClientConfig,
} from './config'

export function createApiClient(config: ApiClientConfig = {}): AxiosInstance {
  const client = axios.create({
    baseURL: resolveApiBaseUrl(config.apiBaseUrl),
    timeout: config.timeout ?? DEFAULT_API_TIMEOUT_MS,
    withCredentials: config.withCredentials ?? true,
  })

  // Vitest mocks of axios.create may omit interceptors; skip wiring then.
  if (!client.interceptors?.response?.use) {
    return client
  }

  let refreshInFlight: Promise<boolean> | null = null

  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const status = error.response?.status
      const data = error.response?.data as { error?: string } | undefined
      const original = error.config
      if (
        status === 401 &&
        original &&
        !(original as { _retry?: boolean })._retry &&
        !String(original.url ?? '').includes('/auth/refresh') &&
        !String(original.url ?? '').includes('/auth/login') &&
        !String(original.url ?? '').includes('/auth/logout') &&
        (data?.error === 'SESSION_EXPIRED' || data?.error === 'Authentication required')
      ) {
        ;(original as { _retry?: boolean })._retry = true
        if (!refreshInFlight) {
          refreshInFlight = client
            .post('/auth/refresh')
            .then(() => true)
            .catch(() => false)
            .finally(() => {
              refreshInFlight = null
            })
        }
        const ok = await refreshInFlight
        if (ok) {
          return client.request(original)
        }
      }
      return Promise.reject(error)
    },
  )

  return client
}

export function createPortalApiClient(config: ApiClientConfig = {}): AxiosInstance {
  const apiRoot = resolveApiRootUrl(config.apiBaseUrl)
  return axios.create({
    baseURL: `${apiRoot}/api`,
    timeout: config.timeout ?? DEFAULT_PORTAL_API_TIMEOUT_MS,
    withCredentials: config.withCredentials ?? true,
  })
}
