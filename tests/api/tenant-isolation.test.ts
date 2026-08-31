/**
 * Verifies tenant-scoped API handlers do not leak another tenant when IDs are enumerated (#75).
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { createApp } from '../../apps/server/createApp'

function buildBasePrisma(overrides: Partial<Record<string, unknown>> = {}): PrismaClient {
  return {
    tenantConfig: { findUnique: vi.fn().mockResolvedValue(null) },
    cliente: {
      findFirst: vi.fn().mockResolvedValue(null),
      findMany: vi.fn().mockResolvedValue([]),
      count: vi.fn().mockResolvedValue(0),
      create: vi.fn(),
      update: vi.fn(),
    },
    articulo: {
      findFirst: vi.fn().mockResolvedValue(null),
      findMany: vi.fn().mockResolvedValue([]),
      count: vi.fn().mockResolvedValue(0),
      create: vi.fn(),
      update: vi.fn(),
    },
    rubro: { findMany: vi.fn().mockResolvedValue([]), findFirst: vi.fn() },
    deliveryZone: { findFirst: vi.fn().mockResolvedValue(null), findMany: vi.fn().mockResolvedValue([]) },
    formaPago: { findMany: vi.fn().mockResolvedValue([]) },
    factura: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn(),
      update: vi.fn(),
      aggregate: vi.fn().mockResolvedValue({ _count: { id: 0 }, _sum: { total: null } }),
    },
    auditEvent: { create: vi.fn().mockResolvedValue({ id: 1 }) },
    notification: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({ id: 1 }),
      createMany: vi.fn().mockResolvedValue({ count: 0 }),
      update: vi.fn(),
      updateMany: vi.fn().mockResolvedValue({ count: 0 }),
    },
    appUser: {
      count: vi.fn().mockResolvedValue(0),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    tenant: { findUnique: vi.fn().mockResolvedValue({ id: 1, slug: 'demo', active: true }) },
    appSession: {
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn(),
      updateMany: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn(async (fn: unknown) => {
      if (typeof fn === 'function') {
        return fn(buildBasePrisma())
      }
      return fn
    }),
    ...overrides,
  } as unknown as PrismaClient
}

describe('tenant isolation — REST handlers', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
    if (!process.env.DATABASE_URL?.trim()) {
      process.env.DATABASE_URL = 'postgresql://x@localhost:5432/y'
    }
  })

  it('GET /api/clientes/:id returns 404 via verifyOwnership when row is outside tenant', async () => {
    const prisma = buildBasePrisma()
    const app = createApp(prisma)
    const res = await request(app).get('/api/clientes/99999').expect(404)

    expect(res.body.success).toBe(false)
    expect(res.body.error).toBe('Not found')
    expect(prisma.cliente.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ id: 99999, tenantId: 1 }) }),
    )
  })

  it('GET /api/articulos/:id returns 404 via verifyOwnership when row is outside tenant', async () => {
    const prisma = buildBasePrisma()
    const app = createApp(prisma)
    const res = await request(app).get('/api/articulos/42').expect(404)

    expect(res.body.success).toBe(false)
    expect(res.body.error).toBe('Not found')
    expect(prisma.articulo.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ id: 42, tenantId: 1 }) }),
    )
  })

  it('GET /api/clientes/:id scopes getById after ownership when row exists', async () => {
    const prisma = buildBasePrisma({
      cliente: {
        findFirst: vi
          .fn()
          .mockResolvedValueOnce({ id: 5 })
          .mockResolvedValueOnce({ id: 5, rsocial: 'Acme', tenantId: 1 }),
        findMany: vi.fn().mockResolvedValue([]),
        count: vi.fn().mockResolvedValue(0),
        create: vi.fn(),
        update: vi.fn(),
      },
    })
    const app = createApp(prisma)
    const res = await request(app).get('/api/clientes/5').expect(200)

    expect(res.body.success).toBe(true)
    expect(res.body.data).toEqual(expect.objectContaining({ id: 5 }))
    expect(prisma.cliente.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ id: 5, tenantId: 1 }) }),
    )
  })

  it('GET /api/clientes scopes list queries by session tenantId', async () => {
    const prisma = buildBasePrisma()
    const app = createApp(prisma)
    await request(app).get('/api/clientes').expect(200)

    expect(prisma.cliente.count).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ tenantId: 1 }) }),
    )
    expect(prisma.cliente.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ tenantId: 1 }) }),
    )
  })

  it('PUT /api/clientes/:id returns 404 without update when row is outside tenant scope', async () => {
    const clienteUpdate = vi.fn()
    const prisma = buildBasePrisma({
      cliente: {
        findFirst: vi.fn().mockResolvedValue(null),
        findMany: vi.fn().mockResolvedValue([]),
        count: vi.fn().mockResolvedValue(0),
        create: vi.fn(),
        update: clienteUpdate,
      },
    })
    const app = createApp(prisma)

    const res = await request(app)
      .put('/api/clientes/77')
      .send({
        codigo: 1001,
        rsocial: 'Otro tenant SA',
        condIva: 'RI',
        activo: true,
      })
      .expect(404)

    expect(res.body.success).toBe(false)
    expect(clienteUpdate).not.toHaveBeenCalled()
    expect(prisma.cliente.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ id: 77, tenantId: 1 }) }),
    )
  })
})
