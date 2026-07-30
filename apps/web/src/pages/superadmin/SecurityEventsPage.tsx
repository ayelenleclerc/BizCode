import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { superadminAPI, type SuperadminSecurityEvent } from '@/lib/api'

export default function SecurityEventsPage() {
  const { t } = useTranslation('common')
  const [events, setEvents] = useState<SuperadminSecurityEvent[]>([])
  const [total, setTotal] = useState(0)
  const [severity, setSeverity] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await superadminAPI.listSecurityEvents({
        hours: 24,
        severity: severity || undefined,
        limit: 100,
      })
      setEvents(result.data)
      setTotal(result.total)
    } catch {
      setError(t('superadmin.security.errors.loadFailed'))
      setEvents([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [severity, t])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load()
    }, 0)
    return () => window.clearTimeout(timer)
  }, [load])

  return (
    <div className="p-8 h-full flex flex-col" data-testid="superadmin-security-events">
      <header className="mb-6">
        <p className="mb-2">
          <Link
            to="/superadmin"
            className="text-blue-700 underline dark:text-blue-300"
            data-testid="superadmin-security-back"
          >
            {t('superadmin.backToList')}
          </Link>
        </p>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          {t('superadmin.security.title')}
        </h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">{t('superadmin.security.subtitle')}</p>
      </header>

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1" htmlFor="superadmin-security-severity">
          <span className="text-sm text-slate-600 dark:text-slate-400">
            {t('superadmin.security.filterSeverity')}
          </span>
          <select
            id="superadmin-security-severity"
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            className="rounded border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-900"
            data-testid="superadmin-security-severity"
          >
            <option value="">{t('superadmin.security.severityAll')}</option>
            <option value="critical">{t('superadmin.security.severityCritical')}</option>
            <option value="high">{t('superadmin.security.severityHigh')}</option>
            <option value="info">{t('superadmin.security.severityInfo')}</option>
          </select>
        </label>
        <button
          type="button"
          onClick={() => void load()}
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          data-testid="superadmin-security-refresh"
        >
          {t('actions.refresh')}
        </button>
      </div>

      {loading ? (
        <p role="status" aria-busy="true" data-testid="superadmin-security-loading">
          {t('status.loading')}
        </p>
      ) : null}

      {error ? (
        <div
          role="alert"
          className="mb-4 rounded border border-red-300 bg-red-50 p-4 text-red-800 dark:border-red-700 dark:bg-red-950 dark:text-red-200"
          data-testid="superadmin-security-error"
        >
          {error}
          <button
            type="button"
            className="ml-4 underline"
            onClick={() => void load()}
            data-testid="superadmin-security-retry"
          >
            {t('actions.retry')}
          </button>
        </div>
      ) : null}

      {!loading && !error && events.length === 0 ? (
        <p className="text-slate-600 dark:text-slate-400" data-testid="superadmin-security-empty">
          {t('superadmin.security.empty')}
        </p>
      ) : null}

      {!loading && !error && events.length > 0 ? (
        <section aria-label={t('superadmin.security.timelineLabel')} className="min-h-0 flex-1 overflow-auto">
          <p className="mb-2 text-sm text-slate-600 dark:text-slate-400" data-testid="superadmin-security-total">
            {t('superadmin.security.total', { count: total })}
          </p>
          <ol className="space-y-3" data-testid="superadmin-security-timeline">
            {events.map((event) => (
              <li
                key={event.id}
                className="rounded border border-slate-200 p-4 dark:border-slate-700"
                data-testid={`superadmin-security-event-${event.id}`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={
                      event.severity === 'critical'
                        ? 'rounded bg-red-100 px-2 py-0.5 text-sm font-semibold text-red-900 dark:bg-red-950 dark:text-red-100'
                        : event.severity === 'high'
                          ? 'rounded bg-amber-100 px-2 py-0.5 text-sm font-semibold text-amber-900 dark:bg-amber-950 dark:text-amber-100'
                          : 'rounded bg-slate-100 px-2 py-0.5 text-sm font-semibold text-slate-800 dark:bg-slate-800 dark:text-slate-100'
                    }
                  >
                    {event.severity}
                  </span>
                  <span className="font-mono text-sm">{event.securityEventType}</span>
                  <time dateTime={event.createdAt} className="text-sm text-slate-500">
                    {new Date(event.createdAt).toLocaleString()}
                  </time>
                </div>
                <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
                  {t('superadmin.security.rowMeta', {
                    tenant: event.tenantSlug ?? String(event.tenantId),
                    action: event.action,
                    resource: event.resource,
                    ip: event.ipAddress ?? '—',
                  })}
                </p>
              </li>
            ))}
          </ol>
        </section>
      ) : null}
    </div>
  )
}
