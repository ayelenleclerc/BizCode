import type { AxiosError, AxiosInstance } from 'axios'
import type {
  ApiErrorPayload,
  JsonRecord,
  VisitaDiaKpi,
  VisitaVendedorListResponse,
  VisitaVendedorRow,
} from '@bizcode/types'
import { api } from '../default-client'
import { handleError } from '../errors'

export type VisitasListResult = VisitaVendedorListResponse & { kpi?: VisitaDiaKpi }

/**
 * @en Factory for visit agenda API (#170).
 * @es Factory de API de agenda de visitas (#170).
 * @pt-BR Factory da API de agenda de visitas (#170).
 */
export function createVisitasAPI(http: AxiosInstance) {
  return {
    list: async (params: {
      fecha: string
      vendedorId?: number
      limit?: number
      offset?: number
    }): Promise<VisitasListResult> => {
      try {
        const response = await http.get<VisitasListResult>('/visitas', { params })
        return response.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    get: async (id: number): Promise<VisitaVendedorRow> => {
      try {
        const response = await http.get<{ success: boolean; data: VisitaVendedorRow }>(`/visitas/${id}`)
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    create: async (body: JsonRecord): Promise<VisitaVendedorRow> => {
      try {
        const response = await http.post<{ success: boolean; data: VisitaVendedorRow }>('/visitas', body)
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    update: async (id: number, body: JsonRecord): Promise<VisitaVendedorRow> => {
      try {
        const response = await http.put<{ success: boolean; data: VisitaVendedorRow }>(
          `/visitas/${id}`,
          body,
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },
  }
}

export const visitasAPI = createVisitasAPI(api)
