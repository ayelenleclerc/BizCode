import type { Prisma, PrismaClient } from '@prisma/client'
import type { RecuentoItemLineInput } from '@bizcode/types'
import { assertNoControlLoteArticles } from '../lib/controlLoteGuard'
import type { ServiceResult } from './serviceResults'
import { applyStockDepositoDelta, getDefaultDepositoId } from './stockDepositoSync'

export const RECUENTO_ESTADOS = ['in_progress', 'closed'] as const
export type RecuentoEstado = (typeof RECUENTO_ESTADOS)[number]

const RECUENTO_STOCK_MOTIVO = 'recuento'

const recuentoInclude = {
  operador: { select: { id: true, username: true } },
  items: {
    include: {
      articulo: { select: { id: true, codigo: true, descripcion: true } },
    },
    orderBy: { id: 'asc' as const },
  },
} satisfies Prisma.RecuentoInclude

export type RecuentoRow = Prisma.RecuentoGetPayload<{ include: typeof recuentoInclude }>

/**
 * @en Physical inventory count with snapshot, partial counts, and close → stock (#136).
 * @es Recuento físico con snapshot, conteos parciales y cierre → stock (#136).
 * @pt-BR Contagem física com snapshot, contagens parciais e fechamento → estoque (#136).
 */
export class RecuentoService {
  constructor(private readonly prisma: PrismaClient) {}

  async list(
    tenantId: number,
    take: number,
    skip: number,
  ): Promise<{ total: number; recuentos: RecuentoRow[] }> {
    const where = { tenantId }
    const [total, recuentos] = await Promise.all([
      this.prisma.recuento.count({ where }),
      this.prisma.recuento.findMany({
        where,
        include: recuentoInclude,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        take,
        skip,
      }),
    ])
    return { total, recuentos }
  }

  async getById(tenantId: number, id: number): Promise<RecuentoRow | null> {
    return this.prisma.recuento.findFirst({
      where: { id, tenantId },
      include: recuentoInclude,
    })
  }

  async start(
    tenantId: number,
    operadorId: number,
    depositoId?: number | null,
  ): Promise<ServiceResult<RecuentoRow>> {
    const resolvedDepositoId =
      depositoId != null ? depositoId : await getDefaultDepositoId(this.prisma, tenantId)

    if (depositoId != null) {
      const dep = await this.prisma.deposito.findFirst({
        where: { id: depositoId, tenantId, activo: true },
        select: { id: true },
      })
      if (!dep) {
        return { ok: false, status: 400, error: 'depositoId is not valid for this tenant' }
      }
    }

    const open = await this.prisma.recuento.findFirst({
      where: {
        tenantId,
        estado: 'in_progress',
        ...(resolvedDepositoId != null ? { depositoId: resolvedDepositoId } : {}),
      },
      select: { id: true },
    })
    if (open) {
      return { ok: false, status: 422, error: 'RECUENTO_ALREADY_OPEN' }
    }

    const articulos = await this.prisma.articulo.findMany({
      where: { tenantId, activo: true, tipo: 'articulo' },
      select: { id: true, stock: true },
      orderBy: { codigo: 'asc' },
    })

    let cantSistemaByArt = new Map(articulos.map((a) => [a.id, a.stock]))
    if (resolvedDepositoId != null) {
      const rows = await this.prisma.stockDeposito.findMany({
        where: {
          tenantId,
          depositoId: resolvedDepositoId,
          articuloId: { in: articulos.map((a) => a.id) },
        },
        select: { articuloId: true, cantidad: true },
      })
      cantSistemaByArt = new Map(articulos.map((a) => [a.id, 0]))
      for (const r of rows) cantSistemaByArt.set(r.articuloId, r.cantidad)
    }

    const row = await this.prisma.recuento.create({
      data: {
        tenantId,
        operadorId,
        estado: 'in_progress',
        ...(resolvedDepositoId != null ? { depositoId: resolvedDepositoId } : {}),
        items: {
          create: articulos.map((a) => ({
            articuloId: a.id,
            cantSistema: cantSistemaByArt.get(a.id) ?? 0,
            cantFisica: null,
          })),
        },
      },
      include: recuentoInclude,
    })

    return { ok: true, data: row }
  }

  async updateItems(
    tenantId: number,
    id: number,
    lines: RecuentoItemLineInput[],
  ): Promise<ServiceResult<RecuentoRow>> {
    const recuento = await this.prisma.recuento.findFirst({
      where: { id, tenantId },
      include: { items: true },
    })
    if (!recuento) {
      return { ok: false, status: 404, error: 'Recuento not found' }
    }
    if (recuento.estado !== 'in_progress') {
      return { ok: false, status: 422, error: 'RECUENTO_NOT_EDITABLE' }
    }

    const itemByArticulo = new Map(recuento.items.map((i) => [i.articuloId, i]))
    for (const line of lines) {
      if (!itemByArticulo.has(line.articuloId)) {
        return { ok: false, status: 422, error: 'INVALID_LINE_ITEM' }
      }
      if (!Number.isInteger(line.cantFisica) || line.cantFisica < 0) {
        return { ok: false, status: 422, error: 'INVALID_CANT_FISICA' }
      }
    }

    await this.prisma.$transaction(async (tx) => {
      for (const line of lines) {
        const item = itemByArticulo.get(line.articuloId)!
        await tx.recuentoItem.update({
          where: { id: item.id },
          data: { cantFisica: line.cantFisica },
        })
      }
    })

    const updated = await this.getById(tenantId, id)
    if (!updated) {
      return { ok: false, status: 404, error: 'Recuento not found' }
    }
    return { ok: true, data: updated }
  }

  async close(tenantId: number, id: number, userId: number): Promise<ServiceResult<RecuentoRow>> {
    const recuento = await this.prisma.recuento.findFirst({
      where: { id, tenantId },
      include: { items: true },
    })
    if (!recuento) {
      return { ok: false, status: 404, error: 'Recuento not found' }
    }
    if (recuento.estado !== 'in_progress') {
      return { ok: false, status: 422, error: 'RECUENTO_NOT_CLOSABLE' }
    }

    const uncounted = recuento.items.filter((i) => i.cantFisica === null)
    if (uncounted.length > 0) {
      return { ok: false, status: 422, error: 'RECUENTO_ITEMS_INCOMPLETE' }
    }

    const depositoId =
      recuento.depositoId ?? (await getDefaultDepositoId(this.prisma, tenantId))

    const lotBlock = await assertNoControlLoteArticles(
      this.prisma,
      tenantId,
      recuento.items.map((i) => i.articuloId),
    )
    if (!lotBlock.ok) {
      return lotBlock
    }

    try {
      await this.prisma.$transaction(async (tx) => {
        for (const item of recuento.items) {
          const cantFisica = item.cantFisica!
          const diff = cantFisica - item.cantSistema
          if (diff === 0) {
            continue
          }

          if (depositoId != null) {
            await applyStockDepositoDelta(tx, {
              tenantId,
              articuloId: item.articuloId,
              depositoId,
              delta: diff,
            })
          } else {
            const articulo = await tx.articulo.findFirst({
              where: { id: item.articuloId, tenantId },
              select: { id: true, stock: true },
            })
            if (!articulo) {
              throw new Error('Articulo not found')
            }
            const stockAfter = articulo.stock + diff
            if (stockAfter < 0) {
              throw new Error('INSUFFICIENT_STOCK')
            }
            await tx.articulo.update({
              where: { id: articulo.id },
              data: { stock: stockAfter },
            })
          }
          await tx.stockAjuste.create({
            data: {
              tenantId,
              articuloId: item.articuloId,
              cantidad: diff,
              motivo: RECUENTO_STOCK_MOTIVO,
              userId,
              ...(depositoId != null ? { depositoId } : {}),
            },
          })
        }

        await tx.recuento.update({
          where: { id },
          data: { estado: 'closed', closedAt: new Date() },
        })
      })
    } catch (err) {
      if (
        err instanceof Error &&
        (err.message === 'INSUFFICIENT_DEPOSIT_STOCK' || err.message === 'INSUFFICIENT_STOCK')
      ) {
        return { ok: false, status: 422, error: 'INSUFFICIENT_STOCK' }
      }
      throw err
    }

    const updated = await this.getById(tenantId, id)
    if (!updated) {
      return { ok: false, status: 404, error: 'Recuento not found' }
    }
    return { ok: true, data: updated }
  }
}
