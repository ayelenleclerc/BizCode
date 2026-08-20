import { beforeEach, describe, expect, it, vi } from 'vitest'

const store = new Map<string, string>()

vi.mock('expo-secure-store', () => ({
  getItemAsync: vi.fn(async (key: string) => store.get(key) ?? null),
  setItemAsync: vi.fn(async (key: string, value: string) => {
    store.set(key, value)
  }),
  deleteItemAsync: vi.fn(async (key: string) => {
    store.delete(key)
  }),
}))

import { secureTokenStorage } from './secureTokenStorage'

describe('secureTokenStorage', () => {
  beforeEach(() => {
    store.clear()
  })

  it('stores access and refresh tokens in SecureStore keys (never AsyncStorage)', async () => {
    await secureTokenStorage.setTokens!({ accessToken: 'a1', refreshToken: 'r1' })
    await expect(secureTokenStorage.getAccessToken!()).resolves.toBe('a1')
    await expect(secureTokenStorage.getRefreshToken!()).resolves.toBe('r1')
    expect(store.has('bizcode_driver_access')).toBe(true)
    expect(store.has('bizcode_driver_refresh')).toBe(true)
  })

  it('clears both tokens', async () => {
    await secureTokenStorage.setTokens!({ accessToken: 'a1', refreshToken: 'r1' })
    await secureTokenStorage.clearTokens!()
    await expect(secureTokenStorage.getAccessToken!()).resolves.toBeNull()
    await expect(secureTokenStorage.getRefreshToken!()).resolves.toBeNull()
  })
})
