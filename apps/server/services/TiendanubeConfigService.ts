import type { PrismaClient } from '@prisma/client'
import { decryptFiscalSecret, encryptFiscalSecret } from '../fiscal/ar/fiscalSecrets'
import type { ServiceResult } from './serviceResults'

export type TiendanubeConfigStatus = {
  connected: boolean
  storeId?: string
  storeName?: string
  storeUrl?: string
  accessTokenLast4?: string
  activo?: boolean
  conectadoAt?: string
}

function last4(value: string): string {
  const trimmed = value.trim()
  return trimmed.length <= 4 ? trimmed : trimmed.slice(-4)
}

export type TiendanubeTokenPersistInput = {
  storeId: string
  accessToken: string
  storeName?: string | null
  storeUrl?: string | null
}

/**
 * @en Tenant Tiendanube OAuth credential storage (#187).
 * @es Almacenamiento de credenciales OAuth Tiendanube por tenant (#187).
 * @pt-BR Armazenamento de credenciais OAuth Tiendanube por tenant (#187).
 */
export class TiendanubeConfigService {
  constructor(private readonly prisma: PrismaClient) {}

  async getStatus(tenantId: number): Promise<TiendanubeConfigStatus> {
    const row = await this.prisma.tiendanubeConfig.findUnique({
      where: { tenantId },
      select: {
        storeId: true,
        storeName: true,
        storeUrl: true,
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
      storeId: row.storeId,
      storeName: row.storeName ?? undefined,
      storeUrl: row.storeUrl ?? undefined,
      accessTokenLast4: row.accessTokenLast4,
      activo: row.activo,
      conectadoAt: row.conectadoAt.toISOString(),
    }
  }

  async upsertTokens(tenantId: number, input: TiendanubeTokenPersistInput): Promise<void> {
    const accessTokenEncrypted = encryptFiscalSecret(input.accessToken)
    const accessTokenLast4 = last4(input.accessToken)
    const storeName = input.storeName?.trim() || null
    const storeUrl = input.storeUrl?.trim() || null

    await this.prisma.tiendanubeConfig.upsert({
      where: { tenantId },
      create: {
        tenantId,
        storeId: input.storeId,
        storeName,
        storeUrl,
        accessTokenEncrypted,
        accessTokenLast4,
        conectadoAt: new Date(),
        activo: true,
      },
      update: {
        storeId: input.storeId,
        storeName,
        storeUrl,
        accessTokenEncrypted,
        accessTokenLast4,
        activo: true,
      },
    })
  }

  async getDecryptedToken(
    tenantId: number,
  ): Promise<ServiceResult<{ accessToken: string; storeId: string }>> {
    const row = await this.prisma.tiendanubeConfig.findUnique({ where: { tenantId } })
    if (!row) {
      return { ok: false, status: 404, error: 'Tiendanube is not connected for this tenant' }
    }
    return {
      ok: true,
      data: {
        accessToken: decryptFiscalSecret(row.accessTokenEncrypted),
        storeId: row.storeId,
      },
    }
  }

  async deleteConfig(tenantId: number): Promise<void> {
    await this.prisma.tiendanubeConfig.deleteMany({ where: { tenantId } })
  }

  async isConnectedAndActive(tenantId: number): Promise<boolean> {
    const row = await this.prisma.tiendanubeConfig.findUnique({
      where: { tenantId },
      select: { activo: true },
    })
    return Boolean(row?.activo)
  }
}
