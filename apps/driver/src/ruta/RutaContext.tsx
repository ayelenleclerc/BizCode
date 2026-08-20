import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { DevolucionEntregaRegisterInput, MotivoNoEntrega, Reparto, RepartoItemRow } from '@bizcode/types'
import { driverRepartosApi } from '../api/driverApi'
import { mapApiErrorToUiState, type UiLoadState } from '../lib/apiErrors'
import {
  enqueueDevolucionRegister,
  enqueuePodDelivered,
  enqueuePodNotDelivered,
} from '../offline/actions'
import { getOfflineDb } from '../offline/db'
import { hydrateOfflineCache } from '../offline/hydrate'
import { isOnline } from '../offline/network'
import { useOffline } from '../offline/OfflineContext'
import { loadRepartoCache, saveRepartoCache } from '../offline/repos'
import { localYmd } from '../offline/localYmd'
import type { DeliveredPodFields } from './pod/podValidation'

type RutaContextValue = {
  status: UiLoadState
  error: string | null
  reparto: Reparto | null
  load: () => Promise<void>
  patchItem: (itemId: number, next: RepartoItemRow) => void
  markNotDelivered: (itemId: number, motivo: MotivoNoEntrega) => Promise<void>
  markDelivered: (itemId: number, input: DeliveredPodFields) => Promise<void>
  registerDevolucion: (itemId: number, input: DevolucionEntregaRegisterInput) => Promise<void>
}

const RutaContext = createContext<RutaContextValue | null>(null)

/**
 * @en Day-route state: load mi-reparto (online or SQLite cache) and queue POD/returns when offline (#160/#164).
 * @es Estado de ruta: carga mi-reparto (online o cache SQLite) y encola POD/devoluciones si está offline (#160/#164).
 * @pt-BR Estado da rota: carrega mi-reparto (online ou cache SQLite) e enfileira POD/devoluções offline (#160/#164).
 */
export function RutaProvider({ children }: { children: ReactNode }) {
  const { refreshMeta } = useOffline()
  const [status, setStatus] = useState<UiLoadState>('idle')
  const [error, setError] = useState<string | null>(null)
  const [reparto, setReparto] = useState<Reparto | null>(null)

  const load = useCallback(async () => {
    setStatus('loading')
    setError(null)
    const online = await isOnline()
    try {
      if (online) {
        const data = await driverRepartosApi.getMiReparto({ fecha: localYmd() })
        const db = await getOfflineDb()
        await saveRepartoCache(db, data ?? null)
        if (!data || data.items.length === 0) {
          setReparto(data ?? null)
          setStatus('empty')
          return
        }
        setReparto(data)
        setStatus('success')
        return
      }
      const db = await getOfflineDb()
      const cached = await loadRepartoCache(db)
      if (!cached || cached.items.length === 0) {
        setReparto(cached)
        setStatus(cached ? 'empty' : 'offline')
        return
      }
      setReparto(cached)
      setStatus('success')
    } catch (err) {
      try {
        const db = await getOfflineDb()
        const cached = await loadRepartoCache(db)
        if (cached && cached.items.length > 0) {
          setReparto(cached)
          setStatus('success')
          return
        }
      } catch {
        // fall through to mapped error
      }
      const next = mapApiErrorToUiState(err)
      setReparto(null)
      setStatus(next === 'not_found' ? 'empty' : next)
      setError(err instanceof Error ? err.message : 'LOAD_FAILED')
    }
  }, [])

  const patchItem = useCallback((itemId: number, next: RepartoItemRow) => {
    setReparto((prev) => {
      if (!prev) return prev
      const items = prev.items.map((item) => (item.id === itemId ? next : item))
      const delivered = items.filter((i) => i.estado === 'delivered').length
      const pending = items.filter((i) => i.estado === 'pending').length
      return { ...prev, items, progress: { total: items.length, delivered, pending } }
    })
  }, [])

  const markNotDelivered = useCallback(
    async (itemId: number, motivo: MotivoNoEntrega) => {
      if (!reparto) return
      const online = await isOnline()
      if (!online) {
        const updated = await enqueuePodNotDelivered(itemId, motivo)
        patchItem(itemId, updated)
        await refreshMeta()
        return
      }
      const updated = await driverRepartosApi.updateItemPod(reparto.id, itemId, {
        outcome: 'not_delivered',
        motivoNoEntrega: motivo,
      })
      if (updated) {
        patchItem(itemId, updated)
        const db = await getOfflineDb()
        await saveRepartoCache(db, {
          ...reparto,
          items: reparto.items.map((item) => (item.id === itemId ? updated : item)),
        })
      }
    },
    [patchItem, refreshMeta, reparto],
  )

  const markDelivered = useCallback(
    async (itemId: number, input: DeliveredPodFields) => {
      if (!reparto) return
      const online = await isOnline()
      if (!online) {
        const updated = await enqueuePodDelivered(itemId, input)
        patchItem(itemId, updated)
        await refreshMeta()
        return
      }
      const updated = await driverRepartosApi.updateItemPod(reparto.id, itemId, {
        outcome: 'delivered',
        ...input,
      })
      if (updated) {
        patchItem(itemId, updated)
      }
    },
    [patchItem, refreshMeta, reparto],
  )

  const registerDevolucion = useCallback(
    async (itemId: number, input: DevolucionEntregaRegisterInput) => {
      if (!reparto) return
      const online = await isOnline()
      if (!online) {
        await enqueueDevolucionRegister(itemId, input)
        await refreshMeta()
        const db = await getOfflineDb()
        const cached = await loadRepartoCache(db)
        if (cached) setReparto(cached)
        return
      }
      await driverRepartosApi.registerDevolucion(reparto.id, itemId, input)
      await hydrateOfflineCache({ fecha: localYmd() })
      await load()
    },
    [load, refreshMeta, reparto],
  )

  const value = useMemo(
    () => ({
      status,
      error,
      reparto,
      load,
      patchItem,
      markNotDelivered,
      markDelivered,
      registerDevolucion,
    }),
    [status, error, reparto, load, patchItem, markNotDelivered, markDelivered, registerDevolucion],
  )

  return <RutaContext.Provider value={value}>{children}</RutaContext.Provider>
}

export function useRuta(): RutaContextValue {
  const ctx = useContext(RutaContext)
  if (!ctx) {
    throw new Error('useRuta must be used within RutaProvider')
  }
  return ctx
}
