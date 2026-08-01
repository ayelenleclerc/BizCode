/**
 * @en Multi-tenant Mercado Libre token refresh job — schedule every 5 hours (#183).
 * @es Job multi-tenant de refresh de tokens Mercado Libre — programar cada 5 horas (#183).
 * @pt-BR Job multi-tenant de refresh de tokens Mercado Livre — agendar a cada 5 horas (#183).
 */
import { PrismaClient } from '@prisma/client'
import { MeliOAuthService } from '../apps/server/services/MeliOAuthService'

async function main(): Promise<void> {
  const tenantIdRaw = process.env.BIZCODE_TENANT_ID
  const prisma = new PrismaClient()
  const oauth = new MeliOAuthService(prisma)
  try {
    if (tenantIdRaw) {
      const tenantId = Number.parseInt(tenantIdRaw, 10)
      console.log(JSON.stringify({ tenantId, ...(await oauth.refreshTenantIfNeeded(tenantId, true)) }))
      return
    }

    const summary = await oauth.refreshExpiringTokens()
    console.log(JSON.stringify(summary))
  } finally {
    await prisma.$disconnect()
  }
}

void main()
