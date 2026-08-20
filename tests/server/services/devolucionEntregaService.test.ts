import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { DevolucionEntregaService } from '../../../apps/server/services/DevolucionEntregaService'
import { clearTenantFeaturesCache } from '../../../apps/server/services/tenantConfigCache'

const actor = { userId: 2, role: 'driver' }

function buildPrisma(overrides: Partial<Record<string, unknown>> = {}): PrismaClient {
  const prisma = {
    tenantConfig: {
      findUnique: vi.fn().mockResolvedValue({
        tenantId: 1,
        modules: [],
        integrations: [],
        plan: 'pro',
        businessType: 'mayorista',
        rubros: [],
        updatedAt: new Date(),
      }),
    },
    recuento: { findFirst: vi.fn().mockResolvedValue(null) },
    deposito: { findFirst: vi.fn().mockResolvedValue(null) },
    articulo: {
      findFirst: vi.fn().mockResolvedValue({ id: 8, tipo: 'producto' }),
      findMany: vi.fn().mockResolvedValue([{ id: 8, tipo: 'producto', controlLote: false, stock: new Decimal(4) }]),
      findFirstOrThrow: vi.fn().mockResolvedValue({ id: 8, stock: new Decimal(4) }),
      update: vi.fn(),
    },
    factura: { findFirst: vi.fn() },
    facturaItem: { findMany: vi.fn().mockResolvedValue([]) },
    notaCredito: {
      aggregate: vi.fn().mockResolvedValue({ _sum: { monto: null } }),
      create: vi.fn(),
    },
    stockAjuste: { create: vi.fn() },
    stockDeposito: { aggregate: vi.fn(), upsert: vi.fn() },
    devolucionEntrega: {
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn(),
      update: vi.fn(),
    },
    reparto: {
      findFirst: vi.fn().mockResolvedValue({ id: 1, estado: 'on_route', choferId: 2 }),
    },
    repartoItem: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    ordenEntrega: { update: vi.fn() },
    $transaction: vi.fn(async (fn: unknown) => {
      if (typeof fn === 'function') return (fn as (tx: typeof prisma) => Promise<unknown>)(prisma)
      return fn
    }),
    ...overrides,
  }
  return prisma as unknown as PrismaClient
}

describe('DevolucionEntregaService (#163)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    clearTenantFeaturesCache()
  })

  it('register returns 422 DEVOLUCION_FOTO_REQUIRED for producto_dañado without photo', async () => {
    const svc = new DevolucionEntregaService(buildPrisma())
    const result = await svc.register(1, 1, 10, {
      motivo: 'producto_dañado',
      lineas: [{ articuloId: 8, facturaItemId: 3, cantidad: 1 }],
    }, actor)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toBe('DEVOLUCION_FOTO_REQUIRED')
  })

  it('register returns 422 DEVOLUCION_INVALID_QTY when qty exceeds factura line', async () => {
    const prisma = buildPrisma()
    vi.mocked(prisma.repartoItem.findFirst).mockResolvedValue({
      id: 10,
      estado: 'pending',
      devolucionEntrega: null,
      ordenEntrega: {
        id: 5,
        facturaId: 9,
        factura: { id: 9, items: [{ id: 3, articuloId: 8, cantidad: new Decimal(2) }] },
      },
    } as never)
    const svc = new DevolucionEntregaService(prisma)
    const result = await svc.register(1, 1, 10, {
      motivo: 'rechazo',
      lineas: [{ articuloId: 8, facturaItemId: 3, cantidad: 3 }],
    }, actor)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toBe('DEVOLUCION_INVALID_QTY')
  })

  it('register persists returned item without stock ajuste', async () => {
    const prisma = buildPrisma()
    vi.mocked(prisma.repartoItem.findFirst).mockResolvedValue({
      id: 10,
      estado: 'pending',
      devolucionEntrega: null,
      ordenEntrega: {
        id: 5,
        facturaId: 9,
        factura: { id: 9, items: [{ id: 3, articuloId: 8, cantidad: new Decimal(2) }] },
      },
    } as never)
    const created = {
      id: 1,
      tenantId: 1,
      repartoId: 1,
      repartoItemId: 10,
      motivo: 'rechazo',
      motivoDetalle: null,
      fotoBase64: null,
      estado: 'registered',
      notaCreditoId: null,
      remittedAt: null,
      createdAt: new Date('2026-08-19T12:00:00.000Z'),
      lineas: [{ id: 1, articuloId: 8, facturaItemId: 3, cantidad: new Decimal(1) }],
    }
    vi.mocked(prisma.devolucionEntrega.create).mockResolvedValue(created as never)
    const svc = new DevolucionEntregaService(prisma)
    const result = await svc.register(1, 1, 10, {
      motivo: 'rechazo',
      lineas: [{ articuloId: 8, facturaItemId: 3, cantidad: 1 }],
    }, actor)
    expect(result.ok).toBe(true)
    expect(prisma.stockAjuste.create).not.toHaveBeenCalled()
    expect(prisma.repartoItem.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ estado: 'returned' }) }),
    )
  })

  it('remit returns 422 LOTE_REQUIRED and leaves registered when FEFO + controlLote', async () => {
    const prisma = buildPrisma()
    vi.mocked(prisma.tenantConfig.findUnique).mockResolvedValue({
      tenantId: 1,
      modules: ['inventory.fefo'],
      integrations: [],
      plan: 'pro',
      businessType: 'mayorista',
      rubros: [],
      updatedAt: new Date(),
    } as never)
    vi.mocked(prisma.devolucionEntrega.findMany).mockResolvedValue([
      {
        id: 1,
        tenantId: 1,
        repartoId: 1,
        estado: 'registered',
        lineas: [{ id: 1, articuloId: 8, facturaItemId: 3, cantidad: new Decimal(1) }],
        repartoItem: { ordenEntrega: { depositoId: 4, facturaId: 9 } },
      },
    ] as never)
    vi.mocked(prisma.articulo.findMany).mockResolvedValue([
      { id: 8, tipo: 'producto', controlLote: true, stock: new Decimal(4) },
    ] as never)
    const svc = new DevolucionEntregaService(prisma)
    const result = await svc.remit(1, 1, { ...actor, ipAddress: null })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toBe('LOTE_REQUIRED')
    expect(prisma.devolucionEntrega.update).not.toHaveBeenCalled()
    expect(prisma.stockAjuste.create).not.toHaveBeenCalled()
  })
})
