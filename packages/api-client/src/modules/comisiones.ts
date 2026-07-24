import type { AxiosError, AxiosInstance } from 'axios'
import type {
  ApiErrorPayload,
  ComisionRankingRow,
  ComisionesSettingsRow,
  ConfigComisionCreateInput,
  ConfigComisionListResponse,
  ConfigComisionPatchInput,
  ConfigComisionRow,
  LiquidacionComisionListResponse,
  LiquidacionComisionRow,
  LiquidacionGenerarInput,
  MisComisionesResponse,
} from '@bizcode/types'
import { api } from '../default-client'
import { handleError } from '../errors'

/**
 * @en HTTP client for seller commissions (#237).
 * @es Cliente HTTP para comisiones de vendedores (#237).
 * @pt-BR Cliente HTTP para comissões de vendedores (#237).
 */
export function createComisionesAPI(http: AxiosInstance) {
  return {
    getSettings: async (): Promise<ComisionesSettingsRow> => {
      try {
        const response = await http.get<{ success: boolean; data: ComisionesSettingsRow }>(
          '/comisiones/settings',
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    updateSettings: async (body: ComisionesSettingsRow): Promise<ComisionesSettingsRow> => {
      try {
        const response = await http.patch<{ success: boolean; data: ComisionesSettingsRow }>(
          '/comisiones/settings',
          body,
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    listConfigs: async (params?: {
      take?: number
      skip?: number
      vendedorId?: number
    }): Promise<ConfigComisionListResponse> => {
      try {
        const response = await http.get<ConfigComisionListResponse>('/comisiones/configs', {
          params,
        })
        return response.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    createConfig: async (body: ConfigComisionCreateInput): Promise<ConfigComisionRow> => {
      try {
        const response = await http.post<{ success: boolean; data: ConfigComisionRow }>(
          '/comisiones/configs',
          body,
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    updateConfig: async (id: number, body: ConfigComisionPatchInput): Promise<ConfigComisionRow> => {
      try {
        const response = await http.patch<{ success: boolean; data: ConfigComisionRow }>(
          `/comisiones/configs/${id}`,
          body,
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    removeConfig: async (id: number): Promise<void> => {
      try {
        await http.delete(`/comisiones/configs/${id}`)
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    listLiquidaciones: async (params?: {
      take?: number
      skip?: number
      periodo?: string
      estado?: string
      vendedorId?: number
    }): Promise<LiquidacionComisionListResponse> => {
      try {
        const response = await http.get<LiquidacionComisionListResponse>(
          '/comisiones/liquidaciones',
          { params },
        )
        return response.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    getLiquidacion: async (id: number): Promise<LiquidacionComisionRow> => {
      try {
        const response = await http.get<{ success: boolean; data: LiquidacionComisionRow }>(
          `/comisiones/liquidaciones/${id}`,
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    generarLiquidaciones: async (
      body: LiquidacionGenerarInput,
    ): Promise<{ created: LiquidacionComisionRow[]; skipped: number }> => {
      try {
        const response = await http.post<{
          success: boolean
          data: { created: LiquidacionComisionRow[]; skipped: number }
        }>('/comisiones/liquidaciones/generar', body)
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    aprobarLiquidacion: async (id: number): Promise<LiquidacionComisionRow> => {
      try {
        const response = await http.post<{ success: boolean; data: LiquidacionComisionRow }>(
          `/comisiones/liquidaciones/${id}/aprobar`,
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    pagarLiquidacion: async (id: number): Promise<LiquidacionComisionRow> => {
      try {
        const response = await http.post<{ success: boolean; data: LiquidacionComisionRow }>(
          `/comisiones/liquidaciones/${id}/pagar`,
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    ranking: async (periodo: string): Promise<ComisionRankingRow[]> => {
      try {
        const response = await http.get<{ success: boolean; data: ComisionRankingRow[] }>(
          '/comisiones/ranking',
          { params: { periodo } },
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    misComisiones: async (periodo?: string): Promise<MisComisionesResponse> => {
      try {
        const response = await http.get<MisComisionesResponse>('/comisiones/mias', {
          params: periodo ? { periodo } : undefined,
        })
        return response.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },
  }
}

export const comisionesAPI = createComisionesAPI(api)
