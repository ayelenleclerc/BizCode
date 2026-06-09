import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import KeyboardHint from '@/components/shared/KeyboardHint'
import { dashboardAPI, type DashboardSummaryDTO } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { useFeatureFlags } from '@/contexts/FeatureFlagsContext'
import type { ModuleDisabledLocationState } from '@/components/ModuleRoute'
import { MODULE_KEYS, moduleI18nKey, type ModuleKey } from '@/lib/modules'
import InicioAnalyticsTab from './InicioAnalyticsTab'

type InicioTab = 'summary' | 'analytics'

// ─── KPI Card ────────────────────────────────────────────────────────────────

type KpiCardProps = {
  title: string
  count: number
  total?: string
  icon: string
  color: 'blue' | 'red' | 'green' | 'yellow'
  note?: string
  pending?: boolean
}

function KpiCard({ title, count, total, icon, color, note, pending }: KpiCardProps) {
  const { t, i18n } = useTranslation('common')

  const colorMap = {
    blue:   'border-blue-500  bg-blue-50  dark:bg-blue-950  text-blue-700  dark:text-blue-300',
    red:    'border-red-500   bg-red-50   dark:bg-red-950   text-red-700   dark:text-red-300',
    green:  'border-green-500 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300',
    yellow: 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300',
  }

  const formatMoney = (value: string) => {
    const num = parseFloat(value)
    if (isNaN(num)) return t('dashboard.noData')
    return new Intl.NumberFormat(i18n.language === 'pt-BR' ? 'pt-BR' : i18n.language === 'en' ? 'en-US' : 'es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
    }).format(num)
  }

  return (
    <div className={`rounded-lg border-l-4 p-5 shadow-sm ${colorMap[color]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-inherit opacity-90">{title}</p>
          {pending ? (
            <p className="mt-2 text-sm text-green-900 dark:text-green-100">{t('dashboard.pendingFeature')}</p>
          ) : (
            <>
              <p className="mt-1 text-3xl font-bold">
                {t('dashboard.invoices', { count, defaultValue_other: t('dashboard.invoices_other', { count }) })}
              </p>
              {total !== undefined && (
                <p className="mt-1 text-lg font-semibold">{formatMoney(total)}</p>
              )}
            </>
          )}
          {note && !pending && (
            <p className="mt-2 text-xs italic text-red-900 dark:text-red-100">{note}</p>
          )}
        </div>
        <span className="text-3xl" aria-hidden="true">{icon}</span>
      </div>
    </div>
  )
}

function AlertCard({ count, pending }: { count: number; pending: boolean }) {
  const { t } = useTranslation('common')

  return (
    <div className="rounded-lg border-l-4 border-orange-500 bg-orange-50 dark:bg-orange-950 text-orange-700 dark:text-orange-300 p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-inherit opacity-90">
            {t('dashboard.alertasActivas')}
          </p>
          {pending ? (
            <p className="mt-2 text-sm text-orange-900 dark:text-orange-100">{t('dashboard.pendingFeature')}</p>
          ) : (
            <p className="mt-1 text-3xl font-bold">{count}</p>
          )}
        </div>
        <span className="text-3xl" aria-hidden="true">🔔</span>
      </div>
    </div>
  )
}

function parseModuleDisabledState(state: unknown): ModuleKey | null {
  if (!state || typeof state !== 'object') return null
  const key = (state as ModuleDisabledLocationState).moduleDisabled
  if (typeof key !== 'string') return null
  return (MODULE_KEYS as readonly string[]).includes(key) ? (key as ModuleKey) : null
}

/**
 * @en Dashboard home — KPI summary and advanced analytics tab (#138).
 * @es Inicio — resumen KPI y pestaña de analítica avanzada (#138).
 * @pt-BR Início — resumo KPI e aba de análise avançada (#138).
 */
export default function InicioPage() {
  const { t } = useTranslation(['common', 'dashboardAnalytics'])
  const location = useLocation()
  const navigate = useNavigate()
  const { claims } = useAuth()
  const { hasModule } = useFeatureFlags()
  const [moduleAlert] = useState<ModuleKey | null>(() => parseModuleDisabledState(location.state))
  const [activeTab, setActiveTab] = useState<InicioTab>('summary')
  const [data, setData] = useState<DashboardSummaryDTO | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const canAnalytics =
    (claims?.permissions.includes('reports.operational.read') ?? false) &&
    hasModule('analytics.advanced')

  const inicioShortcuts = useMemo(
    () => [{ key: 'Tab', description: t('common:shortcuts.navigate') }],
    [t],
  )

  useEffect(() => {
    if (moduleAlert) {
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [moduleAlert, location.pathname, navigate])

  useEffect(() => {
    let cancelled = false
    dashboardAPI
      .summary()
      .then((summary) => {
        if (!cancelled) {
          setData(summary)
          setLoading(false)
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err))
          setLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  const tabListId = 'inicio-tablist'

  return (
    <div className="p-4 sm:p-8">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">
        {t('common:dashboard.title')}
      </h1>

      {moduleAlert ? (
        <p
          role="alert"
          className="mb-4 rounded border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100"
          data-testid="module-disabled-alert"
        >
          {t('common:errors.moduleNotEnabled', { module: t(moduleI18nKey(moduleAlert)) })}
        </p>
      ) : null}

      <KeyboardHint shortcuts={inicioShortcuts} className="mb-4" />

      <div
        role="tablist"
        id={tabListId}
        aria-label={t('common:dashboard.title')}
        className="mb-6 flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-700"
        data-testid="inicio-tabs"
      >
        <button
          type="button"
          role="tab"
          id="inicio-tab-summary"
          {...(activeTab === 'summary'
            ? { 'aria-selected': 'true' as const }
            : { 'aria-selected': 'false' as const })}
          aria-controls="inicio-panel-summary"
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
            activeTab === 'summary'
              ? 'border-indigo-600 text-indigo-700 dark:text-indigo-300'
              : 'border-transparent text-slate-600 dark:text-slate-400'
          }`}
          onClick={() => setActiveTab('summary')}
          data-testid="inicio-tab-summary"
        >
          {t('dashboardAnalytics:tabSummary')}
        </button>
        <button
          type="button"
          role="tab"
          id="inicio-tab-analytics"
          {...(activeTab === 'analytics'
            ? { 'aria-selected': 'true' as const }
            : { 'aria-selected': 'false' as const })}
          aria-controls="inicio-panel-analytics"
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
            activeTab === 'analytics'
              ? 'border-indigo-600 text-indigo-700 dark:text-indigo-300'
              : 'border-transparent text-slate-600 dark:text-slate-400'
          }`}
          onClick={() => setActiveTab('analytics')}
          data-testid="inicio-tab-analytics"
        >
          {t('dashboardAnalytics:tabAnalytics')}
        </button>
      </div>

      {activeTab === 'summary' ? (
        <div
          role="tabpanel"
          id="inicio-panel-summary"
          aria-labelledby="inicio-tab-summary"
          data-testid="inicio-panel-summary"
        >
          {loading && (
            <p className="text-slate-500 dark:text-slate-400" role="status" aria-busy="true">
              {t('common:status.loading')}
            </p>
          )}

          {error && (
            <p role="alert" className="text-red-600 dark:text-red-400 text-sm">
              {error}
            </p>
          )}

          {!loading && !error && data && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                <KpiCard
                  title={t('common:dashboard.ventasHoy')}
                  count={data.ventasHoy.count}
                  total={data.ventasHoy.total}
                  icon="💰"
                  color="blue"
                />
                <KpiCard
                  title={t('common:dashboard.facturasVencidas')}
                  count={data.facturasVencidas.count}
                  total={data.facturasVencidas.total}
                  icon="⚠️"
                  color="red"
                  note={t('common:dashboard.overdueNote')}
                />
                <KpiCard
                  title={t('common:dashboard.cobrosHoy')}
                  count={data.cobrosHoy.count}
                  total={data.cobrosHoy.total}
                  icon="💳"
                  color="green"
                  pending={true}
                />
                <AlertCard count={data.alertasActivas} pending={data.alertasActivas === 0} />
              </div>
              {hasModule('finance.ledger') && data.facturasPagar && (
                <div
                  className="grid grid-cols-1 sm:grid-cols-2 gap-5"
                  data-testid="inicio-facturas-pagar-widgets"
                >
                  <KpiCard
                    title={t('common:dashboard.facturasPagarVencidas')}
                    count={data.facturasPagar.vencido.count}
                    total={data.facturasPagar.vencido.total}
                    icon="📋"
                    color="red"
                  />
                  <KpiCard
                    title={t('common:dashboard.facturasPagarProximas')}
                    count={data.facturasPagar.proximoVencer.count}
                    total={data.facturasPagar.proximoVencer.total}
                    icon="📅"
                    color="yellow"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div
          role="tabpanel"
          id="inicio-panel-analytics"
          aria-labelledby="inicio-tab-analytics"
          data-testid="inicio-panel-analytics"
        >
          {!canAnalytics ? (
            <p
              role="status"
              className="text-sm text-slate-600 dark:text-slate-400"
              data-testid="inicio-analytics-forbidden"
            >
              {!(claims?.permissions.includes('reports.operational.read') ?? false)
                ? t('dashboardAnalytics:permissionRequired')
                : t('dashboardAnalytics:moduleRequired')}
            </p>
          ) : (
            <InicioAnalyticsTab />
          )}
        </div>
      )}
    </div>
  )
}
