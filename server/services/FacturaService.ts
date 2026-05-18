import type { Cliente, Factura, Prisma, PrismaClient } from '@prisma/client'
import type { FacturaInput } from '../createApp.types'
import { facturaFechaToPrismaDate } from '../routes/restDomainShared'
import type { ServiceResult } from './serviceResults'
import {
  aggregateItemQuantities,
  evaluateStockForInvoice,
  type StockBelowMinimumAlert,
} from './facturaStock'
import { AfipService } from '../fiscal/ar/AfipService'

type FacturaWithRelations = Prisma.FacturaGetPayload<{ include: { cliente: true; items: true } }>

export type FacturaListResult = {
  total: number
  facturas: FacturaWithRelations[]
}

export type FacturaCreateResult = {
  factura: FacturaWithRelations
  updatedCliente: Pick<Cliente, 'id' | 'rsocial' | 'balance' | 'creditLimit'>
  stockBelowMinimum: StockBelowMinimumAlert[]
}

/**
 * @en Invoice domain operations (list, create, void).
 * @es Operaciones de dominio de facturas (listado, alta, anulación).
 * @pt-BR Operações de domínio de faturas (listagem, criação, anulação).
 */
export class FacturaService {
  private readonly afip: AfipService

  constructor(private readonly prisma: PrismaClient) {
    this.afip = new AfipService(prisma)
  }

  async list(tenantId: number, take: number, skip: number): Promise<FacturaListResult> {
    const where = { tenantId }
    const [total, facturas] = await Promise.all([
      this.prisma.factura.count({ where }),
      this.prisma.factura.findMany({
        where,
        include: { cliente: true, items: true },
        orderBy: { fecha: 'desc' },
        take,
        skip,
      }),
    ])
    return { total, facturas }
  }

  async create(tenantId: number, input: FacturaInput): Promise<ServiceResult<FacturaCreateResult>> {
    const { items, fecha, ...factura } = input
    const clienteId = factura.clienteId

    const articuloIds = [...new Set(items.map((it) => it.articuloId))]
    const articulos = await this.prisma.articulo.findMany({
      where: { tenantId, id: { in: articuloIds } },
      select: { id: true, codigo: true, descripcion: true, stock: true, minimo: true },
    })
    if (articulos.length !== articuloIds.length) {
      return {
        ok: false,
        status: 400,
        error: 'One or more articuloId values are not valid for this tenant',
      }
    }

    const qtyByArticulo = aggregateItemQuantities(items)
    const stockEval = evaluateStockForInvoice(articulos, qtyByArticulo)
    if (stockEval.insufficient) {
      return { ok: false, status: 422, error: 'INSUFFICIENT_STOCK' }
    }

    const clienteCheck = await this.prisma.cliente.findFirst({
      where: { id: clienteId, tenantId },
      select: { suspended: true },
    })
    if (!clienteCheck) {
      return { ok: false, status: 400, error: 'clienteId is not valid for this tenant' }
    }
    if (clienteCheck.suspended) {
      return { ok: false, status: 422, error: 'CLIENT_SUSPENDED' }
    }

    const [newFactura, updatedCliente] = await this.prisma.$transaction(async (tx) => {
      const created = await tx.factura.create({
        data: {
          ...factura,
          fecha: facturaFechaToPrismaDate(fecha),
          tenantId,
          items: { create: items },
        } as Parameters<typeof this.prisma.factura.create>[0]['data'],
        include: { items: true, cliente: true },
      })

      const updated = await tx.cliente.update({
        where: { id: clienteId },
        data: { balance: { increment: created.total } },
        select: { id: true, rsocial: true, balance: true, creditLimit: true },
      })

      for (const [articuloId, qty] of qtyByArticulo) {
        await tx.articulo.update({
          where: { id: articuloId },
          data: { stock: { decrement: qty } },
        })
      }

      return [created, updated] as const
    })

    void this.afip.requestCaeForFactura(tenantId, newFactura.id).catch(() => {
      /* retry: npm run afip:retry-pending */
    })

    return {
      ok: true,
      data: {
        factura: newFactura,
        updatedCliente,
        stockBelowMinimum: stockEval.alerts,
      },
    }
  }

  async void(tenantId: number, id: number): Promise<ServiceResult<Factura>> {
    const factura = await this.prisma.factura.findFirst({
      where: { id, tenantId },
      select: { id: true, estado: true, total: true, clienteId: true },
    })

    if (!factura) {
      return { ok: false, status: 404, error: 'Factura not found' }
    }

    if (factura.estado === 'N') {
      return { ok: false, status: 409, error: 'Factura already voided' }
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const voided = await tx.factura.update({
        where: { id },
        data: { estado: 'N' },
      })
      await tx.cliente.update({
        where: { id: factura.clienteId },
        data: { balance: { decrement: factura.total } },
      })
      return voided
    })

    return { ok: true, data: updated }
  }
}
