/**
 * @en AES-256-GCM helpers for PostgreSQL backup blobs (iv + tag + ciphertext).
 * @es Cifrado AES-256-GCM para blobs de backup PostgreSQL (iv + tag + ciphertext).
 * @pt-BR Criptografia AES-256-GCM para blobs de backup PostgreSQL (iv + tag + ciphertext).
 */
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto'

const ALGO = 'aes-256-gcm'
const IV_LEN = 12
const TAG_LEN = 16
/** @en Magic prefix so restore can reject non-BizCode files early. */
export const BACKUP_MAGIC = Buffer.from('BCBK1', 'ascii')

/**
 * @en Derives a 32-byte key from BACKUP_ENCRYPTION_KEY (required; never logged).
 * @es Deriva clave de 32 bytes desde BACKUP_ENCRYPTION_KEY (obligatoria; nunca en logs).
 * @pt-BR Deriva chave de 32 bytes a partir de BACKUP_ENCRYPTION_KEY (obrigatória; nunca em logs).
 */
export function deriveBackupKey(rawKey: string): Buffer {
  const trimmed = rawKey.trim()
  if (!trimmed) {
    throw new Error('BACKUP_ENCRYPTION_KEY is required and must be non-empty')
  }
  return createHash('sha256').update(trimmed).digest()
}

/**
 * @en Encrypts a buffer; output = magic + iv + authTag + ciphertext.
 * @es Cifra un buffer; salida = magic + iv + authTag + ciphertext.
 * @pt-BR Criptografa um buffer; saída = magic + iv + authTag + ciphertext.
 */
export function encryptBackupBlob(plain: Buffer, rawKey: string): Buffer {
  const key = deriveBackupKey(rawKey)
  const iv = randomBytes(IV_LEN)
  const cipher = createCipheriv(ALGO, key, iv)
  const enc = Buffer.concat([cipher.update(plain), cipher.final()])
  const tag = cipher.getAuthTag()
  return Buffer.concat([BACKUP_MAGIC, iv, tag, enc])
}

/**
 * @en Decrypts a buffer produced by encryptBackupBlob.
 * @es Descifra un buffer producido por encryptBackupBlob.
 * @pt-BR Descriptografa um buffer produzido por encryptBackupBlob.
 */
export function decryptBackupBlob(payload: Buffer, rawKey: string): Buffer {
  if (payload.length < BACKUP_MAGIC.length + IV_LEN + TAG_LEN + 1) {
    throw new Error('Backup payload too short or corrupt')
  }
  if (!payload.subarray(0, BACKUP_MAGIC.length).equals(BACKUP_MAGIC)) {
    throw new Error('Backup payload missing BCBK1 magic (not a BizCode encrypted backup)')
  }
  const key = deriveBackupKey(rawKey)
  let offset = BACKUP_MAGIC.length
  const iv = payload.subarray(offset, offset + IV_LEN)
  offset += IV_LEN
  const tag = payload.subarray(offset, offset + TAG_LEN)
  offset += TAG_LEN
  const data = payload.subarray(offset)
  const decipher = createDecipheriv(ALGO, key, iv)
  decipher.setAuthTag(tag)
  return Buffer.concat([decipher.update(data), decipher.final()])
}
