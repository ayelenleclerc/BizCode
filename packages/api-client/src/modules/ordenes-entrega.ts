import type { AxiosError, AxiosInstance } from 'axios'
import type {
  ApiErrorPayload,
  OrdenEntrega,
  OrdenEntregaEstado,
  OrdenEntregaListParams,
  OrdenEntregaTrackingAssignInput,
  OrdenEntregaTrackingView,
  ShippingCarrierConfigPublic,
  ShippingCarrierConfigUpsertInput,
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

    getById: async (id: number) => {
      try {
        const response = await http.get(`/ordenes-entrega/${id}`)
        return response.data.data as OrdenEntrega
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

    assignTracking: async (id: number, body: OrdenEntregaTrackingAssignInput) => {
      try {
        const response = await http.post(`/ordenes-entrega/${id}/tracking`, body)
        return response.data.data as OrdenEntregaTrackingView
      } catch (error) {
        handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    getTracking: async (id: number, params?: { refresh?: boolean }) => {
      try {
        const response = await http.get(`/ordenes-entrega/${id}/tracking`, {
          params: params?.refresh ? { refresh: '1' } : undefined,
        })
        return response.data.data as OrdenEntregaTrackingView
      } catch (error) {
        handleError(error as AxiosError<ApiErrorPayload>)
      }
    },
  }
}

export function createShippingCarriersAPI(http: AxiosInstance) {
  return {
    getConfig: async (carrier: 'andreani' | 'correo_argentino') => {
      try {
        const response = await http.get(`/shipping-carriers/${carrier}/config`)
        return response.data.data as ShippingCarrierConfigPublic
      } catch (error) {
        handleError(error as AxiosError<ApiErrorPayload>)
      }
    },
    upsertConfig: async (
      carrier: 'andreani' | 'correo_argentino',
      body: ShippingCarrierConfigUpsertInput,
    ) => {
      try {
        const response = await http.put(`/shipping-carriers/${carrier}/config`, body)
        return response.data.data as ShippingCarrierConfigPublic
      } catch (error) {
        handleError(error as AxiosError<ApiErrorPayload>)
      }
    },
  }
}

export const ordenesEntregaAPI = createOrdenesEntregaAPI(api)
export const shippingCarriersAPI = createShippingCarriersAPI(api)
