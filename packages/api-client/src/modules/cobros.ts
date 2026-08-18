import type { AxiosError, AxiosInstance } from 'axios'
import type { ApiErrorPayload, Cliente, Cobro } from '@bizcode/types'
import { api } from '../default-client'
import { handleError } from '../errors'

export type CobroListParams = {
  clienteId?: number
  desde?: string
  hasta?: string
  limit?: number
  offset?: number
}

export type CobroRetencionInputDTO = {
  regimenId: number
  baseImponible: number
  alicuota: number
  importe: number
}

export type CobroRetencionDTO = {
  id: number
  regimenId: number
  regimenNombre: string
  tipo: string
  baseImponible: string
  alicuota: string
  importe: string
  constanciaNum: string | null
}

export type ChequeEstadoDTO =
  | 'en_cartera'
  | 'emitido'
  | 'depositado'
  | 'endosado'
  | 'descontado'
  | 'cobrado'
  | 'rechazado'
  | 'anulado'

export type ChequeTipoDTO = 'recibido' | 'emitido'
export type ChequeModalidadDTO = 'fisico' | 'echeq'

export type ChequeDTO = {
  id: number
  tipo: ChequeTipoDTO
  modalidad: ChequeModalidadDTO
  numero: string
  banco: string
  sucursal: string | null
  cbuOrigen: string | null
  libradorNombre: string
  libradorCuit: string | null
  monto: string | number
  moneda: string
  fechaEmision: string
  fechaVencimiento: string
  estado: ChequeEstadoDTO
  clienteId: number | null
  proveedorId: number | null
  observaciones: string | null
  cliente?: { id: number; codigo: number; rsocial: string; cuit: string | null } | null
}

export type ChequeInputDTO = {
  tipo: ChequeTipoDTO
  modalidad: ChequeModalidadDTO
  numero: string
  banco: string
  sucursal?: string | null
  cbuOrigen?: string | null
  libradorNombre: string
  libradorCuit?: string | null
  monto: number
  moneda?: string
  fechaEmision: string
  fechaVencimiento: string
  clienteId?: number | null
  proveedorId?: number | null
  observaciones?: string | null
}

export type ChequeTransicionBody = {
  destino?: string | null
  nota?: string | null
  proveedorId?: number | null
  monto?: number | null
}

export type ChequeResumenDTO = {
  enCartera: { count: number; total: string }
  proximosVencer: { count: number; total: string }
  rechazados: { count: number; total: string }
}

export type CobroCreateBody = {
  clienteId: number
  fecha: string
  monto: number
  formaPagoId?: number | null
  referencia?: string | null
  nota?: string | null
  chequeId?: number | null
  chequeNuevo?: ChequeInputDTO | null
  retenciones?: CobroRetencionInputDTO[]
}

export type CobroTransferInfo = {
  banco: string
  cbu: string
  alias: string | null
}

export function createChequesAPI(http: AxiosInstance) {
  return {
    list: async (params?: {
      tipo?: ChequeTipoDTO
      estado?: ChequeEstadoDTO
      banco?: string
      limit?: number
      offset?: number
    }) => {
      try {
        const response = await http.get('/cheques', { params })
        return response.data as { data: ChequeDTO[]; total: number }
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    resumen: async (): Promise<ChequeResumenDTO> => {
      try {
        const response = await http.get('/cheques/resumen')
        return response.data.data as ChequeResumenDTO
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    get: async (id: number): Promise<ChequeDTO> => {
      try {
        const response = await http.get(`/cheques/${id}`)
        return response.data.data as ChequeDTO
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    create: async (body: ChequeInputDTO): Promise<ChequeDTO> => {
      try {
        const response = await http.post('/cheques', body)
        return response.data.data as ChequeDTO
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    depositar: async (id: number, body?: ChequeTransicionBody): Promise<ChequeDTO> => {
      try {
        const response = await http.post(`/cheques/${id}/depositar`, body ?? {})
        return response.data.data as ChequeDTO
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    endosar: async (id: number, body: ChequeTransicionBody): Promise<ChequeDTO> => {
      try {
        const response = await http.post(`/cheques/${id}/endosar`, body)
        return response.data.data as ChequeDTO
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    descontar: async (id: number, body?: ChequeTransicionBody): Promise<ChequeDTO> => {
      try {
        const response = await http.post(`/cheques/${id}/descontar`, body ?? {})
        return response.data.data as ChequeDTO
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    cobrar: async (id: number, body?: ChequeTransicionBody): Promise<ChequeDTO> => {
      try {
        const response = await http.post(`/cheques/${id}/cobrar`, body ?? {})
        return response.data.data as ChequeDTO
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    rechazar: async (id: number, body?: ChequeTransicionBody): Promise<ChequeDTO> => {
      try {
        const response = await http.post(`/cheques/${id}/rechazar`, body ?? {})
        return response.data.data as ChequeDTO
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    devolverACartera: async (id: number, body?: ChequeTransicionBody): Promise<ChequeDTO> => {
      try {
        const response = await http.post(`/cheques/${id}/devolver-cartera`, body ?? {})
        return response.data.data as ChequeDTO
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    anular: async (id: number, body?: ChequeTransicionBody): Promise<ChequeDTO> => {
      try {
        const response = await http.post(`/cheques/${id}/anular`, body ?? {})
        return response.data.data as ChequeDTO
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },
  }
}

export function createCobrosAPI(http: AxiosInstance) {
  return {
    list: async (params?: CobroListParams) => {
      try {
        const response = await http.get('/cobros', { params })
        return response.data as {
          success: true
          data: Cobro[]
          total: number
          limit: number
          offset: number
        }
      } catch (error) {
        handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    get: async (id: number) => {
      try {
        const response = await http.get(`/cobros/${id}`)
        return response.data.data as Cobro
      } catch (error) {
        handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    create: async (data: CobroCreateBody) => {
      try {
        const response = await http.post('/cobros', data)
        return response.data.data as {
          cobro: Cobro
          updatedCliente: Pick<Cliente, 'id' | 'rsocial' | 'balance' | 'creditLimit' | 'score'>
          retenciones: CobroRetencionDTO[]
          montoBruto: string
        }
      } catch (error) {
        handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    getTransferInfo: async (): Promise<CobroTransferInfo | null> => {
      try {
        const response = await http.get('/cobros/transfer-info')
        return (response.data.data ?? null) as CobroTransferInfo | null
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    listRetenciones: async (cobroId: number): Promise<CobroRetencionDTO[]> => {
      try {
        const response = await http.get<{ success: boolean; data: CobroRetencionDTO[] }>(
          `/cobros/${cobroId}/retenciones`,
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },
  }
}

export const chequesAPI = createChequesAPI(api)
export const cobrosAPI = createCobrosAPI(api)
