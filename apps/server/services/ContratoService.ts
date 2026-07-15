import type { Prisma, PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import type {
  ContratoAjusteManualInput,
  ContratoInput,
  ContratoUpdateInput,
} from '@bizcode/types'
import {
  computeInitialBillingDate,
  computeNextBillingDate,
  type BillingFrecuencia,
} from '../lib/computeNextBillingDate'
import type { ServiceResult } from './serviceResults'

const contratoInclude = {
  cliente: { select: { id: true, codigo: true, rsocial: true, condIva: true } },
  items: {
    include: {
      articulo: {
        select: {
          id: true,
          codigo: true,
          descripcion: true,
          condIva: true,
          tipo: true,
          unidadServicio: true,
        },
      },
    },
  },
  ajuste: true,
  facturas: {
    select: { id: true, fecha: true, tipo: true, prefijo: true, numero: true, total: true, estadoCae: true },
    orderBy: { fecha: 'desc' as const },
  },
} satisfies Prisma.ContratoInclude

export type ContratoRow = Prisma.ContratoGetPayload<{ include: typeof contratoInclude }>

export type ContratoListResult = {
  total: number
  contratos: ContratoRow[]
}

function parseUtcDate(value: string | null | undefined): Date | null {
  if (value === undefined || value === null || value.trim() === '') return null
  const trimmed = value.trim()
  const date = /^\d{4}-\d{2}-\d{2}$/.test(trimmed)
    ? new Date(`${trimmed}T00:00:00.000Z`)
    : new Date(trimmed)
  return Number.isNaN(date.getTime()) ? null : date
}

function computeMontoBase(items: ContratoInput['items']): Decimal {
  const total = items.reduce(
    (sum, item) => sum + item.cantidad * item.precioUnit * (1 - (item.dscto ?? 0) / 100),
    0,
  )
  return new Decimal(total.toFixed(2))
}

function mapItems(items: ContratoInput['items']): Prisma.ContratoItemCreateWithoutContratoInput[] {
  return items.map((item) => ({
    articulo: item.articuloId ? { connect: { id: item.articuloId } } : undefined,
    descripcion: item.descripcion.trim().slice(0, 120),
    condIva: item.condIva ?? '1',
    unidadServicio: item.unidadServicio ?? null,
    cantidad: item.cantidad,
    precioUnit: new Decimal(item.precioUnit),
    dscto: new Decimal(item.dscto ?? 0),
  }))
}

function mapAjuste(
  ajuste: NonNullable<ContratoInput['ajuste']>,
): Prisma.ContratoAjusteCreateWithoutContratoInput | null {
  const proximoAjuste = parseUtcDate(ajuste.proximoAjuste)
  if (!proximoAjuste) return null
  return {
    tipo: ajuste.tipo,
    porcentaje: ajuste.porcentaje == null ? null : new Decimal(ajuste.porcentaje),
    frecuenciaAjuste: ajuste.frecuenciaAjuste,
    proximoAjuste,
  }
}

/**
 * @en Manages tenant-scoped recurring contracts and their lifecycle.
 * @es Gestiona contratos recurrentes por tenant y su ciclo de vida.
 * @pt-BR Gerencia contratos recorrentes por tenant e seu ciclo de vida.
 */
export class ContratoService {
  constructor(private readonly prisma: PrismaClient) {}

  async list(tenantId: number, take: number, skip: number): Promise<ContratoListResult> {
    const where: Prisma.ContratoWhereInput = { tenantId }
    const [total, contratos] = await Promise.all([
      this.prisma.contrato.count({ where }),
      this.prisma.contrato.findMany({
        where,
        include: contratoInclude,
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
    ])
    return { total, contratos }
  }

  async getById(tenantId: number, id: number): Promise<ServiceResult<ContratoRow>> {
    const contrato = await this.prisma.contrato.findFirst({
      where: { id, tenantId },
      include: contratoInclude,
    })
    return contrato
      ? { ok: true, data: contrato }
      : { ok: false, status: 404, error: 'Contrato not found' }
  }

  private async validateReferences(
    tenantId: number,
    input: ContratoInput,
  ): Promise<ServiceResult<{ clienteCondIva: string }>> {
    const cliente = await this.prisma.cliente.findFirst({
      where: { id: input.clienteId, tenantId },
      select: { condIva: true },
    })
    if (!cliente) {
      return { ok: false, status: 400, error: 'clienteId is not valid for this tenant' }
    }

    const articuloIds = [...new Set(input.items.flatMap((item) => item.articuloId ? [item.articuloId] : []))]
    if (articuloIds.length > 0) {
      const articulos = await this.prisma.articulo.findMany({
        where: { tenantId, id: { in: articuloIds } },
        select: { id: true },
      })
      if (articulos.length !== articuloIds.length) {
        return {
          ok: false,
          status: 400,
          error: 'One or more articuloId values are not valid for this tenant',
        }
      }
    }
    return { ok: true, data: { clienteCondIva: cliente.condIva } }
  }

  private parseDates(input: ContratoInput): ServiceResult<{
    fechaInicio: Date
    fechaFin: Date | null
    proximaFact: Date
  }> {
    const fechaInicio = parseUtcDate(input.fechaInicio)
    const fechaFin = parseUtcDate(input.fechaFin)
    const explicitProximaFact = parseUtcDate(input.proximaFact)
    if (!fechaInicio || (input.fechaFin != null && !fechaFin) || (input.proximaFact !== undefined && !explicitProximaFact)) {
      return { ok: false, status: 400, error: 'Invalid contract date' }
    }
    return {
      ok: true,
      data: {
        fechaInicio,
        fechaFin,
        proximaFact:
          explicitProximaFact ??
          computeInitialBillingDate(input.diaDelMes, fechaInicio, input.frecuencia),
      },
    }
  }

  async create(tenantId: number, input: ContratoInput): Promise<ServiceResult<ContratoRow>> {
    const references = await this.validateReferences(tenantId, input)
    if (!references.ok) return references
    const dates = this.parseDates(input)
    if (!dates.ok) return dates
    const ajuste = input.ajuste ? mapAjuste(input.ajuste) : null
    if (input.ajuste && !ajuste) {
      return { ok: false, status: 400, error: 'Invalid adjustment date' }
    }

    const contrato = await this.prisma.$transaction(async (tx) => {
      const last = await tx.contrato.findFirst({
        where: { tenantId },
        orderBy: { numero: 'desc' },
        select: { numero: true },
      })
      return tx.contrato.create({
        data: {
          tenantId,
          numero: (last?.numero ?? 0) + 1,
          clienteId: input.clienteId,
          nombre: input.nombre,
          descripcion: input.descripcion ?? null,
          frecuencia: input.frecuencia,
          diaDelMes: input.diaDelMes,
          ...dates.data,
          montoBase: computeMontoBase(input.items),
          moneda: input.moneda ?? 'ARS',
          incluyeIVA: input.incluyeIVA ?? false,
          ivaAlicuota: new Decimal(input.ivaAlicuota ?? 21),
          modoEmision: input.modoEmision ?? 'revision',
          tipoFactura: input.tipoFactura ?? 'B',
          prefijo: input.prefijo ?? '0001',
          items: { create: mapItems(input.items) },
          ...(ajuste ? { ajuste: { create: ajuste } } : {}),
        },
        include: contratoInclude,
      })
    })
    return { ok: true, data: contrato }
  }

  async update(
    tenantId: number,
    id: number,
    input: ContratoUpdateInput,
  ): Promise<ServiceResult<ContratoRow>> {
    const existing = await this.prisma.contrato.findFirst({ where: { id, tenantId }, select: { id: true } })
    if (!existing) return { ok: false, status: 404, error: 'Contrato not found' }
    const references = await this.validateReferences(tenantId, input)
    if (!references.ok) return references
    const dates = this.parseDates(input)
    if (!dates.ok) return dates
    const ajuste = input.ajuste ? mapAjuste(input.ajuste) : null
    if (input.ajuste && !ajuste) {
      return { ok: false, status: 400, error: 'Invalid adjustment date' }
    }

    const contrato = await this.prisma.$transaction(async (tx) => {
      await tx.contratoItem.deleteMany({ where: { contratoId: id } })
      if (input.ajuste === null) {
        await tx.contratoAjuste.deleteMany({ where: { contratoId: id } })
      }
      return tx.contrato.update({
        where: { id },
        data: {
          clienteId: input.clienteId,
          nombre: input.nombre,
          descripcion: input.descripcion ?? null,
          estado: input.estado,
          frecuencia: input.frecuencia,
          diaDelMes: input.diaDelMes,
          ...dates.data,
          montoBase: computeMontoBase(input.items),
          moneda: input.moneda ?? 'ARS',
          incluyeIVA: input.incluyeIVA ?? false,
          ivaAlicuota: new Decimal(input.ivaAlicuota ?? 21),
          modoEmision: input.modoEmision ?? 'revision',
          tipoFactura: input.tipoFactura ?? 'B',
          prefijo: input.prefijo ?? '0001',
          items: { create: mapItems(input.items) },
          ...(ajuste
            ? {
                ajuste: {
                  upsert: {
                    create: ajuste,
                    update: ajuste,
                  },
                },
              }
            : {}),
        },
        include: contratoInclude,
      })
    })
    return { ok: true, data: contrato }
  }

  async pause(tenantId: number, id: number): Promise<ServiceResult<ContratoRow>> {
    const existing = await this.prisma.contrato.findFirst({ where: { id, tenantId }, select: { estado: true } })
    if (!existing) return { ok: false, status: 404, error: 'Contrato not found' }
    if (existing.estado !== 'activo') {
      return { ok: false, status: 409, error: 'INVALID_STATE_TRANSITION' }
    }
    const contrato = await this.prisma.contrato.update({
      where: { id },
      data: { estado: 'pausado' },
      include: contratoInclude,
    })
    return { ok: true, data: contrato }
  }

  async resume(tenantId: number, id: number, now = new Date()): Promise<ServiceResult<ContratoRow>> {
    const existing = await this.prisma.contrato.findFirst({
      where: { id, tenantId },
      select: { estado: true, proximaFact: true, diaDelMes: true, frecuencia: true },
    })
    if (!existing) return { ok: false, status: 404, error: 'Contrato not found' }
    if (existing.estado !== 'pausado') {
      return { ok: false, status: 409, error: 'INVALID_STATE_TRANSITION' }
    }
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
    let proximaFact = existing.proximaFact
    while (proximaFact.getTime() < today.getTime()) {
      proximaFact = computeNextBillingDate(
        existing.diaDelMes,
        proximaFact,
        existing.frecuencia as BillingFrecuencia,
      )
    }
    const contrato = await this.prisma.contrato.update({
      where: { id },
      data: { estado: 'activo', proximaFact },
      include: contratoInclude,
    })
    return { ok: true, data: contrato }
  }

  async listFacturas(tenantId: number, id: number): Promise<ServiceResult<ContratoRow['facturas']>> {
    const contrato = await this.prisma.contrato.findFirst({
      where: { id, tenantId },
      select: {
        facturas: {
          select: { id: true, fecha: true, tipo: true, prefijo: true, numero: true, total: true, estadoCae: true },
          orderBy: { fecha: 'desc' },
        },
      },
    })
    return contrato
      ? { ok: true, data: contrato.facturas }
      : { ok: false, status: 404, error: 'Contrato not found' }
  }

  async applyManualAdjustment(
    tenantId: number,
    id: number,
    input: ContratoAjusteManualInput,
  ): Promise<ServiceResult<ContratoRow>> {
    const existing = await this.prisma.contrato.findFirst({
      where: { id, tenantId },
      include: { items: true },
    })
    if (!existing) return { ok: false, status: 404, error: 'Contrato not found' }
    const factor = new Decimal(1).plus(new Decimal(input.porcentaje).dividedBy(100))
    const adjustedItems = existing.items.map((item) => ({
      id: item.id,
      cantidad: item.cantidad,
      dscto: item.dscto,
      precioUnit: item.precioUnit.mul(factor).toDecimalPlaces(2),
    }))
    const montoBase = adjustedItems.reduce(
      (sum, item) =>
        sum.plus(
          item.precioUnit
            .mul(item.cantidad)
            .mul(new Decimal(1).minus(item.dscto.dividedBy(100))),
        ),
      new Decimal(0),
    ).toDecimalPlaces(2)
    const contrato = await this.prisma.$transaction(async (tx) => {
      for (const item of adjustedItems) {
        await tx.contratoItem.update({
          where: { id: item.id },
          data: { precioUnit: item.precioUnit },
        })
      }
      return tx.contrato.update({
        where: { id },
        data: { montoBase },
        include: contratoInclude,
      })
    })
    return { ok: true, data: contrato }
  }
}
