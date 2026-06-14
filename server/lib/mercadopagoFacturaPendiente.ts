import type { PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'

/**
 * @en Computes open balance for an invoice from emitted receipt allocations (#178).
 * @es Calcula saldo pendiente de una factura según imputaciones emitidas (#178).
 * @pt-BR Calcula saldo em aberto de uma fatura conforme imputações emitidas (#178).
 */
export async function computeFacturaPendiente(
  prisma: PrismaClient,
  input: {
    tenantId: number
    clienteId: number
    facturaId: number
    total: Decimal
  },
): Promise<Decimal> {
  const allocations = await prisma.reciboCobroImputacion.groupBy({
    by: ['facturaId'],
    where: {
      facturaId: input.facturaId,
      reciboCobro: { tenantId: input.tenantId, clienteId: input.clienteId, estado: 'emitido' },
    },
    _sum: { importe: true },
  })
  const pagado = allocations[0]?._sum.importe ?? new Decimal(0)
  return input.total.minus(pagado)
}

/**
 * @en Compares payment amount with invoice balance using two decimal places (#178).
 * @es Compara monto de pago con saldo de factura a dos decimales (#178).
 * @pt-BR Compara valor do pagamento com saldo da fatura em duas casas decimais (#178).
 */
export function mercadoPagoAmountsMatchExact(paymentAmount: number, pendiente: Decimal): boolean {
  if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) return false
  return new Decimal(paymentAmount).toDecimalPlaces(2).equals(pendiente.toDecimalPlaces(2))
}
