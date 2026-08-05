/**
 * @en Registers built-in ecommerce connector factories (MeLi, Tiendanube, WooCommerce) (#189/#187/#188).
 * @es Registra factories built-in de conectores eCommerce (MeLi, Tiendanube, WooCommerce) (#189/#187/#188).
 * @pt-BR Registra factories built-in de conectores eCommerce (MeLi, Tiendanube, WooCommerce) (#189/#187/#188).
 */

import { registerEcommerceConnectorFactory } from './connectorRegistry'
import { createMeliConnector } from './MeliConnector'
import { createTiendanubeConnector } from './TiendanubeConnector'
import { createWooCommerceConnector } from './WooCommerceConnector'

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
  registerEcommerceConnectorFactory('tiendanube', (prisma, tenantId) =>
    createTiendanubeConnector(prisma, tenantId),
  )
  registerEcommerceConnectorFactory('woocommerce', (prisma, tenantId) =>
    createWooCommerceConnector(prisma, tenantId),
  )
  bootstrapped = true
}

/** @en Test helper. @es Helper de test. @pt-BR Helper de teste. */
export function resetEcommerceConnectorBootstrap(): void {
  bootstrapped = false
}
