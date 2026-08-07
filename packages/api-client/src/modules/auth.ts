import type { AxiosError, AxiosInstance } from 'axios'
import type { ApiErrorPayload, AuthClaims } from '@bizcode/types'
import { api } from '../default-client'
import { handleError } from '../errors'

export type LoginBody = {
  tenantSlug: string
  username: string
  password: string
  rememberMe?: boolean
}

export type LoginSuccessData = {
  userId: number
  tenantId: number
  username: string
  role: string
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export type LoginMfaChallengeData = {
  mfaRequired: true
  mfaToken: string
}

export type LoginResponseData = LoginSuccessData | LoginMfaChallengeData

export function isLoginMfaChallenge(data: LoginResponseData): data is LoginMfaChallengeData {
  return 'mfaRequired' in data && data.mfaRequired === true
}

export type MfaSetupStartData = {
  otpauthUrl: string
  qrDataUrl: string
  secret: string
}

export type MfaSetupConfirmData = {
  mfaEnabled: true
  backupCodes: string[]
}

export function createAuthAPI(http: AxiosInstance) {
  return {
    login: async (body: LoginBody): Promise<LoginResponseData> => {
      try {
        const response = await http.post<{ success: boolean; data: LoginResponseData }>('/auth/login', body)
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    verifyMfa: async (body: { mfaToken: string; code: string }): Promise<LoginSuccessData> => {
      try {
        const response = await http.post<{ success: boolean; data: LoginSuccessData }>('/auth/mfa/verify', body)
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    mfaSetupStart: async (): Promise<MfaSetupStartData> => {
      try {
        const response = await http.post<{ success: boolean; data: MfaSetupStartData }>('/auth/mfa/setup/start')
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    mfaSetupConfirm: async (body: { code: string }): Promise<MfaSetupConfirmData> => {
      try {
        const response = await http.post<{ success: boolean; data: MfaSetupConfirmData }>(
          '/auth/mfa/setup/confirm',
          body,
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    mfaDisable: async (body: { code: string }): Promise<{ mfaEnabled: false }> => {
      try {
        const response = await http.post<{ success: boolean; data: { mfaEnabled: false } }>(
          '/auth/mfa/disable',
          body,
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    adminDisableMfa: async (
      userId: number,
      body: { enabled: false; code?: string },
    ): Promise<{ mfaEnabled: false }> => {
      try {
        const response = await http.patch<{ success: boolean; data: { mfaEnabled: false } }>(
          `/users/${userId}/mfa`,
          body,
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    refresh: async (body?: { refreshToken?: string }): Promise<{
      refreshed: boolean
      accessToken: string
      refreshToken: string
      expiresIn: number
    }> => {
      try {
        const response = await http.post<{
          success: boolean
          data: {
            refreshed: boolean
            accessToken: string
            refreshToken: string
            expiresIn: number
          }
        }>('/auth/refresh', body)
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    logout: async (body?: { refreshToken?: string }): Promise<{ loggedOut: boolean }> => {
      try {
        const response = await http.post<{ success: boolean; data: { loggedOut: boolean } }>(
          '/auth/logout',
          body,
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    me: async (): Promise<AuthClaims> => {
      try {
        const response = await http.get<{ success: boolean; data: AuthClaims }>('/auth/me')
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },
  }
}

export const authAPI = createAuthAPI(api)
