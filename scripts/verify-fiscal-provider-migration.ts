/**
 * @en Verifies that every legacy `TenantFiscalConfig` row has a matching
 *   `FiscalProviderConfig` (`providerCode='arca_wsfe'`) row with the same `cuit`/`ambiente`,
 *   after running `npm run fiscal:migrate-provider-config` (#378, ADR-0018). Exits non-zero
 *   on any mismatch or missing row so CI/operators catch backfill drift.
 * @es Verifica que cada fila legacy `TenantFiscalConfig` tenga su fila
 *   `FiscalProviderConfig` (`providerCode='arca_wsfe'`) correspondiente con el mismo
 *   `cuit`/`ambiente`, tras correr `npm run fiscal:migrate-provider-config` (#378, ADR-0018).
 *   Sale con código distinto de cero ante cualquier desajuste o fila faltante.
 * @pt-BR Verifica que cada linha legada `TenantFiscalConfig` tenha sua linha
 *   `FiscalProviderConfig` (`providerCode='arca_wsfe'`) correspondente com o mesmo
 *   `cuit`/`ambiente`, após rodar `npm run fiscal:migrate-provider-config` (#378, ADR-0018).
 *   Sai com código diferente de zero perante qualquer divergência ou linha ausente.
 */

import { PrismaClient } from '@prisma/client'

type Mismatch = { tenantId: number; reason: string }

async function main(): Promise<void> {
  const prisma = new PrismaClient()
  try {
    const legacyConfigs = await prisma.tenantFiscalConfig.findMany()
    const mismatches: Mismatch[] = []

    for (const config of legacyConfigs) {
      const row = await prisma.fiscalProviderConfig.findUnique({
        where: { tenantId_providerCode: { tenantId: config.tenantId, providerCode: 'arca_wsfe' } },
      })
      if (!row) {
        mismatches.push({ tenantId: config.tenantId, reason: 'MISSING_FISCAL_PROVIDER_CONFIG' })
        continue
      }
      if (row.taxIdentifier !== config.cuit) {
        mismatches.push({ tenantId: config.tenantId, reason: 'CUIT_MISMATCH' })
      }
      if (row.environment !== config.ambiente) {
        mismatches.push({ tenantId: config.tenantId, reason: 'AMBIENTE_MISMATCH' })
      }
    }

    console.log(
      JSON.stringify({ totalLegacy: legacyConfigs.length, mismatches: mismatches.length, details: mismatches }),
    )
    if (mismatches.length > 0) {
      process.exitCode = 1
    }
  } finally {
    await prisma.$disconnect()
  }
}

void main()
