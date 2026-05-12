import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { ArticuloService } from '../../../server/services/ArticuloService'

describe('ArticuloService', () => {
  let prisma: PrismaClient
  let service: ArticuloService

  beforeEach(() => {
    prisma = {
      rubro: {
        findFirst: vi.fn().mockResolvedValue(null),
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

  it('rejects create when rubroId is not in tenant', async () => {
    const result = await service.create(1, {
      codigo: 20,
      descripcion: 'Articulo test',
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
      expect(result.status).toBe(400)
      expect(result.error).toContain('rubroId')
    }
    expect(prisma.articulo.create).not.toHaveBeenCalled()
  })
})
