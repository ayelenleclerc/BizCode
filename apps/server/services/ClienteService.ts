import { Prisma, type Cliente, type PrismaClient } from '@prisma/client'
import type { ClienteInput } from '@bizcode/types'
import type { ServiceResult } from './serviceResults'

export type ClienteListResult = {
  total: number
  clientes: Cliente[]
}

/**
 * @en Customer domain operations (list, read, create, update).
 * @es Operaciones de dominio de clientes (listado, lectura, alta, actualización).
 * @pt-BR Operações de domínio de clientes (listagem, leitura, criação, atualização).
 */
export class ClienteService {
  constructor(private readonly prisma: PrismaClient) {}

  async list(tenantId: number, filtro: string, take: number, skip: number): Promise<ClienteListResult> {
    const where = {
      tenantId,
      OR: [
        { rsocial: { contains: filtro, mode: Prisma.QueryMode.insensitive } },
        { cuit: { contains: filtro, mode: Prisma.QueryMode.insensitive } },
        { codigo: { equals: filtro ? parseInt(filtro, 10) : undefined } },
      ],
    }
    const [total, clientes] = await Promise.all([
      this.prisma.cliente.count({ where }),
      this.prisma.cliente.findMany({
        where,
        orderBy: { codigo: 'asc' },
        take,
        skip,
      }),
    ])
    return { total, clientes }
  }

  async getById(tenantId: number, id: number): Promise<Cliente | null> {
    return this.prisma.cliente.findFirst({
      where: { id, tenantId },
    })
  }

  async create(tenantId: number, body: ClienteInput): Promise<ServiceResult<Cliente>> {
    const zoneCheck = await this.validateDeliveryZone(tenantId, body.deliveryZoneId)
    if (!zoneCheck.ok) {
      return zoneCheck
    }
    const cliente = await this.prisma.cliente.create({
      data: { ...body, tenantId },
    })
    return { ok: true, data: cliente }
  }

  async update(
    tenantId: number,
    id: number,
    body: ClienteInput,
    canManageFinancials: boolean,
  ): Promise<ServiceResult<Cliente>> {
    const { creditLimit, creditDays, suspended, ...baseBody } = body
    const data = canManageFinancials ? { ...baseBody, creditLimit, creditDays, suspended } : baseBody

    const zoneCheck = await this.validateDeliveryZone(tenantId, data.deliveryZoneId)
    if (!zoneCheck.ok) {
      return zoneCheck
    }

    const existingCliente = await this.prisma.cliente.findFirst({ where: { id, tenantId } })
    if (!existingCliente) {
      return { ok: false, status: 404, error: 'Cliente not found' }
    }

    const cliente = await this.prisma.cliente.update({
      where: { id },
      data,
    })
    return { ok: true, data: cliente }
  }

  private async validateDeliveryZone(
    tenantId: number,
    deliveryZoneId: number | null | undefined,
  ): Promise<ServiceResult<null>> {
    if (deliveryZoneId == null) {
      return { ok: true, data: null }
    }
    const zone = await this.prisma.deliveryZone.findFirst({
      where: { id: deliveryZoneId, tenantId },
    })
    if (!zone) {
      return { ok: false, status: 400, error: 'deliveryZoneId does not belong to this tenant' }
    }
    return { ok: true, data: null }
  }
}
