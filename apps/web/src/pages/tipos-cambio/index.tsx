import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import type { MonedaFx, TipoCambioRow, TipoCambioTipo } from '@bizcode/types'
import { MONEDAS_FX, TIPOS_CAMBIO } from '@bizcode/types'
import { tiposCambioAPI } from '@/lib/api'
import { CanAccess } from '@/components/CanAccess'
import ErrorBoundary from '@/components/ErrorBoundary'

type ActionState = 'idle' | 'preference' | 'manual' | 'sync'

export default function TiposCambioPage() {
  const { t, i18n } = useTranslation('tiposCambio')
  const [rows, setRows] = useState<TipoCambioRow[]>([])
  const [preferred, setPreferred] = useState<TipoCambioTipo>('oficial')
  const [moneda, setMoneda] = useState<MonedaFx>('USD')
  const [tipo, setTipo] = useState<TipoCambioTipo>('manual')
  const [valor, setValor] = useState('')
  const [fecha, setFecha] = useState('')
  const [loading, setLoading] = useState(true)
  const [action, setAction] = useState<ActionState>('idle')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [history, preference] = await Promise.all([
        tiposCambioAPI.list({ limit: 100, offset: 0 }),
        tiposCambioAPI.getPreferido(),
      ])
      setRows(history.data)
      setPreferred(preference.tipoCambioPreferido)
    } catch {
      setError(t('errors.load'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const savePreference = async () => {
    setAction('preference')
    setError(null)
    setSuccess(null)
    try {
      await tiposCambioAPI.setPreferido(preferred)
      setSuccess(t('success.preference'))
    } catch {
      setError(t('errors.preference'))
    } finally {
      setAction('idle')
    }
  }

  const submitManual = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const numericValue = Number(valor)
    if (!Number.isFinite(numericValue) || numericValue <= 0) {
      setError(t('errors.invalidValue'))
      return
    }

    setAction('manual')
    setError(null)
    setSuccess(null)
    try {
      await tiposCambioAPI.createManual({
        moneda,
        tipo,
        valor: numericValue,
        ...(fecha ? { fecha } : {}),
      })
      setValor('')
      setFecha('')
      setSuccess(t('success.manual'))
      await loadData()
    } catch {
      setError(t('errors.manual'))
    } finally {
      setAction('idle')
    }
  }

  const syncBcra = async () => {
    setAction('sync')
    setError(null)
    setSuccess(null)
    try {
      await tiposCambioAPI.syncBcra('USD')
      setSuccess(t('success.sync'))
      await loadData()
    } catch {
      setError(t('errors.sync'))
    } finally {
      setAction('idle')
    }
  }

  const formatDate = (value: string) =>
    new Intl.DateTimeFormat(i18n.resolvedLanguage ?? i18n.language, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value))

  return (
    <ErrorBoundary>
      <main className="space-y-6 p-6" data-testid="tipos-cambio-page">
        <header>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('title')}</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">{t('subtitle')}</p>
        </header>

        {error ? (
          <div
            role="alert"
            className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200"
            data-testid="tipos-cambio-error"
          >
            {error}
          </div>
        ) : null}
        {success ? (
          <p
            role="status"
            className="rounded border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
            data-testid="tipos-cambio-success"
          >
            {success}
          </p>
        ) : null}

        <CanAccess permission="settings.business.manage">
          <section
            className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
            aria-labelledby="preferred-rate-title"
          >
            <h2 id="preferred-rate-title" className="mb-3 text-lg font-semibold">
              {t('preference.title')}
            </h2>
            <div className="flex flex-wrap items-end gap-3">
              <label htmlFor="preferred-rate-type" className="text-sm font-medium">
                {t('preference.label')}
                <select
                  id="preferred-rate-type"
                  value={preferred}
                  onChange={(event) => setPreferred(event.target.value as TipoCambioTipo)}
                  className="mt-1 block rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-700"
                  data-testid="tipos-cambio-preferred"
                >
                  {TIPOS_CAMBIO.map((value) => (
                    <option key={value} value={value}>
                      {t(`types.${value}`)}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                onClick={() => void savePreference()}
                disabled={action !== 'idle'}
                className="rounded bg-blue-600 px-4 py-2 font-semibold text-white disabled:opacity-50"
                data-testid="tipos-cambio-save-preferred"
              >
                {action === 'preference' ? t('actions.saving') : t('actions.savePreference')}
              </button>
            </div>
          </section>
        </CanAccess>

        <CanAccess permission="products.manage">
          <section
            className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
            aria-labelledby="manual-rate-title"
          >
            <h2 id="manual-rate-title" className="mb-3 text-lg font-semibold">
              {t('manual.title')}
            </h2>
            <form
              onSubmit={(event) => void submitManual(event)}
              className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5"
              data-testid="tipos-cambio-manual-form"
            >
              <label htmlFor="manual-rate-currency" className="text-sm font-medium">
                {t('fields.currency')}
                <select
                  id="manual-rate-currency"
                  value={moneda}
                  onChange={(event) => setMoneda(event.target.value as MonedaFx)}
                  className="mt-1 block w-full rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-700"
                  data-testid="tipos-cambio-moneda"
                >
                  {MONEDAS_FX.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </label>
              <label htmlFor="manual-rate-type" className="text-sm font-medium">
                {t('fields.type')}
                <select
                  id="manual-rate-type"
                  value={tipo}
                  onChange={(event) => setTipo(event.target.value as TipoCambioTipo)}
                  className="mt-1 block w-full rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-700"
                  data-testid="tipos-cambio-tipo"
                >
                  {TIPOS_CAMBIO.map((value) => (
                    <option key={value} value={value}>
                      {t(`types.${value}`)}
                    </option>
                  ))}
                </select>
              </label>
              <label htmlFor="manual-rate-value" className="text-sm font-medium">
                {t('fields.value')}
                <input
                  id="manual-rate-value"
                  type="number"
                  min="0.0001"
                  step="0.0001"
                  required
                  value={valor}
                  onChange={(event) => setValor(event.target.value)}
                  className="mt-1 block w-full rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-700"
                  data-testid="tipos-cambio-valor"
                />
              </label>
              <label htmlFor="manual-rate-date" className="text-sm font-medium">
                {t('fields.date')}
                <input
                  id="manual-rate-date"
                  type="date"
                  value={fecha}
                  onChange={(event) => setFecha(event.target.value)}
                  className="mt-1 block w-full rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-700"
                  data-testid="tipos-cambio-fecha"
                />
              </label>
              <button
                type="submit"
                disabled={action !== 'idle'}
                className="self-end rounded bg-blue-600 px-4 py-2 font-semibold text-white disabled:opacity-50"
                data-testid="tipos-cambio-save-manual"
              >
                {action === 'manual' ? t('actions.saving') : t('actions.saveManual')}
              </button>
            </form>

            <div className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-700">
              <button
                type="button"
                onClick={() => void syncBcra()}
                disabled={action !== 'idle'}
                className="rounded bg-slate-800 px-4 py-2 font-semibold text-white disabled:opacity-50 dark:bg-slate-600"
                data-testid="tipos-cambio-sync-bcra"
              >
                {action === 'sync' ? t('actions.syncing') : t('actions.syncBcra')}
              </button>
            </div>
          </section>
        </CanAccess>

        <section aria-labelledby="rate-history-title">
          <h2 id="rate-history-title" className="mb-3 text-lg font-semibold">
            {t('history.title')}
          </h2>
          {loading ? (
            <p role="status" aria-busy="true" data-testid="tipos-cambio-loading">
              {t('states.loading')}
            </p>
          ) : rows.length === 0 ? (
            <p className="text-slate-600 dark:text-slate-400" data-testid="tipos-cambio-empty">
              {t('states.empty')}
            </p>
          ) : (
            <div className="overflow-x-auto rounded border border-slate-200 dark:border-slate-700">
              <table className="w-full text-left text-sm" data-testid="tipos-cambio-table">
                <caption className="sr-only">{t('history.caption')}</caption>
                <thead className="bg-slate-100 dark:bg-slate-700">
                  <tr>
                    <th scope="col" className="px-3 py-2">{t('fields.date')}</th>
                    <th scope="col" className="px-3 py-2">{t('fields.currency')}</th>
                    <th scope="col" className="px-3 py-2">{t('fields.type')}</th>
                    <th scope="col" className="px-3 py-2 text-right">{t('fields.value')}</th>
                    <th scope="col" className="px-3 py-2">{t('fields.source')}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id} className="border-t border-slate-200 dark:border-slate-700">
                      <td className="px-3 py-2">{formatDate(row.fecha)}</td>
                      <td className="px-3 py-2">{row.moneda}</td>
                      <td className="px-3 py-2">{t(`types.${row.tipo}`)}</td>
                      <td className="px-3 py-2 text-right font-mono">{row.valor}</td>
                      <td className="px-3 py-2">{t(`sources.${row.fuente}`)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </ErrorBoundary>
  )
}
