import type { AxiosError, AxiosInstance } from 'axios'
import type { ApiErrorPayload, JsonRecord } from '@bizcode/types'
import { api } from '../default-client'
import { handleError } from '../errors'

export type ClienteImportRowError = { row: number; message: string }

export type ClienteImportResult = {
  created: number
  skipped: number
  errors: ClienteImportRowError[]
}

/** Same shape as customer CSV import summary (reused for rubros, artículos, proveedores). */
export type CsvBulkImportResult = ClienteImportResult

export function createClientesAPI(http: AxiosInstance) {
  return {
    list: async (filtro?: string) => {
      try {
        const response = await http.get('/clientes', { params: { q: filtro } })
        return response.data.data
      } catch (error) {
        handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    get: async (id: number) => {
      try {
        const response = await http.get(`/clientes/${id}`)
        return response.data.data
      } catch (error) {
        handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    create: async (data: JsonRecord) => {
      try {
        const response = await http.post('/clientes', data)
        return response.data.data
      } catch (error) {
        handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    update: async (id: number, data: JsonRecord) => {
      try {
        const response = await http.put(`/clientes/${id}`, data)
        return response.data.data
      } catch (error) {
        handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    downloadImportTemplate: async (): Promise<Blob> => {
      try {
        const response = await http.get<Blob>('/clientes/import/template', { responseType: 'blob' })
        return response.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    importFromCsv: async (file: File): Promise<ClienteImportResult> => {
      try {
        const body = new FormData()
        body.append('file', file)
        const response = await http.post<{ success: boolean; data: ClienteImportResult }>(
          '/clientes/import',
          body,
          { timeout: 120000 },
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    cuentaCorriente: async (
      id: number,
      params?: { tipo?: string; desde?: string; hasta?: string; limit?: number; offset?: number },
    ) => {
      try {
        const response = await http.get(`/clientes/${id}/cuenta-corriente`, { params })
        return response.data.data as import('@bizcode/types').ClienteCuentaCorriente
      } catch (error) {
        handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    cuentaCorrienteSaldo: async (id: number) => {
      try {
        const response = await http.get(`/clientes/${id}/cuenta-corriente/saldo`)
        return response.data.data as import('@bizcode/types').ClienteCuentaCorrienteSaldo
      } catch (error) {
        handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    cuentaCorrienteAntiguedad: async (id: number) => {
      try {
        const response = await http.get(`/clientes/${id}/cuenta-corriente/antiguedad`)
        return response.data.data as import('@bizcode/types').ClienteCuentaCorrienteAntiguedad
      } catch (error) {
        handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    cuentaCorrienteAjuste: async (id: number, body: { monto: number; motivo: string }) => {
      try {
        const response = await http.post(`/clientes/${id}/cuenta-corriente/ajuste`, body)
        return response.data.data as import('@bizcode/types').MovimientoClienteCC
      } catch (error) {
        handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    cuentaCorrienteEnviar: async (
      id: number,
      body: { email?: string; desde?: string; hasta?: string },
    ) => {
      try {
        const response = await http.post(`/clientes/${id}/cuenta-corriente/estado-de-cuenta/enviar`, body)
        return response.data.data as { sent: boolean; email: string }
      } catch (error) {
        handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    facturasPendientes: async (id: number) => {
      try {
        const response = await http.get(`/clientes/${id}/facturas-pendientes`)
        return response.data.data as import('@bizcode/types').FacturaPendienteCliente[]
      } catch (error) {
        handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    listRecibos: async (id: number, params?: { limit?: number; offset?: number }) => {
      try {
        const response = await http.get(`/clientes/${id}/recibos`, { params })
        return response.data
      } catch (error) {
        handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    createRecibo: async (
      id: number,
      body: {
        fecha: string
        totalCobrado: number
        concepto?: string | null
        fifo?: boolean
        formas: {
          tipo: string
          importe: number
          chequeId?: number | null
          referencia?: string | null
          banco?: string | null
        }[]
        imputaciones?: { facturaId: number; importe: number }[]
        retenciones?: {
          regimenId: number
          baseImponible: number
          alicuota: number
          importe: number
        }[]
      },
    ) => {
      try {
        const response = await http.post(`/clientes/${id}/recibos`, body)
        return response.data.data as import('@bizcode/types').ReciboCobro
      } catch (error) {
        handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    anularRecibo: async (clienteId: number, reciboId: number, anulacionMotivo: string) => {
      try {
        const response = await http.post(`/clientes/${clienteId}/recibos/${reciboId}/anular`, {
          anulacionMotivo,
        })
        return response.data.data as import('@bizcode/types').ReciboCobro
      } catch (error) {
        handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    downloadReciboPdf: async (clienteId: number, reciboId: number): Promise<Blob> => {
      try {
        const response = await http.get<Blob>(`/clientes/${clienteId}/recibos/${reciboId}/pdf`, {
          responseType: 'blob',
        })
        return response.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    /** @en Export customer personal-data package (#195). JSON object or CSV blob. */
    exportarDatos: async (
      id: number,
      format: 'json' | 'csv' = 'json',
    ): Promise<JsonRecord | Blob> => {
      try {
        if (format === 'csv') {
          const response = await http.get<Blob>(`/clientes/${id}/exportar-datos`, {
            params: { format: 'csv' },
            responseType: 'blob',
          })
          return response.data
        }
        const response = await http.get(`/clientes/${id}/exportar-datos`)
        return response.data.data as JsonRecord
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    /** @en Irreversibly anonymize customer PII; confirm must be ANONYMIZE (#195). */
    anonimizar: async (id: number, confirm: string = 'ANONYMIZE') => {
      try {
        const response = await http.post(`/clientes/${id}/anonimizar`, { confirm })
        return response.data.data
      } catch (error) {
        handleError(error as AxiosError<ApiErrorPayload>)
      }
    },
  }
}

export const clientesAPI = createClientesAPI(api)
