import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { dashboardAPI, type DashboardSummaryDTO } from '@/lib/api'

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
          <p className="text-xs font-medium uppercase tracking-wide opacity-70">{title}</p>
          {pending ? (
            <p className="mt-2 text-sm opacity-60">{t('dashboard.pendingFeature')}</p>
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
            <p className="mt-2 text-xs opacity-50 italic">{note}</p>
          )}
        </div>
        <span className="text-3xl" aria-hidden="true">{icon}</span>
      </div>
    </div>
  )
}

// ─── Alert Card for alertasActivas ──────────────────────────────────────────

function AlertCard({ count, pending }: { count: number; pending: boolean }) {
  const { t } = useTranslation('common')

  return (
    <div className="rounded-lg border-l-4 border-orange-500 bg-orange-50 dark:bg-orange-950 text-orange-700 dark:text-orange-300 p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide opacity-70">
            {t('dashboard.alertasActivas')}
          </p>
          {pending ? (
            <p className="mt-2 text-sm opacity-60">{t('dashboard.pendingFeature')}</p>
          ) : (
            <p className="mt-1 text-3xl font-bold">{count}</p>
          )}
        </div>
        <span className="text-3xl" aria-hidden="true">🔔</span>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

/**
 * @en Dashboard home page — displays today's KPIs from GET /api/dashboard/summary.
 * @es Página de inicio — muestra los KPIs del día de GET /api/dashboard/summary.
 * @pt-BR Página inicial — exibe os KPIs do dia de GET /api/dashboard/summary.
 */
export default function InicioPage() {
  const { t } = useTranslation('common')
  const [data, setData] = useState<DashboardSummaryDTO | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">
        {t('dashboard.title')}
      </h1>

      {loading && (
        <p className="text-slate-500 dark:text-slate-400" role="status" aria-busy="true">
          {t('status.loading')}
        </p>
      )}

      {error && (
        <p role="alert" className="text-red-600 dark:text-red-400 text-sm">
          {error}
        </p>
      )}

      {!loading && !error && data && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <KpiCard
            title={t('dashboard.ventasHoy')}
            count={data.ventasHoy.count}
            total={data.ventasHoy.total}
            icon="💰"
            color="blue"
          />
          <KpiCard
            title={t('dashboard.facturasVencidas')}
            count={data.facturasVencidas.count}
            total={data.facturasVencidas.total}
            icon="⚠️"
            color="red"
            note={t('dashboard.overdueNote')}
          />
          <KpiCard
            title={t('dashboard.cobrosHoy')}
            count={data.cobrosHoy.count}
            total={data.cobrosHoy.total}
            icon="💳"
            color="green"
            pending={true}
          />
          <AlertCard count={data.alertasActivas} pending={data.alertasActivas === 0} />
        </div>
      )}
    </div>
  )
}
