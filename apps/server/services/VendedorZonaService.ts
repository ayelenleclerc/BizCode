import type { Prisma, PrismaClient } from '@prisma/client'
import type { VendedorZonaCreateInput, VendedorZonaRow } from '@bizcode/types'
import type { ServiceResult } from './serviceResults'

const include = {
  deliveryZone: { select: { id: true, nombre: true, activo: true } },
  vendedor: { select: { id: true, username: true, role: true } },
} satisfies Prisma.VendedorZonaInclude

type Row = Prisma.VendedorZonaGetPayload<{ include: typeof include }>

function mapRow(row: Row): VendedorZonaRow {
  return {
    id: row.id,
    tenantId: row.tenantId,
    vendedorId: row.vendedorId,
    deliveryZoneId: row.deliveryZoneId,
    createdAt: row.createdAt.toISOString(),
    deliveryZone: row.deliveryZone,
    vendedor: {
      id: row.vendedor.id,
      username: row.vendedor.username,
      role: String(row.vendedor.role),
    },
  }
}

/**
 * @en Seller↔delivery-zone assignment (#267).
 * @es Asignación vendedor↔zona de entrega (#267).
 * @pt-BR Atribuição vendedor↔zona de entrega (#267).
 */
export class VendedorZonaService {
  constructor(private readonly prisma: PrismaClient) {}

  async list(
    tenantId: number,
    filters: { vendedorId?: number },
    take: number,
    skip: number,
  ): Promise<ServiceResult<{ total: number; items: VendedorZonaRow[] }>> {
    const where: Prisma.VendedorZonaWhereInput = {
      tenantId,
      ...(filters.vendedorId != null ? { vendedorId: filters.vendedorId } : {}),
    }
    const [total, rows] = await Promise.all([
      this.prisma.vendedorZona.count({ where }),
      this.prisma.vendedorZona.findMany({
        where,
        include,
        orderBy: [{ vendedorId: 'asc' }, { id: 'asc' }],
        take,
        skip,
      }),
    ])
    return { ok: true, data: { total, items: rows.map(mapRow) } }
  }

  async create(
    tenantId: number,
    input: VendedorZonaCreateInput,
  ): Promise<ServiceResult<VendedorZonaRow>> {
    const [vendedor, zone] = await Promise.all([
      this.prisma.appUser.findFirst({
        where: { id: input.vendedorId, tenantId, active: true },
        select: { id: true },
      }),
      this.prisma.deliveryZone.findFirst({
        where: { id: input.deliveryZoneId, tenantId },
        select: { id: true },
      }),
    ])
    if (!vendedor) {
      return { ok: false, status: 400, error: 'vendedorId is not valid for this tenant' }
    }
    if (!zone) {
      return { ok: false, status: 400, error: 'deliveryZoneId is not valid for this tenant' }
    }
    try {
      const row = await this.prisma.vendedorZona.create({
        data: {
          tenantId,
          vendedorId: input.vendedorId,
          deliveryZoneId: input.deliveryZoneId,
        },
        include,
      })
      return { ok: true, data: mapRow(row) }
    } catch (err: unknown) {
      if ((err as { code?: string }).code === 'P2002') {
        return { ok: false, status: 409, error: 'VendedorZona already exists' }
      }
      throw err
    }
  }

  async delete(tenantId: number, id: number): Promise<ServiceResult<{ id: number }>> {
    const existing = await this.prisma.vendedorZona.findFirst({
      where: { id, tenantId },
      select: { id: true },
    })
    if (!existing) {
      return { ok: false, status: 404, error: 'VendedorZona not found' }
    }
    await this.prisma.vendedorZona.delete({ where: { id } })
    return { ok: true, data: { id } }
  }

  async zoneIdsForVendedor(tenantId: number, vendedorId: number): Promise<number[]> {
    const rows = await this.prisma.vendedorZona.findMany({
      where: { tenantId, vendedorId },
      select: { deliveryZoneId: true },
    })
    return rows.map((r) => r.deliveryZoneId)
  }
}
