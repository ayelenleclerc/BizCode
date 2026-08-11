import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import {
  TurnoCajaService,
  computeConteoTotal,
} from '../../../apps/server/services/TurnoCajaService'

const now = new Date('2026-07-20T12:00:00.000Z')

function baseCaja() {
  return {
    id: 1,
    tenantId: 1,
    nombre: 'Caja 1',
    activa: true,
    createdAt: now,
    updatedAt: now,
  }
}

function baseTurno(overrides: Record<string, unknown> = {}) {
  return {
    id: 10,
    tenantId: 1,
    cajaId: 1,
    cajeroId: 2,
    estado: 'abierto',
    montoApertura: new Decimal(1000),
    fechaApertura: now,
    fechaCierre: null as Date | null,
    totalVentasEfectivo: null,
    totalVentasTarjeta: null,
    totalVentasMP: null,
    totalVentasTransf: null,
    totalEgresos: null,
    totalIngresosExtra: null,
    efectivoEsperado: null,
    efectivoContado: null,
    diferencia: null,
    observaciones: null,
    createdAt: now,
    updatedAt: now,
    caja: baseCaja(),
    cajero: { id: 2, username: 'cajero' },
    conteo: null,
    movimientos: [] as unknown[],
    ...overrides,
  }
}

function buildPrisma(overrides: Record<string, unknown> = {}): PrismaClient {
  const turno = baseTurno()
  return {
    caja: {
      findMany: vi.fn().mockResolvedValue([baseCaja()]),
      findFirst: vi.fn().mockResolvedValue({ id: 1 }),
      create: vi.fn().mockResolvedValue(baseCaja()),
    },
    turnoCaja: {
      count: vi.fn().mockResolvedValue(1),
      findMany: vi.fn().mockResolvedValue([turno]),
      findFirst: vi.fn().mockResolvedValue(turno),
      findFirstOrThrow: vi.fn().mockResolvedValue(turno),
      create: vi.fn().mockResolvedValue(turno),
      update: vi.fn().mockResolvedValue(baseTurno({ estado: 'cerrado' })),
      aggregate: vi.fn().mockResolvedValue({ _sum: { diferencia: new Decimal(0) } }),
    },
    movimientoCaja: {
      create: vi.fn().mockResolvedValue({ id: 1 }),
    },
    conteoEfectivo: {
      create: vi.fn().mockResolvedValue({ id: 1 }),
    },
    $transaction: vi.fn(async (arg: unknown) => {
      if (typeof arg === 'function') {
        const tx = {
          conteoEfectivo: {
            create: vi.fn().mockResolvedValue({ id: 1 }),
          },
          turnoCaja: {
            update: vi.fn().mockResolvedValue(
              baseTurno({
                estado: 'cerrado',
                fechaCierre: now,
                efectivoEsperado: new Decimal(1000),
                efectivoContado: new Decimal(1000),
                diferencia: new Decimal(0),
                totalVentasEfectivo: new Decimal(0),
                totalVentasTarjeta: new Decimal(0),
                totalVentasMP: new Decimal(0),
                totalVentasTransf: new Decimal(0),
                totalEgresos: new Decimal(0),
                totalIngresosExtra: new Decimal(0),
                conteo: {
                  id: 1,
                  turnoId: 10,
                  b1000: 1,
                  b500: 0,
                  b200: 0,
                  b100: 0,
                  b50: 0,
                  b20: 0,
                  b10: 0,
                  m10: 0,
                  m5: 0,
                  m2: 0,
                  m1: 0,
                  total: new Decimal(1000),
                },
              }),
            ),
          },
        }
        return (arg as (t: typeof tx) => unknown)(tx)
      }
      return arg
    }),
    ...overrides,
  } as unknown as PrismaClient
}

describe('TurnoCajaService (#247)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('computeConteoTotal sums ARS denominations', () => {
    expect(computeConteoTotal({ b1000: 1, b500: 1, m1: 3 })).toBe(1503)
  })

  it('lists cajas and turnos with counts', async () => {
    const prisma = buildPrisma()
    const svc = new TurnoCajaService(prisma)
    const cajas = await svc.listCajas(1)
    expect(cajas).toHaveLength(1)
    const listed = await svc.listTurnos(1, 50, 0)
    expect(listed.total).toBe(1)
    expect(listed.counts.abiertos).toBe(1)
  })

  it('opens turno when caja is free', async () => {
    const prisma = buildPrisma({
      turnoCaja: {
        count: vi.fn(),
        findMany: vi.fn(),
        findFirst: vi.fn().mockResolvedValue(null),
        findFirstOrThrow: vi.fn(),
        create: vi.fn().mockResolvedValue(baseTurno()),
        update: vi.fn(),
        aggregate: vi.fn(),
      },
    })
    const svc = new TurnoCajaService(prisma)
    const result = await svc.open(1, 2, { cajaId: 1, montoApertura: 1000 })
    expect(result.ok).toBe(true)
  })

  it('rejects close with difference and no observaciones', async () => {
    const prisma = buildPrisma({
      turnoCaja: {
        count: vi.fn(),
        findMany: vi.fn(),
        findFirst: vi.fn().mockResolvedValue(
          baseTurno({
            movimientos: [
              {
                tipo: 'venta',
                formaPago: 'efectivo',
                importe: new Decimal(500),
              },
            ],
          }),
        ),
        findFirstOrThrow: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        aggregate: vi.fn(),
      },
    })
    const svc = new TurnoCajaService(prisma)
    // esperado = 1000 + 500 = 1500; conteo b1000:1 = 1000 → diferencia -500
    const result = await svc.close(1, 10, { conteo: { b1000: 1 } })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.status).toBe(400)
      expect(result.error).toMatch(/observaciones/i)
    }
  })

  it('closes with faltante when observaciones provided', async () => {
    const prisma = buildPrisma({
      turnoCaja: {
        count: vi.fn(),
        findMany: vi.fn(),
        findFirst: vi.fn().mockResolvedValue(
          baseTurno({
            movimientos: [
              {
                tipo: 'egreso',
                formaPago: 'efectivo',
                importe: new Decimal(100),
              },
            ],
          }),
        ),
        findFirstOrThrow: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        aggregate: vi.fn(),
      },
    })
    const svc = new TurnoCajaService(prisma)
    // esperado = 1000 - 100 = 900; conteo 0 → diferencia -900
    const result = await svc.close(1, 10, {
      conteo: {},
      observaciones: 'Faltante justificado',
    })
    expect(result.ok).toBe(true)
  })

  it('tryRecordAutoMovement creates movement when open turno exists', async () => {
    const prisma = buildPrisma()
    const svc = new TurnoCajaService(prisma)
    await svc.tryRecordAutoMovement({
      tenantId: 1,
      userId: 2,
      tipo: 'venta',
      formaPago: 'efectivo',
      importe: 250,
      referenciaTipo: 'factura',
      referenciaId: 99,
    })
    expect(prisma.movimientoCaja.create).toHaveBeenCalled()
  })

  it('tryRecordAutoMovement no-ops without open turno', async () => {
    const prisma = buildPrisma({
      turnoCaja: {
        count: vi.fn(),
        findMany: vi.fn(),
        findFirst: vi.fn().mockResolvedValue(null),
        findFirstOrThrow: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        aggregate: vi.fn(),
      },
    })
    const svc = new TurnoCajaService(prisma)
    await svc.tryRecordAutoMovement({
      tenantId: 1,
      userId: 2,
      tipo: 'cobro',
      formaPago: 'efectivo',
      importe: 10,
      referenciaTipo: 'cobro',
      referenciaId: 1,
    })
    expect(prisma.movimientoCaja.create).not.toHaveBeenCalled()
  })
})
