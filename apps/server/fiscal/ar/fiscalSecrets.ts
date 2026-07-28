import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto'

const ALGO = 'aes-256-gcm'
const IV_LEN = 12
const DEV_FALLBACK_KEY = 'bizcode-dev-fiscal-key-not-for-production'

function deriveKey(): Buffer {
  const raw = process.env.BIZCODE_FISCAL_ENCRYPTION_KEY?.trim()
  if (!raw) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('BIZCODE_FISCAL_ENCRYPTION_KEY is required in production')
    }
    return createHash('sha256').update(DEV_FALLBACK_KEY).digest()
  }
  return createHash('sha256').update(raw).digest()
}

/** @en Encrypts AFIP certificate material for DB storage (AES-256-GCM). */
export function encryptFiscalSecret(plain: string): string {
  const iv = randomBytes(IV_LEN)
  const cipher = createCipheriv(ALGO, deriveKey(), iv)
  const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return Buffer.concat([iv, tag, enc]).toString('base64')
}

/** @en Decrypts a value produced by `encryptFiscalSecret`. */
export function decryptFiscalSecret(payload: string): string {
  const buf = Buffer.from(payload, 'base64')
  const iv = buf.subarray(0, IV_LEN)
  const tag = buf.subarray(IV_LEN, IV_LEN + 16)
  const data = buf.subarray(IV_LEN + 16)
  const decipher = createDecipheriv(ALGO, deriveKey(), iv)
  decipher.setAuthTag(tag)
  return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8')
}
