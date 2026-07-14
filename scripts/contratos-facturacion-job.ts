/**
 * @en Multi-tenant daily recurring-contract billing job.
 * @es Job diario multi-tenant de facturación de contratos recurrentes.
 * @pt-BR Job diário multi-tenant de faturamento de contratos recorrentes.
 */
import { PrismaClient } from '@prisma/client'
import { ContratoBillingService } from '../apps/server/services/ContratoBillingService'

async function main(): Promise<void> {
  const tenantIdRaw = process.env.BIZCODE_TENANT_ID
  const tenantId = tenantIdRaw ? Number.parseInt(tenantIdRaw, 10) : undefined
  if (tenantIdRaw && (!Number.isInteger(tenantId) || (tenantId ?? 0) < 1)) {
    throw new Error('BIZCODE_TENANT_ID must be a positive integer')
  }

  const prisma = new PrismaClient()
  const billing = new ContratoBillingService(prisma)
  try {
    console.log(JSON.stringify(await billing.runDailyJob(tenantId)))
  } finally {
    await prisma.$disconnect()
  }
}

void main()
