/**
 * @en Multi-tenant Mercado Libre stock reconcile job — schedule hourly (#185).
 * @es Job multi-tenant de reconciliación de stock Mercado Libre — cada hora (#185).
 * @pt-BR Job multi-tenant de reconciliação de estoque Mercado Livre — a cada hora (#185).
 *
 * BizCode stock is the source of truth: when ML `available_quantity` differs, push to ML
 * without creating duplicate `StockAjuste` rows.
 */
import { PrismaClient } from '@prisma/client'
import { MeliStockSyncService } from '../apps/server/services/MeliStockSyncService'

async function main(): Promise<void> {
  const tenantIdRaw = process.env.BIZCODE_TENANT_ID
  const prisma = new PrismaClient()
  const stockSync = new MeliStockSyncService(prisma)
  try {
    const tenantId = tenantIdRaw ? Number.parseInt(tenantIdRaw, 10) : undefined
    const summary = await stockSync.reconcileAll(
      tenantId != null && Number.isFinite(tenantId) ? tenantId : undefined,
    )
    console.log(JSON.stringify(summary))
  } finally {
    await prisma.$disconnect()
  }
}

void main()
