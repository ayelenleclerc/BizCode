import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { ArticuloService, attachArticuloUrlThumb } from '../../../apps/server/services/ArticuloService'

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

  it('attaches urlThumb from principal image (#257)', () => {
    const withImage = attachArticuloUrlThumb({
      id: 20,
      descripcion: 'Leche',
      rubro: { id: 1, nombre: 'Lacteos' },
      imagenes: [{ pathThumb: '1/20/a-thumb.webp' }],
    } as never)
    expect(withImage.urlThumb).toBe('/uploads/articulos/1/20/a-thumb.webp')
    expect('imagenes' in withImage).toBe(false)

    const without = attachArticuloUrlThumb({
      id: 21,
      descripcion: 'Sin foto',
      rubro: { id: 1, nombre: 'Lacteos' },
      imagenes: [],
    } as never)
    expect(without.urlThumb).toBeNull()
  })

  it('list maps urlThumb (#257)', async () => {
    vi.mocked(prisma.articulo.count).mockResolvedValue(1)
    vi.mocked(prisma.articulo.findMany).mockResolvedValue([
      {
        id: 20,
        descripcion: 'Leche',
        rubro: { id: 1, nombre: 'Lacteos' },
        imagenes: [{ pathThumb: '1/20/a-thumb.webp' }],
      },
    ] as never)
    const result = await service.list(1, '', 50, 0)
    expect(result.total).toBe(1)
    expect(result.articulos[0]?.urlThumb).toBe('/uploads/articulos/1/20/a-thumb.webp')
  })

  it('materializes precioLista1 from FX origin × current rate (#243)', async () => {
    const { Decimal } = await import('@prisma/client/runtime/library')
    vi.mocked(prisma.rubro.findFirst).mockResolvedValue({ id: 5 } as never)
    Object.assign(prisma, {
      tenantConfig: {
        findUnique: vi.fn().mockResolvedValue({ tipoCambioPreferido: 'oficial' }),
      },
      tipoCambio: {
        findFirst: vi.fn().mockResolvedValue({
          id: 1,
          tenantId: 1,
          moneda: 'USD',
          tipo: 'oficial',
          valor: new Decimal(1100),
          fecha: new Date('2026-07-24T12:00:00.000Z'),
          fuente: 'manual',
          createdById: null,
          createdAt: new Date('2026-07-24T12:00:00.000Z'),
        }),
      },
    })
    vi.mocked(prisma.articulo.create).mockResolvedValue({ id: 8 } as never)

    const result = await service.create(1, {
      codigo: 21,
      descripcion: 'USD articulo',
      rubroId: 5,
      condIva: '1',
      umedida: 'UN',
      precioLista1: 1,
      precioLista2: 1,
      costo: 1,
      stock: 1,
      minimo: 0,
      activo: true,
      monedaPrecio: 'USD',
      precioEnMonedaOrigen: 10,
    })

    expect(result.ok).toBe(true)
    expect(prisma.articulo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          monedaPrecio: 'USD',
          precioEnMonedaOrigen: 10,
          precioLista1: 11000,
        }),
      }),
    )
  })
})
