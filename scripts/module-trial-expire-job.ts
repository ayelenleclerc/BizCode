/**
 * @en Daily module trial expiry and 7-day owner warnings (#226).
 * @es Job diario de expiración de trials y avisos a owners a 7 días (#226).
 * @pt-BR Job diário de expiração de trials e avisos a owners em 7 dias (#226).
 */
import { PrismaClient } from '@prisma/client'
import { TenantTrialService } from '../server/services/TenantTrialService'

async function main(): Promise<void> {
  const tenantIdRaw = process.env.BIZCODE_TENANT_ID
  const tenantIdFilter =
    tenantIdRaw !== undefined && tenantIdRaw !== ''
      ? Number.parseInt(tenantIdRaw, 10)
      : undefined

  if (tenantIdFilter !== undefined && (!Number.isInteger(tenantIdFilter) || tenantIdFilter <= 0)) {
    console.error('BIZCODE_TENANT_ID must be a positive integer when set')
    process.exit(1)
  }

  const prisma = new PrismaClient()
  const trials = new TenantTrialService(prisma)
  try {
    const summary = await trials.runDailyJob(new Date(), tenantIdFilter)
    console.log(JSON.stringify(summary))
  } finally {
    await prisma.$disconnect()
  }
}

void main()
