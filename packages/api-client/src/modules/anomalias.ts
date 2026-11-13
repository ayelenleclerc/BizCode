import type { AxiosError, AxiosInstance } from 'axios'
import type {
  AnomaliaDetectadaListFilters,
  AnomaliaDetectadaRow,
  ApiErrorPayload,
  ConfigAnomaliaFacturaRow,
  ConfigAnomaliaFacturaUpsertInput,
} from '@bizcode/types'
import { api } from '../default-client'
import { handleError } from '../errors'

export type AnomaliaDetectadaListResult = {
  data: AnomaliaDetectadaRow[]
  total: number
  limit: number
  offset: number
}

/**
 * @en Billing anomaly config + list client (#200).
 * @es Cliente de config + listado de anomalías de facturación (#200).
 * @pt-BR Cliente de config + listagem de anomalias de faturamento (#200).
 */
export function createAnomaliasAPI(http: AxiosInstance) {
  return {
    list: async (params?: AnomaliaDetectadaListFilters): Promise<AnomaliaDetectadaListResult> => {
      try {
        const response = await http.get<{
          success: boolean
          data: AnomaliaDetectadaRow[]
          total: number
          limit: number
          offset: number
        }>('/anomalias', { params })
        return {
          data: response.data.data,
          total: response.data.total,
          limit: response.data.limit,
          offset: response.data.offset,
        }
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    getConfig: async (): Promise<ConfigAnomaliaFacturaRow> => {
      try {
        const response = await http.get<{ success: boolean; data: ConfigAnomaliaFacturaRow }>(
          '/anomalias/config',
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    upsertConfig: async (
      body: ConfigAnomaliaFacturaUpsertInput,
    ): Promise<ConfigAnomaliaFacturaRow> => {
      try {
        const response = await http.put<{ success: boolean; data: ConfigAnomaliaFacturaRow }>(
          '/anomalias/config',
          body,
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },
  }
}

export const anomaliasAPI = createAnomaliasAPI(api)
