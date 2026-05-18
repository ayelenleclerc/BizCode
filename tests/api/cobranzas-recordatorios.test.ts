import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { createApp } from '../../server/createApp'

function buildPrismaMock(overrides: Partial<Record<string, unknown>> = {}): PrismaClient {
  return {
    deliveryZone: { findFirst: vi.fn().mockResolvedValue({ id: 1, tenantId: 1 }) },
    cliente: { findMany: vi.fn(), findFirst: vi.fn(), count: vi.fn() },
    articulo: { findMany: vi.fn() },
    rubro: { findMany: vi.fn() },
    formaPago: { findMany: vi.fn() },
    paramEmpresa: {
      findUnique: vi.fn().mockResolvedValue({ recordatorioDiasGracia: 0 }),
    },
    factura: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
      aggregate: vi.fn(),
    },
    cobroRecordatorio: {
      count: vi.fn().mockResolvedValue(0),
      create: vi.fn().mockResolvedValue({ id: 99 }),
    },
    cobro: {
      count: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      aggregate: vi.fn(),
    },
    notification: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn(),
      create: vi.fn(),
      createMany: vi.fn().mockResolvedValue({ count: 1 }),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    auditEvent: { create: vi.fn().mockResolvedValue({ id: 1 }) },
    appUser: {
      count: vi.fn().mockResolvedValue(1),
      findMany: vi.fn().mockResolvedValue([{ id: 1 }]),
      findFirst: vi.fn(),
    },
    tenant: { findUnique: vi.fn().mockResolvedValue({ id: 1, slug: 'demo', active: true }) },
    appSession: {
      create: vi.fn(),
      findFirst: vi.fn(),
      updateMany: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn(async (arg: unknown) => {
      if (typeof arg === 'function') return arg(buildPrismaMock())
      return arg
    }),
    ...overrides,
  } as unknown as PrismaClient
}

describe('GET /api/cobranzas/vencidas', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'finance'
  })

  it('returns overdue rows', async () => {
    const prisma = buildPrismaMock({
      factura: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 3,
            clienteId: 1,
            total: new Decimal(100),
            fecha: new Date('2026-01-01'),
            cliente: { rsocial: 'Cliente SA', creditDays: 0 },
          },
        ]),
        findFirst: vi.fn(),
        aggregate: vi.fn(),
      },
    })
    const app = createApp(prisma)
    const res = await request(app).get('/api/cobranzas/vencidas').expect(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toHaveLength(1)
    expect(res.body.data[0].facturaId).toBe(3)
  })

  it('returns 403 without permission', async () => {
    process.env.BIZCODE_TEST_ROLE = 'warehouse_op'
    const app = createApp(buildPrismaMock())
    await request(app).get('/api/cobranzas/vencidas').expect(403)
  })
})

describe('POST /api/cobranzas/recordatorios', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'collections'
  })

  it('creates reminder and audits', async () => {
    const auditCreate = vi.fn().mockResolvedValue({ id: 1 })
    const prisma = buildPrismaMock({
      auditEvent: { create: auditCreate },
      factura: {
        findMany: vi.fn(),
        aggregate: vi.fn(),
        findFirst: vi.fn().mockResolvedValue({
          id: 7,
          clienteId: 2,
          fecha: new Date('2026-01-01'),
          cliente: { rsocial: 'ACME', creditDays: 0 },
        }),
      },
    })
    const app = createApp(prisma)
    const res = await request(app)
      .post('/api/cobranzas/recordatorios')
      .send({ facturaId: 7, canal: 'email' })
      .expect(201)
    expect(res.body.data.id).toBe(99)
    expect(auditCreate).toHaveBeenCalled()
  })

  it('returns 409 when already sent today', async () => {
    const prisma = buildPrismaMock({
      cobroRecordatorio: { count: vi.fn().mockResolvedValue(1), create: vi.fn() },
      factura: {
        findMany: vi.fn(),
        aggregate: vi.fn(),
        findFirst: vi.fn().mockResolvedValue({
          id: 7,
          clienteId: 2,
          fecha: new Date('2026-01-01'),
          cliente: { rsocial: 'ACME', creditDays: 0 },
        }),
      },
    })
    const app = createApp(prisma)
    const res = await request(app)
      .post('/api/cobranzas/recordatorios')
      .send({ facturaId: 7 })
      .expect(409)
    expect(res.body.error).toBe('REMINDER_ALREADY_SENT_TODAY')
  })
})
