import type { PrismaClient } from '@prisma/client'
import { decryptFiscalSecret, encryptFiscalSecret } from '../fiscal/ar/fiscalSecrets'
import type { ServiceResult } from './serviceResults'

export type MeliConfigStatus = {
  connected: boolean
  meliUserId?: string
  sellerId?: string
  sitio?: string
  nickname?: string
  tokenExpiresAt?: string
  accessTokenLast4?: string
  activo?: boolean
  conectadoAt?: string
}

function last4(value: string): string {
  const trimmed = value.trim()
  return trimmed.length <= 4 ? trimmed : trimmed.slice(-4)
}

export type MeliTokenPersistInput = {
  meliUserId: string
  sellerId: string
  sitio: string
  nickname?: string | null
  accessToken: string
  refreshToken: string
  expiresInSeconds: number
}

/**
 * @en Tenant Mercado Libre OAuth credential storage (#183).
 * @es Almacenamiento de credenciales OAuth Mercado Libre por tenant (#183).
 * @pt-BR Armazenamento de credenciais OAuth Mercado Livre por tenant (#183).
 */
export class MeliConfigService {
  constructor(private readonly prisma: PrismaClient) {}

  async getStatus(tenantId: number): Promise<MeliConfigStatus> {
    const row = await this.prisma.meliConfig.findUnique({
      where: { tenantId },
      select: {
        meliUserId: true,
        sellerId: true,
        sitio: true,
        nickname: true,
        tokenExpiresAt: true,
        accessTokenLast4: true,
        activo: true,
        conectadoAt: true,
      },
    })
    if (!row) {
      return { connected: false }
    }
    return {
      connected: true,
      meliUserId: row.meliUserId,
      sellerId: row.sellerId,
      sitio: row.sitio,
      nickname: row.nickname ?? undefined,
      tokenExpiresAt: row.tokenExpiresAt.toISOString(),
      accessTokenLast4: row.accessTokenLast4,
      activo: row.activo,
      conectadoAt: row.conectadoAt.toISOString(),
    }
  }

  async upsertTokens(tenantId: number, input: MeliTokenPersistInput): Promise<void> {
    const tokenExpiresAt = new Date(Date.now() + Math.max(1, input.expiresInSeconds) * 1000)
    const accessTokenEncrypted = encryptFiscalSecret(input.accessToken)
    const refreshTokenEncrypted = encryptFiscalSecret(input.refreshToken)
    const accessTokenLast4 = last4(input.accessToken)
    const nickname = input.nickname?.trim() || null

    await this.prisma.meliConfig.upsert({
      where: { tenantId },
      create: {
        tenantId,
        meliUserId: input.meliUserId,
        sellerId: input.sellerId,
        sitio: input.sitio,
        nickname,
        accessTokenEncrypted,
        refreshTokenEncrypted,
        accessTokenLast4,
        tokenExpiresAt,
        conectadoAt: new Date(),
        activo: true,
      },
      update: {
        meliUserId: input.meliUserId,
        sellerId: input.sellerId,
        sitio: input.sitio,
        nickname,
        accessTokenEncrypted,
        refreshTokenEncrypted,
        accessTokenLast4,
        tokenExpiresAt,
        activo: true,
      },
    })
  }

  async getDecryptedTokens(
    tenantId: number,
  ): Promise<ServiceResult<{ accessToken: string; refreshToken: string; meliUserId: string }>> {
    const row = await this.prisma.meliConfig.findUnique({ where: { tenantId } })
    if (!row) {
      return { ok: false, status: 404, error: 'Mercado Libre is not connected for this tenant' }
    }
    return {
      ok: true,
      data: {
        accessToken: decryptFiscalSecret(row.accessTokenEncrypted),
        refreshToken: decryptFiscalSecret(row.refreshTokenEncrypted),
        meliUserId: row.meliUserId,
      },
    }
  }

  async deleteConfig(tenantId: number): Promise<void> {
    await this.prisma.meliConfig.deleteMany({ where: { tenantId } })
  }

  /** @en Whether tenant has an active Mercado Libre connection (#183). */
  async isConnectedAndActive(tenantId: number): Promise<boolean> {
    const row = await this.prisma.meliConfig.findUnique({
      where: { tenantId },
      select: { activo: true },
    })
    return Boolean(row?.activo)
  }
}
