import type { AxiosError, AxiosInstance } from 'axios'
import type {
  ApiErrorPayload,
  JsonRecord,
  PedidoListResponse,
  PedidoRow,
  PedidoTransitionInput,
} from '@bizcode/types'
import { api } from '../default-client'
import { handleError } from '../errors'

export function createPedidosAPI(http: AxiosInstance) {
  return {
    list: async (params?: { estado?: string; clienteId?: number }): Promise<PedidoListResponse> => {
      try {
        const response = await http.get<PedidoListResponse>('/pedidos', { params })
        return response.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    get: async (id: number): Promise<PedidoRow> => {
      try {
        const response = await http.get<{ success: boolean; data: PedidoRow }>(`/pedidos/${id}`)
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    create: async (body: JsonRecord): Promise<PedidoRow> => {
      try {
        const response = await http.post<{ success: boolean; data: PedidoRow }>('/pedidos', body)
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    update: async (id: number, body: JsonRecord): Promise<PedidoRow> => {
      try {
        const response = await http.put<{ success: boolean; data: PedidoRow }>(`/pedidos/${id}`, body)
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    confirm: async (id: number): Promise<PedidoRow> => {
      try {
        const response = await http.post<{ success: boolean; data: PedidoRow }>(`/pedidos/${id}/confirm`)
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    pack: async (id: number): Promise<PedidoRow> => {
      try {
        const response = await http.post<{ success: boolean; data: PedidoRow }>(`/pedidos/${id}/pack`)
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    ship: async (id: number): Promise<PedidoRow> => {
      try {
        const response = await http.post<{ success: boolean; data: PedidoRow }>(`/pedidos/${id}/ship`)
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    deliver: async (id: number): Promise<PedidoRow> => {
      try {
        const response = await http.post<{ success: boolean; data: PedidoRow }>(`/pedidos/${id}/deliver`)
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    collect: async (id: number): Promise<PedidoRow> => {
      try {
        const response = await http.post<{ success: boolean; data: PedidoRow }>(`/pedidos/${id}/collect`)
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    transition: async (id: number, body: PedidoTransitionInput & JsonRecord): Promise<PedidoRow> => {
      try {
        const response = await http.post<{ success: boolean; data: PedidoRow }>(
          `/pedidos/${id}/transitions`,
          body,
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    invoice: async (id: number, body: JsonRecord): Promise<PedidoRow> => {
      try {
        const response = await http.post<{ success: boolean; data: PedidoRow }>(`/pedidos/${id}/invoice`, body)
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    cancel: async (id: number): Promise<PedidoRow> => {
      try {
        const response = await http.delete<{ success: boolean; data: PedidoRow }>(`/pedidos/${id}`)
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },
  }
}

export const pedidosAPI = createPedidosAPI(api)
