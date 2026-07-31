import type { AxiosError, AxiosInstance } from 'axios'
import type { ApiErrorPayload } from '@bizcode/types'
import { api } from '../default-client'
import { handleError } from '../errors'

export type CuentaBancariaDTO = {
  id: number
  tenantId: number
  banco: string
  tipoCuenta: string
  cbu: string
  alias: string | null
  moneda: string
  activo: boolean
  createdAt: string
  updatedAt: string
}

export type MovimientoBancarioDTO = {
  id: number
  cuentaId: number
  fecha: string
  descripcion: string
  importe: string
  tipo: string
  saldo: string | null
  referencia: string | null
  formatoOrigen: string
  dedupeKey: string
  conciliadoId: number | null
  conciliadoAt: string | null
  createdAt: string
}

export type BancoCsvMappingDTO = {
  id: number
  tenantId: number
  bancoCode: string
  columnaFecha: string
  columnaDescripcion: string
  columnaImporte: string
  columnaReferencia: string | null
  columnaSaldo: string | null
  separadorDecimal: string
  formatoFecha: string
  delimiter: string
  signoDebitoCredito: string
  createdAt: string
  updatedAt: string
}

export type ImportExtractoResultDTO = {
  imported: number
  skippedDuplicates: number
  errors: Array<{ row: number; message: string }>
  format: string
}

export function createBancosAPI(http: AxiosInstance) {
  return {
    listCuentas: async (): Promise<CuentaBancariaDTO[]> => {
      try {
        const response = await http.get('/bancos/cuentas')
        return response.data.data as CuentaBancariaDTO[]
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    createCuenta: async (body: {
      banco: string
      tipoCuenta: string
      cbu: string
      alias?: string | null
      moneda?: string
      activo?: boolean
    }): Promise<CuentaBancariaDTO> => {
      try {
        const response = await http.post('/bancos/cuentas', body)
        return response.data.data as CuentaBancariaDTO
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    updateCuenta: async (
      id: number,
      body: Partial<{
        banco: string
        tipoCuenta: string
        cbu: string
        alias: string | null
        moneda: string
        activo: boolean
      }>,
    ): Promise<CuentaBancariaDTO> => {
      try {
        const response = await http.patch(`/bancos/cuentas/${id}`, body)
        return response.data.data as CuentaBancariaDTO
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    listMovimientos: async (
      cuentaId: number,
      params?: { from?: string; to?: string; limit?: number; offset?: number },
    ) => {
      try {
        const response = await http.get(`/bancos/cuentas/${cuentaId}/movimientos`, { params })
        return response.data as {
          data: MovimientoBancarioDTO[]
          total: number
          take: number
          skip: number
        }
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    importar: async (
      cuentaId: number,
      file: File | Blob,
      opts?: { bancoCode?: string; mappingId?: number; fileName?: string },
    ): Promise<ImportExtractoResultDTO> => {
      try {
        const form = new FormData()
        form.append('file', file, opts?.fileName ?? 'extracto.csv')
        if (opts?.bancoCode) form.append('bancoCode', opts.bancoCode)
        if (opts?.mappingId != null) form.append('mappingId', String(opts.mappingId))
        const response = await http.post(`/bancos/cuentas/${cuentaId}/importar`, form)
        return response.data.data as ImportExtractoResultDTO
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    listMappings: async (): Promise<BancoCsvMappingDTO[]> => {
      try {
        const response = await http.get('/bancos/csv-mappings')
        return response.data.data as BancoCsvMappingDTO[]
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    createMapping: async (
      body: Omit<BancoCsvMappingDTO, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>,
    ): Promise<BancoCsvMappingDTO> => {
      try {
        const response = await http.post('/bancos/csv-mappings', body)
        return response.data.data as BancoCsvMappingDTO
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    updateMapping: async (
      id: number,
      body: Partial<Omit<BancoCsvMappingDTO, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>>,
    ): Promise<BancoCsvMappingDTO> => {
      try {
        const response = await http.patch(`/bancos/csv-mappings/${id}`, body)
        return response.data.data as BancoCsvMappingDTO
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },
  }
}

export const bancosAPI = createBancosAPI(api)
