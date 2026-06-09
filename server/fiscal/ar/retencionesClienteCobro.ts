import type { Cliente, FiscalRetencionesConfig, RegimenRetencion } from '@prisma/client'
import type { RetencionPreviewLine } from './retencionesPreviewStub'
import { SKIP_COND_IVA, buildPreviewLinesFromRegimens } from './retencionesArCommon'

export type ClienteCobroPreviewContext = {
  cliente: Pick<Cliente, 'condIva'>
  config: Pick<
    FiscalRetencionesConfig,
    'esAgenteRetencionGanancias' | 'esAgenteRetencionIVA' | 'esAgenteRetencionIIBB'
  > | null
  regimenes: RegimenRetencion[]
  montoBruto: number
}

/**
 * @en Suggested withholdings when customer pays (buyer is withholding agent) (#229).
 * @es Retenciones sugeridas cuando el cliente paga (comprador agente de retención) (#229).
 * @pt-BR Retenções sugeridas quando o cliente paga (comprador agente de retenção) (#229).
 */
export function previewRetencionesClienteCobro(
  ctx: ClienteCobroPreviewContext,
): RetencionPreviewLine[] {
  if (ctx.montoBruto <= 0) return []
  if (SKIP_COND_IVA.has(ctx.cliente.condIva)) return []

  return buildPreviewLinesFromRegimens({
    config: ctx.config,
    regimenes: ctx.regimenes,
    subtipo: 'retencion',
    baseImponible: ctx.montoBruto,
    minBaseField: 'alicuotaMin',
  })
}
