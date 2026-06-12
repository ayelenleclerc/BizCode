import type { FiscalRetencionesConfig } from '@prisma/client'
import type { RetencionPreviewLine } from './retencionesPreviewStub'

export const SKIP_COND_IVA = new Set(['Mono', 'Exento', 'CF'])

export type FiscalAgentConfig = Pick<
  FiscalRetencionesConfig,
  'esAgenteRetencionGanancias' | 'esAgenteRetencionIVA' | 'esAgenteRetencionIIBB'
>

export function isAgentEnabledForTipo(tipo: string, config: FiscalAgentConfig | null): boolean {
  if (config == null) return false
  if (tipo === 'ganancias') return config.esAgenteRetencionGanancias
  if (tipo === 'iva') return config.esAgenteRetencionIVA
  if (tipo === 'iibb') return config.esAgenteRetencionIIBB
  return false
}

export function moneyString(value: number): string {
  return value.toFixed(2)
}

export function sumPreviewImportes(lines: RetencionPreviewLine[]): number {
  return lines.reduce((sum, line) => sum + Number.parseFloat(line.importe), 0)
}

type RegimenPreviewRow = {
  id: number
  tipo: string
  subtipo: string
  nombre: string
  alicuota: { toNumber(): number; toString(): string }
  alicuotaMin: { toNumber(): number } | null
  activo: boolean
}

/**
 * @en Builds preview lines from active regimens for a base amount (#229).
 * @es Arma líneas de preview desde regímenes activos para una base (#229).
 * @pt-BR Monta linhas de preview a partir de regimes ativos para uma base (#229).
 */
export function buildPreviewLinesFromRegimens(
  ctx: {
    config: FiscalAgentConfig | null
    regimenes: RegimenPreviewRow[]
    subtipo: 'retencion' | 'percepcion'
    baseImponible: number
    minBaseField: 'alicuotaMin' | 'baseImponible'
  },
): RetencionPreviewLine[] {
  if (ctx.baseImponible <= 0) return []

  const lines: RetencionPreviewLine[] = []
  for (const regimen of ctx.regimenes) {
    if (!regimen.activo || regimen.subtipo !== ctx.subtipo) continue
    if (!isAgentEnabledForTipo(regimen.tipo, ctx.config)) continue

    const alicuotaMin = regimen.alicuotaMin?.toNumber() ?? 0
    if (ctx.minBaseField === 'alicuotaMin' && ctx.baseImponible < alicuotaMin) continue

    const alicuota = regimen.alicuota.toNumber()
    const importe = (ctx.baseImponible * alicuota) / 100
    if (importe <= 0) continue

    lines.push({
      regimenId: regimen.id,
      nombre: regimen.nombre,
      tipo: regimen.tipo,
      alicuota: regimen.alicuota.toString(),
      baseImponible: moneyString(ctx.baseImponible),
      importe: moneyString(importe),
    })
  }
  return lines
}
