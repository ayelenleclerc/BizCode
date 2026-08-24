import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { saasAPI, type SaasBillingList } from '@/lib/api'

/**
 * @en Tenant SaaS billing history and subscribe/renew CTA (#182).
 * @es Historial de billing SaaS del tenant y CTA de suscribir/renovar (#182).
 * @pt-BR Histórico de billing SaaS do tenant e CTA de assinar/renovar (#182).
 */
export default function BillingPage() {
  const { t } = useTranslation('saas')
  const [data, setData] = useState<SaasBillingList | null>(null)
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const load = () => {
    setLoadState('loading')
    setErrorMessage(null)
    void saasAPI
      .billing()
      .then((body) => {
        setData(body)
        setLoadState('ready')
      })
      .catch((err: unknown) => {
        setLoadState('error')
        setErrorMessage(err instanceof Error ? err.message : t('billing.errorGeneric'))
      })
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initial load only
  }, [])

  const onSubscribe = async () => {
    setSubmitting(true)
    setSuccessMessage(null)
    setErrorMessage(null)
    try {
      const result = await saasAPI.subscribe()
      setSuccessMessage(result.mock ? t('billing.successMock') : t('billing.successLive'))
      load()
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : t('billing.errorGeneric'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl p-8" data-testid="saas-billing-page">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('billing.title')}</h1>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{t('billing.subtitle')}</p>

      {loadState === 'loading' ? (
        <p role="status" aria-busy="true" className="mt-6" data-testid="saas-billing-loading">
          {t('billing.loading')}
        </p>
      ) : null}

      {loadState === 'error' ? (
        <p role="alert" className="mt-6 text-red-700 dark:text-red-300" data-testid="saas-billing-error">
          {errorMessage}
        </p>
      ) : null}

      {successMessage ? (
        <p role="status" className="mt-6 text-green-800 dark:text-green-200" data-testid="saas-billing-success">
          {successMessage}
        </p>
      ) : null}

      {loadState === 'ready' && data ? (
        <div className="mt-6 space-y-6">
          <p data-testid="saas-billing-status">
            {t('billing.status')}: <strong>{data.saasStatus}</strong>
            {data.subscription ? ` · ${data.subscription.planKey}` : null}
          </p>
          <button
            type="button"
            onClick={() => void onSubscribe()}
            disabled={submitting}
            className="rounded bg-sky-600 px-4 py-2 font-medium text-white disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
            data-testid="saas-billing-subscribe"
          >
            {submitting ? t('billing.submitting') : t('billing.subscribeCta')}
          </button>

          {data.invoices.length === 0 ? (
            <p data-testid="saas-billing-empty">{t('billing.empty')}</p>
          ) : (
            <table className="w-full border-collapse text-left text-sm" data-testid="saas-billing-invoices">
              <caption className="sr-only">{t('billing.tableCaption')}</caption>
              <thead>
                <tr className="border-b border-slate-300 dark:border-slate-600">
                  <th scope="col">{t('billing.colPeriod')}</th>
                  <th scope="col">{t('billing.colPlan')}</th>
                  <th scope="col">{t('billing.colAmount')}</th>
                  <th scope="col">{t('billing.colStatus')}</th>
                </tr>
              </thead>
              <tbody>
                {data.invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-slate-200 dark:border-slate-700">
                    <td>{inv.periodStart.slice(0, 10)}</td>
                    <td>{inv.planKey}</td>
                    <td>
                      {inv.amount} {inv.currency}
                    </td>
                    <td>{inv.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : null}
    </div>
  )
}
