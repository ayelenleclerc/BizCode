import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { OrdenProduccionService } from '../../../apps/server/services/OrdenProduccionService'
import type { CompraService } from '../../../apps/server/services/CompraService'

const DEPOSITO_ID = 3
const PRODUCTO_ID = 100
const INSUMO_ID = 200
const SERVICIO_ID = 201

function buildFormulaDb() {
  return {
    id: 10,
    tenantId: 1,
    articuloId: PRODUCTO_ID,
    rendimiento: new Decimal(12),
    unidadRendimiento: 'unidad',
    version: 1,
    activa: true,
    observaciones: null,
    createdAt: new Date('2026-07-24T12:00:00.000Z'),
    updatedAt: new Date('2026-07-24T12:00:00.000Z'),
    articulo: {
      id: PRODUCTO_ID,
      codigo: 100,
      descripcion: 'Producto',
      costo: new Decimal(0),
      precioLista1: new Decimal(120),
    },
    insumos: [
      {
        id: 1,
        formulaId: 10,
        articuloId: INSUMO_ID,
        cantidad: new Decimal(6),
        unidad: 'kg',
        esOpcional: false,
        orden: 0,
        articulo: {
          id: INSUMO_ID,
          codigo: 200,
          descripcion: 'Harina',
          costo: new Decimal(1800),
          umedida: 'kg',
          tipo: 'articulo',
        },
      },
    ],
  }
}

function buildOrdenDb(overrides: Record<string, unknown> = {}) {
  return {
    id: 5,
    tenantId: 1,
    numero: 1,
    articuloId: PRODUCTO_ID,
    formulaId: 10,
    depositoId: DEPOSITO_ID,
    cantidadPlanif: new Decimal(500),
    cantidadReal: null,
    estado: 'planificada',
    fechaPlanif: new Date('2026-07-24T12:00:00.000Z'),
    fechaInicio: null,
    fechaFin: null,
    costoTotal: null,
    operadorId: null,
    observaciones: null,
    createdAt: new Date('2026-07-24T12:00:00.000Z'),
    updatedAt: new Date('2026-07-24T12:00:00.000Z'),
    articulo: {
      id: PRODUCTO_ID,
      codigo: 100,
      descripcion: 'Producto',
      costo: new Decimal(0),
      precioLista1: new Decimal(120),
    },
    deposito: { id: DEPOSITO_ID, codigo: 'CEN', nombre: 'Central' },
    formula: { id: 10, version: 1, rendimiento: new Decimal(12) },
    insumos: [
      {
        id: 1,
        ordenId: 5,
        articuloId: INSUMO_ID,
        cantidadPlan: new Decimal(250),
        cantidadReal: null,
        unidad: 'kg',
        costo: null,
        esOpcional: false,
        linea: 0,
        articulo: {
          id: INSUMO_ID,
          codigo: 200,
          descripcion: 'Harina',
          costo: new Decimal(1800),
          umedida: 'kg',
          tipo: 'articulo',
        },
      },
      {
        id: 2,
        ordenId: 5,
        articuloId: SERVICIO_ID,
        cantidadPlan: new Decimal(4),
        cantidadReal: null,
        unidad: 'hora',
        costo: null,
        esOpcional: false,
        linea: 1,
        articulo: {
          id: SERVICIO_ID,
          codigo: 201,
          descripcion: 'Mano de obra',
          costo: new Decimal(5000),
          umedida: 'hora',
          tipo: 'servicio',
        },
      },
    ],
    ...overrides,
  }
}

type TxMocks = {
  stockAjusteCreate: ReturnType<typeof vi.fn>
  stockDepositoUpdate: ReturnType<typeof vi.fn>
  reservaCreate: ReturnType<typeof vi.fn>
  reservaUpdateMany: ReturnType<typeof vi.fn>
  insumoUpdate: ReturnType<typeof vi.fn>
  ordenUpdate: ReturnType<typeof vi.fn>
}

function createPrismaMock(): { prisma: PrismaClient; tx: TxMocks } {
  const tx: TxMocks = {
    stockAjusteCreate: vi.fn().mockResolvedValue({}),
    stockDepositoUpdate: vi.fn().mockResolvedValue({}),
    reservaCreate: vi.fn().mockResolvedValue({}),
    reservaUpdateMany: vi.fn().mockResolvedValue({ count: 1 }),
    insumoUpdate: vi.fn().mockResolvedValue({}),
    ordenUpdate: vi.fn().mockResolvedValue(buildOrdenDb()),
  }

  const prisma = {
    articulo: {
      findFirst: vi.fn().mockResolvedValue({ id: PRODUCTO_ID, tipo: 'articulo' }),
    },
    appUser: { findFirst: vi.fn().mockResolvedValue({ id: 7 }) },
    deposito: { findFirst: vi.fn().mockResolvedValue({ id: DEPOSITO_ID }) },
    recuento: { findFirst: vi.fn().mockResolvedValue(null) },
    formulaProduccion: { findFirst: vi.fn().mockResolvedValue(buildFormulaDb()) },
    ordenProduccion: {
      findFirst: vi.fn().mockResolvedValue(buildOrdenDb()),
      findMany: vi.fn().mockResolvedValue([]),
      count: vi.fn().mockResolvedValue(0),
      aggregate: vi.fn().mockResolvedValue({ _max: { numero: 4 } }),
      create: vi.fn().mockResolvedValue(buildOrdenDb()),
      update: tx.ordenUpdate,
    },
    stockDeposito: {
      findMany: vi.fn().mockResolvedValue([{ articuloId: INSUMO_ID, cantidad: 300 }]),
    },
    stockReservaProduccion: { findMany: vi.fn().mockResolvedValue([]) },
    $transaction: vi.fn(async (fn: (client: unknown) => Promise<unknown>) =>
      fn({
        stockReservaProduccion: {
          create: tx.reservaCreate,
          updateMany: tx.reservaUpdateMany,
        },
        ordenProduccionInsumo: { update: tx.insumoUpdate },
        ordenProduccion: { update: tx.ordenUpdate },
        stockAjuste: { create: tx.stockAjusteCreate },
        stockDeposito: {
          findUnique: vi.fn().mockResolvedValue({ id: 1, cantidad: 1000 }),
          update: tx.stockDepositoUpdate,
          create: vi.fn().mockResolvedValue({}),
          aggregate: vi.fn().mockResolvedValue({ _sum: { cantidad: 1000 } }),
        },
        articulo: { update: vi.fn().mockResolvedValue({}) },
      }),
    ),
  } as unknown as PrismaClient

  return { prisma, tx }
}

describe('OrdenProduccionService (#249)', () => {
  let prisma: PrismaClient
  let tx: TxMocks
  let service: OrdenProduccionService

  beforeEach(() => {
    const mock = createPrismaMock()
    prisma = mock.prisma
    tx = mock.tx
    service = new OrdenProduccionService(prisma)
  })

  it('creates an order with the next number and BOM projected inputs', async () => {
    const result = await service.create(1, {
      articuloId: PRODUCTO_ID,
      cantidadPlanif: 500,
      depositoId: DEPOSITO_ID,
    })

    expect(result.ok).toBe(true)
    const createArgs = vi.mocked(prisma.ordenProduccion.create).mock.calls[0]?.[0] as {
      data: { numero: number; insumos: { create: Array<{ cantidadPlan: Decimal }> } }
    }
    expect(createArgs.data.numero).toBe(5)
    expect(createArgs.data.insumos.create[0]?.cantidadPlan.toString()).toBe('250')
  })

  it('rejects create when the article has no active formula', async () => {
    vi.mocked(prisma.formulaProduccion.findFirst).mockResolvedValue(null as never)

    const result = await service.create(1, { articuloId: PRODUCTO_ID, cantidadPlanif: 10 })

    expect(result).toMatchObject({ ok: false, status: 422, error: 'ACTIVE_FORMULA_REQUIRED' })
  })

  it('reports missing inputs through disponibilidad', async () => {
    vi.mocked(prisma.stockDeposito.findMany).mockResolvedValue([
      { articuloId: INSUMO_ID, cantidad: 235 },
    ] as never)

    const result = await service.getDisponibilidad(1, 5)

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.suficiente).toBe(false)
      expect(result.data.lineas[0]).toMatchObject({ faltante: 15 })
    }
  })

  it('starts production creating soft reservations for stock inputs only', async () => {
    const result = await service.iniciar(1, 5)

    expect(result.ok).toBe(true)
    expect(tx.reservaCreate).toHaveBeenCalledTimes(1)
    expect(tx.reservaCreate.mock.calls[0]?.[0]).toMatchObject({
      data: expect.objectContaining({ articuloId: INSUMO_ID, depositoId: DEPOSITO_ID }),
    })
    expect(tx.ordenUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ estado: 'en_proceso' }) }),
    )
  })

  it('refuses to start when available stock is below plan', async () => {
    vi.mocked(prisma.stockDeposito.findMany).mockResolvedValue([
      { articuloId: INSUMO_ID, cantidad: 100 },
    ] as never)

    const result = await service.iniciar(1, 5)

    expect(result).toMatchObject({ ok: false, status: 422, error: 'INSUFFICIENT_STOCK' })
    expect(tx.reservaCreate).not.toHaveBeenCalled()
  })

  it('refuses to start unless the order is planned', async () => {
    vi.mocked(prisma.ordenProduccion.findFirst).mockResolvedValue(
      buildOrdenDb({ estado: 'completada' }) as never,
    )

    const result = await service.iniciar(1, 5)

    expect(result).toMatchObject({ ok: false, status: 422, error: 'ORDER_NOT_PLANNED' })
  })

  it('completes the order registering consumption, waste and finished goods', async () => {
    vi.mocked(prisma.ordenProduccion.findFirst).mockResolvedValue(
      buildOrdenDb({ estado: 'en_proceso' }) as never,
    )

    const result = await service.completar(1, 5, 7, {
      cantidadReal: 480,
      insumos: [{ articuloId: INSUMO_ID, cantidadReal: 260 }],
    })

    expect(result.ok).toBe(true)
    expect(tx.reservaUpdateMany).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ activa: false }) }),
    )
    const motivos = tx.stockAjusteCreate.mock.calls.map(
      (call) => (call[0] as { data: { motivo: string; cantidad: number } }).data,
    )
    expect(motivos).toEqual([
      expect.objectContaining({ motivo: 'produccion_consumo', cantidad: -250 }),
      expect.objectContaining({ motivo: 'merma_produccion', cantidad: -10 }),
      expect.objectContaining({ motivo: 'produccion_alta', cantidad: 480 }),
    ])
    const ordenUpdateData = tx.ordenUpdate.mock.calls.at(-1)?.[0] as {
      data: { estado: string; costoTotal: Decimal }
    }
    expect(ordenUpdateData.data.estado).toBe('completada')
    expect(ordenUpdateData.data.costoTotal.toString()).toBe(String(260 * 1800 + 4 * 5000))
  })

  it('blocks completion while a stock count is open', async () => {
    vi.mocked(prisma.ordenProduccion.findFirst).mockResolvedValue(
      buildOrdenDb({ estado: 'en_proceso' }) as never,
    )
    vi.mocked(prisma.recuento.findFirst).mockResolvedValue({ id: 1 } as never)

    const result = await service.completar(1, 5, 7, { cantidadReal: 100 })

    expect(result).toMatchObject({ ok: false, status: 422, error: 'RECUENTO_IN_PROGRESS' })
  })

  it('rejects completion for inputs outside the order', async () => {
    vi.mocked(prisma.ordenProduccion.findFirst).mockResolvedValue(
      buildOrdenDb({ estado: 'en_proceso' }) as never,
    )

    const result = await service.completar(1, 5, 7, {
      cantidadReal: 100,
      insumos: [{ articuloId: 999, cantidadReal: 1 }],
    })

    expect(result).toMatchObject({ ok: false, status: 400, error: 'INVALID_INSUMO' })
  })

  it('cancels the order releasing reservations without moving stock', async () => {
    const result = await service.cancelar(1, 5)

    expect(result.ok).toBe(true)
    expect(tx.reservaUpdateMany).toHaveBeenCalled()
    expect(tx.stockAjusteCreate).not.toHaveBeenCalled()
    expect(tx.ordenUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ estado: 'cancelada' }) }),
    )
  })

  it('refuses to cancel completed orders', async () => {
    vi.mocked(prisma.ordenProduccion.findFirst).mockResolvedValue(
      buildOrdenDb({ estado: 'completada' }) as never,
    )

    const result = await service.cancelar(1, 5)

    expect(result).toMatchObject({ ok: false, status: 422, error: 'ORDER_NOT_CANCELLABLE' })
  })

  it('creates a draft purchase order for the missing inputs', async () => {
    vi.mocked(prisma.stockDeposito.findMany).mockResolvedValue([
      { articuloId: INSUMO_ID, cantidad: 235 },
    ] as never)
    const compras = {
      create: vi.fn().mockResolvedValue({ ok: true, data: { id: 77 } }),
    } as unknown as CompraService
    service = new OrdenProduccionService(prisma, compras)

    const result = await service.sugerirCompra(1, 5, { proveedorId: 9 })

    expect(result).toMatchObject({ ok: true })
    expect(compras.create).toHaveBeenCalledWith(
      1,
      expect.objectContaining({
        proveedorId: 9,
        depositoId: DEPOSITO_ID,
        items: [{ articuloId: INSUMO_ID, cantidad: 15, costoUnitario: 1800 }],
      }),
    )
  })

  it('returns 422 when there are no missing inputs to purchase', async () => {
    const result = await service.sugerirCompra(1, 5, { proveedorId: 9 })

    expect(result).toMatchObject({ ok: false, status: 422, error: 'NO_MISSING_INPUTS' })
  })
})
