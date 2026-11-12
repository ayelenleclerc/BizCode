/**
 * @en Homologación WSFECM mock — no AFIP network calls (#239). Live WSFECM Not evidenced.
 * @es Mock de homologación WSFECM — sin llamadas de red a AFIP (#239). WSFECM live no evidenciado.
 * @pt-BR Mock de homologação WSFECM — sem chamadas de rede à AFIP (#239). WSFECM live não evidenciado.
 */

export type WsfecmCaeResult = {
  cae: string
  caeVto: Date
  fcemTipoCbte: number
}

const SUPPORTED_FCEM_TIPOS = new Set([201, 206, 211])

/**
 * @en Issues a synthetic FCEM CAE for supported voucher types 201/206/211.
 * @es Emite un CAE FCEM sintético para tipos de comprobante 201/206/211.
 * @pt-BR Emite um CAE FCEM sintético para tipos de comprovante 201/206/211.
 */
export function mockRequestFcemCae(
  facturaId: number,
  total: number,
  fcemTipoCbte: number,
): WsfecmCaeResult {
  if (!SUPPORTED_FCEM_TIPOS.has(fcemTipoCbte)) {
    throw new Error('MOCK_WSFECM_UNSUPPORTED_TIPO')
  }
  if (total < 0) {
    throw new Error('MOCK_WSFECM_REJECT')
  }
  const cae = String(71000000000000 + facturaId).padStart(14, '0').slice(0, 14)
  const caeVto = new Date()
  caeVto.setDate(caeVto.getDate() + 10)
  return { cae, caeVto, fcemTipoCbte }
}

export function isSupportedFcemTipoCbte(tipo: number): boolean {
  return SUPPORTED_FCEM_TIPOS.has(tipo)
}
