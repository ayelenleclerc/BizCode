/** @en Homologación WSFE mock — no AFIP network calls. */

export type ArcaTaResult = { token: string; sign: string; expiration: Date }
export type ArcaCaeResult = { cae: string; caeVto: Date }

const SUPPORTED_TIPOS = new Set(['A', 'B', 'C'])

export function isSupportedFacturaTipo(tipo: string): boolean {
  return SUPPORTED_TIPOS.has(tipo.toUpperCase())
}

export function mockRequestTa(cuit: string): ArcaTaResult {
  const expiration = new Date(Date.now() + 12 * 60 * 60 * 1000)
  return { token: `MOCK-TA-${cuit}`, sign: 'MOCK-SIGN', expiration }
}

export function mockRequestCae(
  facturaId: number,
  total: number,
  tipo: string,
): ArcaCaeResult {
  if (!isSupportedFacturaTipo(tipo)) {
    throw new Error('MOCK_WSFE_UNSUPPORTED_TIPO')
  }
  if (total < 0) {
    throw new Error('MOCK_WSFE_REJECT')
  }
  const cae = String(70000000000000 + facturaId).padStart(14, '0').slice(0, 14)
  const caeVto = new Date()
  caeVto.setDate(caeVto.getDate() + 10)
  return { cae, caeVto }
}
