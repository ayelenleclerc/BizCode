import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import { createApp } from '../../apps/server/createApp'

const remitoRow = {
  id: 1,
  tenantId: 1,
  prefijo: null,
  numero: null,
  tipo: 'remito_x',
  estado: 'borrador',
  clienteId: 1,
  proveedorId: null,
  facturaId: null,
  pedidoId: null,
  ordenEntregaId: null,
  fecha: new Date('2026-06-10T12:00:00.000Z'),
  fechaEntrega: null,
  observaciones: null,
  firmadoPor: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  cliente: { id: 1, codigo: 1, rsocial: 'Cliente SA', cuit: '20123456789', domicilio: null },
  proveedor: null,
  factura: null,
  pedido: null,
  ordenEntrega: null,
  items: [
    {
      id: 1,
      articuloId: 1,
      descripcion: 'Articulo',
      cantidad: 2,
      unidad: 'UN',
      articulo: { id: 1, codigo: 1, descripcion: 'Articulo', umedida: 'UN' },
    },
  ],
}

function buildPrisma(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    remito: {
      count: vi.fn().mockResolvedValue(1),
      findMany: vi.fn().mockResolvedValue([remitoRow]),
      findFirst: vi.fn().mockResolvedValue(remitoRow),
      create: vi.fn().mockResolvedValue(remitoRow),
      update: vi.fn().mockResolvedValue({ ...remitoRow, estado: 'emitido', prefijo: '0001', numero: 1 }),
    },
    remitoItem: { deleteMany: vi.fn().mockResolvedValue({ count: 0 }) },
    articulo: { count: vi.fn().mockResolvedValue(1) },
    paramEmpresa: { findFirst: vi.fn().mockResolvedValue({ nombre: 'Demo', cuit: '20123456789', domicilio: null, puntoVenta: 1, condicionIva: 'RI' }) },
    pedido: {
      findFirst: vi.fn().mockResolvedValue({
        id: 1,
        tenantId: 1,
        clienteId: 1,
        estado: 'confirmed',
        remito: null,
        items: [{ articuloId: 1, cantidad: 2, articulo: { id: 1, descripcion: 'Articulo', umedida: 'UN' } }],
      }),
    },
    factura: {
      findFirst: vi.fn().mockResolvedValue({
        id: 1,
        tenantId: 1,
        clienteId: 1,
        estado: 'A',
        remitos: [],
        items: [{ articuloId: 1, cantidad: 1, articulo: { id: 1, descripcion: 'Articulo', umedida: 'UN' } }],
      }),
    },
    auditEvent: { create: vi.fn().mockResolvedValue({}) },
    $transaction: vi.fn(async (fn: (tx: unknown) => Promise<unknown>) => {
      const tx = buildPrisma()
      return fn(tx)
    }),
    ...overrides,
  }
}

describe('remitos API (#230)', () => {
  let prisma: ReturnType<typeof buildPrisma>

  beforeEach(() => {
    prisma = buildPrisma()
  })

  it('GET /api/remitos lists remitos', async () => {
    const app = createApp(prisma as never)
    const res = await request(app).get('/api/remitos').expect(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toHaveLength(1)
    expect(res.body.data[0].referencia).toBe('BORRADOR')
  })

  it('POST /api/remitos creates borrador', async () => {
    const app = createApp(prisma as never)
    const res = await request(app)
      .post('/api/remitos')
      .send({
        tipo: 'remito_x',
        clienteId: 1,
        items: [{ articuloId: 1, descripcion: 'Articulo', cantidad: 2, unidad: 'UN' }],
      })
      .expect(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data.estado).toBe('borrador')
  })

  it('POST /api/pedidos/:id/remito creates from pedido', async () => {
    const app = createApp(prisma as never)
    const res = await request(app).post('/api/pedidos/1/remito').expect(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data.pedidoId).toBeNull()
  })

  it('POST /api/facturas/:id/remito creates from factura', async () => {
    const app = createApp(prisma as never)
    const res = await request(app).post('/api/facturas/1/remito').expect(201)
    expect(res.body.success).toBe(true)
  })
})
