import type { AxiosError, AxiosInstance } from 'axios'
import type {
  ApiErrorPayload,
  PedidoPrefill,
  PlantillaPedido,
  PlantillaPedidoCreateInput,
  PlantillaPedidoPatchInput,
} from '@bizcode/types'
import { api } from '../default-client'
import { handleError } from '../errors'

/**
 * @en Factory for last-order repeat + plantilla APIs (#253).
 * @es Factory de API de repetir pedido y plantillas (#253).
 * @pt-BR Factory da API de repetir pedido e modelos (#253).
 */
export function createPlantillasPedidoAPI(http: AxiosInstance) {
  return {
    getUltimoPedidoRepeat: async (clienteId: number): Promise<PedidoPrefill> => {
      try {
        const response = await http.get<{ success: boolean; data: PedidoPrefill }>(
          `/clientes/${clienteId}/ultimo-pedido-repeat`,
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    list: async (clienteId: number): Promise<PlantillaPedido[]> => {
      try {
        const response = await http.get<{ success: boolean; data: PlantillaPedido[] }>(
          `/clientes/${clienteId}/plantillas-pedido`,
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    create: async (clienteId: number, body: PlantillaPedidoCreateInput): Promise<PlantillaPedido> => {
      try {
        const response = await http.post<{ success: boolean; data: PlantillaPedido }>(
          `/clientes/${clienteId}/plantillas-pedido`,
          body,
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    get: async (id: number): Promise<PlantillaPedido> => {
      try {
        const response = await http.get<{ success: boolean; data: PlantillaPedido }>(
          `/plantillas-pedido/${id}`,
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    cargar: async (id: number): Promise<PedidoPrefill> => {
      try {
        const response = await http.get<{ success: boolean; data: PedidoPrefill }>(
          `/plantillas-pedido/${id}/cargar`,
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    patch: async (id: number, body: PlantillaPedidoPatchInput): Promise<PlantillaPedido> => {
      try {
        const response = await http.patch<{ success: boolean; data: PlantillaPedido }>(
          `/plantillas-pedido/${id}`,
          body,
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    remove: async (id: number): Promise<{ id: number }> => {
      try {
        const response = await http.delete<{ success: boolean; data: { id: number } }>(
          `/plantillas-pedido/${id}`,
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },
  }
}

export const plantillasPedidoAPI = createPlantillasPedidoAPI(api)
