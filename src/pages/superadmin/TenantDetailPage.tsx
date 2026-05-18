import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { superadminAPI, type SuperadminTenantDetail } from '@/lib/api'

export default function TenantDetailPage() {
  const { tenantId: tenantIdParam } = useParams()
  const tenantId = tenantIdParam ? parseInt(tenantIdParam, 10) : NaN
  const { t, i18n } = useTranslation('common')
  const [tenant, setTenant] = useState<SuperadminTenantDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [patching, setPatching] = useState(false)

  const load = useCallback(async () => {
    if (!Number.isInteger(tenantId) || tenantId <= 0) {
      setError(t('superadmin.errors.invalidId'))
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await superadminAPI.getTenant(tenantId)
      setTenant(data)
    } catch {
      setError(t('superadmin.errors.loadFailed'))
      setTenant(null)
    } finally {
      setLoading(false)
    }
  }, [tenantId, t])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load()
    }, 0)
    return () => window.clearTimeout(timer)
  }, [load])

  const handleToggleActive = async () => {
    if (!tenant) return
    setPatching(true)
    try {
      const updated = await superadminAPI.patchTenant(tenant.id, !tenant.active)
      setTenant(updated)
    } catch {
      setError(t('superadmin.errors.patchFailed'))
    } finally {
      setPatching(false)
    }
  }

  const formatDate = (iso: string | null) => {
    if (!iso) return '—'
    return new Intl.DateTimeFormat(i18n.language === 'en' ? 'en-US' : i18n.language === 'pt-BR' ? 'pt-BR' : 'es-AR', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso))
  }

  if (loading) {
    return (
      <p role="status" aria-busy="true" className="p-8" data-testid="superadmin-detail-loading">
        {t('status.loading')}
      </p>
    )
  }

  if (error || !tenant) {
    return (
      <SuperadminDetailError
        message={error ?? t('superadmin.errors.notFound')}
        backLabel={t('superadmin.backToList')}
      />
    )
  }

  return (
    <div className="p-8" data-testid="superadmin-tenant-detail">
      <p className="mb-4">
        <Link to="/superadmin" className="text-blue-600 hover:underline dark:text-blue-400" data-testid="superadmin-back-link">
          {t('superadmin.backToList')}
        </Link>
      </p>

      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{tenant.name}</h1>
          <p className="mt-1 font-mono text-slate-600 dark:text-slate-400">{tenant.slug}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={patching}
            onClick={() => void handleToggleActive()}
            className={`rounded px-4 py-2 text-white disabled:opacity-50 ${
              tenant.active ? 'bg-amber-600 hover:bg-amber-700' : 'bg-green-600 hover:bg-green-700'
            }`}
            data-testid="superadmin-toggle-active"
          >
            {tenant.active ? t('superadmin.suspend') : t('superadmin.reactivate')}
          </button>
          <Link
            to={`/superadmin/tenants/${tenant.id}/modules`}
            className="rounded border border-slate-300 px-4 py-2 hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800"
            data-testid="superadmin-modules-link"
          >
            {t('superadmin.manageModules')}
          </Link>
        </div>
      </header>

      <dl className="grid gap-4 sm:grid-cols-2 max-w-3xl" data-testid="superadmin-detail-meta">
        <DetailItem label={t('superadmin.detail.status')} value={tenant.active ? t('superadmin.status.active') : t('superadmin.status.suspended')} />
        <DetailItem label={t('superadmin.detail.plan')} value={tenant.plan ?? '—'} />
        <DetailItem label={t('superadmin.detail.modulesCount')} value={String(tenant.modulesCount)} />
        <DetailItem label={t('superadmin.detail.lastActivity')} value={formatDate(tenant.lastActivityAt)} />
        <DetailItem label={t('superadmin.detail.createdAt')} value={formatDate(tenant.createdAt)} />
        <DetailItem label={t('superadmin.detail.configUpdated')} value={formatDate(tenant.configUpdatedAt)} />
      </dl>

      <section className="mt-8" aria-label={t('superadmin.detail.statsSection')}>
        <h2 className="text-lg font-semibold mb-3">{t('superadmin.detail.statsSection')}</h2>
        <ul className="grid gap-2 sm:grid-cols-2 max-w-md list-none p-0" data-testid="superadmin-detail-stats">
          <li>{t('superadmin.detail.statUsers', { count: tenant.stats.userCount })}</li>
          <li>{t('superadmin.detail.statInvoices', { count: tenant.stats.facturaCount })}</li>
          <li>{t('superadmin.detail.statOrders', { count: tenant.stats.pedidoCount })}</li>
          <li>{t('superadmin.detail.statClients', { count: tenant.stats.clienteCount })}</li>
        </ul>
      </section>
    </div>
  )
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm text-slate-500 dark:text-slate-400">{label}</dt>
      <dd className="font-medium text-slate-900 dark:text-slate-100">{value}</dd>
    </div>
  )
}

function SuperadminDetailError({ message, backLabel }: { message: string; backLabel: string }) {
  return (
    <div className="p-8" role="alert" data-testid="superadmin-detail-error">
      <p className="text-red-700 dark:text-red-300">{message}</p>
      <Link to="/superadmin" className="mt-4 inline-block text-blue-600 hover:underline dark:text-blue-400">
        {backLabel}
      </Link>
    </div>
  )
}
