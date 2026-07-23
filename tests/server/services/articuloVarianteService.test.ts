import { describe, expect, it, vi, beforeEach } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { ArticuloVarianteService } from '../../../apps/server/services/ArticuloVarianteService'
import { FacturaService } from '../../../apps/server/services/FacturaService'

function buildPrisma(overrides: Record<string, unknown> = {}): PrismaClient {
  return {
    articulo: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      aggregate: vi.fn(),
    },
    articuloOferta: {
      findMany: vi.fn(),
      create: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    categoriaAtributoValor: {
      findMany: vi.fn(),
    },
    articuloImagen: {
      count: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findFirst: vi.fn(),
    },
    $transaction: vi.fn(async (ops: unknown) => ops),
    ...overrides,
  } as unknown as PrismaClient
}

describe('ArticuloVarianteService.resolvePrecioCatalogo', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns oferta when active offer exists', async () => {
    const prisma = buildPrisma()
    ;(prisma.articulo.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 1,
      precioLista1: new Decimal(100),
      heredaPrecio: true,
      precioOverride: null,
      categoria: null,
      padre: null,
      ofertas: [{ id: 9, precioOferta: new Decimal(77) }],
    })
    const svc = new ArticuloVarianteService(prisma)
    const result = await svc.resolvePrecioCatalogo(1, 1)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.origen).toBe('oferta')
      expect(result.data.precio).toBe(77)
      expect(result.data.ofertaId).toBe(9)
    }
  })

  it('returns override_variante when heredaPrecio is false', async () => {
    const prisma = buildPrisma()
    ;(prisma.articulo.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 2,
      precioLista1: new Decimal(100),
      heredaPrecio: false,
      precioOverride: new Decimal(88),
      categoria: null,
      padre: null,
      ofertas: [],
    })
    const svc = new ArticuloVarianteService(prisma)
    const result = await svc.resolvePrecioCatalogo(1, 2)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.origen).toBe('override_variante')
      expect(result.data.precio).toBe(88)
    }
  })

  it('returns precio_subfamilia from category default', async () => {
    const prisma = buildPrisma()
    ;(prisma.articulo.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 3,
      precioLista1: new Decimal(100),
      heredaPrecio: true,
      precioOverride: null,
      categoria: { padreId: 1, precioDefault: new Decimal(55), padre: { precioDefault: new Decimal(40) } },
      padre: null,
      ofertas: [],
    })
    const svc = new ArticuloVarianteService(prisma)
    const result = await svc.resolvePrecioCatalogo(1, 3)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.origen).toBe('precio_subfamilia')
      expect(result.data.precio).toBe(55)
    }
  })

  it('falls back to precio_lista1', async () => {
    const prisma = buildPrisma()
    ;(prisma.articulo.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 4,
      precioLista1: new Decimal(123.45),
      heredaPrecio: true,
      precioOverride: null,
      categoria: null,
      padre: null,
      ofertas: [],
    })
    const svc = new ArticuloVarianteService(prisma)
    const result = await svc.resolvePrecioCatalogo(1, 4)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.origen).toBe('precio_lista1')
      expect(result.data.precio).toBe(123.45)
    }
  })
})

describe('ArticuloVarianteService.generarVariantes combinatorial', () => {
  it('creates cartesian product of attribute values', async () => {
    const prisma = buildPrisma()
    ;(prisma.articulo.findFirst as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        id: 10,
        tenantId: 1,
        descripcion: 'Remera',
        padreId: null,
        rubroId: 1,
        categoriaId: 2,
        condIva: '1',
        umedida: 'UN',
        tipo: 'articulo',
        unidadServicio: null,
        mesesGarantia: null,
        precioLista1: new Decimal(100),
        precioLista2: new Decimal(100),
        costo: new Decimal(50),
        minimo: 0,
      })
      .mockResolvedValue(null)
    ;(prisma.categoriaAtributoValor.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: 1, atributoId: 100, valor: 'Roja', atributo: { id: 100, nombre: 'Color', categoriaId: 2, tenantId: 1, orden: 0 } },
      { id: 2, atributoId: 100, valor: 'Azul', atributo: { id: 100, nombre: 'Color', categoriaId: 2, tenantId: 1, orden: 0 } },
      { id: 3, atributoId: 101, valor: 'S', atributo: { id: 101, nombre: 'Talle', categoriaId: 2, tenantId: 1, orden: 1 } },
      { id: 4, atributoId: 101, valor: 'M', atributo: { id: 101, nombre: 'Talle', categoriaId: 2, tenantId: 1, orden: 1 } },
    ])
    ;(prisma.articulo.aggregate as ReturnType<typeof vi.fn>).mockResolvedValue({ _max: { codigo: 10 } })
    ;(prisma.articulo.update as ReturnType<typeof vi.fn>).mockResolvedValue({})
    let codigo = 11
    ;(prisma.articulo.create as ReturnType<typeof vi.fn>).mockImplementation(async ({ data }: { data: { codigo: number; descripcion: string } }) => {
      const id = codigo
      codigo += 1
      return {
        id,
        codigo: data.codigo,
        descripcion: data.descripcion,
        padreId: 10,
        esPadre: false,
        categoriaId: 2,
        heredaPrecio: true,
        precioOverride: null,
        costoOverride: null,
        precioLista1: new Decimal(100),
        costo: new Decimal(50),
        stock: 0,
        activo: true,
        atributoValores: [],
      }
    })

    const svc = new ArticuloVarianteService(prisma)
    const result = await svc.generarVariantes(1, 10, {
      atributoValorIdsPorAtributo: [
        [1, 2],
        [3, 4],
      ],
    })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.creadas).toBe(4)
    }
    expect(prisma.articulo.create).toHaveBeenCalledTimes(4)
  })
})

describe('FacturaService rejects parent articles', () => {
  it('returns 400 when articuloId is a parent', async () => {
    const prisma = {
      articulo: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 5,
            codigo: 5,
            descripcion: 'Padre',
            stock: 0,
            minimo: 0,
            tipo: 'articulo',
            condIva: '1',
            unidadServicio: null,
            mesesGarantia: null,
            esPadre: true,
          },
        ]),
      },
      cliente: { findFirst: vi.fn() },
    } as unknown as PrismaClient
    const svc = new FacturaService(prisma)
    const result = await svc.create(
      1,
      {
        clienteId: 1,
        tipoCbte: 'A',
        items: [
          {
            articuloId: 5,
            cantidad: 1,
            precio: 10,
            dscto: 0,
            subtotal: 10,
          },
        ],
      } as never,
      1,
    )
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.status).toBe(400)
      expect(result.error).toMatch(/variant/i)
    }
  })
})
