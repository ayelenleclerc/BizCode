import type { AxiosError, AxiosInstance } from 'axios'
import type { ApiErrorPayload, SugerenciasPedido } from '@bizcode/types'
import { api } from '../default-client'
import { handleError } from '../errors'

/**
 * @en Factory for App Seller order-suggestion APIs (#254).
 * @es Factory de API de sugerencias de pedido App Seller (#254).
 * @pt-BR Factory da API de sugestões de pedido App Seller (#254).
 */
export function createSugerenciasPedidoAPI(http: AxiosInstance) {
  return {
    get: async (
      clienteId: number,
      opts?: { limit?: number; offset?: number },
    ): Promise<SugerenciasPedido> => {
      try {
        const response = await http.get<{ success: boolean; data: SugerenciasPedido }>(
          `/clientes/${clienteId}/sugerencias-pedido`,
          {
            params: {
              ...(opts?.limit != null ? { limit: opts.limit } : {}),
              ...(opts?.offset != null ? { offset: opts.offset } : {}),
            },
          },
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },
  }
}

export const sugerenciasPedidoAPI = createSugerenciasPedidoAPI(api)
