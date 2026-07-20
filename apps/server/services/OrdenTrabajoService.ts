import type { Prisma, PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import type {
  OrdenTrabajoEstado,
  OrdenTrabajoFacturarInput,
  OrdenTrabajoInput,
  OrdenTrabajoItemInput,
  OrdenTrabajoPrioridad,
  OrdenTrabajoTransitionInput,
  OrdenTrabajoUpdateInput,
} from '@bizcode/types'
import { calculateInvoice, calculateItemSubtotal } from '../../web/src/lib/invoice'
import { dispatchNotification } from '../channels'
import type { ServiceResult } from './serviceResults'
import { FacturaService } from './FacturaService'

const ALLOWED_TRANSITIONS: Record<OrdenTrabajoEstado, readonly OrdenTrabajoEstado[]> = {
  recibido: ['diagnosticado', 'cancelado'],
  diagnosticado: ['presupuestado', 'cancelado'],
  presupuestado: ['aprobado', 'cancelado'],
  aprobado: ['en_reparacion', 'cancelado'],
  en_reparacion: ['listo', 'sin_reparacion'],
  listo: ['entregado'],
  entregado: ['facturado'],
  facturado: [],
  cancelado: [],
  sin_reparacion: [],
}

const otInclude = {
  cliente: { select: { id: true, codigo: true, rsocial: true, condIva: true } },
  tecnico: { select: { id: true, username: true } },
  items: {
    include: {
      articulo: {
        select: { id: true, codigo: true, descripcion: true, tipo: true, condIva: true, unidadServicio: true },
      },
    },
  },
  factura: { select: { id: true, tipo: true, prefijo: true, numero: true, total: true } },
} satisfies Prisma.OrdenTrabajoInclude

export type OrdenTrabajoRow = Prisma.OrdenTrabajoGetPayload<{ include: typeof otInclude }>

/**
 * @en Public OT payload with Prisma Decimals coerced to numbers for JSON/OpenAPI.
 * @es Payload público de OT con Decimals de Prisma convertidos a number para JSON/OpenAPI.
 * @pt-BR Payload público de OT com Decimals do Prisma convertidos para number no JSON/OpenAPI.
 */
export type OrdenTrabajoPublic = Omit<OrdenTrabajoRow, 'presupuesto' | 'items' | 'factura'> & {
  presupuesto: number | null
  items: Array<
    Omit<OrdenTrabajoRow['items'][number], 'cantidad' | 'precioUnit' | 'subtotal'> & {
      cantidad: number
      precioUnit: number
      subtotal: number
    }
  >
  factura: (Omit<NonNullable<OrdenTrabajoRow['factura']>, 'total'> & { total: number }) | null
}

export type OrdenTrabajoTransitionResult = {
  orden: OrdenTrabajoPublic
  previousEstado: OrdenTrabajoEstado
  auditAction: string
}

export type OrdenTrabajoDashboardCounts = {
  recibido: number
  diagnosticado: number
  presupuestado: number
  aprobado: number
  en_reparacion: number
  listo: number
  entregado: number
  facturado: number
  cancelado: number
  sin_reparacion: number
}

export type OrdenTrabajoListResult = {
  total: number
  ordenes: OrdenTrabajoPublic[]
  counts: OrdenTrabajoDashboardCounts
}

function decimalToNumber(value: Decimal | number | string): number {
  if (typeof value === 'number') return value
  if (typeof value === 'string') return Number(value)
  return value.toNumber()
}

export function mapOrdenTrabajoPublic(row: OrdenTrabajoRow): OrdenTrabajoPublic {
  return {
    ...row,
    presupuesto: row.presupuesto == null ? null : decimalToNumber(row.presupuesto),
    items: row.items.map((item) => ({
      ...item,
      cantidad: decimalToNumber(item.cantidad),
      precioUnit: decimalToNumber(item.precioUnit),
      subtotal:
        item.subtotal == null
          ? Number(
              (
                decimalToNumber(item.cantidad) * decimalToNumber(item.precioUnit)
              ).toFixed(2),
            )
          : decimalToNumber(item.subtotal),
    })),
    factura: row.factura
      ? { ...row.factura, total: decimalToNumber(row.factura.total) }
      : null,
  }
}

function parseUtcDate(value: string | null | undefined): Date | null {
  if (value === undefined || value === null || value.trim() === '') return null
  const trimmed = value.trim()
  const date = /^\d{4}-\d{2}-\d{2}$/.test(trimmed)
    ? new Date(`${trimmed}T00:00:00.000Z`)
    : new Date(trimmed)
  return Number.isNaN(date.getTime()) ? null : date
}

function toDateOnly(value: Date): string {
  return value.toISOString().slice(0, 10)
}

function computePresupuesto(items: OrdenTrabajoItemInput[]): Decimal {
  const total = items.reduce((sum, item) => sum + item.cantidad * item.precioUnit, 0)
  return new Decimal(total.toFixed(2))
}

function mapItems(items: OrdenTrabajoItemInput[]): Prisma.OrdenTrabajoItemCreateWithoutOrdenTrabajoInput[] {
  return items.map((item) => ({
    tipo: item.tipo,
    descripcion: item.descripcion.trim().slice(0, 120),
    articulo: item.articuloId ? { connect: { id: item.articuloId } } : undefined,
    cantidad: new Decimal(item.cantidad),
    precioUnit: new Decimal(item.precioUnit),
    subtotal: new Decimal(calculateItemSubtotal(item.cantidad, item.precioUnit, 0).toFixed(2)),
    condIva: item.condIva ?? '1',
  }))
}

/**
 * @en Work-order domain operations: CRUD, state machine, warranty lookup, invoice (#246).
 * @es Operaciones de dominio de OT: CRUD, máquina de estados, garantía, factura (#246).
 * @pt-BR Operações de domínio de OT: CRUD, máquina de estados, garantia, fatura (#246).
 */
export class OrdenTrabajoService {
  private readonly facturaService: FacturaService

  constructor(private readonly prisma: PrismaClient) {
    this.facturaService = new FacturaService(prisma)
  }

  async list(
    tenantId: number,
    take: number,
    skip: number,
    estado?: string | null,
  ): Promise<OrdenTrabajoListResult> {
    const where: Prisma.OrdenTrabajoWhereInput = {
      tenantId,
      ...(estado ? { estado } : {}),
    }
    const [total, ordenes, grouped] = await Promise.all([
      this.prisma.ordenTrabajo.count({ where }),
      this.prisma.ordenTrabajo.findMany({
        where,
        include: otInclude,
        orderBy: [{ fechaIngreso: 'desc' }, { numero: 'desc' }],
        take,
        skip,
      }),
      this.prisma.ordenTrabajo.groupBy({
        by: ['estado'],
        where: { tenantId },
        _count: { _all: true },
      }),
    ])
    const counts: OrdenTrabajoDashboardCounts = {
      recibido: 0,
      diagnosticado: 0,
      presupuestado: 0,
      aprobado: 0,
      en_reparacion: 0,
      listo: 0,
      entregado: 0,
      facturado: 0,
      cancelado: 0,
      sin_reparacion: 0,
    }
    for (const row of grouped) {
      const key = row.estado as keyof OrdenTrabajoDashboardCounts
      if (key in counts) counts[key] = row._count._all
    }
    return { total, ordenes: ordenes.map(mapOrdenTrabajoPublic), counts }
  }

  async getById(tenantId: number, id: number): Promise<ServiceResult<OrdenTrabajoPublic>> {
    const orden = await this.prisma.ordenTrabajo.findFirst({
      where: { id, tenantId },
      include: otInclude,
    })
    if (!orden) return { ok: false, status: 404, error: 'Orden de trabajo not found' }
    return { ok: true, data: mapOrdenTrabajoPublic(orden) }
  }

  async create(tenantId: number, input: OrdenTrabajoInput): Promise<ServiceResult<OrdenTrabajoPublic>> {
    const cliente = await this.prisma.cliente.findFirst({
      where: { id: input.clienteId, tenantId },
      select: { id: true, suspended: true },
    })
    if (!cliente) return { ok: false, status: 400, error: 'clienteId is not valid for this tenant' }
    if (cliente.suspended) return { ok: false, status: 422, error: 'CLIENT_SUSPENDED' }

    if (input.tecnicoId != null) {
      const tecnico = await this.prisma.appUser.findFirst({
        where: { id: input.tecnicoId, tenantId, active: true },
        select: { id: true },
      })
      if (!tecnico) return { ok: false, status: 400, error: 'tecnicoId is not valid for this tenant' }
    }

    const items = input.items ?? []
    const articuloCheck = await this.validateItemsArticulos(tenantId, items)
    if (!articuloCheck.ok) return articuloCheck

    let enGarantia = input.enGarantia ?? false
    let garantiaVence = parseUtcDate(input.garantiaVence)
    let otGarantiaId = input.otGarantiaId ?? null

    const serial = input.equipoNroSerie?.trim()
    if (serial && input.enGarantia === undefined) {
      const warranty = await this.findActiveWarrantyBySerial(tenantId, serial)
      if (warranty) {
        enGarantia = true
        garantiaVence = warranty.garantiaVence
        otGarantiaId = warranty.id
      }
    }

    if (otGarantiaId != null) {
      const origin = await this.prisma.ordenTrabajo.findFirst({
        where: { id: otGarantiaId, tenantId },
        select: { id: true },
      })
      if (!origin) return { ok: false, status: 400, error: 'otGarantiaId is not valid for this tenant' }
    }

    const last = await this.prisma.ordenTrabajo.findFirst({
      where: { tenantId },
      orderBy: { numero: 'desc' },
      select: { numero: true },
    })
    const numero = (last?.numero ?? 0) + 1
    const presupuesto = items.length > 0 ? computePresupuesto(items) : null

    const created = await this.prisma.ordenTrabajo.create({
      data: {
        tenantId,
        numero,
        clienteId: input.clienteId,
        tecnicoId: input.tecnicoId ?? null,
        prioridad: (input.prioridad ?? 'normal') as OrdenTrabajoPrioridad,
        equipoMarca: input.equipoMarca ?? null,
        equipoModelo: input.equipoModelo ?? null,
        equipoNroSerie: serial || null,
        equipoDescripcion: input.equipoDescripcion,
        sintomaReportado: input.sintomaReportado,
        diagnostico: input.diagnostico ?? null,
        trabajoRealizado: input.trabajoRealizado ?? null,
        enGarantia,
        garantiaVence,
        otGarantiaId,
        presupuesto,
        fechaPromesa: parseUtcDate(input.fechaPromesa),
        observaciones: input.observaciones ?? null,
        items: items.length > 0 ? { create: mapItems(items) } : undefined,
      },
      include: otInclude,
    })
    return { ok: true, data: mapOrdenTrabajoPublic(created) }
  }

  async update(
    tenantId: number,
    id: number,
    input: OrdenTrabajoUpdateInput,
  ): Promise<ServiceResult<OrdenTrabajoPublic>> {
    const existing = await this.prisma.ordenTrabajo.findFirst({
      where: { id, tenantId },
      select: { id: true, estado: true, facturaId: true },
    })
    if (!existing) return { ok: false, status: 404, error: 'Orden de trabajo not found' }
    if (existing.estado === 'facturado' || existing.estado === 'cancelado') {
      return { ok: false, status: 409, error: `Cannot update OT in estado ${existing.estado}` }
    }

    const cliente = await this.prisma.cliente.findFirst({
      where: { id: input.clienteId, tenantId },
      select: { id: true },
    })
    if (!cliente) return { ok: false, status: 400, error: 'clienteId is not valid for this tenant' }

    if (input.tecnicoId != null) {
      const tecnico = await this.prisma.appUser.findFirst({
        where: { id: input.tecnicoId, tenantId, active: true },
        select: { id: true },
      })
      if (!tecnico) return { ok: false, status: 400, error: 'tecnicoId is not valid for this tenant' }
    }

    const items = input.items ?? []
    const articuloCheck = await this.validateItemsArticulos(tenantId, items)
    if (!articuloCheck.ok) return articuloCheck

    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.ordenTrabajoItem.deleteMany({ where: { otId: id } })
      return tx.ordenTrabajo.update({
        where: { id },
        data: {
          clienteId: input.clienteId,
          tecnicoId: input.tecnicoId ?? null,
          prioridad: (input.prioridad ?? 'normal') as string,
          equipoMarca: input.equipoMarca ?? null,
          equipoModelo: input.equipoModelo ?? null,
          equipoNroSerie: input.equipoNroSerie ?? null,
          equipoDescripcion: input.equipoDescripcion,
          sintomaReportado: input.sintomaReportado,
          diagnostico: input.diagnostico ?? null,
          trabajoRealizado: input.trabajoRealizado ?? null,
          fechaPromesa: parseUtcDate(input.fechaPromesa),
          fechaEntrega: parseUtcDate(input.fechaEntrega),
          observaciones: input.observaciones ?? null,
          presupuesto:
            input.presupuesto != null
              ? new Decimal(input.presupuesto)
              : items.length > 0
                ? computePresupuesto(items)
                : null,
          ...(input.estado ? { estado: input.estado } : {}),
          items: items.length > 0 ? { create: mapItems(items) } : undefined,
        },
        include: otInclude,
      })
    })
    return { ok: true, data: mapOrdenTrabajoPublic(updated) }
  }

  async transition(
    tenantId: number,
    id: number,
    input: OrdenTrabajoTransitionInput,
  ): Promise<ServiceResult<OrdenTrabajoTransitionResult>> {
    const existing = await this.prisma.ordenTrabajo.findFirst({
      where: { id, tenantId },
      include: { items: true },
    })
    if (!existing) return { ok: false, status: 404, error: 'Orden de trabajo not found' }

    const previousEstado = existing.estado as OrdenTrabajoEstado
    const nextEstado = input.estado
    const allowed = ALLOWED_TRANSITIONS[previousEstado] ?? []
    if (!allowed.includes(nextEstado)) {
      return {
        ok: false,
        status: 409,
        error: `Invalid transition from ${previousEstado} to ${nextEstado}`,
      }
    }

    if (nextEstado === 'presupuestado') {
      const items = input.items ?? []
      if (items.length === 0 && existing.items.length === 0) {
        return { ok: false, status: 400, error: 'items are required to set presupuestado' }
      }
    }

    if (input.items) {
      const articuloCheck = await this.validateItemsArticulos(tenantId, input.items)
      if (!articuloCheck.ok) return articuloCheck
    }

    if (input.tecnicoId != null) {
      const tecnico = await this.prisma.appUser.findFirst({
        where: { id: input.tecnicoId, tenantId, active: true },
        select: { id: true },
      })
      if (!tecnico) return { ok: false, status: 400, error: 'tecnicoId is not valid for this tenant' }
    }

    const orden = await this.prisma.$transaction(async (tx) => {
      if (input.items) {
        await tx.ordenTrabajoItem.deleteMany({ where: { otId: id } })
      }
      return tx.ordenTrabajo.update({
        where: { id },
        data: {
          estado: nextEstado,
          diagnostico: input.diagnostico !== undefined ? input.diagnostico : undefined,
          trabajoRealizado: input.trabajoRealizado !== undefined ? input.trabajoRealizado : undefined,
          fechaPromesa:
            input.fechaPromesa !== undefined ? parseUtcDate(input.fechaPromesa) : undefined,
          fechaEntrega:
            input.fechaEntrega !== undefined
              ? parseUtcDate(input.fechaEntrega)
              : nextEstado === 'entregado'
                ? new Date()
                : undefined,
          tecnicoId: input.tecnicoId !== undefined ? input.tecnicoId : undefined,
          observaciones: input.observaciones !== undefined ? input.observaciones : undefined,
          presupuesto: input.items ? computePresupuesto(input.items) : undefined,
          items: input.items ? { create: mapItems(input.items) } : undefined,
        },
        include: otInclude,
      })
    })

    if (nextEstado === 'presupuestado') {
      await dispatchNotification(this.prisma, tenantId, 'ot_presupuestado', {
        clienteId: orden.clienteId,
        otId: orden.id,
        otNumero: orden.numero,
        amount: orden.presupuesto != null ? String(orden.presupuesto) : undefined,
        rsocial: orden.cliente.rsocial,
      })
    }
    if (nextEstado === 'listo') {
      await dispatchNotification(this.prisma, tenantId, 'ot_listo', {
        clienteId: orden.clienteId,
        otId: orden.id,
        otNumero: orden.numero,
        rsocial: orden.cliente.rsocial,
      })
    }

    return {
      ok: true,
      data: {
        orden: mapOrdenTrabajoPublic(orden),
        previousEstado,
        auditAction: `ot_transition_${nextEstado}`,
      },
    }
  }

  async facturar(
    tenantId: number,
    id: number,
    userId: number,
    input: OrdenTrabajoFacturarInput = {},
  ): Promise<ServiceResult<{ orden: OrdenTrabajoPublic; facturaId: number }>> {
    const orden = await this.prisma.ordenTrabajo.findFirst({
      where: { id, tenantId },
      include: otInclude,
    })
    if (!orden) return { ok: false, status: 404, error: 'Orden de trabajo not found' }
    if (orden.facturaId != null) {
      return { ok: false, status: 409, error: 'OT already has a factura' }
    }
    const estado = orden.estado as OrdenTrabajoEstado
    if (estado !== 'listo' && estado !== 'entregado') {
      return { ok: false, status: 409, error: 'OT must be listo or entregado to invoice' }
    }
    if (orden.enGarantia) {
      return { ok: false, status: 422, error: 'OT_EN_GARANTIA_NO_FACTURA' }
    }
    if (orden.items.length === 0) {
      return { ok: false, status: 400, error: 'OT has no items to invoice' }
    }

    const tipo = input.tipo ?? 'B'
    const prefijo = input.prefijo?.trim() || '0001'
    const last = await this.prisma.factura.findFirst({
      where: { tenantId, tipo, prefijo },
      orderBy: { numero: 'desc' },
      select: { numero: true },
    })

    const items = orden.items.map((item) => ({
      articuloId: item.articuloId,
      descripcion: item.descripcion,
      condIva: item.condIva as '1' | '2' | '3',
      unidadServicio:
        item.tipo === 'mano_de_obra' || item.tipo === 'servicio'
          ? ((item.articulo?.unidadServicio as 'hora' | 'dia' | 'mes' | null | undefined) ?? null)
          : null,
      cantidad: Number(item.cantidad),
      precio: Number(item.precioUnit),
      dscto: 0,
      subtotal: calculateItemSubtotal(Number(item.cantidad), Number(item.precioUnit), 0),
    }))

    const totals = calculateInvoice(
      items.map((item) => ({
        cantidad: item.cantidad,
        precio: item.precio,
        dscto: item.dscto,
        articuloIva: item.condIva,
      })),
      orden.cliente.condIva,
    )

    const result = await this.facturaService.create(
      tenantId,
      {
        fecha: toDateOnly(new Date()),
        tipo,
        prefijo,
        numero: (last?.numero ?? 0) + 1,
        clienteId: orden.clienteId,
        ...totals,
        items,
      },
      userId,
      { skipArcaCae: input.skipArcaCae !== false },
    )
    if (!result.ok) return result

    const updated = await this.prisma.ordenTrabajo.update({
      where: { id },
      data: {
        facturaId: result.data.factura.id,
        estado: 'facturado',
        fechaEntrega: orden.fechaEntrega ?? new Date(),
      },
      include: otInclude,
    })

    return { ok: true, data: { orden: mapOrdenTrabajoPublic(updated), facturaId: result.data.factura.id } }
  }

  private async findActiveWarrantyBySerial(
    tenantId: number,
    serial: string,
  ): Promise<{ id: number; garantiaVence: Date | null } | null> {
    const now = new Date()
    const prior = await this.prisma.ordenTrabajo.findFirst({
      where: {
        tenantId,
        equipoNroSerie: serial,
        OR: [
          { garantiaVence: { gte: now } },
          { AND: [{ enGarantia: false }, { estado: 'facturado' }, { garantiaVence: { gte: now } }] },
        ],
      },
      orderBy: { fechaIngreso: 'desc' },
      select: { id: true, garantiaVence: true },
    })
    if (prior) return prior

    // Fallback: prior completed OT with same serial that set a warranty end date
    return this.prisma.ordenTrabajo.findFirst({
      where: {
        tenantId,
        equipoNroSerie: serial,
        garantiaVence: { gte: now },
        estado: { in: ['facturado', 'entregado', 'listo'] },
      },
      orderBy: { fechaIngreso: 'desc' },
      select: { id: true, garantiaVence: true },
    })
  }

  private async validateItemsArticulos(
    tenantId: number,
    items: OrdenTrabajoItemInput[],
  ): Promise<ServiceResult<never> | { ok: true }> {
    const ids = [
      ...new Set(
        items
          .map((i) => i.articuloId)
          .filter((id): id is number => typeof id === 'number' && id >= 1),
      ),
    ]
    if (ids.length === 0) return { ok: true }
    const arts = await this.prisma.articulo.findMany({
      where: { tenantId, id: { in: ids } },
      select: { id: true },
    })
    if (arts.length !== ids.length) {
      return { ok: false, status: 400, error: 'One or more articuloId values are not valid for this tenant' }
    }
    return { ok: true }
  }
}
