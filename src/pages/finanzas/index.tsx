import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useHotkeys } from 'react-hotkeys-hook'
import { useTranslation } from 'react-i18next'
import { CanAccess } from '@/components/CanAccess'
import ErrorBoundary from '@/components/ErrorBoundary'
import AsyncWrapper from '@/components/shared/AsyncWrapper'
import KeyboardHint from '@/components/shared/KeyboardHint'
import { useListPageHotkeys } from '@/hooks/useListPageKeyboard'
import IfModule from '@/components/IfModule'
import IfIntegration from '@/components/IfIntegration'
import ComprobanteCompraRegisterForm from '@/pages/finanzas/ComprobanteCompraRegisterForm'
import DocumentoCompraImportSection from '@/pages/finanzas/DocumentoCompraImportSection'
import ChequesSection from '@/pages/finanzas/ChequesSection'
import PresentacionesRetencionesSection from '@/pages/finanzas/PresentacionesRetencionesSection'
import {
  ApiRequestFailedError,
  cobranzasAPI,
  contabilidadAPI,
  notasCreditoAPI,
  proveedoresAPI,
  reportesAPI,
  type FacturaPendienteEstado,
  type FacturaPendienteRow,
  type AgingArData,
  type AgingBucket,
  type CuentaCorrienteData,
  type FacturaVencidaRow,
  type LibroIvaComprasPreviewDTO,
  type LibroIvaVentasPreviewDTO,
  type NotaCreditoRowDTO,
} from '@/lib/api'

function formatMoney(value: number | string): string {
  const n = typeof value === 'number' ? value : Number.parseFloat(String(value))
  if (Number.isNaN(n)) return String(value)
  return n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })
}

function formatDate(value: string): string {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString('es-AR')
}

function monthRangeIso(): { from: string; to: string } {
  const now = new Date()
  const y = now.getFullYear()
  const m = now.getMonth()
  const pad = (n: number) => String(n).padStart(2, '0')
  const from = `${y}-${pad(m + 1)}-01`
  const lastDay = new Date(y, m + 1, 0).getDate()
  const to = `${y}-${pad(m + 1)}-${pad(lastDay)}`
  return { from, to }
}

const CREDIT_NOTE_LIST_PAGE_SIZE = 50 as const

type SortKey = 'label' | 'count' | 'total'
type SortDir = 'asc' | 'desc'

export default function FinanzasPage() {
  const { t } = useTranslation('finanzas')

  return (
    <CanAccess
      permission="reports.financial.read"
      fallback={
        <div className="p-8" data-testid="finanzas-forbidden">
          <p className="text-slate-600 dark:text-slate-300">{t('forbidden')}</p>
        </div>
      }
    >
      <FinanzasPageContent />
    </CanAccess>
  )
}

function focusFirstVisibleFinanzasFilter(): void {
  const containers = document.querySelectorAll(
    '[data-testid="finanzas-vencidas-filter"], [data-testid="finanzas-payables-filter"], [data-testid="finanzas-nc-filters"], [data-testid="finanzas-client-lookup"], [data-testid="finanzas-libro-iva-controls"], [data-testid="finanzas-libro-iva-compras-controls"]',
  )
  for (const container of containers) {
    const el = container as HTMLElement
    const rect = el.getBoundingClientRect()
    if (rect.top < window.innerHeight && rect.bottom > 80) {
      const focusable = el.querySelector('input, select, textarea') as HTMLElement | null
      focusable?.focus()
      return
    }
  }
}

function FinanzasPageContent() {
  const { t } = useTranslation('finanzas')
  const { t: tc } = useTranslation('common')
  const finanzasShortcuts = useMemo(
    () => [
      { key: 'F2', description: tc('shortcuts.search') },
      { key: 'Esc', description: tc('shortcuts.cancel') },
    ],
    [tc],
  )
  const [aging, setAging] = useState<AgingArData | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState<Error | null>(null)
  const [sortKey, setSortKey] = useState<SortKey>('label')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [clienteIdInput, setClienteIdInput] = useState('')
  const [statement, setStatement] = useState<CuentaCorrienteData | null>(null)
  const [statementLoading, setStatementLoading] = useState(false)
  const [statementError, setStatementError] = useState<Error | null>(null)
  const [vencidas, setVencidas] = useState<FacturaVencidaRow[]>([])
  const [vencidasLoading, setVencidasLoading] = useState(false)
  const [vencidasError, setVencidasError] = useState<Error | null>(null)
  const [minDiasMora, setMinDiasMora] = useState('1')
  const [sendingId, setSendingId] = useState<number | null>(null)
  const [sendFeedback, setSendFeedback] = useState<Record<number, 'ok' | '409'>>({})
  const [payables, setPayables] = useState<FacturaPendienteRow[]>([])
  const [payablesLoading, setPayablesLoading] = useState(false)
  const [payablesError, setPayablesError] = useState<Error | null>(null)
  const [payablesEstado, setPayablesEstado] = useState<FacturaPendienteEstado | ''>('')

  const loadAging = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const data = await reportesAPI.aging()
      setAging(data ?? null)
    } catch (error) {
      setLoadError(error instanceof Error ? error : new Error(String(error)))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadAging()
  }, [loadAging])

  const loadVencidas = useCallback(async () => {
    setVencidasLoading(true)
    setVencidasError(null)
    try {
      const data = await cobranzasAPI.listVencidas()
      setVencidas(data ?? [])
    } catch (error) {
      setVencidasError(error instanceof Error ? error : new Error(String(error)))
    } finally {
      setVencidasLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadVencidas()
  }, [loadVencidas])

  const loadPayables = useCallback(async () => {
    setPayablesLoading(true)
    setPayablesError(null)
    try {
      const data = await proveedoresAPI.facturasPendientes(
        payablesEstado ? { estado: payablesEstado } : undefined,
      )
      setPayables(data ?? [])
    } catch (error) {
      setPayablesError(error instanceof Error ? error : new Error(String(error)))
    } finally {
      setPayablesLoading(false)
    }
  }, [payablesEstado])

  useEffect(() => {
    void loadPayables()
  }, [loadPayables])

  const minDias = Number.parseInt(minDiasMora, 10)
  const filteredVencidas = useMemo(() => {
    const threshold = Number.isFinite(minDias) && minDias >= 1 ? minDias : 1
    return vencidas.filter((row) => row.diasMora >= threshold)
  }, [vencidas, minDias])

  const sendReminder = async (facturaId: number) => {
    setSendingId(facturaId)
    try {
      await cobranzasAPI.sendRecordatorio(facturaId)
      setSendFeedback((prev) => ({ ...prev, [facturaId]: 'ok' }))
    } catch (error) {
      if (error instanceof ApiRequestFailedError && error.httpStatus === 409) {
        setSendFeedback((prev) => ({ ...prev, [facturaId]: '409' }))
      }
    } finally {
      setSendingId(null)
    }
  }

  const sortedBuckets = useMemo(() => {
    if (!aging) return []
    const rows = [...aging.buckets]
    rows.sort((a, b) => {
      const cmp =
        sortKey === 'label'
          ? a.label.localeCompare(b.label)
          : sortKey === 'count'
            ? a.count - b.count
            : Number.parseFloat(a.total) - Number.parseFloat(b.total)
      return sortDir === 'asc' ? cmp : -cmp
    })
    return rows
  }, [aging, sortKey, sortDir])

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const statementOpen = statement !== null || statementLoading || statementError !== null

  useHotkeys('f2', () => {
    focusFirstVisibleFinanzasFilter()
  })

  useListPageHotkeys({
    onClose: () => {
      setStatement(null)
      setStatementError(null)
    },
    isOverlayOpen: statementOpen,
  })

  const openStatement = async () => {
    const id = Number.parseInt(clienteIdInput.trim(), 10)
    if (!Number.isFinite(id) || id < 1) return
    setStatementLoading(true)
    setStatementError(null)
    try {
      const data = await reportesAPI.cuentaCorriente(id)
      setStatement(data ?? null)
    } catch (error) {
      setStatement(null)
      setStatementError(error instanceof Error ? error : new Error(String(error)))
    } finally {
      setStatementLoading(false)
    }
  }

  return (
    <ErrorBoundary>
      <div className="p-6" data-testid="finanzas-page">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('title')}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">{t('subtitle')}</p>
        </header>

        <KeyboardHint shortcuts={finanzasShortcuts} className="mb-4" />

        <IfIntegration id="mercadopago">
          <section className="mb-6" aria-labelledby="finanzas-mp-reconciliation-heading">
            <h2
              id="finanzas-mp-reconciliation-heading"
              className="text-lg font-semibold mb-2 text-slate-900 dark:text-slate-100"
            >
              {t('mercadopago.reconciliation.linkTitle')}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
              {t('mercadopago.reconciliation.linkHint')}
            </p>
            <Link
              to="/finanzas/reconciliacion-mp"
              className="inline-flex px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 text-sm"
              data-testid="finanzas-reconciliacion-mp-link"
            >
              {t('mercadopago.reconciliation.openPage')}
            </Link>
          </section>
        </IfIntegration>

        <IfIntegration id="mercadopago">
          <section className="mb-8" aria-labelledby="finanzas-mp-chargeback-heading">
            <h2
              id="finanzas-mp-chargeback-heading"
              className="text-lg font-semibold mb-2 text-slate-900 dark:text-slate-100"
            >
              {t('mercadopago.chargeback.linkTitle')}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
              {t('mercadopago.chargeback.linkHint')}
            </p>
            <Link
              to="/finanzas/contracargos-mp"
              className="inline-flex px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 text-sm"
              data-testid="finanzas-contracargos-mp-link"
            >
              {t('mercadopago.chargeback.openPage')}
            </Link>
          </section>
        </IfIntegration>

        <AsyncWrapper loading={loading} error={loadError}>
          {aging && <FinanzasResumenCards aging={aging} t={t} />}
        </AsyncWrapper>

        <section className="mt-8" aria-labelledby="finanzas-aging-heading">
          <h2 id="finanzas-aging-heading" className="text-lg font-semibold mb-3 text-slate-900 dark:text-slate-100">
            {t('aging.title')}
          </h2>
          <AsyncWrapper loading={loading} error={loadError}>
            {sortedBuckets.length === 0 ? (
              <p className="text-slate-500" data-testid="finanzas-aging-empty">
                {t('aging.empty')}
              </p>
            ) : (
              <FinanzasAgingTable
                buckets={sortedBuckets}
                sortKey={sortKey}
                sortDir={sortDir}
                onSort={toggleSort}
                t={t}
              />
            )}
          </AsyncWrapper>
        </section>

        <IfModule flag="billing.credit_notes">
          <FinanzasCreditNotesSection />
        </IfModule>

        <IfModule flag="fiscal.cheques">
          <ChequesSection />
        </IfModule>

        <IfModule flag="finance.retenciones">
          <PresentacionesRetencionesSection />
        </IfModule>

        <IfModule flag="finance.ledger">
          <FinanzasLibroIvaVentasSection />
          <FinanzasLibroIvaComprasSection />
        </IfModule>

        <section className="mt-8" aria-labelledby="finanzas-overdue-heading">
          <h2 id="finanzas-overdue-heading" className="text-lg font-semibold mb-2 text-slate-900 dark:text-slate-100">
            {t('overdue.title')}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">{t('overdue.hint')}</p>
          <div className="mb-3 flex flex-wrap items-end gap-3" data-testid="finanzas-vencidas-filter">
            <div>
              <label htmlFor="finanzas-min-dias-mora" className="block text-xs text-slate-500 mb-1">
                {t('overdue.minDays')}
              </label>
              <input
                id="finanzas-min-dias-mora"
                type="number"
                min={1}
                className="border border-slate-300 dark:border-slate-600 rounded px-2 py-1 bg-white dark:bg-slate-800 w-24"
                value={minDiasMora}
                onChange={(e) => setMinDiasMora(e.target.value)}
              />
            </div>
          </div>
          <AsyncWrapper loading={vencidasLoading} error={vencidasError}>
            {filteredVencidas.length === 0 ? (
              <p className="text-slate-500" data-testid="finanzas-vencidas-empty">
                {t('overdue.empty')}
              </p>
            ) : (
              <div className="overflow-x-auto" data-testid="finanzas-vencidas-table">
                <table className="w-full text-sm">
                  <caption className="sr-only">{t('overdue.title')}</caption>
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700 text-left">
                      <th scope="col" className="py-2 pr-2">{t('overdue.invoice')}</th>
                      <th scope="col" className="py-2 pr-2">{t('overdue.customer')}</th>
                      <th scope="col" className="py-2 pr-2">{t('overdue.total')}</th>
                      <th scope="col" className="py-2 pr-2">{t('overdue.date')}</th>
                      <th scope="col" className="py-2 pr-2">{t('overdue.daysPastDue')}</th>
                      <th scope="col" className="py-2 pr-2">
                        <span className="sr-only">{t('overdue.send')}</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredVencidas.map((row) => (
                      <tr
                        key={row.facturaId}
                        className="border-b border-slate-100 dark:border-slate-800"
                        data-testid={`finanzas-vencida-row-${row.facturaId}`}
                      >
                        <td className="py-2 pr-2 font-mono">#{row.facturaId}</td>
                        <td className="py-2 pr-2">{row.rsocial}</td>
                        <td className="py-2 pr-2 font-mono">{formatMoney(row.total)}</td>
                        <td className="py-2 pr-2">{formatDate(row.fecha)}</td>
                        <td className="py-2 pr-2 font-mono">{row.diasMora}</td>
                        <td className="py-2 pr-2">
                          <button
                            type="button"
                            className="px-3 py-1 rounded bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50"
                            disabled={sendingId === row.facturaId}
                            data-testid={`finanzas-send-reminder-${row.facturaId}`}
                            onClick={() => void sendReminder(row.facturaId)}
                          >
                            {sendingId === row.facturaId ? t('overdue.sending') : t('overdue.send')}
                          </button>
                          {sendFeedback[row.facturaId] === 'ok' && (
                            <span className="ml-2 text-xs text-green-700 dark:text-green-400" role="status">
                              {t('overdue.sent')}
                            </span>
                          )}
                          {sendFeedback[row.facturaId] === '409' && (
                            <span className="ml-2 text-xs text-amber-700 dark:text-amber-300" role="status">
                              {t('overdue.alreadySent')}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </AsyncWrapper>
        </section>

        <IfModule flag="finance.ledger">
          <section className="mt-8" aria-labelledby="finanzas-payables-heading">
            <h2
              id="finanzas-payables-heading"
              className="text-lg font-semibold mb-2 text-slate-900 dark:text-slate-100"
            >
              {t('payables.title')}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">{t('payables.hint')}</p>
            <div className="mb-3" data-testid="finanzas-payables-filter">
              <label htmlFor="finanzas-payables-estado" className="block text-xs text-slate-500 mb-1">
                {t('payables.filterEstado')}
              </label>
              <select
                id="finanzas-payables-estado"
                className="border border-slate-300 dark:border-slate-600 rounded px-2 py-1 bg-white dark:bg-slate-800"
                value={payablesEstado}
                onChange={(e) =>
                  setPayablesEstado((e.target.value || '') as FacturaPendienteEstado | '')
                }
              >
                <option value="">{t('payables.estadoAll')}</option>
                <option value="proxima_vencer">{t('payables.estado_proxima_vencer')}</option>
                <option value="vencida_hoy">{t('payables.estado_vencida_hoy')}</option>
                <option value="vencida_critica">{t('payables.estado_vencida_critica')}</option>
                <option value="pendiente">{t('payables.estado_pendiente')}</option>
              </select>
            </div>
            <AsyncWrapper loading={payablesLoading} error={payablesError}>
              {payables.length === 0 ? (
                <p className="text-slate-500" data-testid="finanzas-payables-empty">
                  {t('payables.empty')}
                </p>
              ) : (
                <div className="overflow-x-auto" data-testid="finanzas-payables-table">
                  <table className="w-full text-sm">
                    <caption className="sr-only">{t('payables.title')}</caption>
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700 text-left">
                        <th scope="col" className="py-2 pr-2">{t('payables.voucher')}</th>
                        <th scope="col" className="py-2 pr-2">{t('payables.supplier')}</th>
                        <th scope="col" className="py-2 pr-2">{t('payables.dueDate')}</th>
                        <th scope="col" className="py-2 pr-2">{t('payables.pending')}</th>
                        <th scope="col" className="py-2 pr-2">{t('payables.status')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payables.map((row) => (
                        <tr
                          key={row.comprobanteCompraId}
                          className="border-b border-slate-100 dark:border-slate-800"
                          data-testid={`finanzas-payable-row-${row.comprobanteCompraId}`}
                        >
                          <td className="py-2 pr-2 font-mono">{row.facturaRef}</td>
                          <td className="py-2 pr-2">{row.proveedorRsocial}</td>
                          <td className="py-2 pr-2">{formatDate(row.vencimiento)}</td>
                          <td className="py-2 pr-2 font-mono">{formatMoney(row.pendiente)}</td>
                          <td className="py-2 pr-2">{t(`payables.estado_${row.estado}`)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </AsyncWrapper>
          </section>
        </IfModule>

        <section className="mt-8" aria-labelledby="finanzas-clients-heading">
          <h2 id="finanzas-clients-heading" className="text-lg font-semibold mb-2 text-slate-900 dark:text-slate-100">
            {t('clients.title')}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">{t('clients.hint')}</p>
          <div className="flex flex-wrap gap-3 items-end" data-testid="finanzas-client-lookup">
            <div>
              <label htmlFor="finanzas-cliente-id" className="block text-xs text-slate-500 mb-1">
                {t('clients.clientId')}
              </label>
              <input
                id="finanzas-cliente-id"
                type="number"
                min={1}
                className="border border-slate-300 dark:border-slate-600 rounded px-2 py-1 bg-white dark:bg-slate-800 w-32"
                placeholder={t('clients.clientIdPlaceholder')}
                value={clienteIdInput}
                onChange={(e) => setClienteIdInput(e.target.value)}
              />
            </div>
            <button
              type="button"
              className="px-4 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
              data-testid="finanzas-view-statement-btn"
              onClick={() => void openStatement()}
            >
              {t('clients.viewStatement')}
            </button>
          </div>
        </section>

        {(statement || statementLoading || statementError) && (
          <FinanzasStatementPanel
            statement={statement}
            loading={statementLoading}
            error={statementError}
            onClose={() => {
              setStatement(null)
              setStatementError(null)
            }}
            t={t}
          />
        )}
      </div>
    </ErrorBoundary>
  )
}

function currentMonthPeriodo(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

const LIBRO_IVA_YEAR_MIN = 2020

const libroIvaSelectClass =
  'border border-slate-300 dark:border-slate-600 rounded px-2 py-1 bg-white dark:bg-slate-800'

function parseLibroIvaPeriodo(periodo: string): { year: number; month: number } {
  const match = /^(\d{4})-(\d{2})$/.exec(periodo)
  if (!match) {
    return parseLibroIvaPeriodo(currentMonthPeriodo())
  }
  const year = Number.parseInt(match[1], 10)
  const month = Number.parseInt(match[2], 10)
  if (month < 1 || month > 12) {
    return parseLibroIvaPeriodo(currentMonthPeriodo())
  }
  return { year, month }
}

function formatLibroIvaPeriodo(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, '0')}`
}

function libroIvaYearOptions(): number[] {
  const maxYear = new Date().getFullYear() + 1
  const years: number[] = []
  for (let y = LIBRO_IVA_YEAR_MIN; y <= maxYear; y += 1) {
    years.push(y)
  }
  return years
}

function libroIvaMonthLabel(month: number, locale: string): string {
  return new Date(2000, month - 1, 1).toLocaleDateString(locale, { month: 'long' })
}

interface LibroIvaPeriodoFieldProps {
  legend: string
  monthAriaLabel: string
  yearAriaLabel: string
  value: string
  onChange: (periodo: string) => void
  locale: string
  testId: string
}

/**
 * @en Cross-browser month period (YYYY-MM) via native selects — `input[type=month]` lacks Firefox/Safari support.
 * @es Período mensual (YYYY-MM) con selects nativos — `input[type=month]` no está soportado en Firefox/Safari.
 * @pt-BR Período mensal (YYYY-MM) com selects nativos — `input[type=month]` não é suportado no Firefox/Safari.
 */
function LibroIvaPeriodoField({
  legend,
  monthAriaLabel,
  yearAriaLabel,
  value,
  onChange,
  locale,
  testId,
}: LibroIvaPeriodoFieldProps) {
  const monthRef = useRef<HTMLSelectElement>(null)
  const yearRef = useRef<HTMLSelectElement>(null)
  const years = useMemo(() => libroIvaYearOptions(), [])
  const { year, month } = parseLibroIvaPeriodo(value)

  // Microsoft Edge Tools (webhint) flags dynamic `id` in JSX when uniqueness cannot be proven statically.
  useLayoutEffect(() => {
    monthRef.current?.setAttribute('id', `${testId}-month`)
    yearRef.current?.setAttribute('id', `${testId}-year`)
  }, [testId])

  return (
    <fieldset className="border-0 p-0 m-0 min-w-0" data-testid={testId}>
      <legend className="block text-xs text-slate-500 mb-1">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        <select
          ref={monthRef}
          className={libroIvaSelectClass}
          value={month}
          aria-label={monthAriaLabel}
          data-testid={`${testId}-month`}
          onChange={(e) => {
            onChange(formatLibroIvaPeriodo(year, Number(e.target.value)))
          }}
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
            <option key={m} value={m}>
              {libroIvaMonthLabel(m, locale)}
            </option>
          ))}
        </select>
        <select
          ref={yearRef}
          className={libroIvaSelectClass}
          value={year}
          aria-label={yearAriaLabel}
          data-testid={`${testId}-year`}
          onChange={(e) => {
            onChange(formatLibroIvaPeriodo(Number(e.target.value), month))
          }}
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>
    </fieldset>
  )
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

function FinanzasLibroIvaVentasSection() {
  const { t, i18n } = useTranslation('finanzas')
  const [periodo, setPeriodo] = useState(currentMonthPeriodo)
  const [preview, setPreview] = useState<LibroIvaVentasPreviewDTO | null>(null)
  const [loading, setLoading] = useState(false)
  const [downloading, setDownloading] = useState<'txt' | 'xlsx' | null>(null)
  const [error, setError] = useState<Error | null>(null)

  const loadPreview = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await contabilidadAPI.libroIvaVentasPreview(periodo)
      setPreview(data)
    } catch (e) {
      setPreview(null)
      setError(e instanceof Error ? e : new Error(String(e)))
    } finally {
      setLoading(false)
    }
  }, [periodo])

  useEffect(() => {
    void loadPreview()
  }, [loadPreview])

  const handleDownload = async (format: 'txt' | 'xlsx') => {
    setDownloading(format)
    setError(null)
    try {
      const blob = await contabilidadAPI.downloadLibroIvaVentas(periodo, format)
      const ext = format === 'txt' ? 'zip' : 'xlsx'
      downloadBlob(blob, `libro-iva-ventas-${periodo}.${ext}`)
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)))
    } finally {
      setDownloading(null)
    }
  }

  return (
    <section
      className="mt-8"
      aria-labelledby="finanzas-libro-iva-heading"
      data-testid="finanzas-libro-iva-section"
    >
      <h2 id="finanzas-libro-iva-heading" className="text-lg font-semibold mb-2 text-slate-900 dark:text-slate-100">
        {t('libroIva.title')}
      </h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">{t('libroIva.hint')}</p>
      <div className="mb-3 flex flex-wrap items-end gap-3" data-testid="finanzas-libro-iva-controls">
        <LibroIvaPeriodoField
          testId="finanzas-libro-iva-periodo"
          legend={t('libroIva.periodo')}
          monthAriaLabel={t('periodoMonth')}
          yearAriaLabel={t('periodoYear')}
          value={periodo}
          onChange={setPeriodo}
          locale={i18n.language}
        />
        <button
          type="button"
          className="px-4 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          data-testid="finanzas-libro-iva-download-txt"
          disabled={downloading !== null}
          onClick={() => void handleDownload('txt')}
        >
          {downloading === 'txt' ? t('libroIva.downloading') : t('libroIva.downloadTxt')}
        </button>
        <button
          type="button"
          className="px-4 py-1 rounded border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
          data-testid="finanzas-libro-iva-download-xlsx"
          disabled={downloading !== null}
          onClick={() => void handleDownload('xlsx')}
        >
          {downloading === 'xlsx' ? t('libroIva.downloading') : t('libroIva.downloadXlsx')}
        </button>
      </div>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 mb-2" role="alert" aria-live="polite">
          {error.message}
        </p>
      )}
      <AsyncWrapper loading={loading} error={null}>
        {!preview ? (
          <p className="text-slate-500" data-testid="finanzas-libro-iva-empty">
            {t('libroIva.empty')}
          </p>
        ) : (
          <div data-testid="finanzas-libro-iva-preview">
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">{t('libroIva.arcaPending')}</p>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm mb-4">
              <div>
                <dt className="text-slate-500">{t('libroIva.recordsCbtv')}</dt>
                <dd className="font-mono" data-testid="finanzas-libro-iva-count-cbtv">
                  {preview.recordCountCbtv}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">{t('libroIva.recordsAlicuotas')}</dt>
                <dd className="font-mono" data-testid="finanzas-libro-iva-count-alicuotas">
                  {preview.recordCountAlicuotas}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">{t('libroIva.totalNeto')}</dt>
                <dd className="font-mono">{formatMoney(preview.totalNeto)}</dd>
              </div>
              <div>
                <dt className="text-slate-500">{t('libroIva.totalIva')}</dt>
                <dd className="font-mono">{formatMoney(preview.totalIva)}</dd>
              </div>
            </dl>
            {preview.totalsByAlicuota.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm" data-testid="finanzas-libro-iva-alicuotas-table">
                  <caption className="sr-only">{t('libroIva.alicuotasCaption')}</caption>
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700 text-left">
                      <th scope="col" className="py-2 pr-2">{t('libroIva.colAlicuota')}</th>
                      <th scope="col" className="py-2 pr-2">{t('libroIva.colNeto')}</th>
                      <th scope="col" className="py-2 pr-2">{t('libroIva.colIva')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.totalsByAlicuota.map((row) => (
                      <tr key={row.alicuotaCode} className="border-b border-slate-100 dark:border-slate-800">
                        <td className="py-2 pr-2 font-mono">{row.alicuotaCode}</td>
                        <td className="py-2 pr-2 font-mono">{formatMoney(row.neto)}</td>
                        <td className="py-2 pr-2 font-mono">{formatMoney(row.iva)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </AsyncWrapper>
    </section>
  )
}

function FinanzasLibroIvaComprasSection() {
  const { t, i18n } = useTranslation('finanzas')
  const [periodo, setPeriodo] = useState(currentMonthPeriodo)
  const [preview, setPreview] = useState<LibroIvaComprasPreviewDTO | null>(null)
  const [loading, setLoading] = useState(false)
  const [downloading, setDownloading] = useState<'txt' | 'xlsx' | null>(null)
  const [error, setError] = useState<Error | null>(null)

  const loadPreview = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await contabilidadAPI.libroIvaComprasPreview(periodo)
      setPreview(data)
    } catch (e) {
      setPreview(null)
      setError(e instanceof Error ? e : new Error(String(e)))
    } finally {
      setLoading(false)
    }
  }, [periodo])

  useEffect(() => {
    void loadPreview()
  }, [loadPreview])

  const handleDownload = async (format: 'txt' | 'xlsx') => {
    setDownloading(format)
    setError(null)
    try {
      const blob = await contabilidadAPI.downloadLibroIvaCompras(periodo, format)
      const ext = format === 'txt' ? 'zip' : 'xlsx'
      downloadBlob(blob, `libro-iva-compras-${periodo}.${ext}`)
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)))
    } finally {
      setDownloading(null)
    }
  }

  return (
    <section
      className="mt-8"
      aria-labelledby="finanzas-libro-iva-compras-heading"
      data-testid="finanzas-libro-iva-compras-section"
    >
      <h2
        id="finanzas-libro-iva-compras-heading"
        className="text-lg font-semibold mb-2 text-slate-900 dark:text-slate-100"
      >
        {t('libroIvaCompras.title')}
      </h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">{t('libroIvaCompras.hint')}</p>
      <DocumentoCompraImportSection onConfirmed={() => void loadPreview()} />
      <ComprobanteCompraRegisterForm onRegistered={() => void loadPreview()} />
      <div className="mb-3 flex flex-wrap items-end gap-3" data-testid="finanzas-libro-iva-compras-controls">
        <LibroIvaPeriodoField
          testId="finanzas-libro-iva-compras-periodo"
          legend={t('libroIvaCompras.periodo')}
          monthAriaLabel={t('periodoMonth')}
          yearAriaLabel={t('periodoYear')}
          value={periodo}
          onChange={setPeriodo}
          locale={i18n.language}
        />
        <button
          type="button"
          className="px-4 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          data-testid="finanzas-libro-iva-compras-download-txt"
          disabled={downloading !== null}
          onClick={() => void handleDownload('txt')}
        >
          {downloading === 'txt' ? t('libroIvaCompras.downloading') : t('libroIvaCompras.downloadTxt')}
        </button>
        <button
          type="button"
          className="px-4 py-1 rounded border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
          data-testid="finanzas-libro-iva-compras-download-xlsx"
          disabled={downloading !== null}
          onClick={() => void handleDownload('xlsx')}
        >
          {downloading === 'xlsx' ? t('libroIvaCompras.downloading') : t('libroIvaCompras.downloadXlsx')}
        </button>
      </div>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 mb-2" role="alert" aria-live="polite">
          {error.message}
        </p>
      )}
      <AsyncWrapper loading={loading} error={null}>
        {!preview ? (
          <p className="text-slate-500" data-testid="finanzas-libro-iva-compras-empty">
            {t('libroIvaCompras.empty')}
          </p>
        ) : (
          <div data-testid="finanzas-libro-iva-compras-preview">
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">{t('libroIvaCompras.arcaPending')}</p>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm mb-4">
              <div>
                <dt className="text-slate-500">{t('libroIvaCompras.recordsCbtu')}</dt>
                <dd className="font-mono" data-testid="finanzas-libro-iva-compras-count-cbtu">
                  {preview.recordCountCbtu}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">{t('libroIvaCompras.recordsAlicuotas')}</dt>
                <dd className="font-mono" data-testid="finanzas-libro-iva-compras-count-alicuotas">
                  {preview.recordCountAlicuotas}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">{t('libroIvaCompras.totalNeto')}</dt>
                <dd className="font-mono">{formatMoney(preview.totalNeto)}</dd>
              </div>
              <div>
                <dt className="text-slate-500">{t('libroIvaCompras.totalIva')}</dt>
                <dd className="font-mono">{formatMoney(preview.totalIva)}</dd>
              </div>
            </dl>
            {preview.totalsByAlicuota.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm" data-testid="finanzas-libro-iva-compras-alicuotas-table">
                  <caption className="sr-only">{t('libroIvaCompras.alicuotasCaption')}</caption>
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700 text-left">
                      <th scope="col" className="py-2 pr-2">{t('libroIvaCompras.colAlicuota')}</th>
                      <th scope="col" className="py-2 pr-2">{t('libroIvaCompras.colNeto')}</th>
                      <th scope="col" className="py-2 pr-2">{t('libroIvaCompras.colIva')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.totalsByAlicuota.map((row) => (
                      <tr key={row.alicuotaCode} className="border-b border-slate-100 dark:border-slate-800">
                        <td className="py-2 pr-2 font-mono">{row.alicuotaCode}</td>
                        <td className="py-2 pr-2 font-mono">{formatMoney(row.neto)}</td>
                        <td className="py-2 pr-2 font-mono">{formatMoney(row.iva)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </AsyncWrapper>
    </section>
  )
}

function ncInvoiceRef(row: NotaCreditoRowDTO): string {
  const n = row.facturaOrigen.numero
  return `${row.facturaOrigen.tipo} ${row.facturaOrigen.prefijo}-${String(n).padStart(8, '0')}`
}

function FinanzasCreditNotesSection() {
  const { t } = useTranslation('finanzas')
  const defaults = useMemo(() => monthRangeIso(), [])
  const [from, setFrom] = useState(defaults.from)
  const [to, setTo] = useState(defaults.to)
  const [clienteIdFilter, setClienteIdFilter] = useState('')
  const [offset, setOffset] = useState(0)
  const [rows, setRows] = useState<NotaCreditoRowDTO[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const raw = clienteIdFilter.trim()
      let clienteId: number | undefined
      if (raw !== '') {
        const n = Number.parseInt(raw, 10)
        if (Number.isFinite(n) && n >= 1) clienteId = n
      }
      const result = await notasCreditoAPI.list({
        from,
        to,
        ...(clienteId !== undefined ? { clienteId } : {}),
        limit: CREDIT_NOTE_LIST_PAGE_SIZE,
        offset,
      })
      setRows(result.data)
      setTotal(result.total)
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)))
    } finally {
      setLoading(false)
    }
  }, [from, to, clienteIdFilter, offset])

  useEffect(() => {
    void load()
  }, [load])

  const canPrev = offset > 0
  const canNext = offset + CREDIT_NOTE_LIST_PAGE_SIZE < total

  return (
    <section className="mt-8" aria-labelledby="finanzas-nc-heading" data-testid="finanzas-nc-section">
      <h2 id="finanzas-nc-heading" className="text-lg font-semibold mb-2 text-slate-900 dark:text-slate-100">
        {t('creditNotes.title')}
      </h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">{t('creditNotes.hint')}</p>
      <div className="mb-3 flex flex-wrap items-end gap-3" data-testid="finanzas-nc-filters">
        <div>
          <label htmlFor="finanzas-nc-from" className="block text-xs text-slate-500 mb-1">
            {t('creditNotes.from')}
          </label>
          <input
            id="finanzas-nc-from"
            type="date"
            className="border border-slate-300 dark:border-slate-600 rounded px-2 py-1 bg-white dark:bg-slate-800"
            value={from}
            onChange={(e) => {
              setFrom(e.target.value)
              setOffset(0)
            }}
          />
        </div>
        <div>
          <label htmlFor="finanzas-nc-to" className="block text-xs text-slate-500 mb-1">
            {t('creditNotes.to')}
          </label>
          <input
            id="finanzas-nc-to"
            type="date"
            className="border border-slate-300 dark:border-slate-600 rounded px-2 py-1 bg-white dark:bg-slate-800"
            value={to}
            onChange={(e) => {
              setTo(e.target.value)
              setOffset(0)
            }}
          />
        </div>
        <div>
          <label htmlFor="finanzas-nc-cliente" className="block text-xs text-slate-500 mb-1">
            {t('creditNotes.clienteId')}
          </label>
          <input
            id="finanzas-nc-cliente"
            type="number"
            min={1}
            className="border border-slate-300 dark:border-slate-600 rounded px-2 py-1 bg-white dark:bg-slate-800 w-32"
            placeholder={t('creditNotes.clienteIdPlaceholder')}
            value={clienteIdFilter}
            onChange={(e) => {
              setClienteIdFilter(e.target.value)
              setOffset(0)
            }}
          />
        </div>
      </div>
      <AsyncWrapper loading={loading} error={error}>
        {rows.length === 0 ? (
          <p className="text-slate-500" data-testid="finanzas-nc-empty">
            {t('creditNotes.empty')}
          </p>
        ) : (
          <>
            <div className="overflow-x-auto" data-testid="finanzas-nc-table">
              <table className="w-full text-sm">
                <caption className="sr-only">{t('creditNotes.title')}</caption>
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 text-left">
                    <th scope="col" className="py-2 pr-2">{t('creditNotes.colId')}</th>
                    <th scope="col" className="py-2 pr-2">{t('creditNotes.colDate')}</th>
                    <th scope="col" className="py-2 pr-2">{t('creditNotes.colInvoice')}</th>
                    <th scope="col" className="py-2 pr-2">{t('creditNotes.colCliente')}</th>
                    <th scope="col" className="py-2 pr-2">{t('creditNotes.colAmount')}</th>
                    <th scope="col" className="py-2 pr-2">{t('creditNotes.colMotivo')}</th>
                    <th scope="col" className="py-2 pr-2">{t('creditNotes.colCae')}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-slate-100 dark:border-slate-800"
                      data-testid={`finanzas-nc-row-${row.id}`}
                    >
                      <td className="py-2 pr-2 font-mono">{row.id}</td>
                      <td className="py-2 pr-2">{formatDate(row.createdAt)}</td>
                      <td className="py-2 pr-2 font-mono">{ncInvoiceRef(row)}</td>
                      <td className="py-2 pr-2 font-mono">{row.facturaOrigen.clienteId}</td>
                      <td className="py-2 pr-2 font-mono">{formatMoney(row.monto)}</td>
                      <td className="py-2 pr-2 max-w-xs truncate" title={row.motivo}>
                        {row.motivo}
                      </td>
                      <td className="py-2 pr-2">{t(`creditNotes.cae.${row.estadoCae}`)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {total > CREDIT_NOTE_LIST_PAGE_SIZE && (
              <div className="mt-3 flex gap-2 items-center">
                <button
                  type="button"
                  className="px-3 py-1 rounded bg-slate-200 dark:bg-slate-700 disabled:opacity-50"
                  disabled={!canPrev}
                  data-testid="finanzas-nc-prev"
                  onClick={() => setOffset((o) => Math.max(0, o - CREDIT_NOTE_LIST_PAGE_SIZE))}
                >
                  {t('creditNotes.prev')}
                </button>
                <span className="text-sm text-slate-600 dark:text-slate-300" data-testid="finanzas-nc-pageinfo">
                  {t('creditNotes.pageInfo', {
                    start: offset + 1,
                    end: Math.min(offset + rows.length, total),
                    total,
                  })}
                </span>
                <button
                  type="button"
                  className="px-3 py-1 rounded bg-slate-200 dark:bg-slate-700 disabled:opacity-50"
                  disabled={!canNext}
                  data-testid="finanzas-nc-next"
                  onClick={() => setOffset((o) => o + CREDIT_NOTE_LIST_PAGE_SIZE)}
                >
                  {t('creditNotes.next')}
                </button>
              </div>
            )}
          </>
        )}
      </AsyncWrapper>
    </section>
  )
}

function FinanzasResumenCards({
  aging,
  t,
}: {
  aging: AgingArData
  t: (key: string) => string
}) {
  const cards = [
    { key: 'totalDebt', value: formatMoney(aging.totalDeuda) },
    { key: 'overdue', value: formatMoney(aging.resumen.deudaVencida) },
    { key: 'notDue', value: formatMoney(aging.resumen.deudaPorVencer) },
    { key: 'delinquencyPct', value: `${aging.resumen.porcentajeMora}%` },
    { key: 'suspendedClients', value: String(aging.resumen.clientesSuspendidos) },
  ]
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4" data-testid="finanzas-summary">
      {cards.map((c) => (
        <div
          key={c.key}
          className="rounded-lg border border-slate-200 dark:border-slate-700 p-4 bg-white dark:bg-slate-900"
        >
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
            {t(`summary.${c.key}`)}
          </p>
          <p className="text-xl font-semibold text-slate-900 dark:text-slate-100">{c.value}</p>
        </div>
      ))}
    </div>
  )
}

function FinanzasAgingTable({
  buckets,
  sortKey,
  sortDir,
  onSort,
  t,
}: {
  buckets: AgingBucket[]
  sortKey: SortKey
  sortDir: SortDir
  onSort: (key: SortKey) => void
  t: (key: string) => string
}) {
  const sortLabel = sortDir === 'asc' ? t('sort.asc') : t('sort.desc')
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm" data-testid="finanzas-aging-table">
        <caption className="sr-only">{t('aging.title')}</caption>
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-700 text-left">
            <th scope="col" className="py-2 pr-4">
              <button type="button" className="font-semibold" onClick={() => onSort('label')}>
                {t('aging.bucket')} {sortKey === 'label' ? `(${sortLabel})` : ''}
              </button>
            </th>
            <th scope="col" className="py-2 pr-4">
              <button type="button" className="font-semibold" onClick={() => onSort('count')}>
                {t('aging.count')} {sortKey === 'count' ? `(${sortLabel})` : ''}
              </button>
            </th>
            <th scope="col" className="py-2 pr-4">
              <button type="button" className="font-semibold" onClick={() => onSort('total')}>
                {t('aging.total')} {sortKey === 'total' ? `(${sortLabel})` : ''}
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {buckets.map((row) => (
            <tr key={row.label} className="border-b border-slate-100 dark:border-slate-800">
              <td className="py-2 pr-4">{row.label}</td>
              <td className="py-2 pr-4">{row.count}</td>
              <td className="py-2 pr-4 font-mono">{formatMoney(row.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function FinanzasStatementPanel({
  statement,
  loading,
  error,
  onClose,
  t,
}: {
  statement: CuentaCorrienteData | null
  loading: boolean
  error: Error | null
  onClose: () => void
  t: (key: string) => string
}) {
  const { t: tc } = useTranslation('common')
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 mt-0">
      <button
        type="button"
        className="absolute inset-0 h-full w-full bg-black/50"
        aria-label={tc('actions.cancel')}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="finanzas-statement-title"
        data-testid="finanzas-cc-panel"
        className="relative z-10 bg-white dark:bg-slate-900 rounded-lg shadow-xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-start mb-4 gap-4">
          <div>
            <h2 id="finanzas-statement-title" className="text-lg font-semibold">
              {t('statement.title')}
            </h2>
            {statement && (
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {statement.codigo} — {statement.rsocial}
              </p>
            )}
          </div>
          <button
            type="button"
            className="px-3 py-1 rounded bg-slate-200 dark:bg-slate-700"
            onClick={onClose}
          >
            {t('statement.close')}
          </button>
        </div>
        <AsyncWrapper loading={loading} error={error}>
          {statement && (
            <>
              <p className="mb-4 text-sm" data-testid="finanzas-cc-balance">
                {t('statement.balance')}:{' '}
                <span className="font-mono font-semibold">{formatMoney(statement.balanceActual)}</span>
              </p>
              {statement.lineas.length === 0 ? (
                <p>{t('statement.empty')}</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <caption className="sr-only">{t('statement.title')}</caption>
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700 text-left">
                        <th scope="col" className="py-2 pr-2">{t('statement.date')}</th>
                        <th scope="col" className="py-2 pr-2">{t('statement.reference')}</th>
                        <th scope="col" className="py-2 pr-2">{t('statement.debit')}</th>
                        <th scope="col" className="py-2 pr-2">{t('statement.credit')}</th>
                        <th scope="col" className="py-2 pr-2">{t('statement.balanceCol')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {statement.lineas.map((line, idx) => (
                        <tr key={`${line.tipo}-${line.fecha}-${idx}`} className="border-b border-slate-100 dark:border-slate-800">
                          <td className="py-2 pr-2">{formatDate(line.fecha)}</td>
                          <td className="py-2 pr-2">
                            {line.tipo === 'factura'
                              ? t('statement.typeFactura')
                              : line.tipo === 'cobro'
                                ? t('statement.typeCobro')
                                : t('statement.typeSaldoInicial')}{' '}
                            {line.referencia}
                          </td>
                          <td className="py-2 pr-2 font-mono">{formatMoney(line.debito)}</td>
                          <td className="py-2 pr-2 font-mono">{formatMoney(line.credito)}</td>
                          <td className="py-2 pr-2 font-mono">{formatMoney(line.saldo)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </AsyncWrapper>
      </div>
    </div>
  )
}
