import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  logisticaReportesAPI,
  type LogisticaChoferRow,
  type LogisticaKpis,
  type LogisticaZonaRow,
} from '@/lib/api'
import { downloadCsvBlob } from '@/pages/reportes/reportesExport'
import { resolvePresetRange, type ReportesPreset } from '@/pages/reportes/reportesDatePresets'

function formatRate(value: number | null): string {
  if (value == null) return '—'
  return `${Math.round(value * 1000) / 10}%`
}

export default function LogisticaReportesPanel() {
  const { t } = useTranslation('logisticaReportes')
  const initial = resolvePresetRange('month')
  const [from, setFrom] = useState(initial.from)
  const [to, setTo] = useState(initial.to)
  const [choferId, setChoferId] = useState('')
  const [kpis, setKpis] = useState<LogisticaKpis | null>(null)
  const [choferes, setChoferes] = useState<LogisticaChoferRow[]>([])
  const [zonas, setZonas] = useState<LogisticaZonaRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const queryParams = useCallback(() => {
    const cid = choferId.trim() ? Number.parseInt(choferId, 10) : undefined
    return {
      from,
      to,
      ...(cid !== undefined && Number.isFinite(cid) && cid > 0 ? { choferId: cid } : {}),
    }
  }, [choferId, from, to])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = queryParams()
      const [k, c, z] = await Promise.all([
        logisticaReportesAPI.kpis(params),
        logisticaReportesAPI.reporteChoferes(params),
        logisticaReportesAPI.reporteZonas({ from: params.from, to: params.to }),
      ])
      setKpis(k ?? null)
      setChoferes(c ?? [])
      setZonas(z ?? [])
    } catch {
      setError(t('errors.load'))
      setKpis(null)
      setChoferes([])
      setZonas([])
    } finally {
      setLoading(false)
    }
  }, [queryParams, t])

  useEffect(() => {
    void load()
  }, [load])

  const applyPreset = (preset: ReportesPreset) => {
    const range = resolvePresetRange(preset)
    setFrom(range.from)
    setTo(range.to)
  }

  const motivoLabel = (key: string) => {
    const path = `motivo.${key}` as const
    const translated = t(path)
    return translated === path ? key : translated
  }

  const exportChoferes = async () => {
    const blob = await logisticaReportesAPI.exportChoferesCsv(queryParams())
    if (blob) downloadCsvBlob(blob, 'logistica-choferes.csv')
  }

  const exportZonas = async () => {
    const blob = await logisticaReportesAPI.exportZonasCsv({ from, to })
    if (blob) downloadCsvBlob(blob, 'logistica-zonas.csv')
  }

  return (
    <div data-testid="logistica-reportes-panel">
      <fieldset className="flex flex-wrap gap-4 items-end border-0 p-0 m-0 mb-6">
        <legend className="sr-only">{t('period.from')}</legend>
        <label className="text-sm">
          <span className="block text-slate-600 dark:text-slate-400 mb-1">{t('period.from')}</span>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="border border-slate-300 dark:border-slate-600 rounded px-2 py-1 bg-white dark:bg-slate-800"
            data-testid="logistica-reportes-from"
          />
        </label>
        <label className="text-sm">
          <span className="block text-slate-600 dark:text-slate-400 mb-1">{t('period.to')}</span>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="border border-slate-300 dark:border-slate-600 rounded px-2 py-1 bg-white dark:bg-slate-800"
            data-testid="logistica-reportes-to"
          />
        </label>
        <div className="flex flex-wrap gap-2" role="group" aria-label={t('period.presetMonth')}>
          <button
            type="button"
            onClick={() => applyPreset('today')}
            className="px-3 py-1 text-sm rounded border border-slate-300 dark:border-slate-600"
          >
            {t('period.presetToday')}
          </button>
          <button
            type="button"
            onClick={() => applyPreset('week')}
            className="px-3 py-1 text-sm rounded border border-slate-300 dark:border-slate-600"
          >
            {t('period.presetWeek')}
          </button>
          <button
            type="button"
            onClick={() => applyPreset('month')}
            className="px-3 py-1 text-sm rounded border border-slate-300 dark:border-slate-600"
          >
            {t('period.presetMonth')}
          </button>
        </div>
        <label className="text-sm">
          <span className="block text-slate-600 dark:text-slate-400 mb-1">{t('filters.choferId')}</span>
          <input
            type="number"
            min={1}
            value={choferId}
            onChange={(e) => setChoferId(e.target.value)}
            placeholder={t('filters.allChoferes')}
            className="border border-slate-300 dark:border-slate-600 rounded px-2 py-1 w-32 bg-white dark:bg-slate-800"
            data-testid="logistica-reportes-chofer-filter"
          />
        </label>
        <button
          type="button"
          onClick={() => void load()}
          className="px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded"
          data-testid="logistica-reportes-refresh"
        >
          {t('actions.refresh')}
        </button>
      </fieldset>

      {error && (
        <p className="mb-4 text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-slate-500">{t('loading')}</p>
      ) : (
        <>
          {kpis && (
            <div
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8"
              data-testid="logistica-reportes-kpis"
            >
              <KpiCard label={t('kpis.dispatched')} value={String(kpis.dispatchedCount)} />
              <KpiCard label={t('kpis.firstVisitRate')} value={formatRate(kpis.firstVisitRate)} />
              <KpiCard label={t('kpis.firstVisitDelivered')} value={String(kpis.firstVisitDeliveredCount)} />
              <KpiCard
                label={t('kpis.avgDeliveryMinutes')}
                value={kpis.avgDeliveryMinutes != null ? String(kpis.avgDeliveryMinutes) : '—'}
              />
              <KpiCard label={t('kpis.overdue')} value={String(kpis.overdueCount)} />
            </div>
          )}

          {kpis && kpis.returnsByReason.length > 0 && (
            <section className="mb-8" aria-labelledby="logistica-returns-title">
              <h2 id="logistica-returns-title" className="text-lg font-semibold mb-3">
                {t('kpis.returnsTitle')}
              </h2>
              <ul className="text-sm space-y-1" data-testid="logistica-reportes-returns">
                {kpis.returnsByReason.map((r) => (
                  <li key={r.motivo}>
                    {motivoLabel(r.motivo)}: {r.count}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="mb-8" aria-labelledby="logistica-choferes-title">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <h2 id="logistica-choferes-title" className="text-lg font-semibold">
                {t('tables.choferesTitle')}
              </h2>
              <button
                type="button"
                onClick={() => void exportChoferes()}
                className="px-3 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded"
                data-testid="logistica-reportes-export-choferes"
              >
                {t('actions.exportChoferesCsv')}
              </button>
            </div>
            {choferes.length === 0 ? (
              <p className="text-slate-500">{t('emptyChoferes')}</p>
            ) : (
              <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg">
                <table className="min-w-full text-sm" data-testid="logistica-reportes-choferes-table">
                  <thead className="bg-slate-50 dark:bg-slate-800">
                    <tr>
                      <th className="px-3 py-2 text-left">{t('tables.chofer')}</th>
                      <th className="px-3 py-2 text-left">{t('tables.day')}</th>
                      <th className="px-3 py-2 text-right">{t('tables.dispatched')}</th>
                      <th className="px-3 py-2 text-right">{t('tables.delivered')}</th>
                      <th className="px-3 py-2 text-right">{t('tables.notDelivered')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {choferes.map((row) => (
                      <tr key={`${row.choferId}-${row.day}`} className="border-t border-slate-200 dark:border-slate-700">
                        <td className="px-3 py-2">{row.choferUsername}</td>
                        <td className="px-3 py-2">{row.day}</td>
                        <td className="px-3 py-2 text-right">{row.dispatched}</td>
                        <td className="px-3 py-2 text-right">{row.delivered}</td>
                        <td className="px-3 py-2 text-right">{row.notDelivered}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section aria-labelledby="logistica-zonas-title">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <h2 id="logistica-zonas-title" className="text-lg font-semibold">
                {t('tables.zonasTitle')}
              </h2>
              <button
                type="button"
                onClick={() => void exportZonas()}
                className="px-3 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded"
                data-testid="logistica-reportes-export-zonas"
              >
                {t('actions.exportZonasCsv')}
              </button>
            </div>
            {zonas.length === 0 ? (
              <p className="text-slate-500">{t('emptyZonas')}</p>
            ) : (
              <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg">
                <table className="min-w-full text-sm" data-testid="logistica-reportes-zonas-table">
                  <thead className="bg-slate-50 dark:bg-slate-800">
                    <tr>
                      <th className="px-3 py-2 text-left">{t('tables.zona')}</th>
                      <th className="px-3 py-2 text-right">{t('tables.dispatched')}</th>
                      <th className="px-3 py-2 text-right">{t('tables.delivered')}</th>
                      <th className="px-3 py-2 text-right">{t('tables.notDelivered')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {zonas.map((row) => (
                      <tr
                        key={row.zonaId ?? 'none'}
                        className="border-t border-slate-200 dark:border-slate-700"
                      >
                        <td className="px-3 py-2">{row.zonaNombre}</td>
                        <td className="px-3 py-2 text-right">{row.dispatched}</td>
                        <td className="px-3 py-2 text-right">{row.delivered}</td>
                        <td className="px-3 py-2 text-right">{row.notDelivered}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4 bg-white dark:bg-slate-900">
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{label}</p>
      <p className="text-xl font-semibold text-slate-900 dark:text-slate-100">{value}</p>
    </div>
  )
}
