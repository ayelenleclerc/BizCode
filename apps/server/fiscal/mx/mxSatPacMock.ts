/**
 * @en Homologación mock for Mexico SAT CFDI via PAC — no live PAC/SAT network calls (#210).
 * @es Mock de homologación para CFDI SAT de México vía PAC — sin llamadas de red PAC/SAT (#210).
 * @pt-BR Mock de homologação para CFDI SAT do México via PAC — sem chamadas de rede PAC/SAT (#210).
 */

import {
  isSatCfdiCancelReasonCode,
  type SatCfdiCancelReasonCode,
} from './satCatalogFixtures'

export type MxSatAuthSession = { token: string; sign: string; expiration: Date }

export type MxSatStampResult = {
  uuid: string
  authorizationCode: string
  authorizationExpiresAt: Date
  stampedAt: Date
}

export type MxSatCancelResult = {
  uuid: string
  reasonCode: SatCfdiCancelReasonCode
  cancelledAt: Date
}

export function mockMxSatAuthenticate(rfc: string): MxSatAuthSession {
  const expiration = new Date(Date.now() + 8 * 60 * 60 * 1000)
  return {
    token: `MOCK-PAC-TOKEN-${rfc}`,
    sign: 'MOCK-PAC-SIGN',
    expiration,
  }
}

/**
 * @en Deterministic UUID-like stamp id from document type + id (homologación only).
 * @es Id de timbre tipo UUID determinista a partir de tipo + id (solo homologación).
 * @pt-BR Id de timbre tipo UUID determinístico a partir de tipo + id (apenas homologação).
 */
export function mockMxSatStamp(documentType: 'invoice' | 'credit_note', documentId: number): MxSatStampResult {
  if (documentId < 1) throw new Error('MOCK_PAC_INVALID_DOCUMENT')
  const hex = documentId.toString(16).padStart(12, '0')
  const prefix = documentType === 'invoice' ? 'a1' : 'b2'
  const uuid = `${prefix}${hex.slice(0, 6)}-0000-4000-8000-${hex}`.toLowerCase()
  const stampedAt = new Date()
  const authorizationExpiresAt = new Date(stampedAt)
  authorizationExpiresAt.setFullYear(authorizationExpiresAt.getFullYear() + 1)
  return {
    uuid,
    authorizationCode: uuid.replace(/-/g, '').slice(0, 16).toUpperCase(),
    authorizationExpiresAt,
    stampedAt,
  }
}

export function mockMxSatCancel(
  uuid: string,
  reasonCode: string,
): MxSatCancelResult {
  if (!isSatCfdiCancelReasonCode(reasonCode)) {
    throw new Error('MOCK_PAC_INVALID_CANCEL_REASON')
  }
  if (!uuid || uuid.length < 8) {
    throw new Error('MOCK_PAC_INVALID_UUID')
  }
  return { uuid, reasonCode, cancelledAt: new Date() }
}
