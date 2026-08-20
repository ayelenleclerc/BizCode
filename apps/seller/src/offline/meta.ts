import { Platform } from 'react-native'

type MetaStore = {
  getString: (key: string) => string | undefined
  set: (key: string, value: string | number) => void
  getNumber: (key: string) => number | undefined
}

const memory = new Map<string, string>()

const memoryStore: MetaStore = {
  getString: (key) => memory.get(key),
  set: (key, value) => {
    memory.set(key, String(value))
  },
  getNumber: (key) => {
    const raw = memory.get(key)
    if (raw == null) return undefined
    const n = Number(raw)
    return Number.isFinite(n) ? n : undefined
  },
}

let store: MetaStore = memoryStore
let boundEncrypted = false

/**
 * @en Resets MMKV binding (legacy wipe / tests).
 * @es Resetea el binding MMKV (wipe legado / tests).
 * @pt-BR Redefine o binding MMKV (wipe legado / tests).
 */
export function resetOfflineMetaStore(): void {
  memory.clear()
  store = memoryStore
  boundEncrypted = false
}

/**
 * @en Binds encrypted MMKV (id v2 + encryptionKey) once offline crypto is ready (#220).
 * @es Enlaza MMKV cifrado (id v2 + encryptionKey) cuando el crypto offline está listo (#220).
 * @pt-BR Liga MMKV cifrado (id v2 + encryptionKey) quando o crypto offline está pronto (#220).
 */
export function bindEncryptedMetaStore(mmkvId: string, encryptionKey: string): void {
  if (boundEncrypted && store !== memoryStore) return
  if (Platform.OS === 'web') {
    store = memoryStore
    boundEncrypted = true
    return
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- optional native; web/tests use memory
    const { createMMKV } = require('react-native-mmkv') as {
      createMMKV: (opts: { id: string; encryptionKey?: string }) => {
        getString: (k: string) => string | undefined
        set: (k: string, v: string | number | boolean) => void
        getNumber: (k: string) => number | undefined
      }
    }
    const mmkv = createMMKV({ id: mmkvId, encryptionKey })
    store = {
      getString: (k) => mmkv.getString(k),
      set: (k, v) => mmkv.set(k, v),
      getNumber: (k) => mmkv.getNumber(k),
    }
    boundEncrypted = true
  } catch {
    store = memoryStore
    boundEncrypted = true
  }
}

/**
 * @en Lazily returns meta store (memory until bindEncryptedMetaStore).
 * @es Devuelve el store meta (memoria hasta bindEncryptedMetaStore).
 * @pt-BR Retorna o store meta (memória até bindEncryptedMetaStore).
 */
function getStore(): MetaStore {
  return store
}

export const META_KEYS = {
  cacheDay: 'offline.cacheDay',
  lastHydrateAt: 'offline.lastHydrateAt',
  pendingCount: 'offline.pendingCount',
  lastSyncAt: 'offline.lastSyncAt',
  lastSyncError: 'offline.lastSyncError',
} as const

/**
 * @en Reads/writes offline cache metadata (encrypted MMKV with memory fallback).
 * @es Lee/escribe metadatos de cache offline (MMKV cifrado con fallback en memoria).
 * @pt-BR Lê/escreve metadados de cache offline (MMKV cifrado com fallback em memória).
 */
export const offlineMeta = {
  getString(key: string): string | null {
    return getStore().getString(key) ?? null
  },
  setString(key: string, value: string): void {
    getStore().set(key, value)
  },
  getCacheDay(): string | null {
    return getStore().getString(META_KEYS.cacheDay) ?? null
  },
  setCacheDay(day: string): void {
    getStore().set(META_KEYS.cacheDay, day)
  },
  getLastHydrateAt(): string | null {
    return getStore().getString(META_KEYS.lastHydrateAt) ?? null
  },
  setLastHydrateAt(iso: string): void {
    getStore().set(META_KEYS.lastHydrateAt, iso)
  },
  getPendingCount(): number {
    return getStore().getNumber(META_KEYS.pendingCount) ?? 0
  },
  setPendingCount(n: number): void {
    getStore().set(META_KEYS.pendingCount, Math.max(0, n))
  },
  getLastSyncError(): string | null {
    return getStore().getString(META_KEYS.lastSyncError) ?? null
  },
  setLastSyncError(message: string | null): void {
    getStore().set(META_KEYS.lastSyncError, message ?? '')
  },
  setLastSyncAt(iso: string): void {
    getStore().set(META_KEYS.lastSyncAt, iso)
  },
}
