import { useCallback, useEffect, useId, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CanAccess } from '@/components/CanAccess'
import ErrorBoundary from '@/components/ErrorBoundary'
import AsyncWrapper from '@/components/shared/AsyncWrapper'
import { useFeatureFlags } from '@/contexts/FeatureFlagsContext'
import {
  clientesAPI,
  mercadopagoAPI,
  type MercadoPagoReconciliationEntry,
} from '@/lib/api'
import type { FacturaPendienteCliente } from '@/types'

function formatMoney(value: number | string, currency = 'ARS'): string {
  const n = typeof value === 'number' ? value : Number.parseFloat(String(value))
  if (Number.isNaN(n)) return String(value)
  return n.toLocaleString('es-AR', { style: 'currency', currency })
}

function formatDate(value: string): string {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString('es-AR')
}

type RowDraft = {
  clienteId: string
  facturaId: string
  invoices: FacturaPendienteCliente[]
  invoicesLoading: boolean
  invoicesError: string | null
  actionLoading: boolean
}

function emptyDraft(): RowDraft {
  return {
    clienteId: '',
    facturaId: '',
    invoices: [],
    invoicesLoading: false,
    invoicesError: null,
    actionLoading: false,
  }
}

export default function ReconciliacionMpPage() {
  const { t } = useTranslation('finanzas')

  return (
    <CanAccess
      permission="reports.financial.read"
      fallback={
        <div className="p-8" data-testid="reconciliacion-mp-forbidden">
          <p className="text-slate-600 dark:text-slate-300">{t('forbidden')}</p>
        </div>
      }
    >
      <ReconciliacionMpGate />
    </CanAccess>
  )
}

function ReconciliacionMpGate() {
  const { t } = useTranslation('finanzas')
  const { hasIntegration, status } = useFeatureFlags()

  if (status === 'loading' || status === 'idle') {
    return (
      <div className="p-8" data-testid="reconciliacion-mp-loading">
        <p className="text-slate-500">{t('mercadopago.reconciliation.loading')}</p>
      </div>
    )
  }

  if (!hasIntegration('mercadopago')) {
    return (
      <div className="p-8" data-testid="reconciliacion-mp-integration-disabled">
        <p className="text-slate-600 dark:text-slate-300">
          {t('mercadopago.reconciliation.integrationDisabled')}
        </p>
        <Link to="/finanzas" className="text-blue-600 hover:underline text-sm mt-2 inline-block">
          {t('mercadopago.reconciliation.backToFinance')}
        </Link>
      </div>
    )
  }

  return <ReconciliacionMpPageContent />
}

function ReconciliacionMpPageContent() {
  const { t } = useTranslation('finanzas')
  const feedbackId = useId()
  const [entries, setEntries] = useState<MercadoPagoReconciliationEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState<Error | null>(null)
  const [jobLoading, setJobLoading] = useState(false)
  const [drafts, setDrafts] = useState<Record<string, RowDraft>>({})
  const [feedback, setFeedback] = useState<{ tone: 'ok' | 'error'; message: string } | null>(null)

  const loadEntries = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const data = await mercadopagoAPI.listUnreconciled()
      setEntries(data)
      setDrafts((prev) => {
        const next: Record<string, RowDraft> = {}
        for (const entry of data) {
          next[entry.mpPaymentId] = prev[entry.mpPaymentId] ?? emptyDraft()
        }
        return next
      })
    } catch (error) {
      setLoadError(error instanceof Error ? error : new Error(String(error)))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadEntries()
  }, [loadEntries])

  const updateDraft = (mpPaymentId: string, patch: Partial<RowDraft>) => {
    setDrafts((prev) => ({
      ...prev,
      [mpPaymentId]: { ...(prev[mpPaymentId] ?? emptyDraft()), ...patch },
    }))
  }

  const loadInvoicesForRow = async (mpPaymentId: string) => {
    const draft = drafts[mpPaymentId] ?? emptyDraft()
    const clienteId = Number.parseInt(draft.clienteId.trim(), 10)
    if (!Number.isFinite(clienteId) || clienteId <= 0) {
      updateDraft(mpPaymentId, { invoicesError: t('mercadopago.reconciliation.invalidClienteId') })
      return
    }
    updateDraft(mpPaymentId, { invoicesLoading: true, invoicesError: null, invoices: [] })
    try {
      const invoices = await clientesAPI.facturasPendientes(clienteId)
      updateDraft(mpPaymentId, {
        invoices: invoices ?? [],
        invoicesLoading: false,
        invoicesError: null,
      })
    } catch (error) {
      updateDraft(mpPaymentId, {
        invoicesLoading: false,
        invoicesError: error instanceof Error ? error.message : String(error),
      })
    }
  }

  const handleReconcile = async (entry: MercadoPagoReconciliationEntry) => {
    const draft = drafts[entry.mpPaymentId] ?? emptyDraft()
    const facturaId = Number.parseInt(draft.facturaId.trim(), 10)
    if (!Number.isFinite(facturaId) || facturaId <= 0) {
      setFeedback({ tone: 'error', message: t('mercadopago.reconciliation.selectFactura') })
      return
    }
    updateDraft(entry.mpPaymentId, { actionLoading: true })
    try {
      await mercadopagoAPI.reconcile({ mpPaymentId: entry.mpPaymentId, facturaId })
      setFeedback({
        tone: 'ok',
        message: t('mercadopago.reconciliation.reconcileSuccess', { id: entry.mpPaymentId }),
      })
      await loadEntries()
    } catch (error) {
      setFeedback({
        tone: 'error',
        message: error instanceof Error ? error.message : t('mercadopago.reconciliation.reconcileError'),
      })
    } finally {
      updateDraft(entry.mpPaymentId, { actionLoading: false })
    }
  }

  const handleIgnore = async (entry: MercadoPagoReconciliationEntry) => {
    if (!window.confirm(t('mercadopago.reconciliation.ignoreConfirm', { id: entry.mpPaymentId }))) {
      return
    }
    updateDraft(entry.mpPaymentId, { actionLoading: true })
    try {
      await mercadopagoAPI.ignore(entry.mpPaymentId)
      setFeedback({
        tone: 'ok',
        message: t('mercadopago.reconciliation.ignoreSuccess', { id: entry.mpPaymentId }),
      })
      await loadEntries()
    } catch (error) {
      setFeedback({
        tone: 'error',
        message: error instanceof Error ? error.message : t('mercadopago.reconciliation.ignoreError'),
      })
    } finally {
      updateDraft(entry.mpPaymentId, { actionLoading: false })
    }
  }

  const handleRunJob = async () => {
    setJobLoading(true)
    try {
      const summary = await mercadopagoAPI.runReconciliationJob()
      setFeedback({
        tone: 'ok',
        message: t('mercadopago.reconciliation.jobSuccess', {
          processed: summary.processed,
          autoReconciled: summary.autoReconciled,
          queued: summary.queued,
          skipped: summary.skipped,
        }),
      })
      await loadEntries()
    } catch (error) {
      setFeedback({
        tone: 'error',
        message: error instanceof Error ? error.message : t('mercadopago.reconciliation.jobError'),
      })
    } finally {
      setJobLoading(false)
    }
  }

  return (
    <ErrorBoundary>
      <div className="p-6" data-testid="reconciliacion-mp-page">
        <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {t('mercadopago.reconciliation.title')}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              {t('mercadopago.reconciliation.subtitle')}
            </p>
            <Link to="/finanzas" className="text-blue-600 hover:underline text-sm mt-2 inline-block">
              {t('mercadopago.reconciliation.backToFinance')}
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="px-4 py-2 rounded border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800"
              onClick={() => void loadEntries()}
              disabled={loading}
              data-testid="reconciliacion-mp-refresh"
            >
              {loading ? t('mercadopago.reconciliation.refreshing') : t('mercadopago.reconciliation.refresh')}
            </button>
            <button
              type="button"
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
              onClick={() => void handleRunJob()}
              disabled={jobLoading}
              data-testid="reconciliacion-mp-run-job"
            >
              {jobLoading ? t('mercadopago.reconciliation.jobRunning') : t('mercadopago.reconciliation.runJob')}
            </button>
          </div>
        </header>

        <div
          id={feedbackId}
          role="status"
          aria-live="polite"
          className="mb-4 min-h-[1.25rem] text-sm"
          data-testid="reconciliacion-mp-feedback"
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

        <AsyncWrapper loading={loading} error={loadError}>
          {entries.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400" data-testid="reconciliacion-mp-empty">
              {t('mercadopago.reconciliation.empty')}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm" data-testid="reconciliacion-mp-table">
                <caption className="sr-only">{t('mercadopago.reconciliation.title')}</caption>
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 text-left">
                    <th scope="col" className="py-2 pr-3">
                      {t('mercadopago.reconciliation.colDate')}
                    </th>
                    <th scope="col" className="py-2 pr-3">
                      {t('mercadopago.reconciliation.colAmount')}
                    </th>
                    <th scope="col" className="py-2 pr-3">
                      {t('mercadopago.reconciliation.colPayer')}
                    </th>
                    <th scope="col" className="py-2 pr-3">
                      {t('mercadopago.reconciliation.colIdentification')}
                    </th>
                    <th scope="col" className="py-2 pr-3">
                      {t('mercadopago.reconciliation.colAssign')}
                    </th>
                    <th scope="col" className="py-2 pr-3">
                      {t('mercadopago.reconciliation.colActions')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => {
                    const draft = drafts[entry.mpPaymentId] ?? emptyDraft()
                    const rowTestId = `reconciliacion-mp-row-${entry.mpPaymentId}`
                    return (
                      <tr
                        key={entry.mpPaymentId}
                        className="border-b border-slate-100 dark:border-slate-800 align-top"
                        data-testid={rowTestId}
                      >
                        <td className="py-3 pr-3 whitespace-nowrap">{formatDate(entry.paymentDate)}</td>
                        <td className="py-3 pr-3 font-mono whitespace-nowrap">
                          {formatMoney(entry.transactionAmount, entry.currencyId)}
                        </td>
                        <td className="py-3 pr-3">
                          <div>{entry.payerName ?? '—'}</div>
                          {entry.payerEmail && (
                            <div className="text-xs text-slate-500">{entry.payerEmail}</div>
                          )}
                        </td>
                        <td className="py-3 pr-3 font-mono">{entry.payerIdentification ?? '—'}</td>
                        <td className="py-3 pr-3 min-w-[16rem]">
                          <div className="flex flex-col gap-2">
                            <label className="text-xs text-slate-500" htmlFor={`${rowTestId}-cliente`}>
                              {t('mercadopago.reconciliation.clienteId')}
                            </label>
                            <input
                              id={`${rowTestId}-cliente`}
                              type="number"
                              min={1}
                              className="border rounded px-2 py-1 dark:bg-slate-900 dark:border-slate-600"
                              value={draft.clienteId}
                              onChange={(e) => updateDraft(entry.mpPaymentId, { clienteId: e.target.value })}
                              data-testid={`${rowTestId}-cliente-input`}
                            />
                            <button
                              type="button"
                              className="text-left text-blue-600 hover:underline text-xs"
                              onClick={() => void loadInvoicesForRow(entry.mpPaymentId)}
                              disabled={draft.invoicesLoading}
                              data-testid={`${rowTestId}-load-invoices`}
                            >
                              {draft.invoicesLoading
                                ? t('mercadopago.reconciliation.loadingInvoices')
                                : t('mercadopago.reconciliation.loadInvoices')}
                            </button>
                            {draft.invoicesError && (
                              <p className="text-xs text-red-600" data-testid={`${rowTestId}-invoices-error`}>
                                {draft.invoicesError}
                              </p>
                            )}
                            <label className="text-xs text-slate-500" htmlFor={`${rowTestId}-factura`}>
                              {t('mercadopago.reconciliation.factura')}
                            </label>
                            <select
                              id={`${rowTestId}-factura`}
                              className="border rounded px-2 py-1 dark:bg-slate-900 dark:border-slate-600"
                              value={draft.facturaId}
                              onChange={(e) => updateDraft(entry.mpPaymentId, { facturaId: e.target.value })}
                              data-testid={`${rowTestId}-factura-select`}
                            >
                              <option value="">{t('mercadopago.reconciliation.selectFacturaPlaceholder')}</option>
                              {draft.invoices.map((inv) => (
                                <option key={inv.facturaId} value={String(inv.facturaId)}>
                                  {inv.facturaRef} — {formatMoney(inv.pendiente)}
                                </option>
                              ))}
                            </select>
                          </div>
                        </td>
                        <td className="py-3 pr-3 whitespace-nowrap">
                          <div className="flex flex-col gap-2">
                            <button
                              type="button"
                              className="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
                              onClick={() => void handleReconcile(entry)}
                              disabled={draft.actionLoading}
                              data-testid={`${rowTestId}-reconcile`}
                            >
                              {draft.actionLoading
                                ? t('mercadopago.reconciliation.reconciling')
                                : t('mercadopago.reconciliation.reconcile')}
                            </button>
                            <button
                              type="button"
                              className="px-3 py-1 rounded border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-60"
                              onClick={() => void handleIgnore(entry)}
                              disabled={draft.actionLoading}
                              data-testid={`${rowTestId}-ignore`}
                            >
                              {t('mercadopago.reconciliation.ignore')}
                            </button>
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
      </div>
    </ErrorBoundary>
  )
}
