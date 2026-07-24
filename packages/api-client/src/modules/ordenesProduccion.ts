import type { AxiosError, AxiosInstance } from 'axios'
import type {
  ApiErrorPayload,
  OrdenProduccionCompletarInput,
  OrdenProduccionCreateInput,
  OrdenProduccionDisponibilidad,
  OrdenProduccionEstado,
  OrdenProduccionListResponse,
  OrdenProduccionRow,
  OrdenProduccionSugerirCompraResult,
} from '@bizcode/types'
import { api } from '../default-client'
import { handleError } from '../errors'

type OrdenListWireResponse = {
  success: boolean
  data: OrdenProduccionRow[]
  total: number
  limit: number
  offset: number
}

/**
 * @en HTTP client for production orders (#249).
 * @es Cliente HTTP para órdenes de producción (#249).
 * @pt-BR Cliente HTTP para ordens de produção (#249).
 */
export function createOrdenesProduccionAPI(http: AxiosInstance) {
  return {
    list: async (params?: {
      limit?: number
      offset?: number
      estado?: OrdenProduccionEstado
      articuloId?: number
      desde?: string
      hasta?: string
    }): Promise<OrdenProduccionListResponse> => {
      try {
        const response = await http.get<OrdenListWireResponse>('/ordenes-produccion', { params })
        return {
          success: response.data.success,
          data: response.data.data,
          total: response.data.total,
          take: response.data.limit,
          skip: response.data.offset,
        }
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    getById: async (id: number): Promise<OrdenProduccionRow> => {
      try {
        const response = await http.get<{ success: boolean; data: OrdenProduccionRow }>(
          `/ordenes-produccion/${id}`,
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    getDisponibilidad: async (id: number): Promise<OrdenProduccionDisponibilidad> => {
      try {
        const response = await http.get<{ success: boolean; data: OrdenProduccionDisponibilidad }>(
          `/ordenes-produccion/${id}/disponibilidad`,
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    create: async (body: OrdenProduccionCreateInput): Promise<OrdenProduccionRow> => {
      try {
        const response = await http.post<{ success: boolean; data: OrdenProduccionRow }>(
          '/ordenes-produccion',
          body,
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    iniciar: async (id: number): Promise<OrdenProduccionRow> => {
      try {
        const response = await http.post<{ success: boolean; data: OrdenProduccionRow }>(
          `/ordenes-produccion/${id}/iniciar`,
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    completar: async (
      id: number,
      body: OrdenProduccionCompletarInput,
    ): Promise<OrdenProduccionRow> => {
      try {
        const response = await http.post<{ success: boolean; data: OrdenProduccionRow }>(
          `/ordenes-produccion/${id}/completar`,
          body,
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    cancelar: async (id: number): Promise<OrdenProduccionRow> => {
      try {
        const response = await http.post<{ success: boolean; data: OrdenProduccionRow }>(
          `/ordenes-produccion/${id}/cancelar`,
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    sugerirCompra: async (
      id: number,
      proveedorId: number,
    ): Promise<OrdenProduccionSugerirCompraResult> => {
      try {
        const response = await http.post<{
          success: boolean
          data: OrdenProduccionSugerirCompraResult
        }>(`/ordenes-produccion/${id}/sugerir-compra`, { proveedorId })
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },
  }
}

export const ordenesProduccionAPI = createOrdenesProduccionAPI(api)
