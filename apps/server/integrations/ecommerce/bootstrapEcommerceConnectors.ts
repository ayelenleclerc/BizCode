/**
 * @en Registers built-in ecommerce connector factories (MeLi) (#189).
 * @es Registra factories built-in de conectores eCommerce (MeLi) (#189).
 * @pt-BR Registra factories built-in de conectores eCommerce (MeLi) (#189).
 */

import { registerEcommerceConnectorFactory } from './connectorRegistry'
import { createMeliConnector } from './MeliConnector'

let bootstrapped = false

/**
 * @en Idempotent bootstrap of default connector factories.
 * @es Bootstrap idempotente de factories de conectores por defecto.
 * @pt-BR Bootstrap idempotente de factories de conectores padrão.
 */
export function bootstrapEcommerceConnectors(): void {
  if (bootstrapped) return
  registerEcommerceConnectorFactory('meli', (prisma, tenantId) =>
    createMeliConnector(prisma, tenantId),
  )
  bootstrapped = true
}

/** @en Test helper. @es Helper de test. @pt-BR Helper de teste. */
export function resetEcommerceConnectorBootstrap(): void {
  bootstrapped = false
}
