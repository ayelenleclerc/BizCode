import type { AxiosError, AxiosInstance } from 'axios'
import type {
  ApiErrorPayload,
  BulkImportValidateSummary,
  ImportDuplicateMode,
  ImportEntity,
  ImportJobRow,
  ImportModo,
} from '@bizcode/types'
import { api } from '../default-client'
import { handleError } from '../errors'

/**
 * @en HTTP client for unified bulk import jobs (#238).
 * @es Cliente HTTP para trabajos de importación masiva unificada (#238).
 * @pt-BR Cliente HTTP para trabalhos de importação em massa unificada (#238).
 */
export function createImportacionesAPI(http: AxiosInstance) {
  return {
    downloadTemplate: async (entity: ImportEntity, format: 'csv' | 'xlsx' = 'csv'): Promise<Blob> => {
      try {
        const response = await http.get(`/importaciones/templates/${entity}`, {
          params: { format },
          responseType: 'blob',
        })
        return response.data as Blob
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    validate: async (params: {
      entity: ImportEntity
      file: File
      duplicateMode?: ImportDuplicateMode
    }): Promise<BulkImportValidateSummary> => {
      try {
        const body = new FormData()
        body.append('file', params.file)
        body.append('entity', params.entity)
        body.append('duplicateMode', params.duplicateMode ?? 'skip')
        const response = await http.post<{ success: boolean; data: BulkImportValidateSummary }>(
          '/importaciones/validate',
          body,
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    startJob: async (params: {
      entity: ImportEntity
      file: File
      modo?: ImportModo
      duplicateMode?: ImportDuplicateMode
    }): Promise<ImportJobRow> => {
      try {
        const body = new FormData()
        body.append('file', params.file)
        body.append('entity', params.entity)
        body.append('modo', params.modo ?? 'mejores_esfuerzos')
        body.append('duplicateMode', params.duplicateMode ?? 'skip')
        const response = await http.post<{ success: boolean; data: ImportJobRow }>(
          '/importaciones/jobs',
          body,
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    getJob: async (id: number): Promise<ImportJobRow> => {
      try {
        const response = await http.get<{ success: boolean; data: ImportJobRow }>(
          `/importaciones/jobs/${id}`,
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    downloadReport: async (id: number): Promise<Blob> => {
      try {
        const response = await http.get(`/importaciones/jobs/${id}/report`, {
          responseType: 'blob',
        })
        return response.data as Blob
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },
  }
}

export const importacionesAPI = createImportacionesAPI(api)
