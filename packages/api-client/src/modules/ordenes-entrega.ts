import type { AxiosError, AxiosInstance } from 'axios'
import type {
  ApiErrorPayload,
  OrdenEntrega,
  OrdenEntregaEstado,
  OrdenEntregaListParams,
} from '@bizcode/types'
import { api } from '../default-client'
import { handleError } from '../errors'

export function createOrdenesEntregaAPI(http: AxiosInstance) {
  return {
    list: async (params?: OrdenEntregaListParams) => {
      try {
        const response = await http.get('/ordenes-entrega', { params })
        return response.data as {
          success: true
          data: OrdenEntrega[]
          total: number
          limit: number
          offset: number
        }
      } catch (error) {
        handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    create: async (body: {
      clienteId: number
      fecha: string
      facturaId?: number | null
      zonaId?: number | null
      driverId?: number | null
      nota?: string | null
    }) => {
      try {
        const response = await http.post('/ordenes-entrega', body)
        return response.data.data as OrdenEntrega
      } catch (error) {
        handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    update: async (
      id: number,
      body: {
        estado: OrdenEntregaEstado
        driverId?: number | null
        zonaId?: number | null
        nota?: string | null
      },
    ) => {
      try {
        const response = await http.put(`/ordenes-entrega/${id}`, body)
        return response.data.data as OrdenEntrega
      } catch (error) {
        handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    iniciarPicking: async (id: number) => {
      try {
        const response = await http.post(`/ordenes-entrega/${id}/iniciar-picking`)
        return response.data.data as OrdenEntrega
      } catch (error) {
        handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    marcarLista: async (id: number) => {
      try {
        const response = await http.post(`/ordenes-entrega/${id}/lista`)
        return response.data.data as OrdenEntrega
      } catch (error) {
        handleError(error as AxiosError<ApiErrorPayload>)
      }
    },
  }
}

export const ordenesEntregaAPI = createOrdenesEntregaAPI(api)
