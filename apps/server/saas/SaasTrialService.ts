import type { PrismaClient } from '@prisma/client'
import {
  SAAS_STATUS_SUSPENDED_TRIAL,
  SAAS_STATUS_TRIAL,
  isInvoiceMutationBlockedByTrial,
  trialDaysRemaining,
} from './saasStatus'

export type TenantTrialSnapshot = {
  saasStatus: string
  trialEndsAt: Date | null
  daysRemaining: number | null
  invoiceMutationsBlocked: boolean
}

/**
 * @en Resolves and refreshes SaaS trial status for a tenant (#180).
 * @es Resuelve y actualiza el estado de trial SaaS de un tenant (#180).
 * @pt-BR Resolve e atualiza o status de trial SaaS de um tenant (#180).
 */
export class SaasTrialService {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * @en If trial ended, persist `suspended_trial` then return snapshot.
   * @es Si el trial terminó, persiste `suspended_trial` y devuelve snapshot.
   * @pt-BR Se o trial terminou, persiste `suspended_trial` e retorna snapshot.
   */
  async ensureAndGetSnapshot(tenantId: number, now = new Date()): Promise<TenantTrialSnapshot | null> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { saasStatus: true, trialEndsAt: true },
    })
    if (!tenant) return null

    let saasStatus = tenant.saasStatus
    const trialEndsAt = tenant.trialEndsAt

    if (
      saasStatus === SAAS_STATUS_TRIAL &&
      trialEndsAt !== null &&
      trialEndsAt.getTime() <= now.getTime()
    ) {
      await this.prisma.tenant.update({
        where: { id: tenantId },
        data: { saasStatus: SAAS_STATUS_SUSPENDED_TRIAL },
      })
      saasStatus = SAAS_STATUS_SUSPENDED_TRIAL
    }

    return {
      saasStatus,
      trialEndsAt,
      daysRemaining:
        saasStatus === SAAS_STATUS_TRIAL || saasStatus === SAAS_STATUS_SUSPENDED_TRIAL
          ? trialDaysRemaining(trialEndsAt, now)
          : null,
      invoiceMutationsBlocked: isInvoiceMutationBlockedByTrial(saasStatus),
    }
  }

  async assertCanCreateInvoice(tenantId: number, now = new Date()): Promise<
    | { ok: true }
    | { ok: false; status: 403; error: string; code: 'TRIAL_SUSPENDED' }
  > {
    const snap = await this.ensureAndGetSnapshot(tenantId, now)
    if (!snap) {
      return { ok: false, status: 403, error: 'Tenant not found', code: 'TRIAL_SUSPENDED' }
    }
    if (snap.invoiceMutationsBlocked) {
      return {
        ok: false,
        status: 403,
        error: 'Trial expired — invoice creation is read-only until subscription is activated',
        code: 'TRIAL_SUSPENDED',
      }
    }
    return { ok: true }
  }
}
