/**
 * @en Registers built-in payment provider adapter factories (MP + capability stubs) (#377).
 * @es Registra factories built-in de adapters de pago (MP + stubs) (#377).
 * @pt-BR Registra factories built-in de adapters de pagamento (MP + stubs) (#377).
 */

import { registerPaymentProviderAdapterFactory } from './paymentProviderRegistry'
import { MercadoPagoPaymentAdapter } from './mercadopago/MercadoPagoPaymentAdapter'
import { PaywayPaymentAdapter } from './stubs/PaywayPaymentAdapter'
import { StripePaymentAdapter } from './stubs/StripePaymentAdapter'

let bootstrapped = false

/** @en Idempotent bootstrap of default payment provider adapter factories. */
export function bootstrapPaymentProviders(): void {
  if (bootstrapped) return
  registerPaymentProviderAdapterFactory('mercadopago', (prisma) => new MercadoPagoPaymentAdapter(prisma))
  registerPaymentProviderAdapterFactory('payway', (prisma) => new PaywayPaymentAdapter(prisma))
  registerPaymentProviderAdapterFactory('stripe', (prisma) => new StripePaymentAdapter(prisma))
  bootstrapped = true
}

/** @en Test helper. */
export function resetPaymentProvidersBootstrap(): void {
  bootstrapped = false
}
