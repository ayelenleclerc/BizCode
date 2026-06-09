import { useId, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import type { PlanFeatureKey } from '@/lib/plans'
import { usePlan } from '@/contexts/PlanContext'

type PlanGateProps = {
  feature: PlanFeatureKey
  children: ReactNode
}

/**
 * @en Renders children when the tenant plan includes the feature; otherwise upgrade CTA (#181).
 * @es Renderiza hijos si el plan incluye la feature; si no, CTA de upgrade (#181).
 * @pt-BR Renderiza filhos quando o plano inclui o recurso; senão, CTA de upgrade (#181).
 */
export default function PlanGate({ feature, children }: PlanGateProps) {
  const { t } = useTranslation('common')
  const { status, snapshot, hasPlanFeature } = usePlan()
  const titleId = useId()

  if (status === 'loading' || status === 'idle') {
    return (
      <div role="status" aria-busy="true" data-testid="plan-gate-loading">
        {t('status.loading')}
      </div>
    )
  }

  if (hasPlanFeature(feature)) {
    return <>{children}</>
  }

  const planLabel = snapshot?.planName ?? snapshot?.planKey ?? '—'

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="rounded border border-amber-300 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-950"
      data-testid="plan-gate"
    >
      <h2 id={titleId} className="text-lg font-semibold text-amber-900 dark:text-amber-100">
        {t('plans.upgradeTitle')}
      </h2>
      <p className="mt-2 text-sm text-amber-800 dark:text-amber-200">
        {t('errors.planFeatureRequired', { feature, plan: planLabel })}
      </p>
      <p className="mt-3 text-sm text-amber-900 dark:text-amber-100" data-testid="plan-upgrade-cta">
        {t('plans.upgradeCta')}
      </p>
      </div>
  )
}
