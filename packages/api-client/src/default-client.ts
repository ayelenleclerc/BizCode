import type { AxiosInstance } from 'axios'
import type { ApiClientConfig } from './config'
import { createApiClient, createPortalApiClient } from './create-api-client'

export const api: AxiosInstance = createApiClient()
export const portalHttp: AxiosInstance = createPortalApiClient()

export function configureApiClient(config: ApiClientConfig): void {
  const next = createApiClient(config)
  api.defaults.baseURL = next.defaults.baseURL
  api.defaults.timeout = next.defaults.timeout
  api.defaults.withCredentials = next.defaults.withCredentials
}

export function configurePortalApiClient(config: ApiClientConfig): void {
  const next = createPortalApiClient(config)
  portalHttp.defaults.baseURL = next.defaults.baseURL
  portalHttp.defaults.timeout = next.defaults.timeout
  portalHttp.defaults.withCredentials = next.defaults.withCredentials
}

/** Applies the same base URL to both REST and portal HTTP clients (web bootstrap). */
export function configureApiClients(config: ApiClientConfig): void {
  configureApiClient(config)
  configurePortalApiClient(config)
}
