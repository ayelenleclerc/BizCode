import type { AxiosError, AxiosInstance } from 'axios'
import type {
  ApiErrorPayload,
  JsonRecord,
  OrdenTrabajoListResponse,
  OrdenTrabajoRow,
} from '@bizcode/types'
import { api } from '../default-client'
import { handleError } from '../errors'

export type OrdenTrabajoFacturarResult = {
  orden: OrdenTrabajoRow
  facturaId: number
}

export function createOrdenesTrabajoAPI(http: AxiosInstance) {
  return {
    list: async (params?: { estado?: string }): Promise<OrdenTrabajoListResponse> => {
      try {
        const response = await http.get<OrdenTrabajoListResponse>('/ordenes-trabajo', { params })
        return response.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    get: async (id: number): Promise<OrdenTrabajoRow> => {
      try {
        const response = await http.get<{ success: boolean; data: OrdenTrabajoRow }>(
          `/ordenes-trabajo/${id}`,
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    create: async (body: JsonRecord): Promise<OrdenTrabajoRow> => {
      try {
        const response = await http.post<{ success: boolean; data: OrdenTrabajoRow }>(
          '/ordenes-trabajo',
          body,
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    update: async (id: number, body: JsonRecord): Promise<OrdenTrabajoRow> => {
      try {
        const response = await http.put<{ success: boolean; data: OrdenTrabajoRow }>(
          `/ordenes-trabajo/${id}`,
          body,
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    transition: async (id: number, body: JsonRecord): Promise<OrdenTrabajoRow> => {
      try {
        const response = await http.post<{ success: boolean; data: OrdenTrabajoRow }>(
          `/ordenes-trabajo/${id}/transicion`,
          body,
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    facturar: async (id: number, body?: JsonRecord): Promise<OrdenTrabajoFacturarResult> => {
      try {
        const response = await http.post<{ success: boolean; data: OrdenTrabajoFacturarResult }>(
          `/ordenes-trabajo/${id}/facturar`,
          body ?? {},
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },
  }
}

export const ordenesTrabajoAPI = createOrdenesTrabajoAPI(api)
