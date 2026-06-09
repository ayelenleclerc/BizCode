import type { FiscalRetencionesConfig, Proveedor, RegimenRetencion } from '@prisma/client'
import type { RetencionPreviewLine } from './retencionesPreviewStub'
import {
  SKIP_COND_IVA,
  buildPreviewLinesFromRegimens,
  sumPreviewImportes,
} from './retencionesArCommon'

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
 * @en Suggested withholdings for supplier payment (#276; shared rules in #229).
 * @es Retenciones sugeridas en pago a proveedor (#276; reglas compartidas en #229).
 * @pt-BR Retenções sugeridas em pagamento a fornecedor (#276; regras compartilhadas em #229).
 */
export function previewRetencionesProveedorPago(
  ctx: ProveedorPagoPreviewContext,
): RetencionPreviewLine[] {
  if (ctx.montoBruto <= 0) return []
  if (SKIP_COND_IVA.has(ctx.proveedor.condIva)) return []

  return buildPreviewLinesFromRegimens({
    config: ctx.config,
    regimenes: ctx.regimenes,
    subtipo: 'retencion',
    baseImponible: ctx.montoBruto,
    minBaseField: 'alicuotaMin',
  })
}

export { sumPreviewImportes }
