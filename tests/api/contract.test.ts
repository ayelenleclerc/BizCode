/** Contrato HTTP vs docs/api/openapi.yaml (Ajv + spec dereferenciado). Entorno: node (vitest.config). */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
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

function buildPrisma(): PrismaClient {
  return {
    cliente: {
      findMany: vi.fn().mockResolvedValue([clienteRow]),
      findUnique: vi.fn().mockResolvedValue(clienteRow),
      create: vi.fn().mockResolvedValue(clienteRow),
      update: vi.fn().mockResolvedValue(clienteRow),
    },
    articulo: {
      findMany: vi.fn().mockResolvedValue([articuloRow]),
      findUnique: vi.fn().mockResolvedValue(articuloRow),
      create: vi.fn().mockResolvedValue(articuloRow),
      update: vi.fn().mockResolvedValue(articuloRow),
    },
    rubro: {
      findMany: vi.fn().mockResolvedValue([rubroRow]),
      create: vi.fn().mockResolvedValue(rubroRow),
    },
    formaPago: {
      findMany: vi.fn().mockResolvedValue([formaPagoRow]),
    },
    factura: {
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn().mockResolvedValue(facturaRow),
    },
  } as unknown as PrismaClient
}

describe('API — contrato OpenAPI', () => {
  let prisma: PrismaClient

  beforeEach(() => {
    prisma = buildPrisma()
  })

  it('GET /api/health', async () => {
    const app = createApp(prisma)
    const res = await request(app).get('/api/health').expect(200)
    await assertMatchesOpenApi('/api/health', 'get', '200', res.body)
  })

  it('GET /api/clientes', async () => {
    const app = createApp(prisma)
    const res = await request(app).get('/api/clientes').expect(200)
    await assertMatchesOpenApi('/api/clientes', 'get', '200', res.body)
  })

  it('GET /api/clientes?q numérico (rama filtro en query OR)', async () => {
    const app = createApp(prisma)
    const res = await request(app).get('/api/clientes').query({ q: '42' }).expect(200)
    await assertMatchesOpenApi('/api/clientes', 'get', '200', res.body)
  })

  it('GET /api/clientes/:id', async () => {
    const app = createApp(prisma)
    const res = await request(app).get('/api/clientes/1').expect(200)
    await assertMatchesOpenApi('/api/clientes/{id}', 'get', '200', res.body)
  })

  it('POST /api/clientes', async () => {
    const app = createApp(prisma)
    const res = await request(app).post('/api/clientes').send({}).expect(200)
    await assertMatchesOpenApi('/api/clientes', 'post', '200', res.body)
  })

  it('PUT /api/clientes/:id', async () => {
    const app = createApp(prisma)
    const res = await request(app).put('/api/clientes/1').send({}).expect(200)
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
    const res = await request(app).post('/api/articulos').send({}).expect(200)
    await assertMatchesOpenApi('/api/articulos', 'post', '200', res.body)
  })

  it('PUT /api/articulos/:id', async () => {
    const app = createApp(prisma)
    const res = await request(app).put('/api/articulos/1').send({}).expect(200)
    await assertMatchesOpenApi('/api/articulos/{id}', 'put', '200', res.body)
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
})

describe('API — errores 500 (cobertura de ramas catch)', () => {
  const err = new Error('db')

  it('GET /api/clientes/:id', async () => {
    const p = buildPrisma()
    vi.mocked(p.cliente.findUnique).mockRejectedValueOnce(err)
    const res = await request(createApp(p)).get('/api/clientes/1').expect(500)
    await assertMatchesOpenApi('/api/clientes/{id}', 'get', '500', res.body)
  })

  it('POST /api/clientes', async () => {
    const p = buildPrisma()
    vi.mocked(p.cliente.create).mockRejectedValueOnce(err)
    const res = await request(createApp(p)).post('/api/clientes').send({}).expect(500)
    await assertMatchesOpenApi('/api/clientes', 'post', '500', res.body)
  })

  it('PUT /api/clientes/:id', async () => {
    const p = buildPrisma()
    vi.mocked(p.cliente.update).mockRejectedValueOnce(err)
    const res = await request(createApp(p)).put('/api/clientes/1').send({}).expect(500)
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
    vi.mocked(p.articulo.findUnique).mockRejectedValueOnce(err)
    const res = await request(createApp(p)).get('/api/articulos/1').expect(500)
    await assertMatchesOpenApi('/api/articulos/{id}', 'get', '500', res.body)
  })

  it('POST /api/articulos', async () => {
    const p = buildPrisma()
    vi.mocked(p.articulo.create).mockRejectedValueOnce(err)
    const res = await request(createApp(p)).post('/api/articulos').send({}).expect(500)
    await assertMatchesOpenApi('/api/articulos', 'post', '500', res.body)
  })

  it('PUT /api/articulos/:id', async () => {
    const p = buildPrisma()
    vi.mocked(p.articulo.update).mockRejectedValueOnce(err)
    const res = await request(createApp(p)).put('/api/articulos/1').send({}).expect(500)
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
