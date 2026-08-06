/**
 * @en Reads/writes per-tenant payment provider configuration (#377, ADR-0019).
 *   For `mercadopago` dual-writes legacy `MercadoPagoConfig` via `MercadoPagoConfigService`
 *   and `PaymentProviderConfig`, and dual-reads when no generic row exists yet.
 * @es Lee/escribe configuración de proveedor de pagos por tenant (#377, ADR-0019).
 *   Para `mercadopago` escribe en dual `MercadoPagoConfig` y `PaymentProviderConfig`.
 * @pt-BR Lê/escreve configuração de provedor de pagamentos por tenant (#377, ADR-0019).
 *   Para `mercadopago` escreve em dual `MercadoPagoConfig` e `PaymentProviderConfig`.
 */

import type { PrismaClient } from '@prisma/client'
import { encryptFiscalSecret } from '../fiscal/ar/fiscalSecrets'
import type { ServiceResult } from '../services/serviceResults'
import {
  MercadoPagoConfigService,
  type MercadoPagoConfigInput,
  type MercadoPagoConfigStatus,
} from '../services/MercadoPagoConfigService'
import { bootstrapPaymentProviders } from './bootstrapPaymentProviders'
import { getPaymentProviderAdapter, listRegisteredPaymentProviders } from './paymentProviderRegistry'
import type {
  PaymentEnvironment,
  PaymentProviderCapabilities,
  PaymentProviderCode,
} from './types'

export type PaymentProviderStatusEntry = {
  provider: PaymentProviderCode
  capabilities: PaymentProviderCapabilities
  configured: boolean
  enabled: boolean
  isDefault: boolean
  environment?: PaymentEnvironment
  accessTokenLast4?: string
  publicKey?: string
  webhookSecretSet?: boolean
  lastValidationAt?: Date | null
  validationStatus?: string | null
}

type MpSecretBundle = {
  accessToken?: string
  publicKey: string
  webhookSecret?: string
  sandboxMode: boolean
  activo: boolean
  collectorId?: string
  externalPosId?: string
  staticQrData?: string
}

export class PaymentProviderConfigService {
  private readonly mpConfig: MercadoPagoConfigService

  constructor(private readonly prisma: PrismaClient) {
    bootstrapPaymentProviders()
    this.mpConfig = new MercadoPagoConfigService(prisma)
  }

  getCapabilities(): PaymentProviderCapabilities[] {
    return listRegisteredPaymentProviders()
      .map((provider) => getPaymentProviderAdapter(provider, this.prisma)?.getCapabilities())
      .filter((c): c is PaymentProviderCapabilities => c !== undefined)
  }

  async getStatus(tenantId: number): Promise<ServiceResult<PaymentProviderStatusEntry[]>> {
    const providers = listRegisteredPaymentProviders()
    const rows = await this.prisma.paymentProviderConfig.findMany({ where: { tenantId } })
    const rowByProvider = new Map(rows.map((row) => [row.providerCode, row]))
    const legacyMp = rowByProvider.has('mercadopago')
      ? null
      : await this.prisma.mercadoPagoConfig.findUnique({ where: { tenantId } })

    const entries: PaymentProviderStatusEntry[] = []
    for (const provider of providers) {
      const adapter = getPaymentProviderAdapter(provider, this.prisma)
      if (!adapter) continue
      const row = rowByProvider.get(provider)
      if (row) {
        entries.push({
          provider,
          capabilities: adapter.getCapabilities(),
          configured: true,
          enabled: row.enabled,
          isDefault: row.isDefault,
          environment: row.environment as PaymentEnvironment,
          accessTokenLast4: row.accessTokenLast4 ?? undefined,
          publicKey: row.publicKey ?? undefined,
          webhookSecretSet: row.webhookSecretSet,
          lastValidationAt: row.lastValidationAt,
          validationStatus: row.validationStatus,
        })
        continue
      }
      if (provider === 'mercadopago' && legacyMp) {
        entries.push({
          provider,
          capabilities: adapter.getCapabilities(),
          configured: true,
          enabled: legacyMp.activo,
          isDefault: true,
          environment: legacyMp.sandboxMode ? 'sandbox' : 'production',
          accessTokenLast4: legacyMp.accessTokenLast4,
          publicKey: legacyMp.publicKey,
          webhookSecretSet: Boolean(legacyMp.webhookSecretEncrypted),
        })
        continue
      }
      entries.push({
        provider,
        capabilities: adapter.getCapabilities(),
        configured: false,
        enabled: false,
        isDefault: false,
      })
    }
    return { ok: true, data: entries }
  }

  async getMercadoPagoConfigStatus(tenantId: number): Promise<MercadoPagoConfigStatus> {
    return this.mpConfig.getStatus(tenantId)
  }

  async upsertMercadoPagoConfig(
    tenantId: number,
    input: MercadoPagoConfigInput,
  ): Promise<ServiceResult<{ configured: boolean }>> {
    const result = await this.mpConfig.upsert(tenantId, input)
    if (!result.ok) return result

    const legacy = await this.prisma.mercadoPagoConfig.findUnique({ where: { tenantId } })
    if (!legacy) return result

    const environment: PaymentEnvironment = legacy.sandboxMode ? 'sandbox' : 'production'
    const bundle: MpSecretBundle = {
      publicKey: legacy.publicKey,
      sandboxMode: legacy.sandboxMode,
      activo: legacy.activo,
      collectorId: legacy.collectorId ?? undefined,
      externalPosId: legacy.externalPosId ?? undefined,
      staticQrData: legacy.staticQrData ?? undefined,
    }
    if (input.accessToken?.trim()) {
      bundle.accessToken = input.accessToken.trim()
    }
    if (input.webhookSecret !== undefined) {
      bundle.webhookSecret = input.webhookSecret.trim() || undefined
    }

    const anyDefault = await this.prisma.paymentProviderConfig.findFirst({
      where: { tenantId, isDefault: true, NOT: { providerCode: 'mercadopago' } },
    })

    await this.prisma.paymentProviderConfig.upsert({
      where: { tenantId_providerCode: { tenantId, providerCode: 'mercadopago' } },
      create: {
        tenantId,
        providerCode: 'mercadopago',
        environment,
        enabled: legacy.activo,
        isDefault: anyDefault == null,
        encryptedConfig: encryptFiscalSecret(JSON.stringify(bundle)),
        accessTokenLast4: legacy.accessTokenLast4,
        publicKey: legacy.publicKey,
        webhookSecretSet: Boolean(legacy.webhookSecretEncrypted),
        configVersion: 1,
      },
      update: {
        environment,
        enabled: legacy.activo,
        encryptedConfig: encryptFiscalSecret(JSON.stringify(bundle)),
        accessTokenLast4: legacy.accessTokenLast4,
        publicKey: legacy.publicKey,
        webhookSecretSet: Boolean(legacy.webhookSecretEncrypted),
        configVersion: { increment: 1 },
      },
    })

    return result
  }

  async validateConfiguration(
    tenantId: number,
    provider: PaymentProviderCode,
  ): Promise<ServiceResult<{ configured: boolean; healthy?: boolean; accountName?: string }>> {
    const adapter = getPaymentProviderAdapter(provider, this.prisma)
    if (!adapter) {
      return { ok: false, status: 404, error: 'PAYMENT_PROVIDER_NOT_REGISTERED' }
    }
    if (!adapter.getCapabilities().implemented) {
      return { ok: false, status: 501, error: 'PAYMENT_PROVIDER_NOT_IMPLEMENTED' }
    }
    const configured = await adapter.validateConfiguration(tenantId)
    if (!configured.ok) return configured
    if (adapter.healthCheck) {
      const health = await adapter.healthCheck(tenantId)
      if (!health.ok) {
        return {
          ok: true,
          data: { configured: configured.data.configured, healthy: false },
        }
      }
      await this.prisma.paymentProviderConfig.updateMany({
        where: { tenantId, providerCode: provider },
        data: {
          lastValidationAt: new Date(),
          validationStatus: health.data.healthy ? 'ok' : 'error',
          validationError: null,
        },
      })
      return {
        ok: true,
        data: {
          configured: configured.data.configured,
          healthy: health.data.healthy,
          accountName: health.data.accountName,
        },
      }
    }
    return configured
  }
}
