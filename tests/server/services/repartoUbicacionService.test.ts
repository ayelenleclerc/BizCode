import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Prisma } from '@prisma/client'
import type { PrismaClient } from '@prisma/client'
import { RepartoUbicacionService, UBICACION_RETENTION_DAYS } from '../../../apps/server/services/RepartoUbicacionService'

const onRouteReparto = {
  id: 1,
  tenantId: 1,
  choferId: 5,
  estado: 'on_route',
}

const activoReparto = {
  ...onRouteReparto,
  fecha: new Date('2026-05-20'),
  vehiculo: null,
  observaciones: null,
  chofer: { id: 5, username: 'driver1', role: 'driver' },
  items: [
    {
      secuencia: 1,
      estado: 'pending',
      ordenEntrega: {
        cliente: { id: 1, codigo: 1, rsocial: 'Cliente', domicilio: 'Calle 1' },
        zona: null,
      },
    },
  ],
}

function buildPrisma(overrides: Partial<Record<string, unknown>> = {}): PrismaClient {
  return {
    reparto: {
      findFirst: vi.fn().mockResolvedValue(onRouteReparto),
      findMany: vi.fn().mockResolvedValue([activoReparto]),
    },
    repartoUbicacion: {
      create: vi.fn().mockResolvedValue({
        lat: new Prisma.Decimal(-34.6),
        lng: new Prisma.Decimal(-58.4),
        recordedAt: new Date('2026-05-26T12:00:00.000Z'),
      }),
      deleteMany: vi.fn().mockResolvedValue({ count: 2 }),
      findFirst: vi.fn().mockResolvedValue({
        lat: new Prisma.Decimal(-34.6),
        lng: new Prisma.Decimal(-58.4),
        recordedAt: new Date('2026-05-26T12:00:00.000Z'),
      }),
      findMany: vi.fn().mockResolvedValue([
        {
          repartoId: 1,
          lat: new Prisma.Decimal(-34.6),
          lng: new Prisma.Decimal(-58.4),
          recordedAt: new Date('2026-05-26T12:00:00.000Z'),
        },
      ]),
    },
    ...overrides,
  } as unknown as PrismaClient
}

describe('RepartoUbicacionService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('recordLocation rejects invalid coordinates', async () => {
    const service = new RepartoUbicacionService(buildPrisma())
    const result = await service.recordLocation(1, 1, 5, { lat: 95, lng: 0 })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.status).toBe(400)
  })

  it('recordLocation rejects non-owner driver', async () => {
    const prisma = buildPrisma({
      reparto: { findFirst: vi.fn().mockResolvedValue({ ...onRouteReparto, choferId: 99 }) },
    })
    const service = new RepartoUbicacionService(prisma)
    const result = await service.recordLocation(1, 1, 5, { lat: -34.6, lng: -58.4 })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.status).toBe(403)
  })

  it('recordLocation inserts and purges old rows', async () => {
    const prisma = buildPrisma()
    const service = new RepartoUbicacionService(prisma)
    const result = await service.recordLocation(1, 1, 5, { lat: -34.6, lng: -58.4 })
    expect(result.ok).toBe(true)
    expect(prisma.repartoUbicacion.create).toHaveBeenCalled()
    expect(prisma.repartoUbicacion.deleteMany).toHaveBeenCalled()
    if (result.ok) {
      expect(result.data.lat).toBeCloseTo(-34.6)
      expect(result.data.lng).toBeCloseTo(-58.4)
    }
  })

  it('purgeOlderThanRetention uses retention window', async () => {
    const prisma = buildPrisma()
    const service = new RepartoUbicacionService(prisma)
    const deleted = await service.purgeOlderThanRetention(1)
    expect(deleted).toBe(2)
    const call = vi.mocked(prisma.repartoUbicacion.deleteMany).mock.calls[0]?.[0]
    const recordedAtFilter = call?.where?.recordedAt
    const cutoff =
      recordedAtFilter && typeof recordedAtFilter === 'object' && 'lt' in recordedAtFilter
        ? (recordedAtFilter.lt as Date)
        : new Date(0)
    const expected = new Date()
    expected.setDate(expected.getDate() - UBICACION_RETENTION_DAYS)
    expect(Math.abs(cutoff.getTime() - expected.getTime())).toBeLessThan(5000)
  })

  it('listActivos returns 403 for driver', async () => {
    const service = new RepartoUbicacionService(buildPrisma())
    const result = await service.listActivos(1, 'driver')
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.status).toBe(403)
  })

  it('listActivos maps on_route repartos for planner', async () => {
    const service = new RepartoUbicacionService(buildPrisma())
    const result = await service.listActivos(1, 'logistics_planner')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data).toHaveLength(1)
      expect(result.data[0]?.ultimaUbicacion?.lat).toBeCloseTo(-34.6)
      expect(result.data[0]?.currentStop?.cliente.rsocial).toBe('Cliente')
    }
  })

  it('getUltima forbids driver on another route', async () => {
    const prisma = buildPrisma({
      reparto: { findFirst: vi.fn().mockResolvedValue({ ...onRouteReparto, choferId: 99 }) },
    })
    const service = new RepartoUbicacionService(prisma)
    const result = await service.getUltima(1, 1, { role: 'driver', userId: 5 })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.status).toBe(403)
  })
})
