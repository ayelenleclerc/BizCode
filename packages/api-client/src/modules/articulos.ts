import type { AxiosError, AxiosInstance } from 'axios'
import type { ApiErrorPayload, Articulo } from '@bizcode/types'
import { api } from '../default-client'
import { handleError } from '../errors'

export type ArticuloListItem = Articulo & {
  rubro?: { id: number; codigo: number; nombre: string } | null
}

/**
 * @en Factory for artículo catalog reads (web cookie client or seller Bearer HTTP).
 * @es Factory para lecturas de catálogo de artículos (cookie web o Bearer seller).
 * @pt-BR Factory para leituras do catálogo de artigos (cookie web ou Bearer seller).
 */
export function createArticulosAPI(http: AxiosInstance) {
  return {
    list: async (filtro?: string, params?: { limit?: number; offset?: number }): Promise<ArticuloListItem[]> => {
      try {
        const response = await http.get<{ success: boolean; data: ArticuloListItem[] }>('/articulos', {
          params: { q: filtro, ...params },
        })
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    get: async (id: number): Promise<ArticuloListItem> => {
      try {
        const response = await http.get<{ success: boolean; data: ArticuloListItem }>(`/articulos/${id}`)
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },
  }
}

export const articulosCatalogAPI = createArticulosAPI(api)
