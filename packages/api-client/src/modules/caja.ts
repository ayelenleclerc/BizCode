import type { AxiosError, AxiosInstance } from 'axios'
import type {
  ApiErrorPayload,
  CajaListResponse,
  CajaRow,
  JsonRecord,
  TurnoCajaListResponse,
  TurnoCajaRow,
} from '@bizcode/types'
import { api } from '../default-client'
import { handleError } from '../errors'

export function createCajaAPI(http: AxiosInstance) {
  return {
    listCajas: async (): Promise<CajaRow[]> => {
      try {
        const response = await http.get<CajaListResponse>('/cajas')
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    createCaja: async (body: { nombre: string }): Promise<CajaRow> => {
      try {
        const response = await http.post<{ success: boolean; data: CajaRow }>('/cajas', body)
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    listTurnos: async (params?: {
      estado?: string
      cajaId?: number
    }): Promise<TurnoCajaListResponse> => {
      try {
        const response = await http.get<TurnoCajaListResponse>('/turnos-caja', { params })
        return response.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    getTurno: async (id: number): Promise<TurnoCajaRow> => {
      try {
        const response = await http.get<{ success: boolean; data: TurnoCajaRow }>(
          `/turnos-caja/${id}`,
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    open: async (body: JsonRecord): Promise<TurnoCajaRow> => {
      try {
        const response = await http.post<{ success: boolean; data: TurnoCajaRow }>(
          '/turnos-caja',
          body,
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    addMovimiento: async (id: number, body: JsonRecord): Promise<TurnoCajaRow> => {
      try {
        const response = await http.post<{ success: boolean; data: TurnoCajaRow }>(
          `/turnos-caja/${id}/movimientos`,
          body,
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    close: async (id: number, body: JsonRecord): Promise<TurnoCajaRow> => {
      try {
        const response = await http.post<{ success: boolean; data: TurnoCajaRow }>(
          `/turnos-caja/${id}/cerrar`,
          body,
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    pdfUrl: (id: number): string => `/turnos-caja/${id}/pdf`,
  }
}

export const cajaAPI = createCajaAPI(api)
