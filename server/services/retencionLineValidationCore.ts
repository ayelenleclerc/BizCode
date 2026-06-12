import type { PrismaClient } from '@prisma/client'
import { isAgentEnabledForTipo } from '../fiscal/ar/retencionesArCommon'

const MONEY_TOLERANCE = 0.009

export type RetencionLineInput = {
  regimenId: number
  baseImponible: number
  alicuota: number
  importe: number
}

export type ValidatedRetencionLine = {
  regimenId: number
  tipo: string
  subtipo: string
  nombre: string
  provincia: string | null
  baseImponible: number
  alicuota: number
  importe: number
}

type ValidationError = { ok: false; status: number; error: string }
type ValidationOk = { ok: true; lines: ValidatedRetencionLine[]; total: number }
export type RetencionLineValidationResult = ValidationError | ValidationOk

/**
 * @en Shared validation for retencion/percepcion lines (#229, #276).
 * @es Validación compartida de líneas retención/percepción (#229, #276).
 * @pt-BR Validação compartilhada de linhas retenção/percepção (#229, #276).
 */
export async function validateRetencionLines(
  prisma: PrismaClient,
  tenantId: number,
  lines: RetencionLineInput[],
  expectedSubtipo: 'retencion' | 'percepcion',
): Promise<RetencionLineValidationResult> {
  if (lines.length === 0) {
    return { ok: true, lines: [], total: 0 }
  }

  const config = await prisma.fiscalRetencionesConfig.findUnique({ where: { tenantId } })
  const agentFlags = {
    esAgenteRetencionGanancias: config?.esAgenteRetencionGanancias ?? false,
    esAgenteRetencionIVA: config?.esAgenteRetencionIVA ?? false,
    esAgenteRetencionIIBB: config?.esAgenteRetencionIIBB ?? false,
  }

  const regimenIds = [...new Set(lines.map((r) => r.regimenId))]
  const regimenes = await prisma.regimenRetencion.findMany({
    where: { tenantId, id: { in: regimenIds } },
  })
  const regimenById = new Map(regimenes.map((r) => [r.id, r]))

  const validated: ValidatedRetencionLine[] = []
  let total = 0

  for (const line of lines) {
    if (line.importe <= 0) {
      return { ok: false, status: 400, error: 'Each line importe must be positive' }
    }
    const regimen = regimenById.get(line.regimenId)
    if (!regimen || !regimen.activo) {
      return { ok: false, status: 400, error: `regimenId ${line.regimenId} is invalid or inactive` }
    }
    if (regimen.subtipo !== expectedSubtipo) {
      return {
        ok: false,
        status: 400,
        error: `regimenId ${line.regimenId} must be subtipo ${expectedSubtipo}`,
      }
    }
    if (!isAgentEnabledForTipo(regimen.tipo, agentFlags)) {
      return {
        ok: false,
        status: 422,
        error: `Tenant is not configured as agent for ${regimen.tipo}`,
      }
    }
    const expectedImporte = (line.baseImponible * line.alicuota) / 100
    if (Math.abs(expectedImporte - line.importe) > MONEY_TOLERANCE) {
      return {
        ok: false,
        status: 400,
        error: `importe must match baseImponible * alicuota / 100 for regimen ${line.regimenId}`,
      }
    }
    const regimenAlicuota = regimen.alicuota.toNumber()
    if (Math.abs(regimenAlicuota - line.alicuota) > 0.0001) {
      return {
        ok: false,
        status: 400,
        error: `alicuota must match active regimen ${line.regimenId}`,
      }
    }
    validated.push({
      regimenId: line.regimenId,
      tipo: regimen.tipo,
      subtipo: regimen.subtipo,
      nombre: regimen.nombre,
      provincia: regimen.provincia,
      baseImponible: line.baseImponible,
      alicuota: line.alicuota,
      importe: line.importe,
    })
    total += line.importe
  }

  return { ok: true, lines: validated, total }
}
