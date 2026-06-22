import type { PrismaClient } from '@prisma/client'
import { decryptFiscalSecret, encryptFiscalSecret } from '../fiscal/ar/fiscalSecrets'
import {
  fetchMercadoPagoUserMe,
  mercadoPagoAccountDisplayName,
  MercadoPagoApiError,
} from '../integrations/mercadopago/mercadoPagoApiClient'
import type { ServiceResult } from './serviceResults'

export type MercadoPagoConfigInput = {
  accessToken?: string
  publicKey: string
  webhookSecret?: string
  sandboxMode?: boolean
  activo?: boolean
  collectorId?: string
  externalPosId?: string
  staticQrData?: string
}

export type MercadoPagoConfigStatus = {
  configured: boolean
  publicKey?: string
  sandboxMode?: boolean
  activo?: boolean
  accessTokenLast4?: string
  webhookSecretSet?: boolean
  collectorId?: string
  externalPosId?: string
  staticQrConfigured?: boolean
}

export type MercadoPagoTestResult = {
  accountName: string
  email?: string
}

function last4(value: string): string {
  const trimmed = value.trim()
  return trimmed.length <= 4 ? trimmed : trimmed.slice(-4)
}

/**
 * @en Tenant Mercado Pago credentials storage and validation (#174).
 * @es Almacenamiento y validación de credenciales Mercado Pago por tenant (#174).
 * @pt-BR Armazenamento e validação de credenciais Mercado Pago por tenant (#174).
 */
export class MercadoPagoConfigService {
  constructor(private readonly prisma: PrismaClient) {}

  async getStatus(tenantId: number): Promise<MercadoPagoConfigStatus> {
    const row = await this.prisma.mercadoPagoConfig.findUnique({
      where: { tenantId },
      select: {
        publicKey: true,
        sandboxMode: true,
        activo: true,
        accessTokenLast4: true,
        webhookSecretEncrypted: true,
        collectorId: true,
        externalPosId: true,
        staticQrData: true,
      },
    })
    if (!row) {
      return { configured: false }
    }
    return {
      configured: true,
      publicKey: row.publicKey,
      sandboxMode: row.sandboxMode,
      activo: row.activo,
      accessTokenLast4: row.accessTokenLast4,
      webhookSecretSet: Boolean(row.webhookSecretEncrypted),
      collectorId: row.collectorId ?? undefined,
      externalPosId: row.externalPosId ?? undefined,
      staticQrConfigured: Boolean(row.staticQrData?.trim()),
    }
  }

  async upsert(
    tenantId: number,
    input: MercadoPagoConfigInput,
  ): Promise<ServiceResult<{ configured: boolean }>> {
    const existing = await this.prisma.mercadoPagoConfig.findUnique({ where: { tenantId } })
    const accessToken = input.accessToken?.trim()
    if (!existing && !accessToken) {
      return { ok: false, status: 400, error: 'accessToken is required for initial Mercado Pago setup' }
    }

    const publicKey = input.publicKey.trim()
    if (!publicKey) {
      return { ok: false, status: 400, error: 'publicKey is required' }
    }

    const updateData: {
      publicKey: string
      sandboxMode?: boolean
      activo?: boolean
      accessTokenEncrypted?: string
      accessTokenLast4?: string
      webhookSecretEncrypted?: string | null
      collectorId?: string | null
      externalPosId?: string | null
      staticQrData?: string | null
    } = {
      publicKey,
    }

    if (input.sandboxMode !== undefined) {
      updateData.sandboxMode = input.sandboxMode
    }
    if (input.activo !== undefined) {
      updateData.activo = input.activo
    }
    if (accessToken) {
      updateData.accessTokenEncrypted = encryptFiscalSecret(accessToken)
      updateData.accessTokenLast4 = last4(accessToken)
    }
    if (input.webhookSecret !== undefined) {
      const secret = input.webhookSecret.trim()
      updateData.webhookSecretEncrypted = secret ? encryptFiscalSecret(secret) : null
    }
    if (input.collectorId !== undefined) {
      const collectorId = input.collectorId.trim()
      updateData.collectorId = collectorId || null
    }
    if (input.externalPosId !== undefined) {
      const externalPosId = input.externalPosId.trim()
      updateData.externalPosId = externalPosId || null
    }
    if (input.staticQrData !== undefined) {
      const staticQrData = input.staticQrData.trim()
      updateData.staticQrData = staticQrData || null
    }

    if (existing) {
      await this.prisma.mercadoPagoConfig.update({
        where: { tenantId },
        data: updateData,
      })
    } else {
      await this.prisma.mercadoPagoConfig.create({
        data: {
          tenantId,
          accessTokenEncrypted: updateData.accessTokenEncrypted!,
          accessTokenLast4: updateData.accessTokenLast4!,
          publicKey,
          webhookSecretEncrypted: updateData.webhookSecretEncrypted ?? null,
          sandboxMode: input.sandboxMode ?? true,
          activo: input.activo ?? true,
          collectorId: updateData.collectorId ?? null,
          externalPosId: updateData.externalPosId ?? null,
          staticQrData: updateData.staticQrData ?? null,
        },
      })
    }

    return { ok: true, data: { configured: true } }
  }

  async testCredentials(tenantId: number): Promise<ServiceResult<MercadoPagoTestResult>> {
    const row = await this.prisma.mercadoPagoConfig.findUnique({ where: { tenantId } })
    if (!row) {
      return { ok: false, status: 404, error: 'Mercado Pago is not configured for this tenant' }
    }

    try {
      const accessToken = decryptFiscalSecret(row.accessTokenEncrypted)
      const profile = await fetchMercadoPagoUserMe(accessToken)
      return {
        ok: true,
        data: {
          accountName: mercadoPagoAccountDisplayName(profile),
          email: profile.email,
        },
      }
    } catch (err: unknown) {
      if (err instanceof MercadoPagoApiError) {
        return { ok: false, status: 422, error: err.message }
      }
      return { ok: false, status: 500, error: 'Failed to verify Mercado Pago credentials' }
    }
  }

  /** @en Whether tenant has active Mercado Pago config (#174). */
  async isConfiguredAndActive(tenantId: number): Promise<boolean> {
    const row = await this.prisma.mercadoPagoConfig.findUnique({
      where: { tenantId },
      select: { activo: true },
    })
    return Boolean(row?.activo)
  }
}
