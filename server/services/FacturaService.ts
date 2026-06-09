import type { Cliente, Factura, NotaCredito, Prisma, PrismaClient } from '@prisma/client'
import type { FacturaInput } from '../createApp.types'
import { assertNoOpenRecuento } from '../lib/recuentoStockGuard'
import { facturaFechaToPrismaDate } from '../routes/restDomainShared'
import type { ServiceResult } from './serviceResults'
import {
  aggregateItemQuantities,
  evaluateStockForInvoice,
  type StockBelowMinimumAlert,
} from './facturaStock'
import { ArcaService } from '../fiscal/ar/ArcaService'

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
export type FacturaVoidAuditContext = {
  userId: number | null
  ipAddress: string | null
}

export type FacturaVoidResult = {
  factura: Factura
  notaCredito: NotaCredito
  updatedCliente: Pick<Cliente, 'id' | 'rsocial' | 'balance' | 'creditLimit'>
}
/**
 * @en Invoice domain operations (list, create, void).
 * @es Operaciones de dominio de facturas (listado, alta, anulaciÃ³n).
 * @pt-BR OperaÃ§Ãµes de domÃ­nio de faturas (listagem, criaÃ§Ã£o, anulaÃ§Ã£o).
 */
export class FacturaService {
  private readonly arca: ArcaService

  constructor(private readonly prisma: PrismaClient) {
    this.arca = new ArcaService(prisma)
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

    const recuentoBlock = await assertNoOpenRecuento(this.prisma, tenantId)
    if (!recuentoBlock.ok) {
      return recuentoBlock
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

    void this.arca.requestCaeForFactura(tenantId, newFactura.id).catch(() => {
      /* retry: npm run arca:retry-pending */
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

  /**
   * @en Voids an active invoice, creates a credit note, reverses balance, and records audit in one transaction.
   * @es Anula factura vigente, crea nota de crédito, revierte saldo y audita en una transacción.
   * @pt-BR Anula fatura ativa, cria nota de crédito, reverte saldo e audita em uma transação.
   */
  async void(
    tenantId: number,
    id: number,
    motivo: string,
    audit: FacturaVoidAuditContext,
  ): Promise<ServiceResult<FacturaVoidResult>> {
    const factura = await this.prisma.factura.findFirst({
      where: { id, tenantId },
      select: {
        id: true,
        estado: true,
        total: true,
        clienteId: true,
        estadoCae: true,
        tipo: true,
      },
    })

    if (!factura) {
      return { ok: false, status: 404, error: 'Factura not found' }
    }

    if (factura.estado !== 'A') {
      return { ok: false, status: 409, error: 'Factura already voided' }
    }

    const notaCreditoEstadoCae = factura.estadoCae === 'issued' ? 'pending' : 'not_required'

    const result = await this.prisma.$transaction(async (tx) => {
      const voided = await tx.factura.update({
        where: { id },
        data: { estado: 'N' },
      })

      const updatedCliente = await tx.cliente.update({
        where: { id: factura.clienteId },
        data: { balance: { decrement: factura.total } },
        select: { id: true, rsocial: true, balance: true, creditLimit: true },
      })

      const notaCredito = await tx.notaCredito.create({
        data: {
          tenantId,
          facturaOrigenId: id,
          motivo,
          monto: factura.total,
          estadoCae: notaCreditoEstadoCae,
          createdById: audit.userId,
        },
      })

      await tx.auditEvent.create({
        data: {
          tenantId,
          userId: audit.userId,
          action: 'factura_void',
          resource: 'factura',
          resourceId: String(id),
          ipAddress: audit.ipAddress,
          metadata: { motivo, notaCreditoId: notaCredito.id },
        },
      })

      return { factura: voided, notaCredito, updatedCliente }
    })

    if (factura.estadoCae === 'issued') {
      void this.arca.requestCaeForNotaCredito(tenantId, result.notaCredito.id).catch(() => {
        /* homologación mock; retry job may be added later */
      })
    }

    return { ok: true, data: result }
  }
}
