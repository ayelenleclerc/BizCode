import { randomBytes } from 'node:crypto'
import { decryptFiscalSecret, encryptFiscalSecret } from '../../fiscal/ar/fiscalSecrets'

const STATE_TTL_MS = 10 * 60 * 1000

export type MeliOAuthStatePayload = {
  tenantId: number
  userId: number
  nonce: string
  exp: number
}

/**
 * @en Builds an encrypted CSRF OAuth state bound to tenant and user (#183).
 * @es Construye un state OAuth CSRF cifrado ligado a tenant y usuario (#183).
 * @pt-BR Monta um state OAuth CSRF cifrado vinculado a tenant e usuário (#183).
 */
export function signMeliOAuthState(tenantId: number, userId: number): string {
  const payload: MeliOAuthStatePayload = {
    tenantId,
    userId,
    nonce: randomBytes(16).toString('hex'),
    exp: Date.now() + STATE_TTL_MS,
  }
  // AES-GCM via fiscal secret helper — integrity + confidentiality without password-hash primitives.
  return encryptFiscalSecret(JSON.stringify(payload))
}

/**
 * @en Decrypts and validates a Mercado Libre OAuth state (#183).
 * @es Descifra y valida un state OAuth de Mercado Libre (#183).
 * @pt-BR Descriptografa e valida um state OAuth do Mercado Livre (#183).
 */
export function verifyMeliOAuthState(state: string): MeliOAuthStatePayload | null {
  try {
    const payload = JSON.parse(decryptFiscalSecret(state)) as MeliOAuthStatePayload
    if (
      !Number.isInteger(payload.tenantId) ||
      !Number.isInteger(payload.userId) ||
      typeof payload.nonce !== 'string' ||
      typeof payload.exp !== 'number'
    ) {
      return null
    }
    if (payload.exp < Date.now()) {
      return null
    }
    return payload
  } catch {
    return null
  }
}
