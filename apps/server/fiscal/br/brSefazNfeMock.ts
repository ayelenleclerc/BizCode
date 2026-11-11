/**
 * @en Homologación mock for Brazil SEFAZ NF-e — no live SEFAZ SOAP/REST network calls (#211).
 * @es Mock de homologación para NF-e SEFAZ Brasil — sin llamadas de red SEFAZ SOAP/REST (#211).
 * @pt-BR Mock de homologação para NF-e SEFAZ Brasil — sem chamadas de rede SEFAZ SOAP/REST (#211).
 */

export type BrSefazAuthSession = { token: string; sign: string; expiration: Date }

export type BrSefazAuthorizeResult = {
  nfeId: string
  authorizationCode: string
  authorizationExpiresAt: Date
  authorizedAt: Date
}

/**
 * @en Deterministic mock session for a Brazilian CNPJ emitter (homologación only).
 * @es Sesión mock determinista para un emisor CNPJ brasileño (solo homologación).
 * @pt-BR Sessão mock determinística para um emissor CNPJ brasileiro (apenas homologação).
 */
export function mockBrSefazAuthenticate(cnpj: string): BrSefazAuthSession {
  const cleaned = cnpj.replace(/\D/g, '')
  const expiration = new Date(Date.now() + 8 * 60 * 60 * 1000)
  return {
    token: `MOCK-SEFAZ-TOKEN-${cleaned}`,
    sign: 'MOCK-SEFAZ-SIGN',
    expiration,
  }
}

/**
 * @en Deterministic NF-e-like authorization code from document type + id (homologación only).
 *   Product-model prefixes mirror issue #211 model 55 (NF-e) and devolução (credit note).
 * @es Código de autorización tipo NF-e determinista a partir de tipo + id (solo homologación).
 *   Prefijos del modelo de producto reflejan el modelo 55 / devolução del issue #211.
 * @pt-BR Código de autorização tipo NF-e determinístico a partir de tipo + id (apenas homologação).
 *   Prefixos do modelo de produto refletem o modelo 55 / devolução do issue #211.
 */
export function mockBrSefazAuthorize(
  documentType: 'invoice' | 'credit_note',
  documentId: number,
): BrSefazAuthorizeResult {
  if (documentId < 1) throw new Error('MOCK_SEFAZ_INVALID_DOCUMENT')
  const prefix = documentType === 'invoice' ? 'NFe-55' : 'NFe-DEV'
  const nfeId = `${prefix}-${String(documentId).padStart(10, '0')}`
  const authorizationCode = `${prefix.replace('-', '')}${String(documentId).padStart(8, '0')}`.slice(0, 14)
  const authorizedAt = new Date()
  const authorizationExpiresAt = new Date(authorizedAt)
  authorizationExpiresAt.setFullYear(authorizationExpiresAt.getFullYear() + 1)
  return {
    nfeId,
    authorizationCode,
    authorizationExpiresAt,
    authorizedAt,
  }
}
