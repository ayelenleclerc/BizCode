import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { createApp } from '../../server/createApp'

// ─── Shared fixtures ─────────────────────────────────────────────────────────

const CLIENTE_BASE = {
  id: 1,
  codigo: 1001,
  rsocial: 'ACME SA',
  fantasia: null,
  cuit: '20-12345678-9',
  condIva: 'RI',
  domicilio: 'Av. Siempre Viva 742',
  localidad: 'Springfield',
  cpost: '5000',
  telef: '351-555-0100',
  email: 'acme@example.com',
  formaPago: null,
  activo: true,
  creditLimit: null,
  creditDays: 0,
  balance: '0.00',
  balanceInicial: '0.00',
  score: 50,
  suspended: false,
  deliveryZoneId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
}

const FACTURA_BODY = {
  fecha: new Date().toISOString(),
  tipo: 'B',
  prefijo: '0001',
  numero: 1,
  clienteId: 1,
  neto1: '826.45',
  neto2: '0',
  neto3: '0',
  iva1: '173.55',
  iva2: '0',
  total: '1000.00',
  formaPagoId: null,
  estado: 'A',
  items: [{ articuloId: 1, cantidad: 2, precio: '500.00', dscto: '0', subtotal: '1000.00' }],
}

const FACTURA_RESULT = {
  id: 99,
  ...FACTURA_BODY,
  items: FACTURA_BODY.items.map((i, idx) => ({ id: idx + 1, facturaId: 99, ...i, createdAt: new Date() })),
  createdAt: new Date(),
  updatedAt: new Date(),
}

function buildPrismaMock(overrides: Partial<Record<string, unknown>> = {}): PrismaClient {
  return {
    cliente: {
      findMany: vi.fn().mockResolvedValue([CLIENTE_BASE]),
      findUnique: vi.fn().mockResolvedValue(CLIENTE_BASE),
      create: vi.fn().mockResolvedValue(CLIENTE_BASE),
      update: vi.fn().mockResolvedValue(CLIENTE_BASE),
    },
    articulo: { findMany: vi.fn().mockResolvedValue([]) },
    rubro: { findMany: vi.fn().mockResolvedValue([]) },
    formaPago: { findMany: vi.fn().mockResolvedValue([]) },
    factura: {
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn().mockResolvedValue(FACTURA_RESULT),
      aggregate: vi.fn().mockResolvedValue({ _count: { id: 0 }, _sum: { total: null } }),
    },
    notification: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({ id: 1 }),
      createMany: vi.fn().mockResolvedValue({ count: 1 }),
      update: vi.fn().mockResolvedValue(null),
      updateMany: vi.fn().mockResolvedValue({ count: 0 }),
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
    $transaction: vi.fn(async (arg: unknown) => {
      if (typeof arg === 'function') return arg(buildPrismaMock())
      return arg
    }),
    ...overrides,
  } as unknown as PrismaClient
}

// ─── POST /api/facturas — suspended block ─────────────────────────────────────

describe('POST /api/facturas — cliente suspended', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'seller'
  })

  it('returns 422 CLIENT_SUSPENDED when cliente.suspended is true', async () => {
    const suspendedCliente = { ...CLIENTE_BASE, suspended: true }
    const prisma = buildPrismaMock({
      cliente: {
        findMany: vi.fn().mockResolvedValue([]),
        findUnique: vi.fn().mockResolvedValue(suspendedCliente),
        create: vi.fn(),
        update: vi.fn(),
      },
    })
    const app = createApp(prisma)

    const res = await request(app)
      .post('/api/facturas')
      .send(FACTURA_BODY)
      .expect(422)

    expect(res.body).toEqual({ success: false, error: 'CLIENT_SUSPENDED' })
    // factura should NOT have been created
    expect((prisma.factura.create as ReturnType<typeof vi.fn>)).not.toHaveBeenCalled()
  })

  it('allows creating factura when cliente is not suspended', async () => {
    const activeCliente = { ...CLIENTE_BASE, suspended: false, balance: '1000.00', creditLimit: null }
    const txPrisma = buildPrismaMock({
      cliente: {
        findMany: vi.fn().mockResolvedValue([]),
        findUnique: vi.fn().mockResolvedValue(activeCliente),
        create: vi.fn(),
        update: vi.fn().mockResolvedValue({ id: 1, rsocial: 'ACME SA', balance: '1000.00', creditLimit: null }),
      },
      factura: {
        findMany: vi.fn().mockResolvedValue([]),
        create: vi.fn().mockResolvedValue(FACTURA_RESULT),
        aggregate: vi.fn(),
      },
    })
    const prisma = buildPrismaMock({
      cliente: {
        findMany: vi.fn().mockResolvedValue([]),
        findUnique: vi.fn().mockResolvedValue(activeCliente),
        create: vi.fn(),
        update: vi.fn().mockResolvedValue({ id: 1, rsocial: 'ACME SA', balance: '1000.00', creditLimit: null }),
      },
      factura: {
        findMany: vi.fn().mockResolvedValue([]),
        create: vi.fn().mockResolvedValue(FACTURA_RESULT),
        aggregate: vi.fn(),
      },
      $transaction: vi.fn(async (fn: unknown) => {
        if (typeof fn === 'function') return fn(txPrisma)
        return fn
      }),
    })

    const app = createApp(prisma)
    const res = await request(app).post('/api/facturas').send(FACTURA_BODY).expect(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.id).toBe(99)
  })
})

// ─── POST /api/facturas — balance update ─────────────────────────────────────

describe('POST /api/facturas — balance update', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'seller'
  })

  it('increments cliente balance inside the transaction', async () => {
    const clienteUpdate = vi.fn().mockResolvedValue({
      id: 1,
      rsocial: 'ACME SA',
      balance: '1000.00',
      creditLimit: null,
    })
    const facturaCreate = vi.fn().mockResolvedValue(FACTURA_RESULT)

    const txPrisma = {
      cliente: { update: clienteUpdate },
      factura: { create: facturaCreate },
    } as unknown as PrismaClient

    const prisma = buildPrismaMock({
      cliente: {
        findMany: vi.fn().mockResolvedValue([]),
        findUnique: vi.fn().mockResolvedValue({ ...CLIENTE_BASE, suspended: false }),
        create: vi.fn(),
        update: clienteUpdate,
      },
      $transaction: vi.fn(async (fn: unknown) => {
        if (typeof fn === 'function') return fn(txPrisma)
        return fn
      }),
    })

    const app = createApp(prisma)
    await request(app).post('/api/facturas').send(FACTURA_BODY).expect(200)

    expect(clienteUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 1 },
        data: { balance: { increment: expect.anything() } },
      }),
    )
  })
})

// ─── POST /api/facturas — credit limit notification ───────────────────────────

describe('POST /api/facturas — credit limit notification', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'seller'
  })

  it('calls notifyManagers when balance exceeds creditLimit', async () => {
    // balance (2000) > creditLimit (1500) → notification triggered
    const updatedCliente = { id: 1, rsocial: 'ACME SA', balance: '2000.00', creditLimit: '1500.00' }

    const clienteUpdate = vi.fn().mockResolvedValue(updatedCliente)
    const facturaCreate = vi.fn().mockResolvedValue(FACTURA_RESULT)
    const notifCreateMany = vi.fn().mockResolvedValue({ count: 1 })

    const managers = [{ id: 10 }, { id: 11 }]

    const txPrisma = {
      cliente: { update: clienteUpdate },
      factura: { create: facturaCreate },
    } as unknown as PrismaClient

    const prisma = buildPrismaMock({
      cliente: {
        findMany: vi.fn().mockResolvedValue([]),
        findUnique: vi.fn().mockResolvedValue({ ...CLIENTE_BASE, suspended: false }),
        create: vi.fn(),
        update: clienteUpdate,
      },
      appUser: {
        count: vi.fn().mockResolvedValue(2),
        findMany: vi.fn().mockResolvedValue(managers),
        findFirst: vi.fn().mockResolvedValue(null),
        findUnique: vi.fn().mockResolvedValue(null),
        create: vi.fn(),
        update: vi.fn(),
      },
      notification: {
        findMany: vi.fn().mockResolvedValue([]),
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({ id: 1 }),
        createMany: notifCreateMany,
        update: vi.fn().mockResolvedValue(null),
        updateMany: vi.fn().mockResolvedValue({ count: 0 }),
      },
      $transaction: vi.fn(async (fn: unknown) => {
        if (typeof fn === 'function') return fn(txPrisma)
        return fn
      }),
    })

    const app = createApp(prisma)
    const res = await request(app).post('/api/facturas').send(FACTURA_BODY).expect(200)

    expect(res.body.success).toBe(true)
    // Give the non-blocking notifyManagers call time to settle
    await new Promise((r) => setTimeout(r, 50))
    expect(notifCreateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.arrayContaining([
          expect.objectContaining({ type: 'credit_limit_exceeded', userId: 10 }),
          expect.objectContaining({ type: 'credit_limit_exceeded', userId: 11 }),
        ]),
      }),
    )
  })

  it('does NOT notify when balance is under creditLimit', async () => {
    // balance (500) < creditLimit (1500) → no notification
    const updatedCliente = { id: 1, rsocial: 'ACME SA', balance: '500.00', creditLimit: '1500.00' }

    const clienteUpdate = vi.fn().mockResolvedValue(updatedCliente)
    const notifCreateMany = vi.fn().mockResolvedValue({ count: 0 })

    const txPrisma = {
      cliente: { update: clienteUpdate },
      factura: { create: vi.fn().mockResolvedValue(FACTURA_RESULT) },
    } as unknown as PrismaClient

    const prisma = buildPrismaMock({
      cliente: {
        findMany: vi.fn().mockResolvedValue([]),
        findUnique: vi.fn().mockResolvedValue({ ...CLIENTE_BASE, suspended: false }),
        create: vi.fn(),
        update: clienteUpdate,
      },
      notification: {
        findMany: vi.fn().mockResolvedValue([]),
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({ id: 1 }),
        createMany: notifCreateMany,
        update: vi.fn().mockResolvedValue(null),
        updateMany: vi.fn().mockResolvedValue({ count: 0 }),
      },
      $transaction: vi.fn(async (fn: unknown) => {
        if (typeof fn === 'function') return fn(txPrisma)
        return fn
      }),
    })

    const app = createApp(prisma)
    await request(app).post('/api/facturas').send(FACTURA_BODY).expect(200)

    await new Promise((r) => setTimeout(r, 50))
    expect(notifCreateMany).not.toHaveBeenCalled()
  })

  it('does NOT notify when creditLimit is null (no limit set)', async () => {
    const updatedCliente = { id: 1, rsocial: 'ACME SA', balance: '99999.00', creditLimit: null }

    const clienteUpdate = vi.fn().mockResolvedValue(updatedCliente)
    const notifCreateMany = vi.fn().mockResolvedValue({ count: 0 })

    const txPrisma = {
      cliente: { update: clienteUpdate },
      factura: { create: vi.fn().mockResolvedValue(FACTURA_RESULT) },
    } as unknown as PrismaClient

    const prisma = buildPrismaMock({
      cliente: {
        findMany: vi.fn().mockResolvedValue([]),
        findUnique: vi.fn().mockResolvedValue({ ...CLIENTE_BASE, suspended: false }),
        create: vi.fn(),
        update: clienteUpdate,
      },
      notification: {
        findMany: vi.fn().mockResolvedValue([]),
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({ id: 1 }),
        createMany: notifCreateMany,
        update: vi.fn().mockResolvedValue(null),
        updateMany: vi.fn().mockResolvedValue({ count: 0 }),
      },
      $transaction: vi.fn(async (fn: unknown) => {
        if (typeof fn === 'function') return fn(txPrisma)
        return fn
      }),
    })

    const app = createApp(prisma)
    await request(app).post('/api/facturas').send(FACTURA_BODY).expect(200)

    await new Promise((r) => setTimeout(r, 50))
    expect(notifCreateMany).not.toHaveBeenCalled()
  })
})

// ─── PUT /api/clientes/:id — role-based financial field restriction ───────────

describe('PUT /api/clientes/:id — financial field access', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
  })

  it('manager can update creditLimit and suspended', async () => {
    process.env.BIZCODE_TEST_ROLE = 'manager'
    const clienteUpdate = vi.fn().mockResolvedValue({ ...CLIENTE_BASE, creditLimit: '5000.00', suspended: true })
    const prisma = buildPrismaMock({
      cliente: {
        findMany: vi.fn().mockResolvedValue([]),
        findUnique: vi.fn().mockResolvedValue(CLIENTE_BASE),
        create: vi.fn(),
        update: clienteUpdate,
      },
    })

    const app = createApp(prisma)
    const res = await request(app)
      .put('/api/clientes/1')
      .send({ rsocial: 'ACME SA', creditLimit: 5000, suspended: true })
      .expect(200)

    expect(res.body.success).toBe(true)
    expect(clienteUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ creditLimit: 5000, suspended: true }),
      }),
    )
  })

  it('seller cannot update creditLimit or suspended (fields stripped)', async () => {
    process.env.BIZCODE_TEST_ROLE = 'seller'
    const clienteUpdate = vi.fn().mockResolvedValue(CLIENTE_BASE)
    const prisma = buildPrismaMock({
      cliente: {
        findMany: vi.fn().mockResolvedValue([]),
        findUnique: vi.fn().mockResolvedValue(CLIENTE_BASE),
        create: vi.fn(),
        update: clienteUpdate,
      },
    })

    const app = createApp(prisma)
    await request(app)
      .put('/api/clientes/1')
      .send({ rsocial: 'ACME SA', creditLimit: 5000, suspended: true })
      .expect(200)

    const callArg = clienteUpdate.mock.calls[0][0] as { data: Record<string, unknown> }
    expect(callArg.data.creditLimit).toBeUndefined()
    expect(callArg.data.suspended).toBeUndefined()
  })
})
