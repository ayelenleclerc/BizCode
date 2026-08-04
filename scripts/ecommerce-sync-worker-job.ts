/**
 * @en Multi-tenant ecommerce sync worker — schedule every minute (#189).
 * @es Worker multi-tenant de sync eCommerce — cada minuto (#189).
 * @pt-BR Worker multi-tenant de sync eCommerce — a cada minuto (#189).
 */
import { PrismaClient } from '@prisma/client'
import { bootstrapEcommerceConnectors } from '../apps/server/integrations/ecommerce/bootstrapEcommerceConnectors'
import { EcommerceSyncEngine } from '../apps/server/services/EcommerceSyncEngine'

async function main(): Promise<void> {
  bootstrapEcommerceConnectors()
  const prisma = new PrismaClient()
  const engine = new EcommerceSyncEngine(prisma)
  try {
    const limitRaw = process.env.BIZCODE_ECOMMERCE_SYNC_LIMIT
    const limit = limitRaw ? Number.parseInt(limitRaw, 10) : 50
    const summary = await engine.processDueJobs(
      Number.isFinite(limit) && limit > 0 ? limit : 50,
    )
    console.log(JSON.stringify(summary))
  } finally {
    await prisma.$disconnect()
  }
}

void main()
