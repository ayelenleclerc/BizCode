import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { createApp } from '../../apps/server/createApp'
import {
  createCcTxLayer,
  createMovimientoClienteCCPrismaMock,
  extendClientePrismaForCc,
} from '../helpers/movimientoClienteCcPrismaMock'
import {
  computeScoreAfterCobro,
  computeScoreChange,
  computeScoreDelta,
} from '../../apps/server/services/CobroService'

const CLIENTE_BASE = {
  id: 1,
  codigo: 1001,
  rsocial: 'ACME SA',
  fantasia: null,
  cuit: '20-12345678-9',
  condIva: 'RI',
  domicilio: null,
  localidad: null,
  cpost: null,
  telef: null,
  email: null,
  formaPago: null,
  activo: true,
  creditLimit: null,
  creditDays: 30,
  balance: '1000.00',
  balanceInicial: '0.00',
  score: 50,
  suspended: false,
  deliveryZoneId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
}

const COBRO_BODY = {
  clienteId: 1,
  fecha: '2026-05-15',
  monto: 250.5,
  formaPagoId: null,
  referencia: 'REC-001',
  nota: 'Pago parcial',
}

const COBRO_RESULT = {
  id: 10,
  tenantId: 1,
  ...COBRO_BODY,
  fecha: new Date('2026-05-15T12:00:00.000Z'),
  monto: '250.50',
  referencia: 'REC-001',
  nota: 'Pago parcial',
  createdAt: new Date(),
  updatedAt: new Date(),
  cliente: { id: 1, codigo: 1001, rsocial: 'ACME SA' },
}

function buildPrismaMock(overrides: Partial<Record<string, unknown>> = {}): PrismaClient {
  return {
    deliveryZone: { findFirst: vi.fn().mockResolvedValue({ id: 1, tenantId: 1 }) },
    cliente: extendClientePrismaForCc({
      findMany: vi.fn().mockResolvedValue([CLIENTE_BASE]),
      findFirst: vi.fn().mockResolvedValue(CLIENTE_BASE),
      findUnique: vi.fn().mockResolvedValue(CLIENTE_BASE),
      create: vi.fn().mockResolvedValue(CLIENTE_BASE),
      update: vi.fn().mockResolvedValue(CLIENTE_BASE),
    }),
    movimientoClienteCC: createMovimientoClienteCCPrismaMock(),
    articulo: { findMany: vi.fn().mockResolvedValue([]) },
    rubro: { findMany: vi.fn().mockResolvedValue([]) },
    formaPago: { findMany: vi.fn().mockResolvedValue([]), findUnique: vi.fn().mockResolvedValue({ id: 1 }) },
    cuentaBancaria: { findFirst: vi.fn().mockResolvedValue(null) },
    factura: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn(),
      aggregate: vi.fn().mockResolvedValue({ _count: { id: 0 }, _sum: { total: null } }),
    },
    cobro: {
      count: vi.fn().mockResolvedValue(0),
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue(COBRO_RESULT),
      aggregate: vi.fn().mockResolvedValue({ _count: { id: 0 }, _sum: { monto: null } }),
    },
    reparto: {
      findFirst: vi.fn().mockResolvedValue(null),
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

describe('computeScoreDelta', () => {
  it('returns 0 when no active invoice reference', () => {
    expect(computeScoreDelta(new Date('2026-05-15'), 30, null)).toBe(0)
  })

  it('returns +5 when payment is on time', () => {
    const facturaFecha = new Date('2026-04-01')
    const cobroFecha = new Date('2026-04-20')
    expect(computeScoreDelta(cobroFecha, 30, facturaFecha)).toBe(5)
  })

  it('returns +5 when payment is exactly on due date', () => {
    const facturaFecha = new Date('2026-04-01')
    const cobroFecha = new Date('2026-05-01')
    expect(computeScoreDelta(cobroFecha, 30, facturaFecha)).toBe(5)
  })

  it('returns -3 for 1–10 days late', () => {
    const facturaFecha = new Date('2026-04-01')
    const cobroFecha = new Date('2026-05-06')
    expect(computeScoreDelta(cobroFecha, 30, facturaFecha)).toBe(-3)
  })

  it('returns -7 for 11–30 days late', () => {
    const facturaFecha = new Date('2026-04-01')
    const cobroFecha = new Date('2026-05-20')
    expect(computeScoreDelta(cobroFecha, 30, facturaFecha)).toBe(-7)
  })

  it('returns -15 for more than 30 days late', () => {
    const facturaFecha = new Date('2026-01-01')
    const cobroFecha = new Date('2026-05-15')
    expect(computeScoreDelta(cobroFecha, 30, facturaFecha)).toBe(-15)
  })
})

describe('computeScoreAfterCobro', () => {
  it('keeps score when no open invoices', () => {
    expect(computeScoreAfterCobro(50, new Date('2026-05-15'), 30, null)).toBe(50)
  })

  it('adds 5 when payment is on time', () => {
    const facturaFecha = new Date('2026-04-01')
    const cobroFecha = new Date('2026-04-20')
    expect(computeScoreAfterCobro(50, cobroFecha, 30, facturaFecha)).toBe(55)
  })

  it('subtracts 15 when payment is severely late', () => {
    const facturaFecha = new Date('2026-01-01')
    const cobroFecha = new Date('2026-05-15')
    expect(computeScoreAfterCobro(50, cobroFecha, 30, facturaFecha)).toBe(35)
  })

  it('clamps score at 100', () => {
    expect(computeScoreAfterCobro(98, new Date('2026-05-15'), 0, new Date('2026-05-15'))).toBe(100)
  })

  it('clamps score at 0', () => {
    const facturaFecha = new Date('2020-01-01')
    expect(computeScoreAfterCobro(5, new Date('2026-05-15'), 0, facturaFecha)).toBe(0)
  })
})

describe('computeScoreChange', () => {
  it('exposes before, after and delta', () => {
    expect(computeScoreChange(50, new Date('2026-05-15'), 30, null)).toEqual({
      scoreBefore: 50,
      scoreAfter: 50,
      delta: 0,
    })
  })
})

describe('POST /api/cobros', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'billing'
  })

  it('returns 422 CLIENT_SUSPENDED when cliente is suspended', async () => {
    const suspended = { ...CLIENTE_BASE, suspended: true }
    const prisma = buildPrismaMock({
      cliente: {
        findFirst: vi.fn().mockResolvedValue(suspended),
        findMany: vi.fn(),
        update: vi.fn(),
      },
    })
    const app = createApp(prisma)
    const res = await request(app).post('/api/cobros').send(COBRO_BODY).expect(422)
    expect(res.body).toEqual({ success: false, error: 'CLIENT_SUSPENDED' })
    expect((prisma.cobro.create as ReturnType<typeof vi.fn>)).not.toHaveBeenCalled()
  })

  it('returns 400 for invalid monto', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app).post('/api/cobros').send({ ...COBRO_BODY, monto: 0 }).expect(400)
    expect(res.body.success).toBe(false)
  })

  it('creates cobro linked to new cheque in portfolio (#231)', async () => {
    const chequeCreate = vi.fn().mockResolvedValue({ id: 99 })
    const chequeMovCreate = vi.fn().mockResolvedValue({ id: 1 })
    const cobroCreate = vi.fn().mockResolvedValue({ ...COBRO_RESULT, chequeId: 99 })
    const txPrisma = createCcTxLayer({
      cobro: { create: cobroCreate },
      cheque: { create: chequeCreate },
      chequeMov: { create: chequeMovCreate },
    }) as unknown as PrismaClient
    const prisma = buildPrismaMock({
      $transaction: vi.fn(async (fn: unknown) => {
        if (typeof fn === 'function') return fn(txPrisma)
        return fn
      }),
    })
    const app = createApp(prisma)
    const res = await request(app)
      .post('/api/cobros')
      .send({
        ...COBRO_BODY,
        chequeNuevo: {
          tipo: 'recibido',
          modalidad: 'fisico',
          numero: '123456',
          banco: 'Galicia',
          libradorNombre: 'ACME SA',
          monto: 250.5,
          fechaEmision: '2026-05-15',
          fechaVencimiento: '2026-06-15',
        },
      })
      .expect(200)
    expect(res.body.success).toBe(true)
    expect(chequeCreate).toHaveBeenCalled()
    expect(chequeMovCreate).toHaveBeenCalled()
    expect(cobroCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ chequeId: 99 }),
      }),
    )
  })

  it('registers cobro, writes audit with score metadata, returns updatedCliente', async () => {
    const clienteUpdate = vi.fn().mockResolvedValue({
      id: 1,
      rsocial: 'ACME SA',
      balance: '749.50',
      creditLimit: null,
      score: 50,
    })
    const cobroCreate = vi.fn().mockResolvedValue(COBRO_RESULT)
    const txPrisma = createCcTxLayer({
      cliente: extendClientePrismaForCc({
        findFirst: vi.fn().mockResolvedValue(CLIENTE_BASE),
        update: clienteUpdate,
      }),
      cobro: { create: cobroCreate },
    }) as unknown as PrismaClient
    const prisma = buildPrismaMock({
      $transaction: vi.fn(async (fn: unknown) => {
        if (typeof fn === 'function') return fn(txPrisma)
        return fn
      }),
    })
    const app = createApp(prisma)
    const res = await request(app).post('/api/cobros').send(COBRO_BODY).expect(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.cobro.id).toBe(10)
    expect(res.body.data.updatedCliente.score).toBe(50)
    expect(prisma.auditEvent.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          metadata: expect.objectContaining({
            scoreBefore: 50,
            scoreAfter: 50,
            delta: 0,
          }),
        }),
      }),
    )
    expect(clienteUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.not.objectContaining({ score: expect.anything() }),
      }),
    )
  })

  it('updates score when active invoice exists', async () => {
    const facturaFecha = new Date('2026-04-01')
    const clienteUpdate = vi.fn().mockResolvedValue({
      id: 1,
      rsocial: 'ACME SA',
      balance: '749.50',
      creditLimit: null,
      score: 55,
    })
    const cobroCreate = vi.fn().mockResolvedValue(COBRO_RESULT)
    const txPrisma = createCcTxLayer({
      cliente: extendClientePrismaForCc({
        findFirst: vi.fn().mockResolvedValue(CLIENTE_BASE),
        update: clienteUpdate,
      }),
      cobro: { create: cobroCreate },
    }) as unknown as PrismaClient
    const prisma = buildPrismaMock({
      factura: {
        findFirst: vi.fn().mockResolvedValue({ fecha: facturaFecha }),
        findMany: vi.fn(),
        aggregate: vi.fn(),
      },
      $transaction: vi.fn(async (fn: unknown) => {
        if (typeof fn === 'function') return fn(txPrisma)
        return fn
      }),
    })
    const app = createApp(prisma)
    const res = await request(app)
      .post('/api/cobros')
      .send({ ...COBRO_BODY, fecha: '2026-04-20' })
      .expect(200)
    expect(res.body.data.updatedCliente.score).toBe(55)
    expect(clienteUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          score: 55,
        }),
      }),
    )
    expect(prisma.auditEvent.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          metadata: expect.objectContaining({ delta: 5 }),
        }),
      }),
    )
  })

  it('returns 403 for collections role without sales.create', async () => {
    process.env.BIZCODE_TEST_ROLE = 'collections'
    const app = createApp(buildPrismaMock())
    await request(app).post('/api/cobros').send(COBRO_BODY).expect(403)
    delete process.env.BIZCODE_TEST_ROLE
  })
})

const MINE_REPARTO = {
  id: 1,
  tenantId: 1,
  choferId: 5,
  estado: 'on_route',
  fecha: new Date(),
  chofer: { id: 5, username: 'driver1', role: 'driver' },
  items: [
    {
      id: 10,
      secuencia: 1,
      estado: 'pending',
      ordenEntrega: {
        clienteId: 1,
        cliente: {
          id: 1,
          codigo: 1001,
          rsocial: 'ACME SA',
          domicilio: null,
          localidad: null,
          telef: null,
          latitud: null,
          longitud: null,
          balance: '1000.00',
        },
        zona: null,
        factura: null,
        items: [],
      },
    },
  ],
}

function driverCreatePrisma() {
  const clienteUpdate = vi.fn().mockResolvedValue({
    id: 1,
    rsocial: 'ACME SA',
    balance: '749.50',
    creditLimit: null,
    score: 50,
  })
  const cobroCreate = vi.fn().mockResolvedValue(COBRO_RESULT)
  const txPrisma = createCcTxLayer({
    cliente: extendClientePrismaForCc({
      findFirst: vi.fn().mockResolvedValue(CLIENTE_BASE),
      update: clienteUpdate,
    }),
    cobro: { create: cobroCreate },
  }) as unknown as PrismaClient
  return buildPrismaMock({
    reparto: { findFirst: vi.fn().mockResolvedValue(MINE_REPARTO) },
    $transaction: vi.fn(async (fn: unknown) => {
      if (typeof fn === 'function') return fn(txPrisma)
      return fn
    }),
  })
}

describe('POST /api/cobros App Driver scope (#162)', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'driver'
    process.env.BIZCODE_TEST_USER_ID = '5'
  })

  it('returns 403 without field channel', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app).post('/api/cobros').send(COBRO_BODY).expect(403)
    expect(res.body.error).toBe('FIELD_CHANNEL_REQUIRED')
  })

  it('returns 422 CLIENTE_NOT_ON_ROUTE when the customer is not on mi-reparto', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app)
      .post('/api/cobros')
      .set('x-bizcode-channel', 'field')
      .send(COBRO_BODY)
      .expect(422)
    expect(res.body.error).toBe('CLIENTE_NOT_ON_ROUTE')
  })

  it('returns 422 DRIVER_RETENCIONES_NOT_ALLOWED when the driver sends retenciones', async () => {
    const prisma = buildPrismaMock({
      reparto: { findFirst: vi.fn().mockResolvedValue(MINE_REPARTO) },
    })
    const app = createApp(prisma)
    const res = await request(app)
      .post('/api/cobros')
      .set('x-bizcode-channel', 'field')
      .send({
        ...COBRO_BODY,
        retenciones: [
          { regimenId: 1, baseImponible: 100, alicuota: 3, importe: 3 },
        ],
      })
      .expect(422)
    expect(res.body.error).toBe('DRIVER_RETENCIONES_NOT_ALLOWED')
  })

  it('creates cobro when the customer is on the driver route and channel is field', async () => {
    const prisma = driverCreatePrisma()
    const app = createApp(prisma)
    const res = await request(app)
      .post('/api/cobros')
      .set('x-bizcode-channel', 'field')
      .send(COBRO_BODY)
      .expect(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.cobro.id).toBe(10)
  })
})

describe('GET /api/cobros/transfer-info (#162)', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'driver'
    process.env.BIZCODE_TEST_USER_ID = '5'
  })

  it('returns 403 without field channel', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/cobros/transfer-info').expect(403)
    expect(res.body.error).toBe('FIELD_CHANNEL_REQUIRED')
  })

  it('returns 403 without orders.deliver.confirm', async () => {
    process.env.BIZCODE_TEST_ROLE = 'billing'
    const app = createApp(buildPrismaMock())
    await request(app).get('/api/cobros/transfer-info').set('x-bizcode-channel', 'field').expect(403)
  })

  it('returns data null when the tenant has no active bank account', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app)
      .get('/api/cobros/transfer-info')
      .set('x-bizcode-channel', 'field')
      .expect(200)
    expect(res.body).toEqual({ success: true, data: null })
  })

  it('returns banco/cbu/alias of the first active account', async () => {
    const prisma = buildPrismaMock({
      cuentaBancaria: {
        findFirst: vi.fn().mockResolvedValue({ banco: 'Galicia', cbu: '1234567890123456789012', alias: 'biz.gal' }),
      },
    })
    const app = createApp(prisma)
    const res = await request(app)
      .get('/api/cobros/transfer-info')
      .set('x-bizcode-channel', 'field')
      .expect(200)
    expect(res.body.data).toEqual({ banco: 'Galicia', cbu: '1234567890123456789012', alias: 'biz.gal' })
  })
})

describe('GET /api/formas-pago App Driver (#162)', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'driver'
  })

  it('lists formas de pago with orders.deliver.confirm', async () => {
    const prisma = buildPrismaMock({
      formaPago: {
        findMany: vi.fn().mockResolvedValue([{ id: 1, codigo: 1, descripcion: 'Efectivo', esEfectivo: true }]),
        findUnique: vi.fn(),
      },
    })
    const app = createApp(prisma)
    const res = await request(app).get('/api/formas-pago').set('x-bizcode-channel', 'field').expect(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toHaveLength(1)
  })

  it('returns 403 for collections without sales.create or orders.deliver.confirm', async () => {
    process.env.BIZCODE_TEST_ROLE = 'collections'
    const app = createApp(buildPrismaMock())
    await request(app).get('/api/formas-pago').expect(403)
  })
})

describe('GET /api/cobros', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'collections'
  })

  it('returns paginated list', async () => {
    const prisma = buildPrismaMock({
      cobro: {
        count: vi.fn().mockResolvedValue(1),
        findMany: vi.fn().mockResolvedValue([COBRO_RESULT]),
      },
    })
    const app = createApp(prisma)
    const res = await request(app).get('/api/cobros?clienteId=1').expect(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toHaveLength(1)
    expect(res.body.total).toBe(1)
  })
})

describe('GET /api/cobros/:id', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'collections'
  })

  it('returns 404 when not found', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/cobros/999').expect(404)
    expect(res.body.error).toBe('Cobro not found')
  })

  it('returns cobro detail', async () => {
    const prisma = buildPrismaMock({
      cobro: { findFirst: vi.fn().mockResolvedValue(COBRO_RESULT) },
    })
    const app = createApp(prisma)
    const res = await request(app).get('/api/cobros/10').expect(200)
    expect(res.body.data.id).toBe(10)
  })
})
