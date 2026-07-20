import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { OrdenTrabajoService } from '../../../apps/server/services/OrdenTrabajoService'

vi.mock('../../../apps/server/channels', () => ({
  dispatchNotification: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('../../../apps/server/services/FacturaService', () => {
  class FacturaService {
    create = vi.fn()
  }
  return { FacturaService }
})

function buildPrisma(overrides: Record<string, unknown> = {}): PrismaClient {
  return {
    cliente: {
      findFirst: vi.fn().mockResolvedValue({ id: 1, suspended: false, condIva: 'RI' }),
    },
    appUser: {
      findFirst: vi.fn().mockResolvedValue({ id: 2 }),
    },
    articulo: {
      findMany: vi.fn().mockResolvedValue([{ id: 10, tipo: 'articulo', unidadServicio: null, condIva: '1' }]),
    },
    ordenTrabajo: {
      count: vi.fn().mockResolvedValue(1),
      findMany: vi.fn().mockResolvedValue([]),
      groupBy: vi.fn().mockResolvedValue([{ estado: 'recibido', _count: { _all: 1 } }]),
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn(),
      update: vi.fn(),
    },
    ordenTrabajoItem: {
      deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
    },
    factura: {
      findFirst: vi.fn().mockResolvedValue({ numero: 5 }),
    },
    $transaction: vi.fn(async (fn: (tx: unknown) => unknown) => fn({
      ordenTrabajoItem: { deleteMany: vi.fn().mockResolvedValue({ count: 0 }) },
      ordenTrabajo: {
        update: vi.fn().mockResolvedValue({
          id: 1,
          numero: 1,
          clienteId: 1,
          estado: 'presupuestado',
          tecnicoId: null,
          presupuesto: new Decimal(100),
          cliente: { id: 1, codigo: 1, rsocial: 'Cliente', condIva: 'RI' },
          items: [],
        }),
      },
    })),
    ...overrides,
  } as unknown as PrismaClient
}

describe('OrdenTrabajoService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates OT and assigns next numero', async () => {
    const prisma = buildPrisma({
      ordenTrabajo: {
        findFirst: vi
          .fn()
          .mockResolvedValueOnce(null) // warranty lookup
          .mockResolvedValueOnce({ numero: 41 }), // last numero
        create: vi.fn().mockResolvedValue({
          id: 7,
          numero: 42,
          clienteId: 1,
          estado: 'recibido',
          enGarantia: false,
          items: [],
          cliente: { id: 1, codigo: 1, rsocial: 'Cliente', condIva: 'RI' },
        }),
        count: vi.fn(),
        findMany: vi.fn(),
        groupBy: vi.fn(),
        update: vi.fn(),
      },
    })
    const service = new OrdenTrabajoService(prisma)
    const result = await service.create(1, {
      clienteId: 1,
      equipoDescripcion: 'iPhone 12',
      sintomaReportado: 'Pantalla rota',
      items: [
        { tipo: 'mano_de_obra', descripcion: 'Cambio pantalla', cantidad: 1, precioUnit: 25000 },
      ],
    })
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.data.numero).toBe(42)
  })

  it('marks enGarantia when prior OT has active warranty by serial', async () => {
    const create = vi.fn().mockResolvedValue({
      id: 8,
      numero: 1,
      enGarantia: true,
      otGarantiaId: 3,
      items: [],
      cliente: { id: 1, codigo: 1, rsocial: 'Cliente', condIva: 'RI' },
    })
    const prisma = buildPrisma({
      ordenTrabajo: {
        findFirst: vi
          .fn()
          .mockResolvedValueOnce({ id: 3, garantiaVence: new Date('2030-01-01') }) // warranty
          .mockResolvedValueOnce({ id: 3 }) // otGarantia exists
          .mockResolvedValueOnce({ numero: 0 }),
        create,
        count: vi.fn(),
        findMany: vi.fn(),
        groupBy: vi.fn(),
        update: vi.fn(),
      },
    })
    const service = new OrdenTrabajoService(prisma)
    const result = await service.create(1, {
      clienteId: 1,
      equipoDescripcion: 'iPhone 12',
      sintomaReportado: 'Otra falla',
      equipoNroSerie: 'SN-001',
    })
    expect(result.ok).toBe(true)
    expect(create).toHaveBeenCalled()
    const data = create.mock.calls[0][0].data
    expect(data.enGarantia).toBe(true)
    expect(data.otGarantiaId).toBe(3)
  })

  it('rejects invalid state transition', async () => {
    const prisma = buildPrisma({
      ordenTrabajo: {
        findFirst: vi.fn().mockResolvedValue({
          id: 1,
          estado: 'recibido',
          items: [],
        }),
        count: vi.fn(),
        findMany: vi.fn(),
        groupBy: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
    })
    const service = new OrdenTrabajoService(prisma)
    const result = await service.transition(1, 1, { estado: 'facturado' })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.status).toBe(409)
  })

  it('blocks invoicing warranty OT', async () => {
    const prisma = buildPrisma({
      ordenTrabajo: {
        findFirst: vi.fn().mockResolvedValue({
          id: 1,
          estado: 'listo',
          facturaId: null,
          enGarantia: true,
          items: [{ id: 1, tipo: 'mano_de_obra', cantidad: new Decimal(1), precioUnit: new Decimal(10), condIva: '1', descripcion: 'x', articuloId: null, articulo: null }],
          cliente: { id: 1, codigo: 1, rsocial: 'Cliente', condIva: 'RI' },
        }),
        count: vi.fn(),
        findMany: vi.fn(),
        groupBy: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
    })
    const service = new OrdenTrabajoService(prisma)
    const result = await service.facturar(1, 1, 9)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.status).toBe(422)
      expect(result.error).toBe('OT_EN_GARANTIA_NO_FACTURA')
    }
  })
})
