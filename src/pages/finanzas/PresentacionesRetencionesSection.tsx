import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import AsyncWrapper from '@/components/shared/AsyncWrapper'
import {
  fiscalPresentacionesAPI,
  type PresentacionPreviewDto,
  type PresentacionRetencionDto,
} from '@/lib/api'

function currentPeriodo(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

function formatMoney(value: string): string {
  const n = Number.parseFloat(value)
  if (Number.isNaN(n)) return value
  return n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })
}

function formatDate(value: string): string {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString('es-AR')
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

/**
 * @en Monthly SICORE/SIFERE presentation UI (#242).
 * @es UI de presentaciones mensuales SICORE/SIFERE (#242).
 * @pt-BR UI de apresentações mensais SICORE/SIFERE (#242).
 */
export default function PresentacionesRetencionesSection() {
  const { t } = useTranslation('finanzas')
  const [formato, setFormato] = useState<'sicore' | 'sifere'>('sicore')
  const [periodo, setPeriodo] = useState(currentPeriodo)
  const [preview, setPreview] = useState<PresentacionPreviewDto | null>(null)
  const [historial, setHistorial] = useState<PresentacionRetencionDto[]>([])
  const [loading, setLoading] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [generating, setGenerating] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [actionId, setActionId] = useState<number | null>(null)

  const periodoInput = useMemo(() => {
    const [y, m] = periodo.split('-')
    if (!y || !m) return { year: String(new Date().getFullYear()), month: '01' }
    return { year: y, month: m }
  }, [periodo])

  const loadPreview = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fiscalPresentacionesAPI.preview({ formato, periodo })
      setPreview(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)))
      setPreview(null)
    } finally {
      setLoading(false)
    }
  }, [formato, periodo])

  const loadHistorial = useCallback(async () => {
    setHistoryLoading(true)
    try {
      const data = await fiscalPresentacionesAPI.listar()
      setHistorial(data)
    } catch {
      setHistorial([])
    } finally {
      setHistoryLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadPreview()
  }, [loadPreview])

  useEffect(() => {
    void loadHistorial()
  }, [loadHistorial])

  const handlePeriodoChange = (year: string, month: string) => {
    setPeriodo(`${year}-${month.padStart(2, '0')}`)
  }

  const handleGenerate = async () => {
    setGenerating(true)
    setActionError(null)
    try {
      const created = await fiscalPresentacionesAPI.generar({ formato, periodo })
      const blob = await fiscalPresentacionesAPI.downloadArchivo(created.id)
      downloadBlob(blob, `presentacion-${formato}-${periodo}.txt`)
      await loadHistorial()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : t('presentaciones.generateError'))
    } finally {
      setGenerating(false)
    }
  }

  const handleMarkPresented = async (id: number) => {
    setActionId(id)
    setActionError(null)
    try {
      await fiscalPresentacionesAPI.marcarPresentado(id)
      await loadHistorial()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : String(err))
    } finally {
      setActionId(null)
    }
  }

  const handleDownloadHistory = async (row: PresentacionRetencionDto) => {
    setActionId(row.id)
    setActionError(null)
    try {
      const blob = await fiscalPresentacionesAPI.downloadArchivo(row.id)
      downloadBlob(blob, `presentacion-${row.formato}-${row.periodo}.txt`)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : String(err))
    } finally {
      setActionId(null)
    }
  }

  return (
    <section
      className="mt-8"
      aria-labelledby="finanzas-presentaciones-heading"
      data-testid="presentaciones-section"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2
            id="finanzas-presentaciones-heading"
            className="text-lg font-semibold text-slate-900 dark:text-slate-100"
          >
            {t('presentaciones.title')}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t('presentaciones.subtitle')}</p>
        </div>
        <button
          type="button"
          className="px-3 py-1 rounded border border-slate-300 dark:border-slate-600"
          onClick={() => {
            void loadPreview()
            void loadHistorial()
          }}
          data-testid="presentaciones-refresh"
          aria-label={t('presentaciones.refresh')}
        >
          ↻
        </button>
      </div>

      <div className="mb-4 flex flex-wrap gap-3" role="tablist" aria-label={t('presentaciones.title')}>
        {(['sicore', 'sifere'] as const).map((f) => (
          <button
            key={f}
            type="button"
            role="tab"
            aria-selected={formato === f ? 'true' : 'false'}
            className={`px-3 py-1 rounded border ${
              formato === f
                ? 'border-blue-600 bg-blue-50 dark:bg-blue-950'
                : 'border-slate-300 dark:border-slate-600'
            }`}
            onClick={() => setFormato(f)}
            data-testid={`presentaciones-tab-${f}`}
          >
            {f === 'sicore' ? t('presentaciones.formatoSicore') : t('presentaciones.formatoSifere')}
          </button>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="presentaciones-periodo-month" className="block text-xs text-slate-500 mb-1">
            {t('periodoMonth')}
          </label>
          <select
            id="presentaciones-periodo-month"
            value={periodoInput.month}
            onChange={(e) => handlePeriodoChange(periodoInput.year, e.target.value)}
            className="rounded border border-slate-300 dark:border-slate-600 px-2 py-1"
            data-testid="presentaciones-periodo-month"
          >
            {Array.from({ length: 12 }, (_, i) => {
              const m = String(i + 1).padStart(2, '0')
              return (
                <option key={m} value={m}>
                  {m}
                </option>
              )
            })}
          </select>
        </div>
        <div>
          <label htmlFor="presentaciones-periodo-year" className="block text-xs text-slate-500 mb-1">
            {t('periodoYear')}
          </label>
          <input
            id="presentaciones-periodo-year"
            type="number"
            min={2000}
            max={2100}
            value={periodoInput.year}
            onChange={(e) => handlePeriodoChange(e.target.value, periodoInput.month)}
            className="w-24 rounded border border-slate-300 dark:border-slate-600 px-2 py-1"
            data-testid="presentaciones-periodo-year"
          />
        </div>
        <button
          type="button"
          className="px-3 py-1 rounded border border-slate-300 dark:border-slate-600"
          onClick={() => void loadPreview()}
          data-testid="presentaciones-preview-btn"
        >
          {t('presentaciones.preview')}
        </button>
      </div>

      {actionError ? (
        <p className="mb-3 text-sm text-red-600" role="alert" data-testid="presentaciones-action-error">
          {actionError}
        </p>
      ) : null}

      <AsyncWrapper loading={loading} error={error} loadingMessage={t('presentaciones.preview')}>
        {preview ? (
          <>
            <p
              className="mb-2 text-sm text-slate-600 dark:text-slate-300"
              data-testid="presentaciones-can-generate"
            >
              {preview.canGenerate
                ? t('presentaciones.canGenerate')
                : t('presentaciones.cannotGenerate')}
            </p>

            {preview.warnings.length > 0 ? (
              <div
                className="mb-4 rounded border border-amber-300 bg-amber-50 dark:bg-amber-950/30 p-3"
                role="status"
                aria-live="polite"
                data-testid="presentaciones-warnings"
              >
                <h3 className="text-sm font-semibold mb-1">{t('presentaciones.warnings')}</h3>
                <ul className="list-disc pl-5 text-sm">
                  {preview.warnings.map((w) => (
                    <li key={`${w.code}-${w.retencionId}`}>{w.message}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="mb-4 text-sm text-slate-500">{t('presentaciones.warningsEmpty')}</p>
            )}

            {preview.totalesPorRegimen.length > 0 ? (
              <div className="mb-4" data-testid="presentaciones-totales">
                <h3 className="text-sm font-semibold mb-2">{t('presentaciones.totalsByRegimen')}</h3>
                <table className="min-w-full text-sm border border-slate-200 dark:border-slate-600">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800">
                      <th className="px-2 py-1 text-left">{t('presentaciones.colRegimen')}</th>
                      <th className="px-2 py-1 text-right">{t('presentaciones.colOperaciones')}</th>
                      <th className="px-2 py-1 text-right">{t('presentaciones.colTotal')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.totalesPorRegimen.map((row) => (
                      <tr key={row.regimenNombre}>
                        <td className="px-2 py-1">{row.regimenNombre}</td>
                        <td className="px-2 py-1 text-right">{row.operaciones}</td>
                        <td className="px-2 py-1 text-right">{formatMoney(row.totalImporte)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}

            <div className="overflow-x-auto mb-4">
              <table
                className="min-w-full text-sm border border-slate-200 dark:border-slate-600"
                data-testid="presentaciones-preview-table"
              >
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800">
                    <th className="px-2 py-1 text-left">{t('presentaciones.colFecha')}</th>
                    <th className="px-2 py-1 text-left">{t('presentaciones.colCuit')}</th>
                    <th className="px-2 py-1 text-left">{t('presentaciones.colDenominacion')}</th>
                    <th className="px-2 py-1 text-left">{t('presentaciones.colRegimen')}</th>
                    <th className="px-2 py-1 text-right">{t('presentaciones.colBase')}</th>
                    <th className="px-2 py-1 text-right">{t('presentaciones.colImporte')}</th>
                    <th className="px-2 py-1 text-center">{t('presentaciones.colIncluida')}</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.filas.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-2 py-3 text-center text-slate-500">
                        {t('presentaciones.cannotGenerate')}
                      </td>
                    </tr>
                  ) : (
                    preview.filas.map((fila) => (
                      <tr key={fila.retencionId}>
                        <td className="px-2 py-1">{formatDate(fila.fecha)}</td>
                        <td className="px-2 py-1">{fila.cuit || '—'}</td>
                        <td className="px-2 py-1">{fila.denominacion}</td>
                        <td className="px-2 py-1">{fila.regimenNombre}</td>
                        <td className="px-2 py-1 text-right">{formatMoney(fila.baseImponible)}</td>
                        <td className="px-2 py-1 text-right">{formatMoney(fila.importe)}</td>
                        <td className="px-2 py-1 text-center">
                          {fila.incluida ? t('presentaciones.yes') : t('presentaciones.no')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <button
              type="button"
              disabled={!preview.canGenerate || generating}
              className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
              onClick={() => void handleGenerate()}
              data-testid="presentaciones-download-btn"
            >
              {generating ? t('presentaciones.downloading') : t('presentaciones.download')}
            </button>
          </>
        ) : null}
      </AsyncWrapper>

      <div className="mt-8">
        <h3 className="text-md font-semibold mb-2">{t('presentaciones.history')}</h3>
        <AsyncWrapper loading={historyLoading} error={null}>
          {historial.length === 0 ? (
            <p className="text-sm text-slate-500" data-testid="presentaciones-history-empty">
              {t('presentaciones.historyEmpty')}
            </p>
          ) : (
            <table
              className="min-w-full text-sm border border-slate-200 dark:border-slate-600"
              data-testid="presentaciones-history-table"
            >
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800">
                  <th className="px-2 py-1 text-left">{t('presentaciones.colPeriodo')}</th>
                  <th className="px-2 py-1 text-left">{t('presentaciones.colFormato')}</th>
                  <th className="px-2 py-1 text-right">{t('presentaciones.colOperaciones')}</th>
                  <th className="px-2 py-1 text-right">{t('presentaciones.colTotal')}</th>
                  <th className="px-2 py-1 text-left">{t('presentaciones.colGenerado')}</th>
                  <th className="px-2 py-1 text-left">{t('presentaciones.colPresentado')}</th>
                  <th className="px-2 py-1 text-left">{t('presentaciones.colAcciones')}</th>
                </tr>
              </thead>
              <tbody>
                {historial.map((row) => (
                  <tr key={row.id}>
                    <td className="px-2 py-1">{row.periodo}</td>
                    <td className="px-2 py-1 uppercase">{row.formato}</td>
                    <td className="px-2 py-1 text-right">{row.totalOperaciones}</td>
                    <td className="px-2 py-1 text-right">{formatMoney(row.totalImporte)}</td>
                    <td className="px-2 py-1">{formatDate(row.createdAt)}</td>
                    <td className="px-2 py-1">
                      {row.presentadoAt ? formatDate(row.presentadoAt) : '—'}
                    </td>
                    <td className="px-2 py-1 flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="text-blue-600 underline text-xs"
                        disabled={actionId === row.id}
                        onClick={() => void handleDownloadHistory(row)}
                        data-testid={`presentaciones-history-download-${row.id}`}
                      >
                        {t('presentaciones.download')}
                      </button>
                      {!row.presentadoAt ? (
                        <button
                          type="button"
                          className="text-blue-600 underline text-xs"
                          disabled={actionId === row.id}
                          onClick={() => void handleMarkPresented(row.id)}
                          data-testid={`presentaciones-history-mark-${row.id}`}
                        >
                          {t('presentaciones.markPresented')}
                        </button>
                      ) : (
                        <span className="text-xs text-green-700">{t('presentaciones.markedPresented')}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </AsyncWrapper>
      </div>
    </section>
  )
}
