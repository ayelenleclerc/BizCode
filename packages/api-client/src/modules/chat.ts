import type { AxiosError, AxiosInstance } from 'axios'
import type { ApiErrorPayload, ChatMessageDTO } from '@bizcode/types'
import { handleError } from '../errors'

/**
 * @en Factory for chat REST endpoints (#165 deep link).
 * @es Factory de endpoints REST de chat (#165 deep link).
 * @pt-BR Factory de endpoints REST de chat (#165 deep link).
 */
export function createChatAPI(http: AxiosInstance) {
  return {
    messages: async (userId: number, params?: { limit?: number; before?: number }): Promise<ChatMessageDTO[]> => {
      try {
        const response = await http.get<{ success: boolean; data: ChatMessageDTO[] }>(
          `/chat/messages/${userId}`,
          { params },
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    send: async (toUserId: number, content: string): Promise<ChatMessageDTO> => {
      try {
        const response = await http.post<{ success: boolean; data: ChatMessageDTO }>('/chat/messages', {
          toUserId,
          content,
        })
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },
  }
}
