import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { createApp } from '../../apps/server/createApp'
import { assertMatchesOpenApi } from './validate-openapi-response'

const now = new Date('2026-07-20T12:00:00.000Z')

const CAJA_ROW = {
  id: 1,
  tenantId: 1,
  nombre: 'Caja Mostrador',
  activa: true,
  createdAt: now,
  updatedAt: now,
}

const TURNO_ROW = {
  id: 10,
  tenantId: 1,
  cajaId: 1,
  cajeroId: 1,
  estado: 'abierto',
  montoApertura: new Decimal(1000),
  fechaApertura: now,
  fechaCierre: null as Date | null,
  totalVentasEfectivo: null as Decimal | null,
  totalVentasTarjeta: null as Decimal | null,
  totalVentasMP: null as Decimal | null,
  totalVentasTransf: null as Decimal | null,
  totalEgresos: null as Decimal | null,
  totalIngresosExtra: null as Decimal | null,
  efectivoEsperado: null as Decimal | null,
  efectivoContado: null as Decimal | null,
  diferencia: null as Decimal | null,
  observaciones: null as string | null,
  createdAt: now,
  updatedAt: now,
  caja: CAJA_ROW,
  cajero: { id: 1, username: 'seller' },
  conteo: null as unknown,
  movimientos: [] as unknown[],
}

function buildPrismaMock(overrides: Partial<Record<string, unknown>> = {}): PrismaClient {
  return {
    cliente: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue({ id: 1, tenantId: 1, condIva: 'RI', suspended: false }),
      findUnique: vi.fn().mockResolvedValue(null),
    },
    articulo: { findMany: vi.fn().mockResolvedValue([]), findFirst: vi.fn().mockResolvedValue(null) },
    rubro: { findMany: vi.fn().mockResolvedValue([]) },
    formaPago: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue({ id: 1, esEfectivo: true }),
      update: vi.fn().mockResolvedValue({ id: 1, descripcion: 'Efectivo', esEfectivo: true }),
    },
    factura: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
      count: vi.fn().mockResolvedValue(0),
      create: vi.fn(),
    },
    caja: {
      findMany: vi.fn().mockResolvedValue([CAJA_ROW]),
      findFirst: vi.fn().mockResolvedValue({ id: 1 }),
      create: vi.fn().mockResolvedValue(CAJA_ROW),
    },
    turnoCaja: {
      count: vi.fn().mockResolvedValue(1),
      findMany: vi.fn().mockResolvedValue([TURNO_ROW]),
      findFirst: vi.fn().mockResolvedValue(TURNO_ROW),
      findFirstOrThrow: vi.fn().mockResolvedValue(TURNO_ROW),
      create: vi.fn().mockResolvedValue(TURNO_ROW),
      update: vi.fn().mockResolvedValue({
        ...TURNO_ROW,
        estado: 'cerrado',
        fechaCierre: now,
        efectivoEsperado: new Decimal(1000),
        efectivoContado: new Decimal(1000),
        diferencia: new Decimal(0),
        totalVentasEfectivo: new Decimal(0),
        totalVentasTarjeta: new Decimal(0),
        totalVentasMP: new Decimal(0),
        totalVentasTransf: new Decimal(0),
        totalEgresos: new Decimal(0),
        totalIngresosExtra: new Decimal(0),
        conteo: {
          id: 1,
          turnoId: 10,
          b1000: 1,
          b500: 0,
          b200: 0,
          b100: 0,
          b50: 0,
          b20: 0,
          b10: 0,
          m10: 0,
          m5: 0,
          m2: 0,
          m1: 0,
          total: new Decimal(1000),
        },
        movimientos: [],
      }),
      aggregate: vi.fn().mockResolvedValue({ _sum: { diferencia: new Decimal(0) } }),
    },
    movimientoCaja: {
      create: vi.fn().mockResolvedValue({ id: 1 }),
    },
    conteoEfectivo: {
      create: vi.fn().mockResolvedValue({ id: 1 }),
    },
    appUser: { findFirst: vi.fn().mockResolvedValue(null), findMany: vi.fn().mockResolvedValue([]) },
    auditEvent: { create: vi.fn().mockResolvedValue({ id: 1 }) },
    tenant: { findUnique: vi.fn().mockResolvedValue({ id: 1, slug: 'demo', active: true }) },
    appSession: {
      create: vi.fn().mockResolvedValue({ id: 1 }),
      findFirst: vi.fn().mockResolvedValue(null),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      update: vi.fn().mockResolvedValue({ id: 1 }),
    },
    $transaction: vi.fn(async (arg: unknown) => {
      if (typeof arg === 'function') {
        const tx = {
          conteoEfectivo: { create: vi.fn().mockResolvedValue({ id: 1 }) },
          turnoCaja: {
            update: vi.fn().mockResolvedValue({
              ...TURNO_ROW,
              estado: 'cerrado',
              fechaCierre: now,
              efectivoEsperado: new Decimal(900),
              efectivoContado: new Decimal(0),
              diferencia: new Decimal(-900),
              observaciones: 'Faltante',
              totalVentasEfectivo: new Decimal(0),
              totalVentasTarjeta: new Decimal(0),
              totalVentasMP: new Decimal(0),
              totalVentasTransf: new Decimal(0),
              totalEgresos: new Decimal(100),
              totalIngresosExtra: new Decimal(0),
              conteo: {
                id: 1,
                turnoId: 10,
                b1000: 0,
                b500: 0,
                b200: 0,
                b100: 0,
                b50: 0,
                b20: 0,
                b10: 0,
                m10: 0,
                m5: 0,
                m2: 0,
                m1: 0,
                total: new Decimal(0),
              },
              movimientos: [
                {
                  id: 1,
                  turnoId: 10,
                  tipo: 'egreso',
                  formaPago: 'efectivo',
                  importe: new Decimal(100),
                  concepto: 'retiro',
                  referenciaTipo: null,
                  referenciaId: null,
                  userId: 1,
                  fecha: now,
                  user: { id: 1, username: 'seller' },
                },
              ],
            }),
          },
        }
        return (arg as (t: typeof tx) => unknown)(tx)
      }
      return arg
    }),
    ...overrides,
  } as unknown as PrismaClient
}

describe('Caja / Turnos API (#247)', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'seller'
    delete process.env.BIZCODE_TEST_MODULES
  })

  it('GET /api/cajas returns list', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/cajas')
    expect(res.status).toBe(200)
    await assertMatchesOpenApi('/api/cajas', 'get', '200', res.body)
    expect(res.body.data).toHaveLength(1)
  })

  it('POST /api/cajas creates drawer', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app).post('/api/cajas').send({ nombre: 'Caja 2' })
    expect(res.status).toBe(201)
    await assertMatchesOpenApi('/api/cajas', 'post', '201', res.body)
  })

  it('GET /api/turnos-caja returns list with counts', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/turnos-caja')
    expect(res.status).toBe(200)
    await assertMatchesOpenApi('/api/turnos-caja', 'get', '200', res.body)
    expect(res.body.counts).toBeDefined()
  })

  it('POST /api/turnos-caja opens shift', async () => {
    const prisma = buildPrismaMock({
      turnoCaja: {
        count: vi.fn().mockResolvedValue(0),
        findMany: vi.fn().mockResolvedValue([]),
        findFirst: vi.fn().mockResolvedValue(null),
        findFirstOrThrow: vi.fn(),
        create: vi.fn().mockResolvedValue(TURNO_ROW),
        update: vi.fn(),
        aggregate: vi.fn().mockResolvedValue({ _sum: { diferencia: null } }),
      },
    })
    const app = createApp(prisma)
    const res = await request(app).post('/api/turnos-caja').send({
      cajaId: 1,
      montoApertura: 1000,
    })
    expect(res.status).toBe(201)
    await assertMatchesOpenApi('/api/turnos-caja', 'post', '201', res.body)
  })

  it('POST movimientos + cerrar with faltante (happy path + difference)', async () => {
    const openWithMov = {
      ...TURNO_ROW,
      movimientos: [
        {
          id: 1,
          turnoId: 10,
          tipo: 'egreso',
          formaPago: 'efectivo',
          importe: new Decimal(100),
          concepto: 'retiro',
          referenciaTipo: null,
          referenciaId: null,
          userId: 1,
          fecha: now,
          user: { id: 1, username: 'seller' },
        },
      ],
    }
    const prisma = buildPrismaMock({
      turnoCaja: {
        count: vi.fn().mockResolvedValue(1),
        findMany: vi.fn().mockResolvedValue([openWithMov]),
        findFirst: vi.fn().mockResolvedValue(openWithMov),
        findFirstOrThrow: vi.fn().mockResolvedValue(openWithMov),
        create: vi.fn(),
        update: vi.fn(),
        aggregate: vi.fn().mockResolvedValue({ _sum: { diferencia: new Decimal(-900) } }),
      },
    })
    const app = createApp(prisma)

    const mov = await request(app).post('/api/turnos-caja/10/movimientos').send({
      tipo: 'egreso',
      importe: 50,
      concepto: 'cambio',
    })
    expect(mov.status).toBe(201)

    const close = await request(app).post('/api/turnos-caja/10/cerrar').send({
      conteo: {},
      observaciones: 'Faltante de caja',
    })
    expect(close.status).toBe(200)
    await assertMatchesOpenApi('/api/turnos-caja/{id}/cerrar', 'post', '200', close.body)
    expect(close.body.data.estado).toBe('cerrado')
  })

  it('returns 403 when pos.cashier module is disabled', async () => {
    process.env.BIZCODE_TEST_MODULES = 'core.auth,core.catalog,core.clients,core.invoicing'
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/cajas')
    expect(res.status).toBe(403)
  })
})
