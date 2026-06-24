export const DEFAULT_API_BASE_URL = 'http://localhost:3001/api'
export const DEFAULT_API_ROOT_URL = 'http://localhost:3001'
export const DEFAULT_API_TIMEOUT_MS = 10_000
export const DEFAULT_PORTAL_API_TIMEOUT_MS = 15_000

export type ApiClientConfig = {
  /** Full REST base URL including `/api` suffix (e.g. `https://app.example.com/api`). */
  apiBaseUrl?: string
  timeout?: number
  withCredentials?: boolean
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
