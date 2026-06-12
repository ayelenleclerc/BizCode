import type { Factura, PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import type { ServiceResult } from './serviceResults'
import { buildFacturaPdfBuffer } from '../fiscal/ar/facturaPdf'

export type PortalFacturaEstado = 'pagada' | 'pendiente' | 'vencida'

export type PortalFacturaDto = {
  id: number
  ref: string
  fecha: string
  total: string
  pagado: string
  pendiente: string
  estado: PortalFacturaEstado
  mpPaymentLink?: string
  mpEstado?: string
}

export type PortalFacturaListResult = {
  facturas: PortalFacturaDto[]
  total: number
}

function formatFacturaRef(factura: Pick<Factura, 'tipo' | 'prefijo' | 'numero'>): string {
  const prefijo = factura.prefijo.padStart(4, '0')
  const numero = String(factura.numero).padStart(8, '0')
  return `${factura.tipo}-${prefijo}-${numero}`
}

function decimalToMoneyString(value: Decimal): string {
  return value.toFixed(2)
}

function computeEstado(pendiente: Decimal, fecha: Date, creditDays: number): PortalFacturaEstado {
  if (pendiente.lessThanOrEqualTo(0)) {
    return 'pagada'
  }
  const due = new Date(fecha)
  due.setDate(due.getDate() + Math.max(0, creditDays))
  return due.getTime() < Date.now() ? 'vencida' : 'pendiente'
}

/**
 * @en Customer-scoped invoice listing and PDF for the B2B portal (#240).
 * @es Listado y PDF de facturas del cliente en el portal B2B (#240).
 * @pt-BR Listagem e PDF de faturas do cliente no portal B2B (#240).
 */
export class PortalFacturaService {
  constructor(private readonly prisma: PrismaClient) {}

  private resolvePortalMpFields(
    factura: Pick<Factura, 'mpPaymentLink' | 'mpEstado' | 'mpPreferenceExpiresAt'>,
    now: Date,
  ): Pick<PortalFacturaDto, 'mpPaymentLink' | 'mpEstado'> {
    if (factura.mpEstado !== 'pending' || !factura.mpPaymentLink) {
      return {}
    }
    if (factura.mpPreferenceExpiresAt && factura.mpPreferenceExpiresAt.getTime() <= now.getTime()) {
      return {}
    }
    return {
      mpPaymentLink: factura.mpPaymentLink,
      mpEstado: factura.mpEstado,
    }
  }

  async list(
    tenantId: number,
    portalClienteId: number,
    filters: { estado?: PortalFacturaEstado; from?: Date; to?: Date },
    take: number,
    skip: number,
  ): Promise<PortalFacturaListResult> {
    const cliente = await this.prisma.cliente.findFirst({
      where: { id: portalClienteId, tenantId, activo: true },
    })
    if (!cliente) {
      return { facturas: [], total: 0 }
    }

    const where = {
      tenantId,
      clienteId: portalClienteId,
      estado: 'A',
      ...(filters.from || filters.to
        ? {
            fecha: {
              ...(filters.from ? { gte: filters.from } : {}),
              ...(filters.to ? { lte: filters.to } : {}),
            },
          }
        : {}),
    }

    const facturas = await this.prisma.factura.findMany({
      where,
      orderBy: { fecha: 'desc' },
      select: {
        id: true,
        tipo: true,
        prefijo: true,
        numero: true,
        fecha: true,
        total: true,
        mpPaymentLink: true,
        mpEstado: true,
        mpPreferenceExpiresAt: true,
      },
    })
    if (facturas.length === 0) {
      return { facturas: [], total: 0 }
    }

    const ids = facturas.map((f) => f.id)
    const allocations = await this.prisma.reciboCobroImputacion.groupBy({
      by: ['facturaId'],
      where: {
        facturaId: { in: ids },
        reciboCobro: { tenantId, clienteId: portalClienteId, estado: 'emitido' },
      },
      _sum: { importe: true },
    })
    const paidMap = new Map<number, Decimal>()
    for (const row of allocations) {
      if (row._sum.importe != null) {
        paidMap.set(row.facturaId, row._sum.importe)
      }
    }

    const mapped: PortalFacturaDto[] = []
    const now = new Date()
    for (const f of facturas) {
      const pagado = paidMap.get(f.id) ?? new Decimal(0)
      const pendiente = f.total.minus(pagado)
      const estado = computeEstado(pendiente, f.fecha, cliente.creditDays)
      if (filters.estado && filters.estado !== estado) {
        continue
      }
      mapped.push({
        id: f.id,
        ref: formatFacturaRef(f),
        fecha: f.fecha.toISOString(),
        total: decimalToMoneyString(f.total),
        pagado: decimalToMoneyString(pagado),
        pendiente: decimalToMoneyString(pendiente),
        estado,
        ...(this.resolvePortalMpFields(f, now)),
      })
    }

    const total = mapped.length
    const page = mapped.slice(skip, skip + take)
    return { facturas: page, total }
  }

  async getPdfBuffer(
    tenantId: number,
    portalClienteId: number,
    facturaId: number,
  ): Promise<ServiceResult<Buffer>> {
    const factura = await this.prisma.factura.findFirst({
      where: { id: facturaId, tenantId, clienteId: portalClienteId, estado: 'A' },
    })
    if (!factura) {
      return { ok: false, status: 404, error: 'Factura not found' }
    }
    return buildFacturaPdfBuffer(this.prisma, tenantId, facturaId, { preview: false })
  }
}
