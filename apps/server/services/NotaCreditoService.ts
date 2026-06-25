import type { NotaCredito, Prisma, PrismaClient } from '@prisma/client'
import { endOfDay, parseIsoDateParam } from '../reportesPeriodUtils'

export type NotaCreditoListFilter = {
  from: string
  to: string
  clienteId?: number
}

const facturaOrigenSelect = {
  id: true,
  tipo: true,
  prefijo: true,
  numero: true,
  clienteId: true,
  fecha: true,
  total: true,
  estado: true,
} as const

export type NotaCreditoWithFacturaRow = NotaCredito & {
  facturaOrigen: Prisma.FacturaGetPayload<{ select: typeof facturaOrigenSelect }>
}

export type NotaCreditoListResult = {
  total: number
  rows: NotaCreditoWithFacturaRow[]
}

/**
 * @en Tenant-scoped credit note list/detail (GitHub #146).
 * @es Listado y detalle de notas de crédito por tenant (#146).
 * @pt-BR Listagem e detalhe de notas de crédito por tenant (#146).
 */
export class NotaCreditoService {
  constructor(private readonly prisma: PrismaClient) {}

  async list(
    tenantId: number,
    filter: NotaCreditoListFilter,
    take: number,
    skip: number,
  ): Promise<NotaCreditoListResult> {
    const fromD = parseIsoDateParam(filter.from)
    const toD = parseIsoDateParam(filter.to)
    if (!fromD || !toD) {
      throw new Error('INVALID_DATE_RANGE')
    }
    const fromStart = new Date(fromD.getFullYear(), fromD.getMonth(), fromD.getDate(), 0, 0, 0, 0)
    const toEnd = endOfDay(toD)

    const where: Prisma.NotaCreditoWhereInput = {
      tenantId,
      createdAt: { gte: fromStart, lte: toEnd },
      ...(filter.clienteId !== undefined ? { facturaOrigen: { clienteId: filter.clienteId } } : {}),
    }

    const [total, rows] = await Promise.all([
      this.prisma.notaCredito.count({ where }),
      this.prisma.notaCredito.findMany({
        where,
        include: { facturaOrigen: { select: facturaOrigenSelect } },
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
    ])
    return { total, rows }
  }

  async getById(tenantId: number, id: number): Promise<NotaCreditoWithFacturaRow | null> {
    return this.prisma.notaCredito.findFirst({
      where: { id, tenantId },
      include: { facturaOrigen: { select: facturaOrigenSelect } },
    })
  }
}
