import { describe, expect, it, vi, beforeEach } from 'vitest'
import { Decimal } from '@prisma/client/runtime/library'
import type { PrismaClient } from '@prisma/client'
import {
  FidelizacionService,
  calcularMontoCanje,
  calcularPuntosAcumulacion,
  CANJE_PUNTOS_DESCRIPCION,
} from '../../../apps/server/services/FidelizacionService'

function configRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    tenantId: 1,
    activo: true,
    nombre: 'Programa de Puntos',
    pesosPorPunto: new Decimal(100),
    puntosPorPeso: new Decimal(1),
    mesesVencimiento: 12,
    montoMinCompra: new Decimal(0),
    aplicaEnDescuento: false,
    createdAt: new Date('2026-07-24T12:00:00.000Z'),
    updatedAt: new Date('2026-07-24T12:00:00.000Z'),
    ...overrides,
  }
}

describe('calcularPuntosAcumulacion / calcularMontoCanje (#250)', () => {
  it('floors points from total when discounts already applied', () => {
    expect(
      calcularPuntosAcumulacion({
        total: 1050,
        items: [{ cantidad: 1, precio: 1100, dscto: 0, subtotal: 1050 }],
        pesosPorPunto: 100,
        montoMinCompra: 0,
        aplicaEnDescuento: true,
      }),
    ).toBe(10)
  })

  it('restores pre-discount base when aplicaEnDescuento is false', () => {
    expect(
      calcularPuntosAcumulacion({
        total: 900,
        items: [{ cantidad: 1, precio: 1000, dscto: 10, subtotal: 900 }],
        pesosPorPunto: 100,
        montoMinCompra: 0,
        aplicaEnDescuento: false,
      }),
    ).toBe(10)
  })

  it('returns 0 under minimum purchase', () => {
    expect(
      calcularPuntosAcumulacion({
        total: 50,
        items: [],
        pesosPorPunto: 100,
        montoMinCompra: 100,
        aplicaEnDescuento: true,
      }),
    ).toBe(0)
  })

  it('computes redemption money', () => {
    expect(calcularMontoCanje(25, 1.5)).toBe(37.5)
    expect(calcularMontoCanje(0, 1)).toBe(0)
  })
})

describe('FidelizacionService (#250)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('prepareCanje validates balance and builds negative line', async () => {
    const prisma = {
      configFidelizacion: {
        findUnique: vi.fn().mockResolvedValue(configRow()),
      },
      puntosFidelizacion: {
        findUnique: vi.fn().mockResolvedValue({ clienteId: 10, puntos: 40 }),
      },
      tenantConfig: {
        findUnique: vi.fn().mockResolvedValue({
          modules: ['clients.loyalty', 'core.clients'],
        }),
      },
    } as unknown as PrismaClient

    const tenantConfig = {
      getModulesForTenant: vi.fn().mockResolvedValue(['clients.loyalty', 'core.clients']),
    }

    const svc = new FidelizacionService(prisma, tenantConfig as never)
    const result = await svc.prepareCanje(1, 10, 20)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data.monto).toBe(20)
    expect(result.data.item.descripcion).toBe(CANJE_PUNTOS_DESCRIPCION)
    expect(result.data.item.precio).toBe(-20)
    expect(result.data.item.articuloId).toBeNull()
  })

  it('prepareCanje rejects insufficient balance', async () => {
    const prisma = {
      configFidelizacion: {
        findUnique: vi.fn().mockResolvedValue(configRow()),
      },
      puntosFidelizacion: {
        findUnique: vi.fn().mockResolvedValue({ clienteId: 10, puntos: 5 }),
      },
    } as unknown as PrismaClient
    const tenantConfig = {
      getModulesForTenant: vi.fn().mockResolvedValue(['clients.loyalty']),
    }
    const svc = new FidelizacionService(prisma, tenantConfig as never)
    const result = await svc.prepareCanje(1, 10, 20)
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.status).toBe(422)
  })

  it('ajustar credits points via transaction', async () => {
    const movimientoCreate = vi.fn().mockResolvedValue({})
    const puntosUpdate = vi.fn().mockResolvedValue({ puntos: 15 })
    const prisma = {
      cliente: { findFirst: vi.fn().mockResolvedValue({ id: 10 }) },
      configFidelizacion: {
        findUnique: vi.fn().mockResolvedValue(configRow()),
        create: vi.fn(),
      },
      puntosFidelizacion: {
        findUnique: vi.fn().mockResolvedValue({ id: 1, clienteId: 10, puntos: 15 }),
      },
      movimientoPuntos: {
        count: vi.fn().mockResolvedValue(1),
        findMany: vi.fn().mockResolvedValue([]),
      },
      $transaction: vi.fn(async (fn: (tx: unknown) => Promise<unknown>) =>
        fn({
          puntosFidelizacion: {
            findUnique: vi.fn().mockResolvedValue({ id: 1, clienteId: 10, puntos: 10 }),
            update: puntosUpdate,
            create: vi.fn(),
          },
          movimientoPuntos: { create: movimientoCreate },
        }),
      ),
    } as unknown as PrismaClient

    const svc = new FidelizacionService(prisma)
    const result = await svc.ajustar(1, 99, { clienteId: 10, puntos: 5, concepto: 'bonus' })
    expect(result.ok).toBe(true)
    expect(prisma.$transaction).toHaveBeenCalled()
    expect(movimientoCreate).toHaveBeenCalled()
  })

  it('applyInvoiceEffects accrues points on active invoice', async () => {
    const movimientoCreate = vi.fn().mockResolvedValue({})
    const puntosCreate = vi.fn().mockResolvedValue({ puntos: 10 })
    const prisma = {
      configFidelizacion: {
        findUnique: vi.fn().mockResolvedValue(configRow()),
      },
      $transaction: vi.fn(async (fn: (tx: unknown) => Promise<unknown>) =>
        fn({
          puntosFidelizacion: {
            findUnique: vi.fn().mockResolvedValue(null),
            create: puntosCreate,
            update: vi.fn(),
          },
          movimientoPuntos: {
            create: movimientoCreate,
            findMany: vi.fn().mockResolvedValue([]),
            update: vi.fn(),
          },
        }),
      ),
    } as unknown as PrismaClient
    const tenantConfig = {
      getModulesForTenant: vi.fn().mockResolvedValue(['clients.loyalty']),
    }
    const svc = new FidelizacionService(prisma, tenantConfig as never)
    await svc.applyInvoiceEffects(1, {
      facturaId: 50,
      clienteId: 10,
      total: 1050,
      items: [{ cantidad: 1, precio: 1050, dscto: 0, subtotal: 1050 }],
      puntosCanje: null,
      userId: 1,
    })
    expect(movimientoCreate).toHaveBeenCalled()
    const call = movimientoCreate.mock.calls[0]?.[0] as { data: { tipo: string; puntos: number } }
    expect(call.data.tipo).toBe('acumulacion')
    expect(call.data.puntos).toBe(10)
  })

  it('revertirFromFactura reverses accrual and canje', async () => {
    const movimientoCreate = vi.fn().mockResolvedValue({})
    const movimientoUpdate = vi.fn().mockResolvedValue({})
    const puntosUpdate = vi.fn().mockResolvedValue({ puntos: 0 })
    const prisma = {
      configFidelizacion: {
        findUnique: vi.fn().mockResolvedValue(configRow()),
      },
      movimientoPuntos: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 1,
            clienteId: 10,
            tipo: 'acumulacion',
            puntos: 10,
          },
          {
            id: 2,
            clienteId: 10,
            tipo: 'canje',
            puntos: -5,
          },
        ]),
      },
      $transaction: vi.fn(async (fn: (tx: unknown) => Promise<unknown>) =>
        fn({
          movimientoPuntos: {
            findFirst: vi.fn().mockResolvedValue(null),
            create: movimientoCreate,
            update: movimientoUpdate,
          },
          puntosFidelizacion: {
            findUnique: vi
              .fn()
              .mockResolvedValueOnce({ id: 1, clienteId: 10, puntos: 10 })
              .mockResolvedValueOnce({ id: 1, clienteId: 10, puntos: 0 })
              .mockResolvedValue({ id: 1, clienteId: 10, puntos: 5 }),
            update: puntosUpdate,
            create: vi.fn(),
          },
        }),
      ),
    } as unknown as PrismaClient
    const tenantConfig = {
      getModulesForTenant: vi.fn().mockResolvedValue(['clients.loyalty']),
    }
    const svc = new FidelizacionService(prisma, tenantConfig as never)

    await svc.revertirFromFactura(1, 50, 7)
    expect(prisma.$transaction).toHaveBeenCalled()
    expect(movimientoCreate).toHaveBeenCalled()
    expect(movimientoUpdate).toHaveBeenCalled()
  })

  it('runDailyExpiryJob expires leftover lots', async () => {
    const movimientoCreate = vi.fn().mockResolvedValue({})
    const movimientoUpdate = vi.fn().mockResolvedValue({})
    const puntosUpdate = vi.fn().mockResolvedValue({ puntos: 0 })
    const prisma = {
      configFidelizacion: {
        findUnique: vi.fn().mockResolvedValue(configRow({ mesesVencimiento: 12 })),
      },
      movimientoPuntos: {
        findMany: vi
          .fn()
          .mockResolvedValueOnce([]) // dueSoon
          .mockResolvedValueOnce([
            {
              id: 8,
              clienteId: 10,
              puntosRestantes: 7,
              referenciaFacturaId: 3,
            },
          ]),
        update: movimientoUpdate,
      },
      $transaction: vi.fn(async (fn: (tx: unknown) => Promise<unknown>) =>
        fn({
          movimientoPuntos: {
            update: movimientoUpdate,
            create: movimientoCreate,
          },
          puntosFidelizacion: {
            findUnique: vi.fn().mockResolvedValue({ id: 1, clienteId: 10, puntos: 7 }),
            update: puntosUpdate,
            create: vi.fn(),
          },
        }),
      ),
    } as unknown as PrismaClient
    const tenantConfig = {
      getModulesForTenant: vi.fn().mockResolvedValue(['clients.loyalty']),
    }
    const svc = new FidelizacionService(prisma, tenantConfig as never)
    const result = await svc.runDailyExpiryJob(1)
    expect(result.expired).toBe(7)
    expect(movimientoCreate).toHaveBeenCalled()
  })

  it('getDashboard aggregates liability and ranking', async () => {
    const prisma = {
      configFidelizacion: {
        findUnique: vi.fn().mockResolvedValue(configRow()),
        create: vi.fn(),
      },
      movimientoPuntos: {
        groupBy: vi.fn().mockResolvedValue([
          { tipo: 'acumulacion', _sum: { puntos: 100 } },
          { tipo: 'canje', _sum: { puntos: -20 } },
          { tipo: 'vencimiento', _sum: { puntos: -5 } },
          { tipo: 'ajuste', _sum: { puntos: 0 } },
        ]),
      },
      puntosFidelizacion: {
        aggregate: vi.fn().mockResolvedValue({ _sum: { puntos: 75 } }),
        findMany: vi.fn().mockResolvedValue([
          {
            clienteId: 10,
            puntos: 75,
            cliente: { id: 10, codigo: 1, rsocial: 'Cliente' },
          },
        ]),
      },
    } as unknown as PrismaClient
    const svc = new FidelizacionService(prisma)
    const dash = await svc.getDashboard(1)
    expect(dash.pasivoPuntos).toBe(75)
    expect(dash.puntosEmitidos).toBe(100)
    expect(dash.puntosCanjeados).toBe(20)
    expect(dash.ranking).toHaveLength(1)
    expect(dash.ranking[0]?.rsocial).toBe('Cliente')
  })
})
