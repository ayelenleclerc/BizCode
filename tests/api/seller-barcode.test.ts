import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { Prisma } from '@prisma/client'
import request from 'supertest'
import { createApp } from '../../apps/server/createApp'
import { ArticuloService } from '../../apps/server/services/ArticuloService'
import { assertMatchesOpenApi } from './validate-openapi-response'

vi.mock('../../apps/server/lib/sharedRedis', () => ({
  getSharedRedisClient: () => null,
  resetSharedRedisClientForTests: () => undefined,
  disconnectSharedRedisClient: async () => undefined,
}))

describe('ArticuloService barcode (#255)', () => {
  let prisma: PrismaClient
  let service: ArticuloService

  beforeEach(() => {
    prisma = {
      rubro: {
        findFirst: vi.fn().mockResolvedValue({ id: 5 }),
      },
      articulo: {
        count: vi.fn().mockResolvedValue(0),
        findMany: vi.fn().mockResolvedValue([]),
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi.fn(),
        update: vi.fn(),
      },
    } as unknown as PrismaClient
    service = new ArticuloService(prisma)
  })

  it('normalizes empty barcode to null', () => {
    expect(ArticuloService.normalizeCodigoBarras('  ')).toBeNull()
    expect(ArticuloService.normalizeCodigoBarras('7791234099876')).toBe('7791234099876')
  })

  it('findByBarcode ignores inactive/parent/service', async () => {
    vi.mocked(prisma.articulo.findFirst).mockResolvedValue({
      id: 10,
      codigoBarras: '7791234099876',
      descripcion: 'Leche',
    } as never)
    const hit = await service.findByBarcode(1, ' 7791234099876 ')
    expect(hit?.id).toBe(10)
    expect(prisma.articulo.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          codigoBarras: '7791234099876',
          activo: true,
          esPadre: false,
          NOT: { tipo: 'servicio' },
        }),
      }),
    )
  })

  it('returns empty when barcode blank', async () => {
    await expect(service.findByBarcode(1, '   ')).resolves.toBeNull()
    expect(prisma.articulo.findFirst).not.toHaveBeenCalled()
  })

  it('maps unique barcode conflict to 409', async () => {
    vi.mocked(prisma.articulo.create).mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('unique', {
        code: 'P2002',
        clientVersion: 'test',
        meta: { target: ['tenantId', 'codigoBarras'] },
      }),
    )
    const result = await service.create(1, {
      codigo: 99,
      codigoBarras: '7791234099876',
      descripcion: 'Dup',
      rubroId: 5,
      condIva: '1',
      umedida: 'UN',
      precioLista1: 10,
      precioLista2: 10,
      costo: 5,
      stock: 1,
      minimo: 0,
      activo: true,
    })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.status).toBe(409)
      expect(result.error).toContain('codigoBarras')
    }
  })
})

describe('GET /api/articulos?codigoBarras (#255)', () => {
  beforeEach(() => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'seller'
    process.env.BIZCODE_TEST_USER_ID = '1'
    process.env.BIZCODE_TEST_TENANT_ID = '1'
  })

  it('returns sellable hit for exact barcode', async () => {
    const prisma = {
      articulo: {
        findFirst: vi.fn().mockResolvedValue({
          id: 10,
          codigo: 100,
          codigoBarras: '7791234099876',
          descripcion: 'Leche',
          rubroId: 1,
          activo: true,
          esPadre: false,
          tipo: 'articulo',
          precioLista1: 100,
          stock: 48,
          rubro: { id: 1, codigo: 1, nombre: 'Lacteos' },
        }),
      },
    } as unknown as PrismaClient
    const app = createApp(prisma)
    const res = await request(app).get('/api/articulos').query({ codigoBarras: '7791234099876' })
    expect(res.status).toBe(200)
    expect(res.body.data).toHaveLength(1)
    expect(res.body.data[0].codigoBarras).toBe('7791234099876')
    assertMatchesOpenApi('/api/articulos', 'get', '200', res.body)
  })

  it('returns empty list when barcode not found', async () => {
    const prisma = {
      articulo: {
        findFirst: vi.fn().mockResolvedValue(null),
      },
    } as unknown as PrismaClient
    const app = createApp(prisma)
    const res = await request(app).get('/api/articulos').query({ codigoBarras: '0000000000000' })
    expect(res.status).toBe(200)
    expect(res.body.data).toEqual([])
    assertMatchesOpenApi('/api/articulos', 'get', '200', res.body)
  })
})
