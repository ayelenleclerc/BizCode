import type { PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import type { ReciboPagoRetencionInput } from '../createApp.types'
import {
  type ValidatedRetencionLine,
  validateRetencionLines,
} from './retencionLineValidationCore'

export type { ValidatedRetencionLine }

type ValidationError = { ok: false; status: number; error: string }
type ValidationOk = { ok: true; lines: ValidatedRetencionLine[]; retencionesTotal: number }
export type RetencionPagoValidationResult = ValidationError | ValidationOk

/**
 * @en Validates withholding lines on supplier payment (#276).
 * @es Valida líneas de retención en pago a proveedor (#276).
 * @pt-BR Valida linhas de retenção em pagamento a fornecedor (#276).
 */
export async function validateReciboPagoRetenciones(
  prisma: PrismaClient,
  tenantId: number,
  retenciones: ReciboPagoRetencionInput[] | undefined,
): Promise<RetencionPagoValidationResult> {
  if (retenciones == null || retenciones.length === 0) {
    return { ok: true, lines: [], retencionesTotal: 0 }
  }

  const validation = await validateRetencionLines(prisma, tenantId, retenciones, 'retencion')
  if (!validation.ok) return validation

  return { ok: true, lines: validation.lines, retencionesTotal: validation.total }
}

export function decimalToMoneyString(value: Decimal | number): string {
  const n = typeof value === 'number' ? value : value.toNumber()
  return n.toFixed(2)
}
