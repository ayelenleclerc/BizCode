import { describe, expect, it, vi } from 'vitest'
import { Prisma } from '@prisma/client'
import { ObraSocialService } from '../../../apps/server/services/ObraSocialService'

const now = new Date('2026-05-10T12:00:00.000Z')

function osRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    tenantId: 7,
    nombre: 'IOMA',
    codigo: 'IOMA',
    activa: true,
    createdAt: now,
    updatedAt: now,
    coberturas: [
      {
        id: 10,
        tenantId: 7,
        obraSocialId: 1,
        tipoProducto: 'generico',
        cobertura: new Prisma.Decimal(70),
        createdAt: now,
        updatedAt: now,
      },
    ],
    ...overrides,
  }
}

function ventaRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 5,
    tenantId: 7,
    facturaId: null,
    clienteId: 4,
    obraSocialId: 1,
    nroAfiliado: 'AF-1',
    nroReceta: null,
    totalVenta: new Prisma.Decimal(10000),
    copagoPaciente: new Prisma.Decimal(3000),
    creditoOS: new Prisma.Decimal(7000),
    estado: 'pendiente_cobro_os',
    presentacionId: null,
    fecha: new Date('2026-05-10T15:00:00.000Z'),
    createdAt: now,
    updatedAt: now,
    items: [
      {
        id: 50,
        tenantId: 7,
        ventaConOSId: 5,
        articuloId: null,
        descripcion: 'Ibuprofeno',
        tipoProducto: 'generico',
        cantidad: new Prisma.Decimal(1),
        precioUnitario: new Prisma.Decimal(10000),
        subtotal: new Prisma.Decimal(10000),
        coberturaPct: new Prisma.Decimal(70),
        creditoOS: new Prisma.Decimal(7000),
        copago: new Prisma.Decimal(3000),
      },
    ],
    obraSocial: { id: 1, nombre: 'IOMA', codigo: 'IOMA' },
    cliente: { id: 4, rsocial: 'Paciente' },
    ...overrides,
  }
}

function presentacionRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 9,
    tenantId: 7,
    obraSocialId: 1,
    periodo: '2026-05',
    totalCredito: new Prisma.Decimal(7000),
    estado: 'generada',
    archivoCsvName: 'presentacion-os-1-2026-05.csv',
    fechaPago: null,
    importeCobrado: null,
    createdAt: now,
    updatedAt: now,
    obraSocial: { id: 1, nombre: 'IOMA', codigo: 'IOMA' },
    rechazos: [],
    _count: { ventas: 1 },
    ...overrides,
  }
}

describe('ObraSocialService (#252)', () => {
  it('lists obras sociales', async () => {
    const prisma = {
      obraSocial: { findMany: vi.fn().mockResolvedValue([osRow()]) },
    }
    const svc = new ObraSocialService(prisma as never)
    const result = await svc.listObrasSociales(7)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data[0].codigo).toBe('IOMA')
    expect(result.data[0].coberturas?.[0].cobertura).toBe(70)
  })

  it('returns 404 when obra social missing', async () => {
    const prisma = {
      obraSocial: { findFirst: vi.fn().mockResolvedValue(null) },
    }
    const svc = new ObraSocialService(prisma as never)
    const result = await svc.getObraSocial(7, 99)
    expect(result).toEqual({ ok: false, status: 404, error: 'obra_social_not_found' })
  })

  it('creates obra social with cobertura', async () => {
    const prisma = {
      obraSocial: { create: vi.fn().mockResolvedValue(osRow()) },
    }
    const svc = new ObraSocialService(prisma as never)
    const result = await svc.createObraSocial(7, {
      nombre: 'IOMA',
      codigo: 'IOMA',
      coberturas: [{ tipoProducto: 'generico', cobertura: 70 }],
    })
    expect(result.ok).toBe(true)
    expect(prisma.obraSocial.create).toHaveBeenCalled()
  })

  it('rejects invalid cobertura percent', async () => {
    const svc = new ObraSocialService({} as never)
    const result = await svc.createObraSocial(7, {
      nombre: 'IOMA',
      codigo: 'IOMA',
      coberturas: [{ tipoProducto: 'generico', cobertura: 140 }],
    })
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.status).toBe(400)
  })

  it('updates obra social', async () => {
    const prisma = {
      obraSocial: {
        findFirst: vi.fn().mockResolvedValue(osRow()),
        update: vi.fn().mockResolvedValue(osRow({ nombre: 'IOMA Sur' })),
      },
    }
    const svc = new ObraSocialService(prisma as never)
    const result = await svc.updateObraSocial(7, 1, { nombre: 'IOMA Sur' })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data.nombre).toBe('IOMA Sur')
  })

  it('upserts cobertura', async () => {
    const cobertura = osRow().coberturas[0]
    const prisma = {
      obraSocial: { findFirst: vi.fn().mockResolvedValue(osRow()) },
      coberturaOS: { upsert: vi.fn().mockResolvedValue(cobertura) },
    }
    const svc = new ObraSocialService(prisma as never)
    const result = await svc.upsertCobertura(7, 1, { tipoProducto: 'generico', cobertura: 70 })
    expect(result.ok).toBe(true)
    expect(prisma.coberturaOS.upsert).toHaveBeenCalled()
  })

  it('creates venta with copay split', async () => {
    const created = ventaRow()
    const prisma = {
      obraSocial: { findFirst: vi.fn().mockResolvedValue(osRow()) },
      cliente: { findFirst: vi.fn().mockResolvedValue({ id: 4 }) },
      $transaction: vi.fn(async (fn: (tx: { ventaConOS: { create: ReturnType<typeof vi.fn> } }) => Promise<unknown>) =>
        fn({ ventaConOS: { create: vi.fn().mockResolvedValue(created) } }),
      ),
    }
    const svc = new ObraSocialService(prisma as never)
    const result = await svc.createVenta(7, {
      clienteId: 4,
      obraSocialId: 1,
      nroAfiliado: 'AF-1',
      items: [
        {
          descripcion: 'Ibuprofeno',
          tipoProducto: 'generico',
          cantidad: 1,
          precioUnitario: 10000,
        },
      ],
    })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data.copagoPaciente).toBe(3000)
    expect(result.data.creditoOS).toBe(7000)
  })

  it('rejects venta without cliente', async () => {
    const svc = new ObraSocialService({} as never)
    const result = await svc.createVenta(7, {
      clienteId: 0,
      obraSocialId: 1,
      nroAfiliado: 'AF-1',
      items: [
        {
          descripcion: 'X',
          tipoProducto: 'generico',
          cantidad: 1,
          precioUnitario: 10,
        },
      ],
    })
    expect(result).toEqual({ ok: false, status: 400, error: 'clienteId is required' })
  })

  it('lists ventas', async () => {
    const prisma = {
      ventaConOS: { findMany: vi.fn().mockResolvedValue([ventaRow()]) },
    }
    const svc = new ObraSocialService(prisma as never)
    const result = await svc.listVentas(7, { estado: 'pendiente_cobro_os' })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data).toHaveLength(1)
  })

  it('creates presentacion for period', async () => {
    const prisma = {
      obraSocial: { findFirst: vi.fn().mockResolvedValue(osRow()) },
      ventaConOS: { findMany: vi.fn().mockResolvedValue([ventaRow()]) },
      $transaction: vi.fn(async (fn: (tx: Record<string, unknown>) => Promise<unknown>) =>
        fn({
          presentacionOS: {
            create: vi.fn().mockResolvedValue(presentacionRow()),
            findFirstOrThrow: vi.fn().mockResolvedValue(presentacionRow()),
          },
          ventaConOS: { updateMany: vi.fn().mockResolvedValue({ count: 1 }) },
        }),
      ),
    }
    const svc = new ObraSocialService(prisma as never)
    const result = await svc.createPresentacion(7, { obraSocialId: 1, periodo: '2026-05' })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data.periodo).toBe('2026-05')
  })

  it('returns 422 when no pending sales for period', async () => {
    const prisma = {
      obraSocial: { findFirst: vi.fn().mockResolvedValue(osRow()) },
      ventaConOS: { findMany: vi.fn().mockResolvedValue([]) },
    }
    const svc = new ObraSocialService(prisma as never)
    const result = await svc.createPresentacion(7, { obraSocialId: 1, periodo: '2026-05' })
    expect(result).toEqual({ ok: false, status: 422, error: 'no_pending_sales_for_period' })
  })

  it('exports presentacion csv', async () => {
    const prisma = {
      presentacionOS: { findFirst: vi.fn().mockResolvedValue(presentacionRow()) },
      ventaConOS: { findMany: vi.fn().mockResolvedValue([ventaRow({ presentacionId: 9 })]) },
    }
    const svc = new ObraSocialService(prisma as never)
    const result = await svc.exportPresentacionCsv(7, 9)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data.csv).toContain('ventaId')
    expect(result.data.filename).toContain('presentacion-os')
  })

  it('marks presentacion as presentada', async () => {
    const prisma = {
      presentacionOS: {
        findFirst: vi.fn().mockResolvedValue(presentacionRow()),
        update: vi.fn().mockResolvedValue(presentacionRow({ estado: 'presentada' })),
      },
    }
    const svc = new ObraSocialService(prisma as never)
    const result = await svc.markPresentacionPresentada(7, 9)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data.estado).toBe('presentada')
  })

  it('registers cobro without rechazos as cobrada', async () => {
    const ventaUpdateMany = vi.fn().mockResolvedValue({ count: 1 })
    const prisma = {
      presentacionOS: {
        findFirst: vi.fn().mockResolvedValue(presentacionRow({ estado: 'presentada' })),
      },
      $transaction: vi.fn(async (fn: (tx: Record<string, unknown>) => Promise<unknown>) =>
        fn({
          presentacionOS: {
            update: vi.fn().mockResolvedValue(presentacionRow({ estado: 'cobrada' })),
            findFirstOrThrow: vi
              .fn()
              .mockResolvedValue(
                presentacionRow({ estado: 'cobrada', importeCobrado: new Prisma.Decimal(7000) }),
              ),
          },
          ventaConOS: { updateMany: ventaUpdateMany },
        }),
      ),
    }
    const svc = new ObraSocialService(prisma as never)
    const result = await svc.registerCobro(7, 9, { importeCobrado: 7000 })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data.estado).toBe('cobrada')
    expect(ventaUpdateMany).toHaveBeenCalledTimes(1)
    expect(ventaUpdateMany).toHaveBeenCalledWith({
      where: {
        tenantId: 7,
        presentacionId: 9,
        estado: { in: ['presentado', 'pendiente_cobro_os'] },
      },
      data: { estado: 'cobrado' },
    })
  })

  it('registers cobro with partial rechazos without rejecting all ventas', async () => {
    const ventaUpdateMany = vi.fn().mockResolvedValue({ count: 1 })
    const prisma = {
      presentacionOS: {
        findFirst: vi.fn().mockResolvedValue(
          presentacionRow({
            estado: 'con_rechazos',
            rechazos: [
              {
                id: 1,
                tenantId: 7,
                presentacionId: 9,
                ventaConOSId: 5,
                ventaOSItemId: null,
                importeRechazado: new Prisma.Decimal(1000),
                motivo: 'item',
                createdAt: now,
              },
            ],
          }),
        ),
      },
      $transaction: vi.fn(async (fn: (tx: Record<string, unknown>) => Promise<unknown>) =>
        fn({
          presentacionOS: {
            update: vi.fn().mockResolvedValue(presentacionRow({ estado: 'con_rechazos' })),
            findFirstOrThrow: vi.fn().mockResolvedValue(
              presentacionRow({
                estado: 'con_rechazos',
                importeCobrado: new Prisma.Decimal(6000),
                rechazos: [
                  {
                    id: 1,
                    tenantId: 7,
                    presentacionId: 9,
                    ventaConOSId: 5,
                    ventaOSItemId: null,
                    importeRechazado: new Prisma.Decimal(1000),
                    motivo: 'item',
                    createdAt: now,
                  },
                ],
              }),
            ),
          },
          ventaConOS: { updateMany: ventaUpdateMany },
        }),
      ),
    }
    const svc = new ObraSocialService(prisma as never)
    const result = await svc.registerCobro(7, 9, { importeCobrado: 6000 })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data.estado).toBe('con_rechazos')
    expect(ventaUpdateMany).toHaveBeenCalledTimes(2)
    expect(ventaUpdateMany).toHaveBeenNthCalledWith(1, {
      where: {
        tenantId: 7,
        presentacionId: 9,
        id: { in: [5] },
        estado: { in: ['presentado', 'pendiente_cobro_os', 'rechazado_os'] },
      },
      data: { estado: 'rechazado_os' },
    })
    expect(ventaUpdateMany).toHaveBeenNthCalledWith(2, {
      where: {
        tenantId: 7,
        presentacionId: 9,
        estado: { in: ['presentado', 'pendiente_cobro_os'] },
        id: { notIn: [5] },
      },
      data: { estado: 'cobrado' },
    })
  })

  it('registers rechazo and sets con_rechazos', async () => {
    const prisma = {
      presentacionOS: {
        findFirst: vi.fn().mockResolvedValue(presentacionRow({ estado: 'presentada' })),
      },
      ventaConOS: { findFirst: vi.fn().mockResolvedValue(ventaRow({ presentacionId: 9 })) },
      $transaction: vi.fn(async (fn: (tx: Record<string, unknown>) => Promise<unknown>) =>
        fn({
          presentacionOSRechazo: { create: vi.fn().mockResolvedValue({ id: 1 }) },
          ventaConOS: { update: vi.fn().mockResolvedValue(ventaRow({ estado: 'rechazado_os' })) },
          presentacionOS: {
            update: vi.fn().mockResolvedValue(presentacionRow({ estado: 'con_rechazos' })),
            findFirstOrThrow: vi.fn().mockResolvedValue(
              presentacionRow({
                estado: 'con_rechazos',
                rechazos: [
                  {
                    id: 1,
                    tenantId: 7,
                    presentacionId: 9,
                    ventaConOSId: 5,
                    ventaOSItemId: null,
                    importeRechazado: new Prisma.Decimal(1000),
                    motivo: 'item',
                    createdAt: now,
                  },
                ],
              }),
            ),
          },
        }),
      ),
    }
    const svc = new ObraSocialService(prisma as never)
    const result = await svc.registerRechazo(7, 9, {
      ventaConOSId: 5,
      importeRechazado: 1000,
      motivo: 'item',
    })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data.estado).toBe('con_rechazos')
  })

  it('builds cuenta corriente summary', async () => {
    const prisma = {
      obraSocial: { findMany: vi.fn().mockResolvedValue([osRow()]) },
      ventaConOS: {
        findMany: vi.fn().mockResolvedValue([
          { obraSocialId: 1, estado: 'pendiente_cobro_os', creditoOS: new Prisma.Decimal(7000) },
          { obraSocialId: 1, estado: 'cobrado', creditoOS: new Prisma.Decimal(2000) },
        ]),
      },
      presentacionOSRechazo: { findMany: vi.fn().mockResolvedValue([]) },
    }
    const svc = new ObraSocialService(prisma as never)
    const result = await svc.cuentaCorriente(7)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data[0].creditoPendiente).toBe(7000)
    expect(result.data[0].creditoCobrado).toBe(2000)
    expect(result.data[0].saldoAbierto).toBe(7000)
  })

  it('lists presentaciones', async () => {
    const prisma = {
      presentacionOS: { findMany: vi.fn().mockResolvedValue([presentacionRow()]) },
    }
    const svc = new ObraSocialService(prisma as never)
    const result = await svc.listPresentaciones(7, 1)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data[0].id).toBe(9)
  })
})
