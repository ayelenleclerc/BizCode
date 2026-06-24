export * from './api'
export type { ApiClientConfig } from './config'
export {
  DEFAULT_API_BASE_URL,
  DEFAULT_API_ROOT_URL,
  DEFAULT_API_TIMEOUT_MS,
  DEFAULT_PORTAL_API_TIMEOUT_MS,
  resolveApiBaseUrl,
  resolveApiRootUrl,
} from './config'
export { createApiClient, createPortalApiClient } from './create-api-client'
export {
  api,
  configureApiClient,
  configureApiClients,
  configurePortalApiClient,
  portalHttp,
} from './default-client'
export { ApiRequestFailedError, getAuthErrorI18nKey, handleError } from './errors'
export {
  createPortalAPI,
  createPortalConfigAPI,
  portalAPI,
  portalConfigAPI,
} from './modules/portal'
export type { PortalBranding, PortalConfig, PortalFactura, PortalMe } from './modules/portal'
