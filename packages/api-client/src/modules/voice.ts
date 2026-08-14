import type { AxiosError, AxiosInstance } from 'axios'
import type { ApiErrorPayload } from '@bizcode/types'
import { api } from '../default-client'
import { handleError } from '../errors'

/**
 * @en Factory for Whisper transcription used by App Seller speech-to-order (#266).
 * @es Factory de transcripción Whisper para toma de pedido por voz (#266).
 * @pt-BR Factory de transcrição Whisper para tomada de pedido por voz (#266).
 */
export function createVoiceAPI(http: AxiosInstance) {
  return {
    transcribe: async (file: { uri: string; name: string; type: string }, locale?: string): Promise<string> => {
      try {
        const body = new FormData()
        body.append('file', {
          uri: file.uri,
          name: file.name,
          type: file.type,
        } as unknown as Blob)
        if (locale) body.append('locale', locale)
        const response = await http.post<{ success: boolean; data: { text: string } }>(
          '/voice/transcribe',
          body,
          { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 30_000 },
        )
        return response.data.data.text
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },
  }
}

export const voiceAPI = createVoiceAPI(api)
