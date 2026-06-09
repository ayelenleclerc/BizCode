import type { Cliente, Prisma, PrismaClient } from '@prisma/client'
import type { CobroInput } from '../createApp.types'
import { facturaFechaToPrismaDate } from '../routes/restDomainShared'
import type { ServiceResult } from './serviceResults'

type CobroWithCliente = Prisma.CobroGetPayload<{
  include: { cliente: { select: { id: true; codigo: true; rsocial: true } } }
}>

export type CobroListResult = {
  total: number
  cobros: CobroWithCliente[]
}

export type ScoreChange = {
  scoreBefore: number
  scoreAfter: number
  delta: number
}

export type CobroCreateResult = {
  cobro: CobroWithCliente
  updatedCliente: Pick<Cliente, 'id' | 'rsocial' | 'balance' | 'creditLimit' | 'score'>
  scoreChange: ScoreChange
}

function clampScore(value: number): number {
  return Math.min(100, Math.max(0, value))
}

function calendarDaysBetween(from: Date, to: Date): number {
  const msPerDay = 86_400_000
  const utcFrom = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate())
  const utcTo = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate())
  return Math.floor((utcTo - utcFrom) / msPerDay)
}

/**
 * @en Score delta from payment date vs invoice due date (days past due). Zero when no active invoice.
 * @es Delta de score según días de mora vs vencimiento. Cero sin factura activa de referencia.
 * @pt-BR Delta de score pelos dias em atraso vs vencimento. Zero sem fatura ativa de referência.
 */
export function computeScoreDelta(
  cobroFecha: Date,
  creditDays: number,
  oldestFacturaFecha: Date | null,
): number {
  if (oldestFacturaFecha === null) {
    return 0
  }
  const due = new Date(oldestFacturaFecha)
  due.setDate(due.getDate() + creditDays)
  const daysPastDue = calendarDaysBetween(due, cobroFecha)
  if (daysPastDue <= 0) return 5
  if (daysPastDue <= 10) return -3
  if (daysPastDue <= 30) return -7
  return -15
}

/**
 * @en Applies score delta with clamp 0–100.
 * @es Aplica el delta de score con límite 0–100.
 * @pt-BR Aplica o delta de score com limite 0–100.
 */
export function computeScoreAfterCobro(
  currentScore: number,
  cobroFecha: Date,
  creditDays: number,
  oldestFacturaFecha: Date | null,
): number {
  const delta = computeScoreDelta(cobroFecha, creditDays, oldestFacturaFecha)
  return clampScore(currentScore + delta)
}

/**
 * @en Full score update payload for cobro registration.
 * @es Resultado completo de actualización de score al registrar cobro.
 * @pt-BR Resultado completo de atualização de score ao registrar recebimento.
 */
export function computeScoreChange(
  currentScore: number,
  cobroFecha: Date,
  creditDays: number,
  oldestFacturaFecha: Date | null,
): ScoreChange {
  const scoreBefore = currentScore
  const delta = computeScoreDelta(cobroFecha, creditDays, oldestFacturaFecha)
  const scoreAfter = clampScore(scoreBefore + delta)
  return { scoreBefore, scoreAfter, delta }
}

/**
 * @en Customer payment operations (list, create, read).
 * @es Operaciones de cobros de clientes (listado, alta, lectura).
 * @pt-BR Operações de recebimentos de clientes (listagem, criação, leitura).
 */
export class CobroService {
  constructor(private readonly prisma: PrismaClient) {}

  async list(
    tenantId: number,
    filters: { clienteId?: number; desde?: Date; hasta?: Date },
    take: number,
    skip: number,
  ): Promise<CobroListResult> {
    const where: Prisma.CobroWhereInput = { tenantId }
    if (filters.clienteId !== undefined) {
      where.clienteId = filters.clienteId
    }
    if (filters.desde !== undefined || filters.hasta !== undefined) {
      where.fecha = {}
      if (filters.desde !== undefined) {
        where.fecha.gte = filters.desde
      }
      if (filters.hasta !== undefined) {
        where.fecha.lte = filters.hasta
      }
    }

    const [total, cobros] = await Promise.all([
      this.prisma.cobro.count({ where }),
      this.prisma.cobro.findMany({
        where,
        include: { cliente: { select: { id: true, codigo: true, rsocial: true } } },
        orderBy: { fecha: 'desc' },
        take,
        skip,
      }),
    ])
    return { total, cobros }
  }

  async getById(tenantId: number, id: number): Promise<CobroWithCliente | null> {
    return this.prisma.cobro.findFirst({
      where: { id, tenantId },
      include: { cliente: { select: { id: true, codigo: true, rsocial: true } } },
    })
  }

  async create(tenantId: number, input: CobroInput): Promise<ServiceResult<CobroCreateResult>> {
    const cliente = await this.prisma.cliente.findFirst({
      where: { id: input.clienteId, tenantId },
      select: { id: true, rsocial: true, suspended: true, activo: true, score: true, creditDays: true },
    })
    if (!cliente) {
      return { ok: false, status: 400, error: 'clienteId is not valid for this tenant' }
    }
    if (!cliente.activo) {
      return { ok: false, status: 422, error: 'CLIENT_INACTIVE' }
    }
    if (cliente.suspended) {
      return { ok: false, status: 422, error: 'CLIENT_SUSPENDED' }
    }

    if (input.formaPagoId != null) {
      const fp = await this.prisma.formaPago.findUnique({
        where: { id: input.formaPagoId },
        select: { id: true },
      })
      if (!fp) {
        return { ok: false, status: 400, error: 'formaPagoId is not valid' }
      }
    }

    const cobroFecha = facturaFechaToPrismaDate(input.fecha)
    const monto = input.monto

    const oldestFactura = await this.prisma.factura.findFirst({
      where: { tenantId, clienteId: input.clienteId, estado: 'A' },
      orderBy: { fecha: 'asc' },
      select: { fecha: true },
    })

    const scoreChange = computeScoreChange(
      cliente.score,
      cobroFecha,
      cliente.creditDays,
      oldestFactura?.fecha ?? null,
    )

    const result = await this.prisma.$transaction(async (tx) => {
      const cobro = await tx.cobro.create({
        data: {
          tenantId,
          clienteId: input.clienteId,
          fecha: cobroFecha,
          monto,
          formaPagoId: input.formaPagoId ?? null,
          referencia: input.referencia ?? null,
          nota: input.nota ?? null,
        },
        include: { cliente: { select: { id: true, codigo: true, rsocial: true } } },
      })

      const clienteUpdateData: Prisma.ClienteUpdateInput = {
        balance: { decrement: monto },
      }
      if (scoreChange.delta !== 0) {
        clienteUpdateData.score = scoreChange.scoreAfter
      }

      const updatedCliente = await tx.cliente.update({
        where: { id: input.clienteId },
        data: clienteUpdateData,
        select: { id: true, rsocial: true, balance: true, creditLimit: true, score: true },
      })

      return { cobro, updatedCliente, scoreChange }
    })

    return { ok: true, data: result }
  }
}
