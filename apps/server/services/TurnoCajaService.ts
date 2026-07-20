import type { Prisma, PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import type {
  ConteoEfectivoInput,
  MovimientoCajaFormaPago,
  MovimientoCajaManualInput,
  TurnoCajaCloseInput,
  TurnoCajaOpenInput,
} from '@bizcode/types'
import type { ServiceResult } from './serviceResults'

const DENOM_VALUES = {
  b1000: 1000,
  b500: 500,
  b200: 200,
  b100: 100,
  b50: 50,
  b20: 20,
  b10: 10,
  m10: 10,
  m5: 5,
  m2: 2,
  m1: 1,
} as const

type DenomKey = keyof typeof DENOM_VALUES

const turnoInclude = {
  caja: true,
  cajero: { select: { id: true, username: true } },
  conteo: true,
  movimientos: {
    include: { user: { select: { id: true, username: true } } },
    orderBy: { fecha: 'desc' as const },
  },
} satisfies Prisma.TurnoCajaInclude

export type TurnoCajaRowDb = Prisma.TurnoCajaGetPayload<{ include: typeof turnoInclude }>

function toNumber(value: Decimal | number | null | undefined): number | null {
  if (value == null) return null
  return typeof value === 'number' ? value : Number(value.toString())
}

function denomCount(input: ConteoEfectivoInput, key: DenomKey): number {
  const raw = input[key]
  if (raw == null || !Number.isFinite(raw) || raw < 0) return 0
  return Math.trunc(raw)
}

export function computeConteoTotal(input: ConteoEfectivoInput): number {
  let total = 0
  for (const key of Object.keys(DENOM_VALUES) as DenomKey[]) {
    total += denomCount(input, key) * DENOM_VALUES[key]
  }
  return total
}

/**
 * @en Cash drawer shifts: open/close, movements, dashboard (#247).
 * @es Turnos de caja: apertura/cierre, movimientos, dashboard (#247).
 * @pt-BR Turnos de caixa: abertura/fechamento, movimentos, dashboard (#247).
 */
export class TurnoCajaService {
  constructor(private readonly prisma: PrismaClient) {}

  async listCajas(tenantId: number): Promise<Prisma.CajaGetPayload<object>[]> {
    return this.prisma.caja.findMany({
      where: { tenantId },
      orderBy: [{ activa: 'desc' }, { nombre: 'asc' }],
    })
  }

  async createCaja(
    tenantId: number,
    nombre: string,
  ): Promise<ServiceResult<Prisma.CajaGetPayload<object>>> {
    const trimmed = nombre.trim()
    if (trimmed.length < 1 || trimmed.length > 80) {
      return { ok: false, status: 400, error: 'nombre must be 1–80 characters' }
    }
    try {
      const row = await this.prisma.caja.create({
        data: { tenantId, nombre: trimmed, activa: true },
      })
      return { ok: true, data: row }
    } catch {
      return { ok: false, status: 409, error: 'Caja nombre already exists for this tenant' }
    }
  }

  async listTurnos(
    tenantId: number,
    take: number,
    skip: number,
    opts?: { estado?: string | null; cajaId?: number | null },
  ): Promise<{
    total: number
    turnos: TurnoCajaRowDb[]
    counts: { abiertos: number; cerradosHoy: number; diferenciaHoy: number }
  }> {
    const where: Prisma.TurnoCajaWhereInput = {
      tenantId,
      ...(opts?.estado ? { estado: opts.estado } : {}),
      ...(opts?.cajaId != null ? { cajaId: opts.cajaId } : {}),
    }
    const startOfDay = new Date()
    startOfDay.setUTCHours(0, 0, 0, 0)

    const [total, turnos, abiertos, cerradosHoy, diffAgg] = await Promise.all([
      this.prisma.turnoCaja.count({ where }),
      this.prisma.turnoCaja.findMany({
        where,
        include: turnoInclude,
        orderBy: [{ fechaApertura: 'desc' }, { id: 'desc' }],
        take,
        skip,
      }),
      this.prisma.turnoCaja.count({ where: { tenantId, estado: 'abierto' } }),
      this.prisma.turnoCaja.count({
        where: { tenantId, estado: 'cerrado', fechaCierre: { gte: startOfDay } },
      }),
      this.prisma.turnoCaja.aggregate({
        where: {
          tenantId,
          estado: 'cerrado',
          fechaCierre: { gte: startOfDay },
          diferencia: { not: null },
        },
        _sum: { diferencia: true },
      }),
    ])

    return {
      total,
      turnos,
      counts: {
        abiertos,
        cerradosHoy,
        diferenciaHoy: toNumber(diffAgg._sum.diferencia) ?? 0,
      },
    }
  }

  async getTurno(tenantId: number, id: number): Promise<ServiceResult<TurnoCajaRowDb>> {
    const row = await this.prisma.turnoCaja.findFirst({
      where: { id, tenantId },
      include: turnoInclude,
    })
    if (!row) return { ok: false, status: 404, error: 'Turno not found' }
    return { ok: true, data: row }
  }

  async open(
    tenantId: number,
    cajeroId: number,
    input: TurnoCajaOpenInput,
  ): Promise<ServiceResult<TurnoCajaRowDb>> {
    const caja = await this.prisma.caja.findFirst({
      where: { id: input.cajaId, tenantId, activa: true },
      select: { id: true },
    })
    if (!caja) return { ok: false, status: 400, error: 'cajaId is not valid or inactive' }

    const existingOpen = await this.prisma.turnoCaja.findFirst({
      where: { tenantId, cajaId: input.cajaId, estado: 'abierto' },
      select: { id: true },
    })
    if (existingOpen) {
      return { ok: false, status: 409, error: 'Caja already has an open turno' }
    }

    if (!Number.isFinite(input.montoApertura) || input.montoApertura < 0) {
      return { ok: false, status: 400, error: 'montoApertura must be >= 0' }
    }

    const created = await this.prisma.turnoCaja.create({
      data: {
        tenantId,
        cajaId: input.cajaId,
        cajeroId,
        estado: 'abierto',
        montoApertura: new Decimal(input.montoApertura),
      },
      include: turnoInclude,
    })
    return { ok: true, data: created }
  }

  async addManualMovement(
    tenantId: number,
    turnoId: number,
    userId: number,
    input: MovimientoCajaManualInput,
  ): Promise<ServiceResult<TurnoCajaRowDb>> {
    const turno = await this.prisma.turnoCaja.findFirst({
      where: { id: turnoId, tenantId },
      select: { id: true, estado: true },
    })
    if (!turno) return { ok: false, status: 404, error: 'Turno not found' }
    if (turno.estado !== 'abierto') {
      return { ok: false, status: 409, error: 'Turno is not abierto' }
    }
    if (!Number.isFinite(input.importe) || input.importe <= 0) {
      return { ok: false, status: 400, error: 'importe must be > 0' }
    }

    await this.prisma.movimientoCaja.create({
      data: {
        turnoId,
        tipo: input.tipo,
        formaPago: input.formaPago ?? 'efectivo',
        importe: new Decimal(input.importe),
        concepto: input.concepto?.trim() || null,
        userId,
      },
    })

    const refreshed = await this.prisma.turnoCaja.findFirstOrThrow({
      where: { id: turnoId },
      include: turnoInclude,
    })
    return { ok: true, data: refreshed }
  }

  async close(
    tenantId: number,
    turnoId: number,
    input: TurnoCajaCloseInput,
  ): Promise<ServiceResult<TurnoCajaRowDb>> {
    const turno = await this.prisma.turnoCaja.findFirst({
      where: { id: turnoId, tenantId },
      include: { movimientos: true },
    })
    if (!turno) return { ok: false, status: 404, error: 'Turno not found' }
    if (turno.estado !== 'abierto') {
      return { ok: false, status: 409, error: 'Turno is not abierto' }
    }

    const totals = this.sumMovements(turno.movimientos, Number(turno.montoApertura.toString()))
    const contado = computeConteoTotal(input.conteo)
    const diferencia = contado - totals.efectivoEsperado
    const obs = input.observaciones?.trim() || null
    if (Math.abs(diferencia) > 0.009 && !obs) {
      return {
        ok: false,
        status: 400,
        error: 'observaciones required when diferencia is not zero',
      }
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.conteoEfectivo.create({
        data: {
          turnoId,
          b1000: denomCount(input.conteo, 'b1000'),
          b500: denomCount(input.conteo, 'b500'),
          b200: denomCount(input.conteo, 'b200'),
          b100: denomCount(input.conteo, 'b100'),
          b50: denomCount(input.conteo, 'b50'),
          b20: denomCount(input.conteo, 'b20'),
          b10: denomCount(input.conteo, 'b10'),
          m10: denomCount(input.conteo, 'm10'),
          m5: denomCount(input.conteo, 'm5'),
          m2: denomCount(input.conteo, 'm2'),
          m1: denomCount(input.conteo, 'm1'),
          total: new Decimal(contado),
        },
      })
      return tx.turnoCaja.update({
        where: { id: turnoId },
        data: {
          estado: 'cerrado',
          fechaCierre: new Date(),
          totalVentasEfectivo: new Decimal(totals.totalVentasEfectivo),
          totalVentasTarjeta: new Decimal(totals.totalVentasTarjeta),
          totalVentasMP: new Decimal(totals.totalVentasMP),
          totalVentasTransf: new Decimal(totals.totalVentasTransf),
          totalEgresos: new Decimal(totals.totalEgresos),
          totalIngresosExtra: new Decimal(totals.totalIngresosExtra),
          efectivoEsperado: new Decimal(totals.efectivoEsperado),
          efectivoContado: new Decimal(contado),
          diferencia: new Decimal(diferencia),
          observaciones: obs,
        },
        include: turnoInclude,
      })
    })

    return { ok: true, data: updated }
  }

  /**
   * @en Best-effort cash movement when an open shift exists (never throws to callers).
   * @es Movimiento de efectivo best-effort si hay turno abierto (no lanza a callers).
   * @pt-BR Movimento de caixa best-effort se houver turno aberto (não lança aos callers).
   */
  async tryRecordAutoMovement(params: {
    tenantId: number
    userId: number
    tipo: 'venta' | 'cobro'
    formaPago: MovimientoCajaFormaPago
    importe: number
    concepto?: string | null
    referenciaTipo: 'factura' | 'cobro' | 'recibo_cobro'
    referenciaId: number
  }): Promise<void> {
    if (!Number.isFinite(params.importe) || params.importe <= 0) return
    const open = await this.prisma.turnoCaja.findFirst({
      where: { tenantId: params.tenantId, estado: 'abierto' },
      orderBy: { fechaApertura: 'desc' },
      select: { id: true },
    })
    if (!open) return
    await this.prisma.movimientoCaja.create({
      data: {
        turnoId: open.id,
        tipo: params.tipo,
        formaPago: params.formaPago,
        importe: new Decimal(params.importe),
        concepto: params.concepto?.trim() || null,
        referenciaTipo: params.referenciaTipo,
        referenciaId: params.referenciaId,
        userId: params.userId,
      },
    })
  }

  private sumMovements(
    movimientos: Array<{ tipo: string; formaPago: string; importe: Decimal }>,
    montoApertura: number,
  ): {
    totalVentasEfectivo: number
    totalVentasTarjeta: number
    totalVentasMP: number
    totalVentasTransf: number
    totalEgresos: number
    totalIngresosExtra: number
    efectivoEsperado: number
  } {
    let totalVentasEfectivo = 0
    let totalVentasTarjeta = 0
    let totalVentasMP = 0
    let totalVentasTransf = 0
    let totalEgresos = 0
    let totalIngresosExtra = 0

    for (const m of movimientos) {
      const amount = Number(m.importe.toString())
      if (m.tipo === 'egreso') {
        totalEgresos += amount
        continue
      }
      if (m.tipo === 'ingreso_extra') {
        totalIngresosExtra += amount
        continue
      }
      // venta | cobro
      if (m.formaPago === 'efectivo') totalVentasEfectivo += amount
      else if (m.formaPago === 'tarjeta') totalVentasTarjeta += amount
      else if (m.formaPago === 'mp') totalVentasMP += amount
      else if (m.formaPago === 'transferencia') totalVentasTransf += amount
    }

    const efectivoEsperado =
      montoApertura + totalVentasEfectivo + totalIngresosExtra - totalEgresos

    return {
      totalVentasEfectivo,
      totalVentasTarjeta,
      totalVentasMP,
      totalVentasTransf,
      totalEgresos,
      totalIngresosExtra,
      efectivoEsperado,
    }
  }
}
