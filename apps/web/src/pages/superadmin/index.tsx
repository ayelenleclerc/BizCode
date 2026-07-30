import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  superadminAPI,
  type SuperadminGlobalStats,
  type SuperadminTenantListRow,
} from '@/lib/api'

export default function SuperadminHomePage() {
  const { t } = useTranslation('common')
  const [stats, setStats] = useState<SuperadminGlobalStats | null>(null)
  const [tenants, setTenants] = useState<SuperadminTenantListRow[]>([])
  const [filtro, setFiltro] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async (q?: string) => {
    setLoading(true)
    setError(null)
    try {
      const [statsData, listData] = await Promise.all([
        superadminAPI.getStats(),
        superadminAPI.listTenants(q),
      ])
      setStats(statsData)
      setTenants(listData)
    } catch {
      setError(t('superadmin.errors.loadFailed'))
      setStats(null)
      setTenants([])
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load()
    }, 0)
    return () => window.clearTimeout(timer)
  }, [load])

  const handleSearch = () => {
    void load(filtro.trim() || undefined)
  }

  const filtered = filtro.trim()
    ? tenants.filter(
        (row) =>
          row.name.toLowerCase().includes(filtro.toLowerCase()) ||
          row.slug.toLowerCase().includes(filtro.toLowerCase()),
      )
    : tenants

  return (
    <div className="p-8 h-full flex flex-col" data-testid="superadmin-home">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{t('superadmin.title')}</h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">{t('superadmin.subtitle')}</p>
        <p className="mt-3">
          <Link
            to="/superadmin/security"
            className="text-blue-700 underline dark:text-blue-300"
            data-testid="superadmin-security-link"
          >
            {t('superadmin.security.openTimeline')}
          </Link>
        </p>
      </header>

      {loading ? (
        <p role="status" aria-busy="true" data-testid="superadmin-home-loading">
          {t('status.loading')}
        </p>
      ) : null}

      {error ? (
        <div role="alert" className="mb-4 rounded border border-red-300 bg-red-50 p-4 text-red-800 dark:border-red-700 dark:bg-red-950 dark:text-red-200" data-testid="superadmin-home-error">
          {error}
          <button
            type="button"
            className="ml-4 underline"
            onClick={() => void load()}
            data-testid="superadmin-home-retry"
          >
            {t('actions.retry')}
          </button>
        </div>
      ) : null}

      {!loading && !error && stats ? (
        <section
          className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          aria-label={t('superadmin.statsSection')}
          data-testid="superadmin-stats"
        >
          <StatCard label={t('superadmin.stats.activeTenants')} value={stats.activeTenants} />
          <StatCard label={t('superadmin.stats.totalTenants')} value={stats.totalTenants} />
          <StatCard label={t('superadmin.stats.facturasToday')} value={stats.facturasToday} />
          <StatCard label={t('superadmin.stats.totalUsers')} value={stats.totalUsers} />
        </section>
      ) : null}

      <section className="flex flex-1 flex-col min-h-0" aria-label={t('superadmin.tenantsSection')}>
        <div className="flex flex-wrap gap-3 items-end">
          <label className="flex flex-col gap-1">
            <span className="text-sm text-slate-600 dark:text-slate-400">{t('superadmin.searchLabel')}</span>
            <input
              id="superadmin-tenant-search"
              type="search"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearch()
              }}
              className="rounded border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-900"
              data-testid="superadmin-tenant-search"
            />
          </label>
          <button
            type="button"
            onClick={handleSearch}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            data-testid="superadmin-tenant-search-btn"
          >
            {t('actions.search')}
          </button>
        </div>

        {!loading && !error && filtered.length === 0 ? (
          <p className="mt-6 text-slate-600 dark:text-slate-400" data-testid="superadmin-tenants-empty">
            {t('superadmin.emptyTenants')}
          </p>
        ) : null}

        {!loading && !error && filtered.length > 0 ? (
          <div className="mt-4 overflow-auto flex-1">
            <table className="w-full text-left border-collapse" data-testid="superadmin-tenants-table">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="p-3">{t('superadmin.columns.name')}</th>
                  <th className="p-3">{t('superadmin.columns.slug')}</th>
                  <th className="p-3">{t('superadmin.columns.plan')}</th>
                  <th className="p-3">{t('superadmin.columns.users')}</th>
                  <th className="p-3">{t('superadmin.columns.invoices')}</th>
                  <th className="p-3">{t('superadmin.columns.status')}</th>
                  <th className="p-3">{t('superadmin.columns.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    data-testid={`superadmin-tenant-row-${row.id}`}
                  >
                    <td className="p-3">{row.name}</td>
                    <td className="p-3 font-mono text-sm">{row.slug}</td>
                    <td className="p-3">{row.plan ?? '—'}</td>
                    <td className="p-3">{row.userCount}</td>
                    <td className="p-3">{row.facturaCount}</td>
                    <td className="p-3">
                      {row.active ? t('superadmin.status.active') : t('superadmin.status.suspended')}
                    </td>
                    <td className="p-3">
                      <Link
                        to={`/superadmin/tenants/${row.id}`}
                        className="text-blue-600 hover:underline dark:text-blue-400"
                        data-testid={`superadmin-tenant-link-${row.id}`}
                      >
                        {t('superadmin.viewDetail')}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
    </div>
  )
}

