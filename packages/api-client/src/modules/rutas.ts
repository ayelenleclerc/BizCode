import type { AxiosError, AxiosInstance } from 'axios'
import type {
  ApiErrorPayload,
  FeriadoRow,
  JsonRecord,
  RutaDiaStats,
  RutaVendedorRow,
  VendedorZonaRow,
} from '@bizcode/types'
import { api } from '../default-client'
import { handleError } from '../errors'

/**
 * @en Factory for holidays / zones / routes API (#267).
 * @es Factory de API de feriados / zonas / rutas (#267).
 * @pt-BR Factory da API de feriados / zonas / rotas (#267).
 */
export function createRutasAPI(http: AxiosInstance) {
  return {
    listFeriados: async (params?: {
      year?: number
      fecha?: string
    }): Promise<{ success: boolean; data: FeriadoRow[]; total: number }> => {
      try {
        const response = await http.get<{ success: boolean; data: FeriadoRow[]; total: number }>(
          '/feriados',
          { params },
        )
        return response.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    createFeriado: async (body: JsonRecord): Promise<FeriadoRow> => {
      try {
        const response = await http.post<{ success: boolean; data: FeriadoRow }>('/feriados', body)
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    listVendedorZonas: async (params?: {
      vendedorId?: number
      limit?: number
      offset?: number
    }): Promise<{ success: boolean; data: VendedorZonaRow[]; total: number }> => {
      try {
        const response = await http.get<{ success: boolean; data: VendedorZonaRow[]; total: number }>(
          '/vendedor-zonas',
          { params },
        )
        return response.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    createVendedorZona: async (body: JsonRecord): Promise<VendedorZonaRow> => {
      try {
        const response = await http.post<{ success: boolean; data: VendedorZonaRow }>(
          '/vendedor-zonas',
          body,
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    deleteVendedorZona: async (id: number): Promise<{ id: number }> => {
      try {
        const response = await http.delete<{ success: boolean; data: { id: number } }>(
          `/vendedor-zonas/${id}`,
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    getRuta: async (params: {
      fecha: string
      vendedorId?: number
    }): Promise<RutaVendedorRow | null> => {
      try {
        const response = await http.get<{ success: boolean; data: RutaVendedorRow | null }>('/rutas', {
          params,
        })
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    createRuta: async (body: JsonRecord): Promise<RutaVendedorRow> => {
      try {
        const response = await http.post<{ success: boolean; data: RutaVendedorRow }>('/rutas', body)
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    replaceParadas: async (rutaId: number, body: JsonRecord): Promise<RutaVendedorRow> => {
      try {
        const response = await http.put<{ success: boolean; data: RutaVendedorRow }>(
          `/rutas/${rutaId}/paradas`,
          body,
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    patchParada: async (
      rutaId: number,
      paradaId: number,
      body: JsonRecord,
    ): Promise<RutaVendedorRow> => {
      try {
        const response = await http.patch<{ success: boolean; data: RutaVendedorRow }>(
          `/rutas/${rutaId}/paradas/${paradaId}`,
          body,
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    getRutaStats: async (rutaId: number): Promise<RutaDiaStats> => {
      try {
        const response = await http.get<{ success: boolean; data: RutaDiaStats }>(
          `/rutas/${rutaId}/stats`,
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },
  }
}

export const rutasAPI = createRutasAPI(api)
export const feriadosAPI = {
  list: rutasAPI.listFeriados,
  create: rutasAPI.createFeriado,
}
export const vendedorZonasAPI = {
  list: rutasAPI.listVendedorZonas,
  create: rutasAPI.createVendedorZona,
  delete: rutasAPI.deleteVendedorZona,
}
