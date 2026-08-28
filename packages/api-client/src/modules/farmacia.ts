import type { AxiosError, AxiosInstance } from 'axios'
import type {
  ApiErrorPayload,
  LibroPsicotropicoCreateInput,
  LibroPsicotropicoListFilters,
  LibroPsicotropicoMovimientoRow,
  RecetaDispensacionCreateInput,
  RecetaDispensacionListFilters,
  RecetaDispensacionRow,
} from '@bizcode/types'
import { api } from '../default-client'
import { handleError } from '../errors'

export type LoteSerialUpdateBody = {
  serialUnidad?: string | null
  codigoDatamatrix?: string | null
}

export type LoteSerialRow = {
  id: number
  serialUnidad: string | null
  codigoDatamatrix: string | null
}

/**
 * @en Pharmacy vertical client (#204, module `vertical.pharmacy`).
 * @es Cliente del vertical farmacia (#204, módulo `vertical.pharmacy`).
 * @pt-BR Cliente do vertical farmácia (#204, módulo `vertical.pharmacy`).
 */
export function createFarmaciaAPI(http: AxiosInstance) {
  return {
    listRecetas: async (
      params?: RecetaDispensacionListFilters,
    ): Promise<RecetaDispensacionRow[]> => {
      try {
        const response = await http.get<{ success: boolean; data: RecetaDispensacionRow[] }>(
          '/farmacia/recetas',
          { params },
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    getReceta: async (id: number): Promise<RecetaDispensacionRow> => {
      try {
        const response = await http.get<{ success: boolean; data: RecetaDispensacionRow }>(
          `/farmacia/recetas/${id}`,
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    createReceta: async (
      body: RecetaDispensacionCreateInput,
    ): Promise<RecetaDispensacionRow> => {
      try {
        const response = await http.post<{ success: boolean; data: RecetaDispensacionRow }>(
          '/farmacia/recetas',
          body,
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    listLibro: async (
      params?: LibroPsicotropicoListFilters,
    ): Promise<LibroPsicotropicoMovimientoRow[]> => {
      try {
        const response = await http.get<{
          success: boolean
          data: LibroPsicotropicoMovimientoRow[]
        }>('/farmacia/libro-psicotropicos', { params })
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    createLibroMovimiento: async (
      body: LibroPsicotropicoCreateInput,
    ): Promise<LibroPsicotropicoMovimientoRow> => {
      try {
        const response = await http.post<{
          success: boolean
          data: LibroPsicotropicoMovimientoRow
        }>('/farmacia/libro-psicotropicos', body)
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    /**
     * @en Downloads the internal book CSV; not the official SEDRONAR filing format (#204).
     * @es Descarga el CSV del libro interno; no es el formato oficial de SEDRONAR (#204).
     * @pt-BR Baixa o CSV do livro interno; não é o formato oficial do SEDRONAR (#204).
     */
    exportLibroCsv: async (params?: LibroPsicotropicoListFilters): Promise<string> => {
      try {
        const response = await http.get<string>('/farmacia/libro-psicotropicos/export', {
          params,
          responseType: 'text',
        })
        return response.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    setLoteSerial: async (id: number, body: LoteSerialUpdateBody): Promise<LoteSerialRow> => {
      try {
        const response = await http.put<{ success: boolean; data: LoteSerialRow }>(
          `/farmacia/lotes/${id}/serial`,
          body,
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },
  }
}

export const farmaciaAPI = createFarmaciaAPI(api)
