/**
 * @en MeliConnector unit tests (#189).
 * @es Tests unitarios de MeliConnector (#189).
 * @pt-BR Testes unitários de MeliConnector (#189).
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { createMeliConnector } from '../../../apps/server/integrations/ecommerce/MeliConnector'
import { encryptFiscalSecret } from '../../../apps/server/fiscal/ar/fiscalSecrets'

vi.mock('../../../apps/server/integrations/meli/meliItemsClient', () => ({
  createMeliItem: vi.fn(),
  updateMeliItem: vi.fn(),
}))

import { createMeliItem, updateMeliItem } from '../../../apps/server/integrations/meli/meliItemsClient'

describe('MeliConnector', () => {
  const prisma = {
    meliConfig: {
      findUnique: vi.fn().mockResolvedValue({
        tenantId: 1,
        accessTokenEncrypted: encryptFiscalSecret('tok'),
        refreshTokenEncrypted: encryptFiscalSecret('ref'),
        meliUserId: '1',
      }),
    },
    meliPublicacion: {
      update: vi.fn().mockResolvedValue({}),
      findFirst: vi.fn().mockResolvedValue({ id: 9 }),
    },
  } as unknown as PrismaClient

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('publishProduct creates ML item and updates MeliPublicacion', async () => {
    vi.mocked(createMeliItem).mockResolvedValue({
      id: 'MLA9',
      status: 'active',
      permalink: 'https://meli.example/MLA9',
    })
    const connector = createMeliConnector(prisma, 1)
    const id = await connector.publishProduct({
      articuloId: 10,
      publicacionId: 9,
      title: 'Demo',
      price: 100,
      currencyId: 'ARS',
      availableQuantity: 2,
      active: true,
      categoryId: 'MLA1',
      pictureUrls: ['https://cdn.example/a.jpg'],
    })
    expect(id).toBe('MLA9')
    expect(createMeliItem).toHaveBeenCalled()
    expect(prisma.meliPublicacion.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 9 },
        data: expect.objectContaining({ meliItemId: 'MLA9', syncStatus: 'synced' }),
      }),
    )
  })

  it('updateStock patches quantity and pauses at zero', async () => {
    vi.mocked(updateMeliItem).mockResolvedValue({ id: 'MLA9', status: 'paused', available_quantity: 0 })
    const connector = createMeliConnector(prisma, 1)
    await connector.updateStock('MLA9', 0)
    expect(updateMeliItem).toHaveBeenCalledWith('tok', 'MLA9', {
      available_quantity: 0,
      status: 'paused',
    })
  })

  it('parseIncomingOrder maps MeLi order shape', () => {
    const connector = createMeliConnector(prisma, 1)
    const parsed = connector.parseIncomingOrder({
      id: 55,
      status: 'paid',
      currency_id: 'ARS',
      total_amount: 200,
      buyer: { nickname: 'buyer1' },
      order_items: [{ item: { id: 'MLA1', title: 'X' }, quantity: 2, unit_price: 100 }],
    })
    expect(parsed.externalOrderId).toBe('55')
    expect(parsed.lines).toHaveLength(1)
    expect(parsed.buyerNickname).toBe('buyer1')
  })

  it('markOrderDispatched rejects without inventing shipments API', async () => {
    const connector = createMeliConnector(prisma, 1)
    await expect(connector.markOrderDispatched('55')).rejects.toThrow(/not implemented/i)
  })
})
