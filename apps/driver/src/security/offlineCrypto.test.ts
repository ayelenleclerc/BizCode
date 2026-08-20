import { webcrypto } from 'node:crypto'
import { beforeEach, describe, expect, it } from 'vitest'
import {
  bytesToHex,
  hexToBytes,
  openJson,
  sealJson,
  setActiveOfflineKeyBytes,
} from './offlineCrypto'

describe('offlineCrypto AES-GCM', () => {
  beforeEach(() => {
    if (!globalThis.crypto?.subtle) {
      Object.defineProperty(globalThis, 'crypto', { value: webcrypto, configurable: true })
    }
    setActiveOfflineKeyBytes(hexToBytes(bytesToHex(webcrypto.getRandomValues(new Uint8Array(32)))))
  })

  it('round-trips JSON payloads', async () => {
    const sealed = await sealJson({ cliente: 'Acme', telefono: '111' })
    expect(sealed.startsWith('enc:v1:')).toBe(true)
    await expect(openJson<{ cliente: string }>(sealed)).resolves.toEqual({
      cliente: 'Acme',
      telefono: '111',
    })
  })

  it('passes through legacy plaintext for wipe window', async () => {
    await expect(openJson<{ a: number }>('{"a":1}')).resolves.toEqual({ a: 1 })
  })
})
