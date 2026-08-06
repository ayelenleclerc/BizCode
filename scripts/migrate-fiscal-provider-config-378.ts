/**
 * @en One-off backfill: creates a `FiscalProviderConfig` row (`providerCode='arca_wsfe'`)
 *   for every tenant that already has a legacy `TenantFiscalConfig` row, without touching
 *   `TenantFiscalConfig` (kept for dual-read/write, #378, ADR-0018). Re-encrypts the
 *   existing cert/key as a single AES-256-GCM JSON bundle via `fiscalSecrets.ts`, so this
 *   runs as a Node script (not raw SQL — see prisma/migrations/*_fiscal_multi_organism_378).
 *   Idempotent: skips tenants that already have an `arca_wsfe` row.
 * @es Backfill único: crea una fila `FiscalProviderConfig` (`providerCode='arca_wsfe'`)
 *   por cada tenant que ya tiene fila legacy `TenantFiscalConfig`, sin tocar
 *   `TenantFiscalConfig` (se conserva para lectura/escritura dual, #378, ADR-0018).
 *   Re-cifra el cert/key existente como un único bundle JSON AES-256-GCM vía
 *   `fiscalSecrets.ts`, por eso corre como script Node (no SQL puro — ver
 *   prisma/migrations/*_fiscal_multi_organism_378). Idempotente: omite tenants que ya
 *   tienen fila `arca_wsfe`.
 * @pt-BR Backfill único: cria uma linha `FiscalProviderConfig` (`providerCode='arca_wsfe'`)
 *   para cada tenant que já tem linha legada `TenantFiscalConfig`, sem alterar
 *   `TenantFiscalConfig` (mantida para leitura/escrita dupla, #378, ADR-0018). Recriptografa
 *   o cert/key existente como um único bundle JSON AES-256-GCM via `fiscalSecrets.ts`,
 *   por isso roda como script Node (não SQL puro — ver
 *   prisma/migrations/*_fiscal_multi_organism_378). Idempotente: pula tenants que já têm
 *   linha `arca_wsfe`.
 */

import { PrismaClient } from '@prisma/client'
import { decryptFiscalSecret, encryptFiscalSecret } from '../apps/server/fiscal/ar/fiscalSecrets'

async function main(): Promise<void> {
  const prisma = new PrismaClient()
  try {
    const legacyConfigs = await prisma.tenantFiscalConfig.findMany()
    let created = 0
    let skipped = 0
    for (const config of legacyConfigs) {
      const existing = await prisma.fiscalProviderConfig.findUnique({
        where: { tenantId_providerCode: { tenantId: config.tenantId, providerCode: 'arca_wsfe' } },
      })
      if (existing) {
        skipped += 1
        continue
      }
      const bundle = JSON.stringify({
        cuit: config.cuit,
        certificate: decryptFiscalSecret(config.certEncrypted),
        privateKey: decryptFiscalSecret(config.keyEncrypted),
        ambiente: config.ambiente,
      })
      const anyDefault = await prisma.fiscalProviderConfig.findFirst({
        where: { tenantId: config.tenantId, isDefault: true },
      })
      await prisma.fiscalProviderConfig.create({
        data: {
          tenantId: config.tenantId,
          providerCode: 'arca_wsfe',
          countryCode: 'AR',
          environment: config.ambiente,
          enabled: true,
          isDefault: anyDefault == null,
          taxIdentifier: config.cuit,
          encryptedConfig: encryptFiscalSecret(bundle),
          configVersion: 1,
        },
      })
      created += 1
    }
    console.log(JSON.stringify({ totalLegacy: legacyConfigs.length, created, skipped }))
  } finally {
    await prisma.$disconnect()
  }
}

void main()
