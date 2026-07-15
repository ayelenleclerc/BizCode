import type { AxiosError, AxiosInstance } from 'axios'
import type {
  ApiErrorPayload,
  ContratoListResponse,
  ContratoRow,
  JsonRecord,
} from '@bizcode/types'
import { api } from '../default-client'
import { handleError } from '../errors'

export function createContratosAPI(http: AxiosInstance) {
  return {
    list: async (): Promise<ContratoListResponse> => {
      try {
        const response = await http.get<ContratoListResponse>('/contratos')
        return response.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    get: async (id: number): Promise<ContratoRow> => {
      try {
        const response = await http.get<{ success: boolean; data: ContratoRow }>(`/contratos/${id}`)
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    create: async (body: JsonRecord): Promise<ContratoRow> => {
      try {
        const response = await http.post<{ success: boolean; data: ContratoRow }>('/contratos', body)
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    update: async (id: number, body: JsonRecord): Promise<ContratoRow> => {
      try {
        const response = await http.put<{ success: boolean; data: ContratoRow }>(`/contratos/${id}`, body)
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    pause: async (id: number): Promise<ContratoRow> => {
      try {
        const response = await http.post<{ success: boolean; data: ContratoRow }>(`/contratos/${id}/pause`)
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    resume: async (id: number): Promise<ContratoRow> => {
      try {
        const response = await http.post<{ success: boolean; data: ContratoRow }>(`/contratos/${id}/resume`)
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    listFacturas: async (id: number): Promise<unknown[]> => {
      try {
        const response = await http.get<{ success: boolean; data: unknown[] }>(`/contratos/${id}/facturas`)
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    applyManualAdjustment: async (id: number, body: { porcentaje: number }): Promise<ContratoRow> => {
      try {
        const response = await http.post<{ success: boolean; data: ContratoRow }>(
          `/contratos/${id}/ajuste-manual`,
          body,
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },
  }
}

export const contratosAPI = createContratosAPI(api)
