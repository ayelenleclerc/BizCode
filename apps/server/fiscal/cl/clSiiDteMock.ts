/**
 * @en Homologación mock for Chile SII DTE — no live SII SOAP/REST/XML network calls (#208).
 * @es Mock de homologación para DTE SII de Chile — sin llamadas de red SII SOAP/REST/XML (#208).
 * @pt-BR Mock de homologação para DTE SII do Chile — sem chamadas de rede SII SOAP/REST/XML (#208).
 */

export type ClSiiAuthSession = { token: string; sign: string; expiration: Date }

export type ClSiiAuthorizeResult = {
  dteId: string
  authorizationCode: string
  authorizationExpiresAt: Date
  authorizedAt: Date
}

/**
 * @en Deterministic mock TA for a Chilean RUT emitter (homologación only).
 * @es TA mock determinista para un emisor RUT chileno (solo homologación).
 * @pt-BR TA mock determinístico para um emissor RUT chileno (apenas homologação).
 */
export function mockClSiiAuthenticate(rut: string): ClSiiAuthSession {
  const cleaned = rut.replace(/[-.\s]/g, '').toUpperCase()
  const expiration = new Date(Date.now() + 8 * 60 * 60 * 1000)
  return {
    token: `MOCK-SII-TOKEN-${cleaned}`,
    sign: 'MOCK-SII-SIGN',
    expiration,
  }
}

/**
 * @en Deterministic DTE-like authorization code from document type + id (homologación only).
 *   Product-model prefixes mirror issue #208 AC types 33 (factura afecta) and 61 (nota de crédito).
 * @es Código de autorización tipo DTE determinista a partir de tipo + id (solo homologación).
 *   Prefijos del modelo de producto reflejan los tipos 33 / 61 del AC del issue #208.
 * @pt-BR Código de autorização tipo DTE determinístico a partir de tipo + id (apenas homologação).
 *   Prefixos do modelo de produto refletem os tipos 33 / 61 do AC do issue #208.
 */
export function mockClSiiAuthorize(
  documentType: 'invoice' | 'credit_note',
  documentId: number,
): ClSiiAuthorizeResult {
  if (documentId < 1) throw new Error('MOCK_SII_INVALID_DOCUMENT')
  const prefix = documentType === 'invoice' ? 'DTE-33' : 'DTE-61'
  const dteId = `${prefix}-${String(documentId).padStart(10, '0')}`
  const authorizationCode = `${prefix.replace('-', '')}${String(documentId).padStart(8, '0')}`.slice(0, 14)
  const authorizedAt = new Date()
  const authorizationExpiresAt = new Date(authorizedAt)
  authorizationExpiresAt.setFullYear(authorizationExpiresAt.getFullYear() + 1)
  return {
    dteId,
    authorizationCode,
    authorizationExpiresAt,
    authorizedAt,
  }
}
