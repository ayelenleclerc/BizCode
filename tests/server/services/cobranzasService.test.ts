import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { CobranzasService } from '../../../server/services/CobranzasService'

vi.mock('../../../server/channels', () => ({
  dispatchNotification: vi.fn().mockResolvedValue(undefined),
}))

function buildPrisma(overrides: Partial<Record<string, unknown>> = {}): PrismaClient {
  return {
    paramEmpresa: {
      findUnique: vi.fn().mockResolvedValue({ recordatorioDiasGracia: 0 }),
    },
    factura: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
    },
    cobroRecordatorio: {
      count: vi.fn().mockResolvedValue(0),
      create: vi.fn().mockResolvedValue({ id: 1 }),
    },
    ...overrides,
  } as unknown as PrismaClient
}

describe('CobranzasService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    delete process.env.BIZCODE_COBRANZAS_HORA_INICIO
    delete process.env.BIZCODE_COBRANZAS_HORA_FIN
  })

  it('lists overdue invoices after grace days', async () => {
    const asOf = new Date('2026-05-15')
    const prisma = buildPrisma({
      paramEmpresa: { findUnique: vi.fn().mockResolvedValue({ recordatorioDiasGracia: 2 }) },
      factura: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 10,
            clienteId: 1,
            total: new Decimal(500),
            fecha: new Date('2026-01-01'),
            cliente: { rsocial: 'ACME', creditDays: 30 },
          },
        ]),
      },
    })
    const svc = new CobranzasService(prisma)
    const rows = await svc.listVencidas(1, asOf)
    expect(rows).toHaveLength(1)
    expect(rows[0]?.facturaId).toBe(10)
    expect(rows[0]?.diasMora).toBeGreaterThan(0)
  })

  it('rejects reminder when already sent today', async () => {
    const prisma = buildPrisma({
      cobroRecordatorio: { count: vi.fn().mockResolvedValue(1), create: vi.fn() },
      factura: {
        findFirst: vi.fn().mockResolvedValue({
          id: 5,
          clienteId: 1,
          fecha: new Date('2026-01-01'),
          cliente: { rsocial: 'ACME', creditDays: 0 },
        }),
      },
    })
    const svc = new CobranzasService(prisma)
    const result = await svc.sendReminder(1, 5, 'email')
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.status).toBe(409)
  })

  it('skips daily job outside business window', async () => {
    process.env.BIZCODE_COBRANZAS_HORA_INICIO = '9'
    process.env.BIZCODE_COBRANZAS_HORA_FIN = '18'
    const prisma = buildPrisma()
    const svc = new CobranzasService(prisma)
    const at8 = new Date('2026-05-15T08:00:00')
    expect(svc.isWithinBusinessWindow(at8)).toBe(false)
    const summary = await svc.runDailyJob(1, 'email', at8)
    expect(summary).toEqual({ sent: 0, skipped: 0 })
  })
})
