/**
 * @en Multi-tenant shipping tracking refresh job — schedule every 2 hours (#193).
 * @es Job multi-tenant de refresh de tracking — programar cada 2 horas (#193).
 * @pt-BR Job multi-tenant de atualização de rastreio — agendar a cada 2 horas (#193).
 */
import { PrismaClient } from '@prisma/client'
import { ShippingTrackingService } from '../apps/server/services/ShippingTrackingService'

async function main(): Promise<void> {
  const tenantIdRaw = process.env.BIZCODE_TENANT_ID
  const prisma = new PrismaClient()
  const tracking = new ShippingTrackingService(prisma)
  try {
    if (tenantIdRaw) {
      const tenantId = Number.parseInt(tenantIdRaw, 10)
      console.log(JSON.stringify({ tenantId, ...(await tracking.refreshInTransitForTenant(tenantId)) }))
      return
    }

    const configs = await prisma.shippingCarrierConfig.findMany({
      where: { activo: true },
      select: { tenantId: true },
      distinct: ['tenantId'],
    })
    const summaries: Array<{
      tenantId: number
      scanned: number
      refreshed: number
      deliveredNotified: number
      errors: number
    }> = []
    for (const row of configs) {
      const result = await tracking.refreshInTransitForTenant(row.tenantId)
      summaries.push({ tenantId: row.tenantId, ...result })
    }
    console.log(JSON.stringify({ tenants: summaries.length, summaries }))
  } finally {
    await prisma.$disconnect()
  }
}

void main()
