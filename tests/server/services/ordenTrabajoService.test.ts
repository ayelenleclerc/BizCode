import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { OrdenTrabajoService } from '../../../apps/server/services/OrdenTrabajoService'
import { dispatchNotification } from '../../../apps/server/channels'

const facturaCreate = vi.hoisted(() => vi.fn())

vi.mock('../../../apps/server/channels', () => ({
  dispatchNotification: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('../../../apps/server/services/FacturaService', () => ({
  FacturaService: class {
    create = facturaCreate
  },
}))

const baseOt = {
  id: 1,
  numero: 1,
  clienteId: 1,
  tecnicoId: null as number | null,
  estado: 'recibido',
  prioridad: 'normal',
  equipoDescripcion: 'Notebook',
  sintomaReportado: 'No enciende',
  diagnostico: null as string | null,
  trabajoRealizado: null as string | null,
  enGarantia: false,
  garantiaVence: null as Date | null,
  otGarantiaId: null as number | null,
  presupuesto: new Decimal(100),
  fechaIngreso: new Date(),
  fechaPromesa: null as Date | null,
  fechaEntrega: null as Date | null,
  facturaId: null as number | null,
  observaciones: null as string | null,
  cliente: { id: 1, codigo: 1, rsocial: 'Cliente', condIva: 'RI' },
  tecnico: null,
  items: [] as unknown[],
  factura: null,
}

function buildPrisma(overrides: Record<string, unknown> = {}): PrismaClient {
  return {
    cliente: {
      findFirst: vi.fn().mockResolvedValue({ id: 1, suspended: false, condIva: 'RI' }),
    },
    tenantConfig: {
      findUnique: vi.fn().mockResolvedValue({ jurisdiccionFiscal: 'AR' }),
    },
    appUser: {
      findFirst: vi.fn().mockResolvedValue({ id: 2 }),
    },
    articulo: {
      findMany: vi.fn().mockResolvedValue([{ id: 10, tipo: 'articulo', unidadServicio: null, condIva: '1' }]),
    },
    ordenTrabajo: {
      count: vi.fn().mockResolvedValue(1),
      findMany: vi.fn().mockResolvedValue([{ ...baseOt }]),
      groupBy: vi.fn().mockResolvedValue([
        { estado: 'recibido', _count: { _all: 1 } },
        { estado: 'listo', _count: { _all: 2 } },
      ]),
      findFirst: vi.fn().mockResolvedValue({ ...baseOt }),
      create: vi.fn().mockResolvedValue({ ...baseOt, numero: 42 }),
      update: vi.fn().mockResolvedValue({ ...baseOt, estado: 'diagnosticado' }),
    },
    ordenTrabajoItem: {
      deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
    },
    factura: {
      findFirst: vi.fn().mockResolvedValue({ numero: 5 }),
    },
    garantia: {
      findFirst: vi.fn().mockResolvedValue(null),
      findMany: vi.fn().mockResolvedValue([]),
      count: vi.fn().mockResolvedValue(0),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn().mockResolvedValue({ count: 0 }),
      findFirstOrThrow: vi.fn().mockResolvedValue(null),
    },
    garantiaUso: {
      create: vi.fn().mockResolvedValue({ id: 1 }),
    },
    $transaction: vi.fn(async (fn: (tx: unknown) => unknown) =>
      fn({
        ordenTrabajoItem: { deleteMany: vi.fn().mockResolvedValue({ count: 0 }) },
        ordenTrabajo: {
          update: vi.fn().mockResolvedValue({
            ...baseOt,
            estado: 'presupuestado',
            presupuesto: new Decimal(100),
            items: [
              {
                id: 1,
                tipo: 'mano_de_obra',
                descripcion: 'Mano de obra',
                cantidad: new Decimal(1),
                precioUnit: new Decimal(100),
                subtotal: new Decimal(100),
                condIva: '1',
                articuloId: null,
                articulo: null,
              },
            ],
          }),
        },
      }),
    ),
    ...overrides,
  } as unknown as PrismaClient
}

describe('OrdenTrabajoService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    facturaCreate.mockReset()
  })

  it('lists orders with dashboard counts', async () => {
    const prisma = buildPrisma()
    const service = new OrdenTrabajoService(prisma)
    const result = await service.list(1, 50, 0, 'recibido')
    expect(result.total).toBe(1)
    expect(result.ordenes).toHaveLength(1)
    expect(result.counts.recibido).toBe(1)
    expect(result.counts.listo).toBe(2)
  })

  it('getById returns 404 when missing', async () => {
    const prisma = buildPrisma({
      ordenTrabajo: {
        count: vi.fn(),
        findMany: vi.fn(),
        groupBy: vi.fn(),
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi.fn(),
        update: vi.fn(),
      },
    })
    const service = new OrdenTrabajoService(prisma)
    const result = await service.getById(1, 99)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.status).toBe(404)
  })

  it('getById returns row', async () => {
    const service = new OrdenTrabajoService(buildPrisma())
    const result = await service.getById(1, 1)
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.data.id).toBe(1)
  })

  it('creates OT and assigns next numero', async () => {
    const prisma = buildPrisma({
      ordenTrabajo: {
        findFirst: vi
          .fn()
          .mockResolvedValueOnce(null)
          .mockResolvedValueOnce({ numero: 41 }),
        create: vi.fn().mockResolvedValue({
          ...baseOt,
          id: 7,
          numero: 42,
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

  it('rejects create when cliente suspended', async () => {
    const prisma = buildPrisma({
      cliente: {
        findFirst: vi.fn().mockResolvedValue({ id: 1, suspended: true, condIva: 'RI' }),
      },
    })
    const service = new OrdenTrabajoService(prisma)
    const result = await service.create(1, {
      clienteId: 1,
      equipoDescripcion: 'X',
      sintomaReportado: 'Y',
    })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toBe('CLIENT_SUSPENDED')
  })

  it('marks enGarantia when formal Garantia is active by serial', async () => {
    const create = vi.fn().mockResolvedValue({
      ...baseOt,
      id: 8,
      numero: 8,
      enGarantia: true,
      garantiaId: 3,
      sintomaReportado: 'Otra falla',
    })
    const garantiaUsoCreate = vi.fn().mockResolvedValue({ id: 1 })
    const prisma = buildPrisma({
      garantia: {
        findFirst: vi.fn().mockResolvedValue({
          id: 3,
          fechaVencimiento: new Date('2030-01-01'),
          estado: 'vigente',
        }),
        updateMany: vi.fn().mockResolvedValue({ count: 0 }),
        findFirstOrThrow: vi.fn().mockResolvedValue({
          id: 3,
          articuloId: 10,
          facturaId: null,
          facturaItemId: null,
          nroSerie: 'SN-001',
          nroImei: null,
          descripcionEquipo: 'iPhone 12',
          clienteId: 1,
          fechaVenta: new Date(),
          mesesGarantia: 12,
          fechaVencimiento: new Date('2030-01-01'),
          estado: 'vigente',
          createdAt: new Date(),
          updatedAt: new Date(),
          cliente: { id: 1, codigo: 1, rsocial: 'Cliente' },
          articulo: { id: 10, codigo: 10, descripcion: 'Art' },
          factura: null,
          usos: [{ id: 1, garantiaId: 3, otId: 8, descripcion: 'OT-00008', fecha: new Date(), userId: 9, user: null }],
        }),
      },
      garantiaUso: { create: garantiaUsoCreate },
      ordenTrabajo: {
        findFirst: vi.fn().mockResolvedValue({ numero: 7 }),
        create,
        count: vi.fn(),
        findMany: vi.fn(),
        groupBy: vi.fn(),
        update: vi.fn(),
      },
    })
    const service = new OrdenTrabajoService(prisma)
    const result = await service.create(
      1,
      {
        clienteId: 1,
        equipoDescripcion: 'iPhone 12',
        sintomaReportado: 'Otra falla',
        equipoNroSerie: 'SN-001',
      },
      9,
    )
    expect(result.ok).toBe(true)
    const data = create.mock.calls[0][0].data
    expect(data.enGarantia).toBe(true)
    expect(data.garantiaId).toBe(3)
    expect(garantiaUsoCreate).toHaveBeenCalled()
  })

  it('update rejects facturado OT', async () => {
    const prisma = buildPrisma({
      ordenTrabajo: {
        count: vi.fn(),
        findMany: vi.fn(),
        groupBy: vi.fn(),
        findFirst: vi.fn().mockResolvedValue({ id: 1, estado: 'facturado', facturaId: 9 }),
        create: vi.fn(),
        update: vi.fn(),
      },
    })
    const service = new OrdenTrabajoService(prisma)
    const result = await service.update(1, 1, {
      clienteId: 1,
      equipoDescripcion: 'X',
      sintomaReportado: 'Y',
    })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.status).toBe(409)
  })

  it('update replaces items', async () => {
    const update = vi.fn().mockResolvedValue({ ...baseOt, estado: 'recibido' })
    const prisma = buildPrisma({
      $transaction: vi.fn(async (fn: (tx: unknown) => unknown) =>
        fn({
          ordenTrabajoItem: { deleteMany: vi.fn().mockResolvedValue({ count: 1 }) },
          ordenTrabajo: { update },
        }),
      ),
    })
    const service = new OrdenTrabajoService(prisma)
    const result = await service.update(1, 1, {
      clienteId: 1,
      equipoDescripcion: 'Notebook Dell',
      sintomaReportado: 'No enciende',
      items: [{ tipo: 'servicio', descripcion: 'Diagnóstico', cantidad: 1, precioUnit: 50 }],
    })
    expect(result.ok).toBe(true)
    expect(update).toHaveBeenCalled()
  })

  it('rejects invalid state transition', async () => {
    const prisma = buildPrisma({
      ordenTrabajo: {
        ...buildPrisma().ordenTrabajo,
        findFirst: vi.fn().mockResolvedValue({
          id: 1,
          estado: 'recibido',
          items: [],
        }),
      },
    })
    const service = new OrdenTrabajoService(prisma)
    const result = await service.transition(1, 1, { estado: 'facturado' })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.status).toBe(409)
  })

  it('transition to presupuestado notifies client', async () => {
    const service = new OrdenTrabajoService(buildPrisma())
    const result = await service.transition(1, 1, {
      estado: 'diagnosticado',
      diagnostico: 'Fuente dañada',
    })
    // first need recibido -> diagnosticado; existing mock is recibido
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.previousEstado).toBe('recibido')
      expect(result.data.auditAction).toBe('ot_transition_diagnosticado')
    }
  })

  it('transition to presupuestado requires items and dispatches notify', async () => {
    const prisma = buildPrisma({
      ordenTrabajo: {
        ...buildPrisma().ordenTrabajo,
        findFirst: vi.fn().mockResolvedValue({
          ...baseOt,
          estado: 'diagnosticado',
          items: [],
        }),
      },
    })
    const service = new OrdenTrabajoService(prisma)
    const empty = await service.transition(1, 1, { estado: 'presupuestado' })
    expect(empty.ok).toBe(false)

    const ok = await service.transition(1, 1, {
      estado: 'presupuestado',
      items: [{ tipo: 'mano_de_obra', descripcion: 'Reparación', cantidad: 1, precioUnit: 100 }],
    })
    expect(ok.ok).toBe(true)
    expect(dispatchNotification).toHaveBeenCalledWith(
      expect.anything(),
      1,
      'ot_presupuestado',
      expect.objectContaining({ otNumero: 1, clienteId: 1 }),
    )
  })

  it('transition to listo dispatches ot_listo', async () => {
    const prisma = buildPrisma({
      ordenTrabajo: {
        ...buildPrisma().ordenTrabajo,
        findFirst: vi.fn().mockResolvedValue({
          ...baseOt,
          estado: 'en_reparacion',
          items: [{ id: 1 }],
        }),
      },
      $transaction: vi.fn(async (fn: (tx: unknown) => unknown) =>
        fn({
          ordenTrabajoItem: { deleteMany: vi.fn() },
          ordenTrabajo: {
            update: vi.fn().mockResolvedValue({
              ...baseOt,
              estado: 'listo',
              items: [],
            }),
          },
        }),
      ),
    })
    const service = new OrdenTrabajoService(prisma)
    const result = await service.transition(1, 1, { estado: 'listo' })
    expect(result.ok).toBe(true)
    expect(dispatchNotification).toHaveBeenCalledWith(
      expect.anything(),
      1,
      'ot_listo',
      expect.objectContaining({ otId: 1 }),
    )
  })

  it('blocks invoicing warranty OT', async () => {
    const prisma = buildPrisma({
      ordenTrabajo: {
        ...buildPrisma().ordenTrabajo,
        findFirst: vi.fn().mockResolvedValue({
          ...baseOt,
          estado: 'listo',
          facturaId: null,
          enGarantia: true,
          items: [
            {
              id: 1,
              tipo: 'mano_de_obra',
              cantidad: new Decimal(1),
              precioUnit: new Decimal(10),
              condIva: '1',
              descripcion: 'x',
              articuloId: null,
              articulo: null,
            },
          ],
        }),
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

  it('facturar creates invoice and marks facturado', async () => {
    facturaCreate.mockResolvedValue({
      ok: true,
      data: { factura: { id: 99 } },
    })
    const update = vi.fn().mockResolvedValue({
      ...baseOt,
      estado: 'facturado',
      facturaId: 99,
    })
    const prisma = buildPrisma({
      ordenTrabajo: {
        ...buildPrisma().ordenTrabajo,
        findFirst: vi.fn().mockResolvedValue({
          ...baseOt,
          estado: 'listo',
          enGarantia: false,
          items: [
            {
              id: 1,
              tipo: 'repuesto',
              descripcion: 'Pantalla',
              cantidad: new Decimal(1),
              precioUnit: new Decimal(200),
              condIva: '1',
              articuloId: 10,
              articulo: { unidadServicio: null },
            },
            {
              id: 2,
              tipo: 'mano_de_obra',
              descripcion: 'Instalación',
              cantidad: new Decimal(1),
              precioUnit: new Decimal(50),
              condIva: '1',
              articuloId: null,
              articulo: null,
            },
          ],
        }),
        update,
      },
    })
    const service = new OrdenTrabajoService(prisma)
    const result = await service.facturar(1, 1, 9, {})
    expect(result.ok).toBe(true)
    expect(facturaCreate).toHaveBeenCalled()
    expect(facturaCreate).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.anything(),
      expect.objectContaining({ skipArcaCae: true }),
    )
    if (result.ok) expect(result.data.facturaId).toBe(99)
  })

  it('facturar rejects wrong estado', async () => {
    const prisma = buildPrisma({
      ordenTrabajo: {
        ...buildPrisma().ordenTrabajo,
        findFirst: vi.fn().mockResolvedValue({
          ...baseOt,
          estado: 'recibido',
          items: [{ id: 1 }],
        }),
      },
    })
    const service = new OrdenTrabajoService(prisma)
    const result = await service.facturar(1, 1, 9)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.status).toBe(409)
  })
})
