/**
 * @en Mercado Libre order import service tests (#186).
 * @es Tests del servicio de importación de órdenes ML (#186).
 * @pt-BR Testes do serviço de importação de pedidos ML (#186).
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { encryptFiscalSecret } from '../../../apps/server/fiscal/ar/fiscalSecrets'
import {
  extractMeliResourceId,
  MeliOrderImportService,
} from '../../../apps/server/services/MeliOrderImportService'

vi.mock('../../../apps/server/integrations/meli/meliItemsClient', () => ({
  getMeliOrder: vi.fn(),
  getMeliItem: vi.fn(),
  updateMeliItem: vi.fn(),
}))

vi.mock('../../../apps/server/services/MeliStockSyncService', () => ({
  MeliStockSyncService: class {
    syncStockToMeli = vi.fn().mockResolvedValue({ ok: true, data: { synced: true } })
  },
}))

vi.mock('../../../apps/server/notifications', () => ({
  notifyManagers: vi.fn().mockResolvedValue(undefined),
}))

import { getMeliOrder } from '../../../apps/server/integrations/meli/meliItemsClient'
import { notifyManagers } from '../../../apps/server/notifications'

const ORDER_ID = '2000003509'

const paidOrder = {
  id: Number(ORDER_ID),
  status: 'paid',
  buyer: { nickname: 'BUYERML', email: 'buyer@example.com', first_name: 'Ana', last_name: 'Perez' },
  shipping: { id: 99, logistic_type: 'drop_off' },
  tags: [],
  order_items: [{ item: { id: 'MLA100', title: 'Cable USB' }, quantity: 2, unit_price: 1500 }],
}

type MeliOrdenState = {
  id: number
  tenantId: number
  meliOrderId: string
  status: string
  shippingId: string | null
  isFulfillment: boolean
  buyerNickname: string | null
  cuitPending: boolean
  stockAppliedAt: Date | null
  lastSyncedAt: Date
  pedidoId: number | null
  pedido?: {
    id: number
    estado: string
    facturaId: number | null
    total?: number
    clienteId?: number
    cliente?: { id: number; cuit: string | null; condIva?: string; rsocial?: string }
  } | null
}

function buildPrisma(initial?: MeliOrdenState | null): {
  prisma: PrismaClient
  stockAdjustCalls: Array<{ cantidad: number; motivo: string }>
  state: { orden: MeliOrdenState | null; pedidosCancelled: number[] }
} {
  const state: { orden: MeliOrdenState | null; pedidosCancelled: number[] } = {
    orden: initial ?? null,
    pedidosCancelled: [],
  }
  const stockAdjustCalls: Array<{ cantidad: number; motivo: string }> = []
  let nextOrdenId = 1
  let nextPedidoId = 50
  let nextClienteId = 20

  const prisma = {
    meliConfig: {
      findUnique: vi.fn().mockResolvedValue({
        tenantId: 1,
        accessTokenEncrypted: encryptFiscalSecret('access-token'),
        refreshTokenEncrypted: encryptFiscalSecret('refresh-token'),
        meliUserId: '468834342',
        activo: true,
      }),
    },
    meliOrden: {
      findUnique: vi.fn().mockImplementation(
        async ({
          where,
        }: {
          where: { tenantId_meliOrderId?: { tenantId: number; meliOrderId: string }; id?: number }
        }) => {
          if (!state.orden) return null
          if (where.id != null) return where.id === state.orden.id ? state.orden : null
          if (where.tenantId_meliOrderId) {
            const k = where.tenantId_meliOrderId
            return state.orden.tenantId === k.tenantId && state.orden.meliOrderId === k.meliOrderId
              ? state.orden
              : null
          }
          return null
        },
      ),
      findUniqueOrThrow: vi.fn().mockImplementation(async ({ where }: { where: { id: number } }) => {
        if (!state.orden || state.orden.id !== where.id) throw new Error('not found')
        return state.orden
      }),
      create: vi.fn().mockImplementation(async ({ data }: { data: Record<string, unknown> }) => {
        state.orden = {
          id: nextOrdenId++,
          tenantId: data.tenantId as number,
          meliOrderId: data.meliOrderId as string,
          status: data.status as string,
          shippingId: (data.shippingId as string | null) ?? null,
          isFulfillment: Boolean(data.isFulfillment),
          buyerNickname: (data.buyerNickname as string | null) ?? null,
          cuitPending: false,
          stockAppliedAt: null,
          lastSyncedAt: new Date(),
          pedidoId: null,
          pedido: null,
        }
        return state.orden
      }),
      update: vi.fn().mockImplementation(
        async ({ where, data }: { where: { id: number }; data: Record<string, unknown> }) => {
          if (!state.orden || state.orden.id !== where.id) throw new Error('not found')
          state.orden = {
            ...state.orden,
            ...data,
            stockAppliedAt:
              data.stockAppliedAt === undefined
                ? state.orden.stockAppliedAt
                : (data.stockAppliedAt as Date | null),
            lastSyncedAt:
              data.lastSyncedAt instanceof Date ? data.lastSyncedAt : state.orden.lastSyncedAt,
          } as MeliOrdenState
          return state.orden
        },
      ),
      count: vi.fn().mockResolvedValue(0),
      findMany: vi.fn().mockResolvedValue([]),
    },
    meliPublicacion: {
      findFirst: vi.fn().mockResolvedValue({ articuloId: 10, meliItemId: 'MLA100' }),
    },
    articulo: {
      findFirst: vi.fn().mockResolvedValue({
        id: 10,
        codigo: 100,
        descripcion: 'Cable USB',
        stock: 20,
        minimo: 0,
        tipo: 'articulo',
        esPadre: false,
        controlLote: false,
        unidadBase: 'unidad',
        multiploVenta: null,
        condIva: '1',
        unidadServicio: null,
        activo: true,
      }),
    },
    cliente: {
      findFirst: vi.fn().mockResolvedValue(null),
      aggregate: vi.fn().mockResolvedValue({ _max: { codigo: 5 } }),
      create: vi.fn().mockImplementation(async ({ data }: { data: Record<string, unknown> }) => {
        const created = {
          id: nextClienteId++,
          rsocial: data.rsocial as string,
          cuit: null as string | null,
          condIva: 'CF',
        }
        return created
      }),
    },
    pedido: {
      create: vi.fn().mockImplementation(async ({ data }: { data: Record<string, unknown> }) => {
        const id = nextPedidoId++
        const pedido = {
          id,
          estado: data.estado as string,
          facturaId: null as number | null,
          total: data.total as number,
          clienteId: data.clienteId as number,
          cliente: { id: data.clienteId as number, cuit: null, condIva: 'CF', rsocial: 'BUYERML' },
        }
        if (state.orden) {
          state.orden.pedido = pedido
        }
        return { id }
      }),
      findFirst: vi.fn().mockImplementation(async ({ where }: { where: { id: number } }) => {
        if (!state.orden?.pedido || state.orden.pedido.id !== where.id) return null
        return {
          id: state.orden.pedido.id,
          estado: state.orden.pedido.estado,
          facturaId: state.orden.pedido.facturaId,
        }
      }),
      update: vi.fn().mockImplementation(
        async ({ where, data }: { where: { id: number }; data: Record<string, unknown> }) => {
          if (!state.orden?.pedido || state.orden.pedido.id !== where.id) throw new Error('no pedido')
          state.orden.pedido = { ...state.orden.pedido, ...data }
          state.pedidosCancelled.push(where.id)
          return {
            ...state.orden.pedido,
            items: [],
            cliente: state.orden.pedido.cliente ?? { id: 1, cuit: null, condIva: 'CF', rsocial: 'x' },
          }
        },
      ),
    },
    deposito: { findFirst: vi.fn().mockResolvedValue(null) },
    stockAjuste: {
      create: vi.fn().mockImplementation(async ({ data }: { data: { cantidad: number; motivo: string } }) => {
        stockAdjustCalls.push({ cantidad: data.cantidad, motivo: data.motivo })
        return { id: stockAdjustCalls.length, user: { id: 1, username: 'system' } }
      }),
    },
    stockDeposito: { findFirst: vi.fn().mockResolvedValue(null) },
    recuento: { findFirst: vi.fn().mockResolvedValue(null) },
    tenantConfig: { findUnique: vi.fn().mockResolvedValue({ modules: [] }) },
    notification: { createMany: vi.fn().mockResolvedValue({ count: 0 }) },
    appUser: { findMany: vi.fn().mockResolvedValue([]) },
    $transaction: vi.fn(async (fn: (tx: unknown) => Promise<unknown>) => {
      const tx = {
        articulo: {
          update: vi.fn().mockResolvedValue({
            id: 10,
            codigo: 100,
            descripcion: 'Cable USB',
            stock: 18,
            minimo: 0,
          }),
          findFirstOrThrow: vi.fn().mockResolvedValue({
            id: 10,
            codigo: 100,
            descripcion: 'Cable USB',
            stock: 18,
            minimo: 0,
          }),
        },
        stockAjuste: {
          create: vi.fn().mockImplementation(
            async ({ data }: { data: { cantidad: number; motivo: string } }) => {
              stockAdjustCalls.push({ cantidad: data.cantidad, motivo: data.motivo })
              return {
                id: stockAdjustCalls.length,
                tenantId: 1,
                articuloId: 10,
                cantidad: data.cantidad,
                motivo: data.motivo,
                userId: 1,
                user: { id: 1, username: 'system' },
              }
            },
          ),
        },
        stockDeposito: { upsert: vi.fn(), update: vi.fn(), findFirst: vi.fn() },
      }
      return fn(tx)
    }),
  } as unknown as PrismaClient

  return { prisma, stockAdjustCalls, state }
}

describe('extractMeliResourceId', () => {
  it('extracts trailing id from resource path', () => {
    expect(extractMeliResourceId('/orders/2000003509')).toBe('2000003509')
    expect(extractMeliResourceId('')).toBeNull()
  })
})

describe('MeliOrderImportService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.BIZCODE_SYSTEM_USER_ID = '1'
  })

  it('paid import creates Pedido + stock once; second paid is no-op for stock/pedido', async () => {
    const { prisma, stockAdjustCalls, state } = buildPrisma()
    const service = new MeliOrderImportService(prisma)
    vi.mocked(getMeliOrder).mockResolvedValue(paidOrder)

    await service.processOrderNotification(1, `/orders/${ORDER_ID}`)
    expect(stockAdjustCalls).toEqual([{ cantidad: -2, motivo: 'venta_meli' }])
    expect(state.orden?.pedidoId).toBe(50)
    expect(state.orden?.stockAppliedAt).toBeInstanceOf(Date)
    expect(notifyManagers).toHaveBeenCalledWith(
      prisma,
      1,
      'meli_order_imported',
      expect.objectContaining({ resource: ORDER_ID, pedidoId: 50 }),
    )
    expect(notifyManagers).toHaveBeenCalledWith(
      prisma,
      1,
      'meli_cuit_required',
      expect.objectContaining({ pedidoId: 50 }),
    )

    const pedidoCreates = vi.mocked(prisma.pedido.create).mock.calls.length
    await service.processOrderNotification(1, `/orders/${ORDER_ID}`)
    expect(stockAdjustCalls).toHaveLength(1)
    expect(vi.mocked(prisma.pedido.create).mock.calls.length).toBe(pedidoCreates)
  })

  it('cancelled before invoice cancels Pedido and restores stock with cancelacion_meli', async () => {
    const { prisma, stockAdjustCalls, state } = buildPrisma({
      id: 1,
      tenantId: 1,
      meliOrderId: ORDER_ID,
      status: 'paid',
      shippingId: '99',
      isFulfillment: false,
      buyerNickname: 'BUYERML',
      cuitPending: true,
      stockAppliedAt: new Date(),
      lastSyncedAt: new Date(),
      pedidoId: 50,
      pedido: {
        id: 50,
        estado: 'confirmed',
        facturaId: null,
        total: 3000,
        clienteId: 20,
        cliente: { id: 20, cuit: null, condIva: 'CF', rsocial: 'BUYERML' },
      },
    })
    const service = new MeliOrderImportService(prisma)
    vi.mocked(getMeliOrder).mockResolvedValue({ ...paidOrder, status: 'cancelled' })

    await service.processOrderNotification(1, `/orders/${ORDER_ID}`)

    expect(state.pedidosCancelled).toContain(50)
    expect(stockAdjustCalls).toContainEqual({ cantidad: 2, motivo: 'cancelacion_meli' })
    expect(state.orden?.stockAppliedAt).toBeNull()
  })

  it('cancelled after invoice only alerts managers (no auto NC)', async () => {
    const { prisma, stockAdjustCalls } = buildPrisma({
      id: 1,
      tenantId: 1,
      meliOrderId: ORDER_ID,
      status: 'paid',
      shippingId: null,
      isFulfillment: false,
      buyerNickname: 'BUYERML',
      cuitPending: false,
      stockAppliedAt: new Date(),
      lastSyncedAt: new Date(),
      pedidoId: 50,
      pedido: {
        id: 50,
        estado: 'invoiced',
        facturaId: 9,
        total: 3000,
        clienteId: 20,
        cliente: { id: 20, cuit: '20111111112', condIva: 'RI', rsocial: 'Buyers SA' },
      },
    })
    const service = new MeliOrderImportService(prisma)
    vi.mocked(getMeliOrder).mockResolvedValue({ ...paidOrder, status: 'cancelled' })

    await service.processOrderNotification(1, `/orders/${ORDER_ID}`)

    expect(stockAdjustCalls).toHaveLength(0)
    expect(notifyManagers).toHaveBeenCalledWith(
      prisma,
      1,
      'meli_order_cancelled_invoiced',
      expect.objectContaining({ pedidoId: 50, facturaId: 9 }),
    )
  })

  it('facturar tipo A without CUIT returns 422 CUIT_REQUIRED_FOR_FACTURA_A', async () => {
    const { prisma } = buildPrisma({
      id: 1,
      tenantId: 1,
      meliOrderId: ORDER_ID,
      status: 'paid',
      shippingId: null,
      isFulfillment: false,
      buyerNickname: 'BUYERML',
      cuitPending: true,
      stockAppliedAt: new Date(),
      lastSyncedAt: new Date(),
      pedidoId: 50,
      pedido: {
        id: 50,
        estado: 'confirmed',
        facturaId: null,
        total: 3000,
        clienteId: 20,
        cliente: { id: 20, cuit: null, condIva: 'CF', rsocial: 'BUYERML' },
      },
    })
    const service = new MeliOrderImportService(prisma)
    const result = await service.facturar(
      1,
      ORDER_ID,
      { fecha: '2026-08-04', tipo: 'A', numero: 1, prefijo: '0001', formaPagoId: 1 },
      1,
    )
    expect(result).toEqual({
      ok: false,
      status: 422,
      error: 'CUIT_REQUIRED_FOR_FACTURA_A',
    })
  })
})
