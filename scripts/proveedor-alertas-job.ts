/**
 * @en Multi-tenant supplier payable alert job — schedule hourly (`0 * * * *`) for 07:00 per TZ (#275).
 * @es Job multi-tenant de alertas de facturas a pagar — programar cada hora para 07:00 por TZ (#275).
 * @pt-BR Job multi-tenant de alertas de faturas a pagar — agendar a cada hora para 07:00 por TZ (#275).
 */
import { PrismaClient } from '@prisma/client'
import { ProveedorAlertasService } from '../apps/server/services/ProveedorAlertasService'

async function main(): Promise<void> {
  const tenantIdRaw = process.env.BIZCODE_TENANT_ID
  const prisma = new PrismaClient()
  const alertas = new ProveedorAlertasService(prisma)
  try {
    if (tenantIdRaw) {
      const tenantId = Number.parseInt(tenantIdRaw, 10)
      console.log(JSON.stringify({ tenantId, ...(await alertas.runDailyJob(tenantId)) }))
      return
    }

    const rows = await prisma.paramEmpresa.findMany({ select: { tenantId: true } })
    const summaries: Array<{ tenantId: number; sent: number; skipped: number }> = []
    for (const row of rows) {
      const result = await alertas.runDailyJob(row.tenantId)
      summaries.push({ tenantId: row.tenantId, ...result })
    }
    console.log(JSON.stringify({ tenants: summaries.length, summaries }))
  } finally {
    await prisma.$disconnect()
  }
}

void main()
