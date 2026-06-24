import axios, { type AxiosInstance } from 'axios'
import {
  DEFAULT_API_TIMEOUT_MS,
  DEFAULT_PORTAL_API_TIMEOUT_MS,
  resolveApiBaseUrl,
  resolveApiRootUrl,
  type ApiClientConfig,
} from './config'

export function createApiClient(config: ApiClientConfig = {}): AxiosInstance {
  return axios.create({
    baseURL: resolveApiBaseUrl(config.apiBaseUrl),
    timeout: config.timeout ?? DEFAULT_API_TIMEOUT_MS,
    withCredentials: config.withCredentials ?? true,
  })
}

export function createPortalApiClient(config: ApiClientConfig = {}): AxiosInstance {
  const apiRoot = resolveApiRootUrl(config.apiBaseUrl)
  return axios.create({
    baseURL: `${apiRoot}/api`,
    timeout: config.timeout ?? DEFAULT_PORTAL_API_TIMEOUT_MS,
    withCredentials: config.withCredentials ?? true,
  })
}
