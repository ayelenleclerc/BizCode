import type { AxiosError, AxiosInstance } from 'axios'
import type {
  ApiErrorPayload,
  EstadoCredito,
  JsonRecord,
  SellerPolicies,
  StockMultipleResult,
} from '@bizcode/types'
import { api } from '../default-client'
import { handleError } from '../errors'

/**
 * @en Factory for seller credit/stock alert APIs (#256).
 * @es Factory de API de alertas de crédito/stock Seller (#256).
 * @pt-BR Factory da API de alertas de crédito/estoque Seller (#256).
 */
export function createSellerAlertsAPI(http: AxiosInstance) {
  return {
    getEstadoCredito: async (clienteId: number): Promise<EstadoCredito> => {
      try {
        const response = await http.get<{ success: boolean; data: EstadoCredito }>(
          `/clientes/${clienteId}/estado-credito`,
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    getStockMultiple: async (ids: number[]): Promise<StockMultipleResult> => {
      try {
        const response = await http.get<{ success: boolean; data: StockMultipleResult }>(
          '/articulos/stock-multiple',
          { params: { ids: ids.join(',') } },
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    getSellerPolicies: async (): Promise<SellerPolicies> => {
      try {
        const response = await http.get<{ success: boolean; data: SellerPolicies }>(
          '/tenant-config/seller-policies',
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },

    patchSellerPolicies: async (body: JsonRecord): Promise<SellerPolicies> => {
      try {
        const response = await http.patch<{ success: boolean; data: SellerPolicies }>(
          '/tenant-config/seller-policies',
          body,
        )
        return response.data.data
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },
  }
}

export const sellerAlertsAPI = createSellerAlertsAPI(api)
