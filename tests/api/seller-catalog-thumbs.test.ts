import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import request from 'supertest'
import { createApp } from '../../apps/server/createApp'
import { assertMatchesOpenApi } from './validate-openapi-response'

vi.mock('../../apps/server/lib/sharedRedis', () => ({
  getSharedRedisClient: () => null,
  resetSharedRedisClientForTests: () => undefined,
  disconnectSharedRedisClient: async () => undefined,
}))

describe('GET /api/articulos urlThumb (#257)', () => {
  beforeEach(() => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'seller'
    process.env.BIZCODE_TEST_USER_ID = '1'
    process.env.BIZCODE_TEST_TENANT_ID = '1'
  })

  it('returns urlThumb on list when principal image exists', async () => {
    const prisma = {
      articulo: {
        count: vi.fn().mockResolvedValue(1),
        findMany: vi.fn().mockResolvedValue([
          {
            id: 20,
            codigo: 100,
            descripcion: 'Leche',
            rubroId: 1,
            activo: true,
            esPadre: false,
            precioLista1: 8400,
            stock: 48,
            rubro: { id: 1, codigo: 1, nombre: 'Lacteos' },
            imagenes: [{ pathThumb: '1/20/a-thumb.webp' }],
          },
        ]),
      },
    } as unknown as PrismaClient
    const app = createApp(prisma)
    const res = await request(app).get('/api/articulos').query({ limit: 50 })
    expect(res.status).toBe(200)
    expect(res.body.data[0].urlThumb).toBe('/uploads/articulos/1/20/a-thumb.webp')
    assertMatchesOpenApi('/api/articulos', 'get', '200', res.body)
  })

  it('returns null urlThumb when article has no image', async () => {
    const prisma = {
      articulo: {
        findFirst: vi.fn().mockResolvedValue({
          id: 21,
          codigo: 101,
          descripcion: 'Sin foto',
          rubroId: 1,
          activo: true,
          esPadre: false,
          precioLista1: 10,
          stock: 1,
          rubro: { id: 1, codigo: 1, nombre: 'Lacteos' },
          imagenes: [],
        }),
      },
    } as unknown as PrismaClient
    const app = createApp(prisma)
    const res = await request(app).get('/api/articulos/21')
    expect(res.status).toBe(200)
    expect(res.body.data.urlThumb).toBeNull()
    assertMatchesOpenApi('/api/articulos/{id}', 'get', '200', res.body)
  })
})
