import type { PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import type {
  ComisionRankingRow,
  LiquidacionComisionDetalleRow,
  LiquidacionComisionEstado,
  LiquidacionComisionRow,
  MisComisionesResponse,
} from '@bizcode/types'
import type { ServiceResult } from './serviceResults'
import { ComisionCalcService } from './ComisionCalcService'

function dec(value: Decimal | number | string): number {
  return Number(value)
}

function mapDetalle(row: {
  id: number
  liquidacionId: number
  facturaId: number | null
  reciboCobroId: number | null
  imputacionId: number | null
  montoBase: Decimal
  alicuota: Decimal
  comision: Decimal
  concepto: string
}): LiquidacionComisionDetalleRow {
  return {
    id: row.id,
    liquidacionId: row.liquidacionId,
    facturaId: row.facturaId,
    reciboCobroId: row.reciboCobroId,
    imputacionId: row.imputacionId,
    montoBase: dec(row.montoBase),
    alicuota: dec(row.alicuota),
    comision: dec(row.comision),
    concepto: row.concepto,
  }
}

function mapLiquidacion(row: {
  id: number
  tenantId: number
  vendedorId: number
  periodo: string
  totalVentas: Decimal
  totalComision: Decimal
  estado: string
  aprobadoPorId: number | null
  pagadoEn: Date | null
  createdAt: Date
  updatedAt: Date
  vendedor?: { username: string } | null
  detalle?: Array<{
    id: number
    liquidacionId: number
    facturaId: number | null
    reciboCobroId: number | null
    imputacionId: number | null
    montoBase: Decimal
    alicuota: Decimal
    comision: Decimal
    concepto: string
  }>
}): LiquidacionComisionRow {
  return {
    id: row.id,
    tenantId: row.tenantId,
    vendedorId: row.vendedorId,
    periodo: row.periodo,
    totalVentas: dec(row.totalVentas),
    totalComision: dec(row.totalComision),
    estado: row.estado as LiquidacionComisionEstado,
    aprobadoPorId: row.aprobadoPorId,
    pagadoEn: row.pagadoEn?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    vendedorUsername: row.vendedor?.username,
    detalle: row.detalle?.map(mapDetalle),
  }
}

/**
 * @en Monthly commission settlements: generate, approve, pay, ranking, self view (#237).
 * @es Liquidaciones mensuales: generar, aprobar, pagar, ranking, vista propia (#237).
 * @pt-BR Liquidações mensais: gerar, aprovar, pagar, ranking, visão própria (#237).
 */
export class LiquidacionComisionService {
  private readonly calc: ComisionCalcService

  constructor(private readonly prisma: PrismaClient) {
    this.calc = new ComisionCalcService(prisma)
  }

  async list(
    tenantId: number,
    take: number,
    skip: number,
    filters?: { periodo?: string | null; vendedorId?: number | null; estado?: string | null },
  ): Promise<{ total: number; rows: LiquidacionComisionRow[] }> {
    const where = {
      tenantId,
      ...(filters?.periodo ? { periodo: filters.periodo } : {}),
      ...(filters?.vendedorId != null ? { vendedorId: filters.vendedorId } : {}),
      ...(filters?.estado ? { estado: filters.estado } : {}),
    }
    const [total, rows] = await Promise.all([
      this.prisma.liquidacionComision.count({ where }),
      this.prisma.liquidacionComision.findMany({
        where,
        include: { vendedor: { select: { username: true } } },
        orderBy: [{ periodo: 'desc' }, { vendedorId: 'asc' }],
        take,
        skip,
      }),
    ])
    return { total, rows: rows.map(mapLiquidacion) }
  }

  async getById(tenantId: number, id: number): Promise<ServiceResult<LiquidacionComisionRow>> {
    const row = await this.prisma.liquidacionComision.findFirst({
      where: { id, tenantId },
      include: {
        vendedor: { select: { username: true } },
        detalle: true,
      },
    })
    if (!row) return { ok: false, status: 404, error: 'Liquidacion not found' }
    return { ok: true, data: mapLiquidacion(row) }
  }

  async generate(
    tenantId: number,
    periodo: string,
    vendedorId?: number,
  ): Promise<ServiceResult<{ created: LiquidacionComisionRow[]; skipped: number }>> {
    if (!/^\d{4}-\d{2}$/.test(periodo)) {
      return { ok: false, status: 400, error: 'INVALID_PERIODO' }
    }

    const vendedores = vendedorId
      ? await this.prisma.appUser.findMany({
          where: { tenantId, id: vendedorId, active: true },
          select: { id: true },
        })
      : await this.prisma.appUser.findMany({
          where: {
            tenantId,
            active: true,
            OR: [
              { role: 'seller' },
              { configsComision: { some: {} } },
              { pedidosVendedor: { some: {} } },
            ],
          },
          select: { id: true },
        })

    const created: LiquidacionComisionRow[] = []
    let skipped = 0

    for (const v of vendedores) {
      const existing = await this.prisma.liquidacionComision.findUnique({
        where: {
          tenantId_vendedorId_periodo: {
            tenantId,
            vendedorId: v.id,
            periodo,
          },
        },
      })
      if (existing && existing.estado !== 'borrador') {
        skipped += 1
        continue
      }

      const calc = await this.calc.calculateForVendedor(tenantId, v.id, periodo)
      const row = await this.prisma.$transaction(async (tx) => {
        if (existing) {
          await tx.liquidacionComisionDetalle.deleteMany({ where: { liquidacionId: existing.id } })
          await tx.liquidacionComision.update({
            where: { id: existing.id },
            data: {
              totalVentas: calc.totalVentas,
              totalComision: calc.totalComision,
              estado: 'borrador',
              aprobadoPorId: null,
              pagadoEn: null,
            },
          })
          if (calc.lineas.length > 0) {
            await tx.liquidacionComisionDetalle.createMany({
              data: calc.lineas.map((l) => ({
                liquidacionId: existing.id,
                facturaId: l.facturaId,
                reciboCobroId: l.reciboCobroId,
                imputacionId: l.imputacionId,
                montoBase: l.montoBase,
                alicuota: l.alicuota,
                comision: l.comision,
                concepto: l.concepto,
              })),
            })
          }
          return tx.liquidacionComision.findFirstOrThrow({
            where: { id: existing.id },
            include: { vendedor: { select: { username: true } }, detalle: true },
          })
        }

        return tx.liquidacionComision.create({
          data: {
            tenantId,
            vendedorId: v.id,
            periodo,
            totalVentas: calc.totalVentas,
            totalComision: calc.totalComision,
            estado: 'borrador',
            detalle: {
              create: calc.lineas.map((l) => ({
                facturaId: l.facturaId,
                reciboCobroId: l.reciboCobroId,
                imputacionId: l.imputacionId,
                montoBase: l.montoBase,
                alicuota: l.alicuota,
                comision: l.comision,
                concepto: l.concepto,
              })),
            },
          },
          include: { vendedor: { select: { username: true } }, detalle: true },
        })
      })
      created.push(mapLiquidacion(row))
    }

    return { ok: true, data: { created, skipped } }
  }

  async approve(
    tenantId: number,
    id: number,
    aprobadoPorId: number,
  ): Promise<ServiceResult<LiquidacionComisionRow>> {
    const existing = await this.prisma.liquidacionComision.findFirst({ where: { id, tenantId } })
    if (!existing) return { ok: false, status: 404, error: 'Liquidacion not found' }
    if (existing.estado !== 'borrador') {
      return { ok: false, status: 422, error: 'LIQUIDACION_NOT_BORRADOR' }
    }
    const row = await this.prisma.liquidacionComision.update({
      where: { id },
      data: { estado: 'aprobada', aprobadoPorId },
      include: { vendedor: { select: { username: true } }, detalle: true },
    })
    return { ok: true, data: mapLiquidacion(row) }
  }

  async markPaid(tenantId: number, id: number): Promise<ServiceResult<LiquidacionComisionRow>> {
    const existing = await this.prisma.liquidacionComision.findFirst({ where: { id, tenantId } })
    if (!existing) return { ok: false, status: 404, error: 'Liquidacion not found' }
    if (existing.estado !== 'aprobada') {
      return { ok: false, status: 422, error: 'LIQUIDACION_NOT_APROBADA' }
    }
    const row = await this.prisma.liquidacionComision.update({
      where: { id },
      data: { estado: 'pagada', pagadoEn: new Date() },
      include: { vendedor: { select: { username: true } }, detalle: true },
    })
    return { ok: true, data: mapLiquidacion(row) }
  }

  async ranking(tenantId: number, periodo: string): Promise<ComisionRankingRow[]> {
    const rows = await this.prisma.liquidacionComision.findMany({
      where: { tenantId, periodo },
      include: { vendedor: { select: { username: true } } },
      orderBy: { totalComision: 'desc' },
    })
    return rows.map((r) => ({
      vendedorId: r.vendedorId,
      vendedorUsername: r.vendedor.username,
      totalVentas: dec(r.totalVentas),
      totalComision: dec(r.totalComision),
      liquidacionId: r.id,
      estado: r.estado as LiquidacionComisionEstado,
    }))
  }

  async misComisiones(
    tenantId: number,
    vendedorId: number,
    periodo: string,
  ): Promise<MisComisionesResponse> {
    const estimacion = await this.calc.calculateForVendedor(tenantId, vendedorId, periodo)
    const liquidaciones = await this.prisma.liquidacionComision.findMany({
      where: { tenantId, vendedorId },
      include: { vendedor: { select: { username: true } } },
      orderBy: { periodo: 'desc' },
      take: 24,
    })
    return {
      success: true,
      periodo,
      estimacion: {
        totalVentas: estimacion.totalVentas,
        totalComision: estimacion.totalComision,
        lineas: estimacion.lineas.map((l) => ({
          concepto: l.concepto,
          montoBase: l.montoBase,
          alicuota: l.alicuota,
          comision: l.comision,
          facturaId: l.facturaId,
        })),
      },
      liquidaciones: liquidaciones.map(mapLiquidacion),
    }
  }

  async exportCsv(tenantId: number, id: number): Promise<ServiceResult<string>> {
    const result = await this.getById(tenantId, id)
    if (!result.ok) return result
    if (result.data.estado === 'borrador') {
      return { ok: false, status: 422, error: 'LIQUIDACION_STILL_BORRADOR' }
    }
    const lines = [
      'periodo,vendedorId,vendedorUsername,facturaId,reciboCobroId,montoBase,alicuota,comision,concepto,estado',
    ]
    for (const d of result.data.detalle ?? []) {
      lines.push(
        [
          result.data.periodo,
          result.data.vendedorId,
          JSON.stringify(result.data.vendedorUsername ?? ''),
          d.facturaId ?? '',
          d.reciboCobroId ?? '',
          d.montoBase,
          d.alicuota,
          d.comision,
          JSON.stringify(d.concepto),
          result.data.estado,
        ].join(','),
      )
    }
    return { ok: true, data: `${lines.join('\n')}\n` }
  }
}
