/**
 * @en Multi-tenant Mercado Pago reconciliation job — schedule hourly (`0 * * * *`) for 02:00 per TZ (#178).
 * @es Job multi-tenant de reconciliación Mercado Pago — programar cada hora para 02:00 por TZ (#178).
 * @pt-BR Job multi-tenant de reconciliação Mercado Pago — agendar a cada hora para 02:00 por TZ (#178).
 */
import { PrismaClient } from '@prisma/client'
import { MercadoPagoReconciliationService } from '../server/services/MercadoPagoReconciliationService'

async function main(): Promise<void> {
  const tenantIdRaw = process.env.BIZCODE_TENANT_ID
  const prisma = new PrismaClient()
  const reconciliation = new MercadoPagoReconciliationService(prisma)
  try {
    if (tenantIdRaw) {
      const tenantId = Number.parseInt(tenantIdRaw, 10)
      console.log(
        JSON.stringify({ tenantId, ...(await reconciliation.runDailyJob(tenantId)) }),
      )
      return
    }

    const rows = await prisma.paramEmpresa.findMany({ select: { tenantId: true } })
    const summaries: Array<{
      tenantId: number
      processed: number
      autoReconciled: number
      queued: number
      skipped: number
    }> = []
    for (const row of rows) {
      const result = await reconciliation.runDailyJob(row.tenantId)
      summaries.push({ tenantId: row.tenantId, ...result })
    }
    console.log(JSON.stringify({ tenants: summaries.length, summaries }))
  } finally {
    await prisma.$disconnect()
  }
}

void main()
