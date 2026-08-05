/**
 * @en Unit tests for WooCommerceConfigService (#188).
 * @es Tests unitarios de WooCommerceConfigService (#188).
 * @pt-BR Testes unitários de WooCommerceConfigService (#188).
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { encryptFiscalSecret } from '../../../apps/server/fiscal/ar/fiscalSecrets'

vi.mock('../../../apps/server/integrations/woocommerce/woocommerceApiClient', async (importOriginal) => {
  const actual =
    await importOriginal<
      typeof import('../../../apps/server/integrations/woocommerce/woocommerceApiClient')
    >()
  return {
    ...actual,
    verifyWooCommerceConnection: vi.fn(),
  }
})

import { verifyWooCommerceConnection } from '../../../apps/server/integrations/woocommerce/woocommerceApiClient'
import { WooCommerceConfigService } from '../../../apps/server/services/WooCommerceConfigService'

describe('WooCommerceConfigService', () => {
  beforeEach(() => {
    vi.mocked(verifyWooCommerceConnection).mockReset()
  })

  it('getStatus never exposes encrypted credentials', async () => {
    const prisma = {
      wooCommerceConfig: {
        findUnique: vi.fn().mockResolvedValue({
          storeUrl: 'https://mitienda.com',
          storeName: 'Demo',
          consumerKeyLast4: 'abcd',
          webhookSecretEncrypted: encryptFiscalSecret('whsec'),
          activo: true,
          conectadoAt: new Date('2026-08-01T10:00:00.000Z'),
        }),
      },
    } as unknown as PrismaClient

    const status = await new WooCommerceConfigService(prisma).getStatus(1, 'https://api/webhook/1')
    expect(status.connected).toBe(true)
    expect(status.hasWebhookSecret).toBe(true)
    expect(status).not.toHaveProperty('consumerKeyEncrypted')
    expect(status).not.toHaveProperty('consumerSecretEncrypted')
    expect(JSON.stringify(status)).not.toMatch(/encrypt/i)
  })

  it('returns disconnected when config is missing', async () => {
    const prisma = {
      wooCommerceConfig: { findUnique: vi.fn().mockResolvedValue(null) },
    } as unknown as PrismaClient
    await expect(new WooCommerceConfigService(prisma).getStatus(1)).resolves.toEqual({
      connected: false,
      webhookUrl: undefined,
    })
  })

  it('verifyAndSave rejects when required fields are missing', async () => {
    const prisma = {} as PrismaClient
    const result = await new WooCommerceConfigService(prisma).verifyAndSave(1, {
      storeUrl: '',
      consumerKey: '',
      consumerSecret: '',
    })
    expect(result).toEqual({
      ok: false,
      status: 400,
      error: 'storeUrl, consumerKey and consumerSecret are required',
    })
    expect(verifyWooCommerceConnection).not.toHaveBeenCalled()
  })

  it('verifyAndSave rejects private or non-https storeUrl before calling WooCommerce', async () => {
    const upsert = vi.fn()
    const prisma = {
      wooCommerceConfig: { upsert },
    } as unknown as PrismaClient
    const result = await new WooCommerceConfigService(prisma).verifyAndSave(1, {
      storeUrl: 'https://127.0.0.1',
      consumerKey: 'ck',
      consumerSecret: 'cs',
    })
    expect(result).toEqual({
      ok: false,
      status: 400,
      error: 'storeUrl host is not allowed',
    })
    expect(verifyWooCommerceConnection).not.toHaveBeenCalled()
    expect(upsert).not.toHaveBeenCalled()
  })

  it('verifyAndSave surfaces connection failures without persisting', async () => {
    vi.mocked(verifyWooCommerceConnection).mockRejectedValue(
      Object.assign(new Error('Invalid WooCommerce consumer key/secret'), { status: 401 }),
    )
    const upsert = vi.fn()
    const prisma = {
      wooCommerceConfig: { upsert },
    } as unknown as PrismaClient

    const result = await new WooCommerceConfigService(prisma).verifyAndSave(1, {
      storeUrl: 'https://mitienda.com',
      consumerKey: 'ck_bad',
      consumerSecret: 'cs_bad',
    })
    expect(result).toEqual({
      ok: false,
      status: 401,
      error: 'Invalid WooCommerce consumer key/secret',
    })
    expect(upsert).not.toHaveBeenCalled()
  })

  it('verifyAndSave persists credentials once verified', async () => {
    vi.mocked(verifyWooCommerceConnection).mockResolvedValue(undefined)
    const upsert = vi.fn().mockResolvedValue({})
    const findUnique = vi.fn().mockResolvedValue({
      storeUrl: 'https://mitienda.com',
      storeName: null,
      consumerKeyLast4: '_123',
      webhookSecretEncrypted: null,
      activo: true,
      conectadoAt: new Date('2026-08-01T10:00:00.000Z'),
    })
    const prisma = {
      wooCommerceConfig: { upsert, findUnique },
    } as unknown as PrismaClient

    const result = await new WooCommerceConfigService(prisma).verifyAndSave(1, {
      storeUrl: 'https://mitienda.com/',
      consumerKey: 'ck_123',
      consumerSecret: 'cs_123',
    })
    expect(result.ok).toBe(true)
    expect(upsert).toHaveBeenCalledOnce()
    expect(upsert.mock.calls[0][0].create.storeUrl).toBe('https://mitienda.com')
    expect(upsert.mock.calls[0][0].create.consumerKeyLast4).toBe('_123')
  })

  it('getDecryptedCredentials returns 404 when not connected', async () => {
    const prisma = {
      wooCommerceConfig: { findUnique: vi.fn().mockResolvedValue(null) },
    } as unknown as PrismaClient
    await expect(new WooCommerceConfigService(prisma).getDecryptedCredentials(1)).resolves.toEqual(
      { ok: false, status: 404, error: 'WooCommerce is not connected for this tenant' },
    )
  })

  it('getDecryptedCredentials decrypts stored consumer key/secret', async () => {
    const prisma = {
      wooCommerceConfig: {
        findUnique: vi.fn().mockResolvedValue({
          storeUrl: 'https://mitienda.com',
          consumerKeyEncrypted: encryptFiscalSecret('ck_123'),
          consumerSecretEncrypted: encryptFiscalSecret('cs_123'),
        }),
      },
    } as unknown as PrismaClient
    await expect(new WooCommerceConfigService(prisma).getDecryptedCredentials(1)).resolves.toEqual(
      {
        ok: true,
        data: { storeUrl: 'https://mitienda.com', consumerKey: 'ck_123', consumerSecret: 'cs_123' },
      },
    )
  })

  it('getDecryptedWebhookSecret returns null when inactive or missing', async () => {
    const inactive = {
      wooCommerceConfig: {
        findUnique: vi.fn().mockResolvedValue({ activo: false, webhookSecretEncrypted: 'x' }),
      },
    } as unknown as PrismaClient
    await expect(
      new WooCommerceConfigService(inactive).getDecryptedWebhookSecret(1),
    ).resolves.toBeNull()

    const missing = {
      wooCommerceConfig: { findUnique: vi.fn().mockResolvedValue(null) },
    } as unknown as PrismaClient
    await expect(
      new WooCommerceConfigService(missing).getDecryptedWebhookSecret(1),
    ).resolves.toBeNull()
  })

  it('getDecryptedWebhookSecret decrypts when active and set', async () => {
    const prisma = {
      wooCommerceConfig: {
        findUnique: vi.fn().mockResolvedValue({
          activo: true,
          webhookSecretEncrypted: encryptFiscalSecret('whsec'),
        }),
      },
    } as unknown as PrismaClient
    await expect(
      new WooCommerceConfigService(prisma).getDecryptedWebhookSecret(1),
    ).resolves.toBe('whsec')
  })

  it('deleteConfig removes the tenant row and isConnectedAndActive reflects state', async () => {
    const deleteMany = vi.fn().mockResolvedValue({ count: 1 })
    const findUnique = vi.fn().mockResolvedValue({ activo: true })
    const prisma = {
      wooCommerceConfig: { deleteMany, findUnique },
    } as unknown as PrismaClient
    const svc = new WooCommerceConfigService(prisma)
    await svc.deleteConfig(1)
    expect(deleteMany).toHaveBeenCalledWith({ where: { tenantId: 1 } })
    await expect(svc.isConnectedAndActive(1)).resolves.toBe(true)
  })
})
