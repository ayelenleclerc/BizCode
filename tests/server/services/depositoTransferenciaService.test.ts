import { describe, expect, it, vi, beforeEach } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { DepositoService } from '../../../apps/server/services/DepositoService'
import { TransferenciaDepositoService } from '../../../apps/server/services/TransferenciaDepositoService'
import { applyStockDepositoDelta, getDefaultDepositoId, syncArticuloStockFromDepositos } from '../../../apps/server/services/stockDepositoSync'

function buildPrisma(overrides: Record<string, unknown> = {}): PrismaClient {
  return {
    deposito: {
      count: vi.fn().mockResolvedValue(1),
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      delete: vi.fn(),
    },
    stockDeposito: {
      findUnique: vi.fn(),
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn(),
      update: vi.fn(),
      aggregate: vi.fn().mockResolvedValue({ _sum: { cantidad: 0 } }),
    },
    articulo: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    transferenciaDeposito: {
      count: vi.fn().mockResolvedValue(0),
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      aggregate: vi.fn().mockResolvedValue({ _max: { numero: 0 } }),
    },
    transferenciaDepositoItem: {
      findMany: vi.fn().mockResolvedValue([]),
      update: vi.fn(),
    },
    stockAjuste: { create: vi.fn() },
    recuento: { findFirst: vi.fn().mockResolvedValue(null) },
    $transaction: vi.fn(async (fn: (tx: PrismaClient) => Promise<unknown>) => fn(buildPrisma(overrides))),
    ...overrides,
  } as unknown as PrismaClient
}

describe('stockDepositoSync (#236)', () => {
  it('syncs articulo stock from deposit sum', async () => {
    const prisma = buildPrisma({
      stockDeposito: {
        aggregate: vi.fn().mockResolvedValue({ _sum: { cantidad: 42 } }),
      },
      articulo: {
        update: vi.fn().mockResolvedValue({ id: 1, stock: 42 }),
      },
    })
    const total = await syncArticuloStockFromDepositos(prisma, 1, 5)
    expect(total).toBe(42)
    expect(prisma.articulo.update).toHaveBeenCalledWith({
      where: { id: 5 },
      data: { stock: 42 },
    })
  })

  it('returns null from getDefaultDepositoId when deposito delegate is missing', async () => {
    const prisma = { articulo: { findFirst: vi.fn() } } as unknown as PrismaClient
    await expect(getDefaultDepositoId(prisma, 1)).resolves.toBeNull()
  })

  it('returns default deposito id when present', async () => {
    const prisma = buildPrisma({
      deposito: {
        findFirst: vi.fn().mockResolvedValue({ id: 7 }),
      },
    })
    await expect(getDefaultDepositoId(prisma, 1)).resolves.toBe(7)
  })

  it('rejects negative stock delta', async () => {
    const prisma = buildPrisma({
      stockDeposito: {
        findUnique: vi.fn().mockResolvedValue({ id: 1, cantidad: 2 }),
      },
    })
    await expect(
      applyStockDepositoDelta(prisma, {
        tenantId: 1,
        articuloId: 5,
        depositoId: 2,
        delta: -5,
      }),
    ).rejects.toThrow('INSUFFICIENT_DEPOSIT_STOCK')
  })

  it('applies positive delta creating stock row', async () => {
    const prisma = buildPrisma({
      stockDeposito: {
        findUnique: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({ id: 1, cantidad: 10 }),
        aggregate: vi.fn().mockResolvedValue({ _sum: { cantidad: 10 } }),
      },
      articulo: {
        update: vi.fn().mockResolvedValue({ id: 5, stock: 10 }),
      },
    })
    const result = await applyStockDepositoDelta(prisma, {
      tenantId: 1,
      articuloId: 5,
      depositoId: 2,
      delta: 10,
    })
    expect(result.cantidad).toBe(10)
    expect(result.stockTotal).toBe(10)
  })
})

describe('DepositoService (#236)', () => {
  beforeEach(() => vi.clearAllMocks())

  it('lists depositos', async () => {
    const row = {
      id: 1,
      tenantId: 1,
      nombre: 'Central',
      codigo: 'DEFAULT',
      tipo: 'central',
      direccion: null,
      responsableId: null,
      activo: true,
      esDefault: true,
      createdAt: new Date('2026-07-23T00:00:00.000Z'),
      updatedAt: new Date('2026-07-23T00:00:00.000Z'),
    }
    const prisma = buildPrisma({
      deposito: {
        count: vi.fn().mockResolvedValue(1),
        findMany: vi.fn().mockResolvedValue([row]),
      },
    })
    const svc = new DepositoService(prisma)
    const result = await svc.list(1, 50, 0)
    expect(result.total).toBe(1)
    expect(result.rows[0]?.codigo).toBe('DEFAULT')
  })

  it('rejects deleting default deposito', async () => {
    const prisma = buildPrisma({
      deposito: {
        findFirst: vi.fn().mockResolvedValue({
          id: 1,
          esDefault: true,
        }),
      },
    })
    const svc = new DepositoService(prisma)
    const result = await svc.remove(1, 1)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toBe('CANNOT_DELETE_DEFAULT_DEPOSITO')
  })

  it('gets deposito by id and stock breakdown', async () => {
    const row = {
      id: 1,
      tenantId: 1,
      nombre: 'Central',
      codigo: 'DEFAULT',
      tipo: 'central',
      direccion: null,
      responsableId: null,
      activo: true,
      esDefault: true,
      createdAt: new Date('2026-07-23T00:00:00.000Z'),
      updatedAt: new Date('2026-07-23T00:00:00.000Z'),
    }
    const prisma = buildPrisma({
      deposito: {
        findFirst: vi.fn().mockResolvedValue(row),
      },
      articulo: {
        findFirst: vi.fn().mockResolvedValue({ id: 5, stock: 8 }),
      },
      stockDeposito: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 1,
            tenantId: 1,
            articuloId: 5,
            depositoId: 1,
            cantidad: 8,
            stockMin: 0,
            stockMax: null,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
            deposito: { codigo: 'DEFAULT', nombre: 'Central' },
          },
        ]),
      },
      transferenciaDepositoItem: {
        findMany: vi.fn().mockResolvedValue([{ cantidadEnviada: 1 }]),
      },
    })
    const svc = new DepositoService(prisma)
    const byId = await svc.getById(1, 1)
    expect(byId.ok).toBe(true)
    const stock = await svc.stockPorArticulo(1, 5)
    expect(stock.ok).toBe(true)
    if (stock.ok) {
      expect(stock.data.stockTotal).toBe(8)
      expect(stock.data.enTransito).toBe(1)
    }
  })

  it('updates deposito nombre', async () => {
    const existing = {
      id: 2,
      tenantId: 1,
      nombre: 'Norte',
      codigo: 'NORTE',
      tipo: 'sucursal',
      direccion: null,
      responsableId: null,
      activo: true,
      esDefault: false,
      createdAt: new Date('2026-07-23T00:00:00.000Z'),
      updatedAt: new Date('2026-07-23T00:00:00.000Z'),
    }
    const updated = { ...existing, nombre: 'Norte 2' }
    const prisma = buildPrisma({
      deposito: {
        findFirst: vi.fn().mockResolvedValue(existing),
        update: vi.fn().mockResolvedValue(updated),
        updateMany: vi.fn(),
      },
    })
    ;(prisma.$transaction as ReturnType<typeof vi.fn>).mockImplementation(async (fn) => fn(prisma))
    const svc = new DepositoService(prisma)
    const result = await svc.update(1, 2, { nombre: 'Norte 2' })
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.data.nombre).toBe('Norte 2')
  })
})

describe('TransferenciaDepositoService (#236)', () => {
  beforeEach(() => vi.clearAllMocks())

  it('creates pendiente transfer', async () => {
    const created = {
      id: 9,
      tenantId: 1,
      numero: 1,
      origenId: 1,
      destinoId: 2,
      estado: 'pendiente',
      solicitadoPorId: 3,
      aprobadoPorId: null,
      fechaEnvio: null,
      fechaRecepcion: null,
      nota: null,
      createdAt: new Date('2026-07-23T00:00:00.000Z'),
      updatedAt: new Date('2026-07-23T00:00:00.000Z'),
      origen: { codigo: 'DEFAULT' },
      destino: { codigo: 'SP' },
      items: [
        {
          id: 1,
          transferenciaId: 9,
          articuloId: 5,
          cantidadEnviada: 10,
          cantidadRecibida: null,
          articulo: { codigo: 5, descripcion: 'Remera' },
        },
      ],
    }
    const prisma = buildPrisma({
      deposito: {
        findFirst: vi
          .fn()
          .mockResolvedValueOnce({ id: 1, activo: true })
          .mockResolvedValueOnce({ id: 2, activo: true }),
      },
      articulo: {
        findMany: vi.fn().mockResolvedValue([{ id: 5, esPadre: false }]),
      },
      transferenciaDeposito: {
        aggregate: vi.fn().mockResolvedValue({ _max: { numero: 0 } }),
        create: vi.fn().mockResolvedValue(created),
      },
    })
    const svc = new TransferenciaDepositoService(prisma)
    const result = await svc.create(1, 3, {
      origenId: 1,
      destinoId: 2,
      items: [{ articuloId: 5, cantidadEnviada: 10 }],
    })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.estado).toBe('pendiente')
      expect(result.data.numero).toBe(1)
    }
  })

  it('marks en_transito debiting origin stock', async () => {
    const existing = {
      id: 9,
      tenantId: 1,
      origenId: 1,
      destinoId: 2,
      estado: 'pendiente',
      items: [{ id: 1, articuloId: 5, cantidadEnviada: 4 }],
    }
    const after = {
      ...existing,
      estado: 'en_transito',
      aprobadoPorId: 3,
      fechaEnvio: new Date('2026-07-23T12:00:00.000Z'),
      fechaRecepcion: null,
      nota: null,
      numero: 1,
      solicitadoPorId: 3,
      createdAt: new Date('2026-07-23T00:00:00.000Z'),
      updatedAt: new Date('2026-07-23T12:00:00.000Z'),
      origen: { codigo: 'DEFAULT' },
      destino: { codigo: 'SP' },
      items: [
        {
          id: 1,
          transferenciaId: 9,
          articuloId: 5,
          cantidadEnviada: 4,
          cantidadRecibida: null,
          articulo: { codigo: 5, descripcion: 'Remera' },
        },
      ],
    }
    const stockState = { cantidad: 10 }
    const prisma = buildPrisma()
    ;(prisma.transferenciaDeposito.findFirst as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(existing)
      .mockResolvedValueOnce(after)
    ;(prisma.stockDeposito.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 1,
      cantidad: stockState.cantidad,
    })
    ;(prisma.stockDeposito.update as ReturnType<typeof vi.fn>).mockImplementation(async ({ data }) => {
      stockState.cantidad = data.cantidad
      return { id: 1, cantidad: data.cantidad }
    })
    ;(prisma.stockDeposito.aggregate as ReturnType<typeof vi.fn>).mockImplementation(async () => ({
      _sum: { cantidad: stockState.cantidad },
    }))
    ;(prisma.articulo.update as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 5, stock: 6 })
    ;(prisma.$transaction as ReturnType<typeof vi.fn>).mockImplementation(async (fn) => fn(prisma))

    const svc = new TransferenciaDepositoService(prisma)
    const result = await svc.markEnTransito(1, 9, 3)
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.data.estado).toBe('en_transito')
    expect(stockState.cantidad).toBe(6)
  })

  it('receives with shortfall and records faltante ajuste', async () => {
    const existing = {
      id: 9,
      tenantId: 1,
      origenId: 1,
      destinoId: 2,
      estado: 'en_transito',
      items: [{ id: 1, articuloId: 5, cantidadEnviada: 10 }],
    }
    const after = {
      ...existing,
      estado: 'recibida',
      numero: 1,
      solicitadoPorId: 3,
      aprobadoPorId: 3,
      fechaEnvio: new Date(),
      fechaRecepcion: new Date(),
      nota: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      origen: { codigo: 'DEFAULT' },
      destino: { codigo: 'SP' },
      items: [
        {
          id: 1,
          transferenciaId: 9,
          articuloId: 5,
          cantidadEnviada: 10,
          cantidadRecibida: 7,
          articulo: { codigo: 5, descripcion: 'Remera' },
        },
      ],
    }
    const prisma = buildPrisma()
    ;(prisma.transferenciaDeposito.findFirst as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(existing)
      .mockResolvedValueOnce(after)
    ;(prisma.stockDeposito.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null)
    ;(prisma.stockDeposito.create as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 2, cantidad: 7 })
    ;(prisma.stockDeposito.aggregate as ReturnType<typeof vi.fn>).mockResolvedValue({
      _sum: { cantidad: 7 },
    })
    ;(prisma.articulo.update as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 5, stock: 7 })
    ;(prisma.$transaction as ReturnType<typeof vi.fn>).mockImplementation(async (fn) => fn(prisma))

    const svc = new TransferenciaDepositoService(prisma)
    const result = await svc.receive(1, 9, 3, {
      items: [{ articuloId: 5, cantidadRecibida: 7 }],
    })
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.data.estado).toBe('recibida')
    expect(prisma.stockAjuste.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          cantidad: -3,
          motivo: 'transferencia_faltante',
        }),
      }),
    )
  })

  it('anuls pendiente without restocking', async () => {
    const existing = {
      id: 9,
      tenantId: 1,
      origenId: 1,
      destinoId: 2,
      estado: 'pendiente',
      items: [{ id: 1, articuloId: 5, cantidadEnviada: 4 }],
    }
    const after = {
      ...existing,
      estado: 'anulada',
      numero: 1,
      solicitadoPorId: 3,
      aprobadoPorId: null,
      fechaEnvio: null,
      fechaRecepcion: null,
      nota: null,
      createdAt: new Date('2026-07-23T00:00:00.000Z'),
      updatedAt: new Date('2026-07-23T00:00:00.000Z'),
      origen: { codigo: 'DEFAULT' },
      destino: { codigo: 'SP' },
      items: [
        {
          id: 1,
          transferenciaId: 9,
          articuloId: 5,
          cantidadEnviada: 4,
          cantidadRecibida: null,
          articulo: { codigo: 5, descripcion: 'Remera' },
        },
      ],
    }
    const prisma = buildPrisma()
    ;(prisma.transferenciaDeposito.findFirst as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(existing)
      .mockResolvedValueOnce(after)
    ;(prisma.$transaction as ReturnType<typeof vi.fn>).mockImplementation(async (fn) => fn(prisma))
    const svc = new TransferenciaDepositoService(prisma)
    const result = await svc.anular(1, 9)
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.data.estado).toBe('anulada')
    expect(prisma.stockDeposito.findUnique).not.toHaveBeenCalled()
  })

  it('lists and gets transferencia by id', async () => {
    const row = {
      id: 9,
      tenantId: 1,
      numero: 1,
      origenId: 1,
      destinoId: 2,
      estado: 'pendiente',
      solicitadoPorId: 3,
      aprobadoPorId: null,
      fechaEnvio: null,
      fechaRecepcion: null,
      nota: null,
      createdAt: new Date('2026-07-23T00:00:00.000Z'),
      updatedAt: new Date('2026-07-23T00:00:00.000Z'),
      origen: { codigo: 'DEFAULT' },
      destino: { codigo: 'SP' },
      items: [],
    }
    const prisma = buildPrisma({
      transferenciaDeposito: {
        count: vi.fn().mockResolvedValue(1),
        findMany: vi.fn().mockResolvedValue([row]),
        findFirst: vi.fn().mockResolvedValue(row),
      },
    })
    const svc = new TransferenciaDepositoService(prisma)
    const listed = await svc.list(1, 50, 0)
    expect(listed.total).toBe(1)
    const byId = await svc.getById(1, 9)
    expect(byId.ok).toBe(true)
  })
})
