import type { FiscalRetencionesConfig, Proveedor, RegimenRetencion } from '@prisma/client'
import type { RetencionPreviewLine } from './retencionesPreviewStub'

const SKIP_COND_IVA = new Set(['Mono', 'Exento', 'CF'])

function isAgentEnabledForTipo(
  tipo: string,
  config: Pick<
    FiscalRetencionesConfig,
    'esAgenteRetencionGanancias' | 'esAgenteRetencionIVA' | 'esAgenteRetencionIIBB'
  > | null,
): boolean {
  if (config == null) return false
  if (tipo === 'ganancias') return config.esAgenteRetencionGanancias
  if (tipo === 'iva') return config.esAgenteRetencionIVA
  if (tipo === 'iibb') return config.esAgenteRetencionIIBB
  return false
}

function moneyString(value: number): string {
  return value.toFixed(2)
}

export type ProveedorPagoPreviewContext = {
  proveedor: Pick<Proveedor, 'condIva'>
  config: Pick<
    FiscalRetencionesConfig,
    'esAgenteRetencionGanancias' | 'esAgenteRetencionIVA' | 'esAgenteRetencionIIBB'
  > | null
  regimenes: RegimenRetencion[]
  montoBruto: number
}

/**
 * @en Suggested withholdings for supplier payment (#276; full rules in #229).
 * @es Retenciones sugeridas en pago a proveedor (#276; reglas completas en #229).
 * @pt-BR Retenções sugeridas em pagamento a fornecedor (#276; regras completas em #229).
 */
export function previewRetencionesProveedorPago(
  ctx: ProveedorPagoPreviewContext,
): RetencionPreviewLine[] {
  if (ctx.montoBruto <= 0) return []
  if (SKIP_COND_IVA.has(ctx.proveedor.condIva)) return []

  const lines: RetencionPreviewLine[] = []
  for (const regimen of ctx.regimenes) {
    if (!regimen.activo || regimen.subtipo !== 'retencion') continue
    if (!isAgentEnabledForTipo(regimen.tipo, ctx.config)) continue

    const alicuotaMin = regimen.alicuotaMin?.toNumber() ?? 0
    if (ctx.montoBruto < alicuotaMin) continue

    const alicuota = regimen.alicuota.toNumber()
    const importe = (ctx.montoBruto * alicuota) / 100
    if (importe <= 0) continue

    lines.push({
      regimenId: regimen.id,
      nombre: regimen.nombre,
      tipo: regimen.tipo,
      alicuota: regimen.alicuota.toString(),
      baseImponible: moneyString(ctx.montoBruto),
      importe: moneyString(importe),
    })
  }
  return lines
}

export function sumPreviewImportes(lines: RetencionPreviewLine[]): number {
  return lines.reduce((sum, line) => sum + Number.parseFloat(line.importe), 0)
}
