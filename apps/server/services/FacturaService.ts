import type { Cliente, Factura, NotaCredito, Prisma, PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import type { FacturaInput } from '@bizcode/types'
import { assertNoOpenRecuento } from '../lib/recuentoStockGuard'
import { facturaFechaToPrismaDate } from '../routes/restDomainShared'
import type { ServiceResult } from './serviceResults'
import {
  aggregateItemQuantities,
  evaluateStockForInvoice,
  type StockBelowMinimumAlert,
} from './facturaStock'
import { applyStockDepositoDelta, getDefaultDepositoId } from './stockDepositoSync'
import { FiscalDocumentService } from '../fiscal/FiscalDocumentService'
import { validateFacturaPercepciones } from './RetencionFacturaValidation'
import { ClienteCuentaCorrienteService } from './ClienteCuentaCorrienteService'
import { GarantiaService } from './GarantiaService'
import { FidelizacionService } from './FidelizacionService'
import { LoteService } from './LoteService'
import { FarmaciaService } from './FarmaciaService'
import { TurnoCajaService } from './TurnoCajaService'
import { MeliStockSyncService } from './MeliStockSyncService'
import { TiendanubeStockSyncService } from './TiendanubeStockSyncService'
import { WooCommerceStockSyncService } from './WooCommerceStockSyncService'
import { afipCodigoForUnidad, isUnidadBase, roundQty, validateQuantityForUom } from '../lib/uom'
import { FacturaAnomalyService, type FacturaAnomalyWarning } from './FacturaAnomalyService'

type FacturaWithRelations = Prisma.FacturaGetPayload<{ include: { cliente: true; items: true } }>

function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

export type FacturaListResult = {
  total: number
  facturas: FacturaWithRelations[]
}

export type FacturaCreateResult = {
  factura: FacturaWithRelations
  updatedCliente: Pick<Cliente, 'id' | 'rsocial' | 'balance' | 'creditLimit'>
  stockBelowMinimum: StockBelowMinimumAlert[]
  /** @en Soft anomaly warnings after successful create (#200). */
  warnings: FacturaAnomalyWarning[]
}
export type FacturaVoidAuditContext = {
  userId: number | null
  ipAddress: string | null
}

export type FacturaVoidResult = {
  factura: Factura
  notaCredito: NotaCredito
  updatedCliente: Pick<Cliente, 'id' | 'rsocial' | 'balance' | 'creditLimit'>
}

export type FacturaPartialCreditNoteResult = {
  notaCredito: NotaCredito
  updatedCliente: Pick<Cliente, 'id' | 'rsocial' | 'balance' | 'creditLimit'>
}

export type FacturaCreateOptions = {
  skipArcaCae?: boolean
  contratoId?: number | null
  /**
   * @en Skip stock check/decrement (MeLi orders already adjusted via venta_meli) (#186).
   * @es Omite chequeo/decremento de stock (órdenes MeLi ya ajustadas vía venta_meli) (#186).
   * @pt-BR Omite checagem/decremento de estoque (pedidos MeLi já ajustados via venta_meli) (#186).
   */
  skipStockDecrement?: boolean
}
/**
 * @en Invoice domain operations (list, create, void).
 * @es Operaciones de dominio de facturas (listado, alta, anulaci?n).
 * @pt-BR Opera??es de dom?nio de faturas (listagem, cria??o, anula??o).
 */
export class FacturaService {
  /** @en Delegates CAE/fiscal authorization to the multi-organism module (#378); ARCA remains the only live adapter. */
  private readonly fiscalDocumentService: FiscalDocumentService
  private readonly garantiaService: GarantiaService
  private readonly fidelizacionService: FidelizacionService
  private readonly loteService: LoteService
  private readonly turnoCajaService: TurnoCajaService
  private readonly anomalyService: FacturaAnomalyService
  /** @en Pharmacy dispensing gate and psychotropic book, active only with `vertical.pharmacy` (#204). */
  private readonly farmaciaService: FarmaciaService

  constructor(private readonly prisma: PrismaClient) {
    this.fiscalDocumentService = new FiscalDocumentService(prisma)
    this.garantiaService = new GarantiaService(prisma)
    this.fidelizacionService = new FidelizacionService(prisma)
    this.loteService = new LoteService(prisma)
    this.turnoCajaService = new TurnoCajaService(prisma)
    this.anomalyService = new FacturaAnomalyService(prisma)
    this.farmaciaService = new FarmaciaService(prisma)
  }

  async list(tenantId: number, take: number, skip: number): Promise<FacturaListResult> {
    const where = { tenantId }
    const [total, facturas] = await Promise.all([
      this.prisma.factura.count({ where }),
      this.prisma.factura.findMany({
        where,
        include: { cliente: true, items: true },
        orderBy: { fecha: 'desc' },
        take,
        skip,
      }),
    ])
    return { total, facturas }
  }

  async create(
    tenantId: number,
    input: FacturaInput,
    userId: number,
    options?: FacturaCreateOptions,
  ): Promise<ServiceResult<FacturaCreateResult>> {
    const {
      items: inputItems,
      fecha,
      depositoId: inputDepositoId,
      puntosCanje,
      confirmAnomalies,
      recetaId,
      ...factura
    } = input
    const clienteId = factura.clienteId
    const confirm = confirmAnomalies === true

    const anomalyLines = inputItems.map((it) => ({
      cantidad: it.cantidad,
      precio: it.precio,
      dscto: it.dscto,
    }))
    const anomalyWarnings = await this.anomalyService.analyze({
      tenantId,
      clienteId,
      fecha,
      total: factura.total,
      lines: anomalyLines,
    })
    const hasDuplicate = anomalyWarnings.some((w) => w.tipo === 'factura_duplicada')
    if (hasDuplicate && !confirm) {
      return {
        ok: false,
        status: 422,
        error: 'DUPLICATE_INVOICE_CONFIRM_REQUIRED',
        warnings: anomalyWarnings,
      }
    }

    let items = [...inputItems]
    let facturaTotals = { ...factura }
    if (puntosCanje != null && puntosCanje > 0) {
      const prepared = await this.fidelizacionService.prepareCanje(tenantId, clienteId, puntosCanje)
      if (!prepared.ok) return prepared
      items = [...items, prepared.data.item]
      facturaTotals = {
        ...facturaTotals,
        neto3: roundMoney(facturaTotals.neto3 - prepared.data.monto),
        total: roundMoney(facturaTotals.total - prepared.data.monto),
      }
    }

    const catalogIds = [
      ...new Set(
        items
          .map((it) => it.articuloId)
          .filter((id): id is number => typeof id === 'number' && id >= 1),
      ),
    ]
    const articulosRaw =
      catalogIds.length > 0
        ? await this.prisma.articulo.findMany({
            where: { tenantId, id: { in: catalogIds } },
            select: {
              id: true,
              codigo: true,
              descripcion: true,
              stock: true,
              minimo: true,
              tipo: true,
              condIva: true,
              unidadServicio: true,
              mesesGarantia: true,
              controlLote: true,
              requiereReceta: true,
              esPsicotropico: true,
              esPadre: true,
              monedaPrecio: true,
              precioEnMonedaOrigen: true,
              unidadBase: true,
              multiploVenta: true,
              factorConversion: true,
            },
          })
        : []
    if (articulosRaw.length !== catalogIds.length) {
      return {
        ok: false,
        status: 400,
        error: 'One or more articuloId values are not valid for this tenant',
      }
    }
    if (articulosRaw.some((a) => a.esPadre)) {
      return {
        ok: false,
        status: 400,
        error: 'Parent articles cannot be sold; select a variant instead',
      }
    }

    const dispensacion = await this.farmaciaService.assertDispensacionAllowed(
      tenantId,
      articulosRaw.map((a) => ({ id: a.id, requiereReceta: a.requiereReceta })),
      recetaId,
    )
    if (!dispensacion.ok) return dispensacion

    // @en Decimal(14,4) columns arrive as Prisma Decimal; normalize to number once for downstream arithmetic (#203).
    // @es Las columnas Decimal(14,4) llegan como Prisma Decimal; se normalizan a number una vez para la aritmética posterior (#203).
    // @pt-BR As colunas Decimal(14,4) chegam como Prisma Decimal; normalizadas para number uma vez para a aritmética seguinte (#203).
    const articulos = articulosRaw.map((a) => ({
      ...a,
      stock: Number(a.stock),
      minimo: Number(a.minimo),
      multiploVenta: a.multiploVenta != null ? Number(a.multiploVenta) : null,
      factorConversion: Number(a.factorConversion),
    }))

    const articuloById = new Map(articulos.map((a) => [a.id, a]))
    const tipoById = new Map(articulos.map((a) => [a.id, a.tipo]))

    for (const it of items) {
      if (it.articuloId == null) continue
      const art = articuloById.get(it.articuloId)
      if (!art || art.tipo === 'servicio' || !isUnidadBase(art.unidadBase)) continue
      const qtyCheck = validateQuantityForUom({
        cantidad: it.cantidad,
        unidadBase: art.unidadBase,
        multiploVenta: art.multiploVenta,
      })
      if (!qtyCheck.ok) {
        return { ok: false, status: 422, error: `articuloId ${it.articuloId}: ${qtyCheck.error}` }
      }
    }

    const fxMonedas = [
      ...new Set(
        articulos
          .map((a) => a.monedaPrecio)
          .filter((m): m is string => m === 'USD' || m === 'EUR'),
      ),
    ]
    const fxSnapshotByMoneda = new Map<
      string,
      { id: number; valor: number; tipo: string; fecha: Date; moneda: string }
    >()
    for (const moneda of fxMonedas) {
      const preferido = await this.prisma.tenantConfig.findUnique({
        where: { tenantId },
        select: { tipoCambioPreferido: true },
      })
      const tipo = preferido?.tipoCambioPreferido ?? 'oficial'
      const rate = await this.prisma.tipoCambio.findFirst({
        where: { tenantId, moneda, tipo },
        orderBy: [{ fecha: 'desc' }, { id: 'desc' }],
      })
      if (rate) {
        fxSnapshotByMoneda.set(moneda, {
          id: rate.id,
          valor: Number(rate.valor.toString()),
          tipo: rate.tipo,
          fecha: rate.fecha,
          moneda: rate.moneda,
        })
      }
    }
    const primaryFx =
      fxSnapshotByMoneda.get('USD') ?? fxSnapshotByMoneda.get('EUR') ?? null

    const clienteCheck = await this.prisma.cliente.findFirst({
      where: { id: clienteId, tenantId },
      select: { suspended: true },
    })
    if (!clienteCheck) {
      return { ok: false, status: 400, error: 'clienteId is not valid for this tenant' }
    }
    if (clienteCheck.suspended) {
      return { ok: false, status: 422, error: 'CLIENT_SUSPENDED' }
    }

    const resolvedItems = items.map((it) => {
      if (it.articuloId != null && it.articuloId >= 1) {
        const art = articuloById.get(it.articuloId)!
        const fx =
          art.monedaPrecio === 'USD' || art.monedaPrecio === 'EUR'
            ? fxSnapshotByMoneda.get(art.monedaPrecio)
            : undefined
        const origen =
          art.precioEnMonedaOrigen != null
            ? Number(art.precioEnMonedaOrigen.toString())
            : null
        const unidadBase = art.unidadBase
        return {
          articuloId: it.articuloId,
          descripcion: (art.descripcion ?? '').slice(0, 120),
          condIva: art.condIva ?? '1',
          unidadServicio: art.tipo === 'servicio' ? art.unidadServicio : null,
          cantidad: it.cantidad,
          precio: it.precio,
          dscto: it.dscto,
          subtotal: it.subtotal,
          monedaOrigen: fx && origen != null ? art.monedaPrecio : null,
          precioOrigen: fx && origen != null ? origen : null,
          tipoCambioValor: fx && origen != null ? fx.valor : null,
          unidadMedida: isUnidadBase(unidadBase) ? unidadBase : null,
          codigoAfipUnidad: isUnidadBase(unidadBase) ? afipCodigoForUnidad(unidadBase) : null,
          loteId: null as number | null,
        }
      }
      return {
        articuloId: null as number | null,
        descripcion: (it.descripcion ?? '').trim().slice(0, 120),
        condIva: it.condIva ?? '1',
        unidadServicio: it.unidadServicio ?? null,
        cantidad: it.cantidad,
        precio: it.precio,
        dscto: it.dscto,
        subtotal: it.subtotal,
        monedaOrigen: null as string | null,
        precioOrigen: null as number | null,
        tipoCambioValor: null as number | null,
        unidadMedida: null as string | null,
        codigoAfipUnidad: null as string | null,
        loteId: null as number | null,
      }
    })

    const qtyByArticulo = aggregateItemQuantities(items, tipoById)

    const depositoId =
      inputDepositoId != null
        ? inputDepositoId
        : await getDefaultDepositoId(this.prisma, tenantId)

    if (inputDepositoId != null) {
      const dep = await this.prisma.deposito.findFirst({
        where: { id: inputDepositoId, tenantId, activo: true },
        select: { id: true },
      })
      if (!dep) {
        return { ok: false, status: 400, error: 'depositoId is not valid for this tenant' }
      }
    }

    let stockEval: { insufficient: boolean; alerts: StockBelowMinimumAlert[] }
    if (options?.skipStockDecrement === true) {
      stockEval = { insufficient: false, alerts: [] }
    } else if (depositoId != null && qtyByArticulo.size > 0) {
      const stockRows = await this.prisma.stockDeposito.findMany({
        where: {
          tenantId,
          depositoId,
          articuloId: { in: [...qtyByArticulo.keys()] },
        },
        select: { articuloId: true, cantidad: true },
      })
      const qtyInDeposit = new Map(stockRows.map((r) => [r.articuloId, Number(r.cantidad)]))
      const depositSnapshots = articulos.map((a) => ({
        ...a,
        stock: qtyInDeposit.get(a.id) ?? 0,
      }))
      stockEval = evaluateStockForInvoice(depositSnapshots, qtyByArticulo)
      if (stockEval.insufficient) {
        const elsewhere = await this.prisma.stockDeposito.findMany({
          where: {
            tenantId,
            articuloId: { in: [...qtyByArticulo.keys()] },
            depositoId: { not: depositoId },
            cantidad: { gt: 0 },
          },
          include: { deposito: { select: { codigo: true, nombre: true } } },
        })
        const available = elsewhere
          .map((r) => `${r.deposito.codigo}:${r.cantidad}`)
          .join(', ')
        return {
          ok: false,
          status: 422,
          error: available
            ? `INSUFFICIENT_STOCK_IN_DEPOSITO; available elsewhere: ${available}`
            : 'INSUFFICIENT_STOCK',
        }
      }
    } else {
      stockEval = evaluateStockForInvoice(articulos, qtyByArticulo)
      if (stockEval.insufficient) {
        return { ok: false, status: 422, error: 'INSUFFICIENT_STOCK' }
      }
    }

    if (options?.skipStockDecrement !== true) {
      const recuentoBlock = await assertNoOpenRecuento(this.prisma, tenantId, depositoId)
      if (!recuentoBlock.ok) {
        return recuentoBlock
      }
    }

    const hasControlledArticles = articulos.some(
      (a) => a.controlLote === true && a.tipo !== 'servicio',
    )
    const fefoEnabled =
      hasControlledArticles && (await this.loteService.isFefoEnabled(tenantId))
    const needsLot = fefoEnabled && hasControlledArticles
    if (needsLot && depositoId == null) {
      return { ok: false, status: 422, error: 'DEPOSITO_REQUIRED_FOR_LOTE' }
    }

    const percepcionValidation = await validateFacturaPercepciones(this.prisma, tenantId, {
      neto1: facturaTotals.neto1,
      neto2: facturaTotals.neto2,
      neto3: facturaTotals.neto3,
      iva1: facturaTotals.iva1,
      iva2: facturaTotals.iva2,
      total: facturaTotals.total,
      percepciones: input.percepciones,
    })
    if (!percepcionValidation.ok) {
      return { ok: false, status: percepcionValidation.status, error: percepcionValidation.error }
    }

    const validatedPercepciones = percepcionValidation.lines

    let newFactura: FacturaWithRelations
    let updatedCliente: Pick<Cliente, 'id' | 'rsocial' | 'balance' | 'creditLimit'>

    try {
      const txResult = await this.prisma.$transaction(async (tx) => {
        let itemsForCreate = resolvedItems
        if (needsLot && depositoId != null) {
          const expanded: typeof resolvedItems = []
          for (const line of resolvedItems) {
            if (line.articuloId == null) {
              expanded.push(line)
              continue
            }
            const art = articuloById.get(line.articuloId)
            if (!art || !art.controlLote || art.tipo === 'servicio') {
              expanded.push(line)
              continue
            }
            const allocated = await this.loteService.allocateFefo(
              tx,
              tenantId,
              line.articuloId,
              depositoId,
              line.cantidad,
            )
            if (!allocated.ok) {
              throw new Error(allocated.error)
            }
            const outbound = await this.loteService.applyOutbound(tx, tenantId, allocated.data)
            if (!outbound.ok) {
              throw new Error(outbound.error)
            }
            const n = allocated.data.length
            for (const alloc of allocated.data) {
              const share = alloc.cantidad / line.cantidad
              expanded.push({
                ...line,
                cantidad: roundQty(alloc.cantidad),
                subtotal: roundMoney(line.subtotal * share),
                loteId: alloc.loteId,
              })
            }
            if (n > 1) {
              const sumSub = expanded.slice(-n).reduce((s, it) => s + it.subtotal, 0)
              const drift = roundMoney(line.subtotal - sumSub)
              expanded[expanded.length - 1] = {
                ...expanded[expanded.length - 1],
                subtotal: roundMoney(expanded[expanded.length - 1].subtotal + drift),
              }
            }
          }
          itemsForCreate = expanded
        }

        const created = await tx.factura.create({
          data: {
            ...facturaTotals,
            fecha: facturaFechaToPrismaDate(fecha),
            tenantId,
            ...(depositoId != null ? { depositoId } : {}),
            ...(options?.contratoId !== undefined ? { contratoId: options.contratoId } : {}),
            ...(primaryFx
              ? {
                  tipoCambioId: primaryFx.id,
                  tipoCambioValor: new Decimal(primaryFx.valor),
                  tipoCambioMoneda: primaryFx.moneda,
                  tipoCambioTipo: primaryFx.tipo,
                  tipoCambioFecha: primaryFx.fecha,
                }
              : {}),
            items: { create: itemsForCreate },
          } as Prisma.FacturaUncheckedCreateInput,
          include: { items: true, cliente: true },
        })

        for (const line of validatedPercepciones) {
          await tx.retencionAplicada.create({
            data: {
              tenantId,
              regimenId: line.regimenId,
              tipo: line.subtipo,
              entidadTipo: 'cliente',
              entidadId: clienteId,
              facturaId: created.id,
              baseImponible: new Decimal(line.baseImponible),
              alicuota: new Decimal(line.alicuota),
              importe: new Decimal(line.importe),
              constanciaNum: null,
            },
          })
        }

        const ccService = new ClienteCuentaCorrienteService(tx)
        await ccService.recordFromFactura(tenantId, created, userId)

        const updated = await tx.cliente.findFirstOrThrow({
          where: { id: clienteId },
          select: { id: true, rsocial: true, balance: true, creditLimit: true },
        })

        for (const [articuloId, qty] of qtyByArticulo) {
          if (options?.skipStockDecrement === true) continue
          if (depositoId != null) {
            await applyStockDepositoDelta(tx, {
              tenantId,
              articuloId,
              depositoId,
              delta: -qty,
            })
          } else {
            await tx.articulo.update({
              where: { id: articuloId },
              data: { stock: { decrement: qty } },
            })
          }
        }

        return [created, updated] as const
      })
      newFactura = txResult[0]
      updatedCliente = txResult[1]
    } catch (err) {
      if (
        err instanceof Error &&
        (err.message === 'INSUFFICIENT_LOT_STOCK' || err.message === 'DEPOSITO_REQUIRED_FOR_LOTE')
      ) {
        return { ok: false, status: 422, error: err.message }
      }
      if (err instanceof Error && err.message === 'INSUFFICIENT_DEPOSIT_STOCK') {
        return { ok: false, status: 422, error: 'INSUFFICIENT_STOCK' }
      }
      throw err
    }

    if (options?.skipArcaCae !== true) {
      void this.fiscalDocumentService.authorizeInvoice(tenantId, newFactura.id).catch(() => {
        /* retry: npm run arca:retry-pending (delegates to FiscalDocumentRetryService, #378) */
      })
    }

    try {
      await this.garantiaService.registerFromFactura(
        tenantId,
        newFactura.id,
        clienteId,
        newFactura.fecha,
        newFactura.items.map((fi, index) => ({
          id: fi.id,
          articuloId: fi.articuloId,
          nroSerie: items[index]?.nroSerie,
          nroImei: items[index]?.nroImei,
        })),
      )
    } catch {
      /* Warranty registration must not fail invoice create */
    }

    try {
      await this.fidelizacionService.applyInvoiceEffects(tenantId, {
        facturaId: newFactura.id,
        clienteId,
        total: Number(newFactura.total.toString()),
        items: newFactura.items.map((fi) => ({
          cantidad: Number(fi.cantidad),
          precio: Number(fi.precio.toString()),
          dscto: Number(fi.dscto.toString()),
          subtotal: Number(fi.subtotal.toString()),
          descripcion: fi.descripcion,
        })),
        puntosCanje: puntosCanje ?? null,
        userId,
      })
    } catch {
      /* Loyalty accrual/redemption must not fail invoice create */
    }

    try {
      const formaPagoId = newFactura.formaPagoId
      if (formaPagoId != null) {
        const fp = await this.prisma.formaPago.findUnique({
          where: { id: formaPagoId },
          select: { esEfectivo: true },
        })
        if (fp?.esEfectivo) {
          await this.turnoCajaService.tryRecordAutoMovement({
            tenantId,
            userId,
            tipo: 'venta',
            formaPago: 'efectivo',
            importe: Number(newFactura.total.toString()),
            concepto: `${newFactura.tipo}-${newFactura.prefijo}-${newFactura.numero}`,
            referenciaTipo: 'factura',
            referenciaId: newFactura.id,
          })
        }
      }
    } catch {
      /* Cash drawer posting must not fail invoice create */
    }

    const meliStock = new MeliStockSyncService(this.prisma)
    const tnStock = new TiendanubeStockSyncService(this.prisma)
    const wcStock = new WooCommerceStockSyncService(this.prisma)
    for (const articuloId of qtyByArticulo.keys()) {
      void meliStock.syncStockToMeli(tenantId, articuloId).catch(() => undefined)
      void tnStock.syncStockToTiendanube(tenantId, articuloId).catch(() => undefined)
      void wcStock.syncStockToWooCommerce(tenantId, articuloId).catch(() => undefined)
    }

    try {
      if (await this.farmaciaService.isPharmacyEnabled(tenantId)) {
        await this.farmaciaService.recordDispensacion(tenantId, {
          facturaId: newFactura.id,
          recetaId: recetaId ?? null,
          items: newFactura.items
            .filter((it): it is typeof it & { articuloId: number } => it.articuloId != null)
            .map((it) => ({
              articuloId: it.articuloId,
              cantidad: Number(it.cantidad),
              loteId: it.loteId ?? null,
            })),
        })
      }
    } catch {
      /* Pharmacy book posting must not fail invoice create */
    }

    if (anomalyWarnings.length > 0) {
      await this.anomalyService.persist(
        tenantId,
        newFactura.id,
        clienteId,
        anomalyWarnings,
        confirm,
      )
    }

    return {
      ok: true,
      data: {
        factura: newFactura,
        updatedCliente,
        stockBelowMinimum: stockEval.alerts,
        warnings: anomalyWarnings,
      },
    }
  }

  /**
   * @en Voids an active invoice, creates a credit note, reverses balance, and records audit in one transaction.
   * @es Anula factura vigente, crea nota de crédito, revierte saldo y audita en una transacción.
   * @pt-BR Anula fatura ativa, cria nota de crédito, reverte saldo e audita em uma transação.
   */
  async void(
    tenantId: number,
    id: number,
    motivo: string,
    audit: FacturaVoidAuditContext,
  ): Promise<ServiceResult<FacturaVoidResult>> {
    const factura = await this.prisma.factura.findFirst({
      where: { id, tenantId },
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

    if (!factura) {
      return { ok: false, status: 404, error: 'Factura not found' }
    }

    if (factura.estado !== 'A') {
      return { ok: false, status: 409, error: 'Factura already voided' }
    }

    const notaCreditoEstadoCae = factura.estadoCae === 'issued' ? 'pending' : 'not_required'

    const existingNcSum = await this.prisma.notaCredito.aggregate({
      where: { tenantId, facturaOrigenId: id },
      _sum: { monto: true },
    })
    const creditedSoFar = existingNcSum._sum.monto ?? new Decimal(0)
    const ncMonto = factura.total.sub(creditedSoFar)
    if (ncMonto.lessThanOrEqualTo(0)) {
      return { ok: false, status: 422, error: 'Invoice already fully credited' }
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const voided = await tx.factura.update({
        where: { id },
        data: { estado: 'N' },
      })

      await tx.retencionAplicada.deleteMany({
        where: { tenantId, facturaId: id },
      })

      const notaCredito = await tx.notaCredito.create({
        data: {
          tenantId,
          facturaOrigenId: id,
          motivo,
          monto: ncMonto,
          estadoCae: notaCreditoEstadoCae,
          createdById: audit.userId,
        },
      })

      const facturaRef = `${factura.tipo}-${factura.prefijo}-${factura.numero}`
      const ccService = new ClienteCuentaCorrienteService(tx)
      await ccService.recordFromNotaCredito(
        tenantId,
        notaCredito,
        factura.clienteId,
        facturaRef,
        audit.userId!,
      )

      const updatedCliente = await tx.cliente.findFirstOrThrow({
        where: { id: factura.clienteId },
        select: { id: true, rsocial: true, balance: true, creditLimit: true },
      })

      await tx.auditEvent.create({
        data: {
          tenantId,
          userId: audit.userId,
          action: 'factura_void',
          resource: 'factura',
          resourceId: String(id),
          ipAddress: audit.ipAddress,
          metadata: { motivo, notaCreditoId: notaCredito.id },
        },
      })

      return { factura: voided, notaCredito, updatedCliente }
    })

    if (factura.estadoCae === 'issued') {
      void this.fiscalDocumentService.authorizeCreditNote(tenantId, result.notaCredito.id).catch(() => {
        /* homologación mock; retry job may be added later */
      })
    }

    try {
      await this.fidelizacionService.revertirFromFactura(tenantId, id, audit.userId)
    } catch {
      /* Loyalty reversal must not fail invoice void */
    }

    return { ok: true, data: result }
  }

  /**
   * @en Issues a partial credit note for an active invoice without voiding it (#344).
   * @es Emite nota de crédito parcial sobre factura vigente sin anularla (#344).
   * @pt-BR Emite nota de crédito parcial sobre fatura ativa sem anulá-la (#344).
   */
  async createPartialCreditNote(
    tenantId: number,
    id: number,
    monto: Decimal,
    motivo: string,
    audit: FacturaVoidAuditContext,
  ): Promise<ServiceResult<FacturaPartialCreditNoteResult>> {
    const factura = await this.prisma.factura.findFirst({
      where: { id, tenantId },
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

    if (!factura) {
      return { ok: false, status: 404, error: 'Factura not found' }
    }

    if (factura.estado !== 'A') {
      return { ok: false, status: 409, error: 'Factura is not active' }
    }

    const montoDec = monto instanceof Decimal ? monto : new Decimal(monto)
    if (montoDec.lessThanOrEqualTo(0)) {
      return { ok: false, status: 422, error: 'Credit note amount must be positive' }
    }
    if (montoDec.greaterThan(factura.total)) {
      return { ok: false, status: 422, error: 'Credit note amount exceeds invoice total' }
    }

    const existingNcSum = await this.prisma.notaCredito.aggregate({
      where: { tenantId, facturaOrigenId: id },
      _sum: { monto: true },
    })
    const creditedSoFar = existingNcSum._sum.monto ?? new Decimal(0)
    if (creditedSoFar.add(montoDec).greaterThan(factura.total)) {
      return { ok: false, status: 422, error: 'Total credit notes would exceed invoice total' }
    }

    const notaCreditoEstadoCae = factura.estadoCae === 'issued' ? 'pending' : 'not_required'

    const result = await this.prisma.$transaction(async (tx) => {
      const notaCredito = await tx.notaCredito.create({
        data: {
          tenantId,
          facturaOrigenId: id,
          motivo,
          monto: montoDec,
          estadoCae: notaCreditoEstadoCae,
          createdById: audit.userId,
        },
      })

      const facturaRef = `${factura.tipo}-${factura.prefijo}-${factura.numero}`
      const ccService = new ClienteCuentaCorrienteService(tx)
      await ccService.recordFromNotaCredito(
        tenantId,
        notaCredito,
        factura.clienteId,
        facturaRef,
        audit.userId!,
      )

      const updatedCliente = await tx.cliente.findFirstOrThrow({
        where: { id: factura.clienteId },
        select: { id: true, rsocial: true, balance: true, creditLimit: true },
      })

      await tx.auditEvent.create({
        data: {
          tenantId,
          userId: audit.userId,
          action: 'factura_partial_credit_note',
          resource: 'factura',
          resourceId: String(id),
          ipAddress: audit.ipAddress,
          metadata: { motivo, notaCreditoId: notaCredito.id, monto: montoDec.toFixed(2) },
        },
      })

      return { notaCredito, updatedCliente }
    })

    if (factura.estadoCae === 'issued') {
      void this.fiscalDocumentService.authorizeCreditNote(tenantId, result.notaCredito.id).catch(() => {
        /* homologaci?n mock; retry job may be added later */
      })
    }

    return { ok: true, data: result }
  }
}
