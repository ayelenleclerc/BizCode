import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { createApp } from '../../apps/server/createApp'
import { assertMatchesOpenApi } from './validate-openapi-response'

const CLIENTE_REF = { id: 1, codigo: 1001, rsocial: 'ACME SA', condIva: 'RI' }

const CONTRATO_ROW = {
  id: 1,
  tenantId: 1,
  numero: 1,
  clienteId: 1,
  nombre: 'Soporte mensual',
  descripcion: null,
  estado: 'activo',
  frecuencia: 'mensual',
  diaDelMes: 10,
  fechaInicio: new Date('2026-07-01T00:00:00.000Z'),
  fechaFin: null,
  proximaFact: new Date('2026-07-10T00:00:00.000Z'),
  montoBase: 1000,
  moneda: 'ARS',
  incluyeIVA: false,
  ivaAlicuota: 21,
  modoEmision: 'revision',
  tipoFactura: 'B',
  prefijo: '0001',
  createdAt: new Date('2026-07-01T12:00:00.000Z'),
  updatedAt: new Date('2026-07-01T12:00:00.000Z'),
  cliente: CLIENTE_REF,
  items: [
    {
      id: 1,
      articuloId: null,
      descripcion: 'Soporte',
      condIva: '1',
      unidadServicio: 'mes',
      cantidad: 1,
      precioUnit: 1000,
      dscto: 0,
      articulo: null,
    },
  ],
  ajuste: null,
  facturas: [],
}

const CONTRATO_BODY = {
  clienteId: 1,
  nombre: 'Soporte mensual',
  frecuencia: 'mensual',
  diaDelMes: 10,
  fechaInicio: '2026-07-01',
  modoEmision: 'revision',
  items: [
    {
      descripcion: 'Soporte',
      condIva: '1',
      unidadServicio: 'mes',
      cantidad: 1,
      precioUnit: 1000,
      dscto: 0,
    },
  ],
}

function buildPrismaMock(overrides: Partial<Record<string, unknown>> = {}): PrismaClient {
  return {
    cliente: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue({ id: 1, tenantId: 1, condIva: 'RI', suspended: false }),
      findUnique: vi.fn().mockResolvedValue(null),
    },
    articulo: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
    },
    rubro: { findMany: vi.fn().mockResolvedValue([]) },
    formaPago: { findMany: vi.fn().mockResolvedValue([]) },
    factura: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
      count: vi.fn().mockResolvedValue(0),
      create: vi.fn(),
    },
    contrato: {
      count: vi.fn().mockResolvedValue(1),
      findMany: vi.fn().mockResolvedValue([CONTRATO_ROW]),
      findFirst: vi.fn().mockResolvedValue(CONTRATO_ROW),
      create: vi.fn().mockResolvedValue(CONTRATO_ROW),
      update: vi.fn().mockResolvedValue({ ...CONTRATO_ROW, estado: 'pausado' }),
    },
    contratoItem: { deleteMany: vi.fn().mockResolvedValue({ count: 0 }) },
    contratoAjuste: { deleteMany: vi.fn().mockResolvedValue({ count: 0 }) },
    appUser: { findFirst: vi.fn().mockResolvedValue(null) },
    auditEvent: { create: vi.fn().mockResolvedValue({ id: 1 }) },
    tenant: { findUnique: vi.fn().mockResolvedValue({ id: 1, slug: 'demo', active: true }) },
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

describe('Contratos API', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'seller'
    delete process.env.BIZCODE_TEST_MODULES
  })

  it('GET /api/contratos returns paginated list', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/contratos')
    expect(res.status).toBe(200)
    await assertMatchesOpenApi('/api/contratos', 'get', '200', res.body)
    expect(res.body.data).toHaveLength(1)
  })

  it('POST /api/contratos creates contract', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app).post('/api/contratos').send(CONTRATO_BODY)
    expect(res.status).toBe(201)
    await assertMatchesOpenApi('/api/contratos', 'post', '201', res.body)
  })

  it('POST /api/contratos/:id/pause pauses active contract', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app).post('/api/contratos/1/pause')
    expect(res.status).toBe(200)
    await assertMatchesOpenApi('/api/contratos/{id}/pause', 'post', '200', res.body)
  })

  it('returns 403 when service.contracts module is disabled', async () => {
    process.env.BIZCODE_TEST_MODULES = 'core.auth,core.catalog,core.clients,core.invoicing'
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/contratos')
    expect(res.status).toBe(403)
    expect(res.body.error).toBe('module_not_enabled')
    expect(res.body.module).toBe('service.contracts')
  })
})
