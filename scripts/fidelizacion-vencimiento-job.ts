/**
 * @en Multi-tenant loyalty points expiry job — schedule daily (`0 8 * * *`).
 * @es Job multi-tenant de vencimiento de puntos — programar diario (`0 8 * * *`).
 * @pt-BR Job multi-tenant de vencimento de pontos — agendar diário (`0 8 * * *`).
 */
import { PrismaClient } from '@prisma/client'
import { FidelizacionService } from '../apps/server/services/FidelizacionService'

async function main(): Promise<void> {
  const tenantIdRaw = process.env.BIZCODE_TENANT_ID
  const prisma = new PrismaClient()
  const fidelizacion = new FidelizacionService(prisma)
  try {
    if (tenantIdRaw) {
      const tenantId = Number.parseInt(tenantIdRaw, 10)
      console.log(JSON.stringify({ tenantId, ...(await fidelizacion.runDailyExpiryJob(tenantId)) }))
      return
    }

    const rows = await prisma.paramEmpresa.findMany({ select: { tenantId: true } })
    const summaries: Array<{ tenantId: number; expired: number; notified: number }> = []
    for (const row of rows) {
      const result = await fidelizacion.runDailyExpiryJob(row.tenantId)
      summaries.push({ tenantId: row.tenantId, ...result })
    }
    console.log(JSON.stringify({ tenants: summaries.length, summaries }))
  } finally {
    await prisma.$disconnect()
  }
}

void main()
