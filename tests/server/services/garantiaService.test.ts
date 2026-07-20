import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { GarantiaService } from '../../../apps/server/services/GarantiaService'

const CLIENTE = { id: 1, codigo: 1, rsocial: 'Cliente' }
const ARTICULO = { id: 10, codigo: 100, descripcion: 'TV Samsung' }

function baseGarantia(overrides: Record<string, unknown> = {}) {
  const now = new Date()
  const future = new Date(now.getTime())
  future.setUTCMonth(future.getUTCMonth() + 6)
  return {
    id: 1,
    tenantId: 1,
    articuloId: 10,
    facturaId: null as number | null,
    facturaItemId: null as number | null,
    nroSerie: 'SN-1',
    nroImei: null as string | null,
    descripcionEquipo: 'TV Samsung',
    clienteId: 1,
    fechaVenta: now,
    mesesGarantia: 12,
    fechaVencimiento: future,
    estado: 'vigente',
    createdAt: now,
    updatedAt: now,
    cliente: CLIENTE,
    articulo: ARTICULO,
    factura: null,
    usos: [] as unknown[],
    ...overrides,
  }
}

function buildPrisma(overrides: Record<string, unknown> = {}): PrismaClient {
  return {
    articulo: {
      findFirst: vi.fn().mockResolvedValue({
        id: 10,
        mesesGarantia: 12,
        descripcion: 'TV Samsung',
        tipo: 'articulo',
      }),
      findMany: vi.fn().mockResolvedValue([{ id: 10, mesesGarantia: 12, descripcion: 'TV Samsung' }]),
    },
    cliente: {
      findFirst: vi.fn().mockResolvedValue({ id: 1 }),
    },
    factura: {
      findFirst: vi.fn().mockResolvedValue({ id: 5 }),
    },
    ordenTrabajo: {
      findFirst: vi.fn().mockResolvedValue({ id: 7 }),
    },
    garantia: {
      updateMany: vi.fn().mockResolvedValue({ count: 0 }),
      count: vi.fn().mockResolvedValue(1),
      findMany: vi.fn().mockResolvedValue([baseGarantia()]),
      findFirst: vi.fn().mockResolvedValue(baseGarantia()),
      findFirstOrThrow: vi.fn().mockResolvedValue(baseGarantia({ usos: [{ id: 1 }] })),
      create: vi.fn().mockResolvedValue(baseGarantia()),
      update: vi.fn().mockResolvedValue(baseGarantia({ estado: 'anulada' })),
    },
    garantiaUso: {
      create: vi.fn().mockResolvedValue({ id: 1 }),
    },
    ...overrides,
  } as unknown as PrismaClient
}

describe('GarantiaService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('lists warranties with counts', async () => {
    const prisma = buildPrisma()
    const svc = new GarantiaService(prisma)
    const result = await svc.list(1, 50, 0)
    expect(result.total).toBe(1)
    expect(result.garantias).toHaveLength(1)
    expect(result.counts.vigente).toBe(1)
    expect(prisma.garantia.updateMany).toHaveBeenCalled()
  })

  it('lookup returns vigente for active serial', async () => {
    const prisma = buildPrisma()
    const svc = new GarantiaService(prisma)
    const result = await svc.lookupBySerial(1, 'SN-1')
    expect(result.status).toBe('vigente')
    if (result.status === 'vigente') {
      expect(result.garantia.nroSerie).toBe('SN-1')
    }
  })

  it('lookup returns vencida when warranty expired', async () => {
    const past = new Date('2020-01-01T00:00:00.000Z')
    const prisma = buildPrisma({
      garantia: {
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
        findFirst: vi.fn().mockResolvedValue(
          baseGarantia({ estado: 'vencida', fechaVencimiento: past }),
        ),
      },
    })
    const svc = new GarantiaService(prisma)
    const result = await svc.lookupBySerial(1, 'SN-OLD')
    expect(result.status).toBe('vencida')
  })

  it('lookup returns sin_registro when no match', async () => {
    const prisma = buildPrisma({
      garantia: {
        updateMany: vi.fn().mockResolvedValue({ count: 0 }),
        findFirst: vi.fn().mockResolvedValue(null),
      },
    })
    const svc = new GarantiaService(prisma)
    expect(await svc.lookupBySerial(1, 'UNKNOWN')).toEqual({ status: 'sin_registro' })
    expect(await svc.lookupBySerial(1, '   ')).toEqual({ status: 'sin_registro' })
  })

  it('register creates warranty from articulo mesesGarantia', async () => {
    const prisma = buildPrisma()
    const svc = new GarantiaService(prisma)
    const result = await svc.register(1, {
      articuloId: 10,
      clienteId: 1,
      nroSerie: 'SN-NEW',
    })
    expect(result.ok).toBe(true)
    expect(prisma.garantia.create).toHaveBeenCalled()
  })

  it('register rejects articulo without mesesGarantia', async () => {
    const prisma = buildPrisma({
      articulo: {
        findFirst: vi.fn().mockResolvedValue({
          id: 10,
          mesesGarantia: null,
          descripcion: 'X',
          tipo: 'articulo',
        }),
      },
    })
    const svc = new GarantiaService(prisma)
    const result = await svc.register(1, { articuloId: 10, clienteId: 1 })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.status).toBe(400)
  })

  it('anular marks warranty as anulada', async () => {
    const prisma = buildPrisma()
    const svc = new GarantiaService(prisma)
    const result = await svc.anular(1, 1)
    expect(result.ok).toBe(true)
    expect(prisma.garantia.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { estado: 'anulada' } }),
    )
  })

  it('registrarUso creates usage and allows multiple usos', async () => {
    const prisma = buildPrisma()
    const svc = new GarantiaService(prisma)
    const first = await svc.registrarUso(1, 1, 9, { descripcion: 'Primera visita', otId: 7 })
    const second = await svc.registrarUso(1, 1, 9, { descripcion: 'Segunda visita', otId: 7 })
    expect(first.ok).toBe(true)
    expect(second.ok).toBe(true)
    expect(prisma.garantiaUso.create).toHaveBeenCalledTimes(2)
  })

  it('registrarUso rejects vencida warranty', async () => {
    const prisma = buildPrisma({
      garantia: {
        findFirst: vi.fn().mockResolvedValue({
          id: 1,
          estado: 'vencida',
          fechaVencimiento: new Date('2020-01-01'),
        }),
      },
    })
    const svc = new GarantiaService(prisma)
    const result = await svc.registrarUso(1, 1, 9, { descripcion: 'No' })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.status).toBe(409)
  })

  it('registerFromFactura creates warranties for lines with mesesGarantia', async () => {
    const prisma = buildPrisma()
    const svc = new GarantiaService(prisma)
    await svc.registerFromFactura(1, 5, 1, new Date('2026-01-15'), [
      { id: 100, articuloId: 10, nroSerie: 'SN-FACT' },
      { id: 101, articuloId: null },
    ])
    expect(prisma.garantia.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          facturaId: 5,
          facturaItemId: 100,
          nroSerie: 'SN-FACT',
          mesesGarantia: 12,
        }),
      }),
    )
  })

  it('findActiveBySerial returns id when vigente', async () => {
    const future = new Date()
    future.setUTCFullYear(future.getUTCFullYear() + 1)
    const prisma = buildPrisma({
      garantia: {
        updateMany: vi.fn().mockResolvedValue({ count: 0 }),
        findFirst: vi.fn().mockResolvedValue({ id: 3, fechaVencimiento: future }),
      },
    })
    const svc = new GarantiaService(prisma)
    const row = await svc.findActiveBySerial(1, 'SN-1')
    expect(row).toEqual({ id: 3, fechaVencimiento: future })
  })
})
