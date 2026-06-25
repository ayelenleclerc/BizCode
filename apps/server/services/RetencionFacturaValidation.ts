import type { PrismaClient } from '@prisma/client'
import type { FacturaPercepcionInput } from '@bizcode/types'
import {
  type ValidatedRetencionLine,
  validateRetencionLines,
} from './retencionLineValidationCore'

const MONEY_TOLERANCE = 0.009

export type RetencionFacturaValidationResult =
  | { ok: false; status: number; error: string }
  | { ok: true; lines: ValidatedRetencionLine[]; percepcionesTotal: number }

/**
 * @en Validates perception lines on invoice create (#229).
 * @es Valida líneas de percepción al crear factura (#229).
 * @pt-BR Valida linhas de percepção ao criar fatura (#229).
 */
export async function validateFacturaPercepciones(
  prisma: PrismaClient,
  tenantId: number,
  input: {
    neto1: number
    neto2: number
    neto3: number
    iva1: number
    iva2: number
    total: number
    percepciones?: FacturaPercepcionInput[]
  },
): Promise<RetencionFacturaValidationResult> {
  const baseNeto = input.neto1 + input.neto2 + input.neto3
  const subtotalConIva = baseNeto + input.iva1 + input.iva2

  if (input.percepciones == null || input.percepciones.length === 0) {
    if (Math.abs(input.total - subtotalConIva) > MONEY_TOLERANCE) {
      return { ok: false, status: 400, error: 'total must equal netos + IVA when no percepciones' }
    }
    return { ok: true, lines: [], percepcionesTotal: 0 }
  }

  const validation = await validateRetencionLines(prisma, tenantId, input.percepciones, 'percepcion')
  if (!validation.ok) return validation

  const expectedTotal = subtotalConIva + validation.total
  if (Math.abs(input.total - expectedTotal) > MONEY_TOLERANCE) {
    return {
      ok: false,
      status: 400,
      error: 'total must equal netos + IVA + percepciones',
    }
  }

  for (const line of validation.lines) {
    if (Math.abs(line.baseImponible - baseNeto) > MONEY_TOLERANCE) {
      return {
        ok: false,
        status: 400,
        error: `percepcion baseImponible must match invoice neto subtotal for regimen ${line.regimenId}`,
      }
    }
  }

  return { ok: true, lines: validation.lines, percepcionesTotal: validation.total }
}
