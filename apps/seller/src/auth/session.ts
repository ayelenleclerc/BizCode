import {
  createApiClient,
  createAuthAPI,
  isLoginMfaChallenge,
  type LoginBody,
  type LoginSuccessData,
} from '@bizcode/api-client'
import type { AuthClaims } from '@bizcode/types'
import { SELLER_API_BASE_URL } from '../config'
import { secureTokenStorage } from './secureTokenStorage'

const http = createApiClient({
  apiBaseUrl: SELLER_API_BASE_URL,
  withCredentials: false,
  tokenStorage: secureTokenStorage,
  defaultChannel: 'field',
})

export const sellerAuthApi = createAuthAPI(http)

export async function loginSeller(body: LoginBody): Promise<LoginSuccessData> {
  const data = await sellerAuthApi.login(body)
  if (isLoginMfaChallenge(data)) {
    throw new Error('MFA_REQUIRED')
  }
  await secureTokenStorage.setTokens?.({
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    expiresIn: data.expiresIn,
  })
  return data
}

export async function loadSessionClaims(): Promise<AuthClaims | null> {
  const access = await secureTokenStorage.getAccessToken()
  if (!access) {
    return null
  }
  try {
    return await sellerAuthApi.me()
  } catch {
    return null
  }
}

export async function logoutSeller(): Promise<void> {
  const refreshToken = await secureTokenStorage.getRefreshToken?.()
  try {
    await sellerAuthApi.logout(refreshToken ? { refreshToken } : undefined)
  } catch {
    // Clear local tokens even if the network call fails.
  }
  await secureTokenStorage.clearTokens?.()
}
