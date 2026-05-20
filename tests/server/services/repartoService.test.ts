import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { RepartoService } from '../../../server/services/RepartoService'

const ordenPending = {
  id: 10,
  estado: 'pending',
  fecha: new Date('2026-05-20'),
}

const repartoRow = {
  id: 1,
  tenantId: 1,
  fecha: new Date('2026-05-20'),
  choferId: 5,
  estado: 'planned',
  vehiculo: 'Van 1',
  observaciones: null,
  closedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  chofer: { id: 5, username: 'driver1', role: 'driver' },
  items: [
    {
      id: 100,
      repartoId: 1,
      ordenEntregaId: 10,
      secuencia: 1,
      estado: 'pending',
      entregadoAt: null,
      motivoNoEntrega: null,
      ordenEntrega: {
        id: 10,
        tenantId: 1,
        clienteId: 1,
        estado: 'assigned',
        fecha: new Date(),
        cliente: { id: 1, codigo: 1, rsocial: 'Cliente' },
        zona: null,
        factura: null,
      },
    },
  ],
}

function buildPrisma(overrides: Partial<Record<string, unknown>> = {}): PrismaClient {
  const base = {
    appUser: {
      findFirst: vi.fn().mockResolvedValue({ id: 5 }),
    },
    ordenEntrega: {
      findMany: vi.fn().mockResolvedValue([ordenPending]),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
    },
    repartoItem: {
      findFirst: vi.fn().mockResolvedValue(null),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
    },
    reparto: {
      count: vi.fn().mockResolvedValue(1),
      findMany: vi.fn().mockResolvedValue([repartoRow]),
      findFirst: vi.fn().mockResolvedValue(repartoRow),
      create: vi.fn().mockResolvedValue(repartoRow),
      update: vi.fn().mockResolvedValue({ ...repartoRow, estado: 'on_route' }),
    },
    ...overrides,
  }
  const prisma = {
    ...base,
    $transaction: vi.fn(async (fn: (tx: PrismaClient) => Promise<unknown>) => fn(prisma as PrismaClient)),
  } as unknown as PrismaClient
  return prisma
}

describe('RepartoService.create', () => {
  beforeEach(() => vi.clearAllMocks())

  it('rejects when OE is already on an active route', async () => {
    const prisma = buildPrisma({
      repartoItem: {
        findFirst: vi.fn().mockResolvedValue({ ordenEntregaId: 10 }),
      },
    })
    const svc = new RepartoService(prisma)
    const result = await svc.create(1, {
      fecha: '2026-05-20',
      choferId: 5,
      ordenEntregaIds: [10],
    })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toBe('ORDEN_ALREADY_IN_ACTIVE_REPARTO')
  })

  it('creates route and assigns orders', async () => {
    const prisma = buildPrisma()
    const svc = new RepartoService(prisma)
    const result = await svc.create(1, {
      fecha: '2026-05-20',
      choferId: 5,
      vehiculo: 'Van 1',
      ordenEntregaIds: [10],
    })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.estado).toBe('planned')
      expect(result.data.progress.total).toBe(1)
    }
    expect(prisma.ordenEntrega.updateMany).toHaveBeenCalled()
  })
})

describe('RepartoService.cerrar', () => {
  it('marks pending items not_delivered and OEs failed', async () => {
    const onRoute = { ...repartoRow, estado: 'on_route' }
    const prisma = buildPrisma({
      reparto: {
        count: vi.fn(),
        findMany: vi.fn(),
        findFirst: vi.fn().mockResolvedValue(onRoute),
        create: vi.fn(),
        update: vi.fn().mockResolvedValue({
          ...onRoute,
          estado: 'completed',
          closedAt: new Date(),
          items: [{ ...onRoute.items[0], estado: 'not_delivered' }],
        }),
      },
    })
    const svc = new RepartoService(prisma)
    const result = await svc.cerrar(1, 1)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.summary.pendingClosed).toBe(1)
      expect(result.data.reparto.estado).toBe('completed')
    }
    expect(prisma.repartoItem.updateMany).toHaveBeenCalled()
    expect(prisma.ordenEntrega.updateMany).toHaveBeenCalled()
  })
})
