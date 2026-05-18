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
    ordenEntrega: {
      count: vi.fn().mockResolvedValue(0),
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
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
})
