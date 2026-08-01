import { andreaniProvider } from './andreaniProvider'
import { correoArgentinoProvider } from './correoArgentinoProvider'
import { meliFullProvider, propioProvider } from './linkOnlyProviders'
import type { ShippingCarrierProvider } from './types'

const REGISTRY: Record<string, ShippingCarrierProvider> = {
  andreani: andreaniProvider,
  correo_argentino: correoArgentinoProvider,
  propio: propioProvider,
  meli_full: meliFullProvider,
}

/**
 * @en Resolves a shipping carrier provider by transportista code (#193).
 * @es Resuelve el proveedor de envío por código de transportista (#193).
 * @pt-BR Resolve o provedor de envio pelo código da transportadora (#193).
 */
export function getShippingCarrierProvider(
  transportista: string,
): ShippingCarrierProvider | null {
  return REGISTRY[transportista] ?? null
}

export function listShippingCarrierProviders(): ShippingCarrierProvider[] {
  return Object.values(REGISTRY)
}
