import { useEffect, useState, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { saasAPI, type SaasTrialStatus } from '@/lib/api'

const BILLING_PATH = '/configuracion/billing'

/**
 * @en When saasStatus is suspended_payment, only the renew billing page is operable (#182).
 * @es Con saasStatus suspended_payment, solo es operable la página de renovación (#182).
 * @pt-BR Com saasStatus suspended_payment, só a página de renovação é operável (#182).
 */
export default function SaasBillingGate({ children }: { children: ReactNode }) {
  const { t } = useTranslation('saas')
  const location = useLocation()
  const [trial, setTrial] = useState<SaasTrialStatus | null>(null)
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading')

  useEffect(() => {
    let cancelled = false
    void saasAPI
      .trial()
      .then((data) => {
        if (cancelled) return
        setTrial(data)
        setLoadState('ready')
      })
      .catch(() => {
        if (!cancelled) setLoadState('error')
      })
    return () => {
      cancelled = true
    }
  }, [location.pathname])

  if (loadState === 'loading') {
    return (
      <div role="status" aria-busy="true" data-testid="saas-billing-gate-loading" className="p-8">
        {t('billing.loading')}
      </div>
    )
  }

  if (loadState === 'error' || !trial || trial.saasStatus !== 'suspended_payment') {
    return children
  }

  if (location.pathname === BILLING_PATH) {
    return children
  }

  return (
    <div
      className="mx-auto max-w-lg p-8"
      data-testid="saas-billing-renew-gate"
      role="alert"
    >
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
        {t('billing.renewTitle')}
      </h1>
      <p className="mt-3 text-slate-700 dark:text-slate-300">{t('billing.renewBody')}</p>
      <Link
        to={BILLING_PATH}
        className="mt-6 inline-block rounded bg-sky-600 px-4 py-2 font-medium text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
        data-testid="saas-billing-renew-cta"
      >
        {t('billing.renewCta')}
      </Link>
    </div>
  )
}
