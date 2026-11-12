import type { AxiosError, AxiosInstance } from 'axios'
import type {
  ApiErrorPayload,
  ConfigAnomaliaFacturaRow,
  ConfigAnomaliaFacturaUpsertInput,
} from '@bizcode/types'
import { api } from '../default-client'
import { handleError } from '../errors'

/**
 * @en Billing anomaly threshold config client (#200 residual).
 * @es Cliente de umbrales de anomalía de facturación (#200 residual).
 * @pt-BR Cliente de limiares de anomalia de faturamento (#200 residual).
 */
export function createAnomaliasAPI(http: AxiosInstance) {
  return {
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
