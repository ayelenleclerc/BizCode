import type { Prisma, PrismaClient } from '@prisma/client'
import type {
  GarantiaEstado,
  GarantiaLookupResult,
  GarantiaRegisterInput,
  GarantiaUsoInput,
} from '@bizcode/types'
import type { ServiceResult } from './serviceResults'

const garantiaInclude = {
  cliente: { select: { id: true, codigo: true, rsocial: true } },
  articulo: { select: { id: true, codigo: true, descripcion: true } },
  factura: { select: { id: true, tipo: true, prefijo: true, numero: true } },
  usos: {
    include: { user: { select: { id: true, username: true } } },
    orderBy: { fecha: 'desc' as const },
  },
} satisfies Prisma.GarantiaInclude

export type GarantiaRowDb = Prisma.GarantiaGetPayload<{ include: typeof garantiaInclude }>

export type GarantiaListResult = {
  total: number
  garantias: GarantiaRowDb[]
  counts: {
    vigente: number
    vencida: number
    anulada: number
    vencenEsteMes: number
    vencenProximos3Meses: number
  }
}

function addMonths(date: Date, months: number): Date {
  const result = new Date(date.getTime())
  result.setUTCMonth(result.getUTCMonth() + months)
  return result
}

function parseUtcDate(value: string | null | undefined): Date | null {
  if (value === undefined || value === null || value.trim() === '') return null
  const trimmed = value.trim()
  const date = /^\d{4}-\d{2}-\d{2}$/.test(trimmed)
    ? new Date(`${trimmed}T00:00:00.000Z`)
    : new Date(trimmed)
  return Number.isNaN(date.getTime()) ? null : date
}

/**
 * @en Warranty registry: sale registration, serial lookup, OT usage (#251).
 * @es Registro de garantías: alta en venta, búsqueda por serie, uso en OT (#251).
 * @pt-BR Registro de garantias: alta na venda, busca por série, uso em OT (#251).
 */
export class GarantiaService {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * @en Lazily mark expired warranties as vencida for the tenant.
   * @es Marca como vencidas las garantías expiradas del tenant (lazy).
   * @pt-BR Marca como vencidas as garantias expiradas do tenant (lazy).
   */
  async refreshExpired(tenantId: number): Promise<void> {
    const now = new Date()
    await this.prisma.garantia.updateMany({
      where: {
        tenantId,
        estado: 'vigente',
        fechaVencimiento: { lt: now },
      },
      data: { estado: 'vencida' },
    })
  }

  async list(
    tenantId: number,
    take: number,
    skip: number,
    opts?: { estado?: string | null; q?: string | null; proximas?: boolean },
  ): Promise<GarantiaListResult> {
    await this.refreshExpired(tenantId)
    const now = new Date()
    const endMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59))
    const end3Months = addMonths(now, 3)

    const where: Prisma.GarantiaWhereInput = {
      tenantId,
      ...(opts?.estado ? { estado: opts.estado } : {}),
      ...(opts?.proximas
        ? {
            estado: 'vigente',
            fechaVencimiento: { gte: now, lte: end3Months },
          }
        : {}),
      ...(opts?.q
        ? {
            OR: [
              { nroSerie: { contains: opts.q, mode: 'insensitive' } },
              { nroImei: { contains: opts.q, mode: 'insensitive' } },
              { cliente: { rsocial: { contains: opts.q, mode: 'insensitive' } } },
              { descripcionEquipo: { contains: opts.q, mode: 'insensitive' } },
            ],
          }
        : {}),
    }

    const [total, garantias, vigente, vencida, anulada, vencenEsteMes, vencenProximos3Meses] =
      await Promise.all([
        this.prisma.garantia.count({ where }),
        this.prisma.garantia.findMany({
          where,
          include: garantiaInclude,
          orderBy: [{ fechaVencimiento: 'asc' }, { id: 'desc' }],
          take,
          skip,
        }),
        this.prisma.garantia.count({ where: { tenantId, estado: 'vigente' } }),
        this.prisma.garantia.count({ where: { tenantId, estado: 'vencida' } }),
        this.prisma.garantia.count({ where: { tenantId, estado: 'anulada' } }),
        this.prisma.garantia.count({
          where: {
            tenantId,
            estado: 'vigente',
            fechaVencimiento: { gte: now, lte: endMonth },
          },
        }),
        this.prisma.garantia.count({
          where: {
            tenantId,
            estado: 'vigente',
            fechaVencimiento: { gte: now, lte: end3Months },
          },
        }),
      ])

    return {
      total,
      garantias,
      counts: { vigente, vencida, anulada, vencenEsteMes, vencenProximos3Meses },
    }
  }

  async getById(tenantId: number, id: number): Promise<ServiceResult<GarantiaRowDb>> {
    await this.refreshExpired(tenantId)
    const row = await this.prisma.garantia.findFirst({
      where: { id, tenantId },
      include: garantiaInclude,
    })
    if (!row) return { ok: false, status: 404, error: 'Garantia not found' }
    return { ok: true, data: row }
  }

  async lookupBySerial(tenantId: number, serial: string): Promise<GarantiaLookupResult> {
    await this.refreshExpired(tenantId)
    const trimmed = serial.trim()
    if (!trimmed) return { status: 'sin_registro' }

    const row = await this.prisma.garantia.findFirst({
      where: {
        tenantId,
        OR: [{ nroSerie: trimmed }, { nroImei: trimmed }],
        estado: { in: ['vigente', 'vencida'] },
      },
      include: garantiaInclude,
      orderBy: { fechaVencimiento: 'desc' },
    })
    if (!row) return { status: 'sin_registro' }
    if (row.estado === 'vencida' || row.fechaVencimiento < new Date()) {
      return { status: 'vencida', garantia: this.toPublic(row) }
    }
    return { status: 'vigente', garantia: this.toPublic(row) }
  }

  async findActiveBySerial(
    tenantId: number,
    serial: string,
  ): Promise<{ id: number; fechaVencimiento: Date } | null> {
    await this.refreshExpired(tenantId)
    const trimmed = serial.trim()
    if (!trimmed) return null
    const now = new Date()
    return this.prisma.garantia.findFirst({
      where: {
        tenantId,
        estado: 'vigente',
        fechaVencimiento: { gte: now },
        OR: [{ nroSerie: trimmed }, { nroImei: trimmed }],
      },
      orderBy: { fechaVencimiento: 'desc' },
      select: { id: true, fechaVencimiento: true },
    })
  }

  async register(
    tenantId: number,
    input: GarantiaRegisterInput,
  ): Promise<ServiceResult<GarantiaRowDb>> {
    const articulo = await this.prisma.articulo.findFirst({
      where: { id: input.articuloId, tenantId },
      select: { id: true, mesesGarantia: true, descripcion: true, tipo: true },
    })
    if (!articulo) return { ok: false, status: 400, error: 'articuloId is not valid for this tenant' }

    const meses = input.mesesGarantia ?? articulo.mesesGarantia
    if (meses == null || meses < 1) {
      return { ok: false, status: 400, error: 'mesesGarantia is required and must be >= 1' }
    }

    const cliente = await this.prisma.cliente.findFirst({
      where: { id: input.clienteId, tenantId },
      select: { id: true },
    })
    if (!cliente) return { ok: false, status: 400, error: 'clienteId is not valid for this tenant' }

    if (input.facturaId != null) {
      const factura = await this.prisma.factura.findFirst({
        where: { id: input.facturaId, tenantId },
        select: { id: true },
      })
      if (!factura) return { ok: false, status: 400, error: 'facturaId is not valid for this tenant' }
    }

    const fechaVenta = parseUtcDate(input.fechaVenta) ?? new Date()
    const fechaVencimiento = addMonths(fechaVenta, meses)

    const created = await this.prisma.garantia.create({
      data: {
        tenantId,
        articuloId: input.articuloId,
        clienteId: input.clienteId,
        facturaId: input.facturaId ?? null,
        facturaItemId: input.facturaItemId ?? null,
        nroSerie: input.nroSerie?.trim() || null,
        nroImei: input.nroImei?.trim() || null,
        descripcionEquipo: input.descripcionEquipo?.trim() || articulo.descripcion,
        fechaVenta,
        mesesGarantia: meses,
        fechaVencimiento,
        estado: 'vigente',
      },
      include: garantiaInclude,
    })
    return { ok: true, data: created }
  }

  async anular(tenantId: number, id: number): Promise<ServiceResult<GarantiaRowDb>> {
    const existing = await this.prisma.garantia.findFirst({
      where: { id, tenantId },
      select: { id: true, estado: true },
    })
    if (!existing) return { ok: false, status: 404, error: 'Garantia not found' }
    if (existing.estado === 'anulada') {
      return { ok: false, status: 409, error: 'Garantia already anulada' }
    }
    const updated = await this.prisma.garantia.update({
      where: { id },
      data: { estado: 'anulada' },
      include: garantiaInclude,
    })
    return { ok: true, data: updated }
  }

  async registrarUso(
    tenantId: number,
    garantiaId: number,
    userId: number,
    input: GarantiaUsoInput,
  ): Promise<ServiceResult<GarantiaRowDb>> {
    const garantia = await this.prisma.garantia.findFirst({
      where: { id: garantiaId, tenantId },
      select: { id: true, estado: true, fechaVencimiento: true },
    })
    if (!garantia) return { ok: false, status: 404, error: 'Garantia not found' }
    if (garantia.estado === 'anulada') {
      return { ok: false, status: 409, error: 'Cannot use anulada garantia' }
    }
    if (garantia.estado === 'vencida' || garantia.fechaVencimiento < new Date()) {
      return { ok: false, status: 409, error: 'Cannot use vencida garantia' }
    }

    if (input.otId != null) {
      const ot = await this.prisma.ordenTrabajo.findFirst({
        where: { id: input.otId, tenantId },
        select: { id: true },
      })
      if (!ot) return { ok: false, status: 400, error: 'otId is not valid for this tenant' }
    }

    await this.prisma.garantiaUso.create({
      data: {
        garantiaId,
        otId: input.otId ?? null,
        descripcion: input.descripcion.trim().slice(0, 500),
        userId,
      },
    })

    const refreshed = await this.prisma.garantia.findFirstOrThrow({
      where: { id: garantiaId },
      include: garantiaInclude,
    })
    return { ok: true, data: refreshed }
  }

  /**
   * @en Create warranties for invoice lines whose catalog article has mesesGarantia.
   * @es Crea garantías para líneas de factura cuyo artículo tiene mesesGarantia.
   * @pt-BR Cria garantias para linhas de fatura cujo artigo tem mesesGarantia.
   */
  async registerFromFactura(
    tenantId: number,
    facturaId: number,
    clienteId: number,
    fechaVenta: Date,
    items: Array<{
      id: number
      articuloId: number | null
      nroSerie?: string | null
      nroImei?: string | null
      mesesGarantia?: number | null
    }>,
  ): Promise<void> {
    const articuloIds = [
      ...new Set(
        items
          .map((it) => it.articuloId)
          .filter((id): id is number => typeof id === 'number' && id >= 1),
      ),
    ]
    if (articuloIds.length === 0) return

    const articulos = await this.prisma.articulo.findMany({
      where: { tenantId, id: { in: articuloIds }, mesesGarantia: { not: null, gt: 0 } },
      select: { id: true, mesesGarantia: true, descripcion: true },
    })
    const byId = new Map(articulos.map((a) => [a.id, a]))

    for (const item of items) {
      if (item.articuloId == null) continue
      const art = byId.get(item.articuloId)
      if (!art || art.mesesGarantia == null || art.mesesGarantia < 1) continue
      const meses = item.mesesGarantia ?? art.mesesGarantia
      await this.prisma.garantia.create({
        data: {
          tenantId,
          facturaId,
          facturaItemId: item.id,
          articuloId: art.id,
          clienteId,
          nroSerie: item.nroSerie?.trim() || null,
          nroImei: item.nroImei?.trim() || null,
          descripcionEquipo: art.descripcion,
          fechaVenta,
          mesesGarantia: meses,
          fechaVencimiento: addMonths(fechaVenta, meses),
          estado: 'vigente',
        },
      })
    }
  }

  private toPublic(row: GarantiaRowDb) {
    return {
      id: row.id,
      articuloId: row.articuloId,
      facturaId: row.facturaId,
      facturaItemId: row.facturaItemId,
      nroSerie: row.nroSerie,
      nroImei: row.nroImei,
      descripcionEquipo: row.descripcionEquipo,
      clienteId: row.clienteId,
      fechaVenta: row.fechaVenta.toISOString(),
      mesesGarantia: row.mesesGarantia,
      fechaVencimiento: row.fechaVencimiento.toISOString(),
      estado: row.estado as GarantiaEstado,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      cliente: row.cliente,
      articulo: row.articulo,
      factura: row.factura,
      usos: row.usos.map((u) => ({
        id: u.id,
        garantiaId: u.garantiaId,
        otId: u.otId,
        descripcion: u.descripcion,
        fecha: u.fecha.toISOString(),
        userId: u.userId,
        user: u.user,
      })),
    }
  }
}
