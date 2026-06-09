import { beforeEach, describe, expect, it, vi } from 'vitest'
import { RemitoService, mapRemitoPublic } from '../../../server/services/RemitoService'

function buildPrisma() {
  const remitoRows: Array<Record<string, unknown>> = []
  let remitoId = 0
  let itemId = 0

  const prisma = {
    remito: {
      count: vi.fn(async ({ where }: { where?: { tenantId?: number; estado?: string } } = {}) =>
        remitoRows.filter((r) => {
          if (where?.tenantId != null && r.tenantId !== where.tenantId) return false
          if (where?.estado != null && r.estado !== where.estado) return false
          return true
        }).length,
      ),
      findMany: vi.fn(async ({ where }: { where?: { tenantId?: number; estado?: string } } = {}) =>
        remitoRows.filter((r) => {
          if (where?.tenantId != null && r.tenantId !== where.tenantId) return false
          if (where?.estado != null && r.estado !== where.estado) return false
          return true
        }),
      ),
      findFirst: vi.fn(
        async ({
          where,
          orderBy,
        }: {
          where?: {
            id?: number
            tenantId?: number
            prefijo?: string
            numero?: { not: null }
          }
          orderBy?: { numero?: 'desc' }
        } = {}) => {
          const matches = remitoRows.filter((r) => {
            if (where?.id != null && r.id !== where.id) return false
            if (where?.tenantId != null && r.tenantId !== where.tenantId) return false
            if (where?.prefijo != null && r.prefijo !== where.prefijo) return false
            if (where?.numero?.not === null && r.numero == null) return false
            return true
          })
          if (orderBy?.numero === 'desc') {
            return [...matches].sort((a, b) => Number(b.numero ?? 0) - Number(a.numero ?? 0))[0] ?? null
          }
          return matches[0] ?? null
        },
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
          cliente: data.clienteId
            ? { id: data.clienteId, codigo: 1, rsocial: 'Cliente', cuit: null, domicilio: null }
            : null,
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
    $transaction: vi.fn(async (fn: (tx: unknown) => Promise<unknown>) => fn(prisma)),
  }

  return prisma
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

  it('lists remitos with filters', async () => {
    await service.create(1, {
      tipo: 'remito_x',
      clienteId: 1,
      items: [{ articuloId: 1, descripcion: 'Prod', cantidad: 1, unidad: 'UN' }],
    })
    const result = await service.list(1, 10, 0, { estado: 'borrador' })
    expect(result.total).toBe(1)
    expect(result.remitos).toHaveLength(1)
  })

  it('gets remito by id', async () => {
    const created = await service.create(1, {
      tipo: 'remito_x',
      clienteId: 1,
      items: [{ articuloId: 1, descripcion: 'Prod', cantidad: 1, unidad: 'UN' }],
    })
    expect(created.ok).toBe(true)
    if (!created.ok) return
    const row = await service.getById(1, created.data.id)
    expect(row?.id).toBe(created.data.id)
  })

  it('emits borrador remito with correlativo', async () => {
    const created = await service.create(1, {
      tipo: 'remito_x',
      clienteId: 1,
      items: [{ articuloId: 1, descripcion: 'Prod', cantidad: 1, unidad: 'UN' }],
    })
    expect(created.ok).toBe(true)
    if (!created.ok) return
    const emitted = await service.emitir(1, created.data.id)
    expect(emitted.ok).toBe(true)
    if (emitted.ok) {
      expect(emitted.data.estado).toBe('emitido')
      expect(emitted.data.prefijo).toBe('0001')
      expect(emitted.data.numero).toBe(1)
    }
  })

  it('delivers emitido remito', async () => {
    const created = await service.create(1, {
      tipo: 'remito_x',
      clienteId: 1,
      items: [{ articuloId: 1, descripcion: 'Prod', cantidad: 1, unidad: 'UN' }],
    })
    if (!created.ok) throw new Error('setup failed')
    await service.emitir(1, created.data.id)
    const delivered = await service.entregar(1, created.data.id, { firmadoPor: 'Ana López' })
    expect(delivered.ok).toBe(true)
    if (delivered.ok) {
      expect(delivered.data.estado).toBe('entregado')
      expect(delivered.data.firmadoPor).toBe('Ana López')
    }
  })

  it('voids emitido remito', async () => {
    const created = await service.create(1, {
      tipo: 'remito_x',
      clienteId: 1,
      items: [{ articuloId: 1, descripcion: 'Prod', cantidad: 1, unidad: 'UN' }],
    })
    if (!created.ok) throw new Error('setup failed')
    await service.emitir(1, created.data.id)
    const voided = await service.anular(1, created.data.id)
    expect(voided.ok).toBe(true)
    if (voided.ok) {
      expect(voided.data.estado).toBe('anulado')
    }
  })

  it('creates remito from confirmed pedido', async () => {
    vi.mocked(prisma.pedido.findFirst).mockResolvedValue({
      id: 10,
      tenantId: 1,
      clienteId: 2,
      estado: 'confirmed',
      remito: null,
      items: [{ articuloId: 1, cantidad: 3, articulo: { id: 1, descripcion: 'Prod', umedida: 'UN' } }],
    } as never)
    const result = await service.createFromPedido(1, 10)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.pedidoId).toBe(10)
      expect(result.data.items).toHaveLength(1)
    }
  })
})

describe('mapRemitoPublic', () => {
  it('formats referencia for issued remito', () => {
    const mapped = mapRemitoPublic({
      id: 1,
      prefijo: '0001',
      numero: 12,
    } as never)
    expect(mapped.referencia).toBe('REM-0001-00000012')
  })

  it('uses BORRADOR when prefijo/numero missing', () => {
    const mapped = mapRemitoPublic({ id: 1, prefijo: null, numero: null } as never)
    expect(mapped.referencia).toBe('BORRADOR')
  })
})
