/**
 * @en Mutation → AuditEvent.action matrix verification (issue #84). Each successful persistence path must emit an audit row.
 * @es Verificación matriz mutación → AuditEvent.action (#84).
 * @pt-BR Verificação mutação → AuditEvent.action (#84).
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { createApp } from '../../server/createApp'

const CLIENTE_ROW = {
  id: 1,
  tenantId: 1,
  codigo: 501,
  rsocial: 'Cliente Audit SA',
  fantasia: null,
  cuit: null,
  condIva: 'RI',
  domicilio: null,
  localidad: null,
  cpost: null,
  telef: null,
  email: null,
  formaPago: null,
  activo: true,
  creditLimit: null,
  creditDays: 0,
  balance: '0',
  balanceInicial: '0',
  score: 50,
  suspended: false,
  deliveryZoneId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
}

const ARTICULO_ROW = {
  id: 2,
  tenantId: 1,
  codigo: 802,
  descripcion: 'Producto Audit',
  rubroId: 3,
  condIva: '1',
  umedida: 'UN',
  precioLista1: '10.00',
  precioLista2: '10.00',
  costo: '5.00',
  stock: 1,
  minimo: 0,
  activo: true,
  createdAt: new Date(),
  updatedAt: new Date(),
}

const RUBRO_ROW = {
  id: 3,
  tenantId: 1,
  codigo: 1,
  nombre: 'General',
}

const FACTURA_VOID_ROW = {
  id: 7,
  estado: 'A',
  total: 100,
  clienteId: 1,
}

function auditCreateMock() {
  return vi.fn().mockResolvedValue({ id: 999 })
}

function basePrismaForMutations(): {
  prisma: PrismaClient
  auditCreate: ReturnType<typeof auditCreateMock>
} {
  const auditCreate = auditCreateMock()
  type Tx = Record<string, unknown>

  const prisma: Tx & { $transaction: (fn: (tx: Tx) => Promise<unknown>) => Promise<unknown> } = {} as Tx & {
    $transaction: (fn: (tx: Tx) => Promise<unknown>) => Promise<unknown>
  }

  prisma.deliveryZone = {
    findMany: vi.fn().mockResolvedValue([]),
    findFirst: vi.fn().mockResolvedValue({ id: 1, nombre: 'Z', tipo: 'barrio', diasEntrega: null, horario: null }),
    create: vi.fn().mockResolvedValue({ id: 10, nombre: 'Zona Sur', tipo: 'manual', diasEntrega: null, horario: null }),
    update: vi.fn().mockResolvedValue({ id: 10, nombre: 'Zona Upd', tipo: 'manual', diasEntrega: null, horario: null }),
  }
  prisma.cliente = {
    findMany: vi.fn().mockResolvedValue([]),
    findFirst: vi.fn().mockResolvedValue({ ...CLIENTE_ROW, suspended: false }),
    findUnique: vi.fn().mockResolvedValue(CLIENTE_ROW),
    create: vi.fn().mockResolvedValue(CLIENTE_ROW),
    update: vi.fn().mockResolvedValue(CLIENTE_ROW),
  }
  prisma.articulo = {
    findMany: vi.fn().mockResolvedValue([{ id: 2 }]),
    findFirst: vi.fn().mockResolvedValue(ARTICULO_ROW),
    create: vi.fn().mockResolvedValue(ARTICULO_ROW),
    update: vi.fn().mockResolvedValue(ARTICULO_ROW),
  }
  prisma.rubro = {
    findMany: vi.fn().mockResolvedValue([RUBRO_ROW]),
    findFirst: vi.fn().mockResolvedValue(RUBRO_ROW),
    create: vi.fn().mockResolvedValue(RUBRO_ROW),
  }
  prisma.formaPago = { findMany: vi.fn().mockResolvedValue([]) }
  prisma.proveedor = {
    findMany: vi.fn().mockResolvedValue([]),
    findFirst: vi.fn().mockResolvedValue(null),
    findUnique: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockResolvedValue({ id: 5, codigo: 4001, rsocial: 'P', condIva: 'RI', activo: true }),
    update: vi.fn().mockResolvedValue({
      id: 5,
      codigo: 4001,
      rsocial: 'Proveedor Audit SA',
      condIva: 'RI',
      activo: true,
    }),
  }
  const facturaCreated = {
    id: 99,
    tenantId: 1,
    clienteId: 1,
    fecha: new Date(),
    tipo: 'B',
    prefijo: '0001',
    numero: 42,
    estado: 'A',
    total: '100',
    neto1: '82.65',
    neto2: '0',
    neto3: '0',
    iva1: '17.35',
    iva2: '0',
    formaPagoId: null,
    cliente: CLIENTE_ROW,
    items: [{ id: 1, articuloId: 2, cantidad: 1, precio: '100', dscto: '0', subtotal: '100' }],
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  prisma.factura = {
    findMany: vi.fn().mockResolvedValue([]),
    findFirst: vi.fn().mockResolvedValue(FACTURA_VOID_ROW),
    create: vi.fn().mockResolvedValue({
      ...facturaCreated,
      include: undefined,
    }),
    update: vi.fn().mockResolvedValue({ ...FACTURA_VOID_ROW, estado: 'N' }),
    aggregate: vi.fn().mockResolvedValue({ _count: { id: 0 }, _sum: { total: null } }),
  }
  prisma.facturaItem = { deleteMany: vi.fn().mockResolvedValue({ count: 0 }), createMany: vi.fn().mockResolvedValue({ count: 1 }) }
  prisma.notification = {
    findMany: vi.fn().mockResolvedValue([]),
    findFirst: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockResolvedValue({ id: 1 }),
    createMany: vi.fn().mockResolvedValue({ count: 0 }),
    update: vi.fn().mockResolvedValue(null),
    updateMany: vi.fn().mockResolvedValue({ count: 0 }),
  }
  prisma.auditEvent = { create: auditCreate }
  prisma.appUser = {
    count: vi.fn().mockResolvedValue(1),
    findMany: vi.fn().mockResolvedValue([]),
    findFirst: vi.fn().mockResolvedValue(null),
    findUnique: vi.fn().mockResolvedValue(null),
    create: vi.fn(),
    update: vi.fn(),
  }
  prisma.tenant = { findUnique: vi.fn().mockResolvedValue({ id: 1, slug: 'demo', active: true }) }
  prisma.appSession = {
    create: vi.fn().mockResolvedValue({ id: 1 }),
    findFirst: vi.fn().mockResolvedValue(null),
    updateMany: vi.fn().mockResolvedValue({ count: 1 }),
    update: vi.fn().mockResolvedValue({ id: 1 }),
  }

  prisma.$transaction = vi.fn(async (fn: (tx: Tx) => Promise<unknown>) =>
    fn(prisma as unknown as Tx),
  ) as typeof prisma.$transaction

  const facturaDelegate = prisma.factura as {
    create: ReturnType<typeof vi.fn>
  }
  facturaDelegate.create = vi.fn().mockResolvedValue({ ...facturaCreated, items: facturaCreated.items })

  prisma.cliente = {
    ...(prisma.cliente as Record<string, unknown>),
    update: vi
      .fn()
      .mockResolvedValue({
        id: 1,
        rsocial: CLIENTE_ROW.rsocial,
        balance: '100',
        creditLimit: null,
      }),
  } as Tx['cliente']

  return { prisma: prisma as unknown as PrismaClient, auditCreate }
}

describe('HTTP mutations emit AuditEvent (coverage matrix)', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
  })

  it('POST /api/clientes → cliente_create', async () => {
    const { prisma, auditCreate } = basePrismaForMutations()
    const app = createApp(prisma)

    await request(app)
      .post('/api/clientes')
      .send({
        codigo: CLIENTE_ROW.codigo,
        rsocial: CLIENTE_ROW.rsocial,
        condIva: 'RI',
        activo: true,
      })
      .expect(200)

    expect(auditCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ action: 'cliente_create', resource: 'cliente' }),
      }),
    )
  })

  it('PUT /api/clientes/:id → cliente_update', async () => {
    const { prisma, auditCreate } = basePrismaForMutations()
    const app = createApp(prisma)

    await request(app)
      .put('/api/clientes/1')
      .send({
        codigo: CLIENTE_ROW.codigo,
        rsocial: 'Cliente Audit SA Actualizado',
        condIva: 'RI',
        activo: true,
      })
      .expect(200)

    expect(auditCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ action: 'cliente_update', resource: 'cliente', resourceId: '1' }),
      }),
    )
  })

  it('POST /api/articulos → articulo_create', async () => {
    const { prisma, auditCreate } = basePrismaForMutations()
    const app = createApp(prisma)

    await request(app)
      .post('/api/articulos')
      .send({
        codigo: 802,
        descripcion: 'Producto Audit',
        rubroId: 3,
        condIva: '1',
        umedida: 'UN',
        precioLista1: 10,
        precioLista2: 10,
        costo: 5,
        stock: 1,
        minimo: 0,
        activo: true,
      })
      .expect(200)

    expect(auditCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ action: 'articulo_create', resource: 'articulo' }),
      }),
    )
  })

  it('PUT /api/articulos/:id → articulo_update', async () => {
    const { prisma, auditCreate } = basePrismaForMutations()
    const app = createApp(prisma)

    await request(app)
      .put('/api/articulos/2')
      .send({
        codigo: 802,
        descripcion: 'Producto Audit Upd',
        rubroId: 3,
        condIva: '1',
        umedida: 'UN',
        precioLista1: 11,
        precioLista2: 11,
        costo: 6,
        stock: 2,
        minimo: 0,
        activo: true,
      })
      .expect(200)

    expect(auditCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ action: 'articulo_update', resource: 'articulo', resourceId: '2' }),
      }),
    )
  })

  it('POST /api/rubros → rubro_create', async () => {
    const { prisma, auditCreate } = basePrismaForMutations()
    const app = createApp(prisma)

    await request(app).post('/api/rubros').send({ codigo: 900, nombre: 'RubAudit' }).expect(200)

    expect(auditCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ action: 'rubro_create', resource: 'rubro' }),
      }),
    )
  })

  it('POST /api/proveedores → proveedor_create', async () => {
    const { prisma, auditCreate } = basePrismaForMutations()
    const app = createApp(prisma)

    await request(app)
      .post('/api/proveedores')
      .send({
        codigo: 4100,
        rsocial: 'Proveedor Nueva SA',
        condIva: 'RI',
        activo: true,
      })
      .expect(200)

    expect(auditCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ action: 'proveedor_create', resource: 'proveedor' }),
      }),
    )
  })

  it('PUT /api/proveedores/:id → proveedor_update', async () => {
    const { prisma, auditCreate } = basePrismaForMutations()
    vi.mocked(prisma.proveedor.findFirst).mockResolvedValue({
      id: 5,
      codigo: 4001,
      rsocial: 'Old',
      condIva: 'RI',
      activo: true,
      tenantId: 1,
    } as never)

    const app = createApp(prisma)

    await request(app)
      .put('/api/proveedores/5')
      .send({
        codigo: 4001,
        rsocial: 'Proveedor Audit SA',
        condIva: 'RI',
        activo: true,
      })
      .expect(200)

    expect(auditCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ action: 'proveedor_update', resource: 'proveedor', resourceId: '5' }),
      }),
    )
  })

  it('POST /api/facturas → factura_create', async () => {
    const { prisma, auditCreate } = basePrismaForMutations()

    vi.mocked(prisma.cliente.findFirst).mockResolvedValue({ ...CLIENTE_ROW, suspended: false } as never)

    const app = createApp(prisma)

    await request(app)
      .post('/api/facturas')
      .send({
        fecha: new Date().toISOString(),
        tipo: 'B',
        prefijo: '0001',
        numero: 42,
        clienteId: 1,
        neto1: 82.65,
        neto2: 0,
        neto3: 0,
        iva1: 17.35,
        iva2: 0,
        total: 100,
        items: [{ articuloId: 2, cantidad: 1, precio: 100, dscto: 0, subtotal: 100 }],
      })
      .expect(200)

    expect(auditCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ action: 'factura_create', resource: 'factura' }),
      }),
    )
  })

  it('PUT /api/facturas/:id/void → factura_void', async () => {
    const { prisma, auditCreate } = basePrismaForMutations()

    vi.mocked(prisma.factura.findFirst).mockResolvedValue(FACTURA_VOID_ROW as never)
    const runVoidTx = async () => {
      await prisma.factura.update({ where: { id: 7 }, data: { estado: 'N' } } as never)
      return { ...FACTURA_VOID_ROW, estado: 'N' }
    }
    vi.mocked(prisma.$transaction).mockImplementation(runVoidTx as never)

    const app = createApp(prisma)

    await request(app).put('/api/facturas/7/void').send({ motivo: 'Devolución' }).expect(200)

    expect(auditCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ action: 'factura_void', resource: 'factura', resourceId: '7' }),
      }),
    )
  })

  it('POST /api/zonas-entrega → delivery_zone_create', async () => {
    const { prisma, auditCreate } = basePrismaForMutations()
    process.env.BIZCODE_TEST_ROLE = 'logistics_planner'

    vi.mocked(prisma.deliveryZone.findFirst).mockResolvedValueOnce(null)

    const app = createApp(prisma)

    await request(app).post('/api/zonas-entrega').send({ nombre: 'Zona Sur', tipo: 'manual' }).expect(201)

    expect(auditCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ action: 'delivery_zone_create', resource: 'delivery_zone' }),
      }),
    )
  })

  it('PUT /api/zonas-entrega/:id → delivery_zone_update', async () => {
    const { prisma, auditCreate } = basePrismaForMutations()

    vi.mocked(prisma.deliveryZone.findFirst).mockResolvedValue({
      id: 10,
      tenantId: 1,
      nombre: 'Zona Sur',
      tipo: 'manual',
      diasEntrega: null,
      horario: null,
      activo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never)

    const app = createApp(prisma)

    await request(app).put('/api/zonas-entrega/10').send({ nombre: 'Zona Norte' }).expect(200)

    expect(auditCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ action: 'delivery_zone_update', resource: 'delivery_zone', resourceId: '10' }),
      }),
    )
  })
})
