import type { PrismaClient } from '@prisma/client'
import { decryptFiscalSecret, encryptFiscalSecret } from '../fiscal/ar/fiscalSecrets'
import type { ServiceResult } from '../services/serviceResults'
import type { ShippingCarrierCredentials } from '../logistics/shipping/types'

export type ShippingApiCarrier = 'andreani' | 'correo_argentino'

export type ShippingCarrierConfigPublic = {
  carrier: ShippingApiCarrier
  usernameLast4: string
  sandboxMode: boolean
  activo: boolean
  updatedAt: string
}

function last4(value: string): string {
  const trimmed = value.trim()
  if (trimmed.length <= 4) return trimmed.padStart(4, '*')
  return trimmed.slice(-4)
}

/**
 * @en CRUD for encrypted courier credentials per tenant (#193).
 * @es CRUD de credenciales cifradas de transportistas por tenant (#193).
 * @pt-BR CRUD de credenciais cifradas de transportadoras por tenant (#193).
 */
export class ShippingCarrierConfigService {
  constructor(private readonly prisma: PrismaClient) {}

  async getPublic(
    tenantId: number,
    carrier: ShippingApiCarrier,
  ): Promise<ShippingCarrierConfigPublic | null> {
    const row = await this.prisma.shippingCarrierConfig.findUnique({
      where: { tenantId_carrier: { tenantId, carrier } },
    })
    if (!row) return null
    return {
      carrier: row.carrier as ShippingApiCarrier,
      usernameLast4: row.usernameLast4,
      sandboxMode: row.sandboxMode,
      activo: row.activo,
      updatedAt: row.updatedAt.toISOString(),
    }
  }

  async upsert(
    tenantId: number,
    carrier: ShippingApiCarrier,
    input: {
      username: string
      password: string
      sandboxMode?: boolean
      activo?: boolean
    },
  ): Promise<ServiceResult<ShippingCarrierConfigPublic>> {
    const username = input.username.trim()
    if (!username || !input.password) {
      return { ok: false, status: 400, error: 'username and password are required' }
    }
    const data = {
      usernameEncrypted: encryptFiscalSecret(username),
      passwordEncrypted: encryptFiscalSecret(input.password),
      usernameLast4: last4(username),
      sandboxMode: input.sandboxMode ?? true,
      activo: input.activo ?? true,
    }
    const row = await this.prisma.shippingCarrierConfig.upsert({
      where: { tenantId_carrier: { tenantId, carrier } },
      create: { tenantId, carrier, ...data },
      update: data,
    })
    return {
      ok: true,
      data: {
        carrier: row.carrier as ShippingApiCarrier,
        usernameLast4: row.usernameLast4,
        sandboxMode: row.sandboxMode,
        activo: row.activo,
        updatedAt: row.updatedAt.toISOString(),
      },
    }
  }

  async getActiveCredentials(
    tenantId: number,
    carrier: ShippingApiCarrier,
  ): Promise<ShippingCarrierCredentials | null> {
    const row = await this.prisma.shippingCarrierConfig.findUnique({
      where: { tenantId_carrier: { tenantId, carrier } },
    })
    if (!row || !row.activo) return null
    return {
      username: decryptFiscalSecret(row.usernameEncrypted),
      password: decryptFiscalSecret(row.passwordEncrypted),
      sandboxMode: row.sandboxMode,
    }
  }
}
