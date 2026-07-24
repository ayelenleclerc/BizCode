/**
 * @en Multi-tenant daily BCRA official USD sync job (schedule ~10:00 America/Argentina/Buenos_Aires).
 * @es Job diario multi-tenant de sync BCRA oficial USD (programar ~10:00 America/Argentina/Buenos_Aires).
 * @pt-BR Job diário multi-tenant de sync BCRA oficial USD (agendar ~10:00 America/Argentina/Buenos_Aires).
 */
import { PrismaClient } from '@prisma/client'
import { TipoCambioService } from '../apps/server/services/TipoCambioService'

async function main(): Promise<void> {
  const tenantIdRaw = process.env.BIZCODE_TENANT_ID
  const tenantId = tenantIdRaw ? Number.parseInt(tenantIdRaw, 10) : undefined
  if (tenantIdRaw && (!Number.isInteger(tenantId) || (tenantId ?? 0) < 1)) {
    throw new Error('BIZCODE_TENANT_ID must be a positive integer')
  }

  const prisma = new PrismaClient()
  const service = new TipoCambioService(prisma)
  try {
    console.log(JSON.stringify(await service.runDailyJob(tenantId)))
  } finally {
    await prisma.$disconnect()
  }
}

void main()
