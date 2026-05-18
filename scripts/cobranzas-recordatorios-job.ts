/**
 * @en Daily overdue reminder job — schedule at 08:00 tenant local time (cron / GitHub Actions).
 * @es Job diario de recordatorios — programar a las 08:00 hora local (cron / GitHub Actions).
 * @pt-BR Job diário de lembretes — agendar às 08:00 horário local (cron / GitHub Actions).
 */
import { PrismaClient } from '@prisma/client'
import { CobranzasService } from '../server/services/CobranzasService'

async function main(): Promise<void> {
  const tenantIdRaw = process.env.BIZCODE_TENANT_ID
  if (!tenantIdRaw) {
    console.error('Set BIZCODE_TENANT_ID')
    process.exit(1)
  }
  const prisma = new PrismaClient()
  const cobranzas = new CobranzasService(prisma)
  try {
    const summary = await cobranzas.runDailyJob(
      Number.parseInt(tenantIdRaw, 10),
      process.env.BIZCODE_RECORDATORIO_CANAL ?? 'email',
    )
    console.log(JSON.stringify(summary))
  } finally {
    await prisma.$disconnect()
  }
}

void main()
