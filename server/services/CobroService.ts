import type { Cliente, Prisma, PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import type { CobroInput } from '../createApp.types'
import { facturaFechaToPrismaDate } from '../routes/restDomainShared'
import type { ServiceResult } from './serviceResults'
import { RetencionConstanciaService } from './RetencionConstanciaService'
import { validateCobroRetenciones } from './RetencionCobroValidation'

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

export type CobroRetencionDto = {
  id: number
  regimenId: number
  regimenNombre: string
  tipo: string
  baseImponible: string
  alicuota: string
  importe: string
  constanciaNum: string | null
}

export type CobroCreateResult = {
  cobro: CobroWithCliente
  updatedCliente: Pick<Cliente, 'id' | 'rsocial' | 'balance' | 'creditLimit' | 'score'>
  scoreChange: ScoreChange
  retenciones: CobroRetencionDto[]
  montoBruto: string
}

const cobroRetencionInclude = {
  regimen: { select: { nombre: true, tipo: true } },
} as const

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

    const retencionValidation = await validateCobroRetenciones(
      this.prisma,
      tenantId,
      monto,
      input.retenciones,
    )
    if (!retencionValidation.ok) {
      return { ok: false, status: retencionValidation.status, error: retencionValidation.error }
    }

    const validatedRetenciones = retencionValidation.lines
    const montoBruto = retencionValidation.montoBruto

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

      const retencionRows: CobroRetencionDto[] = []
      if (validatedRetenciones.length > 0) {
        const constanciaService = new RetencionConstanciaService(tx)
        for (const line of validatedRetenciones) {
          const constanciaNum = await constanciaService.nextConstanciaNum(
            tenantId,
            line.tipo,
            line.provincia,
          )
          const row = await tx.retencionAplicada.create({
            data: {
              tenantId,
              regimenId: line.regimenId,
              tipo: line.subtipo,
              entidadTipo: 'cliente',
              entidadId: input.clienteId,
              cobroId: cobro.id,
              baseImponible: new Decimal(line.baseImponible),
              alicuota: new Decimal(line.alicuota),
              importe: new Decimal(line.importe),
              constanciaNum,
            },
            include: cobroRetencionInclude,
          })
          retencionRows.push({
            id: row.id,
            regimenId: row.regimenId,
            regimenNombre: row.regimen.nombre,
            tipo: row.regimen.tipo,
            baseImponible: row.baseImponible.toString(),
            alicuota: row.alicuota.toString(),
            importe: row.importe.toString(),
            constanciaNum: row.constanciaNum,
          })
        }
      }

      const clienteUpdateData: Prisma.ClienteUpdateInput = {
        balance: { decrement: montoBruto },
      }
      if (scoreChange.delta !== 0) {
        clienteUpdateData.score = scoreChange.scoreAfter
      }

      const updatedCliente = await tx.cliente.update({
        where: { id: input.clienteId },
        data: clienteUpdateData,
        select: { id: true, rsocial: true, balance: true, creditLimit: true, score: true },
      })

      return {
        cobro,
        updatedCliente,
        scoreChange,
        retenciones: retencionRows,
        montoBruto: montoBruto.toFixed(2),
      }
    })

    return { ok: true, data: result }
  }

  async listRetencionesByCobro(
    tenantId: number,
    cobroId: number,
  ): Promise<CobroRetencionDto[] | null> {
    const cobro = await this.prisma.cobro.findFirst({
      where: { id: cobroId, tenantId },
      select: { id: true },
    })
    if (cobro == null) return null

    const rows = await this.prisma.retencionAplicada.findMany({
      where: { tenantId, cobroId, tipo: 'retencion' },
      include: cobroRetencionInclude,
      orderBy: { id: 'asc' },
    })

    return rows.map((row) => ({
      id: row.id,
      regimenId: row.regimenId,
      regimenNombre: row.regimen.nombre,
      tipo: row.regimen.tipo,
      baseImponible: row.baseImponible.toString(),
      alicuota: row.alicuota.toString(),
      importe: row.importe.toString(),
      constanciaNum: row.constanciaNum,
    }))
  }
}
