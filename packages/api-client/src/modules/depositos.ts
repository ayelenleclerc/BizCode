import type { AxiosError, AxiosInstance } from 'axios'
import type {
  ApiErrorPayload,
  ArticuloStockPorDepositoResponse,
  DepositoCreateInput,
  DepositoListResponse,
  DepositoPatchInput,
  DepositoRow,
  TransferenciaDepositoCreateInput,
  TransferenciaDepositoListResponse,
  TransferenciaDepositoRecibirInput,
  TransferenciaDepositoRow,
} from '@bizcode/types'
import { api } from '../default-client'
import { handleError } from '../errors'

/**
 * @en HTTP client for multi-warehouse deposits and transfers (#236).
 * @es Cliente HTTP para depósitos multi-almacén y transferencias (#236).
 * @pt-BR Cliente HTTP para depósitos multi-armazém e transferências (#236).
 */
export function createDepositosAPI(http: AxiosInstance) {
  return {
    listDepositos: async (params?: {
      take?: number
      skip?: number
      activo?: boolean
    }): Promise<DepositoListResponse> => {
      try {
        const response = await http.get<DepositoListResponse>('/depositos', { params })
        return response.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    getDeposito: async (id: number): Promise<DepositoRow> => {
      try {
        const response = await http.get<{ success: boolean; data: DepositoRow }>(`/depositos/${id}`)
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    createDeposito: async (body: DepositoCreateInput): Promise<DepositoRow> => {
      try {
        const response = await http.post<{ success: boolean; data: DepositoRow }>('/depositos', body)
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    updateDeposito: async (id: number, body: DepositoPatchInput): Promise<DepositoRow> => {
      try {
        const response = await http.patch<{ success: boolean; data: DepositoRow }>(
          `/depositos/${id}`,
          body,
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    removeDeposito: async (id: number): Promise<void> => {
      try {
        await http.delete(`/depositos/${id}`)
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    stockPorArticulo: async (articuloId: number): Promise<ArticuloStockPorDepositoResponse> => {
      try {
        const response = await http.get<ArticuloStockPorDepositoResponse>(
          `/articulos/${articuloId}/stock-depositos`,
        )
        return response.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    listTransferencias: async (params?: {
      take?: number
      skip?: number
      estado?: string
    }): Promise<TransferenciaDepositoListResponse> => {
      try {
        const response = await http.get<TransferenciaDepositoListResponse>(
          '/transferencias-deposito',
          { params },
        )
        return response.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    getTransferencia: async (id: number): Promise<TransferenciaDepositoRow> => {
      try {
        const response = await http.get<{ success: boolean; data: TransferenciaDepositoRow }>(
          `/transferencias-deposito/${id}`,
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    createTransferencia: async (
      body: TransferenciaDepositoCreateInput,
    ): Promise<TransferenciaDepositoRow> => {
      try {
        const response = await http.post<{ success: boolean; data: TransferenciaDepositoRow }>(
          '/transferencias-deposito',
          body,
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    markEnTransito: async (id: number): Promise<TransferenciaDepositoRow> => {
      try {
        const response = await http.post<{ success: boolean; data: TransferenciaDepositoRow }>(
          `/transferencias-deposito/${id}/en-transito`,
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    recibirTransferencia: async (
      id: number,
      body: TransferenciaDepositoRecibirInput,
    ): Promise<TransferenciaDepositoRow> => {
      try {
        const response = await http.post<{ success: boolean; data: TransferenciaDepositoRow }>(
          `/transferencias-deposito/${id}/recibir`,
          body,
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    anularTransferencia: async (id: number): Promise<TransferenciaDepositoRow> => {
      try {
        const response = await http.post<{ success: boolean; data: TransferenciaDepositoRow }>(
          `/transferencias-deposito/${id}/anular`,
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },
  }
}

export const depositosAPI = createDepositosAPI(api)
