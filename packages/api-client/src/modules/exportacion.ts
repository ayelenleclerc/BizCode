import type { AxiosError, AxiosInstance } from 'axios'
import type {
  ApiErrorPayload,
  DespachanteInput,
  DespachanteNotificationResult,
  Incoterm,
} from '@bizcode/types'
import { api } from '../default-client'
import { handleError } from '../errors'

/**
 * @en Export vertical client (#206, module `vertical.export`).
 * @es Cliente del vertical exportación (#206, módulo `vertical.export`).
 * @pt-BR Cliente do vertical exportação (#206, módulo `vertical.export`).
 */
export function createExportacionAPI(http: AxiosInstance) {
  return {
    listIncoterms: async (): Promise<Incoterm[]> => {
      try {
        const response = await http.get<{ success: boolean; data: Incoterm[] }>(
          '/exportacion/incoterms',
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    notificarDespachante: async (
      pedidoId: number,
      body: DespachanteInput,
    ): Promise<DespachanteNotificationResult> => {
      try {
        const response = await http.post<{ success: boolean; data: DespachanteNotificationResult }>(
          `/pedidos/${pedidoId}/notificar-despachante`,
          body,
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },
  }
}

export const exportacionAPI = createExportacionAPI(api)
