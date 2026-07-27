import type { Prisma, PrismaClient } from '@prisma/client'
import type { Decimal } from '@prisma/client/runtime/library'
import type {
  ArticuloStockPorDepositoResponse,
  DepositoCreateInput,
  DepositoPatchInput,
  DepositoRow,
  DepositoTipo,
  StockDepositoRow,
} from '@bizcode/types'
import type { ServiceResult } from './serviceResults'

function mapDeposito(row: {
  id: number
  tenantId: number
  nombre: string
  codigo: string
  tipo: string
  direccion: string | null
  responsableId: number | null
  activo: boolean
  esDefault: boolean
  createdAt: Date
  updatedAt: Date
}): DepositoRow {
  return {
    id: row.id,
    tenantId: row.tenantId,
    nombre: row.nombre,
    codigo: row.codigo,
    tipo: row.tipo as DepositoTipo,
    direccion: row.direccion,
    responsableId: row.responsableId,
    activo: row.activo,
    esDefault: row.esDefault,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

function mapStockRow(
  row: {
    id: number
    tenantId: number
    articuloId: number
    depositoId: number
    cantidad: Decimal
    stockMin: Decimal
    stockMax: Decimal | null
    createdAt: Date
    updatedAt: Date
    deposito?: { codigo: string; nombre: string }
  },
): StockDepositoRow {
  return {
    id: row.id,
    tenantId: row.tenantId,
    articuloId: row.articuloId,
    depositoId: row.depositoId,
    depositoCodigo: row.deposito?.codigo,
    depositoNombre: row.deposito?.nombre,
    cantidad: Number(row.cantidad),
    stockMin: Number(row.stockMin),
    stockMax: row.stockMax != null ? Number(row.stockMax) : null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

/**
 * @en CRUD for warehouses/deposits and per-deposit stock views (#236).
 * @es CRUD de depósitos/almacenes y vistas de stock por depósito (#236).
 * @pt-BR CRUD de depósitos/armazéns e vistas de estoque por depósito (#236).
 */
export class DepositoService {
  constructor(private readonly prisma: PrismaClient) {}

  async list(
    tenantId: number,
    take: number,
    skip: number,
    opts?: { activo?: boolean | null },
  ): Promise<{ total: number; rows: DepositoRow[] }> {
    const where: Prisma.DepositoWhereInput = {
      tenantId,
      ...(opts?.activo != null ? { activo: opts.activo } : {}),
    }
    const [total, rows] = await Promise.all([
      this.prisma.deposito.count({ where }),
      this.prisma.deposito.findMany({
        where,
        orderBy: [{ esDefault: 'desc' }, { nombre: 'asc' }],
        take,
        skip,
      }),
    ])
    return { total, rows: rows.map(mapDeposito) }
  }

  async getById(tenantId: number, id: number): Promise<ServiceResult<DepositoRow>> {
    const row = await this.prisma.deposito.findFirst({ where: { id, tenantId } })
    if (!row) return { ok: false, status: 404, error: 'Deposito not found' }
    return { ok: true, data: mapDeposito(row) }
  }

  async create(tenantId: number, input: DepositoCreateInput): Promise<ServiceResult<DepositoRow>> {
    const dup = await this.prisma.deposito.findFirst({
      where: { tenantId, codigo: input.codigo },
      select: { id: true },
    })
    if (dup) return { ok: false, status: 409, error: 'DEPOSITO_CODIGO_EXISTS' }

    const row = await this.prisma.$transaction(async (tx) => {
      if (input.esDefault) {
        await tx.deposito.updateMany({
          where: { tenantId, esDefault: true },
          data: { esDefault: false },
        })
      }
      return tx.deposito.create({
        data: {
          tenantId,
          nombre: input.nombre,
          codigo: input.codigo,
          tipo: input.tipo,
          direccion: input.direccion ?? null,
          responsableId: input.responsableId ?? null,
          activo: input.activo ?? true,
          esDefault: input.esDefault ?? false,
        },
      })
    })
    return { ok: true, data: mapDeposito(row) }
  }

  async update(
    tenantId: number,
    id: number,
    input: DepositoPatchInput,
  ): Promise<ServiceResult<DepositoRow>> {
    const existing = await this.prisma.deposito.findFirst({ where: { id, tenantId } })
    if (!existing) return { ok: false, status: 404, error: 'Deposito not found' }

    if (input.codigo && input.codigo !== existing.codigo) {
      const dup = await this.prisma.deposito.findFirst({
        where: { tenantId, codigo: input.codigo, NOT: { id } },
        select: { id: true },
      })
      if (dup) return { ok: false, status: 409, error: 'DEPOSITO_CODIGO_EXISTS' }
    }

    if (input.esDefault === false && existing.esDefault) {
      const otherDefault = await this.prisma.deposito.findFirst({
        where: { tenantId, esDefault: true, NOT: { id } },
        select: { id: true },
      })
      if (!otherDefault) {
        return { ok: false, status: 422, error: 'DEFAULT_DEPOSITO_REQUIRED' }
      }
    }

    const row = await this.prisma.$transaction(async (tx) => {
      if (input.esDefault === true) {
        await tx.deposito.updateMany({
          where: { tenantId, esDefault: true, NOT: { id } },
          data: { esDefault: false },
        })
      }
      return tx.deposito.update({
        where: { id },
        data: {
          ...(input.nombre !== undefined ? { nombre: input.nombre } : {}),
          ...(input.codigo !== undefined ? { codigo: input.codigo } : {}),
          ...(input.tipo !== undefined ? { tipo: input.tipo } : {}),
          ...(input.direccion !== undefined ? { direccion: input.direccion } : {}),
          ...(input.responsableId !== undefined ? { responsableId: input.responsableId } : {}),
          ...(input.activo !== undefined ? { activo: input.activo } : {}),
          ...(input.esDefault !== undefined ? { esDefault: input.esDefault } : {}),
        },
      })
    })
    return { ok: true, data: mapDeposito(row) }
  }

  async remove(tenantId: number, id: number): Promise<ServiceResult<{ success: true }>> {
    const existing = await this.prisma.deposito.findFirst({ where: { id, tenantId } })
    if (!existing) return { ok: false, status: 404, error: 'Deposito not found' }
    if (existing.esDefault) {
      return { ok: false, status: 422, error: 'CANNOT_DELETE_DEFAULT_DEPOSITO' }
    }
    const stock = await this.prisma.stockDeposito.aggregate({
      where: { tenantId, depositoId: id },
      _sum: { cantidad: true },
    })
    if (Number(stock._sum.cantidad ?? 0) > 0) {
      return { ok: false, status: 422, error: 'DEPOSITO_HAS_STOCK' }
    }
    const openTransfers = await this.prisma.transferenciaDeposito.count({
      where: {
        tenantId,
        OR: [{ origenId: id }, { destinoId: id }],
        estado: { in: ['pendiente', 'en_transito'] },
      },
    })
    if (openTransfers > 0) {
      return { ok: false, status: 422, error: 'DEPOSITO_HAS_OPEN_TRANSFERS' }
    }
    await this.prisma.deposito.delete({ where: { id } })
    return { ok: true, data: { success: true } }
  }

  async stockPorArticulo(
    tenantId: number,
    articuloId: number,
  ): Promise<ServiceResult<ArticuloStockPorDepositoResponse>> {
    const art = await this.prisma.articulo.findFirst({
      where: { id: articuloId, tenantId },
      select: { id: true, stock: true },
    })
    if (!art) return { ok: false, status: 404, error: 'Articulo not found' }

    const rows = await this.prisma.stockDeposito.findMany({
      where: { tenantId, articuloId },
      include: { deposito: { select: { codigo: true, nombre: true } } },
      orderBy: { depositoId: 'asc' },
    })

    const enTransitoAgg = await this.prisma.transferenciaDepositoItem.findMany({
      where: {
        articuloId,
        transferencia: { tenantId, estado: 'en_transito' },
      },
      select: { cantidadEnviada: true },
    })
    const enTransito = enTransitoAgg.reduce((s, i) => s + Number(i.cantidadEnviada), 0)

    return {
      ok: true,
      data: {
        success: true,
        articuloId,
        stockTotal: Number(art.stock),
        enTransito,
        depositos: rows.map(mapStockRow),
      },
    }
  }
}
