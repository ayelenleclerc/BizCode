import { useCallback, useEffect, useId, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PLAN_KEYS } from '@/lib/plans'
import { planAPI, superadminAPI, type PublicPlanDTO, type SuperadminTenantDetail } from '@/lib/api'

export default function TenantDetailPage() {
  const { tenantId: tenantIdParam } = useParams()
  const tenantId = tenantIdParam ? parseInt(tenantIdParam, 10) : NaN
  const { t, i18n } = useTranslation('common')
  const [tenant, setTenant] = useState<SuperadminTenantDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [patching, setPatching] = useState(false)
  const [incidentBusy, setIncidentBusy] = useState(false)
  const [incidentMessage, setIncidentMessage] = useState<string | null>(null)
  const [auditStart, setAuditStart] = useState('')
  const [auditEnd, setAuditEnd] = useState('')
  const [auditExporting, setAuditExporting] = useState(false)
  const [plans, setPlans] = useState<PublicPlanDTO[]>([])
  const [selectedPlanKey, setSelectedPlanKey] = useState('')
  const [planReason, setPlanReason] = useState('')
  const [planSaving, setPlanSaving] = useState(false)
  const [planMessage, setPlanMessage] = useState<string | null>(null)
  const planReasonId = useId()
  const auditStartId = useId()
  const auditEndId = useId()

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
      setSelectedPlanKey(data.plan ?? 'starter')
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

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void planAPI.list().then(setPlans).catch(() => setPlans([]))
    }, 0)
    return () => window.clearTimeout(timer)
  }, [])

  const handleChangePlan = async () => {
    if (!tenant || !selectedPlanKey || !planReason.trim()) {
      setPlanMessage(t('superadmin.plan.errors.reasonRequired'))
      return
    }
    setPlanSaving(true)
    setPlanMessage(null)
    try {
      await superadminAPI.changeTenantPlan(tenant.id, {
        planKey: selectedPlanKey,
        reason: planReason.trim(),
      })
      setPlanReason('')
      setPlanMessage(t('superadmin.plan.saveSuccess'))
      await load()
    } catch {
      setPlanMessage(t('superadmin.plan.errors.saveFailed'))
    } finally {
      setPlanSaving(false)
    }
  }

  const handleToggleActive = async () => {
    if (!tenant) return
    setPatching(true)
    setIncidentMessage(null)
    try {
      const updated = await superadminAPI.patchTenant(tenant.id, !tenant.active)
      setTenant(updated)
    } catch {
      setError(t('superadmin.errors.patchFailed'))
    } finally {
      setPatching(false)
    }
  }

  const handleRevokeSessions = async () => {
    if (!tenant) return
    if (!window.confirm(t('superadmin.incident.confirmRevokeSessions'))) return
    setIncidentBusy(true)
    setIncidentMessage(null)
    try {
      const result = await superadminAPI.revokeAllSessions(tenant.id)
      setIncidentMessage(t('superadmin.incident.revokeSuccess', { count: result.revokedUserCount }))
    } catch {
      setIncidentMessage(t('superadmin.incident.errors.revokeFailed'))
    } finally {
      setIncidentBusy(false)
    }
  }

  const handleDisable = async () => {
    if (!tenant) return
    if (!window.confirm(t('superadmin.incident.confirmDisable'))) return
    setIncidentBusy(true)
    setIncidentMessage(null)
    try {
      const updated = await superadminAPI.disableTenant(tenant.id)
      setTenant(updated)
      setIncidentMessage(t('superadmin.incident.disableSuccess'))
    } catch {
      setIncidentMessage(t('superadmin.incident.errors.disableFailed'))
    } finally {
      setIncidentBusy(false)
    }
  }

  const handleToggleMaintenance = async () => {
    if (!tenant) return
    const next = !tenant.maintenanceMode
    if (next && !window.confirm(t('superadmin.incident.confirmMaintenanceOn'))) return
    setIncidentBusy(true)
    setIncidentMessage(null)
    try {
      const updated = await superadminAPI.setMaintenanceMode(tenant.id, next)
      setTenant(updated)
      setIncidentMessage(
        next ? t('superadmin.incident.maintenanceOnSuccess') : t('superadmin.incident.maintenanceOffSuccess'),
      )
    } catch {
      setIncidentMessage(t('superadmin.incident.errors.maintenanceFailed'))
    } finally {
      setIncidentBusy(false)
    }
  }

  const handleExportAudit = async () => {
    if (!tenant) return
    setAuditExporting(true)
    setIncidentMessage(null)
    try {
      const result = await superadminAPI.listTenantAuditEvents(tenant.id, {
        startDate: auditStart ? new Date(auditStart).toISOString() : undefined,
        endDate: auditEnd ? new Date(auditEnd).toISOString() : undefined,
        limit: 1000,
        offset: 0,
      })
      const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `tenant-${tenant.id}-audit-events.json`
      a.click()
      URL.revokeObjectURL(url)
      setIncidentMessage(t('superadmin.incident.exportSuccess', { count: result.total }))
    } catch {
      setIncidentMessage(t('superadmin.incident.errors.exportFailed'))
    } finally {
      setAuditExporting(false)
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
            disabled={patching || incidentBusy}
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
        {(
          [
            { key: 'status', label: t('superadmin.detail.status'), value: tenant.active ? t('superadmin.status.active') : t('superadmin.status.suspended') },
            {
              key: 'maintenance',
              label: t('superadmin.detail.maintenance'),
              value: tenant.maintenanceMode
                ? t('superadmin.status.maintenanceOn')
                : t('superadmin.status.maintenanceOff'),
            },
            { key: 'plan', label: t('superadmin.detail.plan'), value: tenant.plan ?? '—' },
            { key: 'modulesCount', label: t('superadmin.detail.modulesCount'), value: String(tenant.modulesCount) },
            { key: 'lastActivity', label: t('superadmin.detail.lastActivity'), value: formatDate(tenant.lastActivityAt) },
            { key: 'createdAt', label: t('superadmin.detail.createdAt'), value: formatDate(tenant.createdAt) },
            { key: 'configUpdated', label: t('superadmin.detail.configUpdated'), value: formatDate(tenant.configUpdatedAt) },
          ] as const
        ).map(({ key, label, value }) => (
          <div key={key}>
            <dt className="text-sm text-slate-500 dark:text-slate-400">{label}</dt>
            <dd className="font-medium text-slate-900 dark:text-slate-100">{value}</dd>
          </div>
        ))}
      </dl>

      <section
        className="mt-8 max-w-3xl rounded border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/40"
        aria-labelledby="superadmin-incident-heading"
        data-testid="superadmin-incident-tools"
      >
        <h2 id="superadmin-incident-heading" className="text-lg font-semibold text-red-900 dark:text-red-100">
          {t('superadmin.incident.sectionTitle')}
        </h2>
        <p className="mt-1 text-sm text-red-800 dark:text-red-200">{t('superadmin.incident.sectionHelp')}</p>
        {incidentMessage ? (
          <p role="status" className="mt-3 text-sm" data-testid="superadmin-incident-message">
            {incidentMessage}
          </p>
        ) : null}
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={incidentBusy}
            onClick={() => void handleRevokeSessions()}
            className="rounded bg-slate-800 px-3 py-2 text-sm text-white disabled:opacity-50 dark:bg-slate-200 dark:text-slate-900"
            data-testid="superadmin-revoke-sessions"
          >
            {t('superadmin.incident.revokeSessions')}
          </button>
          <button
            type="button"
            disabled={incidentBusy || !tenant.active}
            onClick={() => void handleDisable()}
            className="rounded bg-red-700 px-3 py-2 text-sm text-white disabled:opacity-50"
            data-testid="superadmin-disable-tenant"
          >
            {t('superadmin.incident.disable')}
          </button>
          <button
            type="button"
            disabled={incidentBusy}
            onClick={() => void handleToggleMaintenance()}
            className="rounded bg-amber-700 px-3 py-2 text-sm text-white disabled:opacity-50"
            data-testid="superadmin-toggle-maintenance"
          >
            {tenant.maintenanceMode
              ? t('superadmin.incident.maintenanceOff')
              : t('superadmin.incident.maintenanceOn')}
          </button>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor={auditStartId} className="block text-sm font-medium">
              {t('superadmin.incident.auditStart')}
            </label>
            <input
              id={auditStartId}
              type="datetime-local"
              value={auditStart}
              onChange={(e) => setAuditStart(e.target.value)}
              className="mt-1 w-full rounded border border-slate-300 px-2 py-1 dark:border-slate-600 dark:bg-slate-900"
              data-testid="superadmin-audit-start"
            />
          </div>
          <div>
            <label htmlFor={auditEndId} className="block text-sm font-medium">
              {t('superadmin.incident.auditEnd')}
            </label>
            <input
              id={auditEndId}
              type="datetime-local"
              value={auditEnd}
              onChange={(e) => setAuditEnd(e.target.value)}
              className="mt-1 w-full rounded border border-slate-300 px-2 py-1 dark:border-slate-600 dark:bg-slate-900"
              data-testid="superadmin-audit-end"
            />
          </div>
        </div>
        <button
          type="button"
          disabled={auditExporting}
          onClick={() => void handleExportAudit()}
          className="mt-3 rounded border border-slate-400 px-3 py-2 text-sm disabled:opacity-50"
          data-testid="superadmin-export-audit"
        >
          {auditExporting ? t('status.loading') : t('superadmin.incident.exportAudit')}
        </button>
      </section>

      <section className="mt-8 max-w-lg" aria-labelledby="superadmin-plan-heading">
        <h2 id="superadmin-plan-heading" className="text-lg font-semibold mb-3">
          {t('superadmin.plan.sectionTitle')}
        </h2>
        {planMessage ? (
          <p role="status" className="mb-3 text-sm text-green-800 dark:text-green-200" data-testid="superadmin-plan-message">
            {planMessage}
          </p>
        ) : null}
        <SuperadminPlanForm
          planReasonId={planReasonId}
          selectedPlanKey={selectedPlanKey}
          onPlanKeyChange={setSelectedPlanKey}
          planReason={planReason}
          onPlanReasonChange={setPlanReason}
          planSaving={planSaving}
          onSave={() => void handleChangePlan()}
          plans={plans}
          t={t}
        />
      </section>

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

function SuperadminPlanForm({
  planReasonId,
  selectedPlanKey,
  onPlanKeyChange,
  planReason,
  onPlanReasonChange,
  planSaving,
  onSave,
  plans,
  t,
}: {
  planReasonId: string
  selectedPlanKey: string
  onPlanKeyChange: (v: string) => void
  planReason: string
  onPlanReasonChange: (v: string) => void
  planSaving: boolean
  onSave: () => void
  plans: PublicPlanDTO[]
  t: (key: string, opts?: Record<string, unknown>) => string
}) {
  const options =
    plans.length > 0
      ? plans
      : PLAN_KEYS.map((key) => ({
          key,
          name: key,
          monthlyPrice: 0,
          currency: 'ARS',
          maxUsers: null,
          maxInvoicesPerMonth: null,
          features: [],
        }))

  return (
    <div className="flex flex-col gap-3" data-testid="superadmin-plan-form">
      <label htmlFor="superadmin-plan-select" className="text-sm font-medium">
        {t('superadmin.plan.selectLabel')}
      </label>
      <select
        id="superadmin-plan-select"
        value={selectedPlanKey}
        onChange={(e) => onPlanKeyChange(e.target.value)}
        className="rounded border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-900"
        data-testid="superadmin-plan-select"
      >
        {options.map((p) => (
          <option key={p.key} value={p.key}>
            {t(`plans.names.${p.key}`, { defaultValue: p.name })}
          </option>
        ))}
      </select>
      <label htmlFor={planReasonId} className="text-sm font-medium">
        {t('superadmin.plan.reasonLabel')}
      </label>
      <textarea
        id={planReasonId}
        value={planReason}
        onChange={(e) => onPlanReasonChange(e.target.value)}
        rows={2}
        maxLength={500}
        className="rounded border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-900"
        data-testid="superadmin-plan-reason"
      />
      <button
        type="button"
        disabled={planSaving}
        onClick={onSave}
        className="w-fit rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        data-testid="superadmin-plan-save"
      >
        {planSaving ? t('actions.saving') : t('superadmin.plan.save')}
      </button>
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
