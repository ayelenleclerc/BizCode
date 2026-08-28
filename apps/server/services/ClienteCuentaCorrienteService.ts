import type {
  Cobro,
  Factura,
  MovimientoClienteCC,
  NotaCredito,
  Prisma,
  PrismaClient,
} from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import type { SaldoPorMoneda } from '@bizcode/types'
import { LOCAL_CURRENCY } from '@bizcode/types'
import { NotFoundAppError, ValidationAppError } from '../errors/AppError'
import { groupSaldosByMoneda } from './exportOperationMath'
import {
  AGING_BUCKET_LABELS,
  bucketLabelForDaysPastDue,
  computeDaysPastDue,
  type AgingBucketLabel,
  type CuentaCorrienteLine,
  type CuentaCorrienteResult,
} from './ReportesFinancierosService'

export type MovimientoClienteCCTipo =
  | 'saldo_inicial'
  | 'factura'
  | 'nota_credito'
  | 'cobro'
  | 'retencion'
  | 'percepcion'
  | 'cheque_rechazado'
  | 'ajuste'

type DbClient = PrismaClient | Prisma.TransactionClient

function decimalToMoneyString(value: Decimal | number): string {
  const n = typeof value === 'number' ? value : value.toNumber()
  return n.toFixed(2)
}

function toDecimal(value: number | Decimal): Decimal {
  return value instanceof Decimal ? value : new Decimal(value)
}

export type MovimientoClienteCCRow = {
  id: number
  tipo: MovimientoClienteCCTipo
  referencia: string | null
  monto: string
  /**
   * @en ISO-4217 currency of the entry; foreign balances never mix with the local one (#206).
   * @es Moneda ISO-4217 del asiento; los saldos extranjeros no se mezclan con el local (#206).
   * @pt-BR Moeda ISO-4217 do lançamento; saldos estrangeiros não se misturam com o local (#206).
   */
  moneda: string
  saldoPost: string
  fecha: string
  usuarioId: number
  notas: string | null
  facturaId?: number
  cobroId?: number
  notaCreditoId?: number
  chequeId?: number
  retencionAplicadaId?: number
}

export type ClienteCuentaCorrienteChartPoint = {
  period: string
  saldo: string
}

export type ClienteCuentaCorrienteResult = {
  clienteId: number
  codigo: number
  rsocial: string
  saldo: string
  creditLimit: string | null
  excedeLimite: boolean
  movimientos: MovimientoClienteCCRow[]
  serie: ClienteCuentaCorrienteChartPoint[]
  total: number
  limit: number
  offset: number
}

export type ClienteCuentaCorrienteSaldoResult = {
  clienteId: number
  saldo: string
  creditLimit: string | null
  excedeLimite: boolean
  /**
   * @en Running balance per currency (#206); the local currency drives `saldo` and the credit limit.
   * @es Saldo corrido por moneda (#206); la moneda local es la que alimenta `saldo` y el límite de crédito.
   * @pt-BR Saldo corrente por moeda (#206); a moeda local alimenta `saldo` e o limite de crédito.
   */
  saldosPorMoneda: SaldoPorMoneda[]
}

export type ClienteCuentaCorrienteAntiguedadBucket = {
  label: '0-30' | '31-60' | '61-90' | '+90'
  total: string
}

export type ClienteCuentaCorrienteAntiguedadResult = {
  clienteId: number
  /**
   * @en Currency the buckets are expressed in (#206).
   * @es Moneda en que se expresan los tramos (#206).
   * @pt-BR Moeda em que as faixas são expressas (#206).
   */
  moneda: string
  buckets: ClienteCuentaCorrienteAntiguedadBucket[]
  totalPendiente: string
}

export type ClienteCuentaCorrienteFilters = {
  tipo?: MovimientoClienteCCTipo
  from?: Date
  to?: Date
  limit?: number
  offset?: number
}

export type ClienteEstadoCuentaPdfRow = {
  fecha: string
  tipo: string
  referencia: string
  debito: string
  credito: string
  saldo: string
}

export type ClienteEstadoCuentaPdfData = {
  cliente: { codigo: number; rsocial: string; cuit: string | null }
  empresa: { nombre: string; cuit: string | null; domicilio: string | null }
  desde: string
  hasta: string
  saldo: string
  lineas: ClienteEstadoCuentaPdfRow[]
}

const ANTIGUEDAD_LABEL_MAP: Record<AgingBucketLabel, ClienteCuentaCorrienteAntiguedadBucket['label']> =
  {
    '0-30d': '0-30',
    '31-60d': '31-60',
    '61-90d': '61-90',
    '>90d': '+90',
  }

/**
 * @en Customer accounts-receivable ledger with running balance (#232).
 * @es Libro de cuenta corriente de cliente con saldo corrido (#232).
 * @pt-BR Razão de conta corrente de cliente com saldo corrido (#232).
 */
export class ClienteCuentaCorrienteService {
  constructor(private readonly db: DbClient) {}

  private mapRow(row: MovimientoClienteCC): MovimientoClienteCCRow {
    return {
      id: row.id,
      tipo: row.tipo as MovimientoClienteCCTipo,
      referencia: row.referencia,
      monto: decimalToMoneyString(row.monto),
      moneda: row.moneda,
      saldoPost: decimalToMoneyString(row.saldoPost),
      fecha: row.fecha.toISOString(),
      usuarioId: row.usuarioId,
      notas: row.notas,
      ...(row.facturaId != null ? { facturaId: row.facturaId } : {}),
      ...(row.cobroId != null ? { cobroId: row.cobroId } : {}),
      ...(row.notaCreditoId != null ? { notaCreditoId: row.notaCreditoId } : {}),
      ...(row.chequeId != null ? { chequeId: row.chequeId } : {}),
      ...(row.retencionAplicadaId != null ? { retencionAplicadaId: row.retencionAplicadaId } : {}),
    }
  }

  private computeExcedeLimite(saldo: Decimal, creditLimit: Decimal | null): boolean {
    if (creditLimit == null) return false
    return saldo.greaterThan(creditLimit)
  }

  /**
   * @en Running balance for a currency; defaults to the local one so pre-#206 callers are unaffected.
   * @es Saldo corrido de una moneda; por defecto la local, para no afectar a los llamadores previos a #206.
   * @pt-BR Saldo corrente de uma moeda; por padrão a local, para não afetar chamadores anteriores a #206.
   */
  async getLastSaldo(
    tenantId: number,
    clienteId: number,
    moneda: string = LOCAL_CURRENCY,
  ): Promise<Decimal> {
    const last = await this.db.movimientoClienteCC.findFirst({
      where: { tenantId, clienteId, moneda },
      orderBy: [{ fecha: 'desc' }, { id: 'desc' }],
      select: { saldoPost: true },
    })
    return last?.saldoPost ?? new Decimal(0)
  }

  /**
   * @en Aggregates the ledger by currency so a USD invoice never contaminates the ARS balance (#206).
   * @es Agrega el libro por moneda para que una factura en USD no contamine el saldo en ARS (#206).
   * @pt-BR Agrega o razão por moeda para que uma fatura em USD não contamine o saldo em ARS (#206).
   */
  async getSaldosPorMoneda(tenantId: number, clienteId: number): Promise<SaldoPorMoneda[]> {
    const movimientos = await this.db.movimientoClienteCC.findMany({
      where: { tenantId, clienteId },
      select: { moneda: true, monto: true },
    })
    return groupSaldosByMoneda(
      movimientos.map((m) => ({ moneda: m.moneda, monto: m.monto.toNumber() })),
    ).map((row) => ({ moneda: row.moneda, saldo: row.saldo.toFixed(2) }))
  }

  private async syncClienteBalance(
    tenantId: number,
    clienteId: number,
    saldoPost: Decimal,
  ): Promise<void> {
    await this.db.cliente.updateMany({
      where: { id: clienteId, tenantId },
      data: { balance: saldoPost },
    })
  }

  async recordMovimiento(params: {
    tenantId: number
    clienteId: number
    tipo: MovimientoClienteCCTipo
    monto: number | Decimal
    /**
     * @en ISO-4217 currency of the entry; defaults to the local currency (#206).
     * @es Moneda ISO-4217 del asiento; por defecto la moneda local (#206).
     * @pt-BR Moeda ISO-4217 do lançamento; por padrão a moeda local (#206).
     */
    moneda?: string | null
    referencia?: string | null
    fecha: Date
    usuarioId: number
    notas?: string | null
    facturaId?: number | null
    cobroId?: number | null
    notaCreditoId?: number | null
    chequeId?: number | null
    retencionAplicadaId?: number | null
    reciboCobroId?: number | null
    skipBalanceSync?: boolean
  }): Promise<MovimientoClienteCC> {
    const idempotencyChecks: Array<{ field: keyof MovimientoClienteCC; value: number }> = []
    if (params.facturaId != null) idempotencyChecks.push({ field: 'facturaId', value: params.facturaId })
    if (params.cobroId != null) idempotencyChecks.push({ field: 'cobroId', value: params.cobroId })
    if (params.notaCreditoId != null) {
      idempotencyChecks.push({ field: 'notaCreditoId', value: params.notaCreditoId })
    }
    if (params.chequeId != null) idempotencyChecks.push({ field: 'chequeId', value: params.chequeId })
    if (params.retencionAplicadaId != null) {
      idempotencyChecks.push({ field: 'retencionAplicadaId', value: params.retencionAplicadaId })
    }
    if (params.reciboCobroId != null) {
      idempotencyChecks.push({ field: 'reciboCobroId', value: params.reciboCobroId })
    }

    for (const check of idempotencyChecks) {
      const existing = await this.db.movimientoClienteCC.findFirst({
        where: { tenantId: params.tenantId, [check.field]: check.value },
      })
      if (existing) return existing
    }

    const montoDec = toDecimal(params.monto)
    const moneda = params.moneda?.trim().toUpperCase() || LOCAL_CURRENCY
    const prev = await this.getLastSaldo(params.tenantId, params.clienteId, moneda)
    const saldoPost = prev.plus(montoDec)

    const mov = await this.db.movimientoClienteCC.create({
      data: {
        tenantId: params.tenantId,
        clienteId: params.clienteId,
        tipo: params.tipo,
        referencia: params.referencia ?? null,
        monto: montoDec,
        moneda,
        saldoPost,
        fecha: params.fecha,
        usuarioId: params.usuarioId,
        notas: params.notas ?? null,
        facturaId: params.facturaId ?? null,
        cobroId: params.cobroId ?? null,
        notaCreditoId: params.notaCreditoId ?? null,
        chequeId: params.chequeId ?? null,
        retencionAplicadaId: params.retencionAplicadaId ?? null,
        reciboCobroId: params.reciboCobroId ?? null,
      },
    })

    // Cliente.balance mirrors the local-currency ledger only (#206).
    if (!params.skipBalanceSync && moneda === LOCAL_CURRENCY) {
      await this.syncClienteBalance(params.tenantId, params.clienteId, saldoPost)
    }

    return mov
  }

  async recordFromFactura(
    tenantId: number,
    factura: Pick<Factura, 'id' | 'clienteId' | 'tipo' | 'prefijo' | 'numero' | 'total' | 'fecha' | 'estado'> &
      Partial<Pick<Factura, 'monedaOperacion' | 'totalMonedaOperacion'>>,
    usuarioId: number,
  ): Promise<MovimientoClienteCC> {
    if (factura.estado !== 'A') {
      throw new ValidationAppError('Factura must be active to post ledger movement')
    }
    const ref = `${factura.tipo}-${factura.prefijo}-${factura.numero}`
    // Export invoices post in their own currency so balances stay separated (#206).
    const moneda = factura.monedaOperacion ?? LOCAL_CURRENCY
    const monto =
      moneda !== LOCAL_CURRENCY && factura.totalMonedaOperacion != null
        ? factura.totalMonedaOperacion
        : factura.total
    return this.recordMovimiento({
      tenantId,
      clienteId: factura.clienteId,
      tipo: 'factura',
      monto,
      moneda,
      referencia: ref,
      fecha: factura.fecha,
      usuarioId,
      facturaId: factura.id,
    })
  }

  async recordFromNotaCredito(
    tenantId: number,
    notaCredito: Pick<NotaCredito, 'id' | 'monto' | 'createdAt'>,
    clienteId: number,
    facturaRef: string,
    usuarioId: number,
  ): Promise<MovimientoClienteCC> {
    return this.recordMovimiento({
      tenantId,
      clienteId,
      tipo: 'nota_credito',
      monto: toDecimal(notaCredito.monto).negated(),
      referencia: facturaRef,
      fecha: notaCredito.createdAt,
      usuarioId,
      notaCreditoId: notaCredito.id,
    })
  }

  async recordFromCobro(
    tenantId: number,
    cobro: Pick<Cobro, 'id' | 'clienteId' | 'fecha' | 'monto' | 'referencia'>,
    montoBruto: number | Decimal,
    usuarioId: number,
  ): Promise<MovimientoClienteCC> {
    return this.recordMovimiento({
      tenantId,
      clienteId: cobro.clienteId,
      tipo: 'cobro',
      monto: toDecimal(montoBruto).negated(),
      referencia: cobro.referencia?.trim() || `cobro-${cobro.id}`,
      fecha: cobro.fecha,
      usuarioId,
      cobroId: cobro.id,
    })
  }

  async recordFromReciboCobro(
    tenantId: number,
    recibo: Pick<{ id: number; clienteId: number; fecha: Date; numero: number }, 'id' | 'clienteId' | 'fecha' | 'numero'>,
    montoBruto: number | Decimal,
    usuarioId: number,
  ): Promise<MovimientoClienteCC> {
    return this.recordMovimiento({
      tenantId,
      clienteId: recibo.clienteId,
      tipo: 'cobro',
      monto: toDecimal(montoBruto).negated(),
      referencia: `RC-${recibo.numero}`,
      fecha: recibo.fecha,
      usuarioId,
      reciboCobroId: recibo.id,
    })
  }

  async recordChequeRechazado(
    tenantId: number,
    clienteId: number,
    chequeId: number,
    monto: Decimal,
    referencia: string,
    usuarioId: number,
  ): Promise<MovimientoClienteCC> {
    return this.recordMovimiento({
      tenantId,
      clienteId,
      tipo: 'cheque_rechazado',
      monto,
      referencia,
      fecha: new Date(),
      usuarioId,
      notas: 'Cheque rechazado — movimiento compensatorio',
      chequeId,
    })
  }

  buildChartSeries(movimientos: MovimientoClienteCC[]): ClienteCuentaCorrienteChartPoint[] {
    const keys: string[] = []
    const now = new Date()
    for (let i = 5; i >= 0; i -= 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const month = String(d.getMonth() + 1).padStart(2, '0')
      keys.push(`${d.getFullYear()}-${month}`)
    }

    const sorted = [...movimientos].sort((a, b) => {
      if (a.fecha.getTime() !== b.fecha.getTime()) return a.fecha.getTime() - b.fecha.getTime()
      return a.id - b.id
    })

    return keys.map((period) => {
      const [y, m] = period.split('-').map((v) => Number.parseInt(v, 10))
      const end = new Date(y, m, 0, 23, 59, 59, 999)
      let saldo = new Decimal(0)
      for (const mov of sorted) {
        if (mov.fecha.getTime() <= end.getTime()) {
          saldo = mov.saldoPost
        }
      }
      return { period, saldo: decimalToMoneyString(saldo) }
    })
  }

  async getSaldo(tenantId: number, clienteId: number): Promise<ClienteCuentaCorrienteSaldoResult | null> {
    const cliente = await this.db.cliente.findFirst({
      where: { id: clienteId, tenantId },
      select: { id: true, creditLimit: true },
    })
    if (!cliente) return null

    const [saldo, saldosPorMoneda] = await Promise.all([
      this.getLastSaldo(tenantId, clienteId),
      this.getSaldosPorMoneda(tenantId, clienteId),
    ])
    const limite = cliente.creditLimit

    return {
      clienteId: cliente.id,
      saldo: decimalToMoneyString(saldo),
      creditLimit: limite != null ? decimalToMoneyString(limite) : null,
      excedeLimite: this.computeExcedeLimite(saldo, limite),
      saldosPorMoneda,
    }
  }

  async getStatement(
    tenantId: number,
    clienteId: number,
    filters: ClienteCuentaCorrienteFilters = {},
  ): Promise<ClienteCuentaCorrienteResult | null> {
    const cliente = await this.db.cliente.findFirst({
      where: { id: clienteId, tenantId },
      select: { id: true, codigo: true, rsocial: true, creditLimit: true },
    })
    if (!cliente) return null

    const where: Prisma.MovimientoClienteCCWhereInput = {
      tenantId,
      clienteId,
      ...(filters.tipo ? { tipo: filters.tipo } : {}),
      ...(filters.from || filters.to
        ? {
            fecha: {
              ...(filters.from ? { gte: filters.from } : {}),
              ...(filters.to ? { lte: filters.to } : {}),
            },
          }
        : {}),
    }

    const limit = Math.min(Math.max(filters.limit ?? 100, 1), 500)
    const offset = Math.max(filters.offset ?? 0, 0)

    const [total, movimientos, allForChart] = await Promise.all([
      this.db.movimientoClienteCC.count({ where }),
      this.db.movimientoClienteCC.findMany({
        where,
        orderBy: [{ fecha: 'desc' }, { id: 'desc' }],
        take: limit,
        skip: offset,
      }),
      this.db.movimientoClienteCC.findMany({
        where: { tenantId, clienteId },
        orderBy: [{ fecha: 'asc' }, { id: 'asc' }],
      }),
    ])

    const saldo = await this.getLastSaldo(tenantId, clienteId)

    return {
      clienteId: cliente.id,
      codigo: cliente.codigo,
      rsocial: cliente.rsocial,
      saldo: decimalToMoneyString(saldo),
      creditLimit: cliente.creditLimit != null ? decimalToMoneyString(cliente.creditLimit) : null,
      excedeLimite: this.computeExcedeLimite(saldo, cliente.creditLimit),
      movimientos: movimientos.map((m) => this.mapRow(m)),
      serie: this.buildChartSeries(allForChart),
      total,
      limit,
      offset,
    }
  }

  mapToLegacyCuentaCorriente(
    cliente: { id: number; codigo: number; rsocial: string; balance: Decimal },
    movimientos: MovimientoClienteCC[],
  ): CuentaCorrienteResult {
    const sorted = [...movimientos].sort((a, b) => {
      if (a.fecha.getTime() !== b.fecha.getTime()) return a.fecha.getTime() - b.fecha.getTime()
      return a.id - b.id
    })

    const lineas: CuentaCorrienteLine[] = sorted.map((m) => {
      const monto = m.monto.toNumber()
      const debito = monto > 0 ? decimalToMoneyString(monto) : '0.00'
      const credito = monto < 0 ? decimalToMoneyString(Math.abs(monto)) : '0.00'
      const tipo = this.mapTipoToLegacy(m.tipo as MovimientoClienteCCTipo)
      return {
        tipo,
        fecha: m.fecha.toISOString(),
        referencia: m.referencia ?? m.tipo,
        debito,
        credito,
        saldo: decimalToMoneyString(m.saldoPost),
        ...(m.facturaId != null ? { facturaId: m.facturaId } : {}),
        ...(m.cobroId != null ? { cobroId: m.cobroId } : {}),
      }
    })

    return {
      clienteId: cliente.id,
      codigo: cliente.codigo,
      rsocial: cliente.rsocial,
      balanceActual: decimalToMoneyString(cliente.balance),
      lineas,
    }
  }

  private mapTipoToLegacy(
    tipo: MovimientoClienteCCTipo,
  ): CuentaCorrienteLine['tipo'] | 'nota_credito' | 'retencion' | 'percepcion' | 'cheque_rechazado' | 'ajuste' {
    if (tipo === 'saldo_inicial') return 'saldo_inicial'
    if (tipo === 'factura') return 'factura'
    if (tipo === 'cobro') return 'cobro'
    return tipo
  }

  async getLegacyCuentaCorriente(
    tenantId: number,
    clienteId: number,
  ): Promise<CuentaCorrienteResult | null> {
    const cliente = await this.db.cliente.findFirst({
      where: { id: clienteId, tenantId },
      select: { id: true, codigo: true, rsocial: true, balance: true },
    })
    if (!cliente) return null

    const movimientos = await this.db.movimientoClienteCC.findMany({
      where: { tenantId, clienteId },
      orderBy: [{ fecha: 'asc' }, { id: 'asc' }],
    })

    return this.mapToLegacyCuentaCorriente(cliente, movimientos)
  }

  /**
   * @en Aging is computed per currency (#206); the local currency also covers invoices with no export data.
   * @es La antigüedad se calcula por moneda (#206); la local abarca además las facturas sin datos de exportación.
   * @pt-BR A antiguidade é calculada por moeda (#206); a local abrange também faturas sem dados de exportação.
   */
  async getAntiguedad(
    tenantId: number,
    clienteId: number,
    asOf: Date = new Date(),
    moneda: string = LOCAL_CURRENCY,
  ): Promise<ClienteCuentaCorrienteAntiguedadResult | null> {
    const cliente = await this.db.cliente.findFirst({
      where: { id: clienteId, tenantId },
      select: { id: true, creditDays: true },
    })
    if (!cliente) return null

    const normalizedMoneda = moneda.trim().toUpperCase() || LOCAL_CURRENCY
    const isLocal = normalizedMoneda === LOCAL_CURRENCY
    const rows = await this.db.factura.findMany({
      where: {
        tenantId,
        clienteId,
        estado: 'A',
        ...(isLocal
          ? { OR: [{ monedaOperacion: null }, { monedaOperacion: LOCAL_CURRENCY }] }
          : { monedaOperacion: normalizedMoneda }),
      },
      select: { id: true, total: true, totalMonedaOperacion: true, fecha: true },
    })
    const facturas = rows.map((row) => ({
      id: row.id,
      fecha: row.fecha,
      total: isLocal ? row.total : (row.totalMonedaOperacion ?? row.total),
    }))

    const facturaIds = facturas.map((f) => f.id)
    const allocations =
      facturaIds.length > 0
        ? await this.db.reciboCobroImputacion.groupBy({
            by: ['facturaId'],
            where: {
              facturaId: { in: facturaIds },
              reciboCobro: { tenantId, clienteId, estado: 'emitido' },
            },
            _sum: { importe: true },
          })
        : []
    const paidMap = new Map<number, Decimal>()
    for (const row of allocations) {
      if (row._sum.importe != null) {
        paidMap.set(row.facturaId, row._sum.importe)
      }
    }

    const bucketTotals = new Map<AgingBucketLabel, number>()
    for (const label of AGING_BUCKET_LABELS) {
      bucketTotals.set(label, 0)
    }

    let totalPendiente = 0
    for (const inv of facturas) {
      const pagado = paidMap.get(inv.id) ?? new Decimal(0)
      const pendiente = inv.total.minus(pagado)
      if (pendiente.lessThanOrEqualTo(0)) continue
      const amount = pendiente.toNumber()
      totalPendiente += amount
      const days = computeDaysPastDue(inv.fecha, cliente.creditDays, asOf)
      const label = bucketLabelForDaysPastDue(days)
      bucketTotals.set(label, (bucketTotals.get(label) ?? 0) + amount)
    }

    const buckets: ClienteCuentaCorrienteAntiguedadBucket[] = AGING_BUCKET_LABELS.map((label) => ({
      label: ANTIGUEDAD_LABEL_MAP[label],
      total: (bucketTotals.get(label) ?? 0).toFixed(2),
    }))

    return {
      clienteId: cliente.id,
      moneda: normalizedMoneda,
      buckets,
      totalPendiente: totalPendiente.toFixed(2),
    }
  }

  async getEstadoCuentaPdfData(
    tenantId: number,
    clienteId: number,
    from?: Date,
    to?: Date,
  ): Promise<ClienteEstadoCuentaPdfData | null> {
    const cliente = await this.db.cliente.findFirst({
      where: { id: clienteId, tenantId },
      select: { codigo: true, rsocial: true, cuit: true },
    })
    if (!cliente) return null

    const empresa = await this.db.paramEmpresa.findFirst({
      where: { tenantId },
      select: { nombre: true, cuit: true, domicilio: true },
    })

    const where: Prisma.MovimientoClienteCCWhereInput = {
      tenantId,
      clienteId,
      ...(from || to
        ? {
            fecha: {
              ...(from ? { gte: from } : {}),
              ...(to ? { lte: to } : {}),
            },
          }
        : {}),
    }

    const movimientos = await this.db.movimientoClienteCC.findMany({
      where,
      orderBy: [{ fecha: 'asc' }, { id: 'asc' }],
    })

    const saldo = await this.getLastSaldo(tenantId, clienteId)

    const lineas: ClienteEstadoCuentaPdfRow[] = movimientos.map((m) => {
      const monto = m.monto.toNumber()
      return {
        fecha: m.fecha.toLocaleDateString('es-AR'),
        tipo: m.tipo,
        referencia: m.referencia ?? '—',
        debito: monto > 0 ? decimalToMoneyString(monto) : '0.00',
        credito: monto < 0 ? decimalToMoneyString(Math.abs(monto)) : '0.00',
        saldo: decimalToMoneyString(m.saldoPost),
      }
    })

    return {
      cliente: { codigo: cliente.codigo, rsocial: cliente.rsocial, cuit: cliente.cuit },
      empresa: {
        nombre: empresa?.nombre ?? '—',
        cuit: empresa?.cuit ?? null,
        domicilio: empresa?.domicilio ?? null,
      },
      desde: from ? from.toLocaleDateString('es-AR') : '—',
      hasta: to ? to.toLocaleDateString('es-AR') : '—',
      saldo: decimalToMoneyString(saldo),
      lineas,
    }
  }

  async createAjuste(
    tenantId: number,
    clienteId: number,
    usuarioId: number,
    monto: number,
    motivo: string,
  ): Promise<MovimientoClienteCCRow> {
    const motivoTrim = motivo.trim()
    if (!motivoTrim) {
      throw new ValidationAppError('motivo is required')
    }

    const cliente = await this.db.cliente.findFirst({
      where: { id: clienteId, tenantId },
      select: { id: true },
    })
    if (!cliente) {
      throw new NotFoundAppError('Cliente not found')
    }

    if (!Number.isFinite(monto) || monto === 0) {
      throw new ValidationAppError('monto must be a non-zero number')
    }

    const mov = await this.recordMovimiento({
      tenantId,
      clienteId,
      tipo: 'ajuste',
      monto,
      referencia: 'ajuste_manual',
      fecha: new Date(),
      usuarioId,
      notas: motivoTrim,
    })
    return this.mapRow(mov)
  }
}
