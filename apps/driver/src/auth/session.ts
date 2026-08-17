import {
  createAuthAPI,
  isLoginMfaChallenge,
  type LoginBody,
  type LoginSuccessData,
} from '@bizcode/api-client'
import type { AuthClaims } from '@bizcode/types'
import { driverHttp } from '../api/http'
import { secureTokenStorage } from './secureTokenStorage'

const driverAuthApi = createAuthAPI(driverHttp)

export async function loginDriver(body: LoginBody): Promise<LoginSuccessData> {
  const data = await driverAuthApi.login(body)
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
    return await driverAuthApi.me()
  } catch {
    return null
  }
}

export async function logoutDriver(): Promise<void> {
  const refreshToken = await secureTokenStorage.getRefreshToken?.()
  try {
    await driverAuthApi.logout(refreshToken ? { refreshToken } : undefined)
  } catch {
    // Clear local tokens even if the network call fails.
  }
  await secureTokenStorage.clearTokens?.()
}
