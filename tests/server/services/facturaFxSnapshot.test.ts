import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { FacturaService } from '../../../apps/server/services/FacturaService'

vi.mock('../../../apps/server/lib/recuentoStockGuard', () => ({
  assertNoOpenRecuento: vi.fn().mockResolvedValue({ ok: true }),
}))

vi.mock('../../../apps/server/services/RetencionFacturaValidation', () => ({
  validateFacturaPercepciones: vi.fn().mockResolvedValue({ ok: true, lines: [] }),
}))

vi.mock('../../../apps/server/services/stockDepositoSync', () => ({
  getDefaultDepositoId: vi.fn().mockResolvedValue(null),
  applyStockDepositoDelta: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('../../../apps/server/fiscal/ar/ArcaService', () => ({
  ArcaService: class {
    requestCae = vi.fn().mockResolvedValue({ ok: true })
  },
}))

vi.mock('../../../apps/server/services/ClienteCuentaCorrienteService', () => ({
  ClienteCuentaCorrienteService: class {
    recordFromFactura = vi.fn().mockResolvedValue(undefined)
  },
}))

vi.mock('../../../apps/server/services/GarantiaService', () => ({
  GarantiaService: class {
    registerFromFactura = vi.fn().mockResolvedValue(undefined)
  },
}))

vi.mock('../../../apps/server/services/TurnoCajaService', () => ({
  TurnoCajaService: class {
    tryRecordAutoMovement = vi.fn().mockResolvedValue(undefined)
  },
}))

describe('FacturaService FX snapshot (#243)', () => {
  let prisma: PrismaClient
  let service: FacturaService
  let createdData: Record<string, unknown> | null

  beforeEach(() => {
    createdData = null
    const createdFactura = {
      id: 50,
      tipo: 'B',
      prefijo: '0001',
      numero: 1,
      fecha: new Date('2026-07-24T12:00:00.000Z'),
      total: new Decimal(12000),
      formaPagoId: null,
      tipoCambioValor: new Decimal(1200),
      tipoCambioMoneda: 'USD',
      tipoCambioTipo: 'oficial',
      items: [{ id: 1, articuloId: 7 }],
      cliente: { id: 3, rsocial: 'ACME', balance: new Decimal(0), creditLimit: new Decimal(0) },
    }
    prisma = {
      articulo: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 7,
            codigo: 7,
            descripcion: 'USD item',
            stock: 10,
            minimo: 0,
            tipo: 'articulo',
            condIva: '1',
            unidadServicio: null,
            mesesGarantia: null,
            esPadre: false,
            monedaPrecio: 'USD',
            precioEnMonedaOrigen: new Decimal(10),
          },
        ]),
        update: vi.fn().mockResolvedValue({}),
      },
      tenantConfig: {
        findUnique: vi.fn().mockResolvedValue({ tipoCambioPreferido: 'oficial' }),
      },
      tipoCambio: {
        findFirst: vi.fn().mockResolvedValue({
          id: 99,
          valor: new Decimal(1200),
          tipo: 'oficial',
          fecha: new Date('2026-07-20T12:00:00.000Z'),
          moneda: 'USD',
        }),
      },
      cliente: {
        findFirst: vi.fn().mockResolvedValue({ suspended: false }),
        findFirstOrThrow: vi.fn().mockResolvedValue({
          id: 3,
          rsocial: 'ACME',
          balance: new Decimal(0),
          creditLimit: new Decimal(0),
        }),
        update: vi.fn().mockResolvedValue({
          id: 3,
          rsocial: 'ACME',
          balance: new Decimal(0),
          creditLimit: new Decimal(0),
        }),
      },
      formaPago: {
        findUnique: vi.fn().mockResolvedValue(null),
      },
      factura: {
        create: vi.fn().mockImplementation(async (args: { data: Record<string, unknown> }) => {
          createdData = args.data
          return createdFactura
        }),
      },
      $transaction: vi.fn().mockImplementation(async (fn: (tx: PrismaClient) => Promise<unknown>) => {
        const tx = {
          factura: prisma.factura,
          retencionAplicada: { create: vi.fn() },
          cliente: prisma.cliente,
          articulo: prisma.articulo,
        } as unknown as PrismaClient
        return fn(tx)
      }),
    } as unknown as PrismaClient
    service = new FacturaService(prisma)
  })

  it('freezes invoice and line FX snapshot at create time', async () => {
    const result = await service.create(
      1,
      {
        fecha: '2026-07-24',
        tipo: 'B',
        prefijo: '0001',
        numero: 1,
        clienteId: 3,
        neto1: 0,
        neto2: 0,
        neto3: 0,
        iva1: 0,
        iva2: 0,
        total: 12000,
        items: [{ articuloId: 7, cantidad: 1, precio: 12000, dscto: 0, subtotal: 12000 }],
      },
      1,
      { skipArcaCae: true },
    )

    expect(result.ok).toBe(true)
    expect(createdData).toEqual(
      expect.objectContaining({
        tipoCambioId: 99,
        tipoCambioMoneda: 'USD',
        tipoCambioTipo: 'oficial',
        items: {
          create: [
            expect.objectContaining({
              articuloId: 7,
              monedaOrigen: 'USD',
              precioOrigen: 10,
              tipoCambioValor: 1200,
            }),
          ],
        },
      }),
    )
  })

  it('keeps frozen snapshot values even if a newer rate exists later (immutable create payload)', async () => {
    await service.create(
      1,
      {
        fecha: '2026-07-24',
        tipo: 'B',
        prefijo: '0001',
        numero: 1,
        clienteId: 3,
        neto1: 0,
        neto2: 0,
        neto3: 0,
        iva1: 0,
        iva2: 0,
        total: 12000,
        items: [{ articuloId: 7, cantidad: 1, precio: 12000, dscto: 0, subtotal: 12000 }],
      },
      1,
      { skipArcaCae: true },
    )
    const frozenValor = (createdData as { tipoCambioValor: Decimal }).tipoCambioValor

    vi.mocked(prisma.tipoCambio.findFirst).mockResolvedValue({
      id: 100,
      valor: new Decimal(1500),
      tipo: 'oficial',
      fecha: new Date('2026-07-25T12:00:00.000Z'),
      moneda: 'USD',
    } as never)

    expect(Number(frozenValor.toString())).toBe(1200)
    expect(createdData).toEqual(
      expect.objectContaining({
        tipoCambioId: 99,
        tipoCambioTipo: 'oficial',
      }),
    )
  })
})
