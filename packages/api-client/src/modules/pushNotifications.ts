import type { AxiosError, AxiosInstance } from 'axios'
import type { ApiErrorPayload, DevicePushTokenDTO, PushPreferencesDTO } from '@bizcode/types'
import { api } from '../default-client'
import { handleError } from '../errors'

/**
 * @en Factory for current-user push token and mute preferences (#172).
 * @es Factory de token push y preferencias de silencio del usuario (#172).
 * @pt-BR Factory de token push e preferências de silêncio do usuário (#172).
 */
export function createPushNotificationsAPI(http: AxiosInstance) {
  return {
    registerToken: async (body: {
      token: string
      platform?: string
    }): Promise<DevicePushTokenDTO> => {
      try {
        const response = await http.post<{ success: boolean; data: DevicePushTokenDTO }>(
          '/users/me/push-token',
          body,
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    unregisterToken: async (token: string): Promise<{ deleted: number }> => {
      try {
        const response = await http.delete<{ success: boolean; data: { deleted: number } }>(
          '/users/me/push-token',
          { data: { token } },
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    getPreferences: async (): Promise<PushPreferencesDTO> => {
      try {
        const response = await http.get<{ success: boolean; data: PushPreferencesDTO }>(
          '/users/me/push-preferences',
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    updatePreferences: async (mutedTypes: string[]): Promise<PushPreferencesDTO> => {
      try {
        const response = await http.put<{ success: boolean; data: PushPreferencesDTO }>(
          '/users/me/push-preferences',
          { mutedTypes },
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },
  }
}

export const pushNotificationsAPI = createPushNotificationsAPI(api)
