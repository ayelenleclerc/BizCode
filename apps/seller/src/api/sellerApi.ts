import { createClientesAPI, createPedidosAPI } from '@bizcode/api-client'
import type { DeliveryZone } from '@bizcode/types'
import { sellerHttp } from './http'

export const clientesAPI = createClientesAPI(sellerHttp)
export const pedidosAPI = createPedidosAPI(sellerHttp)

/**
 * @en Lists delivery zones for the authenticated tenant.
 * @es Lista zonas de entrega del tenant autenticado.
 * @pt-BR Lista zonas de entrega do tenant autenticado.
 */
export async function listZonasEntrega(): Promise<DeliveryZone[]> {
  const response = await sellerHttp.get<{ success: boolean; data: DeliveryZone[] }>('/zonas-entrega')
  return response.data.data
}
