/**
 * @en Loads aggregates and evaluates invoice anomalies before/after create (#200).
 * @es Carga agregados y evalúa anomalías de factura antes/después del create (#200).
 * @pt-BR Carrega agregados e avalia anomalias de fatura antes/depois do create (#200).
 */

import type { Prisma, PrismaClient } from '@prisma/client'
import type {
  AnomaliaDetectadaListFilters,
  AnomaliaDetectadaRow,
  ConfigAnomaliaFacturaRow,
  ConfigAnomaliaFacturaUpsertInput,
} from '@bizcode/types'
import { facturaFechaToPrismaDate } from '../routes/restDomainShared'
import type { ServiceResult } from './serviceResults'
import {
  DEFAULT_FACTURA_ANOMALY_THRESHOLDS,
  evaluateFacturaAnomalies,
  type FacturaAnomalyThresholds,
  type FacturaAnomalyWarning,
  type LineDiscountInput,
} from './facturaAnomalyMath'

export type { FacturaAnomalyWarning }

function mapConfig(row: {
  id: number
  tenantId: number
  minHistory: number
  zScoreThreshold: { toString(): string } | number
  discountThresholdPct: { toString(): string } | number
  newCustomerCreditFraction: { toString(): string } | number
  createdAt: Date
  updatedAt: Date
}): ConfigAnomaliaFacturaRow {
  return {
    id: row.id,
    tenantId: row.tenantId,
    minHistory: row.minHistory,
    zScoreThreshold: Number(row.zScoreThreshold.toString()),
    discountThresholdPct: Number(row.discountThresholdPct.toString()),
    newCustomerCreditFraction: Number(row.newCustomerCreditFraction.toString()),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

function rowToThresholds(row: ConfigAnomaliaFacturaRow): FacturaAnomalyThresholds {
  return {
    minHistory: row.minHistory,
    zScoreThreshold: row.zScoreThreshold,
    discountThresholdPct: row.discountThresholdPct,
    newCustomerCreditFraction: row.newCustomerCreditFraction,
  }
}

export class FacturaAnomalyService {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * @en Load or lazily create tenant anomaly thresholds (MVP defaults).
   * @es Carga o crea lazy umbrales de anomalía del tenant (defaults MVP).
   * @pt-BR Carrega ou cria lazy limiares de anomalia do tenant (defaults MVP).
   */
  async getConfig(tenantId: number): Promise<ConfigAnomaliaFacturaRow> {
    const existing = await this.prisma.configAnomaliaFactura.findUnique({ where: { tenantId } })
    if (existing) return mapConfig(existing)
    const created = await this.prisma.configAnomaliaFactura.create({
      data: {
        tenantId,
        minHistory: DEFAULT_FACTURA_ANOMALY_THRESHOLDS.minHistory,
        zScoreThreshold: DEFAULT_FACTURA_ANOMALY_THRESHOLDS.zScoreThreshold,
        discountThresholdPct: DEFAULT_FACTURA_ANOMALY_THRESHOLDS.discountThresholdPct,
        newCustomerCreditFraction: DEFAULT_FACTURA_ANOMALY_THRESHOLDS.newCustomerCreditFraction,
      },
    })
    return mapConfig(created)
  }

  /**
   * @en Upsert tenant anomaly thresholds with validation.
   * @es Upsert de umbrales de anomalía del tenant con validación.
   * @pt-BR Upsert de limiares de anomalia do tenant com validação.
   */
  async upsertConfig(
    tenantId: number,
    input: ConfigAnomaliaFacturaUpsertInput,
  ): Promise<ServiceResult<ConfigAnomaliaFacturaRow>> {
    if (!Number.isInteger(input.minHistory) || input.minHistory < 1 || input.minHistory > 1000) {
      return { ok: false, status: 400, error: 'minHistory must be an integer 1..1000' }
    }
    if (
      !Number.isFinite(input.zScoreThreshold) ||
      input.zScoreThreshold < 0.1 ||
      input.zScoreThreshold > 20
    ) {
      return { ok: false, status: 400, error: 'zScoreThreshold must be a number 0.1..20' }
    }
    if (
      !Number.isFinite(input.discountThresholdPct) ||
      input.discountThresholdPct < 0 ||
      input.discountThresholdPct > 100
    ) {
      return { ok: false, status: 400, error: 'discountThresholdPct must be a number 0..100' }
    }
    if (
      !Number.isFinite(input.newCustomerCreditFraction) ||
      input.newCustomerCreditFraction < 0.01 ||
      input.newCustomerCreditFraction > 1
    ) {
      return {
        ok: false,
        status: 400,
        error: 'newCustomerCreditFraction must be a number 0.01..1',
      }
    }

    const row = await this.prisma.configAnomaliaFactura.upsert({
      where: { tenantId },
      create: {
        tenantId,
        minHistory: input.minHistory,
        zScoreThreshold: input.zScoreThreshold,
        discountThresholdPct: input.discountThresholdPct,
        newCustomerCreditFraction: input.newCustomerCreditFraction,
      },
      update: {
        minHistory: input.minHistory,
        zScoreThreshold: input.zScoreThreshold,
        discountThresholdPct: input.discountThresholdPct,
        newCustomerCreditFraction: input.newCustomerCreditFraction,
      },
    })
    return { ok: true, data: mapConfig(row) }
  }

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

    const configDelegate = this.prisma.configAnomaliaFactura
    const [cliente, priorCount, priorRows, duplicate, config] = await Promise.all([
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
      /**
       * @en Missing delegate (partial Prisma mocks) → MVP defaults.
       * @es Sin delegate (mocks parciales de Prisma) → defaults MVP.
       * @pt-BR Sem delegate (mocks parciais de Prisma) → defaults MVP.
       */
      configDelegate
        ? configDelegate.findUnique({ where: { tenantId: input.tenantId } })
        : Promise.resolve(null),
    ])

    const creditLimit =
      cliente?.creditLimit != null ? Number(cliente.creditLimit.toString()) : null
    const priorTotals = priorRows.map((r) => Number(r.total.toString()))
    const thresholds = config
      ? rowToThresholds(mapConfig(config))
      : DEFAULT_FACTURA_ANOMALY_THRESHOLDS

    return evaluateFacturaAnomalies({
      total: input.total,
      priorInvoiceCount: priorCount,
      priorTotals,
      hasDuplicateSameDay: duplicate != null,
      creditLimit,
      lines: input.lines,
      thresholds,
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

  /**
   * @en List persisted anomalies for the tenant (panel / audit UI).
   * @es Lista anomalías persistidas del tenant (panel / UI auditoría).
   * @pt-BR Lista anomalias persistidas do tenant (painel / UI auditoria).
   */
  async list(
    tenantId: number,
    filters: AnomaliaDetectadaListFilters,
    take: number,
    skip: number,
  ): Promise<{ rows: AnomaliaDetectadaRow[]; total: number }> {
    const where: Prisma.AnomaliaDetectadaWhereInput = {
      tenantId,
      ...(filters.tipo ? { tipo: filters.tipo } : {}),
      ...(filters.confirmada != null ? { confirmada: filters.confirmada } : {}),
      ...(filters.clienteId != null ? { clienteId: filters.clienteId } : {}),
      ...(filters.facturaId != null ? { facturaId: filters.facturaId } : {}),
    }
    const [total, rows] = await Promise.all([
      this.prisma.anomaliaDetectada.count({ where }),
      this.prisma.anomaliaDetectada.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
    ])
    return {
      total,
      rows: rows.map((r) => ({
        id: r.id,
        tenantId: r.tenantId,
        tipo: r.tipo,
        severidad: r.severidad,
        facturaId: r.facturaId,
        clienteId: r.clienteId,
        descripcion: r.descripcion,
        detalle:
          r.detalle != null && typeof r.detalle === 'object' && !Array.isArray(r.detalle)
            ? (r.detalle as Record<string, unknown>)
            : null,
        confirmada: r.confirmada,
        createdAt: r.createdAt.toISOString(),
      })),
    }
  }

}
