/**
 * @en MercadoPagoConfigService unit tests (#174).
 * @es Tests unitarios MercadoPagoConfigService (#174).
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { encryptFiscalSecret } from '../../../apps/server/fiscal/ar/fiscalSecrets'
import { MercadoPagoApiError } from '../../../apps/server/integrations/mercadopago/mercadoPagoApiClient'
import { MercadoPagoConfigService } from '../../../apps/server/services/MercadoPagoConfigService'

vi.mock('../../../apps/server/integrations/mercadopago/mercadoPagoApiClient', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../apps/server/integrations/mercadopago/mercadoPagoApiClient')>()
  return {
    ...actual,
    fetchMercadoPagoUserMe: vi.fn(),
  }
})

import { fetchMercadoPagoUserMe } from '../../../apps/server/integrations/mercadopago/mercadoPagoApiClient'

function buildPrismaMock(overrides: Partial<Record<string, unknown>> = {}): PrismaClient {
  return {
    mercadoPagoConfig: {
      findUnique: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({ id: 1 }),
      update: vi.fn().mockResolvedValue({ id: 1 }),
    },
    ...overrides,
  } as unknown as PrismaClient
}

describe('MercadoPagoConfigService', () => {
  beforeEach(() => {
    vi.mocked(fetchMercadoPagoUserMe).mockReset()
  })

  it('getStatus returns not configured when row missing', async () => {
    const service = new MercadoPagoConfigService(buildPrismaMock())
    await expect(service.getStatus(1)).resolves.toEqual({ configured: false })
  })

  it('getStatus masks secrets and exposes metadata', async () => {
    const prisma = buildPrismaMock({
      mercadoPagoConfig: {
        findUnique: vi.fn().mockResolvedValue({
          publicKey: 'APP_USR-public',
          sandboxMode: true,
          activo: true,
          accessTokenLast4: '1234',
          webhookSecretEncrypted: encryptFiscalSecret('whsec'),
        }),
      },
    })
    const service = new MercadoPagoConfigService(prisma)
    const status = await service.getStatus(1)
    expect(status).toEqual({
      configured: true,
      publicKey: 'APP_USR-public',
      sandboxMode: true,
      activo: true,
      accessTokenLast4: '1234',
      webhookSecretSet: true,
      collectorId: undefined,
      externalPosId: undefined,
      staticQrConfigured: false,
    })
    expect(status).not.toHaveProperty('accessTokenEncrypted')
  })

  it('upsert requires accessToken on first setup', async () => {
    const service = new MercadoPagoConfigService(buildPrismaMock())
    const result = await service.upsert(1, { publicKey: 'APP_USR-public' })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.status).toBe(400)
    }
  })

  it('testCredentials returns descriptive error for invalid token', async () => {
    vi.mocked(fetchMercadoPagoUserMe).mockRejectedValue(new MercadoPagoApiError(401, 'Invalid Mercado Pago credentials'))
    const prisma = buildPrismaMock({
      mercadoPagoConfig: {
        findUnique: vi.fn().mockResolvedValue({
          accessTokenEncrypted: encryptFiscalSecret('TEST-token-invalid'),
        }),
      },
    })
    const service = new MercadoPagoConfigService(prisma)
    const result = await service.testCredentials(1)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.status).toBe(422)
      expect(result.error).toBe('Invalid Mercado Pago credentials')
    }
  })

  it('testCredentials returns account name on success', async () => {
    vi.mocked(fetchMercadoPagoUserMe).mockResolvedValue({
      nickname: 'demo-shop',
      email: 'demo@example.com',
    })
    const prisma = buildPrismaMock({
      mercadoPagoConfig: {
        findUnique: vi.fn().mockResolvedValue({
          accessTokenEncrypted: encryptFiscalSecret('TEST-token-valid'),
        }),
      },
    })
    const service = new MercadoPagoConfigService(prisma)
    const result = await service.testCredentials(1)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.accountName).toBe('demo-shop')
      expect(result.data.email).toBe('demo@example.com')
    }
  })
})
