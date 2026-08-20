import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { AppState, type AppStateStatus } from 'react-native'
import { useAuth } from '../auth/AuthContext'
import { ensureOfflineCryptoReady } from '../security/ensureOfflineCryptoReady'
import { getOfflineDb } from './db'
import { hydrateOfflineCache } from './hydrate'
import { localYmd } from './localYmd'
import { offlineMeta } from './meta'
import { subscribeNetwork, isOnline } from './network'
import { countOutbox, pendingItemIds } from './outbox'
import { flushOutbox } from './sync'
import { isCacheStale, type SyncStatus } from './types'

type OfflineContextValue = {
  online: boolean
  cacheDay: string | null
  pendingCount: number
  pendingStopIds: Set<number>
  syncStatus: SyncStatus
  lastError: string | null
  hydrating: boolean
  refreshMeta: () => Promise<void>
  runHydrate: () => Promise<void>
  runSync: () => Promise<void>
}

const OfflineContext = createContext<OfflineContextValue | null>(null)

/**
 * @en Provides offline hydrate/sync lifecycle for authenticated App Driver sessions (#164).
 * @es Provee el ciclo hydrate/sync offline para sesiones autenticadas del App Driver (#164).
 * @pt-BR Fornece o ciclo hydrate/sync offline para sessões autenticadas do App Driver (#164).
 */
export function OfflineProvider({ children }: { children: ReactNode }) {
  const { status } = useAuth()
  const [online, setOnline] = useState(true)
  const [cacheDay, setCacheDay] = useState<string | null>(offlineMeta.getCacheDay())
  const [pendingCount, setPendingCount] = useState(offlineMeta.getPendingCount())
  const [pendingStopIds, setPendingStopIds] = useState<Set<number>>(new Set())
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle')
  const [lastError, setLastError] = useState<string | null>(offlineMeta.getLastSyncError())
  const [hydrating, setHydrating] = useState(false)
  const syncingRef = useRef(false)
  const hydrateRef = useRef(false)

  const refreshMeta = useCallback(async () => {
    try {
      const db = await getOfflineDb()
      const count = await countOutbox(db)
      const ids = await pendingItemIds(db)
      offlineMeta.setPendingCount(count)
      setPendingCount(count)
      setPendingStopIds(ids)
    } catch {
      setPendingCount(offlineMeta.getPendingCount())
    }
    setCacheDay(offlineMeta.getCacheDay())
    const err = offlineMeta.getLastSyncError()
    setLastError(err && err.trim() !== '' ? err : null)
  }, [])

  const runSync = useCallback(async () => {
    if (syncingRef.current) return
    const net = await isOnline()
    if (!net) return
    syncingRef.current = true
    setSyncStatus('syncing')
    try {
      const result = await flushOutbox()
      setPendingCount(result.remaining)
      setLastError(result.lastError)
      setSyncStatus(result.lastError ? 'error' : 'ok')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'sync_failed'
      setLastError(message)
      setSyncStatus('error')
    } finally {
      syncingRef.current = false
      await refreshMeta()
    }
  }, [refreshMeta])

  const runHydrate = useCallback(async () => {
    if (hydrateRef.current) return
    const net = await isOnline()
    if (!net) return
    hydrateRef.current = true
    setHydrating(true)
    try {
      await hydrateOfflineCache({ fecha: localYmd() })
      setCacheDay(offlineMeta.getCacheDay())
      await runSync()
    } catch (err) {
      setLastError(err instanceof Error ? err.message : 'hydrate_failed')
      setSyncStatus('error')
    } finally {
      hydrateRef.current = false
      setHydrating(false)
      await refreshMeta()
    }
  }, [refreshMeta, runSync])

  useEffect(() => {
    void isOnline().then(setOnline)
    return subscribeNetwork((next) => {
      setOnline(next)
    })
  }, [])

  useEffect(() => {
    if (status !== 'authenticated') return
    let cancelled = false
    void (async () => {
      await ensureOfflineCryptoReady()
      if (cancelled) return
      await refreshMeta()
      const today = localYmd()
      if (online && isCacheStale(offlineMeta.getCacheDay(), today)) {
        await runHydrate()
      } else if (online) {
        await runSync()
      }
    })()
    return () => {
      cancelled = true
    }
  }, [status, online, runHydrate, runSync, refreshMeta])

  useEffect(() => {
    if (status !== 'authenticated') return
    const onAppState = (next: AppStateStatus) => {
      if (next !== 'active') return
      void (async () => {
        await ensureOfflineCryptoReady()
        const today = localYmd()
        if (isCacheStale(offlineMeta.getCacheDay(), today)) {
          await runHydrate()
        } else if (online) {
          await runSync()
        }
        await refreshMeta()
      })()
    }
    const sub = AppState.addEventListener('change', onAppState)
    return () => sub.remove()
  }, [status, online, runHydrate, runSync, refreshMeta])

  const value = useMemo<OfflineContextValue>(
    () => ({
      online,
      cacheDay,
      pendingCount,
      pendingStopIds,
      syncStatus,
      lastError,
      hydrating,
      refreshMeta,
      runHydrate,
      runSync,
    }),
    [
      online,
      cacheDay,
      pendingCount,
      pendingStopIds,
      syncStatus,
      lastError,
      hydrating,
      refreshMeta,
      runHydrate,
      runSync,
    ],
  )

  return <OfflineContext.Provider value={value}>{children}</OfflineContext.Provider>
}

export function useOffline(): OfflineContextValue {
  const ctx = useContext(OfflineContext)
  if (!ctx) {
    throw new Error('useOffline must be used within OfflineProvider')
  }
  return ctx
}
