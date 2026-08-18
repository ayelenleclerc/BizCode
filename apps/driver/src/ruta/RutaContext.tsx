import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { MotivoNoEntrega, Reparto, RepartoItemRow } from '@bizcode/types'
import { driverRepartosApi } from '../api/driverApi'
import { mapApiErrorToUiState, type UiLoadState } from '../lib/apiErrors'
import type { DeliveredPodFields } from './pod/podValidation'

type RutaContextValue = {
  status: UiLoadState
  error: string | null
  reparto: Reparto | null
  load: () => Promise<void>
  patchItem: (itemId: number, next: RepartoItemRow) => void
  markNotDelivered: (itemId: number, motivo: MotivoNoEntrega) => Promise<void>
  markDelivered: (itemId: number, input: DeliveredPodFields) => Promise<void>
}

const RutaContext = createContext<RutaContextValue | null>(null)

function todayYmd(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/**
 * @en Day-route state for App Driver: load mi-reparto, patch stops, POD deliver/not-delivered (#160/#161).
 * @es Estado de ruta del día: carga mi-reparto, parches de parada, POD entregar/no entregar (#160/#161).
 * @pt-BR Estado da rota do dia: carrega mi-reparto, patches de parada, POD entregar/não entregar (#160/#161).
 */
export function RutaProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<UiLoadState>('idle')
  const [error, setError] = useState<string | null>(null)
  const [reparto, setReparto] = useState<Reparto | null>(null)

  const load = useCallback(async () => {
    setStatus('loading')
    setError(null)
    try {
      const data = await driverRepartosApi.getMiReparto({ fecha: todayYmd() })
      if (!data || data.items.length === 0) {
        setReparto(data ?? null)
        setStatus('empty')
        return
      }
      setReparto(data)
      setStatus('success')
    } catch (err) {
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
      const updated = await driverRepartosApi.updateItemPod(reparto.id, itemId, {
        outcome: 'not_delivered',
        motivoNoEntrega: motivo,
      })
      if (updated) {
        patchItem(itemId, updated)
      }
    },
    [patchItem, reparto],
  )

  const markDelivered = useCallback(
    async (itemId: number, input: DeliveredPodFields) => {
      if (!reparto) return
      const updated = await driverRepartosApi.updateItemPod(reparto.id, itemId, {
        outcome: 'delivered',
        ...input,
      })
      if (updated) {
        patchItem(itemId, updated)
      }
    },
    [patchItem, reparto],
  )

  const value = useMemo(
    () => ({ status, error, reparto, load, patchItem, markNotDelivered, markDelivered }),
    [status, error, reparto, load, patchItem, markNotDelivered, markDelivered],
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
