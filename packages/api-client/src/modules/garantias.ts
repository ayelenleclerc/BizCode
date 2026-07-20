import type { AxiosError, AxiosInstance } from 'axios'
import type {
  ApiErrorPayload,
  GarantiaListResponse,
  GarantiaLookupResult,
  GarantiaRow,
  JsonRecord,
} from '@bizcode/types'
import { api } from '../default-client'
import { handleError } from '../errors'

export function createGarantiasAPI(http: AxiosInstance) {
  return {
    list: async (params?: {
      estado?: string
      q?: string
      proximas?: boolean
    }): Promise<GarantiaListResponse> => {
      try {
        const response = await http.get<GarantiaListResponse>('/garantias', { params })
        return response.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    lookup: async (serial: string): Promise<GarantiaLookupResult> => {
      try {
        const response = await http.get<{ success: boolean; data: GarantiaLookupResult }>(
          '/garantias/lookup',
          { params: { serial } },
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    get: async (id: number): Promise<GarantiaRow> => {
      try {
        const response = await http.get<{ success: boolean; data: GarantiaRow }>(`/garantias/${id}`)
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    register: async (body: JsonRecord): Promise<GarantiaRow> => {
      try {
        const response = await http.post<{ success: boolean; data: GarantiaRow }>('/garantias', body)
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    anular: async (id: number): Promise<GarantiaRow> => {
      try {
        const response = await http.post<{ success: boolean; data: GarantiaRow }>(
          `/garantias/${id}/anular`,
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },
  }
}

export const garantiasAPI = createGarantiasAPI(api)
