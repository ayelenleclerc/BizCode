import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { LiquidacionComisionService } from '../../../apps/server/services/LiquidacionComisionService'
import { ComisionConfigService } from '../../../apps/server/services/ComisionConfigService'

function buildPrisma(overrides: Record<string, unknown> = {}): PrismaClient {
  return {
    configComision: {
      count: vi.fn().mockResolvedValue(0),
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    liquidacionComision: {
      count: vi.fn().mockResolvedValue(0),
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      findFirstOrThrow: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    liquidacionComisionDetalle: {
      deleteMany: vi.fn(),
      createMany: vi.fn(),
    },
    appUser: {
      findFirst: vi.fn(),
      findMany: vi.fn().mockResolvedValue([{ id: 3 }]),
    },
    tenantConfig: {
      findUnique: vi.fn().mockResolvedValue({ comisionesModoDevengo: 'porcentaje_cobrado' }),
      update: vi.fn(),
    },
    reciboCobroImputacion: {
      findMany: vi.fn().mockResolvedValue([
        {
          id: 10,
          facturaId: 5,
          reciboCobroId: 8,
          importe: 100,
          reciboCobro: { id: 8, fecha: new Date('2026-07-10T00:00:00.000Z'), numero: 1 },
          factura: {
            id: 5,
            clienteId: 2,
            total: 100,
            items: [{ articulo: { categoriaId: null } }],
          },
        },
      ]),
    },
    factura: { findMany: vi.fn().mockResolvedValue([]) },
    $transaction: vi.fn(async (fn: (tx: PrismaClient) => Promise<unknown>) => fn(buildPrisma(overrides))),
    ...overrides,
  } as unknown as PrismaClient
}

describe('ComisionConfigService (#237)', () => {
  it('returns default modoDevengo', async () => {
    const svc = new ComisionConfigService(buildPrisma())
    await expect(svc.getModoDevengo(1)).resolves.toBe('porcentaje_cobrado')
  })

  it('creates config for active seller', async () => {
    const created = {
      id: 1,
      tenantId: 1,
      vendedorId: 3,
      tipo: 'porcentaje_cobrado',
      alicuota: 3,
      vigenciaDesde: new Date('2026-07-01T00:00:00.000Z'),
      vigenciaHasta: null,
      articuloCategoriaId: null,
      clienteId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      vendedor: { username: 'seller1' },
    }
    const prisma = buildPrisma({
      appUser: { findFirst: vi.fn().mockResolvedValue({ id: 3 }) },
      configComision: {
        create: vi.fn().mockResolvedValue(created),
      },
    })
    const svc = new ComisionConfigService(prisma)
    const result = await svc.create(1, {
      vendedorId: 3,
      tipo: 'porcentaje_cobrado',
      alicuota: 3,
      vigenciaDesde: '2026-07-01T00:00:00.000Z',
    })
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.data.alicuota).toBe(3)
  })
})

describe('LiquidacionComisionService (#237)', () => {
  beforeEach(() => vi.clearAllMocks())

  it('generates draft settlement from partial collections', async () => {
    const prisma = buildPrisma({
      configComision: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 1,
            tipo: 'porcentaje_cobrado',
            alicuota: 3,
            vigenciaDesde: new Date('2026-01-01T00:00:00.000Z'),
            vigenciaHasta: null,
            articuloCategoriaId: null,
            clienteId: null,
          },
        ]),
      },
      liquidacionComision: {
        findUnique: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({
          id: 9,
          tenantId: 1,
          vendedorId: 3,
          periodo: '2026-07',
          totalVentas: 100,
          totalComision: 3,
          estado: 'borrador',
          aprobadoPorId: null,
          pagadoEn: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          vendedor: { username: 'seller1' },
          detalle: [],
        }),
      },
    })
    ;(prisma.$transaction as ReturnType<typeof vi.fn>).mockImplementation(async (fn) => fn(prisma))
    const svc = new LiquidacionComisionService(prisma)
    const result = await svc.generate(1, '2026-07', 3)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.created).toHaveLength(1)
      expect(result.data.created[0]?.totalComision).toBe(3)
    }
  })

  it('approves then pays settlement', async () => {
    const draft = {
      id: 9,
      tenantId: 1,
      vendedorId: 3,
      periodo: '2026-07',
      totalVentas: 100,
      totalComision: 3,
      estado: 'borrador',
      aprobadoPorId: null,
      pagadoEn: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      vendedor: { username: 'seller1' },
      detalle: [],
    }
    const prisma = buildPrisma({
      liquidacionComision: {
        findFirst: vi
          .fn()
          .mockResolvedValueOnce(draft)
          .mockResolvedValueOnce({ ...draft, estado: 'aprobada' }),
        update: vi
          .fn()
          .mockResolvedValueOnce({ ...draft, estado: 'aprobada', aprobadoPorId: 1, detalle: [] })
          .mockResolvedValueOnce({
            ...draft,
            estado: 'pagada',
            aprobadoPorId: 1,
            pagadoEn: new Date(),
            detalle: [],
          }),
      },
    })
    const svc = new LiquidacionComisionService(prisma)
    const approved = await svc.approve(1, 9, 1)
    expect(approved.ok).toBe(true)
    if (approved.ok) expect(approved.data.estado).toBe('aprobada')
    const paid = await svc.markPaid(1, 9)
    expect(paid.ok).toBe(true)
    if (paid.ok) expect(paid.data.estado).toBe('pagada')
  })
})
