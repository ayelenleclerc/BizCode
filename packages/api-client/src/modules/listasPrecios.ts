import type { AxiosError, AxiosInstance } from 'axios'
import type {
  ApiErrorPayload,
  ListaPrecioBulkUpdateInput,
  ListaPrecioBulkUpdateResult,
  ListaPrecioCreateInput,
  ListaPrecioItemInput,
  ListaPrecioItemRow,
  ListaPrecioListResponse,
  ListaPrecioPatchInput,
  ListaPrecioRow,
  PrecioEfectivoResponse,
} from '@bizcode/types'
import { api } from '../default-client'
import { handleError } from '../errors'

/**
 * @en HTTP client for price-list management endpoints (#234).
 * @es Cliente HTTP para los endpoints de gestión de listas de precios (#234).
 * @pt-BR Cliente HTTP para os endpoints de gestão de listas de preços (#234).
 */
export function createListasPreciosAPI(http: AxiosInstance) {
  return {
    list: async (params?: {
      take?: number
      skip?: number
      activa?: boolean
    }): Promise<ListaPrecioListResponse> => {
      try {
        const response = await http.get<ListaPrecioListResponse>('/listas-precios', { params })
        return response.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    getById: async (id: number): Promise<ListaPrecioRow> => {
      try {
        const response = await http.get<{ success: boolean; data: ListaPrecioRow }>(
          `/listas-precios/${id}`,
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    create: async (body: ListaPrecioCreateInput): Promise<ListaPrecioRow> => {
      try {
        const response = await http.post<{ success: boolean; data: ListaPrecioRow }>(
          '/listas-precios',
          body,
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    update: async (id: number, body: ListaPrecioPatchInput): Promise<ListaPrecioRow> => {
      try {
        const response = await http.patch<{ success: boolean; data: ListaPrecioRow }>(
          `/listas-precios/${id}`,
          body,
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    remove: async (id: number): Promise<void> => {
      try {
        await http.delete(`/listas-precios/${id}`)
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    upsertItem: async (
      listaPrecioId: number,
      body: ListaPrecioItemInput,
    ): Promise<ListaPrecioItemRow> => {
      try {
        const response = await http.post<{ success: boolean; data: ListaPrecioItemRow }>(
          `/listas-precios/${listaPrecioId}/items`,
          body,
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    removeItem: async (listaPrecioId: number, itemId: number): Promise<void> => {
      try {
        await http.delete(`/listas-precios/${listaPrecioId}/items/${itemId}`)
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    bulkUpdate: async (
      listaPrecioId: number,
      body: ListaPrecioBulkUpdateInput,
    ): Promise<ListaPrecioBulkUpdateResult> => {
      try {
        const response = await http.post<ListaPrecioBulkUpdateResult>(
          `/listas-precios/${listaPrecioId}/actualizar-masivo`,
          body,
        )
        return response.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    getPrecioEfectivo: async (params: {
      articuloId: number
      listaPrecioId?: number
      cantidad?: number
    }): Promise<PrecioEfectivoResponse> => {
      try {
        const response = await http.get<PrecioEfectivoResponse>('/listas-precios/precio-efectivo', {
          params,
        })
        return response.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },
  }
}

export const listasPreciosAPI = createListasPreciosAPI(api)
