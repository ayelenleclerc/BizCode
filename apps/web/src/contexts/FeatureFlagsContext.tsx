import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  DEFAULT_FISCAL_JURISDICTION,
  resolveJurisdiction,
  type FiscalJurisdictionCode,
} from '@bizcode/types'
import { featuresAPI } from '@/lib/api'
import { MODULE_KEYS, type ModuleKey } from '@/lib/modules'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/contexts/AuthContext'

export type FeatureFlagsStatus = 'idle' | 'loading' | 'ready' | 'error'

type FeatureFlagsContextValue = {
  status: FeatureFlagsStatus
  modules: readonly ModuleKey[]
  integrations: readonly string[]
  /**
   * @en Tenant tax jurisdiction; drives tax-id validation and VAT rates in the UI (#207).
   * @es Jurisdicción fiscal del tenant; gobierna la validación del identificador y las alícuotas en la UI (#207).
   * @pt-BR Jurisdição fiscal do tenant; rege a validação do identificador e as alíquotas na UI (#207).
   */
  jurisdiccionFiscal: FiscalJurisdictionCode
  hasModule: (key: ModuleKey) => boolean
  hasIntegration: (id: string) => boolean
  refreshFeatures: () => Promise<void>
}

const FeatureFlagsContext = createContext<FeatureFlagsContextValue | null>(null)

function parseModuleKeys(raw: string[]): ModuleKey[] {
  const allowed = new Set(MODULE_KEYS as readonly string[])
  return raw.filter((k): k is ModuleKey => allowed.has(k))
}

/**
 * @en Loads tenant feature flags from GET /api/me/features after authentication (#224).
 * @es Carga feature flags del tenant desde GET /api/me/features tras autenticación (#224).
 * @pt-BR Carrega feature flags do tenant via GET /api/me/features após autenticação (#224).
 */
export function FeatureFlagsProvider({ children }: { children: ReactNode }) {
  const { status: authStatus, claims } = useAuth()
  const [status, setStatus] = useState<FeatureFlagsStatus>('idle')
  const [modules, setModules] = useState<readonly ModuleKey[]>([])
  const [integrations, setIntegrations] = useState<readonly string[]>([])
  const [jurisdiccionFiscal, setJurisdiccionFiscal] = useState<FiscalJurisdictionCode>(
    DEFAULT_FISCAL_JURISDICTION,
  )

  const refreshFeatures = useCallback(async () => {
    if (authStatus !== 'authenticated') {
      setStatus('idle')
      setModules([])
      setIntegrations([])
      setJurisdiccionFiscal(DEFAULT_FISCAL_JURISDICTION)
      return
    }
    setStatus('loading')
    try {
      const data = await featuresAPI.get()
      setModules(parseModuleKeys(data.modules))
      setIntegrations([...data.integrations])
      setJurisdiccionFiscal(resolveJurisdiction(data.jurisdiccionFiscal))
      setStatus('ready')
    } catch {
      setModules([])
      setIntegrations([])
      setJurisdiccionFiscal(DEFAULT_FISCAL_JURISDICTION)
      setStatus('ready')
    }
  }, [authStatus])

  useEffect(() => {
    const id = window.setTimeout(() => {
      if (authStatus === 'loading' || authStatus === 'unauthenticated') {
        setStatus('idle')
        setModules([])
        setIntegrations([])
        setJurisdiccionFiscal(DEFAULT_FISCAL_JURISDICTION)
        return
      }
      void refreshFeatures()
    }, 0)
    return () => window.clearTimeout(id)
  }, [authStatus, claims?.tenantId, refreshFeatures])

  const isSuperAdmin = claims?.role === 'super_admin'

  const hasModule = useCallback(
    (key: ModuleKey) => {
      if (isSuperAdmin) return true
      return modules.includes(key)
    },
    [isSuperAdmin, modules],
  )

  const hasIntegration = useCallback(
    (id: string) => {
      if (isSuperAdmin) return true
      return integrations.includes(id)
    },
    [isSuperAdmin, integrations],
  )

  const value = useMemo(
    () => ({
      status,
      modules,
      integrations,
      jurisdiccionFiscal,
      hasModule,
      hasIntegration,
      refreshFeatures,
    }),
    [
      status,
      modules,
      integrations,
      jurisdiccionFiscal,
      hasModule,
      hasIntegration,
      refreshFeatures,
    ],
  )

  return <FeatureFlagsContext.Provider value={value}>{children}</FeatureFlagsContext.Provider>
}

export function useFeatureFlags(): FeatureFlagsContextValue {
  const ctx = useContext(FeatureFlagsContext)
  if (!ctx) {
    throw new Error('useFeatureFlags must be used within FeatureFlagsProvider')
  }
  return ctx
}

/**
 * @en Blocks child routes until tenant feature flags are loaded (avoids nav flicker).
 * @es Bloquea rutas hijas hasta cargar feature flags del tenant (evita parpadeo en nav).
 * @pt-BR Bloqueia rotas filhas até carregar feature flags do tenant (evita flicker no nav).
 */
export function FeatureFlagsGate({ children }: { children: ReactNode }) {
  const { status: authStatus } = useAuth()
  const { status: flagsStatus } = useFeatureFlags()
  const { t } = useTranslation('common')

  if (authStatus === 'authenticated' && flagsStatus === 'loading') {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900"
        role="status"
        aria-busy="true"
        data-testid="feature-flags-loading"
      >
        <p className="text-slate-700 dark:text-slate-300">{t('status.loading')}</p>
      </div>
    )
  }

  return <>{children}</>
}
