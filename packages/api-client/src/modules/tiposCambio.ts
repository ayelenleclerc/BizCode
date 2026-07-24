import type { AxiosError, AxiosInstance } from 'axios'
import type {
  ApiErrorPayload,
  MonedaFx,
  RecalcFxResult,
  TipoCambioListResponse,
  TipoCambioManualInput,
  TipoCambioPreferidoPatch,
  TipoCambioRow,
  TipoCambioTipo,
  TipoCambioVigenteQuery,
} from '@bizcode/types'
import { api } from '../default-client'
import { handleError } from '../errors'

type TipoCambioListWireResponse = {
  success: boolean
  data: TipoCambioRow[]
  total: number
  limit: number
  offset: number
}

type TipoCambioMutationResponse = {
  row: TipoCambioRow
  recalc: RecalcFxResult
}

/**
 * @en HTTP client for exchange rates and multicurrency preferences (#243).
 * @es Cliente HTTP para tipos de cambio y preferencias multimoneda (#243).
 * @pt-BR Cliente HTTP para taxas de câmbio e preferências multimoeda (#243).
 */
export function createTiposCambioAPI(http: AxiosInstance) {
  return {
    list: async (params?: { limit?: number; offset?: number }): Promise<TipoCambioListResponse> => {
      try {
        const response = await http.get<TipoCambioListWireResponse>('/tipos-cambio', { params })
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

    getVigente: async (query: TipoCambioVigenteQuery): Promise<TipoCambioRow> => {
      try {
        const response = await http.get<{ success: boolean; data: TipoCambioRow }>(
          '/tipos-cambio/vigente',
          { params: query },
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    getPreferido: async (): Promise<TipoCambioPreferidoPatch> => {
      try {
        const response = await http.get<{ success: boolean; data: TipoCambioPreferidoPatch }>(
          '/tipos-cambio/preferido',
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    setPreferido: async (tipoCambioPreferido: TipoCambioTipo): Promise<TipoCambioPreferidoPatch> => {
      try {
        const body: TipoCambioPreferidoPatch = { tipoCambioPreferido }
        const response = await http.put<{ success: boolean; data: TipoCambioPreferidoPatch }>(
          '/tipos-cambio/preferido',
          body,
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    createManual: async (body: TipoCambioManualInput): Promise<TipoCambioMutationResponse> => {
      try {
        const response = await http.post<{
          success: boolean
          data: TipoCambioRow
          recalc: RecalcFxResult
        }>('/tipos-cambio/actualizar-manual', body)
        return { row: response.data.data, recalc: response.data.recalc }
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    syncBcra: async (moneda: MonedaFx = 'USD'): Promise<TipoCambioMutationResponse> => {
      try {
        const response = await http.post<{
          success: boolean
          data: TipoCambioRow
          recalc: RecalcFxResult
        }>('/tipos-cambio/sincronizar', { moneda })
        return { row: response.data.data, recalc: response.data.recalc }
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },
  }
}

export const tiposCambioAPI = createTiposCambioAPI(api)
