import type { PrismaClient } from '@prisma/client'
import type { CobroRetencionInput } from '@bizcode/types'
import {
  type ValidatedRetencionLine,
  validateRetencionLines,
} from './retencionLineValidationCore'

const MONEY_TOLERANCE = 0.009

export type RetencionCobroValidationResult =
  | { ok: false; status: number; error: string }
  | { ok: true; lines: ValidatedRetencionLine[]; retencionesTotal: number; montoBruto: number }

/**
 * @en Validates withholding lines on customer collection (#229).
 * @es Valida líneas de retención al registrar cobro (#229).
 * @pt-BR Valida linhas de retenção ao registrar recebimento (#229).
 */
export async function validateCobroRetenciones(
  prisma: PrismaClient,
  tenantId: number,
  montoNeto: number,
  retenciones: CobroRetencionInput[] | undefined,
): Promise<RetencionCobroValidationResult> {
  if (retenciones == null || retenciones.length === 0) {
    return { ok: true, lines: [], retencionesTotal: 0, montoBruto: montoNeto }
  }

  const validation = await validateRetencionLines(prisma, tenantId, retenciones, 'retencion')
  if (!validation.ok) return validation

  const montoBruto = montoNeto + validation.total
  if (montoBruto <= 0) {
    return { ok: false, status: 400, error: 'monto bruto must be positive' }
  }

  for (const line of validation.lines) {
    if (Math.abs(line.baseImponible - montoBruto) > MONEY_TOLERANCE) {
      return {
        ok: false,
        status: 400,
        error: `retencion baseImponible must match cobro bruto for regimen ${line.regimenId}`,
      }
    }
  }

  return {
    ok: true,
    lines: validation.lines,
    retencionesTotal: validation.total,
    montoBruto,
  }
}
