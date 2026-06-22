import { describe, expect, it, vi } from 'vitest'
import { dispatchNotification } from '../../apps/server/channels'

describe('channels cheque notifications (#231)', () => {
  it('dispatchNotification cheque_due_soon completes without error', async () => {
    const prisma = {
      appUser: {
        findMany: vi.fn().mockResolvedValue([{ id: 1, email: 'a@b.com', telef: null }]),
      },
      notification: {
        createMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
    }
    await expect(
      dispatchNotification(prisma as never, 1, 'cheque_due_soon', {
        chequeId: 1,
        chequeNumero: '999',
        banco: 'Galicia',
        amount: '1000.00',
        diasHastaVencimiento: 2,
      }),
    ).resolves.toBeUndefined()
  })

  it('dispatchNotification cheque_rechazado completes without error', async () => {
    const prisma = {
      appUser: {
        findMany: vi.fn().mockResolvedValue([{ id: 1, email: 'a@b.com', telef: null }]),
      },
      notification: {
        createMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
    }
    await expect(
      dispatchNotification(prisma as never, 1, 'cheque_rechazado', {
        chequeNumero: '888',
        banco: 'Santander',
        amount: '500.00',
        rsocial: 'Cliente SA',
      }),
    ).resolves.toBeUndefined()
  })
})
