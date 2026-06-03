import type { ComprobanteCompra, MovimientoProveedorCC, Prisma, PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { NotFoundAppError, ValidationAppError } from '../errors/AppError'

export type MovimientoProveedorCCTipo = 'factura_compra' | 'pago' | 'nc_proveedor' | 'ajuste'

type DbClient = PrismaClient | Prisma.TransactionClient

function decimalToMoneyString(value: Decimal | number): string {
  const n = typeof value === 'number' ? value : value.toNumber()
  return n.toFixed(2)
}

function toDecimal(value: number | Decimal): Decimal {
  return value instanceof Decimal ? value : new Decimal(value)
}

export type MovimientoProveedorCCRow = {
  id: number
  tipo: MovimientoProveedorCCTipo
  referencia: string | null
  monto: string
  saldoPost: string
  fecha: string
  usuarioId: number
  notas: string | null
}

export type ProveedorCuentaCorrienteChartPoint = {
  period: string
  saldo: string
}

export type ProveedorCuentaCorrienteResult = {
  proveedorId: number
  codigo: number
  rsocial: string
  saldo: string
  limiteCredito: string | null
  excedeLimite: boolean
  movimientos: MovimientoProveedorCCRow[]
  serie: ProveedorCuentaCorrienteChartPoint[]
}

export type ProveedorCuentaCorrienteSaldoResult = {
  proveedorId: number
  saldo: string
  limiteCredito: string | null
  excedeLimite: boolean
}

export type ProveedorCuentaCorrienteFilters = {
  tipo?: MovimientoProveedorCCTipo
  from?: Date
  to?: Date
}

/**
 * @en Supplier accounts-payable ledger with running balance (#270).
 * @es Libro de cuenta corriente de proveedor con saldo corrido (#270).
 * @pt-BR Razão de conta corrente de fornecedor com saldo corrido (#270).
 */
export class ProveedorCuentaCorrienteService {
  constructor(private readonly db: DbClient) {}

  private mapRow(row: MovimientoProveedorCC): MovimientoProveedorCCRow {
    return {
      id: row.id,
      tipo: row.tipo as MovimientoProveedorCCTipo,
      referencia: row.referencia,
      monto: decimalToMoneyString(row.monto),
      saldoPost: decimalToMoneyString(row.saldoPost),
      fecha: row.fecha.toISOString(),
      usuarioId: row.usuarioId,
      notas: row.notas,
    }
  }

  private computeExcedeLimite(saldo: Decimal, limiteCredito: Decimal | null): boolean {
    if (limiteCredito == null) return false
    return saldo.greaterThan(limiteCredito)
  }

  private async getLastSaldo(tenantId: number, proveedorId: number): Promise<Decimal> {
    const last = await this.db.movimientoProveedorCC.findFirst({
      where: { tenantId, proveedorId },
      orderBy: [{ fecha: 'desc' }, { id: 'desc' }],
      select: { saldoPost: true },
    })
    return last?.saldoPost ?? new Decimal(0)
  }

  async recordMovimiento(params: {
    tenantId: number
    proveedorId: number
    tipo: MovimientoProveedorCCTipo
    monto: number | Decimal
    referencia?: string | null
    fecha: Date
    usuarioId: number
    notas?: string | null
    comprobanteCompraId?: number | null
  }): Promise<MovimientoProveedorCC> {
    if (params.comprobanteCompraId != null) {
      const existing = await this.db.movimientoProveedorCC.findFirst({
        where: { tenantId: params.tenantId, comprobanteCompraId: params.comprobanteCompraId },
      })
      if (existing) return existing
    }

    const montoDec = toDecimal(params.monto)
    const prev = await this.getLastSaldo(params.tenantId, params.proveedorId)
    const saldoPost = prev.plus(montoDec)

    return this.db.movimientoProveedorCC.create({
      data: {
        tenantId: params.tenantId,
        proveedorId: params.proveedorId,
        tipo: params.tipo,
        referencia: params.referencia ?? null,
        monto: montoDec,
        saldoPost,
        fecha: params.fecha,
        usuarioId: params.usuarioId,
        notas: params.notas ?? null,
        comprobanteCompraId: params.comprobanteCompraId ?? null,
      },
    })
  }

  async recordFromComprobanteCompra(
    tenantId: number,
    comprobante: ComprobanteCompra,
    usuarioId: number,
  ): Promise<MovimientoProveedorCC> {
    if (comprobante.estado !== 'A') {
      throw new ValidationAppError('Comprobante compra must be active to post ledger movement')
    }
    const ref = `${comprobante.tipo}-${comprobante.prefijo}-${comprobante.numero}`
    return this.recordMovimiento({
      tenantId,
      proveedorId: comprobante.proveedorId,
      tipo: 'factura_compra',
      monto: comprobante.total,
      referencia: ref,
      fecha: comprobante.fecha,
      usuarioId,
      comprobanteCompraId: comprobante.id,
    })
  }

  async getSaldo(tenantId: number, proveedorId: number): Promise<ProveedorCuentaCorrienteSaldoResult | null> {
    const proveedor = await this.db.proveedor.findFirst({
      where: { id: proveedorId, tenantId },
      select: { id: true, limiteCredito: true },
    })
    if (!proveedor) return null

    const saldo = await this.getLastSaldo(tenantId, proveedorId)
    const limite = proveedor.limiteCredito

    return {
      proveedorId: proveedor.id,
      saldo: decimalToMoneyString(saldo),
      limiteCredito: limite != null ? decimalToMoneyString(limite) : null,
      excedeLimite: this.computeExcedeLimite(saldo, limite),
    }
  }

  buildChartSeries(movimientos: MovimientoProveedorCC[]): ProveedorCuentaCorrienteChartPoint[] {
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

  async getStatement(
    tenantId: number,
    proveedorId: number,
    filters: ProveedorCuentaCorrienteFilters = {},
  ): Promise<ProveedorCuentaCorrienteResult | null> {
    const proveedor = await this.db.proveedor.findFirst({
      where: { id: proveedorId, tenantId },
      select: { id: true, codigo: true, rsocial: true, limiteCredito: true },
    })
    if (!proveedor) return null

    const where: Prisma.MovimientoProveedorCCWhereInput = {
      tenantId,
      proveedorId,
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

    const [movimientos, allForChart] = await Promise.all([
      this.db.movimientoProveedorCC.findMany({
        where,
        orderBy: [{ fecha: 'desc' }, { id: 'desc' }],
      }),
      this.db.movimientoProveedorCC.findMany({
        where: { tenantId, proveedorId },
        orderBy: [{ fecha: 'asc' }, { id: 'asc' }],
      }),
    ])

    const saldo = await this.getLastSaldo(tenantId, proveedorId)

    return {
      proveedorId: proveedor.id,
      codigo: proveedor.codigo,
      rsocial: proveedor.rsocial,
      saldo: decimalToMoneyString(saldo),
      limiteCredito:
        proveedor.limiteCredito != null ? decimalToMoneyString(proveedor.limiteCredito) : null,
      excedeLimite: this.computeExcedeLimite(saldo, proveedor.limiteCredito),
      movimientos: movimientos.map((m) => this.mapRow(m)),
      serie: this.buildChartSeries(allForChart),
    }
  }

  async createAjuste(
    tenantId: number,
    proveedorId: number,
    usuarioId: number,
    monto: number,
    motivo: string,
  ): Promise<MovimientoProveedorCCRow> {
    const motivoTrim = motivo.trim()
    if (!motivoTrim) {
      throw new ValidationAppError('motivo is required')
    }

    const proveedor = await this.db.proveedor.findFirst({
      where: { id: proveedorId, tenantId },
      select: { id: true },
    })
    if (!proveedor) {
      throw new NotFoundAppError('Proveedor not found')
    }

    if (!Number.isFinite(monto) || monto === 0) {
      throw new ValidationAppError('monto must be a non-zero number')
    }

    const mov = await this.recordMovimiento({
      tenantId,
      proveedorId,
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
