/**
 * @en FCEM MiPyME (Ley 27440) detection + local acceptance states (#239). Live WSFECM Not evidenced.
 * @es Detección FCEM MiPyME (Ley 27440) + estados locales de aceptación (#239). WSFECM live no evidenciado.
 * @pt-BR Detecção FCEM MiPyME (Lei 27440) + estados locais de aceitação (#239). WSFECM live não evidenciado.
 */

/** @en Default ARS threshold when ParamEmpresa.fcemUmbralMonto is null — configurable; official AFIP table Not evidenced as auto-updated. */
export const FCEM_DEFAULT_UMBRAL_ARS = 598_228

/** @en Minimum payment term (days) that triggers FCEM when other rules match (#239). */
export const FCEM_MIN_PLAZO_PAGO_DIAS = 31

export const FCEM_ESTADOS = [
  'pendiente_aceptacion',
  'aceptada',
  'rechazada_por_receptor',
  'aceptada_tacita',
] as const

export type FcemEstado = (typeof FCEM_ESTADOS)[number]

/** @en AFIP FCEM voucher type codes for FC letter A/B/C (issue #239). */
export const FCEM_TIPO_CBTE_BY_LETTER: Readonly<Record<'A' | 'B' | 'C', number>> = {
  A: 201,
  B: 206,
  C: 211,
}

export type FcemDetectionInput = {
  esMipyme: boolean
  clienteCondIva: string
  facturaTipo: string
  facturaTotal: number
  plazoPagoDias: number
  umbralMonto: number | null
}

export type FcemDetectionResult = {
  required: boolean
  reasons: string[]
  umbralAplicado: number
  fcemTipoCbte: number | null
}

/**
 * @en Pure FCEM requirement check (issuer MiPyME, buyer RI, amount ≥ threshold, term ≥ 31 days, tipo A/B/C).
 * @es Chequeo puro de obligatoriedad FCEM (emisor MiPyME, comprador RI, monto ≥ umbral, plazo ≥ 31 días, tipo A/B/C).
 * @pt-BR Verificação pura de obrigatoriedade FCEM (emitente MiPyME, comprador RI, valor ≥ limiar, prazo ≥ 31 dias, tipo A/B/C).
 */
export function evaluateFcemRequirement(input: FcemDetectionInput): FcemDetectionResult {
  const umbralAplicado =
    input.umbralMonto !== null && Number.isFinite(input.umbralMonto) && input.umbralMonto > 0
      ? input.umbralMonto
      : FCEM_DEFAULT_UMBRAL_ARS

  const reasons: string[] = []
  const letter = input.facturaTipo.trim().toUpperCase()
  const fcemTipoCbte =
    letter === 'A' || letter === 'B' || letter === 'C' ? FCEM_TIPO_CBTE_BY_LETTER[letter] : null

  if (!input.esMipyme) reasons.push('issuer_not_mipyme')
  if (input.clienteCondIva.trim().toUpperCase() !== 'RI') reasons.push('buyer_not_ri')
  if (fcemTipoCbte === null) reasons.push('unsupported_tipo')
  if (!(input.facturaTotal >= umbralAplicado)) reasons.push('below_threshold')
  if (!(input.plazoPagoDias >= FCEM_MIN_PLAZO_PAGO_DIAS)) reasons.push('plazo_too_short')

  return {
    required: reasons.length === 0,
    reasons,
    umbralAplicado,
    fcemTipoCbte,
  }
}

export function isFcemEstado(value: string | null | undefined): value is FcemEstado {
  return value != null && (FCEM_ESTADOS as readonly string[]).includes(value)
}
