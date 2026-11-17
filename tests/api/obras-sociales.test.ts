/**
 * @en API tests for pharmacy insurer / prepaid endpoints (#252).
 * @es Tests API de obras sociales / prepagas (#252).
 * @pt-BR Testes API de planos / prepagas (#252).
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { Prisma } from '@prisma/client'
import { createApp } from '../../apps/server/createApp'
import { assertMatchesOpenApi } from './validate-openapi-response'

const PHARMACY_MODULES =
  'core.auth,core.catalog,core.clients,core.invoicing,inventory.stock,inventory.fefo,inventory.lots,vertical.pharmacy'

const osRow = {
  id: 1,
  tenantId: 1,
  nombre: 'IOMA',
  codigo: 'IOMA',
  activa: true,
  createdAt: new Date('2026-05-01T00:00:00.000Z'),
  updatedAt: new Date('2026-05-01T00:00:00.000Z'),
  coberturas: [
    {
      id: 10,
      tenantId: 1,
      obraSocialId: 1,
      tipoProducto: 'generico',
      cobertura: new Prisma.Decimal(70),
      createdAt: new Date('2026-05-01T00:00:00.000Z'),
      updatedAt: new Date('2026-05-01T00:00:00.000Z'),
    },
  ],
}

const ventaRow = {
  id: 5,
  tenantId: 1,
  facturaId: null,
  clienteId: 4,
  obraSocialId: 1,
  nroAfiliado: 'AF-1',
  nroReceta: null,
  totalVenta: new Prisma.Decimal(10000),
  copagoPaciente: new Prisma.Decimal(3000),
  creditoOS: new Prisma.Decimal(7000),
  estado: 'pendiente_cobro_os',
  presentacionId: null,
  fecha: new Date('2026-05-10T12:00:00.000Z'),
  createdAt: new Date('2026-05-10T12:00:00.000Z'),
  updatedAt: new Date('2026-05-10T12:00:00.000Z'),
  items: [
    {
      id: 50,
      tenantId: 1,
      ventaConOSId: 5,
      articuloId: null,
      descripcion: 'Ibuprofeno',
      tipoProducto: 'generico',
      cantidad: new Prisma.Decimal(1),
      precioUnitario: new Prisma.Decimal(10000),
      subtotal: new Prisma.Decimal(10000),
      coberturaPct: new Prisma.Decimal(70),
      creditoOS: new Prisma.Decimal(7000),
      copago: new Prisma.Decimal(3000),
    },
  ],
  obraSocial: { id: 1, nombre: 'IOMA', codigo: 'IOMA' },
  cliente: { id: 4, rsocial: 'Paciente' },
}

function buildPrismaMock(): PrismaClient {
  const tx = {
    ventaConOS: {
      create: vi.fn().mockResolvedValue(ventaRow),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      update: vi.fn().mockResolvedValue(ventaRow),
    },
    presentacionOS: {
      create: vi.fn().mockResolvedValue({
        id: 9,
        tenantId: 1,
        obraSocialId: 1,
        periodo: '2026-05',
        totalCredito: new Prisma.Decimal(7000),
        estado: 'generada',
        archivoCsvName: 'presentacion-os-1-2026-05.csv',
        fechaPago: null,
        importeCobrado: null,
        createdAt: new Date('2026-06-01T00:00:00.000Z'),
        updatedAt: new Date('2026-06-01T00:00:00.000Z'),
      }),
      findFirstOrThrow: vi.fn().mockResolvedValue({
        id: 9,
        tenantId: 1,
        obraSocialId: 1,
        periodo: '2026-05',
        totalCredito: new Prisma.Decimal(7000),
        estado: 'generada',
        archivoCsvName: 'presentacion-os-1-2026-05.csv',
        fechaPago: null,
        importeCobrado: null,
        createdAt: new Date('2026-06-01T00:00:00.000Z'),
        updatedAt: new Date('2026-06-01T00:00:00.000Z'),
        obraSocial: { id: 1, nombre: 'IOMA', codigo: 'IOMA' },
        rechazos: [],
        _count: { ventas: 1 },
      }),
      update: vi.fn(),
    },
    presentacionOSRechazo: {
      create: vi.fn().mockResolvedValue({ id: 1 }),
    },
  }

  return {
    auditEvent: { create: vi.fn().mockResolvedValue({ id: 1 }) },
    cliente: { findFirst: vi.fn().mockResolvedValue({ id: 4, rsocial: 'Paciente' }) },
    factura: { findFirst: vi.fn().mockResolvedValue({ id: 31 }) },
    obraSocial: {
      findMany: vi.fn().mockResolvedValue([osRow]),
      findFirst: vi.fn().mockResolvedValue(osRow),
      create: vi.fn().mockResolvedValue(osRow),
      update: vi.fn().mockResolvedValue(osRow),
    },
    coberturaOS: {
      upsert: vi.fn().mockResolvedValue(osRow.coberturas[0]),
    },
    ventaConOS: {
      findMany: vi.fn().mockResolvedValue([ventaRow]),
      findFirst: vi.fn().mockResolvedValue(ventaRow),
      create: vi.fn().mockResolvedValue(ventaRow),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      update: vi.fn().mockResolvedValue({ ...ventaRow, estado: 'rechazado_os' }),
    },
    presentacionOS: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn(),
      update: vi.fn(),
      findFirstOrThrow: vi.fn(),
    },
    presentacionOSRechazo: {
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn(),
    },
    $transaction: vi.fn(async (fn: (client: typeof tx) => Promise<unknown>) => fn(tx)),
  } as unknown as PrismaClient
}

describe('obras sociales REST endpoints (#252)', () => {
  const previousModules = process.env.BIZCODE_TEST_MODULES
  let prisma: PrismaClient

  beforeEach(() => {
    process.env.BIZCODE_TEST_MODULES = PHARMACY_MODULES
    prisma = buildPrismaMock()
  })

  afterEach(() => {
    if (previousModules === undefined) delete process.env.BIZCODE_TEST_MODULES
    else process.env.BIZCODE_TEST_MODULES = previousModules
    vi.restoreAllMocks()
  })

  it('GET /api/farmacia/obras-sociales returns 403 without module', async () => {
    process.env.BIZCODE_TEST_MODULES = 'core.auth,core.catalog'
    const app = createApp(prisma)
    const res = await request(app).get('/api/farmacia/obras-sociales').expect(403)
    expect(res.body.error).toBe('module_not_enabled')
    await assertMatchesOpenApi('/api/farmacia/obras-sociales', 'get', '403', res.body)
  })

  it('GET /api/farmacia/obras-sociales lists insurers', async () => {
    const app = createApp(prisma)
    const res = await request(app).get('/api/farmacia/obras-sociales').expect(200)
    expect(res.body.data[0].codigo).toBe('IOMA')
    await assertMatchesOpenApi('/api/farmacia/obras-sociales', 'get', '200', res.body)
  })

  it('POST /api/farmacia/obras-sociales creates insurer', async () => {
    const app = createApp(prisma)
    const res = await request(app)
      .post('/api/farmacia/obras-sociales')
      .send({
        nombre: 'IOMA',
        codigo: 'IOMA',
        coberturas: [{ tipoProducto: 'generico', cobertura: 70 }],
      })
      .expect(201)
    expect(res.body.data.nombre).toBe('IOMA')
    await assertMatchesOpenApi('/api/farmacia/obras-sociales', 'post', '201', res.body)
  })

  it('POST /api/farmacia/ventas-os computes copay', async () => {
    const app = createApp(prisma)
    const res = await request(app)
      .post('/api/farmacia/ventas-os')
      .send({
        clienteId: 4,
        obraSocialId: 1,
        nroAfiliado: 'AF-1',
        items: [
          {
            descripcion: 'Ibuprofeno',
            tipoProducto: 'generico',
            cantidad: 1,
            precioUnitario: 10000,
          },
        ],
      })
      .expect(201)
    expect(res.body.data.copagoPaciente).toBe(3000)
    expect(res.body.data.creditoOS).toBe(7000)
    await assertMatchesOpenApi('/api/farmacia/ventas-os', 'post', '201', res.body)
  })

  it('POST /api/farmacia/presentaciones-os generates period batch', async () => {
    const app = createApp(prisma)
    const res = await request(app)
      .post('/api/farmacia/presentaciones-os')
      .send({ obraSocialId: 1, periodo: '2026-05' })
      .expect(201)
    expect(res.body.data.periodo).toBe('2026-05')
    expect(res.body.data.estado).toBe('generada')
    await assertMatchesOpenApi('/api/farmacia/presentaciones-os', 'post', '201', res.body)
  })

  it('GET /api/farmacia/obras-sociales-cc returns CC summary', async () => {
    const app = createApp(prisma)
    const res = await request(app).get('/api/farmacia/obras-sociales-cc').expect(200)
    expect(res.body.data[0].obraSocialId).toBe(1)
    await assertMatchesOpenApi('/api/farmacia/obras-sociales-cc', 'get', '200', res.body)
  })
})
