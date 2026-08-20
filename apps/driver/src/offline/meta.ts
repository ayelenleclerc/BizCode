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

/**
 * @en Lazily binds MMKV when native module is available; otherwise in-memory meta.
 * @es Enlaza MMKV si el módulo nativo existe; si no, meta en memoria.
 * @pt-BR Liga MMKV se o módulo nativo existir; senão, meta em memória.
 */
function getStore(): MetaStore {
  if (store !== memoryStore) return store
  if (Platform.OS === 'web') return memoryStore
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- optional native; web/tests use memory
    const { createMMKV } = require('react-native-mmkv') as {
      createMMKV: (opts: { id: string }) => {
        getString: (k: string) => string | undefined
        set: (k: string, v: string | number | boolean) => void
        getNumber: (k: string) => number | undefined
      }
    }
    const mmkv = createMMKV({ id: 'bizcode-driver-offline' })
    store = {
      getString: (k) => mmkv.getString(k),
      set: (k, v) => mmkv.set(k, v),
      getNumber: (k) => mmkv.getNumber(k),
    }
    return store
  } catch {
    return memoryStore
  }
}

export const META_KEYS = {
  cacheDay: 'offline.cacheDay',
  lastHydrateAt: 'offline.lastHydrateAt',
  pendingCount: 'offline.pendingCount',
  lastSyncAt: 'offline.lastSyncAt',
  lastSyncError: 'offline.lastSyncError',
} as const

/**
 * @en Reads/writes offline cache metadata (MMKV with memory fallback).
 * @es Lee/escribe metadatos de cache offline (MMKV con fallback en memoria).
 * @pt-BR Lê/escreve metadados de cache offline (MMKV com fallback em memória).
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
