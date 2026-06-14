import { useCallback, useEffect, useId, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CanAccess } from '@/components/CanAccess'
import { useFeatureFlags } from '@/contexts/FeatureFlagsContext'
import { mercadopagoAPI, type MercadoPagoChargebackEntry } from '@/lib/api'

function formatDate(value: string | null): string {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString('es-AR')
}

export default function ContracargosMpPage() {
  const { t } = useTranslation('finanzas')

  return (
    <CanAccess
      permission="reports.financial.read"
      fallback={
        <div className="p-8" data-testid="contracargos-mp-forbidden">
          <p className="text-slate-600 dark:text-slate-300">{t('forbidden')}</p>
        </div>
      }
    >
      <ContracargosMpGate />
    </CanAccess>
  )
}

function ContracargosMpGate() {
  const { t } = useTranslation('finanzas')
  const { hasIntegration, status } = useFeatureFlags()

  if (status === 'loading' || status === 'idle') {
    return (
      <div className="p-8" data-testid="contracargos-mp-loading">
        <p className="text-slate-500">{t('mercadopago.chargeback.loading')}</p>
      </div>
    )
  }

  if (!hasIntegration('mercadopago')) {
    return (
      <div className="p-8" data-testid="contracargos-mp-integration-disabled">
        <p className="text-slate-600 dark:text-slate-300">
          {t('mercadopago.chargeback.integrationDisabled')}
        </p>
        <Link to="/finanzas" className="text-blue-600 hover:underline text-sm mt-2 inline-block">
          {t('mercadopago.chargeback.backToFinance')}
        </Link>
      </div>
    )
  }

  return <ContracargosMpPageContent />
}

function ContracargosMpPageContent() {
  const { t } = useTranslation('finanzas')
  const feedbackId = useId()
  const [entries, setEntries] = useState<MercadoPagoChargebackEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [actionId, setActionId] = useState<number | null>(null)

  const loadEntries = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const data = await mercadopagoAPI.listChargebacks()
      setEntries(data)
    } catch (err: unknown) {
      setLoadError(err instanceof Error ? err.message : t('mercadopago.chargeback.loadError'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    void loadEntries()
  }, [loadEntries])

  const handleUpdate = async (id: number, estado: 'resuelto' | 'ignorado') => {
    setActionId(id)
    setFeedback(null)
    try {
      await mercadopagoAPI.updateChargeback(id, estado)
      setFeedback(
        estado === 'resuelto'
          ? t('mercadopago.chargeback.resolveSuccess', { id })
          : t('mercadopago.chargeback.ignoreSuccess', { id }),
      )
      await loadEntries()
    } catch {
      setFeedback(t('mercadopago.chargeback.actionError'))
    } finally {
      setActionId(null)
    }
  }

  return (
    <div className="p-6" data-testid="contracargos-mp-page">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {t('mercadopago.chargeback.title')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t('mercadopago.chargeback.subtitle')}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadEntries()}
          disabled={loading}
          className="rounded bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-300 disabled:opacity-50 dark:bg-slate-700 dark:text-slate-200"
          data-testid="contracargos-mp-refresh"
        >
          {loading ? t('mercadopago.chargeback.refreshing') : t('mercadopago.chargeback.refresh')}
        </button>
      </div>

      {loadError && (
        <p className="mb-4 text-sm text-red-600 dark:text-red-400" role="alert">
          {loadError}
        </p>
      )}

      {feedback && (
        <p
          id={feedbackId}
          className="mb-4 text-sm text-green-700 dark:text-green-300"
          role="status"
          aria-live="polite"
          data-testid="contracargos-mp-feedback"
        >
          {feedback}
        </p>
      )}

      {loading && entries.length === 0 ? (
        <p className="text-slate-500">{t('mercadopago.chargeback.loading')}</p>
      ) : entries.length === 0 ? (
        <p className="text-slate-500 dark:text-slate-400" data-testid="contracargos-mp-empty">
          {t('mercadopago.chargeback.empty')}
        </p>
      ) : (
        <table className="w-full text-sm" data-testid="contracargos-mp-table">
          <thead>
            <tr className="border-b border-slate-200 text-left dark:border-slate-700">
              <th className="py-2 pr-3">{t('mercadopago.chargeback.colDate')}</th>
              <th className="py-2 pr-3">{t('mercadopago.chargeback.colChargebackId')}</th>
              <th className="py-2 pr-3">{t('mercadopago.chargeback.colPaymentId')}</th>
              <th className="py-2 pr-3">{t('mercadopago.chargeback.colFactura')}</th>
              <th className="py-2">{t('mercadopago.chargeback.colActions')}</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => {
              const rowTestId = `contracargos-mp-row-${entry.id}`
              const busy = actionId === entry.id
              return (
                <tr key={entry.id} className="border-b border-slate-100 dark:border-slate-800" data-testid={rowTestId}>
                  <td className="py-2 pr-3">{formatDate(entry.createdAt)}</td>
                  <td className="py-2 pr-3 font-mono text-xs">{entry.mpChargebackId}</td>
                  <td className="py-2 pr-3 font-mono text-xs">{entry.mpPaymentId ?? '—'}</td>
                  <td className="py-2 pr-3">{entry.facturaId ?? '—'}</td>
                  <td className="py-2">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void handleUpdate(entry.id, 'resuelto')}
                        className="rounded bg-green-600 px-3 py-1 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                        data-testid={`${rowTestId}-resolve`}
                      >
                        {t('mercadopago.chargeback.resolve')}
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void handleUpdate(entry.id, 'ignorado')}
                        className="rounded bg-slate-500 px-3 py-1 text-xs font-semibold text-white hover:bg-slate-600 disabled:opacity-50"
                        data-testid={`${rowTestId}-ignore`}
                      >
                        {t('mercadopago.chargeback.ignore')}
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}
