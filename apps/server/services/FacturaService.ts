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
import { ArcaService } from '../fiscal/ar/ArcaService'
import { validateFacturaPercepciones } from './RetencionFacturaValidation'
import { ClienteCuentaCorrienteService } from './ClienteCuentaCorrienteService'
import { GarantiaService } from './GarantiaService'
import { TurnoCajaService } from './TurnoCajaService'

type FacturaWithRelations = Prisma.FacturaGetPayload<{ include: { cliente: true; items: true } }>

export type FacturaListResult = {
  total: number
  facturas: FacturaWithRelations[]
}

export type FacturaCreateResult = {
  factura: FacturaWithRelations
  updatedCliente: Pick<Cliente, 'id' | 'rsocial' | 'balance' | 'creditLimit'>
  stockBelowMinimum: StockBelowMinimumAlert[]
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
}
/**
 * @en Invoice domain operations (list, create, void).
 * @es Operaciones de dominio de facturas (listado, alta, anulaci?n).
 * @pt-BR Opera??es de dom?nio de faturas (listagem, cria??o, anula??o).
 */
export class FacturaService {
  private readonly arca: ArcaService
  private readonly garantiaService: GarantiaService
  private readonly turnoCajaService: TurnoCajaService

  constructor(private readonly prisma: PrismaClient) {
    this.arca = new ArcaService(prisma)
    this.garantiaService = new GarantiaService(prisma)
    this.turnoCajaService = new TurnoCajaService(prisma)
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
    const { items, fecha, depositoId: inputDepositoId, ...factura } = input
    const clienteId = factura.clienteId

    const catalogIds = [
      ...new Set(
        items
          .map((it) => it.articuloId)
          .filter((id): id is number => typeof id === 'number' && id >= 1),
      ),
    ]
    const articulos =
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
              esPadre: true,
              monedaPrecio: true,
              precioEnMonedaOrigen: true,
            },
          })
        : []
    if (articulos.length !== catalogIds.length) {
      return {
        ok: false,
        status: 400,
        error: 'One or more articuloId values are not valid for this tenant',
      }
    }
    if (articulos.some((a) => a.esPadre)) {
      return {
        ok: false,
        status: 400,
        error: 'Parent articles cannot be sold; select a variant instead',
      }
    }

    const articuloById = new Map(articulos.map((a) => [a.id, a]))
    const tipoById = new Map(articulos.map((a) => [a.id, a.tipo]))

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
    if (depositoId != null && qtyByArticulo.size > 0) {
      const stockRows = await this.prisma.stockDeposito.findMany({
        where: {
          tenantId,
          depositoId,
          articuloId: { in: [...qtyByArticulo.keys()] },
        },
        select: { articuloId: true, cantidad: true },
      })
      const qtyInDeposit = new Map(stockRows.map((r) => [r.articuloId, r.cantidad]))
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

    const recuentoBlock = await assertNoOpenRecuento(this.prisma, tenantId, depositoId)
    if (!recuentoBlock.ok) {
      return recuentoBlock
    }

    const percepcionValidation = await validateFacturaPercepciones(this.prisma, tenantId, {
      neto1: factura.neto1,
      neto2: factura.neto2,
      neto3: factura.neto3,
      iva1: factura.iva1,
      iva2: factura.iva2,
      total: factura.total,
      percepciones: input.percepciones,
    })
    if (!percepcionValidation.ok) {
      return { ok: false, status: percepcionValidation.status, error: percepcionValidation.error }
    }

    const validatedPercepciones = percepcionValidation.lines

    const [newFactura, updatedCliente] = await this.prisma.$transaction(async (tx) => {
      const created = await tx.factura.create({
        data: {
          ...factura,
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
          items: { create: resolvedItems },
        } as Parameters<typeof this.prisma.factura.create>[0]['data'],
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

    if (options?.skipArcaCae !== true) {
      void this.arca.requestCaeForFactura(tenantId, newFactura.id).catch(() => {
        /* retry: npm run arca:retry-pending */
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

    return {
      ok: true,
      data: {
        factura: newFactura,
        updatedCliente,
        stockBelowMinimum: stockEval.alerts,
      },
    }
  }

  /**
   * @en Voids an active invoice, creates a credit note, reverses balance, and records audit in one transaction.
   * @es Anula factura vigente, crea nota de cr?dito, revierte saldo y audita en una transacci?n.
   * @pt-BR Anula fatura ativa, cria nota de cr?dito, reverte saldo e audita em uma transa??o.
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
      void this.arca.requestCaeForNotaCredito(tenantId, result.notaCredito.id).catch(() => {
        /* homologaci?n mock; retry job may be added later */
      })
    }

    return { ok: true, data: result }
  }

  /**
   * @en Issues a partial credit note for an active invoice without voiding it (#344).
   * @es Emite nota de cr?dito parcial sobre factura vigente sin anularla (#344).
   * @pt-BR Emite nota de cr?dito parcial sobre fatura ativa sem anul?-la (#344).
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
      void this.arca.requestCaeForNotaCredito(tenantId, result.notaCredito.id).catch(() => {
        /* homologaci?n mock; retry job may be added later */
      })
    }

    return { ok: true, data: result }
  }
}
