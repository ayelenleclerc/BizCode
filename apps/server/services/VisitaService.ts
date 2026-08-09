import type { Prisma, PrismaClient } from '@prisma/client'
import type {
  VisitaDiaKpi,
  VisitaEstadoPlan,
  VisitaResultado,
  VisitaVendedorCreateInput,
  VisitaVendedorRow,
  VisitaVendedorUpdateInput,
} from '@bizcode/types'
import type { ServiceResult } from './serviceResults'

const visitaInclude = {
  cliente: {
    select: {
      id: true,
      codigo: true,
      rsocial: true,
      domicilio: true,
      localidad: true,
      deliveryZoneId: true,
    },
  },
  vendedor: { select: { id: true, username: true, role: true } },
} satisfies Prisma.VisitaVendedorInclude

type VisitaDbRow = Prisma.VisitaVendedorGetPayload<{ include: typeof visitaInclude }>

function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function parseFechaPlanificada(value: string): Date | null {
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

function mapVisita(
  row: VisitaDbRow,
  ultimaCompraAt: string | null = null,
): VisitaVendedorRow {
  return {
    id: row.id,
    tenantId: row.tenantId,
    vendedorId: row.vendedorId,
    clienteId: row.clienteId,
    fechaPlanificada: toIsoDate(row.fechaPlanificada),
    estadoPlan: row.estadoPlan as VisitaEstadoPlan,
    resultado: (row.resultado as VisitaResultado | null) ?? null,
    notasVisita: row.notasVisita,
    pedidoId: row.pedidoId,
    orden: row.orden,
    duracionMinutos: row.duracionMinutos,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    cliente: row.cliente,
    vendedor: {
      id: row.vendedor.id,
      username: row.vendedor.username,
      role: String(row.vendedor.role),
    },
    ultimaCompraAt,
  }
}

function computeKpi(rows: VisitaDbRow[]): VisitaDiaKpi {
  const planificadas = rows.length
  const visitados = rows.filter(
    (r) => r.estadoPlan === 'completada' || r.estadoPlan === 'no_visitada',
  ).length
  const pedidos = rows.filter((r) => r.resultado === 'venta' || r.pedidoId != null).length
  const conversionPct =
    visitados === 0 ? 0 : Math.round((pedidos / visitados) * 1000) / 10
  return { planificadas, visitados, pedidos, conversionPct }
}

/**
 * @en Field seller visit agenda (#170).
 * @es Agenda de visitas del vendedor de campo (#170).
 * @pt-BR Agenda de visitas do vendedor de campo (#170).
 */
export class VisitaService {
  constructor(private readonly prisma: PrismaClient) {}

  async list(
    tenantId: number,
    filters: { fecha: string; vendedorId: number },
    take: number,
    skip: number,
  ): Promise<ServiceResult<{ total: number; visitas: VisitaVendedorRow[]; kpi: VisitaDiaKpi }>> {
    const fecha = parseFechaPlanificada(filters.fecha)
    if (!fecha) {
      return { ok: false, status: 400, error: 'fecha must be YYYY-MM-DD' }
    }

    const where: Prisma.VisitaVendedorWhereInput = {
      tenantId,
      vendedorId: filters.vendedorId,
      fechaPlanificada: fecha,
    }

    const [total, rows] = await Promise.all([
      this.prisma.visitaVendedor.count({ where }),
      this.prisma.visitaVendedor.findMany({
        where,
        include: visitaInclude,
        orderBy: [{ orden: 'asc' }, { id: 'asc' }],
        take,
        skip,
      }),
    ])

    const allForKpi =
      skip === 0 && take >= total
        ? rows
        : await this.prisma.visitaVendedor.findMany({
            where,
            include: visitaInclude,
            orderBy: [{ orden: 'asc' }, { id: 'asc' }],
          })

    const clienteIds = [...new Set(rows.map((r) => r.clienteId))]
    const lastPedidos =
      clienteIds.length === 0
        ? []
        : await this.prisma.pedido.groupBy({
            by: ['clienteId'],
            where: { tenantId, clienteId: { in: clienteIds } },
            _max: { createdAt: true },
          })
    const lastByCliente = new Map(
      lastPedidos.map((p) => [
        p.clienteId,
        p._max.createdAt ? p._max.createdAt.toISOString() : null,
      ]),
    )

    return {
      ok: true,
      data: {
        total,
        visitas: rows.map((r) => mapVisita(r, lastByCliente.get(r.clienteId) ?? null)),
        kpi: computeKpi(allForKpi),
      },
    }
  }

  async getById(tenantId: number, id: number): Promise<ServiceResult<VisitaVendedorRow>> {
    const row = await this.prisma.visitaVendedor.findFirst({
      where: { id, tenantId },
      include: visitaInclude,
    })
    if (!row) {
      return { ok: false, status: 404, error: 'Visita not found' }
    }
    const last = await this.prisma.pedido.findFirst({
      where: { tenantId, clienteId: row.clienteId },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    })
    return {
      ok: true,
      data: mapVisita(row, last?.createdAt.toISOString() ?? null),
    }
  }

  async create(
    tenantId: number,
    input: VisitaVendedorCreateInput,
  ): Promise<ServiceResult<VisitaVendedorRow>> {
    const fecha = parseFechaPlanificada(input.fechaPlanificada)
    if (!fecha) {
      return { ok: false, status: 400, error: 'fechaPlanificada must be YYYY-MM-DD' }
    }

    const [vendedor, cliente] = await Promise.all([
      this.prisma.appUser.findFirst({
        where: { id: input.vendedorId, tenantId, active: true },
        select: { id: true },
      }),
      this.prisma.cliente.findFirst({
        where: { id: input.clienteId, tenantId },
        select: { id: true },
      }),
    ])
    if (!vendedor) {
      return { ok: false, status: 400, error: 'vendedorId is not valid for this tenant' }
    }
    if (!cliente) {
      return { ok: false, status: 400, error: 'clienteId is not valid for this tenant' }
    }

    const row = await this.prisma.visitaVendedor.create({
      data: {
        tenantId,
        vendedorId: input.vendedorId,
        clienteId: input.clienteId,
        fechaPlanificada: fecha,
        orden: input.orden ?? 0,
        notasVisita: input.notasVisita?.trim() || null,
        estadoPlan: 'pendiente',
      },
      include: visitaInclude,
    })
    return { ok: true, data: mapVisita(row, null) }
  }

  async update(
    tenantId: number,
    id: number,
    input: VisitaVendedorUpdateInput,
  ): Promise<ServiceResult<VisitaVendedorRow>> {
    const existing = await this.prisma.visitaVendedor.findFirst({
      where: { id, tenantId },
      select: { id: true },
    })
    if (!existing) {
      return { ok: false, status: 404, error: 'Visita not found' }
    }

    if (input.pedidoId !== undefined && input.pedidoId !== null) {
      const pedido = await this.prisma.pedido.findFirst({
        where: { id: input.pedidoId, tenantId },
        select: { id: true },
      })
      if (!pedido) {
        return { ok: false, status: 400, error: 'pedidoId is not valid for this tenant' }
      }
    }

    if (
      input.resultado === 'sin_pedido' ||
      input.resultado === 'cliente_ausente'
    ) {
      const notas = input.notasVisita?.trim() ?? ''
      if (notas.length < 1) {
        return {
          ok: false,
          status: 400,
          error: 'notasVisita is required when resultado is sin_pedido or cliente_ausente',
        }
      }
    }

    let estadoPlan = input.estadoPlan
    if (estadoPlan === undefined && input.resultado != null) {
      estadoPlan = input.resultado === 'cliente_ausente' ? 'no_visitada' : 'completada'
    }

    const row = await this.prisma.visitaVendedor.update({
      where: { id },
      data: {
        ...(estadoPlan !== undefined ? { estadoPlan } : {}),
        ...(input.resultado !== undefined ? { resultado: input.resultado } : {}),
        ...(input.notasVisita !== undefined
          ? { notasVisita: input.notasVisita === null ? null : input.notasVisita.trim() || null }
          : {}),
        ...(input.pedidoId !== undefined ? { pedidoId: input.pedidoId } : {}),
        ...(input.orden !== undefined ? { orden: input.orden } : {}),
        ...(input.duracionMinutos !== undefined ? { duracionMinutos: input.duracionMinutos } : {}),
      },
      include: visitaInclude,
    })
    return { ok: true, data: mapVisita(row, null) }
  }
}
