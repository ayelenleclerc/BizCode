/**
 * @en Bank reconciliation orchestration (#191): runs the matching engine against unlocked bank
 * movements, persists auto-matches/suggestions, and exposes manual confirm/ignore/lock actions.
 * @es Orquestación de conciliación bancaria (#191): ejecuta el motor de matching sobre movimientos
 * no bloqueados, persiste auto-conciliaciones/sugerencias, y expone acciones manuales de
 * confirmar/ignorar/bloquear.
 * @pt-BR Orquestração de conciliação bancária (#191): executa o motor de matching sobre movimentos
 * não bloqueados, persiste auto-conciliações/sugestões, e expõe ações manuais de
 * confirmar/ignorar/bloquear.
 */
import { createRequire } from 'node:module'
import { Prisma, type MovimientoBancario, type PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import {
  findMatches,
  type MatchCandidate,
  type MovementLike,
} from './bancos/matchEngine'
import { CHEQUE_DATE_TOLERANCE_DAYS, DATE_TOLERANCE_DAYS, type ConciliadoTipo, type MatchEstado } from './bancos/matchingConstants'
import type { ServiceFailure, ServiceResult } from './serviceResults'

const require = createRequire(import.meta.url)
const ExcelJS = require('exceljs') as typeof import('exceljs')

const RECIBO_FORMA_TIPOS_CONCILIABLES = ['transferencia', 'mercadopago', 'cheque'] as const

const reciboCobroFormaInclude = {
  reciboCobro: { include: { cliente: true } },
  cheque: true,
} satisfies Prisma.ReciboCobroFormaInclude

const cobroInclude = {
  cliente: true,
  cheque: true,
  formaPago: true,
} satisfies Prisma.CobroInclude

type ReciboCobroFormaRow = Prisma.ReciboCobroFormaGetPayload<{ include: typeof reciboCobroFormaInclude }>
type CobroRow = Prisma.CobroGetPayload<{ include: typeof cobroInclude }>

export type MatchSugerenciaDto = {
  tipo: ConciliadoTipo
  id: number
  clienteId: number
  importe: number
  fecha: string
  referencia: string | null
}

export type ConciliacionMovimientoDto = {
  id: number
  cuentaId: number
  fecha: string
  descripcion: string
  importe: string
  tipo: string
  referencia: string | null
  matchEstado: MatchEstado
  conciliadoTipo: ConciliadoTipo | null
  conciliadoId: number | null
  conciliadoAt: string | null
  matchScore: number | null
  matchSugerencias: MatchSugerenciaDto[] | null
  periodoLocked: boolean
}

export type ConciliacionSummary = {
  total: number
  unmatched: number
  suggested: number
  matchedAuto: number
  matchedManual: number
  ignored: number
  bankFees: number
  openCandidates: { recibosForma: number; cobros: number }
}

export type ConciliacionDto = {
  movimientos: ConciliacionMovimientoDto[]
  summary: ConciliacionSummary
}

export type RunMatchingSummary = {
  processed: number
  autoMatched: number
  suggested: number
  unmatched: number
  bankFees: number
}

export type ConciliarManualTarget = {
  tipo: ConciliadoTipo
  id: number
}

function toNumber(value: Decimal | number | null | undefined): number {
  if (value == null) return 0
  return typeof value === 'number' ? value : Number(value.toString())
}

function money(value: Decimal | number | null | undefined): string {
  if (value == null) return '0.00'
  return typeof value === 'number' ? value.toFixed(2) : value.toFixed(2)
}

function periodoOf(date: Date): string {
  return date.toISOString().slice(0, 7)
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 86_400_000)
}

/**
 * @en Heuristically flags a legacy Cobro as a Mercado Pago collection from its payment-form label
 * or referencia text, since the legacy model has no dedicated MP flag.
 * @es Marca heurísticamente un Cobro legado como cobro de Mercado Pago según la etiqueta de su
 * forma de pago o el texto de referencia, dado que el modelo legado no tiene un flag de MP dedicado.
 * @pt-BR Sinaliza heuristicamente um Cobro legado como recebimento do Mercado Pago a partir do
 * rótulo da forma de pagamento ou do texto de referência, já que o modelo legado não possui um
 * flag de MP dedicado.
 */
function isCobroMercadoPago(cobro: CobroRow): boolean {
  const label = `${cobro.formaPago?.descripcion ?? ''} ${cobro.referencia ?? ''}`.toLowerCase()
  return label.includes('mercado pago') || label.includes('mercadopago')
}

function toFormaCandidate(forma: ReciboCobroFormaRow): MatchCandidate {
  return {
    tipo: 'recibo_forma',
    id: forma.id,
    clienteId: forma.reciboCobro.clienteId,
    fecha: forma.reciboCobro.fecha,
    importe: toNumber(forma.importe),
    referencia: forma.referencia,
    banco: forma.banco,
    chequeVencimiento: forma.cheque?.fechaVencimiento ?? null,
    isMercadoPago: forma.tipo === 'mercadopago',
    clienteCbu: forma.reciboCobro.cliente.cbu,
    clienteAlias: forma.reciboCobro.cliente.alias,
  }
}

function toCobroCandidate(cobro: CobroRow): MatchCandidate {
  return {
    tipo: 'cobro',
    id: cobro.id,
    clienteId: cobro.clienteId,
    fecha: cobro.fecha,
    importe: toNumber(cobro.monto),
    referencia: cobro.referencia,
    banco: null,
    chequeVencimiento: cobro.cheque?.fechaVencimiento ?? null,
    isMercadoPago: isCobroMercadoPago(cobro),
    clienteCbu: cobro.cliente.cbu,
    clienteAlias: cobro.cliente.alias,
  }
}

function candidateKey(tipo: string, id: number): string {
  return `${tipo}:${id}`
}

function parseSugerencias(value: Prisma.JsonValue | null): MatchSugerenciaDto[] | null {
  if (value == null || !Array.isArray(value)) return null
  return value as unknown as MatchSugerenciaDto[]
}

function toSugerenciaDto(candidate: MatchCandidate): MatchSugerenciaDto {
  return {
    tipo: candidate.tipo,
    id: candidate.id,
    clienteId: candidate.clienteId,
    importe: candidate.importe,
    fecha: candidate.fecha.toISOString(),
    referencia: candidate.referencia ?? null,
  }
}

/**
 * @en Bank reconciliation service: loads candidates, runs the pure matching engine, persists
 * auto-matches and suggestions, and handles manual confirm/ignore/lock workflows (#191).
 * @es Servicio de conciliación bancaria: carga candidatos, ejecuta el motor de matching puro,
 * persiste auto-conciliaciones y sugerencias, y maneja flujos manuales de confirmar/ignorar/bloquear (#191).
 * @pt-BR Serviço de conciliação bancária: carrega candidatos, executa o motor de matching puro,
 * persiste auto-conciliações e sugestões, e trata fluxos manuais de confirmar/ignorar/bloquear (#191).
 */
export class BancoConciliacionService {
  constructor(private readonly prisma: PrismaClient) {}

  private async getLockedPeriodsSet(tenantId: number, cuentaId: number): Promise<Set<string>> {
    const rows = await this.prisma.periodoBancarioLock.findMany({
      where: { tenantId, cuentaId },
      select: { periodo: true },
    })
    return new Set(rows.map((r) => r.periodo))
  }

  private async loadUsedCandidateIds(tenantId: number): Promise<Set<string>> {
    const rows = await this.prisma.movimientoBancario.findMany({
      where: { conciliadoTipo: { not: null }, cuenta: { tenantId } },
      select: { conciliadoTipo: true, conciliadoId: true },
    })
    return new Set(
      rows
        .filter((r) => r.conciliadoTipo != null && r.conciliadoId != null)
        .map((r) => candidateKey(r.conciliadoTipo as string, r.conciliadoId as number)),
    )
  }

  private async loadCandidates(tenantId: number, desde: Date, hasta: Date): Promise<MatchCandidate[]> {
    const margin = Math.max(DATE_TOLERANCE_DAYS, CHEQUE_DATE_TOLERANCE_DAYS)
    const desdeMargin = addDays(desde, -margin)
    const hastaMargin = addDays(hasta, margin)

    const [formas, cobros] = await Promise.all([
      this.prisma.reciboCobroForma.findMany({
        where: {
          tipo: { in: [...RECIBO_FORMA_TIPOS_CONCILIABLES] },
          reciboCobro: { tenantId, estado: 'emitido' },
          OR: [
            { reciboCobro: { fecha: { gte: desdeMargin, lte: hastaMargin } } },
            { cheque: { fechaVencimiento: { gte: desdeMargin, lte: hastaMargin } } },
          ],
        },
        include: reciboCobroFormaInclude,
      }),
      this.prisma.cobro.findMany({
        where: {
          tenantId,
          OR: [
            { fecha: { gte: desdeMargin, lte: hastaMargin } },
            { cheque: { fechaVencimiento: { gte: desdeMargin, lte: hastaMargin } } },
          ],
        },
        include: cobroInclude,
      }),
    ])

    return [...formas.map(toFormaCandidate), ...cobros.map(toCobroCandidate)]
  }

  private serializeMovimiento(row: MovimientoBancario, lockedPeriods: Set<string>): ConciliacionMovimientoDto {
    return {
      id: row.id,
      cuentaId: row.cuentaId,
      fecha: row.fecha.toISOString(),
      descripcion: row.descripcion,
      importe: money(row.importe),
      tipo: row.tipo,
      referencia: row.referencia,
      matchEstado: row.matchEstado as MatchEstado,
      conciliadoTipo: row.conciliadoTipo as ConciliadoTipo | null,
      conciliadoId: row.conciliadoId,
      conciliadoAt: row.conciliadoAt?.toISOString() ?? null,
      matchScore: row.matchScore != null ? toNumber(row.matchScore) : null,
      matchSugerencias: parseSugerencias(row.matchSugerencias),
      periodoLocked: lockedPeriods.has(periodoOf(row.fecha)),
    }
  }

  /**
   * @en Lists movements in a date range with their current match state, plus a summary including
   * how many collection candidates in that window remain unreconciled.
   * @es Lista movimientos en un rango de fechas con su estado de conciliación actual, más un
   * resumen con cuántos candidatos de cobro en esa ventana permanecen sin conciliar.
   * @pt-BR Lista movimentos em um intervalo de datas com seu estado de conciliação atual, mais um
   * resumo com quantos candidatos de recebimento nessa janela permanecem sem conciliar.
   */
  async getConciliacion(
    tenantId: number,
    cuentaId: number,
    desde: Date,
    hasta: Date,
  ): Promise<ServiceResult<ConciliacionDto>> {
    const cuenta = await this.prisma.cuentaBancaria.findFirst({ where: { id: cuentaId, tenantId } })
    if (!cuenta) return { ok: false, status: 404, error: 'Bank account not found' }

    const [rows, lockedPeriods, usedIds] = await Promise.all([
      this.prisma.movimientoBancario.findMany({
        where: { cuentaId, fecha: { gte: desde, lte: hasta } },
        orderBy: [{ fecha: 'desc' }, { id: 'desc' }],
      }),
      this.getLockedPeriodsSet(tenantId, cuentaId),
      this.loadUsedCandidateIds(tenantId),
    ])

    const candidates = await this.loadCandidates(tenantId, desde, hasta)
    const openCandidates = candidates.filter((c) => !usedIds.has(candidateKey(c.tipo, c.id)))

    const movimientos = rows.map((row) => this.serializeMovimiento(row, lockedPeriods))
    const summary: ConciliacionSummary = {
      total: movimientos.length,
      unmatched: movimientos.filter((m) => m.matchEstado === 'unmatched').length,
      suggested: movimientos.filter((m) => m.matchEstado === 'suggested').length,
      matchedAuto: movimientos.filter((m) => m.matchEstado === 'matched_auto').length,
      matchedManual: movimientos.filter((m) => m.matchEstado === 'matched_manual').length,
      ignored: movimientos.filter((m) => m.matchEstado === 'ignored').length,
      bankFees: movimientos.filter((m) => m.matchEstado === 'bank_fee').length,
      openCandidates: {
        recibosForma: openCandidates.filter((c) => c.tipo === 'recibo_forma').length,
        cobros: openCandidates.filter((c) => c.tipo === 'cobro').length,
      },
    }

    return { ok: true, data: { movimientos, summary } }
  }

  /**
   * @en Runs the matching engine over unlocked, still-open movements in the range and persists
   * auto-matches, suggestions, and bank-fee classifications.
   * @es Ejecuta el motor de matching sobre movimientos abiertos y no bloqueados del rango, y
   * persiste auto-conciliaciones, sugerencias y clasificaciones de gasto bancario.
   * @pt-BR Executa o motor de matching sobre movimentos abertos e não bloqueados do intervalo, e
   * persiste auto-conciliações, sugestões e classificações de encargo bancário.
   */
  async runMatching(
    tenantId: number,
    cuentaId: number,
    desde: Date,
    hasta: Date,
  ): Promise<ServiceResult<RunMatchingSummary>> {
    const cuenta = await this.prisma.cuentaBancaria.findFirst({ where: { id: cuentaId, tenantId } })
    if (!cuenta) return { ok: false, status: 404, error: 'Bank account not found' }

    const movimientos = await this.prisma.movimientoBancario.findMany({
      where: {
        cuentaId,
        fecha: { gte: desde, lte: hasta },
        matchEstado: { in: ['unmatched', 'suggested'] },
      },
      orderBy: [{ fecha: 'asc' }, { id: 'asc' }],
    })

    const summary: RunMatchingSummary = { processed: 0, autoMatched: 0, suggested: 0, unmatched: 0, bankFees: 0 }
    if (movimientos.length === 0) return { ok: true, data: summary }

    const lockedPeriods = await this.getLockedPeriodsSet(tenantId, cuentaId)
    const unlockedMovs = movimientos.filter((m) => !lockedPeriods.has(periodoOf(m.fecha)))

    const [candidates, usedIds] = await Promise.all([
      this.loadCandidates(tenantId, desde, hasta),
      this.loadUsedCandidateIds(tenantId),
    ])

    for (const mov of unlockedMovs) {
      const movLike: MovementLike = {
        id: mov.id,
        fecha: mov.fecha,
        descripcion: mov.descripcion,
        importe: toNumber(mov.importe),
        tipo: mov.tipo as 'debito' | 'credito',
        referencia: mov.referencia,
      }
      const result = findMatches(movLike, candidates, usedIds)
      summary.processed++

      if (result.status === 'auto') {
        const winner = result.winners[0]!
        usedIds.add(candidateKey(winner.tipo, winner.id))
        await this.prisma.movimientoBancario.update({
          where: { id: mov.id },
          data: {
            matchEstado: 'matched_auto',
            conciliadoTipo: winner.tipo,
            conciliadoId: winner.id,
            conciliadoAt: new Date(),
            matchScore: new Decimal(result.score.toFixed(2)),
            matchSugerencias: Prisma.DbNull,
          },
        })
        summary.autoMatched++
      } else if (result.status === 'suggested') {
        await this.prisma.movimientoBancario.update({
          where: { id: mov.id },
          data: {
            matchEstado: 'suggested',
            matchScore: new Decimal(result.score.toFixed(2)),
            matchSugerencias: result.winners.map(toSugerenciaDto) as unknown as Prisma.InputJsonValue,
          },
        })
        summary.suggested++
      } else if (result.status === 'bank_fee') {
        await this.prisma.movimientoBancario.update({
          where: { id: mov.id },
          data: { matchEstado: 'bank_fee', matchScore: null, matchSugerencias: Prisma.DbNull },
        })
        summary.bankFees++
      } else {
        if (mov.matchEstado !== 'unmatched') {
          await this.prisma.movimientoBancario.update({
            where: { id: mov.id },
            data: { matchEstado: 'unmatched', matchScore: null, matchSugerencias: Prisma.DbNull },
          })
        }
        summary.unmatched++
      }
    }

    return { ok: true, data: summary }
  }

  private async findMovimiento(tenantId: number, movimientoId: number) {
    return this.prisma.movimientoBancario.findFirst({
      where: { id: movimientoId, cuenta: { tenantId } },
    })
  }

  private async assertPeriodoUnlocked(
    tenantId: number,
    cuentaId: number,
    fecha: Date,
  ): Promise<ServiceFailure | null> {
    const locked = await this.isPeriodoLocked(tenantId, cuentaId, fecha)
    if (locked) {
      return { ok: false, status: 409, error: `Period ${periodoOf(fecha)} is locked for reconciliation` }
    }
    return null
  }

  /**
   * @en Manually reconciles a movement against a specific ReciboCobroForma or legacy Cobro,
   * rejecting the request if the candidate is already used elsewhere or the period is locked.
   * @es Concilia manualmente un movimiento contra un ReciboCobroForma o Cobro legado específico,
   * rechazando la solicitud si el candidato ya está usado o el período está bloqueado.
   * @pt-BR Concilia manualmente um movimento contra um ReciboCobroForma ou Cobro legado específico,
   * rejeitando a solicitação se o candidato já estiver usado ou o período estiver bloqueado.
   */
  async conciliarManual(
    tenantId: number,
    movimientoId: number,
    target: ConciliarManualTarget,
    userId?: number,
  ): Promise<ServiceResult<ConciliacionMovimientoDto>> {
    void userId // reserved for a future audit trail column (#191)

    const mov = await this.findMovimiento(tenantId, movimientoId)
    if (!mov) return { ok: false, status: 404, error: 'Bank movement not found' }

    const lockError = await this.assertPeriodoUnlocked(tenantId, mov.cuentaId, mov.fecha)
    if (lockError) return lockError

    const alreadyUsed = await this.prisma.movimientoBancario.findFirst({
      where: {
        conciliadoTipo: target.tipo,
        conciliadoId: target.id,
        id: { not: movimientoId },
        cuenta: { tenantId },
      },
    })
    if (alreadyUsed) {
      return { ok: false, status: 409, error: 'Candidate is already reconciled with another movement' }
    }

    const targetExists =
      target.tipo === 'recibo_forma'
        ? await this.prisma.reciboCobroForma.findFirst({
            where: { id: target.id, reciboCobro: { tenantId } },
          })
        : await this.prisma.cobro.findFirst({ where: { id: target.id, tenantId } })
    if (!targetExists) return { ok: false, status: 404, error: 'Reconciliation target not found' }

    const updated = await this.prisma.movimientoBancario.update({
      where: { id: movimientoId },
      data: {
        matchEstado: 'matched_manual',
        conciliadoTipo: target.tipo,
        conciliadoId: target.id,
        conciliadoAt: new Date(),
        matchSugerencias: Prisma.DbNull,
      },
    })

    const lockedPeriods = await this.getLockedPeriodsSet(tenantId, mov.cuentaId)
    return { ok: true, data: this.serializeMovimiento(updated, lockedPeriods) }
  }

  /**
   * @en Confirms the primary (highest-score) suggestion of a `suggested` movement as a manual match.
   * @es Confirma la sugerencia primaria (mayor puntaje) de un movimiento `suggested` como
   * conciliación manual.
   * @pt-BR Confirma a sugestão primária (maior pontuação) de um movimento `suggested` como
   * conciliação manual.
   */
  async confirmarSugerencia(
    tenantId: number,
    movimientoId: number,
    userId?: number,
  ): Promise<ServiceResult<ConciliacionMovimientoDto>> {
    const mov = await this.findMovimiento(tenantId, movimientoId)
    if (!mov) return { ok: false, status: 404, error: 'Bank movement not found' }
    if (mov.matchEstado !== 'suggested') {
      return { ok: false, status: 400, error: 'Bank movement has no pending suggestion to confirm' }
    }
    const sugerencias = parseSugerencias(mov.matchSugerencias)
    const primary = sugerencias?.[0]
    if (!primary) {
      return { ok: false, status: 400, error: 'Bank movement has no suggestion payload' }
    }
    return this.conciliarManual(tenantId, movimientoId, { tipo: primary.tipo, id: primary.id }, userId)
  }

  /**
   * @en Marks a movement as ignored (excluded from reconciliation) without linking a candidate.
   * @es Marca un movimiento como ignorado (excluido de la conciliación) sin vincular un candidato.
   * @pt-BR Marca um movimento como ignorado (excluído da conciliação) sem vincular um candidato.
   */
  async ignorar(tenantId: number, movimientoId: number): Promise<ServiceResult<ConciliacionMovimientoDto>> {
    const mov = await this.findMovimiento(tenantId, movimientoId)
    if (!mov) return { ok: false, status: 404, error: 'Bank movement not found' }
    const lockError = await this.assertPeriodoUnlocked(tenantId, mov.cuentaId, mov.fecha)
    if (lockError) return lockError

    const updated = await this.prisma.movimientoBancario.update({
      where: { id: movimientoId },
      data: {
        matchEstado: 'ignored',
        conciliadoTipo: null,
        conciliadoId: null,
        conciliadoAt: null,
        matchSugerencias: Prisma.DbNull,
      },
    })
    const lockedPeriods = await this.getLockedPeriodsSet(tenantId, mov.cuentaId)
    return { ok: true, data: this.serializeMovimiento(updated, lockedPeriods) }
  }

  /**
   * @en Manually reclassifies a movement as a bank fee/charge, excluding it from reconciliation.
   * @es Reclasifica manualmente un movimiento como gasto/comisión bancaria, excluyéndolo de la
   * conciliación.
   * @pt-BR Reclassifica manualmente um movimento como encargo/taxa bancária, excluindo-o da
   * conciliação.
   */
  async marcarGastoBancario(
    tenantId: number,
    movimientoId: number,
  ): Promise<ServiceResult<ConciliacionMovimientoDto>> {
    const mov = await this.findMovimiento(tenantId, movimientoId)
    if (!mov) return { ok: false, status: 404, error: 'Bank movement not found' }
    const lockError = await this.assertPeriodoUnlocked(tenantId, mov.cuentaId, mov.fecha)
    if (lockError) return lockError

    const updated = await this.prisma.movimientoBancario.update({
      where: { id: movimientoId },
      data: {
        matchEstado: 'bank_fee',
        conciliadoTipo: null,
        conciliadoId: null,
        conciliadoAt: null,
        matchScore: null,
        matchSugerencias: Prisma.DbNull,
      },
    })
    const lockedPeriods = await this.getLockedPeriodsSet(tenantId, mov.cuentaId)
    return { ok: true, data: this.serializeMovimiento(updated, lockedPeriods) }
  }

  /**
   * @en Locks a YYYY-MM reconciliation period for an account so its movements can no longer be
   * mutated by matching or manual actions.
   * @es Bloquea un período YYYY-MM de conciliación de una cuenta para que sus movimientos no
   * puedan mutarse más por matching o acciones manuales.
   * @pt-BR Bloqueia um período YYYY-MM de conciliação de uma conta para que seus movimentos não
   * possam mais ser alterados por matching ou ações manuais.
   */
  async lockPeriodo(
    tenantId: number,
    cuentaId: number,
    periodo: string,
    userId: number,
  ): Promise<ServiceResult<{ periodo: string; lockedAt: string }>> {
    if (!/^\d{4}-\d{2}$/.test(periodo)) {
      return { ok: false, status: 400, error: 'periodo must be formatted YYYY-MM' }
    }
    const cuenta = await this.prisma.cuentaBancaria.findFirst({ where: { id: cuentaId, tenantId } })
    if (!cuenta) return { ok: false, status: 404, error: 'Bank account not found' }

    const existing = await this.prisma.periodoBancarioLock.findFirst({ where: { cuentaId, periodo } })
    if (existing) return { ok: false, status: 409, error: `Period ${periodo} is already locked` }

    const row = await this.prisma.periodoBancarioLock.create({
      data: { tenantId, cuentaId, periodo, lockedByUserId: userId },
    })
    return { ok: true, data: { periodo: row.periodo, lockedAt: row.lockedAt.toISOString() } }
  }

  /**
   * @en Unlocks a previously locked YYYY-MM reconciliation period for an account.
   * @es Desbloquea un período YYYY-MM de conciliación previamente bloqueado de una cuenta.
   * @pt-BR Desbloqueia um período YYYY-MM de conciliação previamente bloqueado de uma conta.
   */
  async unlockPeriodo(tenantId: number, cuentaId: number, periodo: string): Promise<ServiceResult<null>> {
    const cuenta = await this.prisma.cuentaBancaria.findFirst({ where: { id: cuentaId, tenantId } })
    if (!cuenta) return { ok: false, status: 404, error: 'Bank account not found' }

    const existing = await this.prisma.periodoBancarioLock.findFirst({ where: { cuentaId, periodo } })
    if (!existing) return { ok: false, status: 404, error: `Period ${periodo} is not locked` }

    await this.prisma.periodoBancarioLock.delete({ where: { id: existing.id } })
    return { ok: true, data: null }
  }

  /**
   * @en Checks whether the reconciliation period containing `dateOrPeriodo` is locked for an account.
   * @es Verifica si el período de conciliación que contiene `dateOrPeriodo` está bloqueado para una cuenta.
   * @pt-BR Verifica se o período de conciliação que contém `dateOrPeriodo` está bloqueado para uma conta.
   */
  async isPeriodoLocked(tenantId: number, cuentaId: number, dateOrPeriodo: Date | string): Promise<boolean> {
    const periodo = typeof dateOrPeriodo === 'string' ? dateOrPeriodo : periodoOf(dateOrPeriodo)
    const lock = await this.prisma.periodoBancarioLock.findFirst({ where: { tenantId, cuentaId, periodo } })
    return lock != null
  }

  /**
   * @en Builds an Excel workbook of bank movements and their reconciliation state for a date
   * range, for manual review or audit purposes. Throws if the account does not belong to the tenant.
   * @es Construye un libro Excel de movimientos bancarios y su estado de conciliación para un
   * rango de fechas, para revisión manual o auditoría. Lanza error si la cuenta no pertenece al tenant.
   * @pt-BR Constrói uma planilha Excel de movimentos bancários e seu estado de conciliação para um
   * intervalo de datas, para revisão manual ou auditoria. Lança erro se a conta não pertencer ao tenant.
   */
  async exportExcel(tenantId: number, cuentaId: number, desde: Date, hasta: Date): Promise<Buffer> {
    const cuenta = await this.prisma.cuentaBancaria.findFirst({ where: { id: cuentaId, tenantId } })
    if (!cuenta) throw new Error('Bank account not found')

    const rows = await this.prisma.movimientoBancario.findMany({
      where: { cuentaId, fecha: { gte: desde, lte: hasta } },
      orderBy: [{ fecha: 'asc' }, { id: 'asc' }],
    })

    const workbook = new ExcelJS.Workbook()
    workbook.creator = 'BizCode'
    workbook.created = new Date()

    const sheet = workbook.addWorksheet('Conciliacion')
    sheet.columns = [
      { header: 'Fecha', key: 'fecha', width: 12 },
      { header: 'Descripcion', key: 'descripcion', width: 40 },
      { header: 'Importe', key: 'importe', width: 14 },
      { header: 'Tipo', key: 'tipo', width: 10 },
      { header: 'MatchEstado', key: 'matchEstado', width: 16 },
      { header: 'ConciliadoTipo', key: 'conciliadoTipo', width: 14 },
      { header: 'ConciliadoId', key: 'conciliadoId', width: 12 },
      { header: 'Referencia', key: 'referencia', width: 20 },
    ]

    for (const row of rows) {
      sheet.addRow({
        fecha: row.fecha.toISOString().slice(0, 10),
        descripcion: row.descripcion,
        importe: money(row.importe),
        tipo: row.tipo,
        matchEstado: row.matchEstado,
        conciliadoTipo: row.conciliadoTipo ?? '',
        conciliadoId: row.conciliadoId ?? '',
        referencia: row.referencia ?? '',
      })
    }

    const buffer = await workbook.xlsx.writeBuffer()
    return Buffer.from(buffer)
  }
}
