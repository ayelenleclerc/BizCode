import type { ComprobanteCompra, Prisma, PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { NotFoundAppError } from '../errors/AppError'
import type { ReciboPagoInput } from '../createApp.types'
import { facturaFechaToPrismaDate } from '../routes/restDomainShared'
import type { ServiceResult } from './serviceResults'
import { ProveedorCuentaCorrienteService } from './ProveedorCuentaCorrienteService'

type ReciboPagoWithRelations = Prisma.ReciboPagoGetPayload<{
  include: {
    facturas: true
    proveedor: { select: { id: true; codigo: true; rsocial: true; cuit: true } }
    usuario: { select: { id: true; username: true } }
  }
}>

export type ReciboPagoFacturaDto = {
  id: number
  comprobanteCompraId: number | null
  facturaRef: string
  monto: string
}

export type ReciboPagoDto = {
  id: number
  numero: number
  proveedorId: number
  fecha: string
  total: string
  metodoPago: string
  cbu: string | null
  referencia: string | null
  estado: string
  notas: string | null
  usuarioId: number
  proveedor: { id: number; codigo: number; rsocial: string; cuit: string | null }
  usuario: { id: number; username: string }
  facturas: ReciboPagoFacturaDto[]
  createdAt: string
}

export type ComprobantePendienteDto = {
  comprobanteCompraId: number
  facturaRef: string
  fecha: string
  total: string
  pagado: string
  pendiente: string
}

export type ReciboPagoPdfData = {
  recibo: ReciboPagoDto
  empresa: {
    nombre: string
    cuit: string
    domicilio: string | null
    logoUrl: string | null
  }
}

function decimalToMoneyString(value: Decimal | number): string {
  const n = typeof value === 'number' ? value : value.toNumber()
  return n.toFixed(2)
}

function formatComprobanteRef(comprobante: Pick<ComprobanteCompra, 'tipo' | 'prefijo' | 'numero'>): string {
  return `${comprobante.tipo}-${comprobante.prefijo}-${comprobante.numero}`
}

function mapRecibo(row: ReciboPagoWithRelations): ReciboPagoDto {
  return {
    id: row.id,
    numero: row.numero,
    proveedorId: row.proveedorId,
    fecha: row.fecha.toISOString(),
    total: decimalToMoneyString(row.total),
    metodoPago: row.metodoPago,
    cbu: row.cbu,
    referencia: row.referencia,
    estado: row.estado,
    notas: row.notas,
    usuarioId: row.usuarioId,
    proveedor: row.proveedor,
    usuario: row.usuario,
    facturas: row.facturas.map((f) => ({
      id: f.id,
      comprobanteCompraId: f.comprobanteCompraId,
      facturaRef: f.facturaRef,
      monto: decimalToMoneyString(f.monto),
    })),
    createdAt: row.createdAt.toISOString(),
  }
}

const reciboInclude = {
  facturas: true,
  proveedor: { select: { id: true, codigo: true, rsocial: true, cuit: true } },
  usuario: { select: { id: true, username: true } },
} as const

/**
 * @en Supplier payment receipt operations (#271).
 * @es Operaciones de recibo de pago a proveedor (#271).
 * @pt-BR Operações de recibo de pagamento a fornecedor (#271).
 */
export class ReciboPagoService {
  constructor(private readonly prisma: PrismaClient) {}

  private async assertProveedor(tenantId: number, proveedorId: number): Promise<void> {
    const p = await this.prisma.proveedor.findFirst({
      where: { id: proveedorId, tenantId },
      select: { id: true },
    })
    if (!p) throw new NotFoundAppError('Proveedor not found')
  }

  async list(
    tenantId: number,
    proveedorId: number,
    take: number,
    skip: number,
  ): Promise<{ total: number; recibos: ReciboPagoDto[] }> {
    await this.assertProveedor(tenantId, proveedorId)
    const where = { tenantId, proveedorId }
    const [total, rows] = await Promise.all([
      this.prisma.reciboPago.count({ where }),
      this.prisma.reciboPago.findMany({
        where,
        include: reciboInclude,
        orderBy: [{ fecha: 'desc' }, { numero: 'desc' }],
        take,
        skip,
      }),
    ])
    return { total, recibos: rows.map(mapRecibo) }
  }

  async getById(tenantId: number, proveedorId: number, reciboId: number): Promise<ReciboPagoDto | null> {
    const row = await this.prisma.reciboPago.findFirst({
      where: { id: reciboId, tenantId, proveedorId },
      include: reciboInclude,
    })
    return row ? mapRecibo(row) : null
  }

  async listComprobantesPendientes(
    tenantId: number,
    proveedorId: number,
  ): Promise<ComprobantePendienteDto[]> {
    await this.assertProveedor(tenantId, proveedorId)
    const comprobantes = await this.prisma.comprobanteCompra.findMany({
      where: { tenantId, proveedorId, estado: 'A' },
      orderBy: { fecha: 'asc' },
    })
    if (comprobantes.length === 0) return []

    const ids = comprobantes.map((c) => c.id)
    const allocations = await this.prisma.reciboPagoFactura.groupBy({
      by: ['comprobanteCompraId'],
      where: {
        comprobanteCompraId: { in: ids },
        reciboPago: { tenantId, proveedorId, estado: 'emitido' },
      },
      _sum: { monto: true },
    })
    const paidMap = new Map<number, Decimal>()
    for (const row of allocations) {
      if (row.comprobanteCompraId != null && row._sum.monto != null) {
        paidMap.set(row.comprobanteCompraId, row._sum.monto)
      }
    }

    const result: ComprobantePendienteDto[] = []
    for (const c of comprobantes) {
      const pagado = paidMap.get(c.id) ?? new Decimal(0)
      const pendiente = c.total.minus(pagado)
      if (pendiente.lessThanOrEqualTo(0)) continue
      result.push({
        comprobanteCompraId: c.id,
        facturaRef: formatComprobanteRef(c),
        fecha: c.fecha.toISOString(),
        total: decimalToMoneyString(c.total),
        pagado: decimalToMoneyString(pagado),
        pendiente: decimalToMoneyString(pendiente),
      })
    }
    return result
  }

  async create(
    tenantId: number,
    proveedorId: number,
    usuarioId: number,
    input: ReciboPagoInput,
  ): Promise<ServiceResult<ReciboPagoDto>> {
    await this.assertProveedor(tenantId, proveedorId)

    if (input.facturas.length === 0) {
      return { ok: false, status: 400, error: 'At least one invoice allocation is required' }
    }

    const linesTotal = input.facturas.reduce((sum, line) => sum + line.monto, 0)
    if (Math.abs(linesTotal - input.total) > 0.009) {
      return { ok: false, status: 400, error: 'total must equal sum of facturas allocations' }
    }

    const comprobanteIds = input.facturas
      .map((f) => f.comprobanteCompraId)
      .filter((id): id is number => id != null)

    const comprobantes =
      comprobanteIds.length > 0
        ? await this.prisma.comprobanteCompra.findMany({
            where: { tenantId, proveedorId, id: { in: comprobanteIds }, estado: 'A' },
          })
        : []
    const comprobanteById = new Map(comprobantes.map((c) => [c.id, c]))

    for (const line of input.facturas) {
      if (line.monto <= 0) {
        return { ok: false, status: 400, error: 'Each allocation monto must be positive' }
      }
      if (line.comprobanteCompraId != null) {
        const cc = comprobanteById.get(line.comprobanteCompraId)
        if (!cc) {
          return { ok: false, status: 400, error: `comprobanteCompraId ${line.comprobanteCompraId} is invalid` }
        }
        const expectedRef = formatComprobanteRef(cc)
        if (line.facturaRef !== expectedRef) {
          return { ok: false, status: 400, error: `facturaRef must be ${expectedRef}` }
        }
        const pendientes = await this.listComprobantesPendientes(tenantId, proveedorId)
        const pend = pendientes.find((p) => p.comprobanteCompraId === line.comprobanteCompraId)
        if (pend && line.monto > Number.parseFloat(pend.pendiente) + 0.009) {
          return { ok: false, status: 400, error: `Allocation exceeds pending balance for ${line.facturaRef}` }
        }
      }
    }

    const fecha = facturaFechaToPrismaDate(input.fecha)
    const totalDec = new Decimal(input.total)

    const created = await this.prisma.$transaction(async (tx) => {
      const last = await tx.reciboPago.findFirst({
        where: { tenantId },
        orderBy: { numero: 'desc' },
        select: { numero: true },
      })
      const numero = (last?.numero ?? 0) + 1

      const recibo = await tx.reciboPago.create({
        data: {
          tenantId,
          numero,
          proveedorId,
          fecha,
          total: totalDec,
          metodoPago: input.metodoPago,
          cbu: input.cbu ?? null,
          referencia: input.referencia ?? null,
          notas: input.notas ?? null,
          usuarioId,
          facturas: {
            create: input.facturas.map((f) => ({
              comprobanteCompraId: f.comprobanteCompraId ?? null,
              facturaRef: f.facturaRef,
              monto: new Decimal(f.monto),
            })),
          },
        },
        include: reciboInclude,
      })

      const ccService = new ProveedorCuentaCorrienteService(tx)
      await ccService.recordMovimiento({
        tenantId,
        proveedorId,
        tipo: 'pago',
        monto: totalDec.negated(),
        referencia: `RP-${numero}`,
        fecha,
        usuarioId,
        notas: input.notas ?? null,
        reciboPagoId: recibo.id,
      })

      return recibo
    })

    return { ok: true, data: mapRecibo(created) }
  }

  async voidRecibo(
    tenantId: number,
    proveedorId: number,
    reciboId: number,
    usuarioId: number,
  ): Promise<ServiceResult<ReciboPagoDto>> {
    const existing = await this.prisma.reciboPago.findFirst({
      where: { id: reciboId, tenantId, proveedorId },
      include: reciboInclude,
    })
    if (!existing) {
      return { ok: false, status: 404, error: 'Recibo not found' }
    }
    if (existing.estado !== 'emitido') {
      return { ok: false, status: 422, error: 'Recibo is already voided' }
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const recibo = await tx.reciboPago.update({
        where: { id: reciboId },
        data: { estado: 'anulado' },
        include: reciboInclude,
      })

      const ccService = new ProveedorCuentaCorrienteService(tx)
      await ccService.recordMovimiento({
        tenantId,
        proveedorId,
        tipo: 'pago',
        monto: existing.total,
        referencia: `ANUL-RP-${existing.numero}`,
        fecha: new Date(),
        usuarioId,
        notas: `Anulación recibo de pago #${existing.numero}`,
      })

      return recibo
    })

    return { ok: true, data: mapRecibo(updated) }
  }

  async getPdfData(
    tenantId: number,
    proveedorId: number,
    reciboId: number,
  ): Promise<ReciboPagoPdfData | null> {
    const recibo = await this.getById(tenantId, proveedorId, reciboId)
    if (!recibo) return null

    const empresa = await this.prisma.paramEmpresa.findFirst({
      where: { tenantId },
      select: { nombre: true, cuit: true, domicilio: true, logoUrl: true },
    })

    return {
      recibo,
      empresa: {
        nombre: empresa?.nombre ?? 'Empresa',
        cuit: empresa?.cuit ?? '',
        domicilio: empresa?.domicilio ?? null,
        logoUrl: empresa?.logoUrl ?? null,
      },
    }
  }
}

export function reciboPagoPdfFilename(numero: number): string {
  return `recibo-pago-${numero}.pdf`
}
