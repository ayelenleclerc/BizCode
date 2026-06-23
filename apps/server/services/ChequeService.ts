import type { Prisma, PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import type {
  ChequeEstado,
  ChequeInput,
  ChequeMovTipo,
  ChequeTipo,
  ChequeTransicionInput,
  ChequeUpdateInput,
} from '../createApp.types'
import { facturaFechaToPrismaDate } from '../routes/restDomainShared'
import { notifyFinanceStakeholders } from '../notifications'
import type { ServiceResult } from './serviceResults'
import { ClienteCuentaCorrienteService } from './ClienteCuentaCorrienteService'

const chequeInclude = {
  cliente: { select: { id: true, codigo: true, rsocial: true, cuit: true } },
  proveedor: { select: { id: true, codigo: true, rsocial: true, cuit: true } },
  movimientos: {
    orderBy: { fecha: 'asc' as const },
    include: { usuario: { select: { id: true, username: true } } },
  },
} satisfies Prisma.ChequeInclude

export type ChequeRow = Prisma.ChequeGetPayload<{ include: typeof chequeInclude }>

export type ChequeListResult = {
  total: number
  cheques: ChequeRow[]
}

export type ChequeResumen = {
  enCartera: { count: number; total: string }
  proximosVencer: { count: number; total: string }
  rechazados: { count: number; total: string }
}

type TransitionAction =
  | 'depositar'
  | 'endosar'
  | 'descontar'
  | 'cobrar'
  | 'rechazar'
  | 'devolverACartera'
  | 'anular'

const TRANSITIONS: Record<
  TransitionAction,
  { from: ChequeEstado[]; to: ChequeEstado; mov: ChequeMovTipo }
> = {
  depositar: { from: ['en_cartera'], to: 'depositado', mov: 'deposito' },
  endosar: { from: ['en_cartera'], to: 'endosado', mov: 'endoso' },
  descontar: { from: ['en_cartera'], to: 'descontado', mov: 'descuento' },
  cobrar: { from: ['depositado', 'emitido'], to: 'cobrado', mov: 'cobro' },
  rechazar: { from: ['depositado', 'emitido'], to: 'rechazado', mov: 'rechazo' },
  devolverACartera: { from: ['rechazado'], to: 'en_cartera', mov: 'recepcion' },
  anular: { from: ['en_cartera', 'emitido'], to: 'anulado', mov: 'rechazo' },
}

function initialEstado(tipo: ChequeTipo): ChequeEstado {
  return tipo === 'recibido' ? 'en_cartera' : 'emitido'
}

function decimalToMoneyString(value: Decimal | number): string {
  const n = typeof value === 'number' ? value : value.toNumber()
  return n.toFixed(2)
}

/**
 * @en Check portfolio domain service (#231).
 * @es Servicio de cartera de cheques (#231).
 * @pt-BR Serviço de carteira de cheques (#231).
 */
export class ChequeService {
  constructor(private readonly prisma: PrismaClient) {}

  async list(
    tenantId: number,
    take: number,
    skip: number,
    filters?: {
      tipo?: ChequeTipo
      estado?: ChequeEstado
      banco?: string
      venceDesde?: Date
      venceHasta?: Date
    },
  ): Promise<ChequeListResult> {
    const where: Prisma.ChequeWhereInput = {
      tenantId,
      ...(filters?.tipo ? { tipo: filters.tipo } : {}),
      ...(filters?.estado ? { estado: filters.estado } : {}),
      ...(filters?.banco ? { banco: { contains: filters.banco, mode: 'insensitive' } } : {}),
      ...(filters?.venceDesde || filters?.venceHasta
        ? {
            fechaVencimiento: {
              ...(filters.venceDesde ? { gte: filters.venceDesde } : {}),
              ...(filters.venceHasta ? { lte: filters.venceHasta } : {}),
            },
          }
        : {}),
    }
    const [total, cheques] = await Promise.all([
      this.prisma.cheque.count({ where }),
      this.prisma.cheque.findMany({
        where,
        include: chequeInclude,
        orderBy: [{ fechaVencimiento: 'asc' }, { id: 'desc' }],
        take,
        skip,
      }),
    ])
    return { total, cheques }
  }

  async getById(tenantId: number, id: number): Promise<ChequeRow | null> {
    return this.prisma.cheque.findFirst({
      where: { id, tenantId },
      include: chequeInclude,
    })
  }

  async getResumen(tenantId: number, asOf = new Date()): Promise<ChequeResumen> {
    const weekAhead = new Date(asOf)
    weekAhead.setDate(weekAhead.getDate() + 7)

    const [cartera, proximos, rechazados] = await Promise.all([
      this.prisma.cheque.aggregate({
        where: { tenantId, estado: 'en_cartera' },
        _count: { id: true },
        _sum: { monto: true },
      }),
      this.prisma.cheque.aggregate({
        where: {
          tenantId,
          estado: 'en_cartera',
          fechaVencimiento: { gte: asOf, lte: weekAhead },
        },
        _count: { id: true },
        _sum: { monto: true },
      }),
      this.prisma.cheque.aggregate({
        where: { tenantId, estado: 'rechazado' },
        _count: { id: true },
        _sum: { monto: true },
      }),
    ])

    return {
      enCartera: {
        count: cartera._count.id,
        total: decimalToMoneyString(cartera._sum.monto ?? 0),
      },
      proximosVencer: {
        count: proximos._count.id,
        total: decimalToMoneyString(proximos._sum.monto ?? 0),
      },
      rechazados: {
        count: rechazados._count.id,
        total: decimalToMoneyString(rechazados._sum.monto ?? 0),
      },
    }
  }

  async create(
    tenantId: number,
    userId: number,
    input: ChequeInput,
  ): Promise<ServiceResult<ChequeRow>> {
    if (input.tipo === 'recibido' && !input.clienteId) {
      return { ok: false, status: 400, error: 'clienteId is required for recibido cheques' }
    }
    if (input.tipo === 'emitido' && !input.proveedorId && !input.clienteId) {
      return { ok: false, status: 400, error: 'clienteId or proveedorId required for emitido' }
    }

    const estado = initialEstado(input.tipo)
    const fechaEmision = facturaFechaToPrismaDate(input.fechaEmision)
    const fechaVencimiento = facturaFechaToPrismaDate(input.fechaVencimiento)

    try {
      const cheque = await this.prisma.$transaction(async (tx) => {
        const row = await tx.cheque.create({
          data: {
            tenantId,
            tipo: input.tipo,
            modalidad: input.modalidad,
            numero: input.numero.trim(),
            banco: input.banco.trim(),
            sucursal: input.sucursal?.trim() ?? null,
            cbuOrigen: input.cbuOrigen?.trim() ?? null,
            libradorNombre: input.libradorNombre.trim(),
            libradorCuit: input.libradorCuit?.trim() ?? null,
            monto: new Decimal(input.monto),
            moneda: input.moneda?.trim() || 'ARS',
            fechaEmision,
            fechaVencimiento,
            estado,
            clienteId: input.clienteId ?? null,
            proveedorId: input.proveedorId ?? null,
            observaciones: input.observaciones?.trim() ?? null,
          },
          include: chequeInclude,
        })
        await tx.chequeMov.create({
          data: {
            chequeId: row.id,
            tipo: 'recepcion',
            monto: new Decimal(input.monto),
            userId,
            nota: input.observaciones?.trim() ?? null,
          },
        })
        return tx.cheque.findFirstOrThrow({
          where: { id: row.id },
          include: chequeInclude,
        })
      })
      return { ok: true, data: cheque }
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes('Unique constraint')) {
        return { ok: false, status: 409, error: 'CHEQUE_NUMERO_DUPLICADO' }
      }
      throw err
    }
  }

  async update(
    tenantId: number,
    id: number,
    input: ChequeUpdateInput,
  ): Promise<ServiceResult<ChequeRow>> {
    const existing = await this.prisma.cheque.findFirst({
      where: { id, tenantId },
      select: { id: true, estado: true },
    })
    if (!existing) return { ok: false, status: 404, error: 'Cheque not found' }
    if (existing.estado !== 'en_cartera') {
      return { ok: false, status: 409, error: 'ONLY_EN_CARTERA_CAN_BE_UPDATED' }
    }

    const cheque = await this.prisma.cheque.update({
      where: { id },
      data: {
        ...(input.banco !== undefined ? { banco: input.banco.trim() } : {}),
        ...(input.sucursal !== undefined ? { sucursal: input.sucursal?.trim() ?? null } : {}),
        ...(input.cbuOrigen !== undefined ? { cbuOrigen: input.cbuOrigen?.trim() ?? null } : {}),
        ...(input.libradorNombre !== undefined ? { libradorNombre: input.libradorNombre.trim() } : {}),
        ...(input.libradorCuit !== undefined ? { libradorCuit: input.libradorCuit?.trim() ?? null } : {}),
        ...(input.fechaVencimiento !== undefined
          ? { fechaVencimiento: facturaFechaToPrismaDate(input.fechaVencimiento) }
          : {}),
        ...(input.observaciones !== undefined
          ? { observaciones: input.observaciones?.trim() ?? null }
          : {}),
      },
      include: chequeInclude,
    })
    return { ok: true, data: cheque }
  }

  private async applyTransition(
    tenantId: number,
    id: number,
    userId: number,
    action: TransitionAction,
    input: ChequeTransicionInput = {},
  ): Promise<ServiceResult<ChequeRow>> {
    const existing = await this.prisma.cheque.findFirst({
      where: { id, tenantId },
    })
    if (!existing) return { ok: false, status: 404, error: 'Cheque not found' }

    const rule = TRANSITIONS[action]
    if (!rule.from.includes(existing.estado as ChequeEstado)) {
      return { ok: false, status: 409, error: 'INVALID_STATE_TRANSITION' }
    }

    if (action === 'endosar') {
      if (!input.proveedorId) {
        return { ok: false, status: 400, error: 'proveedorId is required for endoso' }
      }
      const prov = await this.prisma.proveedor.findFirst({
        where: { id: input.proveedorId, tenantId },
        select: { id: true },
      })
      if (!prov) return { ok: false, status: 400, error: 'proveedorId is not valid' }
    }

    const cheque = await this.prisma.$transaction(async (tx) => {
      await tx.chequeMov.create({
        data: {
          chequeId: id,
          tipo: rule.mov,
          monto: input.monto != null ? new Decimal(input.monto) : existing.monto,
          destino: input.destino?.trim() ?? null,
          nota: input.nota?.trim() ?? null,
          userId,
        },
      })
      const updated = await tx.cheque.update({
        where: { id },
        data: {
          estado: rule.to,
          ...(action === 'endosar' && input.proveedorId ? { proveedorId: input.proveedorId } : {}),
        },
        include: chequeInclude,
      })

      if (action === 'rechazar' && existing.clienteId != null) {
        const linkedCobro = await tx.cobro.findFirst({
          where: { tenantId, chequeId: id, clienteId: existing.clienteId },
          select: { id: true, monto: true, retencionesAplicadas: { select: { importe: true } } },
        })
        let compensatory = existing.monto
        if (linkedCobro) {
          const retTotal = linkedCobro.retencionesAplicadas.reduce(
            (sum, r) => sum.add(r.importe),
            new Decimal(0),
          )
          compensatory = linkedCobro.monto.add(retTotal)
        }
        const ccService = new ClienteCuentaCorrienteService(tx)
        await ccService.recordChequeRechazado(
          tenantId,
          existing.clienteId,
          id,
          compensatory,
          `cheque-${existing.numero}`,
          userId,
        )
      }

      return updated
    })

    if (action === 'rechazar' && existing.clienteId) {
      await notifyFinanceStakeholders(this.prisma, tenantId, 'cheque_rechazado', {
        clienteId: existing.clienteId,
        chequeId: id,
        chequeNumero: existing.numero,
        banco: existing.banco,
        amount: decimalToMoneyString(existing.monto),
        rsocial: cheque.cliente?.rsocial,
      })
    }

    return { ok: true, data: cheque }
  }

  depositar(tenantId: number, id: number, userId: number, input?: ChequeTransicionInput) {
    return this.applyTransition(tenantId, id, userId, 'depositar', input)
  }

  endosar(tenantId: number, id: number, userId: number, input: ChequeTransicionInput) {
    return this.applyTransition(tenantId, id, userId, 'endosar', input)
  }

  descontar(tenantId: number, id: number, userId: number, input?: ChequeTransicionInput) {
    return this.applyTransition(tenantId, id, userId, 'descontar', input)
  }

  cobrar(tenantId: number, id: number, userId: number, input?: ChequeTransicionInput) {
    return this.applyTransition(tenantId, id, userId, 'cobrar', input)
  }

  rechazar(tenantId: number, id: number, userId: number, input?: ChequeTransicionInput) {
    return this.applyTransition(tenantId, id, userId, 'rechazar', input)
  }

  devolverACartera(tenantId: number, id: number, userId: number, input?: ChequeTransicionInput) {
    return this.applyTransition(tenantId, id, userId, 'devolverACartera', input)
  }

  anular(tenantId: number, id: number, userId: number, input?: ChequeTransicionInput) {
    return this.applyTransition(tenantId, id, userId, 'anular', input)
  }

  async linkToCobro(tenantId: number, chequeId: number, cobroId: number): Promise<void> {
    await this.prisma.cobro.updateMany({
      where: { id: cobroId, tenantId },
      data: { chequeId },
    })
  }

  async endosarForReciboPago(
    tenantId: number,
    chequeId: number,
    proveedorId: number,
    userId: number,
    destino?: string | null,
  ): Promise<ServiceResult<ChequeRow>> {
    return this.endosar(tenantId, chequeId, userId, { proveedorId, destino })
  }
}
