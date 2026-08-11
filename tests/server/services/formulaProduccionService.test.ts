import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { FormulaProduccionService } from '../../../apps/server/services/FormulaProduccionService'

describe('FormulaProduccionService (#248)', () => {
  let prisma: PrismaClient
  let service: FormulaProduccionService

  beforeEach(() => {
    prisma = {
      articulo: {
        findFirst: vi.fn().mockResolvedValue({ id: 10, esPadre: false }),
        findMany: vi.fn().mockResolvedValue([{ id: 2 }, { id: 3 }]),
      },
      formulaProduccion: {
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi.fn(),
        update: vi.fn(),
        count: vi.fn().mockResolvedValue(0),
        findMany: vi.fn().mockResolvedValue([]),
      },
      $transaction: vi.fn(),
    } as unknown as PrismaClient
    service = new FormulaProduccionService(prisma)
  })

  it('creates v1 active formula', async () => {
    const created = {
      id: 1,
      tenantId: 1,
      articuloId: 10,
      rendimiento: new Decimal(12),
      unidadRendimiento: 'unidad',
      version: 1,
      activa: true,
      observaciones: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      articulo: {
        id: 10,
        codigo: 100,
        descripcion: 'Finished',
        costo: new Decimal(0),
        precioLista1: new Decimal(100),
      },
      insumos: [],
    }
    vi.mocked(prisma.formulaProduccion.create).mockResolvedValue(created as never)

    const result = await service.create(1, {
      articuloId: 10,
      rendimiento: 12,
      insumos: [
        { articuloId: 2, cantidad: 0.5, unidad: 'kg' },
        { articuloId: 3, cantidad: 0.2, unidad: 'kg' },
      ],
    })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.version).toBe(1)
      expect(result.data.activa).toBe(true)
    }
  })

  it('versions on update: deactivates previous and creates next version', async () => {
    const current = {
      id: 1,
      tenantId: 1,
      articuloId: 10,
      rendimiento: new Decimal(12),
      unidadRendimiento: 'unidad',
      version: 1,
      activa: true,
      observaciones: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      articulo: {
        id: 10,
        codigo: 100,
        descripcion: 'Finished',
        costo: new Decimal(0),
        precioLista1: new Decimal(100),
      },
      insumos: [],
    }
    const next = { ...current, id: 2, version: 2, activa: true }
    vi.mocked(prisma.formulaProduccion.findFirst).mockResolvedValue(current as never)
    vi.mocked(prisma.$transaction).mockImplementation(async (fn) => {
      const tx = {
        formulaProduccion: {
          update: vi.fn().mockResolvedValue({ ...current, activa: false }),
          create: vi.fn().mockResolvedValue(next),
        },
      }
      return fn(tx as never)
    })

    const result = await service.update(1, 1, {
      rendimiento: 10,
      insumos: [
        { articuloId: 2, cantidad: 1, unidad: 'kg' },
        { articuloId: 3, cantidad: 0.5, unidad: 'kg' },
      ],
    })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.id).toBe(2)
      expect(result.data.version).toBe(2)
    }
  })
})
