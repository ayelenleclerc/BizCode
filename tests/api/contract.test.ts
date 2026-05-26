/** Contrato HTTP vs docs/api/openapi.yaml (Ajv + spec dereferenciado). Entorno: node (vitest.config). */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { createApp } from '../../server/createApp'
import { assertMatchesOpenApi } from './validate-openapi-response'

const rubroRow = { id: 1, codigo: 1, nombre: 'General' }

const clienteRow = {
  id: 1,
  codigo: 1,
  rsocial: 'ACME SA',
  fantasia: null,
  cuit: null,
  condIva: 'RI',
  domicilio: null,
  localidad: null,
  cpost: null,
  telef: null,
  email: null,
  activo: true,
}

const articuloRow = {
  id: 1,
  codigo: 1,
  descripcion: 'Producto',
  rubroId: 1,
  rubro: rubroRow,
  condIva: '1',
  umedida: 'U',
  precioLista1: 10,
  precioLista2: 10,
  costo: 5,
  stock: 0,
  minimo: 0,
  activo: true,
}

const formaPagoRow = { id: 1, codigo: 1, descripcion: 'Contado', vto_dias: 0 }

const proveedorRow = {
  id: 1,
  codigo: 5001,
  rsocial: 'Proveedor API SA',
  fantasia: null,
  cuit: null,
  condIva: 'RI',
  telef: null,
  email: null,
  activo: true,
}

const facturaRow = {
  id: 1,
  fecha: new Date('2025-01-15T12:00:00.000Z').toISOString(),
  tipo: 'A',
  prefijo: 'A',
  numero: 1,
  clienteId: 1,
  formaPagoId: null,
  neto1: 100,
  neto2: 0,
  neto3: 0,
  iva1: 21,
  iva2: 0,
  total: 121,
  estado: 'A',
  items: [] as unknown[],
}

const clienteInput = {
  codigo: 1,
  rsocial: 'ACME SA',
  condIva: 'RI',
  activo: true,
}

const articuloInput = {
  codigo: 1,
  descripcion: 'Producto',
  rubroId: 1,
  condIva: '1',
  umedida: 'UN',
  precioLista1: 10,
  precioLista2: 10,
  costo: 5,
  stock: 0,
  minimo: 0,
  activo: true,
}

const proveedorInput = {
  codigo: 5001,
  rsocial: 'Proveedor API SA',
  condIva: 'RI',
  activo: true,
}

const ordenCompraContractRow = {
  id: 1,
  tenantId: 1,
  proveedorId: 1,
  estado: 'draft',
  total: new Decimal(20),
  fechaEstimada: null,
  nota: null,
  proveedor: { id: 1, codigo: 1, rsocial: 'Prov' },
  items: [
    {
      id: 10,
      ordenCompraId: 1,
      articuloId: 1,
      cantidad: 2,
      cantidadRecibida: 0,
      costoUnitario: new Decimal(10),
      subtotal: new Decimal(20),
      articulo: { id: 1, codigo: 1, descripcion: 'Prod' },
    },
  ],
}

const repartoContractRow = {
  id: 1,
  tenantId: 1,
  fecha: new Date('2026-05-20T10:00:00.000Z'),
  choferId: 2,
  estado: 'planned',
  vehiculo: 'ABC123',
  observaciones: null,
  closedAt: null,
  createdAt: new Date('2026-05-20T10:00:00.000Z'),
  updatedAt: new Date('2026-05-20T10:00:00.000Z'),
  chofer: { id: 2, username: 'driver1', role: 'driver' },
  items: [
    {
      id: 10,
      ordenEntregaId: 1,
      secuencia: 1,
      estado: 'pending',
      entregadoAt: null,
      motivoNoEntrega: null,
      receptorNombre: null,
      receptorDni: null,
      notasEntrega: null,
      podMedia: null,
      ordenEntrega: {
        id: 1,
        tenantId: 1,
        clienteId: 1,
        zonaId: null,
        driverId: 2,
        facturaId: null,
        fecha: new Date('2026-05-20T10:00:00.000Z'),
        estado: 'assigned',
        nota: null,
        cliente: { id: 1, codigo: 1, rsocial: 'ACME SA' },
        zona: null,
        driver: { id: 2, username: 'driver1', role: 'driver' },
        factura: null,
      },
    },
  ],
  progress: { total: 1, delivered: 0, pending: 1 },
}

const recuentoContractRow = {
  id: 1,
  tenantId: 1,
  operadorId: 1,
  estado: 'in_progress',
  fecha: new Date('2026-05-20T10:00:00.000Z'),
  closedAt: null,
  createdAt: new Date('2026-05-20T10:00:00.000Z'),
  updatedAt: new Date('2026-05-20T10:00:00.000Z'),
  operador: { id: 1, username: 'owner1' },
  items: [
    {
      id: 10,
      recuentoId: 1,
      articuloId: 1,
      cantSistema: 5,
      cantFisica: null,
      articulo: { id: 1, codigo: 1, descripcion: 'Prod' },
    },
  ],
}

function buildPrisma(): PrismaClient {
  const facturaCreate = vi.fn().mockResolvedValue(facturaRow)
  // tx-level cliente.update: returns the financial summary the route uses for the credit check
  const txClienteUpdate = vi.fn().mockResolvedValue({ id: 1, rsocial: 'ACME SA', balance: 121, creditLimit: null })
  const clienteTxCreate = vi.fn().mockResolvedValue(clienteRow)
  const rubroTxCreate = vi.fn().mockResolvedValue(rubroRow)
  const articuloTxCreate = vi.fn().mockResolvedValue(articuloRow)
  const proveedorTxCreate = vi.fn().mockResolvedValue(proveedorRow)

  const p = {
    deliveryZone: { findFirst: vi.fn().mockResolvedValue(null) },
    cliente: {
      count: vi.fn().mockResolvedValue(1),
      findMany: vi.fn((args?: unknown) => {
        const w =
          args && typeof args === 'object' && args !== null && 'where' in args
            ? (args as { where?: { codigo?: { in?: number[] } } }).where
            : undefined
        if (w?.codigo && typeof w.codigo === 'object' && Array.isArray(w.codigo.in)) {
          return Promise.resolve([])
        }
        return Promise.resolve([clienteRow])
      }),
      findFirst: vi.fn().mockResolvedValue(clienteRow),
      findUnique: vi.fn().mockResolvedValue(clienteRow),
      create: vi.fn().mockResolvedValue(clienteRow),
      update: vi.fn().mockResolvedValue(clienteRow), // PUT /api/clientes/:id returns full row
    },
    articulo: {
      count: vi.fn().mockResolvedValue(1),
      findMany: vi.fn((args?: unknown) => {
        const w =
          args && typeof args === 'object' && args !== null && 'where' in args
            ? (args as {
                where?: { codigo?: { in?: number[] }; id?: { in?: number[] } }
              }).where
            : undefined
        if (w?.id && typeof w.id === 'object' && Array.isArray(w.id.in)) {
          if (w.id.in.length === 0) return Promise.resolve([])
          return Promise.resolve(w.id.in.map((id: number) => ({ id })))
        }
        if (w?.codigo && typeof w.codigo === 'object' && Array.isArray(w.codigo.in)) {
          return Promise.resolve([])
        }
        return Promise.resolve([articuloRow])
      }),
      findFirst: vi.fn().mockResolvedValue(articuloRow),
      findUnique: vi.fn().mockResolvedValue(articuloRow),
      create: vi.fn().mockResolvedValue(articuloRow),
      update: vi.fn().mockResolvedValue(articuloRow),
      upsert: vi.fn().mockResolvedValue(articuloRow),
    },
    stockAjuste: {
      count: vi.fn().mockResolvedValue(0),
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn().mockResolvedValue({
        id: 1,
        cantidad: -1,
        motivo: 'Test',
        createdAt: new Date('2026-05-18T12:00:00.000Z'),
        user: { id: 1, username: 'owner1' },
      }),
    },
    auditEvent: { create: vi.fn().mockResolvedValue({ id: 1 }) },
    rubro: {
      count: vi.fn().mockResolvedValue(1),
      findFirst: vi.fn().mockResolvedValue(rubroRow),
      findMany: vi.fn().mockImplementation((args?: unknown) => {
        const a =
          args && typeof args === 'object' && args !== null
            ? (args as { where?: { codigo?: { in?: number[] } }; select?: Record<string, boolean> })
            : {}
        if (a.where?.codigo && typeof a.where.codigo === 'object' && Array.isArray(a.where.codigo.in)) {
          return Promise.resolve([])
        }
        const sel = a.select
        if (sel && 'codigo' in sel && 'id' in sel) {
          return Promise.resolve([{ id: rubroRow.id, codigo: rubroRow.codigo }])
        }
        return Promise.resolve([rubroRow])
      }),
      create: vi.fn().mockResolvedValue(rubroRow),
      findUnique: vi.fn().mockResolvedValue(null),
      upsert: vi.fn().mockResolvedValue(rubroRow),
    },
    formaPago: {
      findMany: vi.fn().mockResolvedValue([formaPagoRow]),
    },
    factura: {
      count: vi.fn().mockResolvedValue(0),
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
      create: facturaCreate,
      aggregate: vi.fn().mockResolvedValue({ _count: { id: 0 }, _sum: { total: null } }),
    },
    cobro: {
      findMany: vi.fn().mockResolvedValue([]),
    },
    ordenCompra: {
      count: vi.fn().mockResolvedValue(1),
      findMany: vi.fn().mockResolvedValue([ordenCompraContractRow]),
      findFirst: vi.fn().mockResolvedValue(ordenCompraContractRow),
      create: vi.fn().mockResolvedValue(ordenCompraContractRow),
      update: vi.fn().mockResolvedValue(ordenCompraContractRow),
    },
    ordenCompraItem: { deleteMany: vi.fn(), update: vi.fn() },
    recuento: {
      count: vi.fn().mockResolvedValue(1),
      findMany: vi.fn().mockResolvedValue([recuentoContractRow]),
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue(recuentoContractRow),
      update: vi.fn().mockResolvedValue({ ...recuentoContractRow, estado: 'closed', closedAt: new Date() }),
    },
    recuentoItem: { update: vi.fn().mockResolvedValue({}) },
    reparto: {
      count: vi.fn().mockResolvedValue(1),
      findMany: vi.fn().mockResolvedValue([repartoContractRow]),
      findFirst: vi.fn().mockResolvedValue(repartoContractRow),
      create: vi.fn().mockResolvedValue(repartoContractRow),
      update: vi.fn().mockResolvedValue({ ...repartoContractRow, estado: 'on_route' }),
    },
    repartoUbicacion: {
      create: vi.fn().mockResolvedValue({
        lat: { toString: () => '-34.6037' },
        lng: { toString: () => '-58.3816' },
        recordedAt: new Date('2026-05-26T12:00:00.000Z'),
      }),
      deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
      findFirst: vi.fn().mockResolvedValue(null),
      findMany: vi.fn().mockResolvedValue([]),
    },
    repartoItem: {
      findFirst: vi.fn().mockResolvedValue(null),
      update: vi.fn(),
      updateMany: vi.fn().mockResolvedValue({ count: 0 }),
    },
    ordenEntrega: {
      count: vi.fn().mockResolvedValue(0),
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      create: vi.fn().mockResolvedValue({
        id: 1,
        tenantId: 1,
        clienteId: 1,
        zonaId: null,
        driverId: null,
        facturaId: null,
        fecha: new Date('2026-05-16T12:00:00.000Z'),
        estado: 'pending',
        nota: null,
        cliente: { id: 1, codigo: 1, rsocial: 'ACME SA' },
        zona: null,
        driver: null,
        factura: null,
      }),
      update: vi.fn().mockResolvedValue({
        id: 1,
        tenantId: 1,
        clienteId: 1,
        estado: 'delivered',
        fecha: new Date('2026-05-16T12:00:00.000Z'),
        cliente: { id: 1, codigo: 1, rsocial: 'ACME SA' },
      }),
    },
    tenantFiscalConfig: {
      findUnique: vi.fn().mockResolvedValue(null),
      upsert: vi.fn().mockResolvedValue({ id: 1 }),
    },
    paramEmpresa: {
      findUnique: vi.fn().mockResolvedValue({
        id: 1,
        tenantId: 1,
        nombre: 'Demo Co',
        cuit: '20-12345678-6',
        domicilio: null,
        puntoVenta: 1,
        tipoFactura: 'B',
        logoUrl: null,
        recordatorioDiasGracia: 0,
        timezone: 'America/Argentina/Buenos_Aires',
        recordatorioHoraInicio: 8,
        recordatorioHoraFin: 18,
      }),
      upsert: vi.fn().mockResolvedValue({
        id: 1,
        tenantId: 1,
        nombre: 'Demo Co',
        cuit: '20-12345678-6',
        domicilio: 'Calle 1',
        puntoVenta: 2,
        tipoFactura: 'A',
        logoUrl: null,
        recordatorioDiasGracia: 0,
        timezone: 'America/Argentina/Buenos_Aires',
        recordatorioHoraInicio: 8,
        recordatorioHoraFin: 18,
      }),
    },
    cobroRecordatorio: {
      count: vi.fn().mockResolvedValue(0),
      create: vi.fn().mockResolvedValue({ id: 1 }),
    },
    appUser: {
      count: vi.fn().mockResolvedValue(1),
      findMany: vi.fn().mockResolvedValue([{ id: 1 }]),
      findFirst: vi.fn().mockResolvedValue(null),
    },
    notification: {
      createMany: vi.fn().mockResolvedValue({ count: 1 }),
      create: vi.fn().mockResolvedValue({ id: 1 }),
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    tenant: {
      findUnique: vi.fn().mockResolvedValue({ id: 1, name: 'Demo', slug: 'demo', active: true }),
    },
    proveedor: {
      count: vi.fn().mockResolvedValue(1),
      findMany: vi.fn((args?: unknown) => {
        const w =
          args && typeof args === 'object' && args !== null && 'where' in args
            ? (args as { where?: { codigo?: { in?: number[] } } }).where
            : undefined
        if (w?.codigo && typeof w.codigo === 'object' && Array.isArray(w.codigo.in)) {
          return Promise.resolve([])
        }
        return Promise.resolve([proveedorRow])
      }),
      findFirst: vi.fn().mockResolvedValue(proveedorRow),
      findUnique: vi.fn().mockResolvedValue(proveedorRow),
      create: vi.fn().mockResolvedValue(proveedorRow),
      update: vi.fn().mockResolvedValue(proveedorRow),
    },
    // $transaction: shares facturaCreate so mockRejectedValueOnce propagates for 500 tests
    $transaction: vi.fn(async (arg: unknown) => {
      if (typeof arg === 'function') {
        const tx = {
          factura: { create: facturaCreate },
          cliente: { update: txClienteUpdate, create: clienteTxCreate },
          rubro: {
            create: rubroTxCreate,
            findUnique: vi.fn().mockResolvedValue(null),
            upsert: vi.fn().mockResolvedValue(rubroRow),
          },
          articulo: {
            create: articuloTxCreate,
            update: vi.fn().mockResolvedValue(articuloRow),
            findUnique: vi.fn().mockResolvedValue(null),
            upsert: vi.fn().mockResolvedValue(articuloRow),
          },
          proveedor: { create: proveedorTxCreate },
          stockAjuste: {
            create: vi.fn().mockResolvedValue({
              id: 1,
              cantidad: -1,
              motivo: 'Test',
              createdAt: new Date(),
              user: { id: 1, username: 'owner1' },
            }),
          },
        }
        return arg(tx)
      }
      return arg
    }),
    $queryRaw: vi.fn().mockResolvedValue([]),
  } as unknown as PrismaClient

  return p
}

describe('API — contrato OpenAPI', () => {
  let prisma: PrismaClient

  beforeEach(() => {
    prisma = buildPrisma()
  })

  afterEach(() => {
    delete process.env.BIZCODE_TEST_ROLE
    delete process.env.BIZCODE_TEST_AUTH_BYPASS
  })

  it('GET /api/health', async () => {
    const app = createApp(prisma)
    const res = await request(app).get('/api/health').expect(200)
    await assertMatchesOpenApi('/api/health', 'get', '200', res.body)
  })

  it('GET /api/modules/catalog', async () => {
    const app = createApp(prisma)
    const res = await request(app).get('/api/modules/catalog').expect(200)
    await assertMatchesOpenApi('/api/modules/catalog', 'get', '200', res.body)
    expect(res.body.data.modules.length).toBeGreaterThanOrEqual(45)
  })

  it('GET /api/clientes', async () => {
    const app = createApp(prisma)
    const res = await request(app).get('/api/clientes').expect(200)
    await assertMatchesOpenApi('/api/clientes', 'get', '200', res.body)
    expect(res.body).toMatchObject({
      success: true,
      total: 1,
      limit: 100,
      offset: 0,
      data: expect.any(Array),
    })
  })

  it('GET /api/clientes?q numérico (rama filtro en query OR)', async () => {
    const app = createApp(prisma)
    const res = await request(app).get('/api/clientes').query({ q: '42' }).expect(200)
    await assertMatchesOpenApi('/api/clientes', 'get', '200', res.body)
    expect(res.body).toMatchObject({ total: 1, limit: 100, offset: 0 })
  })

  it('GET /api/clientes refleja limit y offset de query en la respuesta', async () => {
    const app = createApp(prisma)
    const res = await request(app).get('/api/clientes').query({ limit: '25', offset: '7' }).expect(200)
    await assertMatchesOpenApi('/api/clientes', 'get', '200', res.body)
    expect(res.body).toMatchObject({ total: 1, limit: 25, offset: 7 })
  })

  it('GET /api/clientes/:id', async () => {
    const app = createApp(prisma)
    const res = await request(app).get('/api/clientes/1').expect(200)
    await assertMatchesOpenApi('/api/clientes/{id}', 'get', '200', res.body)
  })

  it('POST /api/clientes', async () => {
    const app = createApp(prisma)
    const res = await request(app).post('/api/clientes').send(clienteInput).expect(200)
    await assertMatchesOpenApi('/api/clientes', 'post', '200', res.body)
  })

  it('POST /api/clientes/import', async () => {
    const app = createApp(prisma)
    const header =
      'codigo,rsocial,condIva,activo,fantasia,cuit,domicilio,localidad,cpost,telef,email,creditLimit,creditDays,suspended,deliveryZoneId'
    const row = '2001,Import Co SA,RI,true,,,,,,,,,0,false,'
    const res = await request(app)
      .post('/api/clientes/import')
      .attach('file', Buffer.from(`${header}\n${row}\n`, 'utf8'), 'clientes.csv')
      .expect(200)
    await assertMatchesOpenApi('/api/clientes/import', 'post', '200', res.body)
    expect(res.body.data.created).toBe(1)
    expect(res.body.data.skipped).toBe(0)
    expect(res.body.data.errors).toEqual([])
  })

  it('PUT /api/clientes/:id', async () => {
    const app = createApp(prisma)
    const res = await request(app).put('/api/clientes/1').send(clienteInput).expect(200)
    await assertMatchesOpenApi('/api/clientes/{id}', 'put', '200', res.body)
  })

  it('GET /api/articulos', async () => {
    const app = createApp(prisma)
    const res = await request(app).get('/api/articulos').expect(200)
    await assertMatchesOpenApi('/api/articulos', 'get', '200', res.body)
  })

  it('GET /api/articulos?q numérico (rama filtro en query OR)', async () => {
    const app = createApp(prisma)
    const res = await request(app).get('/api/articulos').query({ q: '7' }).expect(200)
    await assertMatchesOpenApi('/api/articulos', 'get', '200', res.body)
  })

  it('GET /api/articulos/:id', async () => {
    const app = createApp(prisma)
    const res = await request(app).get('/api/articulos/1').expect(200)
    await assertMatchesOpenApi('/api/articulos/{id}', 'get', '200', res.body)
  })

  it('POST /api/articulos', async () => {
    const app = createApp(prisma)
    const res = await request(app).post('/api/articulos').send(articuloInput).expect(200)
    await assertMatchesOpenApi('/api/articulos', 'post', '200', res.body)
  })

  it('PUT /api/articulos/:id', async () => {
    const app = createApp(prisma)
    const res = await request(app).put('/api/articulos/1').send(articuloInput).expect(200)
    await assertMatchesOpenApi('/api/articulos/{id}', 'put', '200', res.body)
  })

  it('GET /api/articulos/:id/stock-historial', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
    ;(prisma.stockAjuste.count as ReturnType<typeof vi.fn>).mockResolvedValueOnce(1)
    ;(prisma.stockAjuste.findMany as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
      {
        id: 1,
        cantidad: -2,
        motivo: 'Merma',
        createdAt: new Date('2026-05-18T12:00:00.000Z'),
        user: { id: 1, username: 'owner1' },
      },
    ])
    const app = createApp(prisma)
    const res = await request(app).get('/api/articulos/1/stock-historial').expect(200)
    await assertMatchesOpenApi('/api/articulos/{id}/stock-historial', 'get', '200', res.body)
  })

  it('POST /api/articulos/:id/stock-ajuste', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
    ;(prisma.articulo.findFirst as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ...articuloRow,
      stock: 10,
      minimo: 0,
    })
    const articuloUpdate = vi.fn().mockResolvedValue({ ...articuloRow, stock: 9 })
    prisma.$transaction = vi.fn(async (arg: unknown) => {
      if (typeof arg === 'function') {
        return arg({
          articulo: { update: articuloUpdate },
          stockAjuste: {
            create: vi.fn().mockResolvedValue({
              id: 1,
              cantidad: -1,
              motivo: 'Test',
              createdAt: new Date('2026-05-18T12:00:00.000Z'),
              user: { id: 1, username: 'owner1' },
            }),
          },
        })
      }
      return arg
    })
    const app = createApp(prisma)
    const res = await request(app)
      .post('/api/articulos/1/stock-ajuste')
      .send({ cantidad: -1, motivo: 'Test' })
      .expect(200)
    await assertMatchesOpenApi('/api/articulos/{id}/stock-ajuste', 'post', '200', res.body)
  })

  it('GET /api/rubros', async () => {
    const app = createApp(prisma)
    const res = await request(app).get('/api/rubros').expect(200)
    await assertMatchesOpenApi('/api/rubros', 'get', '200', res.body)
  })

  it('POST /api/rubros', async () => {
    const app = createApp(prisma)
    const res = await request(app).post('/api/rubros').send({ codigo: 1, nombre: 'X' }).expect(200)
    await assertMatchesOpenApi('/api/rubros', 'post', '200', res.body)
  })

  it('POST /api/rubros/import', async () => {
    const app = createApp(prisma)
    const header = 'codigo,nombre'
    const row = '55,Contract rubro nm'
    const res = await request(app)
      .post('/api/rubros/import')
      .attach('file', Buffer.from(`${header}\n${row}\n`, 'utf8'), 'rubros.csv')
      .expect(200)
    await assertMatchesOpenApi('/api/rubros/import', 'post', '200', res.body)
    expect(res.body.data.created).toBe(1)
  })

  it('POST /api/articulos/import', async () => {
    const app = createApp(prisma)
    const header =
      'codigo,descripcion,rubroCodigo,condIva,umedida,precioLista1,precioLista2,costo,stock,minimo,activo'
    const row = '888,Contract articulo,1,1,UN,10,10,5,0,0,true'
    const res = await request(app)
      .post('/api/articulos/import')
      .attach('file', Buffer.from(`${header}\n${row}\n`, 'utf8'), 'art.csv')
      .expect(200)
    await assertMatchesOpenApi('/api/articulos/import', 'post', '200', res.body)
    expect(res.body.data.created).toBe(1)
  })

  it('GET /api/proveedores', async () => {
    const app = createApp(prisma)
    const res = await request(app).get('/api/proveedores').expect(200)
    await assertMatchesOpenApi('/api/proveedores', 'get', '200', res.body)
  })

  it('GET /api/proveedores/{id}', async () => {
    const app = createApp(prisma)
    const res = await request(app).get('/api/proveedores/1').expect(200)
    await assertMatchesOpenApi('/api/proveedores/{id}', 'get', '200', res.body)
  })

  it('POST /api/proveedores', async () => {
    const app = createApp(prisma)
    const res = await request(app).post('/api/proveedores').send(proveedorInput).expect(200)
    await assertMatchesOpenApi('/api/proveedores', 'post', '200', res.body)
  })

  it('PUT /api/proveedores/{id}', async () => {
    const app = createApp(prisma)
    const res = await request(app).put('/api/proveedores/1').send(proveedorInput).expect(200)
    await assertMatchesOpenApi('/api/proveedores/{id}', 'put', '200', res.body)
  })

  it('POST /api/proveedores/import', async () => {
    const app = createApp(prisma)
    const header = 'codigo,rsocial,condIva,activo,fantasia,cuit,telef,email'
    const row = '5100,Contract CSV SA,RI,true,,,,'
    const res = await request(app)
      .post('/api/proveedores/import')
      .attach('file', Buffer.from(`${header}\n${row}\n`, 'utf8'), 'prov.csv')
      .expect(200)
    await assertMatchesOpenApi('/api/proveedores/import', 'post', '200', res.body)
    expect(res.body.data.created).toBe(1)
  })

  it('GET /api/formas-pago', async () => {
    const app = createApp(prisma)
    const res = await request(app).get('/api/formas-pago').expect(200)
    await assertMatchesOpenApi('/api/formas-pago', 'get', '200', res.body)
  })

  it('GET /api/facturas', async () => {
    const app = createApp(prisma)
    const res = await request(app).get('/api/facturas').expect(200)
    await assertMatchesOpenApi('/api/facturas', 'get', '200', res.body)
  })

  it('POST /api/facturas', async () => {
    const app = createApp(prisma)
    const res = await request(app)
      .post('/api/facturas')
      .send({
        fecha: '2025-01-15',
        tipo: 'A',
        prefijo: 'A',
        numero: 1,
        clienteId: 1,
        neto1: 100,
        neto2: 0,
        neto3: 0,
        iva1: 21,
        iva2: 0,
        total: 121,
        items: [
          {
            articuloId: 1,
            cantidad: 1,
            precio: 100,
            dscto: 0,
            subtotal: 100,
          },
        ],
      })
      .expect(200)
    await assertMatchesOpenApi('/api/facturas', 'post', '200', res.body)
  })

  it('GET /api/afip/config', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
    const p = buildPrisma()
    vi.mocked(p.tenantFiscalConfig.findUnique).mockResolvedValue({
      cuit: '20123456789',
      ambiente: 'homologacion',
    } as never)
    const app = createApp(p)
    const res = await request(app).get('/api/afip/config').expect(200)
    await assertMatchesOpenApi('/api/afip/config', 'get', '200', res.body)
  })

  it('GET /api/facturas/:id/pdf/preview returns application/pdf', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
    const p = buildPrisma()
    vi.mocked(p.factura.findFirst).mockResolvedValue({
      id: 1,
      tipo: 'A',
      prefijo: '0001',
      numero: 1,
      fecha: new Date('2025-01-15T12:00:00.000Z'),
      total: 121,
      neto1: 100,
      neto2: 0,
      neto3: 0,
      iva1: 21,
      iva2: 0,
      estadoCae: 'pending',
      cae: null,
      caeVto: null,
      cliente: { rsocial: 'ACME SA', cuit: null, domicilio: null },
      items: [],
    } as never)
    const app = createApp(p)
    const res = await request(app).get('/api/facturas/1/pdf/preview').expect(200)
    expect(res.headers['content-type']).toMatch(/application\/pdf/)
    expect(res.body.subarray(0, 4).toString()).toBe('%PDF')
  })

  it('GET /api/clientes devuelve 500 cuando Prisma falla', async () => {
    const p = buildPrisma()
    vi.mocked(p.cliente.findMany).mockRejectedValueOnce(new Error('db down'))
    const app = createApp(p)
    const res = await request(app).get('/api/clientes').expect(500)
    await assertMatchesOpenApi('/api/clientes', 'get', '500', res.body)
  })

  it('500 con rechazo no-Error serializa el mensaje vía String()', async () => {
    const p = buildPrisma()
    vi.mocked(p.cliente.findMany).mockRejectedValueOnce('fallo-plano')
    const res = await request(createApp(p)).get('/api/clientes').expect(500)
    expect(res.body).toEqual({ success: false, error: 'fallo-plano' })
    await assertMatchesOpenApi('/api/clientes', 'get', '500', res.body)
  })

  it('GET /api/reportes/aging', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'finance'
    const app = createApp(prisma)
    const res = await request(app).get('/api/reportes/aging').expect(200)
    await assertMatchesOpenApi('/api/reportes/aging', 'get', '200', res.body)
    expect(res.body.data.buckets).toHaveLength(4)
  })

  it('GET /api/reportes/cuenta-corriente/{clienteId}', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'finance'
    const p = buildPrisma()
    vi.mocked(p.cliente.findFirst).mockResolvedValueOnce({
      ...clienteRow,
      balance: new Decimal(0),
      balanceInicial: new Decimal(0),
    } as never)
    const app = createApp(p)
    const res = await request(app).get('/api/reportes/cuenta-corriente/1').expect(200)
    await assertMatchesOpenApi('/api/reportes/cuenta-corriente/{clienteId}', 'get', '200', res.body)
  })

  it('GET /api/reportes/ventas', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'manager'
    const app = createApp(prisma)
    const res = await request(app)
      .get('/api/reportes/ventas')
      .query({ from: '2026-01-01', to: '2026-01-31', agrupar: 'dia' })
      .expect(200)
    await assertMatchesOpenApi('/api/reportes/ventas', 'get', '200', res.body)
  })

  it('GET /api/reportes/stock-critico', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'manager'
    const app = createApp(prisma)
    const res = await request(app).get('/api/reportes/stock-critico').expect(200)
    await assertMatchesOpenApi('/api/reportes/stock-critico', 'get', '200', res.body)
  })

  it('GET /api/reportes/cobranzas', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'finance'
    const app = createApp(prisma)
    const res = await request(app)
      .get('/api/reportes/cobranzas')
      .query({ from: '2026-01-01', to: '2026-01-31' })
      .expect(200)
    await assertMatchesOpenApi('/api/reportes/cobranzas', 'get', '200', res.body)
  })

  it('GET /api/compras', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'warehouse_lead'
    const app = createApp(prisma)
    const res = await request(app).get('/api/compras').expect(200)
    await assertMatchesOpenApi('/api/compras', 'get', '200', res.body)
  })

  it('POST /api/compras', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'warehouse_lead'
    const p = buildPrisma()
    vi.mocked(p.proveedor.findFirst).mockResolvedValueOnce({ id: 1 } as never)
    vi.mocked(p.articulo.count).mockResolvedValueOnce(1)
    const app = createApp(p)
    const res = await request(app)
      .post('/api/compras')
      .send({
        proveedorId: 1,
        items: [{ articuloId: 1, cantidad: 2, costoUnitario: 10 }],
      })
      .expect(201)
    await assertMatchesOpenApi('/api/compras', 'post', '201', res.body)
  })

  it('GET /api/compras/{id}', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'warehouse_lead'
    const app = createApp(prisma)
    const res = await request(app).get('/api/compras/1').expect(200)
    await assertMatchesOpenApi('/api/compras/{id}', 'get', '200', res.body)
  })

  it('PUT /api/compras/{id}', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'warehouse_lead'
    const p = buildPrisma()
    vi.mocked(p.ordenCompra.findFirst).mockResolvedValueOnce({ id: 1, estado: 'draft' } as never)
    vi.mocked(p.ordenCompra.update).mockResolvedValueOnce({
      ...ordenCompraContractRow,
      nota: 'Contract note',
    } as never)
    p.$transaction = vi.fn(async (fn: unknown) => {
      if (typeof fn === 'function') {
        return (fn as (tx: PrismaClient) => Promise<unknown>)(p)
      }
      return fn
    }) as PrismaClient['$transaction']
    const app = createApp(p)
    const res = await request(app).put('/api/compras/1').send({ nota: 'Contract note' }).expect(200)
    await assertMatchesOpenApi('/api/compras/{id}', 'put', '200', res.body)
  })

  it('POST /api/compras/{id}/send', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'warehouse_lead'
    const p = buildPrisma()
    vi.mocked(p.ordenCompra.update).mockResolvedValueOnce({
      ...ordenCompraContractRow,
      estado: 'sent',
    } as never)
    const app = createApp(p)
    const res = await request(app).post('/api/compras/1/send').expect(200)
    await assertMatchesOpenApi('/api/compras/{id}/send', 'post', '200', res.body)
  })

  it('POST /api/compras/{id}/cancel', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'warehouse_lead'
    const p = buildPrisma()
    vi.mocked(p.ordenCompra.findFirst).mockResolvedValueOnce({ id: 1, estado: 'sent' } as never)
    vi.mocked(p.ordenCompra.update).mockResolvedValueOnce({
      ...ordenCompraContractRow,
      estado: 'cancelled',
    } as never)
    const app = createApp(p)
    const res = await request(app).post('/api/compras/1/cancel').expect(200)
    await assertMatchesOpenApi('/api/compras/{id}/cancel', 'post', '200', res.body)
  })

  it('POST /api/compras/{id}/receive', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'warehouse_lead'
    const sentRow = { ...ordenCompraContractRow, estado: 'sent' }
    const p = buildPrisma()
    vi.mocked(p.ordenCompra.findFirst).mockResolvedValueOnce({
      ...sentRow,
      items: ordenCompraContractRow.items.map((i) => ({ ...i, cantidadRecibida: 0 })),
    } as never)
    vi.mocked(p.ordenCompra.update).mockResolvedValueOnce({
      ...sentRow,
      estado: 'received',
      items: ordenCompraContractRow.items.map((i) => ({ ...i, cantidadRecibida: i.cantidad })),
    } as never)
    p.$transaction = vi.fn(async (fn: unknown) => {
      if (typeof fn === 'function') {
        return (fn as (tx: PrismaClient) => Promise<unknown>)(p)
      }
      return fn
    }) as PrismaClient['$transaction']
    const app = createApp(p)
    const res = await request(app)
      .post('/api/compras/1/receive')
      .send({ lines: [{ itemId: 10, cantidad: 2 }] })
      .expect(200)
    await assertMatchesOpenApi('/api/compras/{id}/receive', 'post', '200', res.body)
  })

  it('GET /api/recuentos', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'warehouse_lead'
    const p = buildPrisma()
    vi.mocked(p.recuento.findMany).mockResolvedValueOnce([recuentoContractRow] as never)
    const app = createApp(p)
    const res = await request(app).get('/api/recuentos').expect(200)
    await assertMatchesOpenApi('/api/recuentos', 'get', '200', res.body)
  })

  it('POST /api/recuentos', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'warehouse_lead'
    const p = buildPrisma()
    vi.mocked(p.recuento.findFirst).mockResolvedValueOnce(null)
    const app = createApp(p)
    const res = await request(app).post('/api/recuentos').expect(201)
    await assertMatchesOpenApi('/api/recuentos', 'post', '201', res.body)
  })

  it('GET /api/recuentos/{id}', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'warehouse_lead'
    const p = buildPrisma()
    vi.mocked(p.recuento.findFirst).mockResolvedValueOnce(recuentoContractRow as never)
    const app = createApp(p)
    const res = await request(app).get('/api/recuentos/1').expect(200)
    await assertMatchesOpenApi('/api/recuentos/{id}', 'get', '200', res.body)
  })

  it('PUT /api/recuentos/{id}/items', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'warehouse_lead'
    const p = buildPrisma()
    vi.mocked(p.recuento.findFirst)
      .mockResolvedValueOnce(recuentoContractRow as never)
      .mockResolvedValueOnce({
        ...recuentoContractRow,
        items: [{ ...recuentoContractRow.items[0], cantFisica: 5 }],
      } as never)
    p.$transaction = vi.fn(async (fn: unknown) => {
      if (typeof fn === 'function') {
        return (fn as (tx: PrismaClient) => Promise<unknown>)(p)
      }
      return fn
    }) as PrismaClient['$transaction']
    const app = createApp(p)
    const res = await request(app)
      .put('/api/recuentos/1/items')
      .send({ lines: [{ articuloId: 1, cantFisica: 5 }] })
      .expect(200)
    await assertMatchesOpenApi('/api/recuentos/{id}/items', 'put', '200', res.body)
  })

  it('POST /api/recuentos/{id}/close', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'warehouse_lead'
    const p = buildPrisma()
    const counted = {
      ...recuentoContractRow,
      items: [{ ...recuentoContractRow.items[0], cantFisica: 5 }],
    }
    const closed = { ...counted, estado: 'closed', closedAt: new Date() }
    vi.mocked(p.recuento.findFirst)
      .mockResolvedValueOnce(counted as never)
      .mockResolvedValueOnce(closed as never)
    p.$transaction = vi.fn(async (fn: unknown) => {
      if (typeof fn === 'function') {
        return (fn as (tx: PrismaClient) => Promise<unknown>)(p)
      }
      return fn
    }) as PrismaClient['$transaction']
    const app = createApp(p)
    const res = await request(app).post('/api/recuentos/1/close').expect(200)
    await assertMatchesOpenApi('/api/recuentos/{id}/close', 'post', '200', res.body)
  })

  it('GET /api/repartos', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'logistics_planner'
    const p = buildPrisma()
    vi.mocked(p.reparto.findMany).mockResolvedValueOnce([repartoContractRow] as never)
    const app = createApp(p)
    const res = await request(app).get('/api/repartos').query({ fecha: '2026-05-20' }).expect(200)
    await assertMatchesOpenApi('/api/repartos', 'get', '200', res.body)
  })

  it('POST /api/repartos', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'logistics_planner'
    const p = buildPrisma()
    vi.mocked(p.appUser.findFirst).mockResolvedValueOnce({ id: 2, role: 'driver' } as never)
    vi.mocked(p.ordenEntrega.findMany).mockResolvedValueOnce([{ id: 1, estado: 'ready' }] as never)
    vi.mocked(p.repartoItem.findFirst).mockResolvedValueOnce(null)
    p.$transaction = vi.fn(async (fn: unknown) => {
      if (typeof fn === 'function') {
        return (fn as (tx: PrismaClient) => Promise<unknown>)(p)
      }
      return fn
    }) as PrismaClient['$transaction']
    const app = createApp(p)
    const res = await request(app)
      .post('/api/repartos')
      .send({ fecha: '2026-05-20', choferId: 2, ordenEntregaIds: [1] })
      .expect(201)
    await assertMatchesOpenApi('/api/repartos', 'post', '201', res.body)
  })

  it('GET /api/repartos/activos', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'logistics_planner'
    const p = buildPrisma()
    const activo = {
      ...repartoContractRow,
      estado: 'on_route',
      items: [
        {
          ...repartoContractRow.items[0],
          estado: 'pending',
          ordenEntrega: {
            ...repartoContractRow.items[0].ordenEntrega,
            cliente: {
              ...repartoContractRow.items[0].ordenEntrega.cliente,
              domicilio: 'Av. Demo 123',
            },
          },
        },
      ],
    }
    vi.mocked(p.reparto.findMany).mockResolvedValueOnce([activo] as never)
    const app = createApp(p)
    const res = await request(app).get('/api/repartos/activos').expect(200)
    await assertMatchesOpenApi('/api/repartos/activos', 'get', '200', res.body)
  })

  it('POST /api/repartos/{id}/ubicacion', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'driver'
    process.env.BIZCODE_TEST_USER_ID = '2'
    const p = buildPrisma()
    vi.mocked(p.reparto.findFirst).mockResolvedValueOnce({
      id: 1,
      choferId: 2,
      estado: 'on_route',
      tenantId: 1,
    } as never)
    const app = createApp(p)
    const res = await request(app)
      .post('/api/repartos/1/ubicacion')
      .send({ lat: -34.6037, lng: -58.3816 })
      .expect(200)
    await assertMatchesOpenApi('/api/repartos/{id}/ubicacion', 'post', '200', res.body)
  })

  it('GET /api/repartos/{id}/ubicacion/ultima', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'logistics_planner'
    const p = buildPrisma()
    vi.mocked(p.reparto.findFirst).mockResolvedValueOnce({
      id: 1,
      choferId: 2,
      tenantId: 1,
    } as never)
    const app = createApp(p)
    const res = await request(app).get('/api/repartos/1/ubicacion/ultima').expect(200)
    await assertMatchesOpenApi('/api/repartos/{id}/ubicacion/ultima', 'get', '200', res.body)
  })

  it('GET /api/repartos/{id}', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'logistics_planner'
    const p = buildPrisma()
    vi.mocked(p.reparto.findFirst).mockResolvedValueOnce(repartoContractRow as never)
    const app = createApp(p)
    const res = await request(app).get('/api/repartos/1').expect(200)
    await assertMatchesOpenApi('/api/repartos/{id}', 'get', '200', res.body)
  })

  it('POST /api/repartos/{id}/iniciar', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'logistics_planner'
    const p = buildPrisma()
    vi.mocked(p.reparto.findFirst)
      .mockResolvedValueOnce({
        ...repartoContractRow,
        items: [{ id: 10, ordenEntregaId: 1, estado: 'pending' }],
      } as never)
      .mockResolvedValueOnce({ ...repartoContractRow, estado: 'on_route' } as never)
    p.$transaction = vi.fn(async (fn: unknown) => {
      if (typeof fn === 'function') {
        return (fn as (tx: PrismaClient) => Promise<unknown>)(p)
      }
      return fn
    }) as PrismaClient['$transaction']
    const app = createApp(p)
    const res = await request(app).post('/api/repartos/1/iniciar').expect(200)
    await assertMatchesOpenApi('/api/repartos/{id}/iniciar', 'post', '200', res.body)
  })

  it('POST /api/repartos/{id}/cerrar', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'logistics_planner'
    const p = buildPrisma()
    const onRoute = {
      ...repartoContractRow,
      estado: 'on_route',
      items: [{ ...repartoContractRow.items[0], id: 10, estado: 'pending' }],
    }
    const closed = {
      ...onRoute,
      estado: 'completed',
      closedAt: new Date(),
      items: [{ ...onRoute.items[0], estado: 'not_delivered' }],
      progress: { total: 1, delivered: 0, pending: 0 },
    }
    vi.mocked(p.reparto.findFirst).mockResolvedValueOnce(onRoute as never)
    vi.mocked(p.reparto.update).mockResolvedValueOnce(closed as never)
    p.$transaction = vi.fn(async (fn: unknown) => {
      if (typeof fn === 'function') {
        return (fn as (tx: PrismaClient) => Promise<unknown>)(p)
      }
      return fn
    }) as PrismaClient['$transaction']
    const app = createApp(p)
    const res = await request(app).post('/api/repartos/1/cerrar').expect(200)
    await assertMatchesOpenApi('/api/repartos/{id}/cerrar', 'post', '200', res.body)
  })

  const TEST_FIRMA =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='

  it('PUT /api/repartos/{id}/items/{itemId}', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'driver'
    process.env.BIZCODE_TEST_USER_ID = '2'
    const p = buildPrisma()
    const itemRow = {
      ...repartoContractRow.items[0],
      repartoId: 1,
      estado: 'pending',
      podMedia: { firmaBase64: TEST_FIRMA },
      receptorNombre: 'Juan Pérez',
    }
    vi.mocked(p.reparto.findFirst).mockResolvedValueOnce({
      id: 1,
      estado: 'on_route',
      choferId: 2,
      tenantId: 1,
    } as never)
    vi.mocked(p.repartoItem.findFirst).mockResolvedValueOnce({
      ...itemRow,
      ordenEntrega: repartoContractRow.items[0].ordenEntrega,
    } as never)
    vi.mocked(p.repartoItem.update).mockResolvedValueOnce({
      ...itemRow,
      estado: 'delivered',
      entregadoAt: new Date(),
    } as never)
    vi.mocked(p.ordenEntrega.update).mockResolvedValueOnce({} as never)
    p.$transaction = vi.fn(async (fn: unknown) => {
      if (typeof fn === 'function') {
        return (fn as (tx: PrismaClient) => Promise<unknown>)(p)
      }
      return fn
    }) as PrismaClient['$transaction']
    const app = createApp(p)
    const res = await request(app)
      .put('/api/repartos/1/items/10')
      .send({
        outcome: 'delivered',
        receptorNombre: 'Juan Pérez',
        firmaBase64: TEST_FIRMA,
      })
      .expect(200)
    await assertMatchesOpenApi('/api/repartos/{id}/items/{itemId}', 'put', '200', res.body)
    expect(res.body.data.hasPod).toBe(true)
  })

  it('GET /api/repartos/{id}/items/{itemId}/pod', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'logistics_planner'
    const p = buildPrisma()
    const itemRow = {
      ...repartoContractRow.items[0],
      repartoId: 1,
      estado: 'delivered',
      podMedia: { firmaBase64: TEST_FIRMA },
      receptorNombre: 'Juan Pérez',
    }
    vi.mocked(p.repartoItem.findFirst).mockResolvedValueOnce({
      ...itemRow,
      ordenEntrega: repartoContractRow.items[0].ordenEntrega,
    } as never)
    const app = createApp(p)
    const res = await request(app).get('/api/repartos/1/items/10/pod').expect(200)
    await assertMatchesOpenApi('/api/repartos/{id}/items/{itemId}/pod', 'get', '200', res.body)
    expect(res.body.data.podMedia?.firmaBase64).toBe(TEST_FIRMA)
  })

  it('GET /api/dashboard/ventas-historico', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
    const p = buildPrisma()
    vi.mocked(p.$queryRaw)
      .mockReset()
      .mockResolvedValueOnce([{ period: '2026-05-01', count: BigInt(2), total: '150.00' }])
      .mockResolvedValueOnce([
        {
          articuloId: 1,
          codigo: 100,
          descripcion: 'Item',
          quantity: BigInt(3),
          total: '150.00',
        },
      ])
      .mockResolvedValueOnce([
        { vendedorId: 1, username: 'owner', count: BigInt(2), total: '150.00' },
      ])
    const app = createApp(p)
    const res = await request(app)
      .get('/api/dashboard/ventas-historico')
      .query({ from: '2026-05-01', to: '2026-05-20', groupBy: 'day' })
      .expect(200)
    await assertMatchesOpenApi('/api/dashboard/ventas-historico', 'get', '200', res.body)
  })

  it('GET /api/cobranzas/vencidas', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'finance'
    const app = createApp(prisma)
    const res = await request(app).get('/api/cobranzas/vencidas').expect(200)
    await assertMatchesOpenApi('/api/cobranzas/vencidas', 'get', '200', res.body)
  })

  it('POST /api/cobranzas/recordatorios', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'finance'
    const p = buildPrisma()
    vi.mocked(p.factura.findFirst).mockResolvedValueOnce({
      id: 1,
      tenantId: 1,
      clienteId: 1,
      total: 1500,
      fecha: new Date('2020-01-01'),
      estado: 'A',
      cliente: { rsocial: 'ACME SA', creditDays: 0 },
    } as never)
    const app = createApp(p)
    const res = await request(app)
      .post('/api/cobranzas/recordatorios')
      .send({ facturaId: 1, canal: 'email' })
      .expect(201)
    await assertMatchesOpenApi('/api/cobranzas/recordatorios', 'post', '201', res.body)
  })

  it('GET /api/ordenes-entrega', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'manager'
    const app = createApp(prisma)
    const res = await request(app).get('/api/ordenes-entrega').expect(200)
    await assertMatchesOpenApi('/api/ordenes-entrega', 'get', '200', res.body)
  })

  it('POST /api/ordenes-entrega', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'manager'
    const app = createApp(prisma)
    const res = await request(app)
      .post('/api/ordenes-entrega')
      .send({ clienteId: 1, fecha: '2026-05-16' })
      .expect(201)
    await assertMatchesOpenApi('/api/ordenes-entrega', 'post', '201', res.body)
  })

  it('POST /api/ordenes-entrega/:id/iniciar-picking', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'warehouse_op'
    process.env.BIZCODE_TEST_USER_ID = '7'
    vi.mocked(prisma.ordenEntrega.findFirst).mockResolvedValueOnce({
      id: 1,
      tenantId: 1,
      facturaId: null,
      clienteId: 1,
      zonaId: null,
      driverId: null,
      pickerUserId: null,
      pickingIniciadoAt: null,
      pickingListoAt: null,
      fecha: new Date('2026-05-16'),
      estado: 'pending',
      nota: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never)
    vi.mocked(prisma.ordenEntrega.update).mockResolvedValueOnce({
      id: 1,
      tenantId: 1,
      facturaId: null,
      clienteId: 1,
      zonaId: null,
      driverId: null,
      pickerUserId: 7,
      pickingIniciadoAt: new Date(),
      pickingListoAt: null,
      fecha: new Date('2026-05-16'),
      estado: 'picking',
      nota: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      cliente: { id: 1, codigo: 1, rsocial: 'Cliente' },
      zona: null,
      driver: null,
      picker: { id: 7, username: 'wh1', role: 'warehouse_op' },
      factura: null,
    } as never)
    const app = createApp(prisma)
    const res = await request(app).post('/api/ordenes-entrega/1/iniciar-picking').expect(200)
    await assertMatchesOpenApi('/api/ordenes-entrega/{id}/iniciar-picking', 'post', '200', res.body)
  })

  it('POST /api/ordenes-entrega/:id/lista', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'warehouse_op'
    process.env.BIZCODE_TEST_USER_ID = '7'
    vi.mocked(prisma.ordenEntrega.findFirst).mockResolvedValueOnce({
      id: 1,
      tenantId: 1,
      estado: 'picking',
      pickerUserId: 7,
      driverId: null,
      clienteId: 1,
      facturaId: null,
      zonaId: null,
      pickingIniciadoAt: new Date(),
      pickingListoAt: null,
      fecha: new Date(),
      nota: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never)
    vi.mocked(prisma.ordenEntrega.update).mockResolvedValueOnce({
      id: 1,
      tenantId: 1,
      facturaId: null,
      clienteId: 1,
      zonaId: null,
      driverId: null,
      pickerUserId: 7,
      pickingIniciadoAt: new Date(),
      pickingListoAt: new Date(),
      fecha: new Date('2026-05-16'),
      estado: 'ready',
      nota: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      cliente: { id: 1, codigo: 1, rsocial: 'Cliente' },
      zona: null,
      driver: null,
      picker: { id: 7, username: 'wh1', role: 'warehouse_op' },
      factura: null,
    } as never)
    const app = createApp(prisma)
    const res = await request(app).post('/api/ordenes-entrega/1/lista').expect(200)
    await assertMatchesOpenApi('/api/ordenes-entrega/{id}/lista', 'post', '200', res.body)
  })

  it('GET /api/empresa', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'seller'
    const app = createApp(prisma)
    const res = await request(app).get('/api/empresa').expect(200)
    await assertMatchesOpenApi('/api/empresa', 'get', '200', res.body)
  })

  it('PUT /api/empresa', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
    const app = createApp(prisma)
    const res = await request(app)
      .put('/api/empresa')
      .send({
        nombre: 'Demo Co',
        cuit: '20-12345678-6',
        domicilio: 'Calle 1',
        puntoVenta: 2,
        tipoFactura: 'A',
        logoUrl: null,
      })
      .expect(200)
    await assertMatchesOpenApi('/api/empresa', 'put', '200', res.body)
  })
})

describe('API — errores 500 (cobertura de ramas catch)', () => {
  beforeEach(() => {
    delete process.env.BIZCODE_TEST_ROLE
    delete process.env.BIZCODE_TEST_AUTH_BYPASS
  })

  const err = new Error('db')

  it('GET /api/clientes/:id', async () => {
    const p = buildPrisma()
    vi.mocked(p.cliente.findFirst).mockRejectedValueOnce(err)
    const res = await request(createApp(p)).get('/api/clientes/1').expect(500)
    await assertMatchesOpenApi('/api/clientes/{id}', 'get', '500', res.body)
  })

  it('POST /api/clientes', async () => {
    const p = buildPrisma()
    vi.mocked(p.cliente.create).mockRejectedValueOnce(err)
    const res = await request(createApp(p)).post('/api/clientes').send(clienteInput).expect(500)
    await assertMatchesOpenApi('/api/clientes', 'post', '500', res.body)
  })

  it('PUT /api/clientes/:id', async () => {
    const p = buildPrisma()
    vi.mocked(p.cliente.findFirst).mockResolvedValueOnce(clienteRow as never)
    vi.mocked(p.cliente.update).mockRejectedValueOnce(err)
    const res = await request(createApp(p)).put('/api/clientes/1').send(clienteInput).expect(500)
    await assertMatchesOpenApi('/api/clientes/{id}', 'put', '500', res.body)
  })

  it('GET /api/articulos', async () => {
    const p = buildPrisma()
    vi.mocked(p.articulo.findMany).mockRejectedValueOnce(err)
    const res = await request(createApp(p)).get('/api/articulos').expect(500)
    await assertMatchesOpenApi('/api/articulos', 'get', '500', res.body)
  })

  it('GET /api/articulos/:id', async () => {
    const p = buildPrisma()
    vi.mocked(p.articulo.findFirst).mockRejectedValueOnce(err)
    const res = await request(createApp(p)).get('/api/articulos/1').expect(500)
    await assertMatchesOpenApi('/api/articulos/{id}', 'get', '500', res.body)
  })

  it('POST /api/articulos', async () => {
    const p = buildPrisma()
    vi.mocked(p.rubro.findFirst).mockResolvedValueOnce(rubroRow as never)
    vi.mocked(p.articulo.create).mockRejectedValueOnce(err)
    const res = await request(createApp(p)).post('/api/articulos').send(articuloInput).expect(500)
    await assertMatchesOpenApi('/api/articulos', 'post', '500', res.body)
  })

  it('PUT /api/articulos/:id', async () => {
    const p = buildPrisma()
    vi.mocked(p.articulo.findFirst).mockResolvedValueOnce(articuloRow as never)
    vi.mocked(p.rubro.findFirst).mockResolvedValueOnce(rubroRow as never)
    vi.mocked(p.articulo.update).mockRejectedValueOnce(err)
    const res = await request(createApp(p)).put('/api/articulos/1').send(articuloInput).expect(500)
    await assertMatchesOpenApi('/api/articulos/{id}', 'put', '500', res.body)
  })

  it('GET /api/rubros', async () => {
    const p = buildPrisma()
    vi.mocked(p.rubro.findMany).mockRejectedValueOnce(err)
    const res = await request(createApp(p)).get('/api/rubros').expect(500)
    await assertMatchesOpenApi('/api/rubros', 'get', '500', res.body)
  })

  it('POST /api/rubros', async () => {
    const p = buildPrisma()
    vi.mocked(p.rubro.create).mockRejectedValueOnce(err)
    const res = await request(createApp(p)).post('/api/rubros').send({ codigo: 1, nombre: 'X' }).expect(500)
    await assertMatchesOpenApi('/api/rubros', 'post', '500', res.body)
  })

  it('GET /api/formas-pago', async () => {
    const p = buildPrisma()
    vi.mocked(p.formaPago.findMany).mockRejectedValueOnce(err)
    const res = await request(createApp(p)).get('/api/formas-pago').expect(500)
    await assertMatchesOpenApi('/api/formas-pago', 'get', '500', res.body)
  })

  it('GET /api/facturas', async () => {
    const p = buildPrisma()
    vi.mocked(p.factura.findMany).mockRejectedValueOnce(err)
    const res = await request(createApp(p)).get('/api/facturas').expect(500)
    await assertMatchesOpenApi('/api/facturas', 'get', '500', res.body)
  })

  it('POST /api/facturas', async () => {
    const p = buildPrisma()
    vi.mocked(p.factura.create).mockRejectedValueOnce(err)
    const res = await request(createApp(p))
      .post('/api/facturas')
      .send({
        fecha: '2025-01-15',
        tipo: 'A',
        numero: 1,
        clienteId: 1,
        neto1: 0,
        neto2: 0,
        neto3: 0,
        iva1: 0,
        iva2: 0,
        total: 0,
        items: [],
      })
      .expect(500)
    await assertMatchesOpenApi('/api/facturas', 'post', '500', res.body)
  })

  it('GET /api/logistica/kpis', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'logistics_planner'
    const p = buildPrisma()
    vi.mocked(p.$queryRaw)
      .mockResolvedValueOnce([{ count: BigInt(2) }])
      .mockResolvedValueOnce([{ count: BigInt(1) }])
      .mockResolvedValueOnce([{ avg_seconds: 600 }])
      .mockResolvedValueOnce([{ motivo: 'ausente', count: BigInt(1) }])
      .mockResolvedValueOnce([{ count: BigInt(0) }])
    const app = createApp(p)
    const res = await request(app)
      .get('/api/logistica/kpis')
      .query({ from: '2026-05-01', to: '2026-05-31' })
      .expect(200)
    await assertMatchesOpenApi('/api/logistica/kpis', 'get', '200', res.body)
  })

  it('GET /api/logistica/reporte-choferes', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'logistics_planner'
    const p = buildPrisma()
    vi.mocked(p.$queryRaw).mockResolvedValueOnce([
      {
        chofer_id: 2,
        chofer_username: 'driver1',
        day: new Date('2026-05-20'),
        dispatched: BigInt(3),
        delivered: BigInt(2),
        not_delivered: BigInt(1),
      },
    ])
    const app = createApp(p)
    const res = await request(app)
      .get('/api/logistica/reporte-choferes')
      .query({ from: '2026-05-01', to: '2026-05-31' })
      .expect(200)
    await assertMatchesOpenApi('/api/logistica/reporte-choferes', 'get', '200', res.body)
  })

  it('GET /api/logistica/reporte-zonas', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'logistics_planner'
    const p = buildPrisma()
    vi.mocked(p.$queryRaw).mockResolvedValueOnce([
      {
        zona_id: 1,
        zona_nombre: 'Centro',
        dispatched: BigInt(4),
        delivered: BigInt(3),
        not_delivered: BigInt(1),
      },
    ])
    const app = createApp(p)
    const res = await request(app)
      .get('/api/logistica/reporte-zonas')
      .query({ from: '2026-05-01', to: '2026-05-31' })
      .expect(200)
    await assertMatchesOpenApi('/api/logistica/reporte-zonas', 'get', '200', res.body)
  })
})
