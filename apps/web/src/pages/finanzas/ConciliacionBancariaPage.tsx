/**
 * @en Bank reconciliation UI (#191): review matched/suggested/unmatched movements, run the
 * matching engine, export the state to Excel, and lock/unlock a YYYY-MM period.
 * @es UI de conciliación bancaria (#191): revisa movimientos conciliados/sugeridos/pendientes,
 * ejecuta el motor de matching, exporta el estado a Excel, y bloquea/desbloquea un período YYYY-MM.
 * @pt-BR UI de conciliação bancária (#191): revisa movimentos conciliados/sugeridos/pendentes,
 * executa o motor de matching, exporta o estado para Excel, e bloqueia/desbloqueia um período YYYY-MM.
 */
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CanAccess } from '@/components/CanAccess'
import ErrorBoundary from '@/components/ErrorBoundary'
import AsyncWrapper from '@/components/shared/AsyncWrapper'
import {
  bancosAPI,
  type ConciliacionMovimientoDTO,
  type ConciliadoTipo,
  type CuentaBancariaDTO,
  type MatchEstado,
} from '@/lib/api'

function formatMoney(value: string | number): string {
  const n = typeof value === 'number' ? value : Number.parseFloat(String(value))
  if (Number.isNaN(n)) return String(value)
  return n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })
}

function formatDate(value: string): string {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString('es-AR')
}

function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

function monthRange(): { desde: string; hasta: string; periodo: string } {
  const now = new Date()
  const y = now.getFullYear()
  const m = now.getMonth()
  const lastDay = new Date(y, m + 1, 0).getDate()
  return {
    desde: `${y}-${pad2(m + 1)}-01`,
    hasta: `${y}-${pad2(m + 1)}-${pad2(lastDay)}`,
    periodo: `${y}-${pad2(m + 1)}`,
  }
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

const ESTADO_BADGE_CLASSES: Record<MatchEstado, string> = {
  matched_auto: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  matched_manual: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  suggested: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  unmatched: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  ignored: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
  bank_fee: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
}

type RowDraft = { tipo: ConciliadoTipo; id: string; busy: boolean; error: string | null }

function emptyDraft(): RowDraft {
  return { tipo: 'cobro', id: '', busy: false, error: null }
}

export default function ConciliacionBancariaPage() {
  const { t } = useTranslation('finanzas')

  return (
    <CanAccess
      permission="reports.financial.read"
      fallback={
        <div className="p-8" data-testid="conciliacion-bancaria-forbidden">
          <p className="text-slate-600 dark:text-slate-300">{t('forbidden')}</p>
        </div>
      }
    >
      <ConciliacionBancariaPageContent />
    </CanAccess>
  )
}

function ConciliacionBancariaPageContent() {
  const { t } = useTranslation('finanzas')
  const defaults = useMemo(() => monthRange(), [])

  const [cuentas, setCuentas] = useState<CuentaBancariaDTO[]>([])
  const [cuentasLoading, setCuentasLoading] = useState(true)
  const [cuentasError, setCuentasError] = useState<Error | null>(null)
  const [cuentaId, setCuentaId] = useState<number | null>(null)

  const [desde, setDesde] = useState(defaults.desde)
  const [hasta, setHasta] = useState(defaults.hasta)
  const [periodo, setPeriodo] = useState(defaults.periodo)

  const [movimientos, setMovimientos] = useState<ConciliacionMovimientoDTO[]>([])
  const [summary, setSummary] = useState<{
    total: number
    unmatched: number
    suggested: number
    matchedAuto: number
    matchedManual: number
    ignored: number
    bankFees: number
    openCandidates: { recibosForma: number; cobros: number }
  } | null>(null)
  const [dataLoading, setDataLoading] = useState(false)
  const [dataError, setDataError] = useState<Error | null>(null)

  const [running, setRunning] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [lockBusy, setLockBusy] = useState(false)
  const [feedback, setFeedback] = useState<{ tone: 'ok' | 'error'; message: string } | null>(null)
  const [drafts, setDrafts] = useState<Record<number, RowDraft>>({})

  const loadCuentas = useCallback(async () => {
    setCuentasLoading(true)
    setCuentasError(null)
    try {
      const data = await bancosAPI.listCuentas()
      setCuentas(data ?? [])
      setCuentaId((prev) => prev ?? data?.[0]?.id ?? null)
    } catch (error) {
      setCuentasError(error instanceof Error ? error : new Error(String(error)))
    } finally {
      setCuentasLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadCuentas()
  }, [loadCuentas])

  const loadConciliacion = useCallback(async () => {
    if (cuentaId == null) return
    setDataLoading(true)
    setDataError(null)
    try {
      const data = await bancosAPI.getConciliacion(cuentaId, { desde, hasta })
      setMovimientos(data?.movimientos ?? [])
      setSummary(data?.summary ?? null)
      setDrafts((prev) => {
        const next: Record<number, RowDraft> = {}
        for (const mov of data?.movimientos ?? []) {
          next[mov.id] = prev[mov.id] ?? emptyDraft()
        }
        return next
      })
    } catch (error) {
      setDataError(error instanceof Error ? error : new Error(String(error)))
    } finally {
      setDataLoading(false)
    }
  }, [cuentaId, desde, hasta])

  useEffect(() => {
    void loadConciliacion()
  }, [loadConciliacion])

  const updateDraft = (movId: number, patch: Partial<RowDraft>) => {
    setDrafts((prev) => ({ ...prev, [movId]: { ...(prev[movId] ?? emptyDraft()), ...patch } }))
  }

  const handleRunMatching = async () => {
    if (cuentaId == null) return
    setRunning(true)
    setFeedback(null)
    try {
      const result = await bancosAPI.runMatching(cuentaId, { desde, hasta })
      setFeedback({
        tone: 'ok',
        message: t('bancos.conciliacion.runSuccess', {
          processed: result.processed,
          autoMatched: result.autoMatched,
          suggested: result.suggested,
        }),
      })
      await loadConciliacion()
    } catch (error) {
      setFeedback({
        tone: 'error',
        message: error instanceof Error ? error.message : t('bancos.conciliacion.runError'),
      })
    } finally {
      setRunning(false)
    }
  }

  const handleExport = async () => {
    if (cuentaId == null) return
    setExporting(true)
    setFeedback(null)
    try {
      const blob = await bancosAPI.exportExcel(cuentaId, { desde, hasta })
      downloadBlob(blob, `conciliacion-bancaria-${cuentaId}.xlsx`)
    } catch (error) {
      setFeedback({
        tone: 'error',
        message: error instanceof Error ? error.message : t('bancos.conciliacion.exportError'),
      })
    } finally {
      setExporting(false)
    }
  }

  const periodoValid = /^\d{4}-\d{2}$/.test(periodo)
  const periodoLocked = movimientos.some((m) => m.periodoLocked)

  const handleLock = async () => {
    if (cuentaId == null || !periodoValid) return
    setLockBusy(true)
    setFeedback(null)
    try {
      await bancosAPI.lockPeriodo(cuentaId, periodo)
      setFeedback({ tone: 'ok', message: t('bancos.conciliacion.lockSuccess', { periodo }) })
      await loadConciliacion()
    } catch (error) {
      setFeedback({
        tone: 'error',
        message: error instanceof Error ? error.message : t('bancos.conciliacion.actionError'),
      })
    } finally {
      setLockBusy(false)
    }
  }

  const handleUnlock = async () => {
    if (cuentaId == null || !periodoValid) return
    setLockBusy(true)
    setFeedback(null)
    try {
      await bancosAPI.unlockPeriodo(cuentaId, periodo)
      setFeedback({ tone: 'ok', message: t('bancos.conciliacion.unlockSuccess', { periodo }) })
      await loadConciliacion()
    } catch (error) {
      setFeedback({
        tone: 'error',
        message: error instanceof Error ? error.message : t('bancos.conciliacion.actionError'),
      })
    } finally {
      setLockBusy(false)
    }
  }

  const runRowAction = async (
    movId: number,
    action: () => Promise<ConciliacionMovimientoDTO>,
  ): Promise<void> => {
    updateDraft(movId, { busy: true, error: null })
    try {
      const updated = await action()
      setMovimientos((prev) => prev.map((m) => (m.id === movId ? updated : m)))
    } catch (error) {
      updateDraft(movId, { error: error instanceof Error ? error.message : String(error) })
    } finally {
      updateDraft(movId, { busy: false })
    }
  }

  const handleConfirmSugerencia = (movId: number) =>
    runRowAction(movId, () => bancosAPI.confirmarSugerencia(movId))

  const handleIgnorar = (movId: number) => runRowAction(movId, () => bancosAPI.ignorar(movId))

  const handleGastoBancario = (movId: number) =>
    runRowAction(movId, () => bancosAPI.marcarGastoBancario(movId))

  const handleConciliarManual = (movId: number) => {
    const draft = drafts[movId] ?? emptyDraft()
    const id = Number.parseInt(draft.id.trim(), 10)
    if (!Number.isFinite(id) || id <= 0) {
      updateDraft(movId, { error: t('bancos.conciliacion.manualIdInvalid') })
      return
    }
    void runRowAction(movId, () => bancosAPI.conciliar(movId, { tipo: draft.tipo, id }))
  }

  return (
    <ErrorBoundary>
      <div className="p-6" data-testid="conciliacion-bancaria-page">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {t('bancos.conciliacion.title')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">{t('bancos.conciliacion.subtitle')}</p>
          <Link to="/finanzas" className="text-blue-600 hover:underline text-sm mt-2 inline-block">
            {t('bancos.conciliacion.backToFinance')}
          </Link>
        </header>

        <AsyncWrapper loading={cuentasLoading} error={cuentasError}>
          {cuentas.length === 0 ? (
            <p className="text-slate-500" data-testid="conciliacion-bancaria-no-cuentas">
              {t('bancos.conciliacion.noCuentas')}
            </p>
          ) : (
            <>
              <div className="mb-4 flex flex-wrap items-end gap-3" data-testid="conciliacion-bancaria-controls">
                <div>
                  <label htmlFor="conciliacion-bancaria-cuenta" className="block text-xs text-slate-500 mb-1">
                    {t('bancos.conciliacion.cuenta')}
                  </label>
                  <select
                    id="conciliacion-bancaria-cuenta"
                    data-testid="conciliacion-bancaria-cuenta"
                    className="border border-slate-300 dark:border-slate-600 rounded px-2 py-1 bg-white dark:bg-slate-800"
                    value={cuentaId ?? ''}
                    onChange={(e) => setCuentaId(Number.parseInt(e.target.value, 10))}
                  >
                    {cuentas.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.banco} — {c.cbu}
                        {c.alias ? ` (${c.alias})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="conciliacion-bancaria-desde" className="block text-xs text-slate-500 mb-1">
                    {t('bancos.conciliacion.desde')}
                  </label>
                  <input
                    id="conciliacion-bancaria-desde"
                    data-testid="conciliacion-bancaria-desde"
                    type="date"
                    className="border border-slate-300 dark:border-slate-600 rounded px-2 py-1 bg-white dark:bg-slate-800"
                    value={desde}
                    onChange={(e) => setDesde(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="conciliacion-bancaria-hasta" className="block text-xs text-slate-500 mb-1">
                    {t('bancos.conciliacion.hasta')}
                  </label>
                  <input
                    id="conciliacion-bancaria-hasta"
                    data-testid="conciliacion-bancaria-hasta"
                    type="date"
                    className="border border-slate-300 dark:border-slate-600 rounded px-2 py-1 bg-white dark:bg-slate-800"
                    value={hasta}
                    onChange={(e) => setHasta(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="conciliacion-bancaria-periodo" className="block text-xs text-slate-500 mb-1">
                    {t('bancos.conciliacion.periodo')}
                  </label>
                  <input
                    id="conciliacion-bancaria-periodo"
                    data-testid="conciliacion-bancaria-periodo"
                    type="text"
                    placeholder="YYYY-MM"
                    className="border border-slate-300 dark:border-slate-600 rounded px-2 py-1 bg-white dark:bg-slate-800 w-28 font-mono"
                    value={periodo}
                    onChange={(e) => setPeriodo(e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  data-testid="conciliacion-bancaria-run"
                  className="px-4 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                  disabled={running || cuentaId == null}
                  onClick={() => void handleRunMatching()}
                >
                  {running ? t('bancos.conciliacion.running') : t('bancos.conciliacion.run')}
                </button>
                <button
                  type="button"
                  data-testid="conciliacion-bancaria-export"
                  className="px-4 py-1 rounded border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
                  disabled={exporting || cuentaId == null}
                  onClick={() => void handleExport()}
                >
                  {exporting ? t('bancos.conciliacion.exporting') : t('bancos.conciliacion.export')}
                </button>
                <button
                  type="button"
                  data-testid="conciliacion-bancaria-lock"
                  className="px-4 py-1 rounded bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50"
                  disabled={lockBusy || cuentaId == null || !periodoValid}
                  onClick={() => void handleLock()}
                >
                  {t('bancos.conciliacion.lock')}
                </button>
                <button
                  type="button"
                  data-testid="conciliacion-bancaria-unlock"
                  className="px-4 py-1 rounded border border-amber-500 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950 disabled:opacity-50"
                  disabled={lockBusy || cuentaId == null || !periodoValid}
                  onClick={() => void handleUnlock()}
                >
                  {t('bancos.conciliacion.unlock')}
                </button>
                {periodoLocked && (
                  <span
                    className="text-xs font-semibold px-2 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
                    data-testid="conciliacion-bancaria-periodo-locked-badge"
                  >
                    {t('bancos.conciliacion.periodoLockedBadge')}
                  </span>
                )}
              </div>

              <div
                id="conciliacion-bancaria-feedback"
                role="status"
                aria-live="polite"
                className="mb-4 min-h-[1.25rem] text-sm"
                data-testid="conciliacion-bancaria-feedback"
              >
                {feedback && (
                  <p
                    className={
                      feedback.tone === 'ok'
                        ? 'text-green-700 dark:text-green-400'
                        : 'text-red-700 dark:text-red-400'
                    }
                  >
                    {feedback.message}
                  </p>
                )}
              </div>

              {summary && (
                <dl
                  className="mb-6 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-sm"
                  data-testid="conciliacion-bancaria-summary"
                >
                  {(
                    [
                      ['total', summary.total],
                      ['unmatched', summary.unmatched],
                      ['suggested', summary.suggested],
                      ['matchedAuto', summary.matchedAuto],
                      ['matchedManual', summary.matchedManual],
                      ['ignored', summary.ignored],
                      ['bankFees', summary.bankFees],
                    ] as const
                  ).map(([key, value]) => (
                    <div key={key} className="rounded border border-slate-200 dark:border-slate-700 p-2">
                      <dt className="text-xs text-slate-500">{t(`bancos.conciliacion.summary.${key}`)}</dt>
                      <dd className="font-mono font-semibold">{value}</dd>
                    </div>
                  ))}
                </dl>
              )}

              <AsyncWrapper loading={dataLoading} error={dataError}>
                {movimientos.length === 0 ? (
                  <p className="text-slate-500" data-testid="conciliacion-bancaria-empty">
                    {t('bancos.conciliacion.empty')}
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm" data-testid="conciliacion-bancaria-table">
                      <caption className="sr-only">{t('bancos.conciliacion.title')}</caption>
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-700 text-left">
                          <th scope="col" className="py-2 pr-3">
                            {t('bancos.conciliacion.colExtracto')}
                          </th>
                          <th scope="col" className="py-2 pr-3">
                            {t('bancos.conciliacion.colEstado')}
                          </th>
                          <th scope="col" className="py-2 pr-3">
                            {t('bancos.conciliacion.colAcciones')}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {movimientos.map((mov) => {
                          const draft = drafts[mov.id] ?? emptyDraft()
                          const rowTestId = `conciliacion-bancaria-row-${mov.id}`
                          const disabled = draft.busy || mov.periodoLocked
                          return (
                            <tr
                              key={mov.id}
                              className="border-b border-slate-100 dark:border-slate-800 align-top"
                              data-testid={rowTestId}
                            >
                              <td className="py-3 pr-3 min-w-[14rem]">
                                <div className="whitespace-nowrap">{formatDate(mov.fecha)}</div>
                                <div>{mov.descripcion}</div>
                                <div className="font-mono">
                                  {mov.tipo === 'debito' ? '-' : '+'}
                                  {formatMoney(mov.importe)}
                                </div>
                                {mov.referencia && (
                                  <div className="text-xs text-slate-500">{mov.referencia}</div>
                                )}
                              </td>
                              <td className="py-3 pr-3 whitespace-nowrap">
                                <span
                                  className={`text-xs font-semibold px-2 py-1 rounded-full ${ESTADO_BADGE_CLASSES[mov.matchEstado]}`}
                                  data-testid={`${rowTestId}-estado`}
                                >
                                  {t(`bancos.conciliacion.estado.${mov.matchEstado}`)}
                                </span>
                                {mov.matchScore != null && (
                                  <div className="text-xs text-slate-500 mt-1 font-mono">
                                    {t('bancos.conciliacion.score')}: {mov.matchScore}
                                  </div>
                                )}
                                {mov.periodoLocked && (
                                  <div className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                                    {t('bancos.conciliacion.periodoLockedBadge')}
                                  </div>
                                )}
                              </td>
                              <td className="py-3 pr-3 min-w-[18rem]">
                                <div className="flex flex-col gap-2">
                                  {mov.matchEstado === 'suggested' && mov.matchSugerencias && (
                                    <div className="text-xs text-slate-500" data-testid={`${rowTestId}-sugerencias`}>
                                      {t('bancos.conciliacion.suggestions')}:{' '}
                                      {mov.matchSugerencias
                                        .map((s) => `${s.tipo}#${s.id} (${formatMoney(s.importe)})`)
                                        .join(', ')}
                                    </div>
                                  )}
                                  {mov.matchEstado === 'suggested' && (
                                    <button
                                      type="button"
                                      className="text-left px-2 py-1 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
                                      data-testid={`${rowTestId}-confirm`}
                                      disabled={disabled}
                                      onClick={() => void handleConfirmSugerencia(mov.id)}
                                    >
                                      {t('bancos.conciliacion.confirmSuggestion')}
                                    </button>
                                  )}
                                  {(mov.matchEstado === 'unmatched' || mov.matchEstado === 'suggested') && (
                                    <div className="flex flex-wrap items-end gap-2">
                                      <label className="text-xs text-slate-500" htmlFor={`${rowTestId}-tipo`}>
                                        {t('bancos.conciliacion.manualTipo')}
                                        <select
                                          id={`${rowTestId}-tipo`}
                                          data-testid={`${rowTestId}-tipo`}
                                          className="block mt-1 border rounded px-2 py-1 dark:bg-slate-900 dark:border-slate-600"
                                          value={draft.tipo}
                                          onChange={(e) =>
                                            updateDraft(mov.id, { tipo: e.target.value as ConciliadoTipo })
                                          }
                                        >
                                          <option value="cobro">
                                            {t('bancos.conciliacion.manualTipoCobro')}
                                          </option>
                                          <option value="recibo_forma">
                                            {t('bancos.conciliacion.manualTipoReciboForma')}
                                          </option>
                                        </select>
                                      </label>
                                      <label className="text-xs text-slate-500" htmlFor={`${rowTestId}-id`}>
                                        {t('bancos.conciliacion.manualId')}
                                        <input
                                          id={`${rowTestId}-id`}
                                          data-testid={`${rowTestId}-id`}
                                          type="number"
                                          min={1}
                                          className="block mt-1 border rounded px-2 py-1 w-24 dark:bg-slate-900 dark:border-slate-600"
                                          value={draft.id}
                                          onChange={(e) => updateDraft(mov.id, { id: e.target.value })}
                                        />
                                      </label>
                                      <button
                                        type="button"
                                        data-testid={`${rowTestId}-conciliar`}
                                        className="px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                                        disabled={disabled}
                                        onClick={() => handleConciliarManual(mov.id)}
                                      >
                                        {t('bancos.conciliacion.manualAssign')}
                                      </button>
                                    </div>
                                  )}
                                  {mov.matchEstado !== 'ignored' && mov.matchEstado !== 'bank_fee' && (
                                    <div className="flex flex-wrap gap-2">
                                      <button
                                        type="button"
                                        data-testid={`${rowTestId}-ignore`}
                                        className="px-2 py-1 rounded border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-60"
                                        disabled={disabled}
                                        onClick={() => void handleIgnorar(mov.id)}
                                      >
                                        {t('bancos.conciliacion.ignore')}
                                      </button>
                                      {mov.tipo === 'debito' && (
                                        <button
                                          type="button"
                                          data-testid={`${rowTestId}-gasto`}
                                          className="px-2 py-1 rounded border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-60"
                                          disabled={disabled}
                                          onClick={() => void handleGastoBancario(mov.id)}
                                        >
                                          {t('bancos.conciliacion.bankFee')}
                                        </button>
                                      )}
                                    </div>
                                  )}
                                  {draft.error && (
                                    <p
                                      className="text-xs text-red-600 dark:text-red-400"
                                      role="alert"
                                      data-testid={`${rowTestId}-error`}
                                    >
                                      {draft.error}
                                    </p>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </AsyncWrapper>
            </>
          )}
        </AsyncWrapper>
      </div>
    </ErrorBoundary>
  )
}
