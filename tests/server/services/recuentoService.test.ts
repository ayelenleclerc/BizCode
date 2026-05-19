import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { RecuentoService } from '../../../server/services/RecuentoService'

function buildRecuentoRow(estado: 'in_progress' | 'closed', cantFisica: number | null = null) {
  return {
    id: 1,
    tenantId: 1,
    operadorId: 9,
    estado,
    fecha: new Date('2026-05-20T10:00:00Z'),
    closedAt: estado === 'closed' ? new Date('2026-05-20T11:00:00Z') : null,
    createdAt: new Date(),
    updatedAt: new Date(),
    operador: { id: 9, username: 'wh1' },
    items: [
      {
        id: 100,
        recuentoId: 1,
        articuloId: 5,
        cantSistema: 10,
        cantFisica,
        articulo: { id: 5, codigo: 100, descripcion: 'Prod A' },
      },
    ],
  }
}

function buildPrisma(overrides: Partial<Record<string, unknown>> = {}): PrismaClient {
  const inProgress = buildRecuentoRow('in_progress', null)
  const base = {
    recuento: {
      count: vi.fn().mockResolvedValue(1),
      findMany: vi.fn().mockResolvedValue([inProgress]),
      findFirst: vi.fn().mockResolvedValue(inProgress),
      create: vi.fn().mockResolvedValue(inProgress),
      update: vi.fn().mockResolvedValue({ ...inProgress, estado: 'closed', closedAt: new Date() }),
    },
    recuentoItem: {
      update: vi.fn().mockResolvedValue({}),
    },
    articulo: {
      findMany: vi.fn().mockResolvedValue([{ id: 5, stock: 10 }]),
      findFirst: vi.fn().mockResolvedValue({ id: 5, stock: 10 }),
      update: vi.fn().mockResolvedValue({ id: 5, stock: 12 }),
    },
    stockAjuste: { create: vi.fn().mockResolvedValue({ id: 1 }) },
    ...overrides,
  }
  const prisma = {
    ...base,
    $transaction: vi.fn(async (fn: (tx: PrismaClient) => Promise<unknown>) => fn(prisma as PrismaClient)),
  } as unknown as PrismaClient
  return prisma
}

describe('RecuentoService.start', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('rejects when a count is already in progress', async () => {
    const prisma = buildPrisma({
      recuento: {
        count: vi.fn(),
        findMany: vi.fn(),
        findFirst: vi.fn().mockResolvedValue({ id: 2 }),
        create: vi.fn(),
        update: vi.fn(),
      },
    })
    const svc = new RecuentoService(prisma)
    const result = await svc.start(1, 9)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toBe('RECUENTO_ALREADY_OPEN')
  })

  it('creates snapshot items for active articles', async () => {
    const prisma = buildPrisma({
      recuento: {
        count: vi.fn(),
        findMany: vi.fn(),
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockImplementation(({ data }) =>
          Promise.resolve({
            ...buildRecuentoRow('in_progress'),
            items: data.items.create.map((line: { articuloId: number; cantSistema: number }, i: number) => ({
              id: i + 1,
              recuentoId: 1,
              articuloId: line.articuloId,
              cantSistema: line.cantSistema,
              cantFisica: null,
              articulo: { id: line.articuloId, codigo: 100, descripcion: 'Prod' },
            })),
          }),
        ),
        update: vi.fn(),
      },
    })
    const svc = new RecuentoService(prisma)
    const result = await svc.start(1, 9)
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.data.items).toHaveLength(1)
  })
})

describe('RecuentoService.close', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('rejects close when items are incomplete', async () => {
    const prisma = buildPrisma()
    const svc = new RecuentoService(prisma)
    const result = await svc.close(1, 1, 9)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toBe('RECUENTO_ITEMS_INCOMPLETE')
  })

  it('does not create StockAjuste when diff is zero', async () => {
    const counted = buildRecuentoRow('in_progress', 10)
    const stockCreate = vi.fn()
    const prisma = buildPrisma({
      recuento: {
        count: vi.fn(),
        findMany: vi.fn(),
        findFirst: vi.fn().mockResolvedValue(counted),
        create: vi.fn(),
        update: vi.fn().mockResolvedValue({ ...counted, estado: 'closed' }),
      },
      stockAjuste: { create: stockCreate },
    })
    const svc = new RecuentoService(prisma)
    const result = await svc.close(1, 1, 9)
    expect(result.ok).toBe(true)
    expect(stockCreate).not.toHaveBeenCalled()
  })

  it('creates StockAjuste when diff is non-zero', async () => {
    const counted = buildRecuentoRow('in_progress', 12)
    const closed = { ...counted, estado: 'closed' as const, closedAt: new Date() }
    const stockCreate = vi.fn().mockResolvedValue({ id: 1 })
    const articuloUpdate = vi.fn().mockResolvedValue({ id: 5, stock: 12 })
    const prisma = buildPrisma({
      recuento: {
        count: vi.fn(),
        findMany: vi.fn(),
        findFirst: vi.fn().mockResolvedValueOnce(counted).mockResolvedValueOnce(closed),
        create: vi.fn(),
        update: vi.fn().mockResolvedValue(closed),
      },
      articulo: {
        findMany: vi.fn(),
        findFirst: vi.fn().mockResolvedValue({ id: 5, stock: 10 }),
        update: articuloUpdate,
      },
      stockAjuste: { create: stockCreate },
    })
    const svc = new RecuentoService(prisma)
    const result = await svc.close(1, 1, 9)
    expect(result.ok).toBe(true)
    expect(stockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ cantidad: 2, motivo: 'recuento' }),
      }),
    )
    expect(articuloUpdate).toHaveBeenCalled()
  })
})
