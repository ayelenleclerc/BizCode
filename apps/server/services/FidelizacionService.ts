import type { Prisma, PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import type {
  ClientePuntosDetail,
  ConfigFidelizacionRow,
  ConfigFidelizacionUpsertInput,
  FidelizacionAjusteInput,
  FidelizacionDashboard,
  MovimientoPuntosRow,
  MovimientoPuntosTipo,
  PortalFidelizacionSummary,
} from '@bizcode/types'
import { notifyManagers } from '../notifications'
import { modulesInclude, TenantConfigService } from './TenantConfigService'
import type { ServiceResult } from './serviceResults'

type TxClient = Prisma.TransactionClient | PrismaClient

export const CANJE_PUNTOS_DESCRIPCION = 'Canje de puntos'

function toNumber(value: Decimal | number | string | null | undefined): number {
  if (value === null || value === undefined) return 0
  if (typeof value === 'number') return value
  if (typeof value === 'string') return Number.parseFloat(value)
  return Number(value.toString())
}

function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

function addMonths(date: Date, months: number): Date {
  const result = new Date(date.getTime())
  result.setUTCMonth(result.getUTCMonth() + months)
  return result
}

function mapConfig(row: {
  id: number
  tenantId: number
  activo: boolean
  nombre: string
  pesosPorPunto: Decimal
  puntosPorPeso: Decimal
  mesesVencimiento: number | null
  montoMinCompra: Decimal
  aplicaEnDescuento: boolean
  createdAt: Date
  updatedAt: Date
}): ConfigFidelizacionRow {
  return {
    id: row.id,
    tenantId: row.tenantId,
    activo: row.activo,
    nombre: row.nombre,
    pesosPorPunto: toNumber(row.pesosPorPunto),
    puntosPorPeso: toNumber(row.puntosPorPeso),
    mesesVencimiento: row.mesesVencimiento,
    montoMinCompra: toNumber(row.montoMinCompra),
    aplicaEnDescuento: row.aplicaEnDescuento,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

function mapMovimiento(row: {
  id: number
  tenantId: number
  clienteId: number
  tipo: string
  puntos: number
  saldoPost: number
  puntosRestantes: number | null
  referenciaFacturaId: number | null
  venceEn: Date | null
  concepto: string | null
  userId: number | null
  createdAt: Date
}): MovimientoPuntosRow {
  return {
    id: row.id,
    tenantId: row.tenantId,
    clienteId: row.clienteId,
    tipo: row.tipo as MovimientoPuntosTipo,
    puntos: row.puntos,
    saldoPost: row.saldoPost,
    puntosRestantes: row.puntosRestantes,
    referenciaFacturaId: row.referenciaFacturaId,
    venceEn: row.venceEn ? row.venceEn.toISOString() : null,
    concepto: row.concepto,
    userId: row.userId,
    createdAt: row.createdAt.toISOString(),
  }
}

/**
 * @en Pure accrual calculation from invoice totals and loyalty config (#250).
 * @es Cálculo puro de acumulación desde totales de factura y config (#250).
 * @pt-BR Cálculo puro de acumulação a partir dos totais da fatura e config (#250).
 */
export function calcularPuntosAcumulacion(params: {
  total: number
  items: Array<{ cantidad: number; precio: number; dscto: number; subtotal: number }>
  pesosPorPunto: number
  montoMinCompra: number
  aplicaEnDescuento: boolean
}): number {
  const { pesosPorPunto, montoMinCompra, aplicaEnDescuento } = params
  if (!(pesosPorPunto > 0)) return 0

  let base = params.total
  if (!aplicaEnDescuento) {
    const discountEffect = params.items.reduce((sum, item) => {
      const gross = item.cantidad * item.precio
      const net = item.subtotal
      return sum + Math.max(0, gross - net)
    }, 0)
    // total already reflects line discounts; restore pre-discount commercial base.
    base = round2(params.total + discountEffect)
  }
  if (base < montoMinCompra) return 0
  return Math.floor(base / pesosPorPunto)
}

/**
 * @en Money discount for redeeming N points.
 * @es Descuento en dinero por canjear N puntos.
 * @pt-BR Desconto em dinheiro ao resgatar N pontos.
 */
export function calcularMontoCanje(puntos: number, puntosPorPeso: number): number {
  if (!(puntos > 0) || !(puntosPorPeso > 0)) return 0
  return round2(puntos * puntosPorPeso)
}

/**
 * @en Customer loyalty points: config, accrual, redemption, expiry (#250).
 * @es Fidelización de clientes: config, acumulación, canje, vencimiento (#250).
 * @pt-BR Fidelização de clientes: config, acumulação, resgate, vencimento (#250).
 */
export class FidelizacionService {
  private readonly tenantConfig: TenantConfigService

  constructor(
    private readonly prisma: PrismaClient,
    tenantConfig?: TenantConfigService,
  ) {
    this.tenantConfig = tenantConfig ?? new TenantConfigService(prisma)
  }

  async isLoyaltyEnabled(tenantId: number): Promise<boolean> {
    const modules = await this.tenantConfig.getModulesForTenant(tenantId)
    if (!modulesInclude(modules, 'clients.loyalty')) return false
    const config = await this.prisma.configFidelizacion.findUnique({ where: { tenantId } })
    return config?.activo === true
  }

  async getConfig(tenantId: number): Promise<ConfigFidelizacionRow> {
    const existing = await this.prisma.configFidelizacion.findUnique({ where: { tenantId } })
    if (existing) return mapConfig(existing)
    const created = await this.prisma.configFidelizacion.create({
      data: { tenantId },
    })
    return mapConfig(created)
  }

  async upsertConfig(
    tenantId: number,
    input: ConfigFidelizacionUpsertInput,
  ): Promise<ServiceResult<ConfigFidelizacionRow>> {
    if (!(input.pesosPorPunto > 0) || !(input.puntosPorPeso > 0)) {
      return { ok: false, status: 400, error: 'pesosPorPunto and puntosPorPeso must be positive' }
    }
    const row = await this.prisma.configFidelizacion.upsert({
      where: { tenantId },
      create: {
        tenantId,
        activo: input.activo,
        nombre: input.nombre?.trim() || 'Programa de Puntos',
        pesosPorPunto: new Decimal(input.pesosPorPunto),
        puntosPorPeso: new Decimal(input.puntosPorPeso),
        mesesVencimiento: input.mesesVencimiento ?? null,
        montoMinCompra: new Decimal(input.montoMinCompra ?? 0),
        aplicaEnDescuento: input.aplicaEnDescuento ?? false,
      },
      update: {
        activo: input.activo,
        ...(input.nombre !== undefined ? { nombre: input.nombre.trim() || 'Programa de Puntos' } : {}),
        pesosPorPunto: new Decimal(input.pesosPorPunto),
        puntosPorPeso: new Decimal(input.puntosPorPeso),
        mesesVencimiento: input.mesesVencimiento === undefined ? undefined : input.mesesVencimiento,
        ...(input.montoMinCompra !== undefined
          ? { montoMinCompra: new Decimal(input.montoMinCompra) }
          : {}),
        ...(input.aplicaEnDescuento !== undefined
          ? { aplicaEnDescuento: input.aplicaEnDescuento }
          : {}),
      },
    })
    return { ok: true, data: mapConfig(row) }
  }

  async getClientePuntos(
    tenantId: number,
    clienteId: number,
    take = 50,
    skip = 0,
  ): Promise<ServiceResult<ClientePuntosDetail>> {
    const cliente = await this.prisma.cliente.findFirst({
      where: { id: clienteId, tenantId },
      select: { id: true },
    })
    if (!cliente) return { ok: false, status: 404, error: 'Cliente not found' }

    const config = await this.getConfig(tenantId)
    const saldo = await this.prisma.puntosFidelizacion.findUnique({
      where: { clienteId },
    })
    const puntos = saldo?.puntos ?? 0
    const [totalMovimientos, movimientos] = await Promise.all([
      this.prisma.movimientoPuntos.count({ where: { tenantId, clienteId } }),
      this.prisma.movimientoPuntos.findMany({
        where: { tenantId, clienteId },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        take,
        skip,
      }),
    ])
    return {
      ok: true,
      data: {
        clienteId,
        puntos,
        equivalenteDinero: calcularMontoCanje(puntos, config.puntosPorPeso),
        movimientos: movimientos.map(mapMovimiento),
        totalMovimientos,
      },
    }
  }

  async getPortalSummary(
    tenantId: number,
    clienteId: number,
  ): Promise<PortalFidelizacionSummary> {
    const enabled = await this.isLoyaltyEnabled(tenantId)
    if (!enabled) {
      return { puntos: 0, equivalenteDinero: 0, programaActivo: false, nombrePrograma: null }
    }
    const config = await this.getConfig(tenantId)
    const saldo = await this.prisma.puntosFidelizacion.findUnique({ where: { clienteId } })
    const puntos = saldo?.puntos ?? 0
    return {
      puntos,
      equivalenteDinero: calcularMontoCanje(puntos, config.puntosPorPeso),
      programaActivo: true,
      nombrePrograma: config.nombre,
    }
  }

  async getDashboard(tenantId: number): Promise<FidelizacionDashboard> {
    const config = await this.getConfig(tenantId)
    const movimientos = await this.prisma.movimientoPuntos.groupBy({
      by: ['tipo'],
      where: { tenantId },
      _sum: { puntos: true },
    })
    const sumByTipo = new Map(
      movimientos.map((row) => [row.tipo, row._sum.puntos ?? 0]),
    )
    const puntosEmitidos = Math.max(0, sumByTipo.get('acumulacion') ?? 0)
    const puntosCanjeados = Math.abs(Math.min(0, sumByTipo.get('canje') ?? 0))
    const puntosVencidos = Math.abs(Math.min(0, sumByTipo.get('vencimiento') ?? 0))
    const puntosAjustados = sumByTipo.get('ajuste') ?? 0
    const pasivoAgg = await this.prisma.puntosFidelizacion.aggregate({
      where: { tenantId },
      _sum: { puntos: true },
    })
    const pasivoPuntos = pasivoAgg._sum.puntos ?? 0
    const rankingRows = await this.prisma.puntosFidelizacion.findMany({
      where: { tenantId, puntos: { gt: 0 } },
      include: { cliente: { select: { id: true, codigo: true, rsocial: true } } },
      orderBy: [{ puntos: 'desc' }, { clienteId: 'asc' }],
      take: 20,
    })
    return {
      puntosEmitidos,
      puntosCanjeados,
      puntosVencidos,
      puntosAjustados,
      pasivoPuntos,
      pasivoDinero: calcularMontoCanje(pasivoPuntos, config.puntosPorPeso),
      ranking: rankingRows.map((row) => ({
        clienteId: row.clienteId,
        codigo: row.cliente.codigo,
        rsocial: row.cliente.rsocial,
        puntos: row.puntos,
        equivalenteDinero: calcularMontoCanje(row.puntos, config.puntosPorPeso),
      })),
    }
  }

  async ajustar(
    tenantId: number,
    userId: number,
    input: FidelizacionAjusteInput,
  ): Promise<ServiceResult<ClientePuntosDetail>> {
    if (input.puntos === 0) {
      return { ok: false, status: 400, error: 'puntos must be non-zero' }
    }
    const cliente = await this.prisma.cliente.findFirst({
      where: { id: input.clienteId, tenantId },
      select: { id: true },
    })
    if (!cliente) return { ok: false, status: 404, error: 'Cliente not found' }

    await this.prisma.$transaction(async (tx) => {
      await this.applyDelta(tx, {
        tenantId,
        clienteId: input.clienteId,
        tipo: 'ajuste',
        puntos: input.puntos,
        concepto: input.concepto?.trim() || 'Ajuste manual',
        userId,
      })
    })
    return this.getClientePuntos(tenantId, input.clienteId)
  }

  /**
   * @en Prepares redemption line data and validates balance before invoice create.
   * @es Prepara la línea de canje y valida saldo antes de crear la factura.
   * @pt-BR Prepara a linha de resgate e valida saldo antes de criar a fatura.
   */
  async prepareCanje(
    tenantId: number,
    clienteId: number,
    puntosCanje: number,
  ): Promise<
    ServiceResult<{
      puntos: number
      monto: number
      item: {
        articuloId: null
        descripcion: string
        condIva: '3'
        unidadServicio: null
        cantidad: 1
        precio: number
        dscto: 0
        subtotal: number
      }
    }>
  > {
    if (!(puntosCanje > 0)) {
      return { ok: false, status: 400, error: 'puntosCanje must be positive' }
    }
    const enabled = await this.isLoyaltyEnabled(tenantId)
    if (!enabled) {
      return { ok: false, status: 422, error: 'LOYALTY_NOT_ACTIVE' }
    }
    const config = await this.getConfig(tenantId)
    const saldo = await this.prisma.puntosFidelizacion.findUnique({ where: { clienteId } })
    const puntos = saldo?.puntos ?? 0
    if (puntos < puntosCanje) {
      return { ok: false, status: 422, error: 'INSUFFICIENT_POINTS' }
    }
    const monto = calcularMontoCanje(puntosCanje, config.puntosPorPeso)
    return {
      ok: true,
      data: {
        puntos: puntosCanje,
        monto,
        item: {
          articuloId: null,
          descripcion: CANJE_PUNTOS_DESCRIPCION,
          condIva: '3',
          unidadServicio: null,
          cantidad: 1,
          precio: -monto,
          dscto: 0,
          subtotal: -monto,
        },
      },
    }
  }

  async applyInvoiceEffects(
    tenantId: number,
    params: {
      facturaId: number
      clienteId: number
      total: number
      items: Array<{ cantidad: number; precio: number; dscto: number; subtotal: number; descripcion?: string | null }>
      puntosCanje?: number | null
      userId: number | null
    },
  ): Promise<{ acumulados: number; canjeados: number }> {
    const enabled = await this.isLoyaltyEnabled(tenantId)
    if (!enabled) return { acumulados: 0, canjeados: 0 }

    const config = await this.getConfig(tenantId)
    let acumulados = 0
    let canjeados = 0

    await this.prisma.$transaction(async (tx) => {
      if (params.puntosCanje != null && params.puntosCanje > 0) {
        await this.consumeLotsFifo(tx, tenantId, params.clienteId, params.puntosCanje)
        await this.applyDelta(tx, {
          tenantId,
          clienteId: params.clienteId,
          tipo: 'canje',
          puntos: -params.puntosCanje,
          concepto: CANJE_PUNTOS_DESCRIPCION,
          referenciaFacturaId: params.facturaId,
          userId: params.userId,
        })
        canjeados = params.puntosCanje
      }

      const itemsForAccrual = params.items.filter(
        (item) => (item.descripcion ?? '') !== CANJE_PUNTOS_DESCRIPCION,
      )
      const totalForAccrual = round2(
        params.total +
          (params.puntosCanje != null && params.puntosCanje > 0
            ? calcularMontoCanje(params.puntosCanje, config.puntosPorPeso)
            : 0),
      )
      acumulados = calcularPuntosAcumulacion({
        total: totalForAccrual,
        items: itemsForAccrual,
        pesosPorPunto: config.pesosPorPunto,
        montoMinCompra: config.montoMinCompra,
        aplicaEnDescuento: config.aplicaEnDescuento,
      })
      if (acumulados > 0) {
        const venceEn =
          config.mesesVencimiento != null && config.mesesVencimiento > 0
            ? addMonths(new Date(), config.mesesVencimiento)
            : null
        await this.applyDelta(tx, {
          tenantId,
          clienteId: params.clienteId,
          tipo: 'acumulacion',
          puntos: acumulados,
          concepto: `Acumulación factura #${params.facturaId}`,
          referenciaFacturaId: params.facturaId,
          venceEn,
          puntosRestantes: acumulados,
          userId: params.userId,
        })
      }
    })

    return { acumulados, canjeados }
  }

  async revertirFromFactura(tenantId: number, facturaId: number, userId: number | null): Promise<void> {
    const enabled = await this.isLoyaltyEnabled(tenantId)
    if (!enabled) return

    const movimientos = await this.prisma.movimientoPuntos.findMany({
      where: {
        tenantId,
        referenciaFacturaId: facturaId,
        tipo: { in: ['acumulacion', 'canje'] },
      },
      orderBy: { id: 'asc' },
    })
    if (movimientos.length === 0) return

    await this.prisma.$transaction(async (tx) => {
      for (const mov of movimientos) {
        const already = await tx.movimientoPuntos.findFirst({
          where: {
            tenantId,
            referenciaFacturaId: facturaId,
            tipo: 'reverso',
            concepto: { contains: `reverso:${mov.id}` },
          },
          select: { id: true },
        })
        if (already) continue

        // Flip the original delta (accrual → negative, redemption → positive).
        await this.applyDelta(tx, {
          tenantId,
          clienteId: mov.clienteId,
          tipo: 'reverso',
          puntos: -mov.puntos,
          concepto: `Reverso factura #${facturaId} (reverso:${mov.id})`,
          referenciaFacturaId: facturaId,
          userId,
        })

        if (mov.tipo === 'acumulacion') {
          await tx.movimientoPuntos.update({
            where: { id: mov.id },
            data: { puntosRestantes: 0 },
          })
        }

        if (mov.tipo === 'canje') {
          const restored = Math.abs(mov.puntos)
          const saldo = await tx.puntosFidelizacion.findUnique({
            where: { clienteId: mov.clienteId },
          })
          // Restore a redeemable FIFO lot without changing the ledger again.
          await tx.movimientoPuntos.create({
            data: {
              tenantId,
              clienteId: mov.clienteId,
              tipo: 'acumulacion',
              puntos: 0,
              saldoPost: saldo?.puntos ?? 0,
              puntosRestantes: restored,
              referenciaFacturaId: facturaId,
              concepto: `Reposición lotes por anulación factura #${facturaId}`,
              userId,
            },
          })
        }
      }
    })
  }

  /**
   * @en Daily expiry + 7-day advance notice job (#250). Cron: `0 8 * * *`.
   * @es Job diario de vencimiento + preaviso 7 días (#250). Cron: `0 8 * * *`.
   * @pt-BR Job diário de vencimento + pré-aviso 7 dias (#250). Cron: `0 8 * * *`.
   */
  async runDailyExpiryJob(tenantId: number): Promise<{
    expired: number
    notified: number
  }> {
    const modules = await this.tenantConfig.getModulesForTenant(tenantId)
    if (!modulesInclude(modules, 'clients.loyalty')) {
      return { expired: 0, notified: 0 }
    }
    const config = await this.prisma.configFidelizacion.findUnique({ where: { tenantId } })
    if (!config?.activo || config.mesesVencimiento == null) {
      return { expired: 0, notified: 0 }
    }

    const now = new Date()
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    let expired = 0
    let notified = 0

    const dueSoon = await this.prisma.movimientoPuntos.findMany({
      where: {
        tenantId,
        tipo: 'acumulacion',
        puntosRestantes: { gt: 0 },
        venceEn: { gt: now, lte: in7Days },
        preavisoEnviadoAt: null,
      },
      include: { cliente: { select: { id: true, rsocial: true, email: true } } },
    })
    for (const lot of dueSoon) {
      await notifyManagers(this.prisma, tenantId, 'loyalty_points_expiring', {
        clienteId: lot.clienteId,
        rsocial: lot.cliente.rsocial,
        amount: String(lot.puntosRestantes ?? 0),
        expiresAt: lot.venceEn?.toISOString(),
        daysRemaining: Math.max(
          0,
          Math.ceil(((lot.venceEn?.getTime() ?? now.getTime()) - now.getTime()) / (24 * 60 * 60 * 1000)),
        ),
      })
      await this.prisma.movimientoPuntos.update({
        where: { id: lot.id },
        data: { preavisoEnviadoAt: now },
      })
      notified += 1
    }

    const expiredLots = await this.prisma.movimientoPuntos.findMany({
      where: {
        tenantId,
        tipo: 'acumulacion',
        puntosRestantes: { gt: 0 },
        venceEn: { lte: now },
      },
      orderBy: [{ venceEn: 'asc' }, { id: 'asc' }],
    })

    for (const lot of expiredLots) {
      const qty = lot.puntosRestantes ?? 0
      if (qty <= 0) continue
      await this.prisma.$transaction(async (tx) => {
        await tx.movimientoPuntos.update({
          where: { id: lot.id },
          data: { puntosRestantes: 0 },
        })
        await this.applyDelta(tx, {
          tenantId,
          clienteId: lot.clienteId,
          tipo: 'vencimiento',
          puntos: -qty,
          concepto: `Vencimiento lote #${lot.id}`,
          referenciaFacturaId: lot.referenciaFacturaId,
        })
      })
      expired += qty
    }

    return { expired, notified }
  }

  private async consumeLotsFifo(
    tx: TxClient,
    tenantId: number,
    clienteId: number,
    puntos: number,
  ): Promise<void> {
    let remaining = puntos
    const lots = await tx.movimientoPuntos.findMany({
      where: {
        tenantId,
        clienteId,
        tipo: 'acumulacion',
        puntosRestantes: { gt: 0 },
      },
      orderBy: [{ venceEn: 'asc' }, { id: 'asc' }],
    })
    for (const lot of lots) {
      if (remaining <= 0) break
      const available = lot.puntosRestantes ?? 0
      const take = Math.min(available, remaining)
      await tx.movimientoPuntos.update({
        where: { id: lot.id },
        data: { puntosRestantes: available - take },
      })
      remaining -= take
    }
  }

  private async applyDelta(
    tx: TxClient,
    params: {
      tenantId: number
      clienteId: number
      tipo: MovimientoPuntosTipo
      puntos: number
      concepto?: string | null
      referenciaFacturaId?: number | null
      venceEn?: Date | null
      puntosRestantes?: number | null
      userId?: number | null
    },
  ): Promise<void> {
    const existing = await tx.puntosFidelizacion.findUnique({
      where: { clienteId: params.clienteId },
    })
    const before = existing?.puntos ?? 0
    const after = before + params.puntos
    if (after < 0) {
      throw new Error('INSUFFICIENT_POINTS')
    }
    if (existing) {
      await tx.puntosFidelizacion.update({
        where: { id: existing.id },
        data: { puntos: after },
      })
    } else {
      await tx.puntosFidelizacion.create({
        data: {
          tenantId: params.tenantId,
          clienteId: params.clienteId,
          puntos: after,
        },
      })
    }
    await tx.movimientoPuntos.create({
      data: {
        tenantId: params.tenantId,
        clienteId: params.clienteId,
        tipo: params.tipo,
        puntos: params.puntos,
        saldoPost: after,
        puntosRestantes: params.puntosRestantes ?? null,
        referenciaFacturaId: params.referenciaFacturaId ?? null,
        venceEn: params.venceEn ?? null,
        concepto: params.concepto ?? null,
        userId: params.userId ?? null,
      },
    })
  }
}
