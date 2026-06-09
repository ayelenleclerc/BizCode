import { beforeEach, describe, expect, it, vi } from 'vitest'
import { RemitoService } from '../../../server/services/RemitoService'

function buildPrisma() {
  const remitoRows: Array<Record<string, unknown>> = []
  let remitoId = 0
  let itemId = 0

  return {
    remito: {
      count: vi.fn(async () => remitoRows.length),
      findMany: vi.fn(async () => remitoRows),
      findFirst: vi.fn(async ({ where }: { where: { id?: number; tenantId?: number } }) =>
        remitoRows.find((r) => r.id === where.id && r.tenantId === where.tenantId) ?? null,
      ),
      create: vi.fn(async ({ data, include }: { data: Record<string, unknown>; include?: unknown }) => {
        remitoId += 1
        const row = {
          id: remitoId,
          tenantId: data.tenantId,
          prefijo: data.prefijo ?? null,
          numero: data.numero ?? null,
          tipo: data.tipo,
          estado: data.estado ?? 'borrador',
          clienteId: data.clienteId ?? null,
          proveedorId: data.proveedorId ?? null,
          facturaId: data.facturaId ?? null,
          pedidoId: data.pedidoId ?? null,
          ordenEntregaId: data.ordenEntregaId ?? null,
          fecha: data.fecha ?? new Date(),
          fechaEntrega: null,
          observaciones: data.observaciones ?? null,
          firmadoPor: null,
          items: (data.items as { create: Array<Record<string, unknown>> } | undefined)?.create?.map((it) => {
            itemId += 1
            return {
              id: itemId,
              articuloId:
                (it.articulo as { connect?: { id?: number } } | undefined)?.connect?.id ?? it.articuloId,
              descripcion: it.descripcion,
              cantidad: it.cantidad,
              unidad: it.unidad,
              articulo: { id: 1, codigo: 1, descripcion: 'Item', umedida: 'UN' },
            }
          }) ?? [],
          cliente: data.clienteId ? { id: data.clienteId, codigo: 1, rsocial: 'Cliente', cuit: null, domicilio: null } : null,
          proveedor: null,
          factura: null,
          pedido: null,
          ordenEntrega: null,
        }
        remitoRows.push(row)
        return include ? row : row
      }),
      update: vi.fn(async ({ where, data }: { where: { id: number }; data: Record<string, unknown> }) => {
        const row = remitoRows.find((r) => r.id === where.id)
        if (!row) throw new Error('not found')
        Object.assign(row, data)
        return row
      }),
    },
    remitoItem: {
      deleteMany: vi.fn(),
    },
    articulo: {
      count: vi.fn(async () => 1),
    },
    paramEmpresa: {
      findFirst: vi.fn(async () => ({ puntoVenta: 1 })),
    },
    pedido: {
      findFirst: vi.fn(),
    },
    factura: {
      findFirst: vi.fn(),
    },
    $transaction: vi.fn(async (fn: (tx: unknown) => Promise<unknown>) => fn(buildPrisma())),
  }
}

describe('RemitoService', () => {
  let prisma: ReturnType<typeof buildPrisma>
  let service: RemitoService

  beforeEach(() => {
    prisma = buildPrisma()
    service = new RemitoService(prisma as never)
  })

  it('creates borrador remito with items', async () => {
    const result = await service.create(1, {
      tipo: 'remito_x',
      clienteId: 1,
      items: [{ articuloId: 1, descripcion: 'Prod', cantidad: 2, unidad: 'UN' }],
    })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.estado).toBe('borrador')
      expect(result.data.items).toHaveLength(1)
    }
  })

  it('rejects remito_x without clienteId', async () => {
    const result = await service.create(1, {
      tipo: 'remito_x',
      items: [{ articuloId: 1, descripcion: 'Prod', cantidad: 1, unidad: 'UN' }],
    })
    expect(result.ok).toBe(false)
  })
})
