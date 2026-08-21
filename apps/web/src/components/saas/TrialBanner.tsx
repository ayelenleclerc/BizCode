import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { saasAPI, type SaasTrialStatus } from '@/lib/api'

/**
 * @en Authenticated banner showing remaining SaaS trial days (#180).
 * @es Banner autenticado con días restantes del trial SaaS (#180).
 * @pt-BR Banner autenticado com dias restantes do trial SaaS (#180).
 */
export default function TrialBanner() {
  const { t } = useTranslation('saas')
  const [trial, setTrial] = useState<SaasTrialStatus | null>(null)
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'hidden' | 'error'>('loading')

  useEffect(() => {
    let cancelled = false
    void saasAPI
      .trial()
      .then((data) => {
        if (cancelled) return
        if (data.saasStatus !== 'trial' && data.saasStatus !== 'suspended_trial') {
          setLoadState('hidden')
          return
        }
        setTrial(data)
        setLoadState('ready')
      })
      .catch(() => {
        if (!cancelled) setLoadState('error')
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (loadState === 'loading' || loadState === 'hidden' || loadState === 'error' || !trial) {
    return null
  }

  const expired = trial.invoiceMutationsBlocked || trial.daysRemaining === 0

  return (
    <div
      role="status"
      data-testid="saas-trial-banner"
      className={
        expired
          ? 'border-b border-red-300 bg-red-50 px-8 py-3 text-sm text-red-950 dark:border-red-800 dark:bg-red-950 dark:text-red-100'
          : 'border-b border-sky-300 bg-sky-50 px-8 py-3 text-sm text-sky-950 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-100'
      }
    >
      <p>
        {expired
          ? t('trial.bannerExpired')
          : t('trial.banner', { days: trial.daysRemaining ?? 0 })}{' '}
        <Link
          to="/configuracion/empresa"
          className="font-medium underline"
          data-testid="saas-trial-banner-cta"
        >
          {t('trial.bannerCta')}
        </Link>
      </p>
    </div>
  )
}
