/**
 * @en Multi-tenant AFIP CAE retry job — schedule every 5 minutes (cron).
 * @es Job multi-tenant de reintento CAE AFIP — programar cada 5 minutos (cron).
 * @pt-BR Job multi-tenant de reintento CAE AFIP — agendar a cada 5 minutos (cron).
 */
import { PrismaClient } from '@prisma/client'
import { ArcaService } from '../apps/server/fiscal/ar/ArcaService'

async function main(): Promise<void> {
  const tenantIdRaw = process.env.BIZCODE_TENANT_ID
  const prisma = new PrismaClient()
  const arca = new ArcaService(prisma)
  try {
    if (tenantIdRaw) {
      const tenantId = Number.parseInt(tenantIdRaw, 10)
      console.log(JSON.stringify({ tenantId, ...(await arca.retryPending(tenantId)) }))
      return
    }

    const configs = await prisma.tenantFiscalConfig.findMany({ select: { tenantId: true } })
    const summaries: Array<{ tenantId: number; processed: number; issued: number; failed: number }> = []
    for (const row of configs) {
      const result = await arca.retryPending(row.tenantId)
      summaries.push({ tenantId: row.tenantId, ...result })
    }
    console.log(JSON.stringify({ tenants: summaries.length, summaries }))
  } finally {
    await prisma.$disconnect()
  }
}

void main()
