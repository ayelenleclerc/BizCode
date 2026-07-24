import type { AxiosError, AxiosInstance } from 'axios'
import type {
  ApiErrorPayload,
  ClientePuntosDetail,
  ConfigFidelizacionRow,
  ConfigFidelizacionUpsertInput,
  FidelizacionAjusteInput,
  FidelizacionDashboard,
} from '@bizcode/types'
import { api } from '../default-client'
import { handleError } from '../errors'

export function createFidelizacionAPI(http: AxiosInstance) {
  return {
    getConfig: async (): Promise<ConfigFidelizacionRow> => {
      try {
        const response = await http.get<{ success: boolean; data: ConfigFidelizacionRow }>(
          '/fidelizacion/config',
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    upsertConfig: async (body: ConfigFidelizacionUpsertInput): Promise<ConfigFidelizacionRow> => {
      try {
        const response = await http.put<{ success: boolean; data: ConfigFidelizacionRow }>(
          '/fidelizacion/config',
          body,
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    getDashboard: async (): Promise<FidelizacionDashboard> => {
      try {
        const response = await http.get<{ success: boolean; data: FidelizacionDashboard }>(
          '/fidelizacion/dashboard',
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    getClientePuntos: async (
      clienteId: number,
      params?: { limit?: number; offset?: number },
    ): Promise<ClientePuntosDetail> => {
      try {
        const response = await http.get<{ success: boolean; data: ClientePuntosDetail }>(
          `/fidelizacion/clientes/${clienteId}`,
          { params },
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    ajustar: async (body: FidelizacionAjusteInput): Promise<ClientePuntosDetail> => {
      try {
        const response = await http.post<{ success: boolean; data: ClientePuntosDetail }>(
          '/fidelizacion/ajuste',
          body,
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },
  }
}

export const fidelizacionAPI = createFidelizacionAPI(api)
