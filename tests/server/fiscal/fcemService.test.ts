import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { FCEM_DEFAULT_UMBRAL_ARS } from '@bizcode/types'
import { FcemService } from '../../../apps/server/fiscal/ar/FcemService'

function buildPrisma(overrides: Partial<Record<string, unknown>> = {}): PrismaClient {
  const facturaRow = {
    id: 9,
    total: FCEM_DEFAULT_UMBRAL_ARS,
    tipo: 'A',
    estadoCae: 'pending',
    cae: null,
    caeVto: null,
    fcemEstado: null,
    fcemTipoCbte: null,
    fcemPlazoPagoDias: null,
    fcemRejectReason: null,
    fcemEmittedAt: null,
    fcemResolvedAt: null,
    cliente: { condIva: 'RI', creditDays: 45 },
  }
  return {
    factura: {
      findFirst: vi.fn().mockResolvedValue(facturaRow),
      update: vi.fn(async ({ data }: { data: Record<string, unknown> }) => ({
        ...facturaRow,
        ...data,
      })),
    },
    paramEmpresa: {
      findUnique: vi.fn().mockResolvedValue({ esMipyme: true, fcemUmbralMonto: null }),
    },
    ...overrides,
  } as unknown as PrismaClient
}

describe('FcemService', () => {
  let prisma: PrismaClient
  let service: FcemService

  beforeEach(() => {
    prisma = buildPrisma()
    service = new FcemService(prisma)
  })

  it('evaluate returns required=true for MiPyME + RI + threshold + plazo', async () => {
    const result = await service.evaluate(1, 9)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data.detection.required).toBe(true)
    expect(result.data.detection.fcemTipoCbte).toBe(201)
  })

  it('emit persists pendiente_aceptacion and CAE', async () => {
    const result = await service.emit(1, 9)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data.fcemEstado).toBe('pendiente_aceptacion')
    expect(result.data.cae).toMatch(/^\d{14}$/)
    expect(prisma.factura.update).toHaveBeenCalled()
  })

  it('emit returns FCEM_NOT_REQUIRED when issuer is not MiPyME', async () => {
    prisma = buildPrisma({
      paramEmpresa: {
        findUnique: vi.fn().mockResolvedValue({ esMipyme: false, fcemUmbralMonto: null }),
      },
    })
    service = new FcemService(prisma)
    const result = await service.emit(1, 9)
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error).toBe('FCEM_NOT_REQUIRED')
  })

  it('accept resolves pendiente to aceptada', async () => {
    prisma = buildPrisma({
      factura: {
        findFirst: vi.fn().mockResolvedValue({
          id: 9,
          total: FCEM_DEFAULT_UMBRAL_ARS,
          tipo: 'A',
          estadoCae: 'issued',
          cae: '71000000000009',
          caeVto: new Date(),
          fcemEstado: 'pendiente_aceptacion',
          fcemTipoCbte: 201,
          fcemPlazoPagoDias: 45,
          fcemRejectReason: null,
          fcemEmittedAt: new Date(),
          fcemResolvedAt: null,
          cliente: { condIva: 'RI', creditDays: 45 },
        }),
        update: vi.fn(async ({ data }: { data: Record<string, unknown> }) => ({
          id: 9,
          cae: '71000000000009',
          caeVto: new Date(),
          fcemEstado: data.fcemEstado,
          fcemTipoCbte: 201,
          fcemPlazoPagoDias: 45,
          fcemRejectReason: data.fcemRejectReason ?? null,
          fcemEmittedAt: new Date(),
          fcemResolvedAt: data.fcemResolvedAt,
        })),
      },
    })
    service = new FcemService(prisma)
    const result = await service.accept(1, 9)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data.fcemEstado).toBe('aceptada')
  })
})
