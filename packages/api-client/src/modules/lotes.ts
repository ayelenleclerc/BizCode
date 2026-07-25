import type { AxiosError, AxiosInstance } from 'axios'
import type {
  ApiErrorPayload,
  ConfigFefoRow,
  ConfigFefoUpsertInput,
  FefoAllocation,
  LoteRow,
  LoteTrazabilidad,
} from '@bizcode/types'
import { api } from '../default-client'
import { handleError } from '../errors'

export type LoteCreateBody = {
  articuloId: number
  depositoId: number
  nroLote: string
  fechaVencimiento: string
  proveedorId?: number | null
  stockInicial?: number
}

export type LoteListParams = {
  articuloId?: number
  depositoId?: number
  soloActivos?: boolean
  porVencer?: boolean
}

export function createLotesAPI(http: AxiosInstance) {
  return {
    getConfig: async (): Promise<ConfigFefoRow> => {
      try {
        const response = await http.get<{ success: boolean; data: ConfigFefoRow }>('/fefo/config')
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    upsertConfig: async (body: ConfigFefoUpsertInput): Promise<ConfigFefoRow> => {
      try {
        const response = await http.put<{ success: boolean; data: ConfigFefoRow }>(
          '/fefo/config',
          body,
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    list: async (params?: LoteListParams): Promise<LoteRow[]> => {
      try {
        const response = await http.get<{ success: boolean; data: LoteRow[] }>('/lotes', { params })
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    listExpiring: async (): Promise<LoteRow[]> => {
      try {
        const response = await http.get<{ success: boolean; data: LoteRow[] }>('/lotes/por-vencer')
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    create: async (body: LoteCreateBody): Promise<LoteRow> => {
      try {
        const response = await http.post<{ success: boolean; data: LoteRow }>('/lotes', body)
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    previewFefo: async (params: {
      articuloId: number
      depositoId: number
      quantity: number
    }): Promise<FefoAllocation[]> => {
      try {
        const response = await http.get<{ success: boolean; data: FefoAllocation[] }>(
          '/lotes/preview-fefo',
          { params },
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    getTrazabilidad: async (articuloId: number, loteId: number): Promise<LoteTrazabilidad> => {
      try {
        const response = await http.get<{ success: boolean; data: LoteTrazabilidad }>(
          `/articulos/${articuloId}/trazabilidad`,
          { params: { loteId } },
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },
  }
}

export const lotesAPI = createLotesAPI(api)
