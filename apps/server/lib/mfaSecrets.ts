import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto'

const ALGO = 'aes-256-gcm'
const IV_LEN = 12

/**
 * @en Derives the AES-256 key for MFA TOTP secrets from BIZCODE_MFA_ENCRYPTION_KEY (dedicated; never reuse fiscal key).
 * @es Deriva la clave AES-256 para secretos TOTP MFA desde BIZCODE_MFA_ENCRYPTION_KEY (dedicada; no reutilizar la fiscal).
 * @pt-BR Deriva a chave AES-256 para segredos TOTP MFA de BIZCODE_MFA_ENCRYPTION_KEY (dedicada; não reutilizar a fiscal).
 */
function deriveMfaKey(): Buffer {
  const raw = process.env.BIZCODE_MFA_ENCRYPTION_KEY?.trim()
  if (!raw) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('BIZCODE_MFA_ENCRYPTION_KEY is required in production')
    }
    return createHash('sha256').update('bizcode-dev-mfa-key-not-for-production').digest()
  }
  return createHash('sha256').update(raw).digest()
}

/**
 * @en Encrypts a TOTP shared secret for DB storage (AES-256-GCM).
 * @es Cifra un secreto TOTP compartido para almacenamiento en BD (AES-256-GCM).
 * @pt-BR Cifra um segredo TOTP compartilhado para armazenamento no BD (AES-256-GCM).
 */
export function encryptMfaSecret(plain: string): string {
  const iv = randomBytes(IV_LEN)
  const cipher = createCipheriv(ALGO, deriveMfaKey(), iv)
  const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return Buffer.concat([iv, tag, enc]).toString('base64')
}

/**
 * @en Decrypts a value produced by `encryptMfaSecret`.
 * @es Descifra un valor producido por `encryptMfaSecret`.
 * @pt-BR Decifra um valor produzido por `encryptMfaSecret`.
 */
export function decryptMfaSecret(payload: string): string {
  const buf = Buffer.from(payload, 'base64')
  const iv = buf.subarray(0, IV_LEN)
  const tag = buf.subarray(IV_LEN, IV_LEN + 16)
  const data = buf.subarray(IV_LEN + 16)
  const decipher = createDecipheriv(ALGO, deriveMfaKey(), iv)
  decipher.setAuthTag(tag)
  return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8')
}
