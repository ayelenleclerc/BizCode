import type { AxiosError, AxiosInstance } from 'axios'
import type { ApiErrorPayload, Rubro } from '@bizcode/types'
import { api } from '../default-client'
import { handleError } from '../errors'

/**
 * @en Factory for rubro list reads (web cookie client or seller Bearer HTTP).
 * @es Factory para listado de rubros (cookie web o Bearer seller).
 * @pt-BR Factory para listagem de rubros (cookie web ou Bearer seller).
 */
export function createRubrosAPI(http: AxiosInstance) {
  return {
    list: async (params?: { limit?: number; offset?: number }): Promise<Rubro[]> => {
      try {
        const response = await http.get<{ success: boolean; data: Rubro[] }>('/rubros', { params })
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },
  }
}

export const rubrosCatalogAPI = createRubrosAPI(api)
