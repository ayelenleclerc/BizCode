/**
 * @en Pharmacy insurer / prepaid service (#252): ABM, OS sales, presentations, CC and rejections.
 * @es Servicio de obras sociales / prepagas (#252): ABM, ventas OS, presentaciones, CC y rechazos.
 * @pt-BR Serviço de planos / prepagas (#252): ABM, vendas, apresentações, CC e rejeições.
 */

import type { Prisma, PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import type {
  CoberturaOSRow,
  CoberturaOSUpsertInput,
  ObraSocialCreateInput,
  ObraSocialCuentaCorrienteRow,
  ObraSocialRow,
  ObraSocialUpdateInput,
  OsTipoProducto,
  PresentacionOSCobroInput,
  PresentacionOSCreateInput,
  PresentacionOSRechazoInput,
  PresentacionOSRechazoRow,
  PresentacionOSRow,
  PresentacionOsEstado,
  VentaConOSCreateInput,
  VentaConOSRow,
  VentaOSItemRow,
  VentaOsEstado,
} from '@bizcode/types'
import { OS_TIPO_PRODUCTOS } from '@bizcode/types'
import {
  buildPresentacionOsCsv,
  computeOsSale,
  isOsTipoProducto,
  isPeriodoYm,
} from './obraSocialMath'
import type { ServiceResult } from './serviceResults'

type TxClient = Prisma.TransactionClient | PrismaClient

const OS_INCLUDE = {
  coberturas: true,
} satisfies Prisma.ObraSocialInclude

const VENTA_INCLUDE = {
  items: true,
  obraSocial: { select: { id: true, nombre: true, codigo: true } },
  cliente: { select: { id: true, rsocial: true } },
} satisfies Prisma.VentaConOSInclude

const PRESENTACION_INCLUDE = {
  obraSocial: { select: { id: true, nombre: true, codigo: true } },
  rechazos: true,
  _count: { select: { ventas: true } },
} satisfies Prisma.PresentacionOSInclude

function mapCobertura(row: {
  id: number
  tenantId: number
  obraSocialId: number
  tipoProducto: string
  cobertura: Decimal
  createdAt: Date
  updatedAt: Date
}): CoberturaOSRow {
  return {
    id: row.id,
    tenantId: row.tenantId,
    obraSocialId: row.obraSocialId,
    tipoProducto: row.tipoProducto as OsTipoProducto,
    cobertura: Number(row.cobertura),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

function mapObraSocial(
  row: Prisma.ObraSocialGetPayload<{ include: typeof OS_INCLUDE }>,
): ObraSocialRow {
  return {
    id: row.id,
    tenantId: row.tenantId,
    nombre: row.nombre,
    codigo: row.codigo,
    activa: row.activa,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    coberturas: row.coberturas.map(mapCobertura),
  }
}

function mapItem(row: {
  id: number
  tenantId: number
  ventaConOSId: number
  articuloId: number | null
  descripcion: string
  tipoProducto: string
  cantidad: Decimal
  precioUnitario: Decimal
  subtotal: Decimal
  coberturaPct: Decimal
  creditoOS: Decimal
  copago: Decimal
}): VentaOSItemRow {
  return {
    id: row.id,
    tenantId: row.tenantId,
    ventaConOSId: row.ventaConOSId,
    articuloId: row.articuloId,
    descripcion: row.descripcion,
    tipoProducto: row.tipoProducto as OsTipoProducto,
    cantidad: Number(row.cantidad),
    precioUnitario: Number(row.precioUnitario),
    subtotal: Number(row.subtotal),
    coberturaPct: Number(row.coberturaPct),
    creditoOS: Number(row.creditoOS),
    copago: Number(row.copago),
  }
}

function mapVenta(
  row: Prisma.VentaConOSGetPayload<{ include: typeof VENTA_INCLUDE }>,
): VentaConOSRow {
  return {
    id: row.id,
    tenantId: row.tenantId,
    facturaId: row.facturaId,
    clienteId: row.clienteId,
    obraSocialId: row.obraSocialId,
    nroAfiliado: row.nroAfiliado,
    nroReceta: row.nroReceta,
    totalVenta: Number(row.totalVenta),
    copagoPaciente: Number(row.copagoPaciente),
    creditoOS: Number(row.creditoOS),
    estado: row.estado as VentaOsEstado,
    presentacionId: row.presentacionId,
    fecha: row.fecha.toISOString(),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    items: row.items.map(mapItem),
    obraSocial: row.obraSocial,
    cliente: row.cliente,
  }
}

function mapRechazo(row: {
  id: number
  tenantId: number
  presentacionId: number
  ventaConOSId: number
  ventaOSItemId: number | null
  importeRechazado: Decimal
  motivo: string | null
  createdAt: Date
}): PresentacionOSRechazoRow {
  return {
    id: row.id,
    tenantId: row.tenantId,
    presentacionId: row.presentacionId,
    ventaConOSId: row.ventaConOSId,
    ventaOSItemId: row.ventaOSItemId,
    importeRechazado: Number(row.importeRechazado),
    motivo: row.motivo,
    createdAt: row.createdAt.toISOString(),
  }
}

function mapPresentacion(
  row: Prisma.PresentacionOSGetPayload<{ include: typeof PRESENTACION_INCLUDE }>,
): PresentacionOSRow {
  return {
    id: row.id,
    tenantId: row.tenantId,
    obraSocialId: row.obraSocialId,
    periodo: row.periodo,
    totalCredito: Number(row.totalCredito),
    estado: row.estado as PresentacionOsEstado,
    archivoCsvName: row.archivoCsvName,
    fechaPago: row.fechaPago ? row.fechaPago.toISOString() : null,
    importeCobrado: row.importeCobrado === null ? null : Number(row.importeCobrado),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    obraSocial: row.obraSocial,
    ventasCount: row._count.ventas,
    rechazos: row.rechazos.map(mapRechazo),
  }
}

export class ObraSocialService {
  constructor(private readonly prisma: PrismaClient) {}

  async listObrasSociales(tenantId: number): Promise<ServiceResult<ObraSocialRow[]>> {
    const rows = await this.prisma.obraSocial.findMany({
      where: { tenantId },
      include: OS_INCLUDE,
      orderBy: [{ nombre: 'asc' }, { id: 'asc' }],
    })
    return { ok: true, data: rows.map(mapObraSocial) }
  }

  async getObraSocial(tenantId: number, id: number): Promise<ServiceResult<ObraSocialRow>> {
    const row = await this.prisma.obraSocial.findFirst({
      where: { id, tenantId },
      include: OS_INCLUDE,
    })
    if (!row) return { ok: false, status: 404, error: 'obra_social_not_found' }
    return { ok: true, data: mapObraSocial(row) }
  }

  async createObraSocial(
    tenantId: number,
    input: ObraSocialCreateInput,
  ): Promise<ServiceResult<ObraSocialRow>> {
    const nombre = input.nombre.trim()
    const codigo = input.codigo.trim()
    if (!nombre) return { ok: false, status: 400, error: 'nombre is required' }
    if (!codigo) return { ok: false, status: 400, error: 'codigo is required' }

    const coberturas = input.coberturas ?? []
    for (const c of coberturas) {
      if (!isOsTipoProducto(c.tipoProducto)) {
        return { ok: false, status: 400, error: `invalid tipoProducto: ${c.tipoProducto}` }
      }
      if (!Number.isFinite(c.cobertura) || c.cobertura < 0 || c.cobertura > 100) {
        return { ok: false, status: 400, error: 'cobertura must be between 0 and 100' }
      }
    }

    try {
      const created = await this.prisma.obraSocial.create({
        data: {
          tenantId,
          nombre,
          codigo,
          activa: input.activa ?? true,
          coberturas: {
            create: coberturas.map((c) => ({
              tenantId,
              tipoProducto: c.tipoProducto,
              cobertura: new Decimal(c.cobertura),
            })),
          },
        },
        include: OS_INCLUDE,
      })
      return { ok: true, data: mapObraSocial(created) }
    } catch (err: unknown) {
      if (isUniqueViolation(err)) {
        return { ok: false, status: 409, error: 'obra_social_codigo_duplicate' }
      }
      throw err
    }
  }

  async updateObraSocial(
    tenantId: number,
    id: number,
    input: ObraSocialUpdateInput,
  ): Promise<ServiceResult<ObraSocialRow>> {
    const existing = await this.prisma.obraSocial.findFirst({ where: { id, tenantId } })
    if (!existing) return { ok: false, status: 404, error: 'obra_social_not_found' }

    const data: Prisma.ObraSocialUpdateInput = {}
    if (input.nombre !== undefined) {
      const nombre = input.nombre.trim()
      if (!nombre) return { ok: false, status: 400, error: 'nombre is required' }
      data.nombre = nombre
    }
    if (input.codigo !== undefined) {
      const codigo = input.codigo.trim()
      if (!codigo) return { ok: false, status: 400, error: 'codigo is required' }
      data.codigo = codigo
    }
    if (input.activa !== undefined) data.activa = input.activa

    try {
      const updated = await this.prisma.obraSocial.update({
        where: { id },
        data,
        include: OS_INCLUDE,
      })
      return { ok: true, data: mapObraSocial(updated) }
    } catch (err: unknown) {
      if (isUniqueViolation(err)) {
        return { ok: false, status: 409, error: 'obra_social_codigo_duplicate' }
      }
      throw err
    }
  }

  async upsertCobertura(
    tenantId: number,
    obraSocialId: number,
    input: CoberturaOSUpsertInput,
  ): Promise<ServiceResult<CoberturaOSRow>> {
    if (!isOsTipoProducto(input.tipoProducto)) {
      return { ok: false, status: 400, error: `invalid tipoProducto: ${input.tipoProducto}` }
    }
    if (!Number.isFinite(input.cobertura) || input.cobertura < 0 || input.cobertura > 100) {
      return { ok: false, status: 400, error: 'cobertura must be between 0 and 100' }
    }
    const os = await this.prisma.obraSocial.findFirst({ where: { id: obraSocialId, tenantId } })
    if (!os) return { ok: false, status: 404, error: 'obra_social_not_found' }

    const row = await this.prisma.coberturaOS.upsert({
      where: {
        obraSocialId_tipoProducto: { obraSocialId, tipoProducto: input.tipoProducto },
      },
      create: {
        tenantId,
        obraSocialId,
        tipoProducto: input.tipoProducto,
        cobertura: new Decimal(input.cobertura),
      },
      update: { cobertura: new Decimal(input.cobertura) },
    })
    return { ok: true, data: mapCobertura(row) }
  }

  async createVenta(
    tenantId: number,
    input: VentaConOSCreateInput,
  ): Promise<ServiceResult<VentaConOSRow>> {
    if (!Number.isInteger(input.clienteId) || input.clienteId < 1) {
      return { ok: false, status: 400, error: 'clienteId is required' }
    }
    if (!Number.isInteger(input.obraSocialId) || input.obraSocialId < 1) {
      return { ok: false, status: 400, error: 'obraSocialId is required' }
    }
    const nroAfiliado = input.nroAfiliado.trim()
    if (!nroAfiliado) return { ok: false, status: 400, error: 'nroAfiliado is required' }

    const os = await this.prisma.obraSocial.findFirst({
      where: { id: input.obraSocialId, tenantId, activa: true },
      include: { coberturas: true },
    })
    if (!os) return { ok: false, status: 404, error: 'obra_social_not_found' }

    const cliente = await this.prisma.cliente.findFirst({
      where: { id: input.clienteId, tenantId },
    })
    if (!cliente) return { ok: false, status: 404, error: 'cliente_not_found' }

    if (input.facturaId != null) {
      const factura = await this.prisma.factura.findFirst({
        where: { id: input.facturaId, tenantId },
      })
      if (!factura) return { ok: false, status: 404, error: 'factura_not_found' }
    }

    const coverage = new Map<OsTipoProducto, number>()
    for (const c of os.coberturas) {
      if (isOsTipoProducto(c.tipoProducto)) coverage.set(c.tipoProducto, Number(c.cobertura))
    }

    const computed = computeOsSale(
      input.items.map((i) => ({
        articuloId: i.articuloId ?? null,
        descripcion: i.descripcion,
        tipoProducto: i.tipoProducto,
        cantidad: i.cantidad,
        precioUnitario: i.precioUnitario,
      })),
      coverage,
    )
    if (!computed.ok) return { ok: false, status: 400, error: computed.error }

    const created = await this.prisma.$transaction(async (tx: TxClient) => {
      return tx.ventaConOS.create({
        data: {
          tenantId,
          clienteId: input.clienteId,
          obraSocialId: input.obraSocialId,
          facturaId: input.facturaId ?? null,
          nroAfiliado,
          nroReceta: input.nroReceta?.trim() || null,
          totalVenta: new Decimal(computed.data.totalVenta),
          copagoPaciente: new Decimal(computed.data.copagoPaciente),
          creditoOS: new Decimal(computed.data.creditoOS),
          estado: 'pendiente_cobro_os',
          items: {
            create: computed.data.lines.map((line) => ({
              tenantId,
              articuloId: line.articuloId ?? null,
              descripcion: line.descripcion,
              tipoProducto: line.tipoProducto,
              cantidad: new Decimal(line.cantidad),
              precioUnitario: new Decimal(line.precioUnitario),
              subtotal: new Decimal(line.subtotal),
              coberturaPct: new Decimal(line.coberturaPct),
              creditoOS: new Decimal(line.creditoOS),
              copago: new Decimal(line.copago),
            })),
          },
        },
        include: VENTA_INCLUDE,
      })
    })

    return { ok: true, data: mapVenta(created) }
  }

  async listVentas(
    tenantId: number,
    filters?: { obraSocialId?: number; estado?: VentaOsEstado },
  ): Promise<ServiceResult<VentaConOSRow[]>> {
    const rows = await this.prisma.ventaConOS.findMany({
      where: {
        tenantId,
        ...(filters?.obraSocialId ? { obraSocialId: filters.obraSocialId } : {}),
        ...(filters?.estado ? { estado: filters.estado } : {}),
      },
      include: VENTA_INCLUDE,
      orderBy: [{ fecha: 'desc' }, { id: 'desc' }],
      take: 200,
    })
    return { ok: true, data: rows.map(mapVenta) }
  }

  async createPresentacion(
    tenantId: number,
    input: PresentacionOSCreateInput,
  ): Promise<ServiceResult<PresentacionOSRow>> {
    if (!isPeriodoYm(input.periodo)) {
      return { ok: false, status: 400, error: 'periodo must be YYYY-MM' }
    }
    const os = await this.prisma.obraSocial.findFirst({
      where: { id: input.obraSocialId, tenantId },
    })
    if (!os) return { ok: false, status: 404, error: 'obra_social_not_found' }

    const [year, month] = input.periodo.split('-').map(Number)
    const from = new Date(Date.UTC(year, month - 1, 1))
    const to = new Date(Date.UTC(year, month, 1))

    const ventas = await this.prisma.ventaConOS.findMany({
      where: {
        tenantId,
        obraSocialId: input.obraSocialId,
        estado: 'pendiente_cobro_os',
        presentacionId: null,
        fecha: { gte: from, lt: to },
      },
      orderBy: [{ fecha: 'asc' }, { id: 'asc' }],
    })
    if (ventas.length === 0) {
      return { ok: false, status: 422, error: 'no_pending_sales_for_period' }
    }

    const totalCredito = ventas.reduce((acc, v) => acc + Number(v.creditoOS), 0)
    const csvName = `presentacion-os-${input.obraSocialId}-${input.periodo}.csv`

    try {
      const created = await this.prisma.$transaction(async (tx) => {
        const presentacion = await tx.presentacionOS.create({
          data: {
            tenantId,
            obraSocialId: input.obraSocialId,
            periodo: input.periodo,
            totalCredito: new Decimal(totalCredito),
            estado: 'generada',
            archivoCsvName: csvName,
          },
        })
        await tx.ventaConOS.updateMany({
          where: { id: { in: ventas.map((v) => v.id) }, tenantId },
          data: { presentacionId: presentacion.id, estado: 'presentado' },
        })
        return tx.presentacionOS.findFirstOrThrow({
          where: { id: presentacion.id },
          include: PRESENTACION_INCLUDE,
        })
      })
      return { ok: true, data: mapPresentacion(created) }
    } catch (err: unknown) {
      if (isUniqueViolation(err)) {
        return { ok: false, status: 409, error: 'presentacion_periodo_duplicate' }
      }
      throw err
    }
  }

  async exportPresentacionCsv(
    tenantId: number,
    presentacionId: number,
  ): Promise<ServiceResult<{ filename: string; csv: string }>> {
    const presentacion = await this.prisma.presentacionOS.findFirst({
      where: { id: presentacionId, tenantId },
    })
    if (!presentacion) return { ok: false, status: 404, error: 'presentacion_not_found' }

    const ventas = await this.prisma.ventaConOS.findMany({
      where: { tenantId, presentacionId },
      orderBy: [{ fecha: 'asc' }, { id: 'asc' }],
    })
    const csv = buildPresentacionOsCsv(
      ventas.map((v) => ({
        ventaId: v.id,
        fecha: v.fecha.toISOString().slice(0, 10),
        nroAfiliado: v.nroAfiliado,
        nroReceta: v.nroReceta ?? '',
        totalVenta: Number(v.totalVenta),
        creditoOS: Number(v.creditoOS),
        copagoPaciente: Number(v.copagoPaciente),
      })),
    )
    return {
      ok: true,
      data: {
        filename: presentacion.archivoCsvName ?? `presentacion-os-${presentacionId}.csv`,
        csv,
      },
    }
  }

  async markPresentacionPresentada(
    tenantId: number,
    presentacionId: number,
  ): Promise<ServiceResult<PresentacionOSRow>> {
    const existing = await this.prisma.presentacionOS.findFirst({
      where: { id: presentacionId, tenantId },
    })
    if (!existing) return { ok: false, status: 404, error: 'presentacion_not_found' }
    if (existing.estado !== 'generada' && existing.estado !== 'presentada') {
      return { ok: false, status: 422, error: 'presentacion_invalid_state' }
    }
    const updated = await this.prisma.presentacionOS.update({
      where: { id: presentacionId },
      data: { estado: 'presentada' },
      include: PRESENTACION_INCLUDE,
    })
    return { ok: true, data: mapPresentacion(updated) }
  }

  async registerCobro(
    tenantId: number,
    presentacionId: number,
    input: PresentacionOSCobroInput,
  ): Promise<ServiceResult<PresentacionOSRow>> {
    if (!Number.isFinite(input.importeCobrado) || input.importeCobrado < 0) {
      return { ok: false, status: 400, error: 'importeCobrado must be a non-negative number' }
    }
    const existing = await this.prisma.presentacionOS.findFirst({
      where: { id: presentacionId, tenantId },
      include: { rechazos: true },
    })
    if (!existing) return { ok: false, status: 404, error: 'presentacion_not_found' }
    if (existing.estado === 'cobrada') {
      return { ok: false, status: 422, error: 'presentacion_already_cobrada' }
    }

    const fechaPago = input.fechaPago ? new Date(input.fechaPago) : new Date()
    if (Number.isNaN(fechaPago.getTime())) {
      return { ok: false, status: 400, error: 'fechaPago must be a valid ISO date' }
    }

    const hasRechazos = existing.rechazos.length > 0
    /**
     * @en Only ventas with an explicit rechazo stay rejected; other eligible lines become cobrado.
     * @es Solo las ventas con rechazo explícito quedan rechazadas; el resto elegible pasa a cobrado.
     * @pt-BR Só vendas com rejeição explícita ficam rejeitadas; as demais elegíveis passam a cobrado.
     */
    const rejectedVentaIds = [
      ...new Set(existing.rechazos.map((r) => r.ventaConOSId).filter((id) => Number.isInteger(id) && id > 0)),
    ]
    const updated = await this.prisma.$transaction(async (tx) => {
      const presentacion = await tx.presentacionOS.update({
        where: { id: presentacionId },
        data: {
          estado: hasRechazos ? 'con_rechazos' : 'cobrada',
          importeCobrado: new Decimal(input.importeCobrado),
          fechaPago,
        },
      })
      if (rejectedVentaIds.length > 0) {
        await tx.ventaConOS.updateMany({
          where: {
            tenantId,
            presentacionId,
            id: { in: rejectedVentaIds },
            estado: { in: ['presentado', 'pendiente_cobro_os', 'rechazado_os'] },
          },
          data: { estado: 'rechazado_os' },
        })
      }
      await tx.ventaConOS.updateMany({
        where: {
          tenantId,
          presentacionId,
          estado: { in: ['presentado', 'pendiente_cobro_os'] },
          ...(rejectedVentaIds.length > 0 ? { id: { notIn: rejectedVentaIds } } : {}),
        },
        data: { estado: 'cobrado' },
      })
      return tx.presentacionOS.findFirstOrThrow({
        where: { id: presentacion.id },
        include: PRESENTACION_INCLUDE,
      })
    })
    return { ok: true, data: mapPresentacion(updated) }
  }

  async registerRechazo(
    tenantId: number,
    presentacionId: number,
    input: PresentacionOSRechazoInput,
  ): Promise<ServiceResult<PresentacionOSRow>> {
    if (!Number.isFinite(input.importeRechazado) || input.importeRechazado <= 0) {
      return { ok: false, status: 400, error: 'importeRechazado must be a positive number' }
    }
    const presentacion = await this.prisma.presentacionOS.findFirst({
      where: { id: presentacionId, tenantId },
    })
    if (!presentacion) return { ok: false, status: 404, error: 'presentacion_not_found' }
    if (presentacion.estado === 'cobrada') {
      return { ok: false, status: 422, error: 'presentacion_already_cobrada' }
    }

    const venta = await this.prisma.ventaConOS.findFirst({
      where: { id: input.ventaConOSId, tenantId, presentacionId },
    })
    if (!venta) return { ok: false, status: 404, error: 'venta_not_found_in_presentacion' }

    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.presentacionOSRechazo.create({
        data: {
          tenantId,
          presentacionId,
          ventaConOSId: input.ventaConOSId,
          ventaOSItemId: input.ventaOSItemId ?? null,
          importeRechazado: new Decimal(input.importeRechazado),
          motivo: input.motivo?.trim() || null,
        },
      })
      await tx.ventaConOS.update({
        where: { id: input.ventaConOSId },
        data: { estado: 'rechazado_os' },
      })
      await tx.presentacionOS.update({
        where: { id: presentacionId },
        data: { estado: 'con_rechazos' },
      })
      return tx.presentacionOS.findFirstOrThrow({
        where: { id: presentacionId },
        include: PRESENTACION_INCLUDE,
      })
    })
    return { ok: true, data: mapPresentacion(updated) }
  }

  async listPresentaciones(
    tenantId: number,
    obraSocialId?: number,
  ): Promise<ServiceResult<PresentacionOSRow[]>> {
    const rows = await this.prisma.presentacionOS.findMany({
      where: {
        tenantId,
        ...(obraSocialId ? { obraSocialId } : {}),
      },
      include: PRESENTACION_INCLUDE,
      orderBy: [{ periodo: 'desc' }, { id: 'desc' }],
      take: 100,
    })
    return { ok: true, data: rows.map(mapPresentacion) }
  }

  async cuentaCorriente(tenantId: number): Promise<ServiceResult<ObraSocialCuentaCorrienteRow[]>> {
    const obras = await this.prisma.obraSocial.findMany({
      where: { tenantId },
      orderBy: { nombre: 'asc' },
    })
    const ventas = await this.prisma.ventaConOS.findMany({
      where: { tenantId },
      select: { id: true, obraSocialId: true, estado: true, creditoOS: true },
    })
    const rechazos = await this.prisma.presentacionOSRechazo.findMany({
      where: { tenantId },
      select: {
        ventaConOSId: true,
        importeRechazado: true,
        ventaConOS: { select: { obraSocialId: true } },
      },
    })

    const byOs = new Map<number, ObraSocialCuentaCorrienteRow>()
    for (const os of obras) {
      byOs.set(os.id, {
        obraSocialId: os.id,
        nombre: os.nombre,
        codigo: os.codigo,
        creditoPendiente: 0,
        creditoPresentado: 0,
        creditoCobrado: 0,
        creditoRechazado: 0,
        saldoAbierto: 0,
      })
    }

    /** @en Ventas with explicit PresentacionOSRechazo rows; prefer importeRechazado over full creditoOS. @es Ventas con rechazo explícito; preferir importeRechazado. @pt-BR Vendas com rejeição explícita; preferir importeRechazado. */
    const ventasWithExplicitRechazo = new Set<number>()
    for (const r of rechazos) {
      const row = byOs.get(r.ventaConOS.obraSocialId)
      if (!row) continue
      row.creditoRechazado += Number(r.importeRechazado)
      ventasWithExplicitRechazo.add(r.ventaConOSId)
    }

    for (const v of ventas) {
      const row = byOs.get(v.obraSocialId)
      if (!row) continue
      const credit = Number(v.creditoOS)
      if (v.estado === 'pendiente_cobro_os') row.creditoPendiente += credit
      else if (v.estado === 'presentado') row.creditoPresentado += credit
      else if (v.estado === 'cobrado') row.creditoCobrado += credit
      else if (v.estado === 'rechazado_os' && !ventasWithExplicitRechazo.has(v.id)) {
        row.creditoRechazado += credit
      }
    }

    for (const row of byOs.values()) {
      row.creditoPendiente = round2(row.creditoPendiente)
      row.creditoPresentado = round2(row.creditoPresentado)
      row.creditoCobrado = round2(row.creditoCobrado)
      row.creditoRechazado = round2(row.creditoRechazado)
      row.saldoAbierto = round2(row.creditoPendiente + row.creditoPresentado)
    }

    return { ok: true, data: [...byOs.values()] }
  }
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100
}

function isUniqueViolation(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code?: string }).code === 'P2002'
  )
}

/** @en Exported for unit tests of allowed product types. @es Exportado para tests. @pt-BR Exportado para testes. */
export const OS_TIPOS = OS_TIPO_PRODUCTOS
