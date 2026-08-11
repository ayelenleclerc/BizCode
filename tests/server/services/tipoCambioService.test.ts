import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { arsFromFx, TipoCambioService } from '../../../apps/server/services/TipoCambioService'
import * as bcra from '../../../apps/server/integrations/bcraTipoCambio'
import * as notifications from '../../../apps/server/notifications'

vi.mock('../../../apps/server/integrations/bcraTipoCambio', () => ({
  fetchBcraUsdOficial: vi.fn(),
}))

vi.mock('../../../apps/server/notifications', () => ({
  notifyManagers: vi.fn().mockResolvedValue(undefined),
}))

describe('arsFromFx', () => {
  it('converts USD × TC to ARS with 2 decimals', () => {
    expect(arsFromFx(10, 1000.5)).toBe(10005)
    expect(arsFromFx(1.125, 1000)).toBe(1125)
    expect(arsFromFx(1.111, 1000)).toBe(1111)
  })
})

describe('TipoCambioService', () => {
  let prisma: PrismaClient
  let service: TipoCambioService

  beforeEach(() => {
    vi.clearAllMocks()
    prisma = {
      tenantConfig: {
        findUnique: vi.fn().mockResolvedValue({ tipoCambioPreferido: 'oficial', modules: ['catalog.multicurrency'] }),
        findMany: vi.fn().mockResolvedValue([{ tenantId: 1, modules: ['catalog.multicurrency'] }]),
        update: vi.fn().mockResolvedValue({}),
      },
      tipoCambio: {
        count: vi.fn().mockResolvedValue(1),
        findMany: vi.fn().mockResolvedValue([]),
        findFirst: vi.fn(),
        create: vi.fn(),
      },
      articulo: {
        findMany: vi.fn().mockResolvedValue([
          { id: 5, precioEnMonedaOrigen: new Decimal(10) },
        ]),
        update: vi.fn().mockResolvedValue({}),
      },
    } as unknown as PrismaClient
    service = new TipoCambioService(prisma)
  })

  it('recalculates FX article precioLista1 and notifies managers', async () => {
    const result = await service.recalcArticulosFx(1, 'USD', 'oficial', 1200)
    expect(result.updatedCount).toBe(1)
    expect(prisma.articulo.update).toHaveBeenCalledWith({
      where: { id: 5 },
      data: { precioLista1: new Decimal(12000) },
    })
    expect(notifications.notifyManagers).toHaveBeenCalledWith(
      prisma,
      1,
      'precios_fx_actualizados',
      expect.objectContaining({ amount: '1' }),
    )
  })

  it('createManual stores rate and recalcs when preferred type matches', async () => {
    vi.mocked(prisma.tipoCambio.create).mockResolvedValue({
      id: 9,
      tenantId: 1,
      moneda: 'USD',
      tipo: 'oficial',
      valor: new Decimal(1100),
      fecha: new Date('2026-07-24T12:00:00.000Z'),
      fuente: 'manual',
      createdById: 2,
      createdAt: new Date('2026-07-24T12:00:00.000Z'),
    } as never)

    const result = await service.createManual(1, 2, {
      moneda: 'USD',
      tipo: 'oficial',
      valor: 1100,
    })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.valor).toBe(1100)
      expect(result.recalc?.updatedCount).toBe(1)
    }
  })

  it('syncBcraOficial persists BCRA rate and recalcs', async () => {
    vi.mocked(bcra.fetchBcraUsdOficial).mockResolvedValue({
      valor: 1300,
      fecha: new Date('2026-07-24T12:00:00.000Z'),
      rawFecha: '2026-07-24',
    })
    vi.mocked(prisma.tipoCambio.create).mockResolvedValue({
      id: 11,
      tenantId: 1,
      moneda: 'USD',
      tipo: 'oficial',
      valor: new Decimal(1300),
      fecha: new Date('2026-07-24T12:00:00.000Z'),
      fuente: 'bcra_api',
      createdById: null,
      createdAt: new Date('2026-07-24T12:00:00.000Z'),
    } as never)

    const result = await service.syncBcraOficial(1, null, 'USD')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.fuente).toBe('bcra_api')
      expect(result.recalc.updatedCount).toBe(1)
    }
  })

  it('syncBcraOficial returns 502 when BCRA fails', async () => {
    vi.mocked(bcra.fetchBcraUsdOficial).mockRejectedValue(new Error('BCRA API HTTP 503'))
    const result = await service.syncBcraOficial(1, null, 'USD')
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.status).toBe(502)
    }
    expect(prisma.tipoCambio.create).not.toHaveBeenCalled()
  })
})
