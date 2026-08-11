import type { Prisma, PrismaClient } from '@prisma/client'
import type {
  RutaDiaStats,
  RutaParadaEstado,
  RutaParadaPatchInput,
  RutaParadaRow,
  RutaParadasReplaceInput,
  RutaVendedorCreateInput,
  RutaVendedorRow,
} from '@bizcode/types'
import { notifyManagers } from '../notifications'
import { FeriadoService } from './FeriadoService'
import type { ServiceResult } from './serviceResults'

const MAX_PARADAS = 50

const paradaInclude = {
  cliente: {
    select: {
      id: true,
      codigo: true,
      rsocial: true,
      domicilio: true,
      localidad: true,
      deliveryZoneId: true,
      latitud: true,
      longitud: true,
    },
  },
} satisfies Prisma.RutaParadaInclude

const rutaInclude = {
  paradas: {
    include: paradaInclude,
    orderBy: [{ orden: 'asc' as const }, { id: 'asc' as const }],
  },
  vendedor: { select: { id: true, username: true, role: true } },
} satisfies Prisma.RutaVendedorInclude

type RutaDb = Prisma.RutaVendedorGetPayload<{ include: typeof rutaInclude }>
type ParadaDb = Prisma.RutaParadaGetPayload<{ include: typeof paradaInclude }>

function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function parseFecha(value: string): Date | null {
  const trimmed = value.trim()
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return null
  }
  const d = new Date(`${trimmed}T00:00:00.000Z`)
  if (Number.isNaN(d.getTime())) {
    return null
  }
  return d
}

function decimalToNumber(v: Prisma.Decimal | number | null | undefined): number | null {
  if (v == null) return null
  if (typeof v === 'number') return v
  const n = Number(v.toString())
  return Number.isFinite(n) ? n : null
}

function mapParada(row: ParadaDb): RutaParadaRow {
  return {
    id: row.id,
    rutaId: row.rutaId,
    clienteId: row.clienteId,
    orden: row.orden,
    estado: row.estado as RutaParadaEstado,
    motivo: row.motivo,
    visitaId: row.visitaId,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    cliente: row.cliente
      ? {
          id: row.cliente.id,
          codigo: row.cliente.codigo,
          rsocial: row.cliente.rsocial,
          domicilio: row.cliente.domicilio,
          localidad: row.cliente.localidad,
          deliveryZoneId: row.cliente.deliveryZoneId,
          latitud: decimalToNumber(row.cliente.latitud),
          longitud: decimalToNumber(row.cliente.longitud),
        }
      : undefined,
  }
}

function mapRuta(row: RutaDb): RutaVendedorRow {
  return {
    id: row.id,
    tenantId: row.tenantId,
    vendedorId: row.vendedorId,
    fecha: toIsoDate(row.fecha),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    paradas: row.paradas.map(mapParada),
    vendedor: {
      id: row.vendedor.id,
      username: row.vendedor.username,
      role: String(row.vendedor.role),
    },
  }
}

function computeStats(paradas: Array<{ estado: string; visitaId: number | null }>): RutaDiaStats {
  const total = paradas.length
  const pendientes = paradas.filter((p) => p.estado === 'pendiente').length
  const visitados = paradas.filter((p) => p.estado === 'visitado').length
  const postergados = paradas.filter((p) => p.estado === 'postergado').length
  const noVisitados = paradas.filter((p) => p.estado === 'no_visitado').length
  const pedidos = paradas.filter((p) => p.estado === 'visitado' && p.visitaId != null).length
  const conversionPct =
    visitados === 0 ? 0 : Math.round((pedidos / visitados) * 1000) / 10
  return { total, pendientes, visitados, postergados, noVisitados, pedidos, conversionPct }
}

/**
 * @en Ordered daily seller route planning (#267).
 * @es Planificación de ruta diaria ordenada del vendedor (#267).
 * @pt-BR Planejamento de rota diária ordenada do vendedor (#267).
 */
export class RutaService {
  private readonly feriados: FeriadoService

  constructor(private readonly prisma: PrismaClient) {
    this.feriados = new FeriadoService(prisma)
  }

  async getByFilters(
    tenantId: number,
    filters: { vendedorId: number; fecha: string },
  ): Promise<ServiceResult<RutaVendedorRow | null>> {
    const fecha = parseFecha(filters.fecha)
    if (!fecha) {
      return { ok: false, status: 400, error: 'fecha must be YYYY-MM-DD' }
    }
    const row = await this.prisma.rutaVendedor.findFirst({
      where: { tenantId, vendedorId: filters.vendedorId, fecha },
      include: rutaInclude,
    })
    return { ok: true, data: row ? mapRuta(row) : null }
  }

  async getById(tenantId: number, id: number): Promise<ServiceResult<RutaVendedorRow>> {
    const row = await this.prisma.rutaVendedor.findFirst({
      where: { id, tenantId },
      include: rutaInclude,
    })
    if (!row) {
      return { ok: false, status: 404, error: 'Ruta not found' }
    }
    return { ok: true, data: mapRuta(row) }
  }

  async create(
    tenantId: number,
    input: RutaVendedorCreateInput,
  ): Promise<ServiceResult<RutaVendedorRow>> {
    const fecha = parseFecha(input.fecha)
    if (!fecha) {
      return { ok: false, status: 400, error: 'fecha must be YYYY-MM-DD' }
    }
    const clienteIds = input.clienteIds ?? []
    if (clienteIds.length > MAX_PARADAS) {
      return { ok: false, status: 400, error: `At most ${MAX_PARADAS} paradas allowed` }
    }

    const vendedor = await this.prisma.appUser.findFirst({
      where: { id: input.vendedorId, tenantId, active: true },
      select: { id: true },
    })
    if (!vendedor) {
      return { ok: false, status: 400, error: 'vendedorId is not valid for this tenant' }
    }

    if (clienteIds.length > 0) {
      const unique = new Set(clienteIds)
      if (unique.size !== clienteIds.length) {
        return { ok: false, status: 400, error: 'clienteIds must be unique' }
      }
      const count = await this.prisma.cliente.count({
        where: { tenantId, id: { in: clienteIds } },
      })
      if (count !== clienteIds.length) {
        return { ok: false, status: 400, error: 'One or more clienteIds are invalid for this tenant' }
      }
    }

    try {
      const row = await this.prisma.rutaVendedor.create({
        data: {
          tenantId,
          vendedorId: input.vendedorId,
          fecha,
          paradas: {
            create: clienteIds.map((clienteId, index) => ({
              clienteId,
              orden: index,
              estado: 'pendiente',
            })),
          },
        },
        include: rutaInclude,
      })
      return { ok: true, data: mapRuta(row) }
    } catch (err: unknown) {
      if ((err as { code?: string }).code === 'P2002') {
        return { ok: false, status: 409, error: 'Ruta already exists for this seller and date' }
      }
      throw err
    }
  }

  private async assertEditable(ruta: { fecha: Date }): Promise<ServiceResult<true>> {
    const todayYmd = toIsoDate(new Date())
    const rutaYmd = toIsoDate(ruta.fecha)
    if (rutaYmd < todayYmd) {
      return { ok: false, status: 400, error: 'Past routes are not editable' }
    }
    return { ok: true, data: true }
  }

  async replaceParadas(
    tenantId: number,
    rutaId: number,
    input: RutaParadasReplaceInput,
  ): Promise<ServiceResult<RutaVendedorRow>> {
    const existing = await this.prisma.rutaVendedor.findFirst({
      where: { id: rutaId, tenantId },
      select: { id: true, fecha: true },
    })
    if (!existing) {
      return { ok: false, status: 404, error: 'Ruta not found' }
    }
    const editable = await this.assertEditable(existing)
    if (!editable.ok) return editable

    const paradas = input.paradas ?? []
    if (paradas.length > MAX_PARADAS) {
      return { ok: false, status: 400, error: `At most ${MAX_PARADAS} paradas allowed` }
    }
    const clienteIds = paradas.map((p) => p.clienteId)
    if (new Set(clienteIds).size !== clienteIds.length) {
      return { ok: false, status: 400, error: 'Duplicate clienteId in paradas' }
    }
    for (const p of paradas) {
      if (!Number.isInteger(p.orden) || p.orden < 0) {
        return { ok: false, status: 400, error: 'orden must be an integer >= 0' }
      }
      if (
        p.estado != null &&
        !['pendiente', 'visitado', 'postergado', 'no_visitado'].includes(p.estado)
      ) {
        return { ok: false, status: 400, error: 'Invalid estado' }
      }
    }
    if (clienteIds.length > 0) {
      const count = await this.prisma.cliente.count({
        where: { tenantId, id: { in: clienteIds } },
      })
      if (count !== clienteIds.length) {
        return { ok: false, status: 400, error: 'One or more clienteIds are invalid for this tenant' }
      }
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.rutaParada.deleteMany({ where: { rutaId } })
      if (paradas.length > 0) {
        await tx.rutaParada.createMany({
          data: paradas.map((p) => ({
            rutaId,
            clienteId: p.clienteId,
            orden: p.orden,
            estado: p.estado ?? 'pendiente',
            motivo: p.motivo?.trim() || null,
          })),
        })
      }
    })

    return this.getById(tenantId, rutaId)
  }

  async patchParada(
    tenantId: number,
    rutaId: number,
    paradaId: number,
    input: RutaParadaPatchInput,
  ): Promise<ServiceResult<RutaVendedorRow>> {
    const ruta = await this.prisma.rutaVendedor.findFirst({
      where: { id: rutaId, tenantId },
      select: { id: true, fecha: true, vendedorId: true },
    })
    if (!ruta) {
      return { ok: false, status: 404, error: 'Ruta not found' }
    }
    const editable = await this.assertEditable(ruta)
    if (!editable.ok) return editable

    const parada = await this.prisma.rutaParada.findFirst({
      where: { id: paradaId, rutaId },
    })
    if (!parada) {
      return { ok: false, status: 404, error: 'Parada not found' }
    }

    if (!['pendiente', 'visitado', 'postergado', 'no_visitado'].includes(input.estado)) {
      return { ok: false, status: 400, error: 'Invalid estado' }
    }
    if (input.estado === 'no_visitado') {
      const motivo = input.motivo?.trim() ?? ''
      if (motivo.length < 1) {
        return { ok: false, status: 400, error: 'motivo is required when estado is no_visitado' }
      }
    }
    if (input.visitaId !== undefined && input.visitaId !== null) {
      const visita = await this.prisma.visitaVendedor.findFirst({
        where: { id: input.visitaId, tenantId },
        select: { id: true },
      })
      if (!visita) {
        return { ok: false, status: 400, error: 'visitaId is not valid for this tenant' }
      }
    }

    await this.prisma.rutaParada.update({
      where: { id: paradaId },
      data: {
        estado: input.estado,
        ...(input.motivo !== undefined
          ? { motivo: input.motivo === null ? null : input.motivo.trim() || null }
          : {}),
        ...(input.visitaId !== undefined ? { visitaId: input.visitaId } : {}),
      },
    })

    if (input.estado === 'postergado') {
      const nextDay = await this.feriados.nextBusinessDay(tenantId, toIsoDate(ruta.fecha))
      if (!nextDay.ok) return nextDay
      const nextFecha = parseFecha(nextDay.data)!
      let nextRuta = await this.prisma.rutaVendedor.findFirst({
        where: { tenantId, vendedorId: ruta.vendedorId, fecha: nextFecha },
        include: { paradas: { select: { orden: true, clienteId: true } } },
      })
      if (!nextRuta) {
        nextRuta = await this.prisma.rutaVendedor.create({
          data: {
            tenantId,
            vendedorId: ruta.vendedorId,
            fecha: nextFecha,
          },
          include: { paradas: { select: { orden: true, clienteId: true } } },
        })
      }
      const already = nextRuta.paradas.some((p) => p.clienteId === parada.clienteId)
      if (!already) {
        const maxOrden =
          nextRuta.paradas.length === 0
            ? -1
            : Math.max(...nextRuta.paradas.map((p) => p.orden))
        if (nextRuta.paradas.length >= MAX_PARADAS) {
          return {
            ok: false,
            status: 400,
            error: `Next business day route already has ${MAX_PARADAS} paradas`,
          }
        }
        await this.prisma.rutaParada.create({
          data: {
            rutaId: nextRuta.id,
            clienteId: parada.clienteId,
            orden: maxOrden + 1,
            estado: 'pendiente',
            motivo: null,
          },
        })
      }
      try {
        await notifyManagers(this.prisma, tenantId, 'ruta_parada_postergada', {
          pedidoId: undefined,
          detail: `paradaId=${paradaId};rutaId=${rutaId};nextFecha=${nextDay.data}`,
          username: String(ruta.vendedorId),
        })
      } catch {
        // soft-fail notification
      }
    }

    if (input.estado === 'visitado') {
      const fechaPlanificada = ruta.fecha
      let visitaId = input.visitaId ?? parada.visitaId
      if (visitaId == null) {
        const existingVisita = await this.prisma.visitaVendedor.findFirst({
          where: {
            tenantId,
            vendedorId: ruta.vendedorId,
            clienteId: parada.clienteId,
            fechaPlanificada,
          },
          select: { id: true },
        })
        if (existingVisita) {
          visitaId = existingVisita.id
          await this.prisma.visitaVendedor.update({
            where: { id: visitaId },
            data: { estadoPlan: 'completada' },
          })
        } else {
          const created = await this.prisma.visitaVendedor.create({
            data: {
              tenantId,
              vendedorId: ruta.vendedorId,
              clienteId: parada.clienteId,
              fechaPlanificada,
              estadoPlan: 'completada',
              orden: parada.orden,
            },
            select: { id: true },
          })
          visitaId = created.id
        }
        await this.prisma.rutaParada.update({
          where: { id: paradaId },
          data: { visitaId },
        })
      }
    }

    return this.getById(tenantId, rutaId)
  }

  async stats(tenantId: number, rutaId: number): Promise<ServiceResult<RutaDiaStats>> {
    const ruta = await this.prisma.rutaVendedor.findFirst({
      where: { id: rutaId, tenantId },
      select: { id: true },
    })
    if (!ruta) {
      return { ok: false, status: 404, error: 'Ruta not found' }
    }
    const paradas = await this.prisma.rutaParada.findMany({
      where: { rutaId },
      select: { estado: true, visitaId: true },
    })
    return { ok: true, data: computeStats(paradas) }
  }
}
