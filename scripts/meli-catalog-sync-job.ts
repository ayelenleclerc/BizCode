/**
 * @en Multi-tenant Mercado Libre catalog sync retry job — schedule every 5 minutes (#184).
 * @es Job multi-tenant de reintento de sync de catálogo Mercado Libre — cada 5 minutos (#184).
 * @pt-BR Job multi-tenant de retry de sync de catálogo Mercado Livre — a cada 5 minutos (#184).
 */
import { PrismaClient } from '@prisma/client'
import { MeliCatalogService } from '../apps/server/services/MeliCatalogService'

async function main(): Promise<void> {
  const tenantIdRaw = process.env.BIZCODE_TENANT_ID
  const prisma = new PrismaClient()
  const catalog = new MeliCatalogService(prisma)
  try {
    const tenantId = tenantIdRaw ? Number.parseInt(tenantIdRaw, 10) : undefined
    const summary = await catalog.retryPendingSyncs(
      tenantId != null && Number.isFinite(tenantId) ? tenantId : undefined,
    )
    console.log(JSON.stringify(summary))
  } finally {
    await prisma.$disconnect()
  }
}

void main()
