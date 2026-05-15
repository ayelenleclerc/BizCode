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

export type CobroCreateResult = {
  cobro: CobroWithCliente
  updatedCliente: Pick<Cliente, 'id' | 'rsocial' | 'balance' | 'creditLimit' | 'score'>
}

function clampScore(value: number): number {
  return Math.min(100, Math.max(0, value))
}

/**
 * @en Computes payment score delta from oldest open invoice due date vs payment date.
 * @es Calcula el delta de score según vencimiento de la factura más antigua vs fecha de cobro.
 * @pt-BR Calcula o delta de score pela data de vencimento da fatura mais antiga vs data do pagamento.
 */
export function computeScoreAfterCobro(
  currentScore: number,
  cobroFecha: Date,
  creditDays: number,
  oldestFacturaFecha: Date | null,
): number {
  if (oldestFacturaFecha === null) {
    return clampScore(currentScore + 5)
  }
  const due = new Date(oldestFacturaFecha)
  due.setDate(due.getDate() + creditDays)
  if (cobroFecha.getTime() <= due.getTime()) {
    return clampScore(currentScore + 5)
  }
  return clampScore(currentScore - 10)
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
      where: { tenantId, clienteId: input.clienteId, estado: { not: 'N' } },
      orderBy: { fecha: 'asc' },
      select: { fecha: true },
    })

    const newScore = computeScoreAfterCobro(
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

      const updatedCliente = await tx.cliente.update({
        where: { id: input.clienteId },
        data: {
          balance: { decrement: monto },
          score: newScore,
        },
        select: { id: true, rsocial: true, balance: true, creditLimit: true, score: true },
      })

      return { cobro, updatedCliente }
    })

    return { ok: true, data: result }
  }
}
