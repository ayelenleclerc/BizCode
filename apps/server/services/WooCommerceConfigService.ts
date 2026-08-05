import type { PrismaClient } from '@prisma/client'
import { decryptFiscalSecret, encryptFiscalSecret } from '../fiscal/ar/fiscalSecrets'
import { verifyWooCommerceConnection } from '../integrations/woocommerce/woocommerceApiClient'
import type { ServiceResult } from './serviceResults'

export type WooCommerceConfigStatus = {
  connected: boolean
  storeUrl?: string
  storeName?: string
  consumerKeyLast4?: string
  hasWebhookSecret?: boolean
  activo?: boolean
  conectadoAt?: string
  webhookUrl?: string
}

export type WooCommerceCredentialsInput = {
  storeUrl: string
  consumerKey: string
  consumerSecret: string
  webhookSecret?: string | null
  storeName?: string | null
}

function last4(value: string): string {
  const trimmed = value.trim()
  return trimmed.length <= 4 ? trimmed : trimmed.slice(-4)
}

function normalizeStoreUrl(raw: string): string {
  return raw.trim().replace(/\/+$/, '')
}

/**
 * @en Tenant WooCommerce REST API credential storage: consumer key/secret and optional webhook
 *   secret are AES-256-GCM encrypted at rest; only a last-4 hint of the consumer key is exposed (#188).
 * @es Almacenamiento de credenciales REST WooCommerce por tenant: consumer key/secret y webhook
 *   secret opcional cifrados AES-256-GCM en reposo; solo se expone el last-4 de la consumer key (#188).
 * @pt-BR Armazenamento de credenciais REST WooCommerce por tenant: consumer key/secret e webhook
 *   secret opcional criptografados AES-256-GCM em repouso; apenas o last-4 da consumer key é exposto (#188).
 */
export class WooCommerceConfigService {
  constructor(private readonly prisma: PrismaClient) {}

  async getStatus(tenantId: number, webhookUrl?: string): Promise<WooCommerceConfigStatus> {
    const row = await this.prisma.wooCommerceConfig.findUnique({
      where: { tenantId },
      select: {
        storeUrl: true,
        storeName: true,
        consumerKeyLast4: true,
        webhookSecretEncrypted: true,
        activo: true,
        conectadoAt: true,
      },
    })
    if (!row) {
      return { connected: false, webhookUrl }
    }
    return {
      connected: true,
      storeUrl: row.storeUrl,
      storeName: row.storeName ?? undefined,
      consumerKeyLast4: row.consumerKeyLast4,
      hasWebhookSecret: Boolean(row.webhookSecretEncrypted),
      activo: row.activo,
      conectadoAt: row.conectadoAt.toISOString(),
      webhookUrl,
    }
  }

  /**
   * @en Verifies credentials against `GET /products?per_page=1` before persisting them (#188).
   * @es Verifica las credenciales contra `GET /products?per_page=1` antes de persistirlas (#188).
   * @pt-BR Verifica as credenciais contra `GET /products?per_page=1` antes de persisti-las (#188).
   */
  async verifyAndSave(
    tenantId: number,
    input: WooCommerceCredentialsInput,
  ): Promise<ServiceResult<WooCommerceConfigStatus>> {
    const storeUrl = normalizeStoreUrl(input.storeUrl)
    const consumerKey = input.consumerKey.trim()
    const consumerSecret = input.consumerSecret.trim()
    if (!storeUrl || !consumerKey || !consumerSecret) {
      return { ok: false, status: 400, error: 'storeUrl, consumerKey and consumerSecret are required' }
    }

    try {
      await verifyWooCommerceConnection(storeUrl, consumerKey, consumerSecret)
    } catch (err: unknown) {
      const status =
        err && typeof err === 'object' && 'status' in err
          ? Number((err as { status: unknown }).status)
          : 502
      const message = err instanceof Error ? err.message : 'WooCommerce verification failed'
      return { ok: false, status: Number.isFinite(status) ? status : 502, error: message }
    }

    await this.upsertCredentials(tenantId, { ...input, storeUrl, consumerKey, consumerSecret })
    return { ok: true, data: await this.getStatus(tenantId) }
  }

  async upsertCredentials(tenantId: number, input: WooCommerceCredentialsInput): Promise<void> {
    const storeUrl = normalizeStoreUrl(input.storeUrl)
    const consumerKeyEncrypted = encryptFiscalSecret(input.consumerKey.trim())
    const consumerSecretEncrypted = encryptFiscalSecret(input.consumerSecret.trim())
    const consumerKeyLast4 = last4(input.consumerKey.trim())
    const webhookSecretEncrypted = input.webhookSecret?.trim()
      ? encryptFiscalSecret(input.webhookSecret.trim())
      : null
    const storeName = input.storeName?.trim() || null

    await this.prisma.wooCommerceConfig.upsert({
      where: { tenantId },
      create: {
        tenantId,
        storeUrl,
        storeName,
        consumerKeyEncrypted,
        consumerSecretEncrypted,
        consumerKeyLast4,
        webhookSecretEncrypted,
        conectadoAt: new Date(),
        activo: true,
      },
      update: {
        storeUrl,
        storeName,
        consumerKeyEncrypted,
        consumerSecretEncrypted,
        consumerKeyLast4,
        webhookSecretEncrypted,
        activo: true,
      },
    })
  }

  async getDecryptedCredentials(
    tenantId: number,
  ): Promise<ServiceResult<{ storeUrl: string; consumerKey: string; consumerSecret: string }>> {
    const row = await this.prisma.wooCommerceConfig.findUnique({ where: { tenantId } })
    if (!row) {
      return { ok: false, status: 404, error: 'WooCommerce is not connected for this tenant' }
    }
    return {
      ok: true,
      data: {
        storeUrl: row.storeUrl,
        consumerKey: decryptFiscalSecret(row.consumerKeyEncrypted),
        consumerSecret: decryptFiscalSecret(row.consumerSecretEncrypted),
      },
    }
  }

  async getDecryptedWebhookSecret(tenantId: number): Promise<string | null> {
    const row = await this.prisma.wooCommerceConfig.findUnique({
      where: { tenantId },
      select: { webhookSecretEncrypted: true, activo: true },
    })
    if (!row?.activo || !row.webhookSecretEncrypted) return null
    return decryptFiscalSecret(row.webhookSecretEncrypted)
  }

  async deleteConfig(tenantId: number): Promise<void> {
    await this.prisma.wooCommerceConfig.deleteMany({ where: { tenantId } })
  }

  async isConnectedAndActive(tenantId: number): Promise<boolean> {
    const row = await this.prisma.wooCommerceConfig.findUnique({
      where: { tenantId },
      select: { activo: true },
    })
    return Boolean(row?.activo)
  }
}
