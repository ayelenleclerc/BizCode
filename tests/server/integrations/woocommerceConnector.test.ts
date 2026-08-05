/**
 * @en WooCommerceConnector unit tests (#188).
 * @es Tests unitarios de WooCommerceConnector (#188).
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { WooCommerceConnector } from '../../../apps/server/integrations/ecommerce/WooCommerceConnector'

vi.mock('../../../apps/server/services/WooCommerceConfigService', () => ({
  WooCommerceConfigService: class {
    getDecryptedCredentials = vi.fn().mockResolvedValue({
      ok: true,
      data: {
        storeUrl: 'https://mitienda.com',
        consumerKey: 'ck_123',
        consumerSecret: 'cs_456',
      },
    })
  },
}))

vi.mock('../../../apps/server/integrations/woocommerce/woocommerceApiClient', () => ({
  createWooCommerceProduct: vi.fn().mockResolvedValue({
    id: 99,
    status: 'publish',
    permalink: 'https://mitienda.com/producto/99',
  }),
  updateWooCommerceProduct: vi.fn().mockResolvedValue({ id: 99, status: 'draft' }),
  updateWooCommerceOrder: vi.fn().mockResolvedValue({ id: 1, status: 'completed' }),
}))

import {
  createWooCommerceProduct,
  updateWooCommerceOrder,
  updateWooCommerceProduct,
} from '../../../apps/server/integrations/woocommerce/woocommerceApiClient'

describe('WooCommerceConnector', () => {
  const prisma = {
    wooCommercePublicacion: {
      update: vi.fn().mockResolvedValue({}),
      findFirst: vi.fn().mockResolvedValue({ id: 1, wcProductId: '99' }),
    },
  } as unknown as PrismaClient

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('publishProduct creates a WC product and updates the publicacion', async () => {
    const connector = new WooCommerceConnector(prisma, 1)
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
    expect(createWooCommerceProduct).toHaveBeenCalled()
    expect(prisma.wooCommercePublicacion.update).toHaveBeenCalled()
  })

  it('updateStock sets status to draft when qty is 0', async () => {
    const connector = new WooCommerceConnector(prisma, 1)
    await connector.updateStock('99', 0)
    expect(updateWooCommerceProduct).toHaveBeenCalledWith(
      'https://mitienda.com',
      'ck_123',
      'cs_456',
      '99',
      { manage_stock: true, stock_quantity: 0, status: 'draft' },
    )
  })

  it('markOrderDispatched sets status completed', async () => {
    const connector = new WooCommerceConnector(prisma, 1)
    await connector.markOrderDispatched('4001')
    expect(updateWooCommerceOrder).toHaveBeenCalledWith(
      'https://mitienda.com',
      'ck_123',
      'cs_456',
      '4001',
      { status: 'completed' },
    )
  })

  it('parseIncomingOrder maps WC order payload', () => {
    const connector = new WooCommerceConnector(prisma, 1)
    const order = connector.parseIncomingOrder({
      id: 4001,
      status: 'processing',
      currency: 'ARS',
      total: '150.00',
      billing: { first_name: 'Maria', last_name: 'Silva', email: 'buyer@example.com' },
      line_items: [{ product_id: 99, quantity: 2, price: '75.00', name: 'Item' }],
    })
    expect(order.externalOrderId).toBe('4001')
    expect(order.status).toBe('processing')
    expect(order.buyerNickname).toBe('Maria Silva')
    expect(order.buyerEmail).toBe('buyer@example.com')
    expect(order.lines).toHaveLength(1)
    expect(order.lines[0].quantity).toBe(2)
  })

  it('parseIncomingOrder throws when id is missing', () => {
    const connector = new WooCommerceConnector(prisma, 1)
    expect(() => connector.parseIncomingOrder({})).toThrow('WooCommerce order payload missing id')
  })
})
