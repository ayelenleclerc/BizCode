const SEAL_PREFIX = 'enc:v1:'

/**
 * @en AES-256-GCM seal/open for offline SQLite JSON payloads (#220). Key from SecureStore via ensureOfflineCryptoReady.
 * @es Cifrado AES-256-GCM de payloads JSON offline (#220). Clave en SecureStore vía ensureOfflineCryptoReady.
 * @pt-BR Cifra AES-256-GCM de payloads JSON offline (#220). Chave no SecureStore via ensureOfflineCryptoReady.
 */

function getSubtle(): SubtleCrypto {
  const subtle = globalThis.crypto?.subtle
  if (!subtle) {
    throw new Error('Web Crypto SubtleCrypto is not available')
  }
  return subtle
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]!)
  }
  return btoa(binary)
}

function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64)
  const out = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) {
    out[i] = binary.charCodeAt(i)
  }
  return out
}

export function hexToBytes(hex: string): Uint8Array {
  const clean = hex.trim().toLowerCase()
  if (clean.length % 2 !== 0) {
    throw new Error('Invalid hex key length')
  }
  const out = new Uint8Array(clean.length / 2)
  for (let i = 0; i < out.length; i += 1) {
    out[i] = Number.parseInt(clean.slice(i * 2, i * 2 + 2), 16)
  }
  return out
}

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

let activeKeyBytes: Uint8Array | null = null

/**
 * @en Sets the in-memory AES key used by seal/open (tests + ensureOfflineCryptoReady).
 * @es Fija la clave AES en memoria usada por seal/open (tests + ensureOfflineCryptoReady).
 * @pt-BR Define a chave AES em memória usada por seal/open (tests + ensureOfflineCryptoReady).
 */
export function setActiveOfflineKeyBytes(key: Uint8Array | null): void {
  activeKeyBytes = key
}

export function getActiveOfflineKeyBytes(): Uint8Array {
  if (!activeKeyBytes || activeKeyBytes.byteLength !== 32) {
    throw new Error('Offline encryption key is not ready')
  }
  return activeKeyBytes
}

export async function sealUtf8(plain: string): Promise<string> {
  const keyBytes = getActiveOfflineKeyBytes()
  const subtle = getSubtle()
  const iv = globalThis.crypto.getRandomValues(new Uint8Array(12))
  const key = await subtle.importKey(
    'raw',
    keyBytes.buffer.slice(keyBytes.byteOffset, keyBytes.byteOffset + keyBytes.byteLength) as ArrayBuffer,
    'AES-GCM',
    false,
    ['encrypt'],
  )
  const cipherBuf = await subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(plain),
  )
  const cipher = new Uint8Array(cipherBuf)
  const combined = new Uint8Array(iv.length + cipher.length)
  combined.set(iv, 0)
  combined.set(cipher, iv.length)
  return `${SEAL_PREFIX}${bytesToBase64(combined)}`
}

export async function openUtf8(stored: string): Promise<string> {
  if (!stored.startsWith(SEAL_PREFIX)) {
    return stored
  }
  const keyBytes = getActiveOfflineKeyBytes()
  const subtle = getSubtle()
  const combined = base64ToBytes(stored.slice(SEAL_PREFIX.length))
  if (combined.length < 13) {
    throw new Error('Invalid sealed payload')
  }
  const iv = combined.slice(0, 12)
  const cipher = combined.slice(12)
  const key = await subtle.importKey(
    'raw',
    keyBytes.buffer.slice(keyBytes.byteOffset, keyBytes.byteOffset + keyBytes.byteLength) as ArrayBuffer,
    'AES-GCM',
    false,
    ['decrypt'],
  )
  const plainBuf = await subtle.decrypt({ name: 'AES-GCM', iv }, key, cipher)
  return new TextDecoder().decode(plainBuf)
}

export async function sealJson(value: unknown): Promise<string> {
  return sealUtf8(JSON.stringify(value))
}

export async function openJson<T>(stored: string): Promise<T> {
  return JSON.parse(await openUtf8(stored)) as T
}
