import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { RepartoService } from '../../../apps/server/services/RepartoService'
import { POD_MAX_FIRMA_BYTES } from '../../../apps/server/lib/podMediaValidation'

const TEST_FIRMA =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='

const ordenPending = {
  id: 10,
  estado: 'ready',
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
      receptorNombre: null,
      receptorDni: null,
      notasEntrega: null,
      podMedia: null,
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
    factura: { findMany: vi.fn().mockResolvedValue([]) },
    reciboCobroImputacion: { groupBy: vi.fn().mockResolvedValue([]) },
    repartoItem: {
      findFirst: vi.fn().mockResolvedValue(null),
      update: vi.fn(),
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

describe('RepartoService.updateItemPod', () => {
  const onRouteItem = {
    ...repartoRow.items[0],
    estado: 'pending',
  }

  it('rejects delivered without firma', async () => {
    const prisma = buildPrisma({
      reparto: {
        count: vi.fn(),
        findMany: vi.fn(),
        findFirst: vi.fn().mockResolvedValue({ id: 1, estado: 'on_route', choferId: 5, tenantId: 1 }),
        create: vi.fn(),
        update: vi.fn(),
      },
      repartoItem: {
        findFirst: vi.fn().mockResolvedValue(onRouteItem),
        update: vi.fn(),
        updateMany: vi.fn(),
      },
    })
    const svc = new RepartoService(prisma)
    const result = await svc.updateItemPod(
      1,
      1,
      100,
      { outcome: 'delivered', receptorNombre: 'Ana', firmaBase64: '' },
      { userId: 5, role: 'driver' },
    )
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toBe('POD_FIRMA_REQUIRED')
  })

  it('records delivered with firma and sets hasPod', async () => {
    const updated = {
      ...onRouteItem,
      estado: 'delivered',
      entregadoAt: new Date(),
      receptorNombre: 'Ana',
      podMedia: { firmaBase64: TEST_FIRMA },
    }
    const prisma = buildPrisma({
      reparto: {
        count: vi.fn(),
        findMany: vi.fn(),
        findFirst: vi.fn().mockResolvedValue({ id: 1, estado: 'on_route', choferId: 5, tenantId: 1 }),
        create: vi.fn(),
        update: vi.fn(),
      },
      repartoItem: {
        findFirst: vi.fn().mockResolvedValue(onRouteItem),
        update: vi.fn().mockResolvedValue(updated),
        updateMany: vi.fn(),
      },
      ordenEntrega: {
        findMany: vi.fn(),
        updateMany: vi.fn(),
        update: vi.fn().mockResolvedValue({}),
      },
    })
    const svc = new RepartoService(prisma)
    const result = await svc.updateItemPod(
      1,
      1,
      100,
      { outcome: 'delivered', receptorNombre: 'Ana', firmaBase64: TEST_FIRMA },
      { userId: 5, role: 'driver' },
    )
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.item.estado).toBe('delivered')
      expect(result.data.item.hasPod).toBe(true)
      expect(result.data.auditSigned).toBe(true)
    }
  })

  it('rejects not_delivered without motivo', async () => {
    const prisma = buildPrisma({
      reparto: {
        count: vi.fn(),
        findMany: vi.fn(),
        findFirst: vi.fn().mockResolvedValue({ id: 1, estado: 'on_route', choferId: 5, tenantId: 1 }),
        create: vi.fn(),
        update: vi.fn(),
      },
      repartoItem: {
        findFirst: vi.fn().mockResolvedValue(onRouteItem),
        update: vi.fn(),
        updateMany: vi.fn(),
      },
    })
    const svc = new RepartoService(prisma)
    const result = await svc.updateItemPod(
      1,
      1,
      100,
      { outcome: 'not_delivered' },
      { userId: 5, role: 'driver' },
    )
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toBe('INVALID_MOTIVO_NO_ENTREGA')
  })

  it('rejects firma larger than limit', async () => {
    const huge = `data:image/png;base64,${'A'.repeat(POD_MAX_FIRMA_BYTES * 2)}`
    const prisma = buildPrisma({
      reparto: {
        count: vi.fn(),
        findMany: vi.fn(),
        findFirst: vi.fn().mockResolvedValue({ id: 1, estado: 'on_route', choferId: 5, tenantId: 1 }),
        create: vi.fn(),
        update: vi.fn(),
      },
      repartoItem: {
        findFirst: vi.fn().mockResolvedValue(onRouteItem),
        update: vi.fn(),
        updateMany: vi.fn(),
      },
    })
    const svc = new RepartoService(prisma)
    const result = await svc.updateItemPod(
      1,
      1,
      100,
      { outcome: 'delivered', receptorNombre: 'Ana', firmaBase64: huge },
      { userId: 5, role: 'driver' },
    )
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toBe('POD_FIRMA_TOO_LARGE')
  })
})

describe('RepartoService.getItemPod', () => {
  it('returns 403 for driver role', async () => {
    const prisma = buildPrisma()
    const svc = new RepartoService(prisma)
    const result = await svc.getItemPod(1, 1, 100, 'driver')
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.status).toBe(403)
  })

  it('returns pod media for planner', async () => {
    const item = {
      ...repartoRow.items[0],
      estado: 'delivered',
      podMedia: { firmaBase64: TEST_FIRMA },
      receptorNombre: 'Ana',
    }
    const prisma = buildPrisma({
      repartoItem: {
        findFirst: vi.fn().mockResolvedValue(item),
        update: vi.fn(),
        updateMany: vi.fn(),
      },
    })
    const svc = new RepartoService(prisma)
    const result = await svc.getItemPod(1, 1, 100, 'logistics_planner')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.podMedia?.firmaBase64).toBe(TEST_FIRMA)
    }
  })
})

describe('RepartoService.getMine (#160)', () => {
  it('prefers on_route over planned for the same day', async () => {
    const onRoute = { ...repartoRow, id: 2, estado: 'on_route' }
    const findFirst = vi.fn().mockResolvedValueOnce(onRoute)
    const prisma = buildPrisma({
      reparto: {
        count: vi.fn(),
        findMany: vi.fn(),
        findFirst,
        create: vi.fn(),
        update: vi.fn(),
      },
    })
    const svc = new RepartoService(prisma)
    const result = await svc.getMine(1, 5, new Date('2026-05-20'))
    expect(result?.id).toBe(2)
    expect(findFirst).toHaveBeenCalledTimes(1)
  })

  it('returns null when the driver has no planned or on_route row', async () => {
    const prisma = buildPrisma({
      reparto: {
        count: vi.fn(),
        findMany: vi.fn(),
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi.fn(),
        update: vi.fn(),
      },
    })
    const svc = new RepartoService(prisma)
    const result = await svc.getMine(1, 5, new Date('2026-05-20'))
    expect(result).toBeNull()
  })
})
