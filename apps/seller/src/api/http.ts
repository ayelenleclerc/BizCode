import { createApiClient } from '@bizcode/api-client'
import { SELLER_API_BASE_URL } from '../config'
import { secureTokenStorage } from '../auth/secureTokenStorage'

/**
 * @en Shared Axios client for App Seller (Bearer + field channel).
 * @es Cliente Axios compartido de App Seller (Bearer + canal field).
 * @pt-BR Cliente Axios compartilhado do App Seller (Bearer + canal field).
 */
export const sellerHttp = createApiClient({
  apiBaseUrl: SELLER_API_BASE_URL,
  withCredentials: false,
  tokenStorage: secureTokenStorage,
  defaultChannel: 'field',
})
