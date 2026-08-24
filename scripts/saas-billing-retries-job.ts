/**
 * @en Job: suspend SaaS tenants whose payment retry window elapsed (#182).
 * @es Job: suspende tenants SaaS cuya ventana de reintento de cobro venció (#182).
 * @pt-BR Job: suspende tenants SaaS cuja janela de nova tentativa de cobrança expirou (#182).
 */
import { config } from 'dotenv'
import { PrismaClient } from '@prisma/client'
import { logger } from '../apps/server/logger'
import { SaasBillingService } from '../apps/server/saas/SaasBillingService'

config()

async function main(): Promise<void> {
  const prisma = new PrismaClient()
  try {
    const svc = new SaasBillingService(prisma)
    const result = await svc.processRetryWindow(new Date())
    logger.info(result, '[saas-billing-retries] done')
  } finally {
    await prisma.$disconnect()
  }
}

void main().catch((err: unknown) => {
  logger.error(
    { err: err instanceof Error ? { name: err.name, message: err.message } : String(err) },
    '[saas-billing-retries] failed',
  )
  process.exitCode = 1
})
