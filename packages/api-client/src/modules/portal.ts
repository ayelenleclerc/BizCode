import { AxiosError } from 'axios'
import type { ApiErrorPayload } from '@bizcode/types'
import { portalHttp } from '../default-client'
import { ApiRequestFailedError, handleError } from '../errors'

export type PortalBranding = {
  tenantName: string
  tenantSlug: string
  enabled: boolean
  showPedidos: boolean
  logoUrl: string | null
  primaryColor: string | null
  footerText: string | null
}

export type PortalMe = {
  clienteId: number
  codigo: number
  rsocial: string
  fantasia: string | null
  email: string | null
  telef: string | null
  domicilio: string | null
  localidad: string | null
  vendedor: { id: number; username: string } | null
}

export type PortalFactura = {
  id: number
  ref: string
  fecha: string
  total: string
  pagado: string
  pendiente: string
  estado: 'pagada' | 'pendiente' | 'vencida'
  mpPaymentLink?: string
  mpEstado?: string
}

export type PortalConfig = {
  enabled: boolean
  showPedidos: boolean
  logoUrl: string | null
  primaryColor: string | null
  footerText: string | null
}

function portalPath(tenantSlug: string, suffix: string): string {
  return `/portal/${encodeURIComponent(tenantSlug)}${suffix}`
}

export function createPortalAPI(http: typeof portalHttp) {
  return {
    getBranding: async (tenantSlug: string): Promise<PortalBranding> => {
      try {
        const response = await http.get<{ success: boolean; data: PortalBranding }>(
          portalPath(tenantSlug, '/branding'),
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    requestMagicLink: async (tenantSlug: string, email: string): Promise<{ sent: true }> => {
      try {
        const response = await http.post<{ success: boolean; data: { sent: true } }>(
          portalPath(tenantSlug, '/auth/magic-link'),
          { email },
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    verifyToken: async (tenantSlug: string, token: string): Promise<{ me: PortalMe }> => {
      try {
        const response = await http.get<{ success: boolean; data: { me: PortalMe } }>(
          portalPath(tenantSlug, '/auth/verify'),
          { params: { token } },
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    logout: async (tenantSlug: string): Promise<void> => {
      try {
        await http.post(portalPath(tenantSlug, '/auth/logout'))
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    getMe: async (
      tenantSlug: string,
    ): Promise<{ me: PortalMe; branding: PortalBranding }> => {
      try {
        const response = await http.get<{
          success: boolean
          data: { me: PortalMe; branding: PortalBranding }
        }>(portalPath(tenantSlug, '/me'))
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    listFacturas: async (
      tenantSlug: string,
      params?: { estado?: string; from?: string; to?: string; limit?: number; offset?: number },
    ): Promise<{ facturas: PortalFactura[]; total: number }> => {
      try {
        const response = await http.get<{
          success: boolean
          data: { facturas: PortalFactura[]; total: number }
        }>(portalPath(tenantSlug, '/facturas'), { params })
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    downloadFacturaPdf: async (tenantSlug: string, facturaId: number): Promise<Blob> => {
      try {
        const response = await http.get(portalPath(tenantSlug, `/facturas/${facturaId}/pdf`), {
          responseType: 'blob',
        })
        return response.data as Blob
      } catch (error) {
        if (error instanceof AxiosError && error.response?.data instanceof Blob) {
          throw new ApiRequestFailedError('Download failed', {
            hasResponse: true,
            httpStatus: error.response.status,
          })
        }
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    getCuentaCorriente: async (
      tenantSlug: string,
      params?: { from?: string; to?: string; limit?: number; offset?: number },
    ): Promise<import('@bizcode/types').ClienteCuentaCorriente> => {
      try {
        const response = await http.get<{
          success: boolean
          data: import('@bizcode/types').ClienteCuentaCorriente
        }>(portalPath(tenantSlug, '/cuenta-corriente'), { params })
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    downloadEstadoCuentaPdf: async (
      tenantSlug: string,
      params?: { desde?: string; hasta?: string },
    ): Promise<Blob> => {
      try {
        const response = await http.get(
          portalPath(tenantSlug, '/cuenta-corriente/estado-de-cuenta/pdf'),
          { params, responseType: 'blob' },
        )
        return response.data as Blob
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    listPedidos: async (
      tenantSlug: string,
      params?: { limit?: number; offset?: number },
    ): Promise<{
      pedidos: Array<{
        id: number
        estado: string
        total: string
        createdAt: string
        validUntil: string | null
        facturaRef: string | null
        remitoEstado: string | null
      }>
      total: number
    }> => {
      try {
        const response = await http.get<{
          success: boolean
          data: {
            pedidos: Array<{
              id: number
              estado: string
              total: string
              createdAt: string
              validUntil: string | null
              facturaRef: string | null
              remitoEstado: string | null
            }>
            total: number
          }
        }>(portalPath(tenantSlug, '/pedidos'), { params })
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    getFidelizacion: async (
      tenantSlug: string,
    ): Promise<import('@bizcode/types').PortalFidelizacionSummary> => {
      try {
        const response = await http.get<{
          success: boolean
          data: import('@bizcode/types').PortalFidelizacionSummary
        }>(portalPath(tenantSlug, '/fidelizacion'))
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },
  }
}

export function createPortalConfigAPI(http: typeof portalHttp) {
  return {
    get: async (): Promise<PortalConfig> => {
      try {
        const response = await http.get<{ success: boolean; data: PortalConfig }>('/portal-config')
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },
    update: async (body: Partial<PortalConfig>): Promise<PortalConfig> => {
      try {
        const response = await http.put<{ success: boolean; data: PortalConfig }>(
          '/portal-config',
          body,
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },
  }
}

export const portalAPI = createPortalAPI(portalHttp)
export const portalConfigAPI = createPortalConfigAPI(portalHttp)
