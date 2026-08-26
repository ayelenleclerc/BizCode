/**
 * @en Loads aggregates and evaluates invoice anomalies before/after create (#200).
 * @es Carga agregados y evalúa anomalías de factura antes/después del create (#200).
 * @pt-BR Carrega agregados e avalia anomalias de fatura antes/depois do create (#200).
 */

import type { Prisma, PrismaClient } from '@prisma/client'
import { facturaFechaToPrismaDate } from '../routes/restDomainShared'
import {
  evaluateFacturaAnomalies,
  type FacturaAnomalyWarning,
  type LineDiscountInput,
} from './facturaAnomalyMath'

export type { FacturaAnomalyWarning }

export class FacturaAnomalyService {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * @en Analyze proposed invoice; does not persist.
   * @es Analiza la factura propuesta; no persiste.
   * @pt-BR Analisa a fatura proposta; não persiste.
   */
  async analyze(input: {
    tenantId: number
    clienteId: number
    fecha: string
    total: number
    lines: LineDiscountInput[]
  }): Promise<FacturaAnomalyWarning[]> {
    const fecha = facturaFechaToPrismaDate(input.fecha)
    const dayStart = new Date(fecha)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(fecha)
    dayEnd.setHours(23, 59, 59, 999)

    const [cliente, priorCount, priorRows, duplicate] = await Promise.all([
      this.prisma.cliente.findFirst({
        where: { id: input.clienteId, tenantId: input.tenantId },
        select: { creditLimit: true },
      }),
      this.prisma.factura.count({
        where: { tenantId: input.tenantId, clienteId: input.clienteId, estado: 'A' },
      }),
      this.prisma.factura.findMany({
        where: { tenantId: input.tenantId, clienteId: input.clienteId, estado: 'A' },
        select: { total: true },
        orderBy: { fecha: 'desc' },
        take: 200,
      }),
      this.prisma.factura.findFirst({
        where: {
          tenantId: input.tenantId,
          clienteId: input.clienteId,
          estado: 'A',
          total: input.total,
          fecha: { gte: dayStart, lte: dayEnd },
        },
        select: { id: true },
      }),
    ])

    const creditLimit =
      cliente?.creditLimit != null ? Number(cliente.creditLimit.toString()) : null
    const priorTotals = priorRows.map((r) => Number(r.total.toString()))

    return evaluateFacturaAnomalies({
      total: input.total,
      priorInvoiceCount: priorCount,
      priorTotals,
      hasDuplicateSameDay: duplicate != null,
      creditLimit,
      lines: input.lines,
    })
  }

  /**
   * @en Persist detected anomalies linked to a saved invoice.
   * @es Persiste anomalías detectadas vinculadas a una factura guardada.
   * @pt-BR Persiste anomalias detectadas vinculadas a uma fatura salva.
   */
  async persist(
    tenantId: number,
    facturaId: number,
    clienteId: number,
    warnings: FacturaAnomalyWarning[],
    confirmada: boolean,
  ): Promise<void> {
    if (warnings.length === 0) return
    const data: Prisma.AnomaliaDetectadaCreateManyInput[] = warnings.map((w) => ({
      tenantId,
      tipo: w.tipo,
      severidad: w.severidad,
      facturaId,
      clienteId,
      descripcion: w.descripcion.slice(0, 500),
      detalle: w.detalle ?? undefined,
      confirmada,
    }))
    await this.prisma.anomaliaDetectada.createMany({ data })
  }
}
