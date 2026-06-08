/**
 * @en Mutation â†’ AuditEvent.action matrix verification (issue #84). Each successful persistence path must emit an audit row.
 * @es VerificaciÃ³n matriz mutaciÃ³n â†’ AuditEvent.action (#84).
 * @pt-BR VerificaÃ§Ã£o mutaÃ§Ã£o â†’ AuditEvent.action (#84).
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
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
  estadoCae: 'pending',
  tipo: 'B',
}

const ORDEN_ENTREGA_ROW = {
  id: 1,
  tenantId: 1,
  facturaId: null,
  clienteId: 1,
  zonaId: 10,
  driverId: null,
  pickerUserId: null,
  pickingIniciadoAt: null,
  pickingListoAt: null,
  fecha: new Date('2026-05-16T12:00:00.000Z'),
  estado: 'pending',
  nota: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  cliente: { id: 1, codigo: 1001, rsocial: 'ACME SA' },
  zona: { id: 10, nombre: 'Norte', horario: null },
  driver: null,
  picker: null,
  factura: null,
}

const REPARTO_ROW = {
  id: 1,
  tenantId: 1,
  fecha: new Date('2026-05-20'),
  choferId: 2,
  estado: 'planned',
  vehiculo: null,
  observaciones: null,
  closedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  chofer: { id: 2, username: 'driver1', role: 'driver' },
  items: [],
  progress: { total: 0, delivered: 0, pending: 0 },
}

const TEST_FIRMA =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='

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
    findFirst: vi.fn().mockResolvedValue({ id: 5, tenantId: 1 }),
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
  prisma.proveedorArticulo = {
    findMany: vi.fn().mockResolvedValue([]),
    findFirst: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockResolvedValue({
      id: 11,
      articuloId: 2,
      codigoProveedor: 'CAT-1',
      descripcion: null,
      precioLista: new Decimal(100),
      precioListaFecha: new Date(),
      unidadCompra: null,
      multiplo: new Decimal(1),
      activo: true,
      articulo: { id: 2, codigo: 100, descripcion: 'Art' },
    }),
    update: vi.fn().mockResolvedValue({
      id: 11,
      articuloId: 2,
      codigoProveedor: 'CAT-1',
      descripcion: null,
      precioLista: new Decimal(110),
      precioListaFecha: new Date(),
      unidadCompra: null,
      multiplo: new Decimal(1),
      activo: true,
      articulo: { id: 2, codigo: 100, descripcion: 'Art' },
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
  prisma.recuento = { findFirst: vi.fn().mockResolvedValue(null) }
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
  prisma.ordenEntrega = {
    count: vi.fn().mockResolvedValue(0),
    findMany: vi.fn().mockResolvedValue([]),
    findFirst: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockResolvedValue({ ...ORDEN_ENTREGA_ROW, id: 1 }),
    update: vi.fn().mockResolvedValue(ORDEN_ENTREGA_ROW),
    updateMany: vi.fn().mockResolvedValue({ count: 0 }),
  }
  prisma.reparto = {
    count: vi.fn().mockResolvedValue(0),
    findMany: vi.fn().mockResolvedValue([]),
    findFirst: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockResolvedValue(REPARTO_ROW),
    update: vi.fn().mockResolvedValue(REPARTO_ROW),
  }
  prisma.repartoItem = {
    findFirst: vi.fn().mockResolvedValue(null),
    update: vi.fn(),
    updateMany: vi.fn().mockResolvedValue({ count: 0 }),
  }
  prisma.repartoUbicacion = {
    create: vi.fn().mockResolvedValue({
      lat: { toString: () => '-34.6' },
      lng: { toString: () => '-58.4' },
      recordedAt: new Date('2026-05-26T12:00:00.000Z'),
    }),
    deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
    findFirst: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
  }
  prisma.cobro = {
    count: vi.fn().mockResolvedValue(0),
    findMany: vi.fn().mockResolvedValue([]),
    findFirst: vi.fn().mockResolvedValue(null),
    create: vi.fn(),
    aggregate: vi.fn().mockResolvedValue({ _count: { id: 0 }, _sum: { monto: null } }),
  }
  prisma.ordenCompra = {
    count: vi.fn().mockResolvedValue(0),
    findMany: vi.fn().mockResolvedValue([]),
    findFirst: vi.fn().mockResolvedValue(null),
  }

  prisma.notaCredito = {
    create: vi.fn().mockResolvedValue({
      id: 50,
      tenantId: 1,
      facturaOrigenId: 7,
      motivo: 'Devolución',
      monto: 100,
      estadoCae: 'not_required',
      cae: null,
      caeVto: null,
      createdById: null,
      createdAt: new Date(),
    }),
    findFirst: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    count: vi.fn().mockResolvedValue(0),
    update: vi.fn(),
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

  it('POST /api/clientes â†’ cliente_create', async () => {
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

  it('PUT /api/clientes/:id â†’ cliente_update', async () => {
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

  it('POST /api/articulos â†’ articulo_create', async () => {
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

  it('PUT /api/articulos/:id â†’ articulo_update', async () => {
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

  it('POST /api/rubros â†’ rubro_create', async () => {
    const { prisma, auditCreate } = basePrismaForMutations()
    const app = createApp(prisma)

    await request(app).post('/api/rubros').send({ codigo: 900, nombre: 'RubAudit' }).expect(200)

    expect(auditCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ action: 'rubro_create', resource: 'rubro' }),
      }),
    )
  })

  it('POST /api/proveedores â†’ proveedor_create', async () => {
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

  it('PUT /api/proveedores/:id â†’ proveedor_update', async () => {
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

  it('POST /api/proveedores/:id/catalogo → proveedor_catalogo_create', async () => {
    const { prisma, auditCreate } = basePrismaForMutations()
    const app = createApp(prisma)

    await request(app)
      .post('/api/proveedores/5/catalogo')
      .send({ articuloId: 2, codigoProveedor: 'CAT-1', precioLista: 100 })
      .expect(201)

    expect(auditCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: 'proveedor_catalogo_create',
          resource: 'proveedor_articulo',
          resourceId: '11',
        }),
      }),
    )
  })

  it('PUT /api/proveedores/:id/catalogo/:articuloId → proveedor_catalogo_update', async () => {
    const { prisma, auditCreate } = basePrismaForMutations()
    vi.mocked(prisma.proveedorArticulo.findFirst).mockResolvedValue({ id: 11, tenantId: 1, proveedorId: 5, articuloId: 2 } as never)

    const app = createApp(prisma)

    await request(app)
      .put('/api/proveedores/5/catalogo/2')
      .send({ precioLista: 110 })
      .expect(200)

    expect(auditCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: 'proveedor_catalogo_update',
          resource: 'proveedor_articulo',
          resourceId: '11',
        }),
      }),
    )
  })

  it('POST /api/facturas â†’ factura_create', async () => {
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

  it('PUT /api/facturas/:id/void -> factura_void', async () => {
    const { prisma, auditCreate } = basePrismaForMutations()

    vi.mocked(prisma.factura.findFirst).mockResolvedValue(FACTURA_VOID_ROW as never)
    vi.mocked(prisma.factura.update).mockResolvedValue({ ...FACTURA_VOID_ROW, estado: 'N' } as never)

    const app = createApp(prisma)

    await request(app).put('/api/facturas/7/void').send({ motivo: 'Devolucion total' }).expect(200)

    expect(auditCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: 'factura_void',
          resource: 'factura',
          resourceId: '7',
          metadata: expect.objectContaining({ motivo: 'Devolucion total', notaCreditoId: 50 }),
        }),
      }),
    )
  })

  it('POST /api/zonas-entrega â†’ delivery_zone_create', async () => {
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

  it('PUT /api/zonas-entrega/:id â†’ delivery_zone_update', async () => {
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

  it('POST /api/ordenes-entrega/:id/iniciar-picking â†’ orden_entrega_picking_start', async () => {
    const { prisma, auditCreate } = basePrismaForMutations()
    process.env.BIZCODE_TEST_ROLE = 'warehouse_op'
    process.env.BIZCODE_TEST_USER_ID = '7'

    vi.mocked(prisma.ordenEntrega.findFirst).mockResolvedValue({
      ...ORDEN_ENTREGA_ROW,
      estado: 'pending',
      driverId: null,
    } as never)
    vi.mocked(prisma.ordenEntrega.update).mockResolvedValue({
      ...ORDEN_ENTREGA_ROW,
      estado: 'picking',
      pickerUserId: 7,
      pickingIniciadoAt: new Date(),
      picker: { id: 7, username: 'wh1', role: 'warehouse_op' },
    } as never)

    const app = createApp(prisma)
    await request(app).post('/api/ordenes-entrega/1/iniciar-picking').expect(200)

    expect(auditCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: 'orden_entrega_picking_start',
          resource: 'orden_entrega',
          resourceId: '1',
        }),
      }),
    )
  })

  it('POST /api/ordenes-entrega/:id/lista â†’ orden_entrega_picking_ready', async () => {
    const { prisma, auditCreate } = basePrismaForMutations()
    process.env.BIZCODE_TEST_ROLE = 'warehouse_op'
    process.env.BIZCODE_TEST_USER_ID = '7'

    vi.mocked(prisma.ordenEntrega.findFirst).mockResolvedValue({
      ...ORDEN_ENTREGA_ROW,
      estado: 'picking',
      pickerUserId: 7,
      driverId: null,
    } as never)
    vi.mocked(prisma.ordenEntrega.update).mockResolvedValue({
      ...ORDEN_ENTREGA_ROW,
      estado: 'ready',
      pickerUserId: 7,
      pickingListoAt: new Date(),
    } as never)

    const app = createApp(prisma)
    await request(app).post('/api/ordenes-entrega/1/lista').expect(200)

    expect(auditCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: 'orden_entrega_picking_ready',
          resource: 'orden_entrega',
          resourceId: '1',
        }),
      }),
    )
  })

  it('POST /api/repartos â†’ reparto_created', async () => {
    const { prisma, auditCreate } = basePrismaForMutations()
    process.env.BIZCODE_TEST_ROLE = 'logistics_planner'

    vi.mocked(prisma.appUser.findFirst).mockResolvedValue({ id: 2 } as never)
    vi.mocked(prisma.ordenEntrega.findMany).mockResolvedValue([
      { id: 5, estado: 'ready', fecha: new Date('2026-05-20') },
    ] as never)
    vi.mocked(prisma.repartoItem.findFirst).mockResolvedValue(null)
    vi.mocked(prisma.reparto.create).mockResolvedValue({ ...REPARTO_ROW, id: 1 } as never)

    const app = createApp(prisma)
    await request(app)
      .post('/api/repartos')
      .send({ fecha: '2026-05-20', choferId: 2, ordenEntregaIds: [5] })
      .expect(201)

    expect(auditCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ action: 'reparto_created', resource: 'reparto', resourceId: '1' }),
      }),
    )
  })

  it('POST /api/repartos/:id/iniciar â†’ reparto_started', async () => {
    const { prisma, auditCreate } = basePrismaForMutations()
    process.env.BIZCODE_TEST_ROLE = 'logistics_planner'

    vi.mocked(prisma.reparto.findFirst)
      .mockResolvedValueOnce({
        ...REPARTO_ROW,
        items: [{ id: 10, ordenEntregaId: 5, estado: 'pending' }],
      } as never)
      .mockResolvedValueOnce({ ...REPARTO_ROW, estado: 'on_route' } as never)
    vi.mocked(prisma.reparto.update).mockResolvedValue({ ...REPARTO_ROW, estado: 'on_route' } as never)

    const app = createApp(prisma)
    await request(app).post('/api/repartos/1/iniciar').expect(200)

    expect(auditCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ action: 'reparto_started', resource: 'reparto', resourceId: '1' }),
      }),
    )
  })

  it('POST /api/repartos/:id/cerrar â†’ reparto_closed', async () => {
    const { prisma, auditCreate } = basePrismaForMutations()
    process.env.BIZCODE_TEST_ROLE = 'logistics_planner'

    const items = [
      { id: 10, ordenEntregaId: 5, estado: 'delivered' },
      { id: 11, ordenEntregaId: 6, estado: 'pending' },
    ]
    vi.mocked(prisma.reparto.findFirst).mockResolvedValue({
      ...REPARTO_ROW,
      estado: 'on_route',
      items,
    } as never)
    vi.mocked(prisma.reparto.update).mockResolvedValue({
      ...REPARTO_ROW,
      estado: 'completed',
      closedAt: new Date(),
      items: [
        { ...items[0], estado: 'delivered' },
        { ...items[1], estado: 'not_delivered' },
      ],
      chofer: REPARTO_ROW.chofer,
    } as never)

    const app = createApp(prisma)
    await request(app).post('/api/repartos/1/cerrar').expect(200)

    expect(auditCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ action: 'reparto_closed', resource: 'reparto', resourceId: '1' }),
      }),
    )
  })

  it('POST /api/repartos/:id/ubicacion â†’ reparto_ubicacion_recorded', async () => {
    const { prisma, auditCreate } = basePrismaForMutations()
    process.env.BIZCODE_TEST_ROLE = 'driver'
    process.env.BIZCODE_TEST_USER_ID = '2'

    vi.mocked(prisma.reparto.findFirst).mockResolvedValue({
      id: 1,
      choferId: 2,
      estado: 'on_route',
      tenantId: 1,
    } as never)

    const app = createApp(prisma)
    await request(app).post('/api/repartos/1/ubicacion').send({ lat: -34.6, lng: -58.4 }).expect(200)

    expect(auditCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: 'reparto_ubicacion_recorded',
          resource: 'reparto',
          resourceId: '1',
        }),
      }),
    )
  })

  it('PUT /api/repartos/:id/items/:itemId â†’ reparto_item_pod_signed', async () => {
    const { prisma, auditCreate } = basePrismaForMutations()
    process.env.BIZCODE_TEST_ROLE = 'driver'
    process.env.BIZCODE_TEST_USER_ID = '2'

    const itemBase = {
      id: 10,
      repartoId: 1,
      ordenEntregaId: 5,
      secuencia: 1,
      estado: 'pending',
      entregadoAt: null,
      motivoNoEntrega: null,
      receptorNombre: null,
      receptorDni: null,
      notasEntrega: null,
      podMedia: null,
      ordenEntrega: {
        id: 5,
        tenantId: 1,
        clienteId: 1,
        estado: 'in_transit',
        fecha: new Date(),
        cliente: { id: 1, codigo: 1, rsocial: 'Cliente' },
        zona: null,
        factura: null,
      },
    }

    vi.mocked(prisma.reparto.findFirst).mockResolvedValue({
      id: 1,
      estado: 'on_route',
      choferId: 2,
      tenantId: 1,
    } as never)
    vi.mocked(prisma.repartoItem.findFirst).mockResolvedValue(itemBase as never)
    vi.mocked(prisma.repartoItem.update).mockResolvedValue({
      ...itemBase,
      estado: 'delivered',
      entregadoAt: new Date(),
      receptorNombre: 'Ana',
      podMedia: { firmaBase64: TEST_FIRMA },
    } as never)
    vi.mocked(prisma.ordenEntrega.update).mockResolvedValue({} as never)

    const app = createApp(prisma)
    await request(app)
      .put('/api/repartos/1/items/10')
      .send({ outcome: 'delivered', receptorNombre: 'Ana', firmaBase64: TEST_FIRMA })
      .expect(200)

    expect(auditCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: 'reparto_item_pod_signed',
          resource: 'reparto_item',
          resourceId: '10',
        }),
      }),
    )
  })
})
