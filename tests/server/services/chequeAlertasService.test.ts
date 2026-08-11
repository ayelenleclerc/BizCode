import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Decimal } from '@prisma/client/runtime/library'
import { ChequeAlertasService } from '../../../apps/server/services/ChequeAlertasService'

describe('ChequeAlertasService (#231)', () => {
  let prisma: {
    cheque: { findMany: ReturnType<typeof vi.fn> }
    notification: { findMany: ReturnType<typeof vi.fn>; createMany: ReturnType<typeof vi.fn> }
    appUser: { findMany: ReturnType<typeof vi.fn> }
  }

  beforeEach(() => {
    prisma = {
      cheque: { findMany: vi.fn() },
      notification: { findMany: vi.fn(), createMany: vi.fn().mockResolvedValue({ count: 1 }) },
      appUser: { findMany: vi.fn().mockResolvedValue([{ id: 1 }]) },
    }
    prisma.cheque.findMany.mockResolvedValue([
      {
        id: 5,
        numero: '555',
        banco: 'Galicia',
        monto: new Decimal(1200),
        fechaVencimiento: new Date(Date.now() + 2 * 86400000),
        clienteId: 1,
        cliente: { id: 1, rsocial: 'Cliente SA' },
      },
    ])
    prisma.notification.findMany.mockResolvedValue([])
  })

  it('lists cheques due within 3 days', async () => {
    const service = new ChequeAlertasService(prisma as never)
    const rows = await service.listPorVencer(1)
    expect(rows).toHaveLength(1)
    expect(rows[0].numero).toBe('555')
    expect(rows[0].diasHastaVencimiento).toBeGreaterThanOrEqual(0)
  })

  it('runDailyJob sends notifications once', async () => {
    const service = new ChequeAlertasService(prisma as never)
    const first = await service.runDailyJob(1)
    expect(first.sent).toBe(1)
    prisma.notification.findMany.mockResolvedValue([{ payload: { chequeId: 5 } }])
    const second = await service.runDailyJob(1)
    expect(second.skipped).toBe(1)
  })
})
