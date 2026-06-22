/**
 * @en Tests for PUT /api/facturas/:id/void — invoice voiding with motivo, tenant scoping, and balance reversal.
 * @es Tests para PUT /api/facturas/:id/void — anulación de factura con motivo, scoping de tenant y reversión de balance.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { createApp } from '../../apps/server/createApp'
import { createMovimientoClienteCCPrismaMock, extendClientePrismaForCc } from '../helpers/movimientoClienteCcPrismaMock'
import { Decimal } from '@prisma/client/runtime/library'

// ─── Fixture ──────────────────────────────────────────────────────────────────

const FACTURA_ACTIVA = {
  id: 1,
  estado: 'A',
  total: new Decimal(10000),
  clienteId: 1,
  estadoCae: 'pending',
  tipo: 'B',
  prefijo: '0001',
  numero: 1,
}

const NOTA_CREDITO = {
  id: 10,
  tenantId: 1,
  facturaOrigenId: 1,
  motivo: 'Error en el precio',
  monto: new Decimal(10000),
  estadoCae: 'not_required',
  createdById: null,
  createdAt: new Date(),
}

const FACTURA_ANULADA = {
  id: 2,
  estado: 'N',
  total: 5000,
  clienteId: 1,
}

function buildPrismaMock(overrides: Partial<Record<string, unknown>> = {}): PrismaClient {
  const base = {
    deliveryZone: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue(null),
      update: vi.fn().mockResolvedValue(null),
    },
    cliente: extendClientePrismaForCc({
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue({ id: 1, suspended: false }),
      findUnique: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue(null),
      update: vi.fn().mockResolvedValue({ id: 1, rsocial: 'Cliente', balance: 0, creditLimit: null }),
    }),
    movimientoClienteCC: createMovimientoClienteCCPrismaMock(),
    articulo: { findMany: vi.fn().mockResolvedValue([]) },
    rubro: { findMany: vi.fn().mockResolvedValue([]) },
    formaPago: { findMany: vi.fn().mockResolvedValue([]) },
    factura: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(FACTURA_ACTIVA),
      create: vi.fn().mockResolvedValue(null),
      update: vi.fn().mockResolvedValue({ ...FACTURA_ACTIVA, estado: 'N' }),
      aggregate: vi.fn().mockResolvedValue({ _count: { id: 0 }, _sum: { total: null } }),
    },
    notification: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({ id: 1 }),
      createMany: vi.fn().mockResolvedValue({ count: 0 }),
      update: vi.fn().mockResolvedValue(null),
      updateMany: vi.fn().mockResolvedValue({ count: 0 }),
    },
    notaCredito: {
      create: vi.fn().mockResolvedValue(NOTA_CREDITO),
      aggregate: vi.fn().mockResolvedValue({ _sum: { monto: null } }),
    },
    retencionAplicada: {
      deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
    },
    auditEvent: { create: vi.fn().mockResolvedValue({ id: 1 }) },
    appUser: {
      count: vi.fn().mockResolvedValue(1),
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
      findUnique: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue(null),
      update: vi.fn().mockResolvedValue(null),
    },
    tenant: {
      findUnique: vi.fn().mockResolvedValue({ id: 1, slug: 'demo', active: true }),
    },
    appSession: {
      create: vi.fn().mockResolvedValue({ id: 1 }),
      findFirst: vi.fn().mockResolvedValue(null),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      update: vi.fn().mockResolvedValue({ id: 1 }),
    },
        ...overrides,
  }
  const prisma = { ...base, ...overrides } as unknown as PrismaClient
  prisma.$transaction = vi.fn(async (fn: unknown) => {
    if (typeof fn === 'function') return fn(prisma)
    return fn
  }) as PrismaClient['$transaction']
  return prisma
}

// ─── PUT /api/facturas/:id/void ───────────────────────────────────────────────

describe('PUT /api/facturas/:id/void', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'manager'
  })

  it('voids an active invoice and returns 200 with estado=N', async () => {
    const voided = { ...FACTURA_ACTIVA, estado: 'N' }
    const prisma = buildPrismaMock({
      factura: {
        findMany: vi.fn().mockResolvedValue([]),
        findFirst: vi.fn().mockResolvedValue(FACTURA_ACTIVA),
        create: vi.fn().mockResolvedValue(null),
        update: vi.fn().mockResolvedValue(voided),
        aggregate: vi.fn().mockResolvedValue({ _count: { id: 0 }, _sum: { total: null } }),
      },
    })
    const app = createApp(prisma)

    const res = await request(app)
      .put('/api/facturas/1/void')
      .send({ motivo: 'Error en el precio' })
      .expect(200)

    expect(res.body.success).toBe(true)
    expect(res.body.data.factura.estado).toBe('N')
    expect(res.body.data.notaCredito.id).toBe(10)
    expect(res.body.data.notaCredito.estadoCae).toBe('not_required')
  })

  it('returns 400 when motivo is missing', async () => {
    const prisma = buildPrismaMock()
    const app = createApp(prisma)

    const res = await request(app)
      .put('/api/facturas/1/void')
      .send({})
      .expect(400)

    expect(res.body.success).toBe(false)
    expect(res.body.error).toMatch(/motivo/)
  })

  it('returns 400 when motivo is empty string', async () => {
    const prisma = buildPrismaMock()
    const app = createApp(prisma)

    const res = await request(app)
      .put('/api/facturas/1/void')
      .send({ motivo: '   ' })
      .expect(400)

    expect(res.body.success).toBe(false)
  })

  it('returns 400 when motivo is not a string', async () => {
    const prisma = buildPrismaMock()
    const app = createApp(prisma)

    const res = await request(app)
      .put('/api/facturas/1/void')
      .send({ motivo: 123 })
      .expect(400)

    expect(res.body.success).toBe(false)
    expect(String(res.body.error)).toMatch(/motivo/)
  })

  it('returns 400 when motivo is shorter than 10 characters', async () => {
    const prisma = buildPrismaMock()
    const app = createApp(prisma)

    const res = await request(app)
      .put('/api/facturas/1/void')
      .send({ motivo: 'corto' })
      .expect(400)

    expect(res.body.success).toBe(false)
    expect(String(res.body.error)).toMatch(/at least 10/)
  })

  it('returns 400 when motivo exceeds max length', async () => {
    const prisma = buildPrismaMock()
    const app = createApp(prisma)

    const res = await request(app)
      .put('/api/facturas/1/void')
      .send({ motivo: 'x'.repeat(501) })
      .expect(400)

    expect(res.body.success).toBe(false)
    expect(String(res.body.error)).toMatch(/at most 500/)
  })

  it('returns 404 when factura does not belong to tenant', async () => {
    const prisma = buildPrismaMock({
      factura: {
        findMany: vi.fn().mockResolvedValue([]),
        findFirst: vi.fn().mockResolvedValue(null), // not found for this tenant
        create: vi.fn().mockResolvedValue(null),
        update: vi.fn().mockResolvedValue(null),
        aggregate: vi.fn().mockResolvedValue({ _count: { id: 0 }, _sum: { total: null } }),
      },
    })
    const app = createApp(prisma)

    const res = await request(app)
      .put('/api/facturas/999/void')
      .send({ motivo: 'Motivo test' })
      .expect(404)

    expect(res.body.success).toBe(false)
  })

  it('returns 409 when factura is already voided', async () => {
    const prisma = buildPrismaMock({
      factura: {
        findMany: vi.fn().mockResolvedValue([]),
        findFirst: vi.fn().mockResolvedValue(FACTURA_ANULADA),
        create: vi.fn().mockResolvedValue(null),
        update: vi.fn().mockResolvedValue(null),
        aggregate: vi.fn().mockResolvedValue({ _count: { id: 0 }, _sum: { total: null } }),
      },
    })
    const app = createApp(prisma)

    const res = await request(app)
      .put('/api/facturas/2/void')
      .send({ motivo: 'Motivo test' })
      .expect(409)

    expect(res.body.success).toBe(false)
    expect(res.body.error).toMatch(/already voided/i)
  })

  it('returns 403 for seller role (missing sales.cancel)', async () => {
    process.env.BIZCODE_TEST_ROLE = 'seller'
    const prisma = buildPrismaMock()
    const app = createApp(prisma)

    await request(app)
      .put('/api/facturas/1/void')
      .send({ motivo: 'Motivo test' })
      .expect(403)
  })

  it('billing role can void (has sales.cancel)', async () => {
    process.env.BIZCODE_TEST_ROLE = 'billing'
    const prisma = buildPrismaMock()
    const app = createApp(prisma)

    const res = await request(app)
      .put('/api/facturas/1/void')
      .send({ motivo: 'Devuelto total' })
      .expect(200)

    expect(res.body.success).toBe(true)
  })

  it('returns 500 when prisma throws', async () => {
    const prisma = buildPrismaMock({
      factura: {
        findMany: vi.fn().mockResolvedValue([]),
        findFirst: vi.fn().mockRejectedValue(new Error('DB error')),
        create: vi.fn().mockResolvedValue(null),
        update: vi.fn().mockResolvedValue(null),
        aggregate: vi.fn().mockResolvedValue({ _count: { id: 0 }, _sum: { total: null } }),
      },
    })
    const app = createApp(prisma)

    const res = await request(app)
      .put('/api/facturas/1/void')
      .send({ motivo: 'Motivo test' })
      .expect(500)

    expect(res.body.success).toBe(false)
  })
})
