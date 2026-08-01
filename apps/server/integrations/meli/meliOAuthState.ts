import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'
import { getAppConfig } from '../../config/env'

const STATE_TTL_MS = 10 * 60 * 1000
/** @en Stable salt for scrypt-derived OAuth state MAC key (#183). */
const STATE_MAC_SALT = 'bizcode-meli-oauth-state-v1'

export type MeliOAuthStatePayload = {
  tenantId: number
  userId: number
  nonce: string
  exp: number
}

/**
 * @en Derives a dedicated HMAC key for OAuth state (scrypt; not a password digest) (#183).
 * @es Deriva una clave HMAC dedicada para el state OAuth (scrypt; no es digest de contraseña) (#183).
 * @pt-BR Deriva uma chave HMAC dedicada para o state OAuth (scrypt; não é digest de senha) (#183).
 */
function meliOAuthStateMacKey(): Buffer {
  return scryptSync(getAppConfig().JWT_SECRET, STATE_MAC_SALT, 32)
}

/**
 * @en HMAC-SHA256 MAC over the OAuth state payload (#183).
 * @es MAC HMAC-SHA256 sobre el payload del state OAuth (#183).
 * @pt-BR MAC HMAC-SHA256 sobre o payload do state OAuth (#183).
 */
function macMeliOAuthState(encoded: string): string {
  return createHmac('sha256', meliOAuthStateMacKey()).update(encoded, 'utf8').digest('base64url')
}

/**
 * @en Signs a CSRF OAuth state bound to tenant and user (#183).
 * @es Firma un state OAuth CSRF ligado a tenant y usuario (#183).
 * @pt-BR Assina um state OAuth CSRF vinculado a tenant e usuário (#183).
 */
export function signMeliOAuthState(tenantId: number, userId: number): string {
  const payload: MeliOAuthStatePayload = {
    tenantId,
    userId,
    nonce: randomBytes(16).toString('hex'),
    exp: Date.now() + STATE_TTL_MS,
  }
  const encoded = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url')
  const sig = macMeliOAuthState(encoded)
  return `${encoded}.${sig}`
}

/**
 * @en Validates and decodes a signed Mercado Libre OAuth state (#183).
 * @es Valida y decodifica un state OAuth firmado de Mercado Libre (#183).
 * @pt-BR Valida e decodifica um state OAuth assinado do Mercado Livre (#183).
 */
export function verifyMeliOAuthState(state: string): MeliOAuthStatePayload | null {
  const parts = state.split('.')
  if (parts.length !== 2) return null
  const [encoded, sig] = parts
  if (!encoded || !sig) return null

  const expected = macMeliOAuthState(encoded)
  const a = Buffer.from(sig, 'utf8')
  const b = Buffer.from(expected, 'utf8')
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return null
  }

  try {
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as MeliOAuthStatePayload
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
