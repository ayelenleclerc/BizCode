import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { dispatchNotification } from '../../../apps/server/channels'
import { CobranzasService } from '../../../apps/server/services/CobranzasService'
import type { CobranzasReminderSettings } from '../../../apps/server/lib/cobranzasReminderDefaults'

vi.mock('../../../apps/server/channels', () => ({
  dispatchNotification: vi.fn().mockResolvedValue(undefined),
}))

const DEFAULT_SETTINGS: CobranzasReminderSettings = {
  recordatorioDiasGracia: 0,
  timezone: 'America/Argentina/Buenos_Aires',
  recordatorioHoraInicio: 8,
  recordatorioHoraFin: 18,
}

function buildPrisma(overrides: Partial<Record<string, unknown>> = {}): PrismaClient {
  return {
    paramEmpresa: {
      findUnique: vi.fn().mockResolvedValue(DEFAULT_SETTINGS),
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
  })

  it('lists overdue invoices after grace days', async () => {
    const asOf = new Date('2026-05-15')
    const prisma = buildPrisma({
      paramEmpresa: { findUnique: vi.fn().mockResolvedValue({ ...DEFAULT_SETTINGS, recordatorioDiasGracia: 2 }) },
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
          total: new Decimal(100),
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

  it('rejects reminder when invoice is not overdue', async () => {
    const prisma = buildPrisma({
      factura: {
        findFirst: vi.fn().mockResolvedValue({
          id: 5,
          clienteId: 1,
          total: new Decimal(100),
          fecha: new Date(),
          cliente: { rsocial: 'ACME', creditDays: 30 },
        }),
      },
    })
    const svc = new CobranzasService(prisma)
    const result = await svc.sendReminder(1, 5, 'email')
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.status).toBe(422)
      expect(result.error).toBe('FACTURA_NOT_OVERDUE')
    }
  })

  it('sendReminder dispatches enriched notification payload', async () => {
    const prisma = buildPrisma({
      factura: {
        findFirst: vi.fn().mockResolvedValue({
          id: 7,
          clienteId: 2,
          total: new Decimal(1500),
          fecha: new Date('2026-01-01'),
          cliente: { rsocial: 'Beta SA', creditDays: 0 },
        }),
      },
    })
    const svc = new CobranzasService(prisma)
    const result = await svc.sendReminder(1, 7, 'email')
    expect(result.ok).toBe(true)
    expect(dispatchNotification).toHaveBeenCalledWith(
      prisma,
      1,
      'invoice_overdue',
      expect.objectContaining({
        facturaId: 7,
        amount: '1500',
        diasMora: expect.any(Number),
        rsocial: 'Beta SA',
      }),
    )
  })

  it('isWithinBusinessWindow uses tenant local hour', () => {
    const svc = new CobranzasService(buildPrisma())
    const settings: CobranzasReminderSettings = {
      ...DEFAULT_SETTINGS,
      recordatorioHoraInicio: 9,
      recordatorioHoraFin: 18,
    }
    const at8Local = new Date('2026-05-15T11:00:00.000Z')
    const at10Local = new Date('2026-05-15T13:00:00.000Z')
    expect(svc.isWithinBusinessWindow(at8Local, settings)).toBe(false)
    expect(svc.isWithinBusinessWindow(at10Local, settings)).toBe(true)
  })

  it('shouldRunDailyJob is true at 08:00 tenant local with minute tolerance', () => {
    const svc = new CobranzasService(buildPrisma())
    const atSlot = new Date('2026-05-15T11:05:00.000Z')
    const atHour9 = new Date('2026-05-15T12:00:00.000Z')
    expect(svc.shouldRunDailyJob(atSlot, DEFAULT_SETTINGS)).toBe(true)
    expect(svc.shouldRunDailyJob(atHour9, DEFAULT_SETTINGS)).toBe(false)
  })

  it('skips daily job outside business window', async () => {
    const prisma = buildPrisma()
    const svc = new CobranzasService(prisma)
    const at8Local = new Date('2026-05-15T11:00:00.000Z')
    const summary = await svc.runDailyJob(1, 'email', at8Local)
    expect(summary).toEqual({ sent: 0, skipped: 0 })
  })

  it('skips daily job outside 08:00 slot', async () => {
    const prisma = buildPrisma({
      factura: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 10,
            clienteId: 1,
            total: new Decimal(500),
            fecha: new Date('2026-01-01'),
            cliente: { rsocial: 'ACME', creditDays: 0 },
          },
        ]),
        findFirst: vi.fn().mockResolvedValue({
          id: 10,
          clienteId: 1,
          total: new Decimal(500),
          fecha: new Date('2026-01-01'),
          cliente: { rsocial: 'ACME', creditDays: 0 },
        }),
      },
    })
    const svc = new CobranzasService(prisma)
    const at10Local = new Date('2026-05-15T13:00:00.000Z')
    const summary = await svc.runDailyJob(1, 'email', at10Local)
    expect(summary).toEqual({ sent: 0, skipped: 0 })
    expect(dispatchNotification).not.toHaveBeenCalled()
  })

  it('runDailyJob sends reminders in slot and business window', async () => {
    const prisma = buildPrisma({
      factura: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 10,
            clienteId: 1,
            total: new Decimal(500),
            fecha: new Date('2026-01-01'),
            cliente: { rsocial: 'ACME', creditDays: 0 },
          },
        ]),
        findFirst: vi.fn().mockResolvedValue({
          id: 10,
          clienteId: 1,
          total: new Decimal(500),
          fecha: new Date('2026-01-01'),
          cliente: { rsocial: 'ACME', creditDays: 0 },
        }),
      },
    })
    const svc = new CobranzasService(prisma)
    const atSlot = new Date('2026-05-15T11:05:00.000Z')
    const summary = await svc.runDailyJob(1, 'email', atSlot)
    expect(summary.sent).toBe(1)
    expect(summary.skipped).toBe(0)
    expect(dispatchNotification).toHaveBeenCalled()
  })
})
