import type { AxiosError, AxiosInstance } from 'axios'
import type {
  ApiErrorPayload,
  Factura,
  FacturaAnomalyWarningPayload,
  JsonRecord,
} from '@bizcode/types'
import { api } from '../default-client'
import { handleError } from '../errors'
import type { NotaCreditoSnippetDTO } from './rest'

export type FacturaVoidBalanceClienteDTO = {
  id: number
  rsocial: string
  balance: number | string
  creditLimit: number | null
}

export type FacturaVoidResultDTO = {
  factura: Factura
  notaCredito: NotaCreditoSnippetDTO
  updatedCliente: FacturaVoidBalanceClienteDTO
}

export type MercadoPagoFacturaEstado =
  | 'none'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'cancelled'
  | 'expired'
  | 'refunded'

export type MercadoPagoPaymentChannel = 'none' | 'link' | 'qr'

export type MercadoPagoFacturaPaymentDto = {
  estado: MercadoPagoFacturaEstado
  channel?: MercadoPagoPaymentChannel
  preferenceId?: string
  paymentLink?: string
  expiresAt?: string
  pagadoAt?: string
  amount?: string
  facturaRef?: string
  qrData?: string
  qrImageBase64?: string
  qrExpiresAt?: string
  qrOrderId?: string
}

export type MercadoPagoRefundDto = {
  id: number
  facturaId: number
  mpPaymentId: string
  mpRefundId: string | null
  monto: string
  motivo: string
  estado: 'iniciado' | 'procesando' | 'completado' | 'fallido'
  notaCreditoId: number | null
  reciboCobroId: number | null
  errorMessage: string | null
  createdAt: string
  updatedAt: string
}

export type MercadoPagoRefundStatusDto = {
  originalPaymentAmount: string
  refundableBalance: string
  refunds: MercadoPagoRefundDto[]
}

export type FacturaCreateResultDTO = {
  data: Factura
  warnings: FacturaAnomalyWarningPayload[]
}

export function createFacturasAPI(http: AxiosInstance) {
  return {
    list: async () => {
      try {
        const response = await http.get('/facturas')
        return response.data.data
      } catch (error) {
        handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    create: async (data: JsonRecord): Promise<FacturaCreateResultDTO> => {
      try {
        const response = await http.post<{
          success: boolean
          data: Factura
          warnings?: FacturaAnomalyWarningPayload[]
        }>('/facturas', data)
        return {
          data: response.data.data,
          warnings: response.data.warnings ?? [],
        }
      } catch (error) {
        handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    void: async (id: number, motivo: string): Promise<FacturaVoidResultDTO> => {
      try {
        const response = await http.put<{ success: boolean; data: FacturaVoidResultDTO }>(
          `/facturas/${id}/void`,
          { motivo },
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    downloadPdf: async (id: number): Promise<Blob> => {
      try {
        const response = await http.get(`/facturas/${id}/pdf`, { responseType: 'blob' })
        return response.data as Blob
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    downloadPdfPreview: async (id: number): Promise<Blob> => {
      try {
        const response = await http.get(`/facturas/${id}/pdf/preview`, { responseType: 'blob' })
        return response.data as Blob
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    downloadTicket: async (id: number): Promise<Blob> => {
      try {
        const response = await http.get(`/facturas/${id}/ticket`, { responseType: 'blob' })
        return response.data as Blob
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    print: async (
      id: number,
      device: 'pdf' | 'fiscal' | 'thermal',
    ): Promise<{
      device: 'pdf' | 'fiscal' | 'thermal'
      channel: 'pdf' | 'fiscal_mock' | 'thermal_mock'
      fallbackToPdf: boolean
      downloadPath?: string
      jobId?: string
      transport?: 'mock-serial'
    }> => {
      try {
        const response = await http.post<{
          success: boolean
          data: {
            device: 'pdf' | 'fiscal' | 'thermal'
            channel: 'pdf' | 'fiscal_mock' | 'thermal_mock'
            fallbackToPdf: boolean
            downloadPath?: string
            jobId?: string
            transport?: 'mock-serial'
          }
        }>(`/facturas/${id}/print`, { device })
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    getMpStatus: async (id: number): Promise<MercadoPagoFacturaPaymentDto> => {
      try {
        const response = await http.get<{ success: boolean; data: MercadoPagoFacturaPaymentDto }>(
          `/facturas/${id}/mp`,
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    createMpPreference: async (id: number): Promise<MercadoPagoFacturaPaymentDto> => {
      try {
        const response = await http.post<{ success: boolean; data: MercadoPagoFacturaPaymentDto }>(
          `/facturas/${id}/mp/preference`,
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    createMpQr: async (id: number): Promise<MercadoPagoFacturaPaymentDto> => {
      try {
        const response = await http.post<{ success: boolean; data: MercadoPagoFacturaPaymentDto }>(
          `/facturas/${id}/mp/qr`,
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    getMpRefund: async (id: number): Promise<MercadoPagoRefundStatusDto> => {
      try {
        const response = await http.get<{ success: boolean; data: MercadoPagoRefundStatusDto }>(
          `/facturas/${id}/mp/reembolso`,
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    refundMp: async (
      id: number,
      body: { motivo: string; monto?: number },
    ): Promise<MercadoPagoRefundDto> => {
      try {
        const response = await http.post<{ success: boolean; data: MercadoPagoRefundDto }>(
          `/facturas/${id}/mp/reembolso`,
          body,
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },
  }
}

export const facturasAPI = createFacturasAPI(api)
