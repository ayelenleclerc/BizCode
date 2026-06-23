import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { dispatchSupplierNotification } from '../../../apps/server/channels'
import { ProveedorAlertasService } from '../../../apps/server/services/ProveedorAlertasService'

vi.mock('../../../apps/server/channels', () => ({
  dispatchSupplierNotification: vi.fn().mockResolvedValue(undefined),
  isSmtpConfigured: vi.fn().mockReturnValue(false),
}))

function buildPrisma(overrides: Partial<Record<string, unknown>> = {}): PrismaClient {
  return {
    alertaProveedorConfig: {
      findUnique: vi.fn().mockResolvedValue(null),
      upsert: vi.fn().mockResolvedValue({
        diasPrevioAviso: 3,
        diasCritico: 7,
        notifEmail: true,
        notifInApp: true,
      }),
    },
    comprobanteCompra: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
    },
    reciboPagoFactura: {
      groupBy: vi.fn().mockResolvedValue([]),
    },
    alertaProveedorLog: {
      count: vi.fn().mockResolvedValue(0),
      create: vi.fn().mockResolvedValue({ id: 1 }),
    },
    paramEmpresa: {
      findUnique: vi.fn().mockResolvedValue({ timezone: 'America/Argentina/Buenos_Aires' }),
    },
    proveedor: {
      findFirst: vi.fn().mockResolvedValue(null),
    },
    ...overrides,
  } as unknown as PrismaClient
}

describe('ProveedorAlertasService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('lists pending vouchers with proxima_vencer estado', async () => {
    const asOf = new Date('2026-06-10T12:00:00.000Z')
    const prisma = buildPrisma({
      comprobanteCompra: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 5,
            proveedorId: 2,
            fecha: new Date('2026-06-01'),
            vencimiento: new Date('2026-06-12'),
            tipo: 'B',
            prefijo: '0001',
            numero: 10,
            total: new Decimal(1000),
            proveedor: {
              id: 2,
              codigo: 100,
              rsocial: 'Proveedor SA',
              plazoHabitual: 30,
              condicionPago: '30dias',
            },
          },
        ]),
      },
      reciboPagoFactura: {
        groupBy: vi.fn().mockResolvedValue([]),
      },
    })
    const svc = new ProveedorAlertasService(prisma)
    const rows = await svc.listFacturasPendientes(1, undefined, asOf)
    expect(rows).toHaveLength(1)
    expect(rows[0]?.estado).toBe('proxima_vencer')
    expect(rows[0]?.pendiente).toBe('1000.00')
  })

  it('skips daily job outside 07:00 tenant-local slot', async () => {
    const prisma = buildPrisma()
    const svc = new ProveedorAlertasService(prisma)
    const noon = new Date('2026-06-10T15:00:00.000Z')
    const result = await svc.runDailyJob(1, noon)
    expect(result).toEqual({ sent: 0, skipped: 0 })
    expect(prisma.comprobanteCompra.findMany).not.toHaveBeenCalled()
  })

  it('deduplicates alert when already sent today', async () => {
    const prisma = buildPrisma({
      alertaProveedorLog: {
        count: vi.fn().mockResolvedValue(1),
        create: vi.fn(),
      },
    })
    const svc = new ProveedorAlertasService(prisma)
    const result = await svc.sendAlertForRow(
      1,
      {
        comprobanteCompraId: 5,
        proveedorId: 2,
        proveedorCodigo: 100,
        proveedorRsocial: 'Proveedor SA',
        facturaRef: 'B-0001-10',
        fecha: '2026-06-01T00:00:00.000Z',
        vencimiento: '2026-06-09T00:00:00.000Z',
        total: '1000.00',
        pagado: '0.00',
        pendiente: '1000.00',
        estado: 'vencida_hoy',
        diasHastaVencimiento: -1,
        diasVencido: 1,
      },
      { diasPrevioAviso: 3, diasCritico: 7, notifEmail: false, notifInApp: true },
    )
    expect(result).toBe('skipped')
    expect(dispatchSupplierNotification).not.toHaveBeenCalled()
  })

  it('aggregates dashboard totals', async () => {
    const asOf = new Date('2026-06-10T12:00:00.000Z')
    const prisma = buildPrisma({
      comprobanteCompra: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 1,
            proveedorId: 2,
            fecha: new Date('2026-05-01'),
            vencimiento: new Date('2026-06-01'),
            tipo: 'B',
            prefijo: '0001',
            numero: 1,
            total: new Decimal(500),
            proveedor: {
              id: 2,
              codigo: 1,
              rsocial: 'A',
              plazoHabitual: 0,
              condicionPago: 'contado',
            },
          },
          {
            id: 2,
            proveedorId: 2,
            fecha: new Date('2026-06-05'),
            vencimiento: new Date('2026-06-12'),
            tipo: 'B',
            prefijo: '0001',
            numero: 2,
            total: new Decimal(200),
            proveedor: {
              id: 2,
              codigo: 1,
              rsocial: 'A',
              plazoHabitual: 0,
              condicionPago: 'contado',
            },
          },
        ]),
      },
    })
    const svc = new ProveedorAlertasService(prisma)
    const totals = await svc.getDashboardTotals(1, asOf)
    expect(totals.vencido.count).toBe(1)
    expect(totals.proximoVencer.count).toBe(1)
  })
})
