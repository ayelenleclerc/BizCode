/**
 * @en Thrown when a capability-only payment stub is invoked for a live operation (#377).
 * @es Lanzado cuando un stub de capacidades de pago se invoca para una operación real (#377).
 * @pt-BR Lançado quando um stub de capacidades de pagamento é invocado para operação real (#377).
 */

import type { PaymentProviderCode } from '../types'

export class PaymentAdapterNotImplementedError extends Error {
  readonly provider: PaymentProviderCode
  readonly operation: string

  constructor(provider: PaymentProviderCode, operation: string) {
    super(`Payment provider "${provider}" does not implement "${operation}"`)
    this.name = 'PaymentAdapterNotImplementedError'
    this.provider = provider
    this.operation = operation
  }
}
