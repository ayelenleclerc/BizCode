/**
 * @en SaaS tenant subscription status values for trial (#180) and paid billing (#182).
 * @es Valores de estado de suscripción SaaS para trial (#180) y billing de pago (#182).
 * @pt-BR Valores de status de assinatura SaaS para trial (#180) e billing pago (#182).
 */

export const SAAS_STATUS_TRIAL = 'trial' as const
export const SAAS_STATUS_ACTIVE = 'active' as const
export const SAAS_STATUS_SUSPENDED_TRIAL = 'suspended_trial' as const
export const SAAS_STATUS_SUSPENDED_PAYMENT = 'suspended_payment' as const

export type SaasStatus =
  | typeof SAAS_STATUS_TRIAL
  | typeof SAAS_STATUS_ACTIVE
  | typeof SAAS_STATUS_SUSPENDED_TRIAL
  | typeof SAAS_STATUS_SUSPENDED_PAYMENT

export const SAAS_TRIAL_DAYS = 30

export const TRIAL_REMINDER_DAYS_BEFORE = [7, 3, 1] as const

export const SAAS_PAYMENT_RETRY_MAX = 3
export const SAAS_PAYMENT_RETRY_WINDOW_DAYS = 7

export const SAAS_SUBSCRIPTION_PENDING = 'pending' as const
export const SAAS_SUBSCRIPTION_AUTHORIZED = 'authorized' as const
export const SAAS_SUBSCRIPTION_CANCELLED = 'cancelled' as const

export const SAAS_INVOICE_PENDING = 'pending' as const
export const SAAS_INVOICE_PAID = 'paid' as const
export const SAAS_INVOICE_FAILED = 'failed' as const

/**
 * @en True when invoice-emitting mutations must be blocked for expired trial tenants.
 * @es True cuando hay que bloquear mutaciones de emisión de factura por trial vencido.
 * @pt-BR True quando mutações de emissão de fatura devem ser bloqueadas por trial vencido.
 */
export function isInvoiceMutationBlockedByTrial(saasStatus: string): boolean {
  return saasStatus === SAAS_STATUS_SUSPENDED_TRIAL
}

/**
 * @en True when invoice mutations must be blocked for non-payment suspension (#182).
 * @es True cuando hay que bloquear mutaciones de factura por falta de pago (#182).
 * @pt-BR True quando mutações de fatura devem ser bloqueadas por falta de pagamento (#182).
 */
export function isInvoiceMutationBlockedByPayment(saasStatus: string): boolean {
  return saasStatus === SAAS_STATUS_SUSPENDED_PAYMENT
}

/**
 * @en True when SaaS status blocks business invoice create (trial or payment).
 * @es True cuando el estado SaaS bloquea crear factura de negocio (trial o pago).
 * @pt-BR True quando o status SaaS bloqueia criar fatura de negócio (trial ou pagamento).
 */
export function isInvoiceMutationBlocked(saasStatus: string): boolean {
  return isInvoiceMutationBlockedByTrial(saasStatus) || isInvoiceMutationBlockedByPayment(saasStatus)
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
