import { createApiClient } from '@bizcode/api-client'
import { DRIVER_API_BASE_URL } from '../config'
import { secureTokenStorage } from '../auth/secureTokenStorage'

/**
 * @en Shared Axios client for App Driver (Bearer + field channel).
 * @es Cliente Axios compartido de App Driver (Bearer + canal field).
 * @pt-BR Cliente Axios compartilhado do App Driver (Bearer + canal field).
 */
export const driverHttp = createApiClient({
  apiBaseUrl: DRIVER_API_BASE_URL,
  withCredentials: false,
  tokenStorage: secureTokenStorage,
  defaultChannel: 'field',
})
