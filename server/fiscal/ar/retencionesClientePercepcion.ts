import type { Cliente, FiscalRetencionesConfig, RegimenRetencion } from '@prisma/client'
import type { RetencionPreviewLine } from './retencionesPreviewStub'
import { SKIP_COND_IVA, buildPreviewLinesFromRegimens } from './retencionesArCommon'

export type ClientePercepcionPreviewContext = {
  cliente: Pick<Cliente, 'condIva'>
  config: Pick<
    FiscalRetencionesConfig,
    'esAgenteRetencionGanancias' | 'esAgenteRetencionIVA' | 'esAgenteRetencionIIBB'
  > | null
  regimenes: RegimenRetencion[]
  neto1: number
  neto2: number
  neto3: number
}

/**
 * @en Suggested perceptions when issuing invoice to customer (#229).
 * @es Percepciones sugeridas al emitir factura a cliente (#229).
 * @pt-BR Percepções sugeridas ao emitir fatura a cliente (#229).
 */
export function previewPercepcionesClienteFactura(
  ctx: ClientePercepcionPreviewContext,
): RetencionPreviewLine[] {
  if (SKIP_COND_IVA.has(ctx.cliente.condIva)) return []

  const baseImponible = ctx.neto1 + ctx.neto2 + ctx.neto3
  return buildPreviewLinesFromRegimens({
    config: ctx.config,
    regimenes: ctx.regimenes,
    subtipo: 'percepcion',
    baseImponible,
    minBaseField: 'alicuotaMin',
  })
}
