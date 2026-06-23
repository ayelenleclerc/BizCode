/**
 * @en Multi-tenant overdue reminder job — schedule hourly (`0 * * * *`) to hit 08:00 in each TZ.
 * @es Job multi-tenant de recordatorios — programar cada hora (`0 * * * *`) para cubrir 08:00 por TZ.
 * @pt-BR Job multi-tenant de lembretes — agendar a cada hora (`0 * * * *`) para atingir 08:00 por TZ.
 */
import { PrismaClient } from '@prisma/client'
import { CobranzasService } from '../apps/server/services/CobranzasService'

async function main(): Promise<void> {
  const tenantIdRaw = process.env.BIZCODE_TENANT_ID
  const canal = process.env.BIZCODE_RECORDATORIO_CANAL ?? 'email'
  const prisma = new PrismaClient()
  const cobranzas = new CobranzasService(prisma)
  try {
    if (tenantIdRaw) {
      const tenantId = Number.parseInt(tenantIdRaw, 10)
      console.log(JSON.stringify({ tenantId, ...(await cobranzas.runDailyJob(tenantId, canal)) }))
      return
    }

    const rows = await prisma.paramEmpresa.findMany({ select: { tenantId: true } })
    const summaries: Array<{ tenantId: number; sent: number; skipped: number }> = []
    for (const row of rows) {
      const result = await cobranzas.runDailyJob(row.tenantId, canal)
      summaries.push({ tenantId: row.tenantId, ...result })
    }
    console.log(JSON.stringify({ tenants: summaries.length, summaries }))
  } finally {
    await prisma.$disconnect()
  }
}

void main()
