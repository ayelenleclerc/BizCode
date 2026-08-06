/**
 * @en One-off backfill: creates `PaymentProviderConfig` (`providerCode='mercadopago'`)
 *   for every tenant with legacy `MercadoPagoConfig` (#377). Idempotent.
 * @es Backfill: crea `PaymentProviderConfig` mercadopago desde MercadoPagoConfig (#377).
 * @pt-BR Backfill: cria PaymentProviderConfig mercadopago a partir de MercadoPagoConfig (#377).
 */

import { PrismaClient } from '@prisma/client'
import { decryptFiscalSecret, encryptFiscalSecret } from '../apps/server/fiscal/ar/fiscalSecrets'

async function main(): Promise<void> {
  const prisma = new PrismaClient()
  try {
    const legacyConfigs = await prisma.mercadoPagoConfig.findMany()
    let created = 0
    let skipped = 0
    for (const config of legacyConfigs) {
      const existing = await prisma.paymentProviderConfig.findUnique({
        where: {
          tenantId_providerCode: { tenantId: config.tenantId, providerCode: 'mercadopago' },
        },
      })
      if (existing) {
        skipped += 1
        continue
      }
      const accessToken = decryptFiscalSecret(config.accessTokenEncrypted)
      const webhookSecret = config.webhookSecretEncrypted
        ? decryptFiscalSecret(config.webhookSecretEncrypted)
        : undefined
      const bundle = JSON.stringify({
        accessToken,
        publicKey: config.publicKey,
        webhookSecret,
        sandboxMode: config.sandboxMode,
        activo: config.activo,
        collectorId: config.collectorId ?? undefined,
        externalPosId: config.externalPosId ?? undefined,
        staticQrData: config.staticQrData ?? undefined,
      })
      const anyDefault = await prisma.paymentProviderConfig.findFirst({
        where: { tenantId: config.tenantId, isDefault: true },
      })
      await prisma.paymentProviderConfig.create({
        data: {
          tenantId: config.tenantId,
          providerCode: 'mercadopago',
          environment: config.sandboxMode ? 'sandbox' : 'production',
          enabled: config.activo,
          isDefault: anyDefault == null,
          encryptedConfig: encryptFiscalSecret(bundle),
          accessTokenLast4: config.accessTokenLast4,
          publicKey: config.publicKey,
          webhookSecretSet: Boolean(config.webhookSecretEncrypted),
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
