import type { PrismaClient } from '@prisma/client'
import { resolveJurisdiction, type FiscalJurisdictionCode } from '@bizcode/types'
import { getCachedTenantFeatures } from './tenantConfigCache'

/**
 * @en Tax jurisdiction of a tenant, used to pick VAT rates when totalling documents (#207).
 * @es Jurisdicción fiscal de un tenant, usada para elegir las alícuotas al totalizar documentos (#207).
 * @pt-BR Jurisdição fiscal de um tenant, usada para escolher as alíquotas ao totalizar documentos (#207).
 *
 * @en Reads the shared tenant-config cache first; unknown or missing values fall back to Argentina.
 * @es Lee primero la caché compartida de configuración; valores desconocidos o ausentes caen a Argentina.
 * @pt-BR Lê primeiro o cache compartilhado de configuração; valores desconhecidos ou ausentes caem para a Argentina.
 */
export async function getTenantJurisdiction(
  prisma: PrismaClient,
  tenantId: number,
): Promise<FiscalJurisdictionCode> {
  const cached = getCachedTenantFeatures(tenantId)
  if (cached) return cached.jurisdiction

  const row = await prisma.tenantConfig.findUnique({
    where: { tenantId },
    select: { jurisdiccionFiscal: true },
  })
  return resolveJurisdiction(row?.jurisdiccionFiscal)
}
