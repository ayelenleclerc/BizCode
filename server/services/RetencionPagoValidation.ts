import type { PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import type { ReciboPagoRetencionInput } from '../createApp.types'

const MONEY_TOLERANCE = 0.009

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
type ValidationOk = { ok: true; lines: ValidatedRetencionLine[]; retencionesTotal: number }
export type RetencionPagoValidationResult = ValidationError | ValidationOk

function isAgentEnabledForTipo(
  tipo: string,
  config: {
    esAgenteRetencionGanancias: boolean
    esAgenteRetencionIVA: boolean
    esAgenteRetencionIIBB: boolean
  },
): boolean {
  if (tipo === 'ganancias') return config.esAgenteRetencionGanancias
  if (tipo === 'iva') return config.esAgenteRetencionIVA
  if (tipo === 'iibb') return config.esAgenteRetencionIIBB
  return false
}

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

  const config = await prisma.fiscalRetencionesConfig.findUnique({ where: { tenantId } })
  const agentFlags = {
    esAgenteRetencionGanancias: config?.esAgenteRetencionGanancias ?? false,
    esAgenteRetencionIVA: config?.esAgenteRetencionIVA ?? false,
    esAgenteRetencionIIBB: config?.esAgenteRetencionIIBB ?? false,
  }

  const regimenIds = [...new Set(retenciones.map((r) => r.regimenId))]
  const regimenes = await prisma.regimenRetencion.findMany({
    where: { tenantId, id: { in: regimenIds } },
  })
  const regimenById = new Map(regimenes.map((r) => [r.id, r]))

  const lines: ValidatedRetencionLine[] = []
  let retencionesTotal = 0

  for (const line of retenciones) {
    if (line.importe <= 0) {
      return { ok: false, status: 400, error: 'Each retencion importe must be positive' }
    }
    const regimen = regimenById.get(line.regimenId)
    if (!regimen || !regimen.activo) {
      return { ok: false, status: 400, error: `regimenId ${line.regimenId} is invalid or inactive` }
    }
    if (regimen.subtipo !== 'retencion') {
      return {
        ok: false,
        status: 400,
        error: `regimenId ${line.regimenId} must be subtipo retencion`,
      }
    }
    if (!isAgentEnabledForTipo(regimen.tipo, agentFlags)) {
      return {
        ok: false,
        status: 422,
        error: `Tenant is not configured as withholding agent for ${regimen.tipo}`,
      }
    }
    const expectedImporte = (line.baseImponible * line.alicuota) / 100
    if (Math.abs(expectedImporte - line.importe) > MONEY_TOLERANCE) {
      return {
        ok: false,
        status: 400,
        error: `retencion importe must match baseImponible * alicuota / 100 for regimen ${line.regimenId}`,
      }
    }
    const regimenAlicuota = regimen.alicuota.toNumber()
    if (Math.abs(regimenAlicuota - line.alicuota) > 0.0001) {
      return {
        ok: false,
        status: 400,
        error: `retencion alicuota must match active regimen ${line.regimenId}`,
      }
    }
    lines.push({
      regimenId: line.regimenId,
      tipo: regimen.tipo,
      subtipo: regimen.subtipo,
      nombre: regimen.nombre,
      provincia: regimen.provincia,
      baseImponible: line.baseImponible,
      alicuota: line.alicuota,
      importe: line.importe,
    })
    retencionesTotal += line.importe
  }

  return { ok: true, lines, retencionesTotal }
}

export function decimalToMoneyString(value: Decimal | number): string {
  const n = typeof value === 'number' ? value : value.toNumber()
  return n.toFixed(2)
}
