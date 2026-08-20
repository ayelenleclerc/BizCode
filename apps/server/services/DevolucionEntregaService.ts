import { Prisma, type PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import type {
  DevolucionEntregaPublic,
  DevolucionEntregaRegisterInput,
  DevolucionEntregaRemitSummary,
} from '@bizcode/types'
import { isNonEmptyBase64, validatePodMediaSizes } from '../lib/podMediaValidation'
import { assertNoOpenRecuento } from '../lib/recuentoStockGuard'
import { ClienteCuentaCorrienteService } from './ClienteCuentaCorrienteService'
import { LoteService } from './LoteService'
import { MeliStockSyncService } from './MeliStockSyncService'
import { TiendanubeStockSyncService } from './TiendanubeStockSyncService'
import { WooCommerceStockSyncService } from './WooCommerceStockSyncService'
import type { ServiceResult } from './serviceResults'
import { notifyLogisticsPlannersForRepartoConflict } from './logisticsPlannerNotify'
import { applyStockDepositoDelta, getDefaultDepositoId } from './stockDepositoSync'

const MOTIVOS = ['rechazo', 'producto_dañado'] as const

const DEVOLUCION_INCLUDE = {
  lineas: { orderBy: { id: 'asc' as const } },
} satisfies Prisma.DevolucionEntregaInclude

type DevolucionRow = Prisma.DevolucionEntregaGetPayload<{ include: typeof DEVOLUCION_INCLUDE }>

function mapPublic(row: DevolucionRow): DevolucionEntregaPublic {
  return {
    id: row.id,
    tenantId: row.tenantId,
    repartoId: row.repartoId,
    repartoItemId: row.repartoItemId,
    motivo: row.motivo as DevolucionEntregaPublic['motivo'],
    motivoDetalle: row.motivoDetalle,
    hasFoto: isNonEmptyBase64(row.fotoBase64),
    estado: row.estado as DevolucionEntregaPublic['estado'],
    notaCreditoId: row.notaCreditoId,
    remittedAt: row.remittedAt ? row.remittedAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
    lineas: row.lineas.map((linea) => ({
      id: linea.id,
      articuloId: linea.articuloId,
      facturaItemId: linea.facturaItemId,
      cantidad: Number(linea.cantidad),
    })),
  }
}

function roundMoney2(value: number): Decimal {
  return new Decimal(value.toFixed(2))
}

function creditAmountForLine(item: { cantidad: Decimal; subtotal: Decimal }, qtyReturned: number): Decimal {
  const qty = Number(item.cantidad)
  if (!Number.isFinite(qty) || qty <= 0) return new Decimal(0)
  const unit = Number(item.subtotal) / qty
  return roundMoney2(unit * qtyReturned)
}

/**
 * @en Delivery-stop returns: register without stock/NC; remit applies stock + partial credit note (#163).
 * @es Devoluciones de parada: registro sin stock/NC; la rendición aplica stock + NC parcial (#163).
 * @pt-BR Devoluções da parada: registro sem estoque/NC; a prestação aplica estoque + NC parcial (#163).
 */
export class DevolucionEntregaService {
  private readonly loteService: LoteService

  constructor(private readonly prisma: PrismaClient) {
    this.loteService = new LoteService(prisma)
  }

  private async assertChoferRoute(
    tenantId: number,
    repartoId: number,
    actor: { userId: number; role: string },
  ): Promise<ServiceResult<{ id: number; estado: string; choferId: number }>> {
    const reparto = await this.prisma.reparto.findFirst({
      where: { id: repartoId, tenantId },
      select: { id: true, estado: true, choferId: true },
    })
    if (!reparto) {
      return { ok: false, status: 404, error: 'REPARTO_NOT_FOUND' }
    }
    if (actor.role === 'driver' && reparto.choferId !== actor.userId) {
      return { ok: false, status: 403, error: 'Forbidden' }
    }
    return { ok: true, data: reparto }
  }

  async register(
    tenantId: number,
    repartoId: number,
    itemId: number,
    input: DevolucionEntregaRegisterInput,
    actor: { userId: number; role: string },
  ): Promise<ServiceResult<{ devolucion: DevolucionEntregaPublic }>> {
    if (!MOTIVOS.includes(input.motivo)) {
      return { ok: false, status: 422, error: 'INVALID_MOTIVO_DEVOLUCION' }
    }
    if (input.motivo === 'producto_dañado' && !isNonEmptyBase64(input.fotoBase64)) {
      return { ok: false, status: 422, error: 'DEVOLUCION_FOTO_REQUIRED' }
    }
    if (isNonEmptyBase64(input.fotoBase64)) {
      const sizeErr = validatePodMediaSizes({ fotoBase64: input.fotoBase64!.trim() })
      if (sizeErr) {
        return { ok: false, status: 422, error: sizeErr }
      }
    }

    const route = await this.assertChoferRoute(tenantId, repartoId, actor)
    if (!route.ok) return route
    if (route.data.estado !== 'on_route') {
      await notifyLogisticsPlannersForRepartoConflict(this.prisma, tenantId, {
        repartoId,
        itemId,
        code: 'REPARTO_INVALID_STATE',
        actorUserId: actor.userId,
      }).catch(() => {
        /* notify must not break register */
      })
      return { ok: false, status: 422, error: 'REPARTO_INVALID_STATE' }
    }

    const item = await this.prisma.repartoItem.findFirst({
      where: { id: itemId, repartoId, reparto: { tenantId } },
      include: {
        devolucionEntrega: { select: { id: true } },
        ordenEntrega: {
          select: {
            id: true,
            facturaId: true,
            factura: {
              select: {
                id: true,
                items: {
                  select: { id: true, articuloId: true, cantidad: true },
                },
              },
            },
          },
        },
      },
    })
    if (!item) {
      return { ok: false, status: 404, error: 'REPARTO_ITEM_NOT_FOUND' }
    }
    if (item.estado !== 'pending') {
      return { ok: false, status: 422, error: 'REPARTO_ITEM_INVALID_STATE' }
    }
    if (item.devolucionEntrega) {
      await notifyLogisticsPlannersForRepartoConflict(this.prisma, tenantId, {
        repartoId,
        itemId,
        code: 'DEVOLUCION_ALREADY_EXISTS',
        actorUserId: actor.userId,
      }).catch(() => {
        /* notify must not break register */
      })
      return { ok: false, status: 422, error: 'DEVOLUCION_ALREADY_EXISTS' }
    }
    if (input.lineas.length === 0) {
      return { ok: false, status: 422, error: 'DEVOLUCION_LINES_REQUIRED' }
    }

    const facturaItems = item.ordenEntrega.factura?.items ?? []
    const facturaItemById = new Map(facturaItems.map((fi) => [fi.id, fi]))

    for (const linea of input.lineas) {
      if (!(linea.cantidad > 0)) {
        return { ok: false, status: 422, error: 'DEVOLUCION_INVALID_QTY' }
      }
      if (item.ordenEntrega.facturaId != null) {
        if (linea.facturaItemId == null) {
          return { ok: false, status: 422, error: 'DEVOLUCION_FACTURA_ITEM_REQUIRED' }
        }
        const fi = facturaItemById.get(linea.facturaItemId)
        if (!fi) {
          return { ok: false, status: 422, error: 'DEVOLUCION_FACTURA_ITEM_NOT_FOUND' }
        }
        if (fi.articuloId != null && fi.articuloId !== linea.articuloId) {
          return { ok: false, status: 422, error: 'DEVOLUCION_LINE_MISMATCH' }
        }
        if (fi.articuloId == null) {
          return { ok: false, status: 422, error: 'DEVOLUCION_SERVICE_LINE' }
        }
        if (linea.cantidad > Number(fi.cantidad)) {
          return { ok: false, status: 422, error: 'DEVOLUCION_INVALID_QTY' }
        }
      } else {
        const articulo = await this.prisma.articulo.findFirst({
          where: { id: linea.articuloId, tenantId },
          select: { id: true, tipo: true },
        })
        if (!articulo) {
          return { ok: false, status: 404, error: 'Articulo not found' }
        }
        if (articulo.tipo === 'servicio') {
          return { ok: false, status: 422, error: 'DEVOLUCION_SERVICE_LINE' }
        }
      }
    }

    const now = new Date()
    try {
      const created = await this.prisma.$transaction(async (tx) => {
        const row = await tx.devolucionEntrega.create({
          data: {
            tenantId,
            repartoId,
            repartoItemId: itemId,
            motivo: input.motivo,
            motivoDetalle: input.motivoDetalle?.trim() || null,
            fotoBase64: isNonEmptyBase64(input.fotoBase64) ? input.fotoBase64!.trim() : null,
            estado: 'registered',
            registeredById: actor.userId,
            lineas: {
              create: input.lineas.map((linea) => ({
                articuloId: linea.articuloId,
                facturaItemId: linea.facturaItemId ?? null,
                cantidad: linea.cantidad,
              })),
            },
          },
          include: DEVOLUCION_INCLUDE,
        })
        await tx.repartoItem.update({
          where: { id: itemId },
          data: {
            estado: 'returned',
            entregadoAt: now,
            motivoNoEntrega: input.motivo,
          },
        })
        await tx.ordenEntrega.update({
          where: { id: item.ordenEntrega.id },
          data: { estado: 'failed' },
        })
        return row
      })
      return { ok: true, data: { devolucion: mapPublic(created) } }
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        await notifyLogisticsPlannersForRepartoConflict(this.prisma, tenantId, {
          repartoId,
          itemId,
          code: 'DEVOLUCION_ALREADY_EXISTS',
          actorUserId: actor.userId,
        }).catch(() => {
          /* notify must not break register */
        })
        return { ok: false, status: 422, error: 'DEVOLUCION_ALREADY_EXISTS' }
      }
      throw err
    }
  }

  async listForReparto(
    tenantId: number,
    repartoId: number,
    actor: { userId: number; role: string },
  ): Promise<ServiceResult<{ devoluciones: DevolucionEntregaPublic[] }>> {
    const route = await this.assertChoferRoute(tenantId, repartoId, actor)
    if (!route.ok) return route
    const rows = await this.prisma.devolucionEntrega.findMany({
      where: { tenantId, repartoId },
      include: DEVOLUCION_INCLUDE,
      orderBy: { id: 'asc' },
    })
    return { ok: true, data: { devoluciones: rows.map(mapPublic) } }
  }

  async remit(
    tenantId: number,
    repartoId: number,
    actor: { userId: number; role: string; ipAddress: string | null },
  ): Promise<ServiceResult<{ summary: DevolucionEntregaRemitSummary; devoluciones: DevolucionEntregaPublic[] }>> {
    const route = await this.assertChoferRoute(tenantId, repartoId, actor)
    if (!route.ok) return route

    const pending = await this.prisma.devolucionEntrega.findMany({
      where: { tenantId, repartoId, estado: 'registered' },
      include: {
        ...DEVOLUCION_INCLUDE,
        repartoItem: {
          select: {
            ordenEntrega: {
              select: { depositoId: true, facturaId: true },
            },
          },
        },
      },
    })
    if (pending.length === 0) {
      return { ok: false, status: 422, error: 'DEVOLUCION_NONE_PENDING' }
    }

    const articuloIds = [...new Set(pending.flatMap((row) => row.lineas.map((l) => l.articuloId)))]
    const articulos = await this.prisma.articulo.findMany({
      where: { tenantId, id: { in: articuloIds } },
      select: { id: true, tipo: true, controlLote: true, stock: true },
    })
    const articuloById = new Map(articulos.map((a) => [a.id, a]))
    const fefoEnabled = await this.loteService.isFefoEnabled(tenantId)

    for (const row of pending) {
      const depositoId =
        row.repartoItem.ordenEntrega.depositoId ?? (await getDefaultDepositoId(this.prisma, tenantId))
      const recuentoBlock = await assertNoOpenRecuento(this.prisma, tenantId, depositoId)
      if (!recuentoBlock.ok) return recuentoBlock

      for (const linea of row.lineas) {
        const articulo = articuloById.get(linea.articuloId)
        if (!articulo) {
          return { ok: false, status: 404, error: 'Articulo not found' }
        }
        if (articulo.tipo === 'servicio') {
          continue
        }
        if (articulo.controlLote === true && fefoEnabled) {
          return { ok: false, status: 422, error: 'LOTE_REQUIRED' }
        }
      }
    }

    const facturaItemIds = [
      ...new Set(
        pending.flatMap((row) => {
          if (row.repartoItem.ordenEntrega.facturaId == null) return []
          return row.lineas.map((l) => l.facturaItemId).filter((id): id is number => id != null)
        }),
      ),
    ]
    const facturaItems =
      facturaItemIds.length > 0
        ? await this.prisma.facturaItem.findMany({
            where: { id: { in: facturaItemIds } },
            select: { id: true, cantidad: true, subtotal: true, facturaId: true },
          })
        : []
    const facturaItemById = new Map(facturaItems.map((fi) => [fi.id, fi]))

    const now = new Date()
    const stockArticuloIds = new Set<number>()
    let stockAdjustmentCount = 0

    let updated: DevolucionRow[]
    try {
      updated = await this.prisma.$transaction(async (tx) => {
      const out: DevolucionRow[] = []
      for (const row of pending) {
        const depositoId =
          row.repartoItem.ordenEntrega.depositoId ?? (await getDefaultDepositoId(tx, tenantId))
        let ncMonto = new Decimal(0)
        for (const linea of row.lineas) {
          const articulo = articuloById.get(linea.articuloId)
          if (articulo && articulo.tipo !== 'servicio') {
            const qty = Number(linea.cantidad)
            if (depositoId != null) {
              await applyStockDepositoDelta(tx, {
                tenantId,
                articuloId: linea.articuloId,
                depositoId,
                delta: qty,
              })
            } else {
              const current = await tx.articulo.findFirstOrThrow({
                where: { id: linea.articuloId },
                select: { stock: true },
              })
              await tx.articulo.update({
                where: { id: linea.articuloId },
                data: { stock: Number(current.stock) + qty },
              })
            }
            await tx.stockAjuste.create({
              data: {
                tenantId,
                articuloId: linea.articuloId,
                cantidad: qty,
                motivo: 'devolucion_entrega',
                userId: actor.userId,
                ...(depositoId != null ? { depositoId } : {}),
              },
            })
            stockArticuloIds.add(linea.articuloId)
            stockAdjustmentCount += 1
          }
          if (linea.facturaItemId != null) {
            const fi = facturaItemById.get(linea.facturaItemId)
            if (fi) {
              ncMonto = ncMonto.add(creditAmountForLine(fi, Number(linea.cantidad)))
            }
          }
        }

        let notaCreditoId: number | null = null
        const facturaId = row.repartoItem.ordenEntrega.facturaId
        if (facturaId != null && ncMonto.greaterThan(0)) {
          const factura = await tx.factura.findFirst({
            where: { id: facturaId, tenantId },
            select: {
              id: true,
              estado: true,
              total: true,
              clienteId: true,
              estadoCae: true,
              tipo: true,
              prefijo: true,
              numero: true,
            },
          })
          if (!factura || factura.estado !== 'A') {
            throw new Error('FACTURA_NOT_ACTIVE_FOR_NC')
          }
          const existingNcSum = await tx.notaCredito.aggregate({
            where: { tenantId, facturaOrigenId: facturaId },
            _sum: { monto: true },
          })
          const creditedSoFar = existingNcSum._sum.monto ?? new Decimal(0)
          if (creditedSoFar.add(ncMonto).greaterThan(factura.total)) {
            throw new Error('NC_EXCEEDS_INVOICE_TOTAL')
          }
          const notaCreditoEstadoCae = factura.estadoCae === 'issued' ? 'pending' : 'not_required'
          const notaCredito = await tx.notaCredito.create({
            data: {
              tenantId,
              facturaOrigenId: facturaId,
              motivo: `devolucion_entrega #${row.id}`,
              monto: ncMonto,
              estadoCae: notaCreditoEstadoCae,
              createdById: actor.userId,
            },
          })
          const facturaRef = `${factura.tipo}-${factura.prefijo}-${factura.numero}`
          const ccService = new ClienteCuentaCorrienteService(tx)
          await ccService.recordFromNotaCredito(
            tenantId,
            notaCredito,
            factura.clienteId,
            facturaRef,
            actor.userId,
          )
          notaCreditoId = notaCredito.id
        }

        const saved = await tx.devolucionEntrega.update({
          where: { id: row.id },
          data: {
            estado: 'remitted',
            remittedAt: now,
            remittedById: actor.userId,
            notaCreditoId,
          },
          include: DEVOLUCION_INCLUDE,
        })
        out.push(saved)
      }
      return out
      })
    } catch (err) {
      if (err instanceof Error && err.message === 'FACTURA_NOT_ACTIVE_FOR_NC') {
        return { ok: false, status: 422, error: 'FACTURA_NOT_ACTIVE_FOR_NC' }
      }
      if (err instanceof Error && err.message === 'NC_EXCEEDS_INVOICE_TOTAL') {
        return { ok: false, status: 422, error: 'NC_EXCEEDS_INVOICE_TOTAL' }
      }
      throw err
    }

    for (const articuloId of stockArticuloIds) {
      try {
        void new MeliStockSyncService(this.prisma).syncStockToMeli(tenantId, articuloId).catch(() => undefined)
        void new TiendanubeStockSyncService(this.prisma)
          .syncStockToTiendanube(tenantId, articuloId)
          .catch(() => undefined)
        void new WooCommerceStockSyncService(this.prisma)
          .syncStockToWooCommerce(tenantId, articuloId)
          .catch(() => undefined)
      } catch {
        /* Marketplace stock sync must not fail remittance (#163). */
      }
    }

    const remitted = updated.length
    const stockAdjustments = stockAdjustmentCount
    const creditNotes = updated.filter((d) => d.notaCreditoId != null).length
    const skippedNoInvoice = pending.filter((p) => p.repartoItem.ordenEntrega.facturaId == null).length

    return {
      ok: true,
      data: {
        summary: { remitted, stockAdjustments, creditNotes, skippedNoInvoice },
        devoluciones: updated.map(mapPublic),
      },
    }
  }
}
