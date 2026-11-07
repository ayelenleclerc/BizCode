/**
 * @en Multi-tenant Mercado Pago webhook inbox worker — drain pending/failed due rows (#447).
 * @es Worker multi-tenant del inbox de webhooks Mercado Pago — drena filas pending/failed vencidas (#447).
 * @pt-BR Worker multi-tenant do inbox de webhooks Mercado Pago — drena linhas pending/failed vencidas (#447).
 */
import { PrismaClient } from '@prisma/client'
import { MercadoPagoWebhookInboxService } from '../apps/server/services/MercadoPagoWebhookInboxService'

async function main(): Promise<void> {
  const tenantIdRaw = process.env.BIZCODE_TENANT_ID
  const prisma = new PrismaClient()
  const inbox = new MercadoPagoWebhookInboxService(prisma)
  try {
    if (tenantIdRaw) {
      const tenantId = Number.parseInt(tenantIdRaw, 10)
      const summary = await inbox.processDue({ tenantId })
      console.log(JSON.stringify({ tenantId, ...summary }))
      return
    }

    const summary = await inbox.processDue()
    console.log(JSON.stringify(summary))
  } finally {
    await prisma.$disconnect()
  }
}

void main()
