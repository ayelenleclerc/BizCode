import {
  createArticulosAPI,
  createClientesAPI,
  createPedidosAPI,
  createPushNotificationsAPI,
  createRubrosAPI,
  createRutasAPI,
  createSellerAlertsAPI,
  createPlantillasPedidoAPI,
  createSugerenciasPedidoAPI,
  createVisitasAPI,
  createVoiceAPI,
} from '@bizcode/api-client'
import type { DeliveryZone } from '@bizcode/types'
import { sellerHttp } from './http'

export const clientesAPI = createClientesAPI(sellerHttp)
export const pedidosAPI = createPedidosAPI(sellerHttp)
export const articulosAPI = createArticulosAPI(sellerHttp)
export const rubrosAPI = createRubrosAPI(sellerHttp)
export const visitasAPI = createVisitasAPI(sellerHttp)
export const rutasAPI = createRutasAPI(sellerHttp)
export const sellerAlertsAPI = createSellerAlertsAPI(sellerHttp)
export const plantillasPedidoAPI = createPlantillasPedidoAPI(sellerHttp)
export const sugerenciasPedidoAPI = createSugerenciasPedidoAPI(sellerHttp)
export const pushNotificationsAPI = createPushNotificationsAPI(sellerHttp)
export const voiceAPI = createVoiceAPI(sellerHttp)

/**
 * @en Lists delivery zones for the authenticated tenant.
 * @es Lista zonas de entrega del tenant autenticado.
 * @pt-BR Lista zonas de entrega do tenant autenticado.
 */
export async function listZonasEntrega(): Promise<DeliveryZone[]> {
  const response = await sellerHttp.get<{ success: boolean; data: DeliveryZone[] }>('/zonas-entrega')
  return response.data.data
}
