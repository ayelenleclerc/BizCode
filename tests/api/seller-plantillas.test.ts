import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { createApp } from '../../apps/server/createApp'
import { assertMatchesOpenApi } from './validate-openapi-response'
import { classifyRepeatSource } from '../../apps/server/services/PlantillaPedidoService'

const NOW = new Date('2026-08-01T12:00:00.000Z')

function buildPrismaMock(overrides: Partial<Record<string, unknown>> = {}): PrismaClient {
  return {
    cliente: {
      findFirst: vi.fn().mockResolvedValue({ id: 2 }),
    },
    pedido: {
      findFirst: vi.fn().mockResolvedValue({
        id: 9,
        createdAt: NOW,
        items: [
          { articuloId: 10, descripcion: 'Leche', cantidad: { toString: () => '12' } },
          { articuloId: 11, descripcion: 'Azucar', cantidad: { toString: () => '6' } },
          { articuloId: null, descripcion: 'Servicio', cantidad: { toString: () => '1' } },
        ],
      }),
    },
    articulo: {
      findMany: vi.fn().mockResolvedValue([
        {
          id: 10,
          descripcion: 'Leche',
          condIva: '1',
          activo: true,
          esPadre: false,
          precioLista1: { toString: () => '100.00' },
          stock: { toString: () => '50' },
        },
        {
          id: 11,
          descripcion: 'Azucar',
          condIva: '1',
          activo: false,
          esPadre: false,
          precioLista1: { toString: () => '80.00' },
          stock: { toString: () => '10' },
        },
      ]),
    },
    plantillaPedido: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    plantillaPedidoItem: {
      deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
    },
    ...overrides,
  } as unknown as PrismaClient
}

describe('classifyRepeatSource (#253)', () => {
  it('omits inactive, parent, missing and service lines', () => {
    expect(classifyRepeatSource({ articuloId: null })).toBe('service')
    expect(classifyRepeatSource({ articuloId: 1, articulo: null })).toBe('missing')
    expect(classifyRepeatSource({ articuloId: 1, articulo: { activo: true, esPadre: true } })).toBe('parent')
    expect(classifyRepeatSource({ articuloId: 1, articulo: { activo: false, esPadre: false } })).toBe('inactive')
    expect(classifyRepeatSource({ articuloId: 1, articulo: { activo: true, esPadre: false } })).toBeNull()
  })
})

describe('plantilla / last-order APIs (#253)', () => {
  beforeEach(() => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'seller'
    process.env.BIZCODE_TEST_USER_ID = '1'
    process.env.BIZCODE_TEST_TENANT_ID = '1'
  })

  it('GET ultimo-pedido-repeat omits inactive items and matches OpenAPI', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/clientes/2/ultimo-pedido-repeat')
    expect(res.status).toBe(200)
    expect(res.body.data.lines).toHaveLength(1)
    expect(res.body.data.lines[0].articuloId).toBe(10)
    expect(res.body.data.omittedCount).toBe(2)
    expect(res.body.data.omitted.map((o: { reason: string }) => o.reason).sort()).toEqual([
      'inactive',
      'service',
    ])
    assertMatchesOpenApi('/api/clientes/{id}/ultimo-pedido-repeat', 'get', '200', res.body)
  })

  it('GET ultimo-pedido-repeat returns 404 when there is no history', async () => {
    const prisma = buildPrismaMock({
      pedido: { findFirst: vi.fn().mockResolvedValue(null) },
    })
    const app = createApp(prisma)
    const res = await request(app).get('/api/clientes/2/ultimo-pedido-repeat')
    expect(res.status).toBe(404)
  })

  it('POST plantilla + GET list match OpenAPI', async () => {
    const created = {
      id: 1,
      tenantId: 1,
      clienteId: 2,
      vendedorId: 1,
      nombre: 'Habitual',
      activa: true,
      createdAt: NOW,
      updatedAt: NOW,
      items: [{ id: 1, articuloId: 10, cantidad: { toString: () => '12' }, activo: true, orden: 0 }],
    }
    const prisma = buildPrismaMock({
      articulo: {
        findMany: vi.fn().mockResolvedValue([{ id: 10, esPadre: false }]),
      },
      plantillaPedido: {
        findMany: vi.fn().mockResolvedValue([created]),
        findFirst: vi.fn(),
        create: vi.fn().mockResolvedValue(created),
        update: vi.fn(),
        delete: vi.fn(),
      },
    })
    const app = createApp(prisma)
    const createdRes = await request(app)
      .post('/api/clientes/2/plantillas-pedido')
      .send({ nombre: 'Habitual', items: [{ articuloId: 10, cantidad: 12 }] })
    expect(createdRes.status).toBe(201)
    assertMatchesOpenApi('/api/clientes/{id}/plantillas-pedido', 'post', '201', createdRes.body)

    const listRes = await request(app).get('/api/clientes/2/plantillas-pedido')
    expect(listRes.status).toBe(200)
    expect(listRes.body.data).toHaveLength(1)
    assertMatchesOpenApi('/api/clientes/{id}/plantillas-pedido', 'get', '200', listRes.body)
  })

  it('GET cargar plantilla matches OpenAPI', async () => {
    const plantilla = {
      id: 1,
      tenantId: 1,
      clienteId: 2,
      vendedorId: 1,
      nombre: 'Habitual',
      activa: true,
      createdAt: NOW,
      updatedAt: NOW,
      items: [
        { id: 1, articuloId: 10, cantidad: { toString: () => '12' }, activo: true, orden: 0 },
        { id: 2, articuloId: 11, cantidad: { toString: () => '6' }, activo: false, orden: 1 },
      ],
    }
    const prisma = buildPrismaMock({
      plantillaPedido: {
        findMany: vi.fn(),
        findFirst: vi.fn().mockResolvedValue(plantilla),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      articulo: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 10,
            descripcion: 'Leche',
            condIva: '1',
            activo: true,
            esPadre: false,
            precioLista1: { toString: () => '100.00' },
            stock: { toString: () => '50' },
          },
        ]),
      },
    })
    const app = createApp(prisma)
    const res = await request(app).get('/api/plantillas-pedido/1/cargar')
    expect(res.status).toBe(200)
    expect(res.body.data.lines).toHaveLength(1)
    expect(res.body.data.source).toBe('plantilla')
    assertMatchesOpenApi('/api/plantillas-pedido/{id}/cargar', 'get', '200', res.body)
  })

  it('PATCH and DELETE plantilla match OpenAPI', async () => {
    const existing = {
      id: 1,
      tenantId: 1,
      clienteId: 2,
      vendedorId: 1,
      nombre: 'Habitual',
      activa: true,
      createdAt: NOW,
      updatedAt: NOW,
      items: [{ id: 1, articuloId: 10, cantidad: { toString: () => '12' }, activo: true, orden: 0 }],
    }
    const patched = { ...existing, nombre: 'Fin de mes' }
    const prisma = buildPrismaMock({
      plantillaPedido: {
        findMany: vi.fn(),
        findFirst: vi.fn().mockResolvedValue({ id: 1 }),
        create: vi.fn(),
        update: vi.fn().mockResolvedValue(patched),
        delete: vi.fn().mockResolvedValue(existing),
      },
    })
    const app = createApp(prisma)
    const patchRes = await request(app).patch('/api/plantillas-pedido/1').send({ nombre: 'Fin de mes' })
    expect(patchRes.status).toBe(200)
    expect(patchRes.body.data.nombre).toBe('Fin de mes')
    assertMatchesOpenApi('/api/plantillas-pedido/{id}', 'patch', '200', patchRes.body)

    const delRes = await request(app).delete('/api/plantillas-pedido/1')
    expect(delRes.status).toBe(200)
    expect(delRes.body.data).toEqual({ id: 1 })
    assertMatchesOpenApi('/api/plantillas-pedido/{id}', 'delete', '200', delRes.body)
  })
})
