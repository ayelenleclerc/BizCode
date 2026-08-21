/**
 * @en SaaS tenant subscription status values for self-service trial (#180).
 * @es Valores de estado de suscripción SaaS para trial self-service (#180).
 * @pt-BR Valores de status de assinatura SaaS para trial self-service (#180).
 */

export const SAAS_STATUS_TRIAL = 'trial' as const
export const SAAS_STATUS_ACTIVE = 'active' as const
export const SAAS_STATUS_SUSPENDED_TRIAL = 'suspended_trial' as const

export type SaasStatus =
  | typeof SAAS_STATUS_TRIAL
  | typeof SAAS_STATUS_ACTIVE
  | typeof SAAS_STATUS_SUSPENDED_TRIAL

export const SAAS_TRIAL_DAYS = 30

export const TRIAL_REMINDER_DAYS_BEFORE = [7, 3, 1] as const

/**
 * @en True when invoice-emitting mutations must be blocked for expired trial tenants.
 * @es True cuando hay que bloquear mutaciones de emisión de factura por trial vencido.
 * @pt-BR True quando mutações de emissão de fatura devem ser bloqueadas por trial vencido.
 */
export function isInvoiceMutationBlockedByTrial(saasStatus: string): boolean {
  return saasStatus === SAAS_STATUS_SUSPENDED_TRIAL
}

/**
 * @en Whole days remaining until trialEndsAt (0 if ended or missing).
 * @es Días enteros restantes hasta trialEndsAt (0 si terminó o falta).
 * @pt-BR Dias inteiros restantes até trialEndsAt (0 se terminou ou falta).
 */
export function trialDaysRemaining(trialEndsAt: Date | null | undefined, now = new Date()): number | null {
  if (!trialEndsAt) return null
  const ms = trialEndsAt.getTime() - now.getTime()
  if (ms <= 0) return 0
  return Math.ceil(ms / (24 * 60 * 60 * 1000))
}
