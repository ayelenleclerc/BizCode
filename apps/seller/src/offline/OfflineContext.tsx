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
import { getOfflineDb } from './db'
import { hydrateOfflineCache } from './hydrate'
import { localYmd } from './localYmd'
import { offlineMeta } from './meta'
import { subscribeNetwork, isOnline } from './network'
import { countOutbox } from './outbox'
import { flushOutbox } from './sync'
import { isCacheStale, type SyncStatus } from './types'

type OfflineContextValue = {
  online: boolean
  cacheDay: string | null
  pendingCount: number
  syncStatus: SyncStatus
  lastError: string | null
  hydrating: boolean
  refreshMeta: () => Promise<void>
  runHydrate: () => Promise<void>
  runSync: () => Promise<void>
}

const OfflineContext = createContext<OfflineContextValue | null>(null)

/**
 * @en Provides offline hydrate/sync lifecycle for authenticated App Seller sessions.
 * @es Proveee el ciclo hydrate/sync offline para sesiones autenticadas del App Seller.
 * @pt-BR Fornece o ciclo hydrate/sync offline para sessões autenticadas do App Seller.
 */
export function OfflineProvider({ children }: { children: ReactNode }) {
  const { status, claims } = useAuth()
  const [online, setOnline] = useState(true)
  const [cacheDay, setCacheDay] = useState<string | null>(offlineMeta.getCacheDay())
  const [pendingCount, setPendingCount] = useState(offlineMeta.getPendingCount())
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle')
  const [lastError, setLastError] = useState<string | null>(offlineMeta.getLastSyncError())
  const [hydrating, setHydrating] = useState(false)
  const syncingRef = useRef(false)
  const hydrateRef = useRef(false)

  const refreshMeta = useCallback(async () => {
    try {
      const db = await getOfflineDb()
      const count = await countOutbox(db)
      offlineMeta.setPendingCount(count)
      setPendingCount(count)
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
      await hydrateOfflineCache({
        fecha: localYmd(),
        vendedorId: claims?.userId,
      })
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
  }, [claims?.userId, refreshMeta, runSync])

  useEffect(() => {
    void isOnline().then(setOnline)
    return subscribeNetwork((next) => {
      setOnline(next)
    })
  }, [])

  useEffect(() => {
    if (status !== 'authenticated') return
    const today = localYmd()
    if (online && isCacheStale(offlineMeta.getCacheDay(), today)) {
      void runHydrate()
    } else if (online) {
      void runSync()
    }
  }, [status, online, runHydrate, runSync])

  useEffect(() => {
    if (status !== 'authenticated') return
    const onAppState = (next: AppStateStatus) => {
      if (next !== 'active') return
      const today = localYmd()
      if (isCacheStale(offlineMeta.getCacheDay(), today)) {
        void runHydrate()
      } else if (online) {
        void runSync()
      }
      void refreshMeta()
    }
    const sub = AppState.addEventListener('change', onAppState)
    return () => sub.remove()
  }, [status, online, runHydrate, runSync, refreshMeta])

  const value = useMemo<OfflineContextValue>(
    () => ({
      online,
      cacheDay,
      pendingCount,
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
