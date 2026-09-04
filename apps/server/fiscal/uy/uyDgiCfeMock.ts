/**
 * @en Homologación mock for Uruguay DGI CFE — no live DGI SOAP/REST network calls (#207).
 * @es Mock de homologación para CFE DGI de Uruguay — sin llamadas de red DGI SOAP/REST (#207).
 * @pt-BR Mock de homologação para CFE DGI do Uruguai — sem chamadas de rede DGI SOAP/REST (#207).
 */

export type UyDgiAuthSession = { token: string; sign: string; expiration: Date }

export type UyDgiAuthorizeResult = {
  cfeId: string
  authorizationCode: string
  authorizationExpiresAt: Date
  authorizedAt: Date
}

/**
 * @en Deterministic mock TA for a RUT emitter (homologación only).
 * @es TA mock determinista para un emisor RUT (solo homologación).
 * @pt-BR TA mock determinístico para um emissor RUT (apenas homologação).
 */
export function mockUyDgiAuthenticate(rut: string): UyDgiAuthSession {
  const cleaned = rut.replace(/[-.\s]/g, '')
  const expiration = new Date(Date.now() + 8 * 60 * 60 * 1000)
  return {
    token: `MOCK-DGI-TOKEN-${cleaned}`,
    sign: 'MOCK-DGI-SIGN',
    expiration,
  }
}

/**
 * @en Deterministic CFE-like authorization code from document type + id (homologación only).
 * @es Código de autorización tipo CFE determinista a partir de tipo + id (solo homologación).
 * @pt-BR Código de autorização tipo CFE determinístico a partir de tipo + id (apenas homologação).
 */
export function mockUyDgiAuthorize(
  documentType: 'invoice' | 'credit_note',
  documentId: number,
): UyDgiAuthorizeResult {
  if (documentId < 1) throw new Error('MOCK_DGI_INVALID_DOCUMENT')
  const prefix = documentType === 'invoice' ? 'CFE-EF' : 'CFE-NC'
  const cfeId = `${prefix}-${String(documentId).padStart(10, '0')}`
  const authorizationCode = `${prefix.replace('-', '')}${String(documentId).padStart(8, '0')}`.slice(0, 14)
  const authorizedAt = new Date()
  const authorizationExpiresAt = new Date(authorizedAt)
  authorizationExpiresAt.setFullYear(authorizationExpiresAt.getFullYear() + 1)
  return {
    cfeId,
    authorizationCode,
    authorizationExpiresAt,
    authorizedAt,
  }
}
