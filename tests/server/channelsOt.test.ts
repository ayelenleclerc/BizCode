import { describe, expect, it, vi } from 'vitest'
import { dispatchNotification } from '../../apps/server/channels'

describe('channels OT notifications (#246)', () => {
  it('dispatchNotification ot_presupuestado completes without error', async () => {
    const prisma = {
      appUser: {
        findMany: vi.fn().mockResolvedValue([{ id: 1, email: 'a@b.com', telef: null }]),
      },
      notification: {
        createMany: vi.fn().mockResolvedValue({ count: 1 }),
        create: vi.fn().mockResolvedValue({}),
      },
      cliente: {
        findUnique: vi.fn().mockResolvedValue({ email: 'c@d.com', telef: null }),
      },
    }
    await expect(
      dispatchNotification(prisma as never, 1, 'ot_presupuestado', {
        otId: 8,
        otNumero: 42,
        amount: '25000',
        clienteId: 3,
        rsocial: 'García',
      }),
    ).resolves.toBeUndefined()
  })

  it('dispatchNotification ot_listo completes without error', async () => {
    const prisma = {
      appUser: {
        findMany: vi.fn().mockResolvedValue([{ id: 1 }]),
      },
      notification: {
        createMany: vi.fn().mockResolvedValue({ count: 1 }),
        create: vi.fn().mockResolvedValue({}),
      },
      cliente: {
        findUnique: vi.fn().mockResolvedValue({ email: null, telef: null }),
      },
    }
    await expect(
      dispatchNotification(prisma as never, 1, 'ot_listo', {
        otId: 8,
        otNumero: 7,
        clienteId: 3,
      }),
    ).resolves.toBeUndefined()
  })
})
