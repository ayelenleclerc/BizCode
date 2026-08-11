/**
 * @en WooCommerce catalog listing service tests (#188).
 * @es Tests del servicio de publicaciones WooCommerce (#188).
 * @pt-BR Testes do serviço de anúncios WooCommerce (#188).
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { WooCommerceCatalogService } from '../../../apps/server/services/WooCommerceCatalogService'
import { encryptFiscalSecret } from '../../../apps/server/fiscal/ar/fiscalSecrets'
import { clearEcommerceConnectorRegistry } from '../../../apps/server/integrations/ecommerce/connectorRegistry'
import { resetEcommerceConnectorBootstrap } from '../../../apps/server/integrations/ecommerce/bootstrapEcommerceConnectors'

vi.mock('../../../apps/server/integrations/woocommerce/woocommerceApiClient', async (importOriginal) => {
  const actual =
    await importOriginal<
      typeof import('../../../apps/server/integrations/woocommerce/woocommerceApiClient')
    >()
  return {
    ...actual,
    updateWooCommerceProduct: vi.fn(),
    createWooCommerceProduct: vi.fn(),
  }
})

import { updateWooCommerceProduct } from '../../../apps/server/integrations/woocommerce/woocommerceApiClient'

describe('WooCommerceCatalogService (#188)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    clearEcommerceConnectorRegistry()
    resetEcommerceConnectorBootstrap()
  })

  it('getStatus returns unlinked when no publicacion exists', async () => {
    const prisma = {
      articulo: {
        findFirst: vi.fn().mockResolvedValue({
          id: 10,
          imagenes: [{ id: 1 }],
          wooCommercePublicacion: null,
        }),
      },
    } as unknown as PrismaClient

    const result = await new WooCommerceCatalogService(prisma).getStatus(1, 10)
    expect(result).toEqual({
      ok: true,
      data: { linked: false, hasPhotos: true, photoWarning: false },
    })
  })

  it('getStatus maps a linked publication', async () => {
    const prisma = {
      articulo: {
        findFirst: vi.fn().mockResolvedValue({
          id: 10,
          imagenes: [],
          wooCommercePublicacion: {
            wcProductId: '99',
            estado: 'active',
            syncStatus: 'synced',
            syncError: null,
            permalink: 'https://shop.example.com/p/99',
            ultimaSyncAt: new Date('2026-08-01T00:00:00.000Z'),
          },
        }),
      },
    } as unknown as PrismaClient

    const result = await new WooCommerceCatalogService(prisma).getStatus(1, 10)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.linked).toBe(true)
      expect(result.data.wcProductId).toBe('99')
      expect(result.data.photoWarning).toBe(true)
    }
  })

  it('upsertAndSync rejects parent and service articles', async () => {
    const prisma = {
      articulo: {
        findFirst: vi
          .fn()
          .mockResolvedValueOnce({
            id: 1,
            esPadre: true,
            tipo: 'articulo',
            imagenes: [],
          })
          .mockResolvedValueOnce({
            id: 2,
            esPadre: false,
            tipo: 'servicio',
            imagenes: [],
          }),
      },
    } as unknown as PrismaClient
    const svc = new WooCommerceCatalogService(prisma)
    await expect(svc.upsertAndSync(1, 1)).resolves.toMatchObject({ ok: false, status: 400 })
    await expect(svc.upsertAndSync(1, 2)).resolves.toMatchObject({
      ok: false,
      status: 400,
      error: expect.stringContaining('Service'),
    })
  })

  it('unlink deletes row and best-effort drafts the remote product', async () => {
    vi.mocked(updateWooCommerceProduct).mockResolvedValue({ id: 99, status: 'draft' })
    const deleteFn = vi.fn().mockResolvedValue({})
    const prisma = {
      wooCommercePublicacion: {
        findFirst: vi.fn().mockResolvedValue({
          id: 7,
          articuloId: 10,
          wcProductId: '99',
        }),
        delete: deleteFn,
      },
      wooCommerceConfig: {
        findUnique: vi.fn().mockResolvedValue({
          storeUrl: 'https://shop.example.com',
          consumerKeyEncrypted: encryptFiscalSecret('ck'),
          consumerSecretEncrypted: encryptFiscalSecret('cs'),
          activo: true,
        }),
      },
    } as unknown as PrismaClient

    const result = await new WooCommerceCatalogService(prisma).unlink(1, 10)
    expect(result).toEqual({ ok: true, data: { unlinked: true } })
    expect(updateWooCommerceProduct).toHaveBeenCalledWith(
      'https://shop.example.com',
      'ck',
      'cs',
      '99',
      { status: 'draft' },
    )
    expect(deleteFn).toHaveBeenCalledWith({ where: { id: 7 } })
  })
})
