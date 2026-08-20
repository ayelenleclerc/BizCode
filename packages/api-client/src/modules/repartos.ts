import type { AxiosError, AxiosInstance } from 'axios'
import type {
  ApiErrorPayload,
  DevolucionEntregaPublic,
  DevolucionEntregaRegisterInput,
  DevolucionEntregaRemitSummary,
  Reparto,
  RepartoActivo,
  RepartoCloseSummary,
  RepartoEstado,
  RepartoItemPodDetail,
  RepartoItemPodInput,
  RepartoItemRow,
  RepartoUbicacionPoint,
} from '@bizcode/types'
import { api } from '../default-client'
import { handleError } from '../errors'

export function createRepartosAPI(http: AxiosInstance) {
  return {
    list: async (params?: {
      fecha?: string
      choferId?: number
      estado?: RepartoEstado
      limit?: number
      offset?: number
    }) => {
      try {
        const response = await http.get('/repartos', { params })
        return response.data as {
          success: true
          data: Reparto[]
          total: number
          limit: number
          offset: number
        }
      } catch (error) {
        handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    get: async (id: number) => {
      try {
        const response = await http.get(`/repartos/${id}`)
        return response.data.data as Reparto
      } catch (error) {
        handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    getMiReparto: async (params?: { fecha?: string }) => {
      try {
        const response = await http.get('/repartos/mi-reparto', { params })
        return response.data.data as Reparto
      } catch (error) {
        handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    create: async (body: {
      fecha: string
      choferId: number
      vehiculo?: string | null
      observaciones?: string | null
      ordenEntregaIds: number[]
    }) => {
      try {
        const response = await http.post('/repartos', body)
        return response.data.data as Reparto
      } catch (error) {
        handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    iniciar: async (id: number) => {
      try {
        const response = await http.post(`/repartos/${id}/iniciar`)
        return response.data.data as Reparto
      } catch (error) {
        handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    cerrar: async (id: number) => {
      try {
        const response = await http.post(`/repartos/${id}/cerrar`)
        return {
          reparto: response.data.data as Reparto,
          summary: response.data.summary as RepartoCloseSummary,
        }
      } catch (error) {
        handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    addItems: async (repartoId: number, body: { ordenEntregaIds: number[] }) => {
      try {
        const response = await http.post(`/repartos/${repartoId}/items`, body)
        return response.data.data as Reparto
      } catch (error) {
        handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    removeItem: async (repartoId: number, itemId: number) => {
      try {
        const response = await http.delete(`/repartos/${repartoId}/items/${itemId}`)
        return response.data.data as Reparto
      } catch (error) {
        handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    updateItemPod: async (repartoId: number, itemId: number, body: RepartoItemPodInput) => {
      try {
        const response = await http.put(`/repartos/${repartoId}/items/${itemId}`, body)
        return response.data.data as RepartoItemRow
      } catch (error) {
        handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    getItemPod: async (repartoId: number, itemId: number) => {
      try {
        const response = await http.get(`/repartos/${repartoId}/items/${itemId}/pod`)
        return response.data.data as RepartoItemPodDetail
      } catch (error) {
        handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    recordUbicacion: async (repartoId: number, body: { lat: number; lng: number }) => {
      try {
        const response = await http.post(`/repartos/${repartoId}/ubicacion`, body)
        return response.data.data as RepartoUbicacionPoint
      } catch (error) {
        handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    registerDevolucion: async (
      repartoId: number,
      itemId: number,
      body: DevolucionEntregaRegisterInput,
    ) => {
      try {
        const response = await http.post(`/repartos/${repartoId}/items/${itemId}/devolucion`, body)
        return response.data.data as DevolucionEntregaPublic
      } catch (error) {
        handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    listDevoluciones: async (repartoId: number) => {
      try {
        const response = await http.get(`/repartos/${repartoId}/devoluciones`)
        return response.data.data as DevolucionEntregaPublic[]
      } catch (error) {
        handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    remitDevoluciones: async (repartoId: number) => {
      try {
        const response = await http.post(`/repartos/${repartoId}/devoluciones/rendir`)
        return {
          devoluciones: response.data.data as DevolucionEntregaPublic[],
          summary: response.data.summary as DevolucionEntregaRemitSummary,
        }
      } catch (error) {
        handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    getUltimaUbicacion: async (repartoId: number) => {
      try {
        const response = await http.get(`/repartos/${repartoId}/ubicacion/ultima`)
        return response.data.data as RepartoUbicacionPoint | null
      } catch (error) {
        handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    listActivos: async () => {
      try {
        const response = await http.get('/repartos/activos')
        return response.data.data as RepartoActivo[]
      } catch (error) {
        handleError(error as AxiosError<ApiErrorPayload>)
      }
    },
  }
}

export const repartosAPI = createRepartosAPI(api)
