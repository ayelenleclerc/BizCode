/**
 * @en TiendanubeConnector unit tests (#187).
 * @es Tests unitarios de TiendanubeConnector (#187).
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { TiendanubeConnector } from '../../../apps/server/integrations/ecommerce/TiendanubeConnector'

vi.mock('../../../apps/server/services/TiendanubeConfigService', () => ({
  TiendanubeConfigService: class {
    getDecryptedToken = vi.fn().mockResolvedValue({
      ok: true,
      data: { accessToken: 'token', storeId: '817495' },
    })
  },
}))

vi.mock('../../../apps/server/integrations/tiendanube/tiendanubeApiClient', () => ({
  createTiendanubeProduct: vi.fn().mockResolvedValue({
    id: 99,
    published: true,
    canonical_url: 'https://demo.mitiendanube.com/products/x',
    variants: [{ id: 11, stock: 5 }],
  }),
  updateTiendanubeProduct: vi.fn().mockResolvedValue({ id: 99, published: false }),
  updateTiendanubeVariant: vi.fn().mockResolvedValue({ id: 11, stock: 0 }),
  updateTiendanubeOrder: vi.fn().mockResolvedValue({ id: 1, shipping_status: 'shipped' }),
}))

import {
  createTiendanubeProduct,
  updateTiendanubeOrder,
  updateTiendanubeProduct,
  updateTiendanubeVariant,
} from '../../../apps/server/integrations/tiendanube/tiendanubeApiClient'

describe('TiendanubeConnector', () => {
  const prisma = {
    tiendanubePublicacion: {
      update: vi.fn().mockResolvedValue({}),
      findFirst: vi.fn().mockResolvedValue({ id: 1, tnVariantId: '11', tnProductId: '99' }),
    },
  } as unknown as PrismaClient

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('publishProduct creates TN product and updates publicacion', async () => {
    const connector = new TiendanubeConnector(prisma, 1)
    const id = await connector.publishProduct({
      articuloId: 5,
      publicacionId: 1,
      title: 'Test',
      price: 100,
      currencyId: 'ARS',
      availableQuantity: 5,
      active: true,
      pictureUrls: ['https://example.com/a.jpg'],
    })
    expect(id).toBe('99')
    expect(createTiendanubeProduct).toHaveBeenCalled()
    expect(prisma.tiendanubePublicacion.update).toHaveBeenCalled()
  })

  it('updateStock pauses when qty is 0', async () => {
    const connector = new TiendanubeConnector(prisma, 1)
    await connector.updateStock('99', 0)
    expect(updateTiendanubeVariant).toHaveBeenCalledWith(
      '817495',
      'token',
      '99',
      '11',
      { stock: 0 },
    )
    expect(updateTiendanubeProduct).toHaveBeenCalledWith('817495', 'token', '99', {
      published: false,
    })
  })

  it('markOrderDispatched sets shipping_status shipped', async () => {
    const connector = new TiendanubeConnector(prisma, 1)
    await connector.markOrderDispatched('871254203')
    expect(updateTiendanubeOrder).toHaveBeenCalledWith('817495', 'token', '871254203', {
      shipping_status: 'shipped',
    })
  })

  it('parseIncomingOrder maps TN products', () => {
    const connector = new TiendanubeConnector(prisma, 1)
    const order = connector.parseIncomingOrder({
      id: 1,
      payment_status: 'paid',
      contact_name: 'Ana',
      products: [{ product_id: 99, quantity: 2, price: '10.00', name: 'Item' }],
    })
    expect(order.externalOrderId).toBe('1')
    expect(order.lines).toHaveLength(1)
    expect(order.lines[0].quantity).toBe(2)
  })
})
