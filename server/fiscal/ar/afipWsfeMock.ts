/** @en Homologación WSFE mock — no AFIP network calls. */

export type AfipTaResult = { token: string; sign: string; expiration: Date }
export type AfipCaeResult = { cae: string; caeVto: Date }

export function mockRequestTa(cuit: string): AfipTaResult {
  const expiration = new Date(Date.now() + 12 * 60 * 60 * 1000)
  return { token: `MOCK-TA-${cuit}`, sign: 'MOCK-SIGN', expiration }
}

export function mockRequestCae(facturaId: number, total: number): AfipCaeResult {
  const cae = String(70000000000000 + facturaId).padStart(14, '0').slice(0, 14)
  const caeVto = new Date()
  caeVto.setDate(caeVto.getDate() + 10)
  if (total < 0) throw new Error('MOCK_WSFE_REJECT')
  return { cae, caeVto }
}
