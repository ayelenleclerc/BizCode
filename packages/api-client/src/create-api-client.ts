import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'
import {
  DEFAULT_API_TIMEOUT_MS,
  DEFAULT_PORTAL_API_TIMEOUT_MS,
  resolveApiBaseUrl,
  resolveApiRootUrl,
  type ApiClientConfig,
  type TokenStorage,
} from './config'

type RefreshResponseData = {
  success?: boolean
  data?: {
    refreshed?: boolean
    accessToken?: string
    refreshToken?: string
    expiresIn?: number
  }
}

function setHeader(config: InternalAxiosRequestConfig, name: string, value: string): void {
  const headers = config.headers
  if (headers && typeof headers.set === 'function') {
    headers.set(name, value)
    return
  }
  config.headers = AxiosHeadersCompat(headers, name, value)
}

/** @en Minimal fallback when axios mocks omit AxiosHeaders (#167). @es Fallback mínimo si el mock de axios omite AxiosHeaders (#167). @pt-BR Fallback mínimo quando o mock do axios omite AxiosHeaders (#167). */
function AxiosHeadersCompat(
  previous: InternalAxiosRequestConfig['headers'],
  name: string,
  value: string,
): InternalAxiosRequestConfig['headers'] {
  const base =
    previous && typeof previous === 'object'
      ? { ...(previous as Record<string, unknown>) }
      : {}
  ;(base as Record<string, string>)[name] = value
  return base as InternalAxiosRequestConfig['headers']
}

async function applyBearerAndChannel(
  config: InternalAxiosRequestConfig,
  tokenStorage: TokenStorage | undefined,
  defaultChannel: string | undefined,
): Promise<InternalAxiosRequestConfig> {
  if (defaultChannel) {
    const headers = config.headers
    const hasChannel =
      headers && typeof headers.get === 'function'
        ? Boolean(headers.get('x-bizcode-channel'))
        : Boolean((headers as Record<string, unknown> | undefined)?.['x-bizcode-channel'])
    if (!hasChannel) {
      setHeader(config, 'x-bizcode-channel', defaultChannel)
    }
  }

  if (!tokenStorage) {
    return config
  }

  const accessToken = await tokenStorage.getAccessToken()
  if (accessToken) {
    setHeader(config, 'Authorization', `Bearer ${accessToken}`)
  }
  return config
}

export function createApiClient(config: ApiClientConfig = {}): AxiosInstance {
  const tokenStorage = config.tokenStorage
  const defaultChannel = config.defaultChannel
  const client = axios.create({
    baseURL: resolveApiBaseUrl(config.apiBaseUrl),
    timeout: config.timeout ?? DEFAULT_API_TIMEOUT_MS,
    withCredentials: config.withCredentials ?? true,
  })

  // Vitest mocks of axios.create may omit interceptors; skip wiring then.
  if (!client.interceptors?.request?.use || !client.interceptors?.response?.use) {
    return client
  }

  client.interceptors.request.use((reqConfig) =>
    applyBearerAndChannel(reqConfig, tokenStorage, defaultChannel),
  )

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
          refreshInFlight = (async () => {
            try {
              const refreshToken = tokenStorage?.getRefreshToken
                ? await tokenStorage.getRefreshToken()
                : null
              const body = refreshToken ? { refreshToken } : undefined
              const refreshResponse = await client.post<RefreshResponseData>('/auth/refresh', body)
              const next = refreshResponse.data?.data
              if (
                tokenStorage?.setTokens &&
                typeof next?.accessToken === 'string' &&
                typeof next?.refreshToken === 'string'
              ) {
                await tokenStorage.setTokens({
                  accessToken: next.accessToken,
                  refreshToken: next.refreshToken,
                  expiresIn: next.expiresIn,
                })
              }
              return true
            } catch {
              if (tokenStorage?.clearTokens) {
                await tokenStorage.clearTokens()
              }
              return false
            } finally {
              refreshInFlight = null
            }
          })()
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
