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

export type MatchEstado = 'unmatched' | 'suggested' | 'matched_auto' | 'matched_manual' | 'ignored' | 'bank_fee'

export type ConciliadoTipo = 'recibo_forma' | 'cobro'

export type MatchSugerenciaDTO = {
  tipo: ConciliadoTipo
  id: number
  clienteId: number
  importe: number
  fecha: string
  referencia: string | null
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
  conciliadoTipo: ConciliadoTipo | null
  matchEstado: MatchEstado
  matchScore: number | null
  matchSugerencias: MatchSugerenciaDTO[] | null
}

/**
 * @en Reconciliation view of a bank movement (#191). Narrower than `MovimientoBancarioDTO` — it
 * omits `saldo`, `formatoOrigen`, `dedupeKey`, and `createdAt`, and adds `periodoLocked`.
 * @es Vista de conciliación de un movimiento bancario (#191). Más acotada que
 * `MovimientoBancarioDTO`: omite `saldo`, `formatoOrigen`, `dedupeKey` y `createdAt`, y agrega
 * `periodoLocked`.
 * @pt-BR Visão de conciliação de um movimento bancário (#191). Mais restrita que
 * `MovimientoBancarioDTO`: omite `saldo`, `formatoOrigen`, `dedupeKey` e `createdAt`, e adiciona
 * `periodoLocked`.
 */
export type ConciliacionMovimientoDTO = {
  id: number
  cuentaId: number
  fecha: string
  descripcion: string
  importe: string
  tipo: string
  referencia: string | null
  matchEstado: MatchEstado
  conciliadoTipo: ConciliadoTipo | null
  conciliadoId: number | null
  conciliadoAt: string | null
  matchScore: number | null
  matchSugerencias: MatchSugerenciaDTO[] | null
  periodoLocked: boolean
}

export type ConciliacionSummaryDTO = {
  total: number
  unmatched: number
  suggested: number
  matchedAuto: number
  matchedManual: number
  ignored: number
  bankFees: number
  openCandidates: { recibosForma: number; cobros: number }
}

export type ConciliacionDataDTO = {
  movimientos: ConciliacionMovimientoDTO[]
  summary: ConciliacionSummaryDTO
}

export type RunMatchingSummaryDTO = {
  processed: number
  autoMatched: number
  suggested: number
  unmatched: number
  bankFees: number
}

export type ConciliarManualBody = {
  tipo: ConciliadoTipo
  id: number
}

export type PeriodoLockResultDTO = {
  periodo: string
  lockedAt: string
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

    /** @en Bank reconciliation state for an account and date range (#191). */
    getConciliacion: async (
      cuentaId: number,
      params?: { desde?: string; hasta?: string },
    ): Promise<ConciliacionDataDTO> => {
      try {
        const response = await http.get(`/bancos/cuentas/${cuentaId}/conciliacion`, { params })
        return response.data.data as ConciliacionDataDTO
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    /** @en Runs the matching engine over unlocked movements in the range (#191). */
    runMatching: async (
      cuentaId: number,
      params?: { desde?: string; hasta?: string },
    ): Promise<RunMatchingSummaryDTO> => {
      try {
        const response = await http.post(`/bancos/cuentas/${cuentaId}/conciliacion/run`, params ?? {})
        return response.data.data as RunMatchingSummaryDTO
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    /** @en Downloads the reconciliation state as an Excel workbook (#191). */
    exportExcel: async (
      cuentaId: number,
      params?: { desde?: string; hasta?: string },
    ): Promise<Blob> => {
      try {
        const response = await http.get(`/bancos/cuentas/${cuentaId}/conciliacion/export.xlsx`, {
          params,
          responseType: 'blob',
        })
        return response.data as Blob
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    /** @en Manually reconciles a movement against a ReciboCobroForma or legacy Cobro (#191). */
    conciliar: async (movId: number, body: ConciliarManualBody): Promise<ConciliacionMovimientoDTO> => {
      try {
        const response = await http.post(`/bancos/movimientos/${movId}/conciliar`, body)
        return response.data.data as ConciliacionMovimientoDTO
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    /** @en Confirms the primary suggestion of a `suggested` movement as a manual match (#191). */
    confirmarSugerencia: async (movId: number): Promise<ConciliacionMovimientoDTO> => {
      try {
        const response = await http.post(`/bancos/movimientos/${movId}/sugerencia/confirmar`)
        return response.data.data as ConciliacionMovimientoDTO
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    /** @en Marks a movement as ignored, excluding it from reconciliation (#191). */
    ignorar: async (movId: number): Promise<ConciliacionMovimientoDTO> => {
      try {
        const response = await http.post(`/bancos/movimientos/${movId}/ignorar`)
        return response.data.data as ConciliacionMovimientoDTO
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    /** @en Manually reclassifies a movement as a bank fee/charge (#191). */
    marcarGastoBancario: async (movId: number): Promise<ConciliacionMovimientoDTO> => {
      try {
        const response = await http.post(`/bancos/movimientos/${movId}/gasto-bancario`)
        return response.data.data as ConciliacionMovimientoDTO
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    /** @en Locks a YYYY-MM reconciliation period for an account (#191). */
    lockPeriodo: async (cuentaId: number, periodo: string): Promise<PeriodoLockResultDTO> => {
      try {
        const response = await http.post(`/bancos/cuentas/${cuentaId}/periodos/${periodo}/lock`)
        return response.data.data as PeriodoLockResultDTO
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    /** @en Unlocks a previously locked YYYY-MM reconciliation period (#191). */
    unlockPeriodo: async (cuentaId: number, periodo: string): Promise<null> => {
      try {
        const response = await http.delete(`/bancos/cuentas/${cuentaId}/periodos/${periodo}/lock`)
        return response.data.data as null
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },
  }
}

export const bancosAPI = createBancosAPI(api)
