import type { ComprobanteCompra, Prisma, PrismaClient } from '@prisma/client'
import { ConflictAppError, NotFoundAppError, ValidationAppError } from '../errors/AppError'

export type ComprobanteCompraCreateInput = {
  fecha: string
  tipo: string
  prefijo: string
  numero: number
  proveedorId: number
  ordenCompraId?: number
  neto1: number
  neto2: number
  neto3: number
  iva1: number
  iva2: number
  total: number
  cae?: string
  caeVto?: string
}

/**
 * @en Persists supplier fiscal purchase vouchers (#306).
 * @es Persiste comprobantes fiscales de compra de proveedor (#306).
 * @pt-BR Persiste comprovantes fiscais de compra de fornecedor (#306).
 */
export class ComprobanteCompraService {
  constructor(private readonly prisma: PrismaClient) {}

  async create(tenantId: number, input: ComprobanteCompraCreateInput): Promise<ComprobanteCompra> {
    const fecha = new Date(input.fecha)
    if (Number.isNaN(fecha.getTime())) {
      throw new ValidationAppError('Invalid fecha')
    }

    const proveedor = await this.prisma.proveedor.findFirst({
      where: { id: input.proveedorId, tenantId },
    })
    if (!proveedor) {
      throw new NotFoundAppError('Proveedor not found')
    }

    if (input.ordenCompraId != null) {
      const orden = await this.prisma.ordenCompra.findFirst({
        where: { id: input.ordenCompraId, tenantId },
      })
      if (!orden) {
        throw new NotFoundAppError('OrdenCompra not found')
      }
    }

    const data: Prisma.ComprobanteCompraCreateInput = {
      tenant: { connect: { id: tenantId } },
      proveedor: { connect: { id: input.proveedorId } },
      fecha,
      tipo: input.tipo,
      prefijo: input.prefijo,
      numero: input.numero,
      neto1: input.neto1,
      neto2: input.neto2,
      neto3: input.neto3,
      iva1: input.iva1,
      iva2: input.iva2,
      total: input.total,
      cae: input.cae ?? null,
      caeVto: input.caeVto ? new Date(input.caeVto) : null,
      ...(input.ordenCompraId != null
        ? { ordenCompra: { connect: { id: input.ordenCompraId } } }
        : {}),
    }

    try {
      return await this.prisma.comprobanteCompra.create({ data })
    } catch (err: unknown) {
      if (
        err &&
        typeof err === 'object' &&
        'code' in err &&
        (err as { code: string }).code === 'P2002'
      ) {
        throw new ConflictAppError('Comprobante compra already exists for tipo/prefijo/numero')
      }
      throw err
    }
  }

  async listByPeriod(
    tenantId: number,
    from: Date,
    to: Date,
  ): Promise<ComprobanteCompra[]> {
    return this.prisma.comprobanteCompra.findMany({
      where: {
        tenantId,
        estado: 'A',
        fecha: { gte: from, lte: to },
      },
      orderBy: [{ fecha: 'asc' }, { id: 'asc' }],
    })
  }
}
