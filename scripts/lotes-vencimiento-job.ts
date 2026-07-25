/**
 * @en Multi-tenant lot expiry alert job — schedule daily (`0 8 * * *`).
 * @es Job multi-tenant de alerta de vencimiento de lotes — programar diario (`0 8 * * *`).
 * @pt-BR Job multi-tenant de alerta de vencimento de lotes — agendar diário (`0 8 * * *`).
 */
import { PrismaClient } from '@prisma/client'
import { LoteService } from '../apps/server/services/LoteService'

async function main(): Promise<void> {
  const tenantIdRaw = process.env.BIZCODE_TENANT_ID
  const prisma = new PrismaClient()
  const lotes = new LoteService(prisma)
  try {
    if (tenantIdRaw) {
      const tenantId = Number.parseInt(tenantIdRaw, 10)
      console.log(JSON.stringify({ tenantId, ...(await lotes.runDailyExpiryAlertJob(tenantId)) }))
      return
    }

    const rows = await prisma.paramEmpresa.findMany({ select: { tenantId: true } })
    const summaries: Array<{ tenantId: number; notified: number }> = []
    for (const row of rows) {
      const result = await lotes.runDailyExpiryAlertJob(row.tenantId)
      summaries.push({ tenantId: row.tenantId, ...result })
    }
    console.log(JSON.stringify({ tenants: summaries.length, summaries }))
  } finally {
    await prisma.$disconnect()
  }
}

void main()
