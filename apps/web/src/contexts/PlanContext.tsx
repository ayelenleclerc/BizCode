import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { planAPI, type TenantPlanSnapshotDTO } from '@/lib/api'
import type { PlanFeatureKey } from '@/lib/plans'
import { planIncludesFeature } from '@/lib/plans'
import { useAuth } from '@/contexts/AuthContext'

export type PlanContextStatus = 'idle' | 'loading' | 'ready' | 'error'

type PlanContextValue = {
  status: PlanContextStatus
  snapshot: TenantPlanSnapshotDTO | null
  hasPlanFeature: (feature: PlanFeatureKey) => boolean
  refreshPlan: () => Promise<void>
}

const PlanContext = createContext<PlanContextValue | null>(null)

/**
 * @en Loads tenant SaaS plan from GET /api/me/plan after authentication (#181).
 * @es Carga plan SaaS del tenant desde GET /api/me/plan tras autenticación (#181).
 * @pt-BR Carrega plano SaaS do tenant via GET /api/me/plan após autenticação (#181).
 */
export function PlanProvider({ children }: { children: ReactNode }) {
  const { status: authStatus } = useAuth()
  const [status, setStatus] = useState<PlanContextStatus>('idle')
  const [snapshot, setSnapshot] = useState<TenantPlanSnapshotDTO | null>(null)

  const refreshPlan = useCallback(async () => {
    if (authStatus !== 'authenticated') {
      setStatus('idle')
      setSnapshot(null)
      return
    }
    setStatus('loading')
    try {
      const data = await planAPI.getMe()
      setSnapshot(data)
      setStatus('ready')
    } catch {
      setSnapshot(null)
      setStatus('ready')
    }
  }, [authStatus])

  useEffect(() => {
    const id = window.setTimeout(() => {
      void refreshPlan()
    }, 0)
    return () => window.clearTimeout(id)
  }, [refreshPlan])

  const hasPlanFeature = useCallback(
    (feature: PlanFeatureKey) => {
      if (!snapshot) {
        return false
      }
      return planIncludesFeature(snapshot.features, feature)
    },
    [snapshot],
  )

  const value = useMemo(
    () => ({
      status,
      snapshot,
      hasPlanFeature,
      refreshPlan,
    }),
    [status, snapshot, hasPlanFeature, refreshPlan],
  )

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>
}

export function usePlan(): PlanContextValue {
  const ctx = useContext(PlanContext)
  if (!ctx) {
    throw new Error('usePlan must be used within PlanProvider')
  }
  return ctx
}
