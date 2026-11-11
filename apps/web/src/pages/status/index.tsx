/**
 * @en Public system status page that reads `GET /api/health` (#197).
 * @es Página pública de estado del sistema que lee `GET /api/health` (#197).
 * @pt-BR Página pública de status do sistema que lê `GET /api/health` (#197).
 */
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LanguageSelect from '@/components/LanguageSelect'
import { checkAPI } from '@/lib/api'

export type HealthPayload = {
  status: string
  timestamp?: string
  db?: { ok: boolean; latencyMs?: number }
  uptimeSeconds?: number
  version?: string
}

type LoadState =
  | { kind: 'loading' }
  | { kind: 'ok'; data: HealthPayload }
  | { kind: 'degraded'; data: HealthPayload }
  | { kind: 'unavailable' }

function classifyHealth(data: HealthPayload | null): LoadState {
  if (!data || typeof data.status !== 'string') return { kind: 'unavailable' }
  if (data.status === 'ok') return { kind: 'ok', data }
  return { kind: 'degraded', data }
}

export default function StatusPage() {
  const { t } = useTranslation('status')
  const [state, setState] = useState<LoadState>({ kind: 'loading' })

  const load = useCallback(async () => {
    setState({ kind: 'loading' })
    const data = (await checkAPI()) as HealthPayload | null
    setState(classifyHealth(data))
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const headline =
    state.kind === 'ok'
      ? t('stateOk')
      : state.kind === 'degraded'
        ? t('stateDegraded')
        : state.kind === 'unavailable'
          ? t('stateUnavailable')
          : t('loading')

  const statusTone =
    state.kind === 'ok'
      ? 'text-emerald-800 dark:text-emerald-300'
      : state.kind === 'degraded'
        ? 'text-amber-800 dark:text-amber-300'
        : state.kind === 'unavailable'
          ? 'text-red-800 dark:text-red-300'
          : 'text-slate-700 dark:text-slate-300'

  const detail = state.kind === 'ok' || state.kind === 'degraded' ? state.data : null

  return (
    <main
      className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 dark:bg-slate-900 dark:text-slate-100"
      data-testid="status-page"
    >
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold" data-testid="status-title">
            {t('title')}
          </h1>
          <LanguageSelect />
        </div>
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">{t('intro')}</p>

        <section
          aria-labelledby="status-headline"
          aria-live="polite"
          aria-busy={state.kind === 'loading'}
          data-testid="status-panel"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="status-headline" className={`text-lg font-semibold ${statusTone}`} data-testid="status-headline">
              <span className="sr-only">{t('ariaStatus')}: </span>
              {headline}
            </h2>
            <button
              type="button"
              className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-800 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
              onClick={() => void load()}
              data-testid="status-refresh"
            >
              {t('refresh')}
            </button>
          </div>

          {state.kind === 'loading' && (
            <p className="mt-4 text-sm text-slate-600 dark:text-slate-400" data-testid="status-loading">
              {t('loading')}
            </p>
          )}

          {state.kind === 'unavailable' && (
            <div
              className="mt-4 rounded border border-red-200 bg-red-50 p-4 text-sm text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100"
              role="alert"
              data-testid="status-error"
            >
              <p className="font-semibold">{t('errorTitle')}</p>
              <p className="mt-1">{t('errorBody')}</p>
            </div>
          )}

          {detail && (
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2" data-testid="status-details">
              <div>
                <dt className="font-medium text-slate-600 dark:text-slate-400">{t('apiStatus')}</dt>
                <dd data-testid="status-api-value">{detail.status}</dd>
              </div>
              <div>
                <dt className="font-medium text-slate-600 dark:text-slate-400">{t('database')}</dt>
                <dd data-testid="status-db-value">
                  {detail.db?.ok ? t('dbOk') : t('dbDown')}
                </dd>
              </div>
              {typeof detail.db?.latencyMs === 'number' && (
                <div>
                  <dt className="font-medium text-slate-600 dark:text-slate-400">{t('dbLatency')}</dt>
                  <dd data-testid="status-db-latency">
                    {t('milliseconds', { value: detail.db.latencyMs })}
                  </dd>
                </div>
              )}
              {typeof detail.uptimeSeconds === 'number' && (
                <div>
                  <dt className="font-medium text-slate-600 dark:text-slate-400">{t('uptime')}</dt>
                  <dd data-testid="status-uptime">
                    {t('seconds', { value: detail.uptimeSeconds })}
                  </dd>
                </div>
              )}
              {detail.version && (
                <div>
                  <dt className="font-medium text-slate-600 dark:text-slate-400">{t('version')}</dt>
                  <dd data-testid="status-version">{detail.version}</dd>
                </div>
              )}
              {detail.timestamp && (
                <div className="sm:col-span-2">
                  <dt className="font-medium text-slate-600 dark:text-slate-400">{t('checkedAt')}</dt>
                  <dd data-testid="status-checked-at">
                    <time dateTime={detail.timestamp}>{detail.timestamp}</time>
                  </dd>
                </div>
              )}
            </dl>
          )}
        </section>

        <p>
          <Link
            to="/login"
            className="text-sm font-medium text-blue-700 underline dark:text-blue-400"
            data-testid="status-back-login"
          >
            {t('backToLogin')}
          </Link>
        </p>
      </div>
    </main>
  )
}
