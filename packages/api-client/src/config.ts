export const DEFAULT_API_BASE_URL = 'http://localhost:3001/api'
export const DEFAULT_API_ROOT_URL = 'http://localhost:3001'
export const DEFAULT_API_TIMEOUT_MS = 10_000
export const DEFAULT_PORTAL_API_TIMEOUT_MS = 15_000

/**
 * @en Pluggable token persistence for Bearer clients (e.g. Expo SecureStore) (#167).
 * @es Persistencia pluggable de tokens para clientes Bearer (p. ej. Expo SecureStore) (#167).
 * @pt-BR Persistência plugável de tokens para clientes Bearer (ex. Expo SecureStore) (#167).
 */
export type TokenStorage = {
  getAccessToken: () => string | null | Promise<string | null>
  getRefreshToken?: () => string | null | Promise<string | null>
  setTokens?: (tokens: {
    accessToken: string
    refreshToken: string
    expiresIn?: number
  }) => void | Promise<void>
  clearTokens?: () => void | Promise<void>
}

export type ApiClientConfig = {
  /** Full REST base URL including `/api` suffix (e.g. `https://app.example.com/api`). */
  apiBaseUrl?: string
  timeout?: number
  withCredentials?: boolean
  /**
   * @en When set, attaches `Authorization: Bearer` and uses body refresh instead of cookies alone (#167).
   * @es Si se define, adjunta `Authorization: Bearer` y usa refresh en body además de cookies (#167).
   * @pt-BR Se definido, anexa `Authorization: Bearer` e usa refresh no body além de cookies (#167).
   */
  tokenStorage?: TokenStorage
  /**
   * @en Optional default `x-bizcode-channel` (e.g. `field` for App Seller) (#167).
   * @es Canal por defecto opcional `x-bizcode-channel` (p. ej. `field` para App Seller) (#167).
   * @pt-BR Canal padrão opcional `x-bizcode-channel` (ex. `field` para App Seller) (#167).
   */
  defaultChannel?: string
}

export function resolveApiBaseUrl(apiBaseUrl?: string): string {
  const trimmed = apiBaseUrl?.trim()
  return trimmed && trimmed.length > 0 ? trimmed : DEFAULT_API_BASE_URL
}

/** Host root without trailing `/api` — used by the portal HTTP client. */
export function resolveApiRootUrl(apiBaseUrl?: string): string {
  const base = resolveApiBaseUrl(apiBaseUrl)
  const root = base.replace(/\/api\/?$/, '')
  return root.length > 0 ? root : DEFAULT_API_ROOT_URL
}
