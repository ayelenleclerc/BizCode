import type { AxiosError, AxiosInstance } from 'axios'
import type { ApiErrorPayload, FormaPago } from '@bizcode/types'
import { api } from '../default-client'
import { handleError } from '../errors'

export type FormaPagoDTO = FormaPago

/**
 * @en Payment-method API bound to an Axios instance (cookie web or Bearer driver) (#162).
 * @es API de formas de pago ligada a un Axios (cookie web o Bearer driver) (#162).
 * @pt-BR API de formas de pagamento ligada a um Axios (cookie web ou Bearer driver) (#162).
 */
export function createFormasPagoAPI(http: AxiosInstance) {
  return {
    list: async (): Promise<FormaPago[]> => {
      try {
        const response = await http.get('/formas-pago')
        return response.data.data as FormaPago[]
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },
    patch: async (id: number, body: { esEfectivo: boolean }): Promise<FormaPago> => {
      try {
        const response = await http.patch(`/formas-pago/${id}`, body)
        return response.data.data as FormaPago
      } catch (error) {
        return handleError(error as AxiosError<ApiErrorPayload>)
      }
    },
  }
}

export const formasPagoAPI = createFormasPagoAPI(api)
