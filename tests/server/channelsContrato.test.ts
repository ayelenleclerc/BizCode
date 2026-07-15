import { describe, expect, it, vi } from 'vitest'
import { dispatchNotification } from '../../apps/server/channels'

describe('channels contract notifications (#245)', () => {
  it('dispatchNotification contract_invoice_generated completes without error', async () => {
    const prisma = {
      appUser: {
        findMany: vi.fn().mockResolvedValue([{ id: 1, email: 'a@b.com', telef: null }]),
      },
      notification: {
        createMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
    }
    await expect(
      dispatchNotification(prisma as never, 1, 'contract_invoice_generated', {
        contratoId: 8,
        contratoNumero: 12,
        facturaId: 50,
      }),
    ).resolves.toBeUndefined()
  })

  it('dispatchNotification contract_adjustment_due completes without error', async () => {
    const prisma = {
      appUser: {
        findMany: vi.fn().mockResolvedValue([{ id: 1, email: 'a@b.com', telef: null }]),
      },
      notification: {
        createMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
    }
    await expect(
      dispatchNotification(prisma as never, 1, 'contract_adjustment_due', {
        contratoId: 8,
        contratoNumero: 12,
      }),
    ).resolves.toBeUndefined()
  })
})
