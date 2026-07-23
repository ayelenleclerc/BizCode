import type { Prisma, PrismaClient } from '@prisma/client'
import type {
  TransferenciaDepositoCreateInput,
  TransferenciaDepositoEstado,
  TransferenciaDepositoRecibirInput,
  TransferenciaDepositoRow,
} from '@bizcode/types'
import { assertNoOpenRecuento } from '../lib/recuentoStockGuard'
import type { ServiceResult } from './serviceResults'
import { applyStockDepositoDelta } from './stockDepositoSync'

const transferenciaInclude = {
  origen: { select: { codigo: true } },
  destino: { select: { codigo: true } },
  items: {
    include: {
      articulo: { select: { codigo: true, descripcion: true } },
    },
    orderBy: { id: 'asc' as const },
  },
} satisfies Prisma.TransferenciaDepositoInclude

type TransferenciaDb = Prisma.TransferenciaDepositoGetPayload<{ include: typeof transferenciaInclude }>

function mapTransferencia(row: TransferenciaDb): TransferenciaDepositoRow {
  return {
    id: row.id,
    tenantId: row.tenantId,
    numero: row.numero,
    origenId: row.origenId,
    destinoId: row.destinoId,
    estado: row.estado as TransferenciaDepositoEstado,
    solicitadoPorId: row.solicitadoPorId,
    aprobadoPorId: row.aprobadoPorId,
    fechaEnvio: row.fechaEnvio?.toISOString() ?? null,
    fechaRecepcion: row.fechaRecepcion?.toISOString() ?? null,
    nota: row.nota,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    origenCodigo: row.origen.codigo,
    destinoCodigo: row.destino.codigo,
    items: row.items.map((it) => ({
      id: it.id,
      transferenciaId: it.transferenciaId,
      articuloId: it.articuloId,
      cantidadEnviada: it.cantidadEnviada,
      cantidadRecibida: it.cantidadRecibida,
      articuloCodigo: it.articulo.codigo,
      articuloDescripcion: it.articulo.descripcion,
    })),
  }
}

/**
 * @en Inter-warehouse transfers with pending → in transit → received / cancelled (#236).
 * @es Transferencias entre depósitos con pendiente → en tránsito → recibida / anulada (#236).
 * @pt-BR Transferências entre depósitos com pendente → em trânsito → recebida / anulada (#236).
 */
export class TransferenciaDepositoService {
  constructor(private readonly prisma: PrismaClient) {}

  async list(
    tenantId: number,
    take: number,
    skip: number,
    opts?: { estado?: string | null },
  ): Promise<{ total: number; rows: TransferenciaDepositoRow[] }> {
    const where: Prisma.TransferenciaDepositoWhereInput = {
      tenantId,
      ...(opts?.estado ? { estado: opts.estado } : {}),
    }
    const [total, rows] = await Promise.all([
      this.prisma.transferenciaDeposito.count({ where }),
      this.prisma.transferenciaDeposito.findMany({
        where,
        include: transferenciaInclude,
        orderBy: [{ numero: 'desc' }],
        take,
        skip,
      }),
    ])
    return { total, rows: rows.map(mapTransferencia) }
  }

  async getById(tenantId: number, id: number): Promise<ServiceResult<TransferenciaDepositoRow>> {
    const row = await this.prisma.transferenciaDeposito.findFirst({
      where: { id, tenantId },
      include: transferenciaInclude,
    })
    if (!row) return { ok: false, status: 404, error: 'Transferencia not found' }
    return { ok: true, data: mapTransferencia(row) }
  }

  async create(
    tenantId: number,
    userId: number,
    input: TransferenciaDepositoCreateInput,
  ): Promise<ServiceResult<TransferenciaDepositoRow>> {
    const [origen, destino] = await Promise.all([
      this.prisma.deposito.findFirst({ where: { id: input.origenId, tenantId, activo: true } }),
      this.prisma.deposito.findFirst({ where: { id: input.destinoId, tenantId, activo: true } }),
    ])
    if (!origen || !destino) {
      return { ok: false, status: 400, error: 'Invalid origen or destino deposito' }
    }

    const articuloIds = input.items.map((i) => i.articuloId)
    if (new Set(articuloIds).size !== articuloIds.length) {
      return { ok: false, status: 400, error: 'Duplicate articuloId in items' }
    }
    const arts = await this.prisma.articulo.findMany({
      where: { tenantId, id: { in: articuloIds }, tipo: 'articulo' },
      select: { id: true, esPadre: true },
    })
    if (arts.length !== articuloIds.length) {
      return { ok: false, status: 400, error: 'Invalid articulo in items' }
    }
    if (arts.some((a) => a.esPadre)) {
      return { ok: false, status: 400, error: 'Parent articles cannot be transferred' }
    }

    const max = await this.prisma.transferenciaDeposito.aggregate({
      where: { tenantId },
      _max: { numero: true },
    })
    const numero = (max._max.numero ?? 0) + 1

    const created = await this.prisma.transferenciaDeposito.create({
      data: {
        tenantId,
        numero,
        origenId: input.origenId,
        destinoId: input.destinoId,
        estado: 'pendiente',
        solicitadoPorId: userId,
        nota: input.nota ?? null,
        items: {
          create: input.items.map((it) => ({
            articuloId: it.articuloId,
            cantidadEnviada: it.cantidadEnviada,
          })),
        },
      },
      include: transferenciaInclude,
    })
    return { ok: true, data: mapTransferencia(created) }
  }

  async markEnTransito(
    tenantId: number,
    id: number,
    userId: number,
  ): Promise<ServiceResult<TransferenciaDepositoRow>> {
    const existing = await this.prisma.transferenciaDeposito.findFirst({
      where: { id, tenantId },
      include: { items: true },
    })
    if (!existing) return { ok: false, status: 404, error: 'Transferencia not found' }
    if (existing.estado !== 'pendiente') {
      return { ok: false, status: 422, error: 'TRANSFER_NOT_PENDING' }
    }

    const recuentoBlock = await assertNoOpenRecuento(this.prisma, tenantId, existing.origenId)
    if (!recuentoBlock.ok) return recuentoBlock

    try {
      await this.prisma.$transaction(async (tx) => {
        for (const item of existing.items) {
          await applyStockDepositoDelta(tx, {
            tenantId,
            articuloId: item.articuloId,
            depositoId: existing.origenId,
            delta: -item.cantidadEnviada,
          })
        }
        await tx.transferenciaDeposito.update({
          where: { id },
          data: {
            estado: 'en_transito',
            aprobadoPorId: userId,
            fechaEnvio: new Date(),
          },
        })
      })
    } catch (err) {
      if (err instanceof Error && err.message === 'INSUFFICIENT_DEPOSIT_STOCK') {
        return { ok: false, status: 422, error: 'INSUFFICIENT_STOCK' }
      }
      throw err
    }

    return this.getById(tenantId, id)
  }

  async receive(
    tenantId: number,
    id: number,
    userId: number,
    input: TransferenciaDepositoRecibirInput,
  ): Promise<ServiceResult<TransferenciaDepositoRow>> {
    const existing = await this.prisma.transferenciaDeposito.findFirst({
      where: { id, tenantId },
      include: { items: true },
    })
    if (!existing) return { ok: false, status: 404, error: 'Transferencia not found' }
    if (existing.estado !== 'en_transito') {
      return { ok: false, status: 422, error: 'TRANSFER_NOT_IN_TRANSIT' }
    }

    const byArt = new Map(existing.items.map((i) => [i.articuloId, i]))
    for (const line of input.items) {
      const item = byArt.get(line.articuloId)
      if (!item) return { ok: false, status: 400, error: 'Invalid articuloId in receive items' }
      if (line.cantidadRecibida > item.cantidadEnviada) {
        return { ok: false, status: 422, error: 'RECEIVE_EXCEEDS_SENT' }
      }
    }
    for (const item of existing.items) {
      if (!input.items.some((l) => l.articuloId === item.articuloId)) {
        return { ok: false, status: 400, error: 'Missing articuloId in receive items' }
      }
    }

    const recuentoBlock = await assertNoOpenRecuento(this.prisma, tenantId, existing.destinoId)
    if (!recuentoBlock.ok) return recuentoBlock

    await this.prisma.$transaction(async (tx) => {
      for (const line of input.items) {
        const item = byArt.get(line.articuloId)!
        await tx.transferenciaDepositoItem.update({
          where: { id: item.id },
          data: { cantidadRecibida: line.cantidadRecibida },
        })
        if (line.cantidadRecibida > 0) {
          await applyStockDepositoDelta(tx, {
            tenantId,
            articuloId: line.articuloId,
            depositoId: existing.destinoId,
            delta: line.cantidadRecibida,
          })
        }
        const faltante = item.cantidadEnviada - line.cantidadRecibida
        if (faltante > 0) {
          await tx.stockAjuste.create({
            data: {
              tenantId,
              articuloId: line.articuloId,
              cantidad: -faltante,
              motivo: 'transferencia_faltante',
              userId,
              depositoId: existing.origenId,
            },
          })
          // Stock already left origin at en_transito; faltante is loss (no destination credit).
          // Articulo.stock already reduced; sync from depositos keeps it correct.
        }
      }
      await tx.transferenciaDeposito.update({
        where: { id },
        data: { estado: 'recibida', fechaRecepcion: new Date() },
      })
    })

    return this.getById(tenantId, id)
  }

  async anular(tenantId: number, id: number): Promise<ServiceResult<TransferenciaDepositoRow>> {
    const existing = await this.prisma.transferenciaDeposito.findFirst({
      where: { id, tenantId },
      include: { items: true },
    })
    if (!existing) return { ok: false, status: 404, error: 'Transferencia not found' }
    if (existing.estado !== 'pendiente' && existing.estado !== 'en_transito') {
      return { ok: false, status: 422, error: 'TRANSFER_NOT_CANCELLABLE' }
    }

    await this.prisma.$transaction(async (tx) => {
      if (existing.estado === 'en_transito') {
        for (const item of existing.items) {
          await applyStockDepositoDelta(tx, {
            tenantId,
            articuloId: item.articuloId,
            depositoId: existing.origenId,
            delta: item.cantidadEnviada,
          })
        }
      }
      await tx.transferenciaDeposito.update({
        where: { id },
        data: { estado: 'anulada' },
      })
    })

    return this.getById(tenantId, id)
  }
}
