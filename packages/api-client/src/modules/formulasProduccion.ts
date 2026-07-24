import type { AxiosError, AxiosInstance } from 'axios'
import type {
  ApiErrorPayload,
  FormulaCostoResult,
  FormulaProduccionCreateInput,
  FormulaProduccionListResponse,
  FormulaProduccionRow,
  FormulaProduccionUpdateInput,
  FormulaProyeccionResult,
} from '@bizcode/types'
import { api } from '../default-client'
import { handleError } from '../errors'

type FormulaListWireResponse = {
  success: boolean
  data: FormulaProduccionRow[]
  total: number
  limit: number
  offset: number
}

/**
 * @en HTTP client for production BOM formulas (#248).
 * @es Cliente HTTP para fórmulas BOM de producción (#248).
 * @pt-BR Cliente HTTP para fórmulas BOM de produção (#248).
 */
export function createFormulasProduccionAPI(http: AxiosInstance) {
  return {
    list: async (params?: {
      limit?: number
      offset?: number
      articuloId?: number
      activa?: boolean
    }): Promise<FormulaProduccionListResponse> => {
      try {
        const response = await http.get<FormulaListWireResponse>('/formulas-produccion', {
          params,
        })
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

    getById: async (id: number): Promise<FormulaProduccionRow> => {
      try {
        const response = await http.get<{ success: boolean; data: FormulaProduccionRow }>(
          `/formulas-produccion/${id}`,
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    create: async (body: FormulaProduccionCreateInput): Promise<FormulaProduccionRow> => {
      try {
        const response = await http.post<{ success: boolean; data: FormulaProduccionRow }>(
          '/formulas-produccion',
          body,
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    update: async (
      id: number,
      body: FormulaProduccionUpdateInput,
    ): Promise<FormulaProduccionRow> => {
      try {
        const response = await http.put<{ success: boolean; data: FormulaProduccionRow }>(
          `/formulas-produccion/${id}`,
          body,
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    deactivate: async (id: number): Promise<FormulaProduccionRow> => {
      try {
        const response = await http.post<{ success: boolean; data: FormulaProduccionRow }>(
          `/formulas-produccion/${id}/desactivar`,
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    getCosto: async (id: number): Promise<FormulaCostoResult> => {
      try {
        const response = await http.get<{ success: boolean; data: FormulaCostoResult }>(
          `/formulas-produccion/${id}/costo`,
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    proyectar: async (id: number, unidades: number): Promise<FormulaProyeccionResult> => {
      try {
        const response = await http.post<{ success: boolean; data: FormulaProyeccionResult }>(
          `/formulas-produccion/${id}/proyeccion`,
          { unidades },
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },
  }
}

export const formulasProduccionAPI = createFormulasProduccionAPI(api)
