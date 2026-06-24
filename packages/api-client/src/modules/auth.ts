import type { AxiosError, AxiosInstance } from 'axios'
import type { ApiErrorPayload, AuthClaims } from '@bizcode/types'
import { api } from '../default-client'
import { handleError } from '../errors'

export type LoginBody = {
  tenantSlug: string
  username: string
  password: string
}

export type LoginResponseData = {
  userId: number
  tenantId: number
  username: string
  role: string
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

    logout: async (): Promise<{ loggedOut: boolean }> => {
      try {
        const response = await http.post<{ success: boolean; data: { loggedOut: boolean } }>('/auth/logout')
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
