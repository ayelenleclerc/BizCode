/**
 * @en Verifies PaymentProviderConfig backfill vs MercadoPagoConfig (#377).
 * @es Verifica el backfill PaymentProviderConfig vs MercadoPagoConfig (#377).
 * @pt-BR Verifica o backfill PaymentProviderConfig vs MercadoPagoConfig (#377).
 */

import { PrismaClient } from '@prisma/client'
import { decryptFiscalSecret } from '../apps/server/fiscal/ar/fiscalSecrets'

async function main(): Promise<void> {
  const prisma = new PrismaClient()
  try {
    const [legacyCount, genericCount, facturasWithMp] = await Promise.all([
      prisma.mercadoPagoConfig.count(),
      prisma.paymentProviderConfig.count({ where: { providerCode: 'mercadopago' } }),
      prisma.factura.count({ where: { mpPreferenceId: { not: null } } }),
    ])

    const legacy = await prisma.mercadoPagoConfig.findMany({ select: { tenantId: true } })
    let missingGeneric = 0
    let decryptFailures = 0
    for (const row of legacy) {
      const generic = await prisma.paymentProviderConfig.findUnique({
        where: {
          tenantId_providerCode: { tenantId: row.tenantId, providerCode: 'mercadopago' },
        },
      })
      if (!generic) {
        missingGeneric += 1
        continue
      }
      try {
        decryptFiscalSecret(generic.encryptedConfig)
      } catch {
        decryptFailures += 1
      }
    }

    const report = {
      legacyMercadoPagoConfig: legacyCount,
      paymentProviderConfigMercadopago: genericCount,
      missingGenericRows: missingGeneric,
      decryptFailures,
      facturasWithMpPreference: facturasWithMp,
      ok: missingGeneric === 0 && decryptFailures === 0,
    }
    console.log(JSON.stringify(report, null, 2))
    if (!report.ok) process.exitCode = 1
  } finally {
    await prisma.$disconnect()
  }
}

void main()
