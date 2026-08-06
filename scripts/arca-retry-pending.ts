import { PrismaClient } from '@prisma/client'
import { FiscalDocumentRetryService } from '../apps/server/fiscal/FiscalDocumentRetryService'

/**
 * @en CLI alias kept for compat (`npm run arca:retry-pending`); delegates to the
 *   generalized `FiscalDocumentRetryService` (#378) so `FiscalDocument` rows stay in
 *   sync alongside `Factura.estadoCae`.
 * @es Alias de CLI mantenido por compatibilidad (`npm run arca:retry-pending`); delega
 *   en el `FiscalDocumentRetryService` generalizado (#378) para que las filas
 *   `FiscalDocument` queden sincronizadas junto a `Factura.estadoCae`.
 */
async function main(): Promise<void> {
  const tenantIdRaw = process.env.BIZCODE_TENANT_ID
  if (!tenantIdRaw) {
    console.error('Set BIZCODE_TENANT_ID')
    process.exit(1)
  }
  const prisma = new PrismaClient()
  const retryService = new FiscalDocumentRetryService(prisma)
  try {
    console.log(JSON.stringify(await retryService.retryPending(Number.parseInt(tenantIdRaw, 10))))
  } finally {
    await prisma.$disconnect()
  }
}

void main()
