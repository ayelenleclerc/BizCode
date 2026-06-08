/**
 * @en API tests for GET /api/contabilidad/libro-iva-compras (#306).
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { createApp } from '../../server/createApp'

const COMPROBANTE = {
  id: 1,
  tenantId: 1,
  proveedorId: 1,
  ordenCompraId: null,
  fecha: new Date('2026-05-10T12:00:00.000Z'),
  tipo: 'B',
  prefijo: '0001',
  numero: 1,
  neto1: new Decimal(100),
  neto2: new Decimal(0),
  neto3: new Decimal(0),
  iva1: new Decimal(21),
  iva2: new Decimal(0),
  total: new Decimal(121),
  cae: null,
  caeVto: null,
  estado: 'A',
  createdAt: new Date(),
  updatedAt: new Date(),
  proveedor: {
    id: 1,
    tenantId: 1,
    codigo: 1,
    rsocial: 'Proveedor SA',
    fantasia: null,
    cuit: '30123456789',
    condIva: 'RI',
    telef: null,
    email: null,
    activo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
}

function buildPrismaMock(overrides: Partial<Record<string, unknown>> = {}): PrismaClient {
  const base = {
    deliveryZone: { findMany: vi.fn().mockResolvedValue([]), findFirst: vi.fn().mockResolvedValue(null) },
    cliente: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue({ id: 1, suspended: false }),
    },
    articulo: { findMany: vi.fn().mockResolvedValue([]) },
    rubro: { findMany: vi.fn().mockResolvedValue([]) },
    formaPago: { findMany: vi.fn().mockResolvedValue([]) },
    factura: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
      aggregate: vi.fn().mockResolvedValue({ _count: { id: 0 }, _sum: { total: null } }),
    },
    notaCredito: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
      count: vi.fn().mockResolvedValue(0),
    },
    comprobanteCompra: {
      findMany: vi.fn().mockResolvedValue([COMPROBANTE]),
      create: vi.fn(),
    },
    proveedor: {
      findFirst: vi.fn().mockResolvedValue(COMPROBANTE.proveedor),
    },
    notification: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn(),
      createMany: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    auditEvent: { create: vi.fn() },
    appUser: {
      count: vi.fn().mockResolvedValue(1),
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
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
  }
  return base as unknown as PrismaClient
}

const MODULES =
  'core.auth,billing.credit_notes,billing.arca_cae,finance.ledger,billing.orders,logistics.dispatches,logistics.picking,logistics.gps'

describe('GET /api/contabilidad/libro-iva-compras', () => {
  beforeEach(() => {
    vi.stubEnv('BIZCODE_TEST_MODULES', MODULES)
  })

  it('returns 400 without periodo', async () => {
    const prisma = buildPrismaMock()
    const app = createApp(prisma)
    await request(app).get('/api/contabilidad/libro-iva-compras').expect(400)
  })

  it('returns preview JSON with record counts', async () => {
    const prisma = buildPrismaMock()
    const app = createApp(prisma)
    const res = await request(app)
      .get('/api/contabilidad/libro-iva-compras')
      .query({ periodo: '2026-05', format: 'preview' })
      .expect(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.periodo).toBe('2026-05')
    expect(res.body.data.recordCountCbtu).toBe(1)
    expect(res.body.data.arcaValidationPending).toBe(true)
  })

  it('returns 403 when finance.ledger is disabled', async () => {
    vi.stubEnv('BIZCODE_TEST_MODULES', 'core.auth,billing.arca_cae')
    const prisma = buildPrismaMock()
    const app = createApp(prisma)
    await request(app)
      .get('/api/contabilidad/libro-iva-compras')
      .query({ periodo: '2026-05' })
      .expect(403)
  })

  it('returns zip for format=txt', async () => {
    const prisma = buildPrismaMock()
    const app = createApp(prisma)
    const res = await request(app)
      .get('/api/contabilidad/libro-iva-compras')
      .query({ periodo: '2026-05', format: 'txt' })
      .expect(200)
    expect(res.headers['content-type']).toContain('application/zip')
    expect(Number(res.headers['content-length'] ?? 0)).toBeGreaterThan(0)
  })
})
